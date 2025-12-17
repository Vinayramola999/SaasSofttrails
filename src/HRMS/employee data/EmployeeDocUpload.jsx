import axios from "axios";
import * as React from "react";
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";

function DocUpload({ setActiveTab }) {
  const [services, setServices] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [allowDocs, setAllowDocs] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [map, setMap] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDocTypeId, setSelectedDocTypeId] = useState("");
  const [selectedAllowedId, setSelectedAllowedId] = useState("");
  const [queuedDocuments, setQueuedDocuments] = useState([]);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    axios
      .get("https://devapi.softtrails.net/hrms/test/mapping")
      .then((res) => setMap(res.data));
  }, []);

  useEffect(() => {
    axios
      .get("https://devapi.softtrails.net/hrms/test/dmsapi/upload")
      .then((res) => setServices(res.data));
  }, []);

  useEffect(() => {
    if (selectedServiceId) {
      axios
        .get(
          `https://devapi.softtrails.net/hrms/test/dmsapi/upload?service_id=${selectedServiceId}`
        )
        .then((res) => setDocTypes(res.data));
    } else {
      setDocTypes([]);
    }
    setSelectedDocTypeId("");
    setAllowDocs([]);
    setSelectedAllowedId("");
    setSelectedFormats([]);
  }, [selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId && selectedDocTypeId) {
      axios
        .get(
          `https://devapi.softtrails.net/hrms/test/dmsapi/upload?service_id=${selectedServiceId}&doctype_id=${selectedDocTypeId}`
        )
        .then((res) => setAllowDocs(res.data));
    } else {
      setAllowDocs([]);
    }
    setSelectedAllowedId("");
    setSelectedFormats([]);
  }, [selectedDocTypeId, selectedServiceId]);

  useEffect(() => {
    if (selectedServiceId && selectedDocTypeId && selectedAllowedId) {
      axios
        .get(
          `https://devapi.softtrails.net/hrms/test/dmsapi/upload?service_id=${selectedServiceId}&doctype_id=${selectedDocTypeId}&allow_doc_id=${selectedAllowedId}`
        )
        .then((res) => {
          const formats = res.data.flatMap((item) => item.format || []);
          setSelectedFormats(formats);
        });
    } else {
      setSelectedFormats([]);
    }
  }, [selectedAllowedId, selectedDocTypeId, selectedServiceId]);

  const onDrop = React.useCallback(
    (acceptedFiles) => {
      if (!selectedServiceId || !selectedDocTypeId || !selectedAllowedId) {
        Swal.fire("Please select all fields before uploading.");
        return;
      }

      const found = Array.isArray(map)
        ? map.find(
            (item) =>
              item.service_id === Number(selectedServiceId) &&
              item.doctype_id === Number(selectedDocTypeId) &&
              item.allow_doc_id === Number(selectedAllowedId)
          )
        : null;

      if (!found) {
        Swal.fire("Mapping not found. Cannot validate file size.");
        return;
      }

      const allowedSizeMB = found.allowed_size;
      const maxSizeBytes = allowedSizeMB * 1024 * 1024;

      acceptedFiles.forEach((file) => {
        if (file.size > maxSizeBytes) {
          Swal.fire(`File size exceeds allowed limit of ${allowedSizeMB} MB.`);
          return;
        }
        if (
          selectedFormats.length > 0 &&
          !selectedFormats.some((fmt) =>
            file.name.toLowerCase().endsWith(fmt.toLowerCase())
          )
        ) {
          Swal.fire(
            `File format not allowed. Allowed: ${selectedFormats.join(", ")}`
          );
          return;
        }

        const selectedService = services.find(
          (s) => s.service_id === Number(selectedServiceId)
        );
        const selectedDocType = docTypes.find(
          (d) => d.doctype_id === Number(selectedDocTypeId)
        );
        const selectedAllowed = allowDocs.find(
          (a) => a.allow_doc_id === Number(selectedAllowedId)
        );

        const newDoc = {
          service: selectedService?.name || "",
          doctype: selectedDocType?.doctype || "",
          allowedDoc: selectedAllowed?.doc_name || "",
          file,
          metadata: {
            service: selectedService?.name || "",
            publish_id: found.id,
            user_id: sessionStorage.getItem("userId"),
            document_name: file.name,
          },
        };
        setQueuedDocuments((prev) => [...prev, newDoc]);
      });
    },
    [
      selectedServiceId,
      selectedDocTypeId,
      selectedAllowedId,
      selectedFormats,
      map,
      services,
      docTypes,
      allowDocs,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      selectedFormats.length > 0
        ? selectedFormats.map((f) => `.${f.toLowerCase()}`).join(",")
        : undefined,
    maxSize: map.find(
      (item) =>
        item.service_id === Number(selectedServiceId) &&
        item.doctype_id === Number(selectedDocTypeId) &&
        item.allow_doc_id === Number(selectedAllowedId)
    )?.allowed_size
      ? map.find(
          (item) =>
            item.service_id === Number(selectedServiceId) &&
            item.doctype_id === Number(selectedDocTypeId) &&
            item.allow_doc_id === Number(selectedAllowedId)
        ).allowed_size *
        1024 *
        1024
      : 50 * 1024 * 1024,
    disabled: !(selectedServiceId && selectedDocTypeId && selectedAllowedId),
  });

  const removeFile = (index) => {
    setQueuedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!queuedDocuments.length) {
      Swal.fire("Queue is empty.");
      return;
    }
    const formData = new FormData();
    queuedDocuments.forEach((doc) => {
      formData.append("documents", doc.file);
    });
    formData.append("ref", "DMS");
    const metadata = queuedDocuments.map((doc) => doc.metadata);
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("custom_folder", folderName || "Default");

    try {
      await axios.post(
        "https://devapi.softtrails.net/saas/dms/test/dmsapi/upload-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Swal.fire("Documents uploaded successfully!");
      setQueuedDocuments([]);
      setFolderName("");
    } catch (err) {
      Swal.fire("Failed to upload documents.");
    }
  };

  return (
    <div className="flex flex-col rounded-none w-full">
      <div className="flex flex-col pt-4 pb-px w-full rounded-lg border border-solid bg-zinc-100 border-zinc-300 max-md:max-w-full">
        <div className="flex flex-col gap-3.5 self-start ml-4 font-medium max-md:ml-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className="text-blue-700 bg-white p-2 rounded-lg font-medium self-start mt-auto"
          >
            Back to Documents
          </button>
          <div className="flex items-start">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/631dc35c4e31414a81aeed53117e0f3d1b75b1bc88638665a18f947c9f168d9c?placeholderIfAbsent=true&apiKey=6d9238e97b8b4468a6816150e7ac8389"
              alt=""
              className="object-contain shrink-0 my-auto rounded-none aspect-square w-[26px]"
            />
            <div className="flex flex-col ml-3">
              <div className="self-start text-base text-black">
                Upload Documents
              </div>
              <div className="text-xs text-neutral-600">
                Select and upload the files of your choice
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col px-8 py-6 mt-5 w-full bg-white rounded-lg max-md:px-5 max-md:max-w-full"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-5 justify-between px-3 py-1.5 max-w-full text-xs bg-white rounded-lg border border-solid border-zinc-400 text-stone-500 w-[230px]">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-5 justify-between px-3 py-1.5 max-w-full text-xs bg-white rounded-lg border border-solid border-zinc-400 text-stone-500 w-[230px]">
              <select
                value={selectedDocTypeId}
                onChange={(e) => setSelectedDocTypeId(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              >
                <option value="">Select Document Type</option>
                {docTypes.map((type) => (
                  <option key={type.doctype_id} value={type.doctype_id}>
                    {type.doctype}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-5 justify-between px-3 py-1.5 max-w-full text-xs bg-white rounded-lg border border-solid border-zinc-400 text-stone-500 w-[230px]">
              <select
                value={selectedAllowedId}
                onChange={(e) => setSelectedAllowedId(e.target.value)}
                className="w-full bg-transparent border-none outline-none"
              >
                <option value="">Select Allowed Document</option>
                {allowDocs.map((doc) => (
                  <option key={doc.allow_doc_id} value={doc.allow_doc_id}>
                    {doc.doc_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-5 justify-between px-3 py-1.5 mt-4 max-w-2xl text-xs bg-white rounded-lg border border-solid border-zinc-400 text-stone-500 w-[230px]">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-transparent border-none outline-none"
              placeholder="Enter folder name"
            />
          </div>
          <div
            {...getRootProps()}
            className={`dropzone ${
              !(selectedServiceId && selectedDocTypeId && selectedAllowedId)
                ? "opacity-50 cursor-not-allowed"
                : ""
            } flex flex-col justify-center items-center px-20 py-8 mt-5 text-xs font-medium bg-white rounded-3xl  max-md:px-5 max-md:max-w-full`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col max-w-full w-[276px]">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d70348f7cd0c1bb0d28679a142a2b623d21584ac9e10279b245f1a9b1ff953b4?placeholderIfAbsent=true&apiKey=6d9238e97b8b4468a6816150e7ac8389"
                alt=""
                className="object-contain self-center aspect-square w-[50px]"
              />
              <div className="mt-3.5 text-base text-black">
                {isDragActive
                  ? "Drop files here"
                  : "Choose a file or drag & drop it here."}
              </div>
              <div className="mt-2 text-zinc-500">
                Allowed formats: {selectedFormats.join(", ") || "Any"}, Max
                size:{" "}
                {map.find(
                  (item) =>
                    item.service_id === Number(selectedServiceId) &&
                    item.doctype_id === Number(selectedDocTypeId) &&
                    item.allow_doc_id === Number(selectedAllowedId)
                )?.allowed_size || 50}{" "}
                MB.
              </div>
              <button
                type="button"
                className="self-center px-7 py-2.5 mt-6 max-w-full text-blue-700 rounded-lg bg-zinc-100 w-[129px]"
              >
                Browse File
              </button>
            </div>
          </div>
          {queuedDocuments.map((file, index) => (
            <div
              key={index}
              className="flex flex-wrap gap-5 justify-between items-start px-2.5 pt-2 pb-5 mt-5 w-full font-medium bg-white rounded-lg border border-solid border-zinc-300 max-md:max-w-full"
            >
              <div className="flex gap-4 items-start mt-3">
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/c590ee249ca2486afe5be42672ee58290c0280cf584124d34565f0611e86b91a?placeholderIfAbsent=true&apiKey=6d9238e97b8b4468a6816150e7ac8389"
                  alt=""
                  className="object-contain shrink-0 w-9 aspect-square"
                />
                <div className="flex flex-col">
                  <div className="text-base text-black">{file.file.name}</div>
                  <div className="text-xs text-neutral-500">
                    {Math.round(file.file.size / 1024)} KB
                  </div>
                  <div className="text-xs text-neutral-500">
                    Service: {file.service}, Type: {file.doctype}, Allowed:{" "}
                    {file.allowedDoc}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label="Remove file"
              >
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/de674b81710f2e47c159a539bdaaeedc589c0647cf37d6059fe0fa688e6e90e6?placeholderIfAbsent=true&apiKey=6d9238e97b8b4468a6816150e7ac8389"
                  alt=""
                  className="object-contain shrink-0 w-6 aspect-square"
                />
              </button>
            </div>
          ))}
          <div className="mt-5">
            <button
              type="submit"
              disabled={!queuedDocuments.length}
              className={`px-5 py-2.5 rounded-lg ${
                queuedDocuments.length
                  ? "bg-blue-600 text-white cursor-pointer"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              Upload Documents
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DocUpload;
