import { useState, useEffect, useRef } from "react";
import axios from "axios";
import API from "../config/api";
import { FaTrash } from "react-icons/fa";
import { FaUpload } from "react-icons/fa"; // Font Awesome Upload Icon
import Select from "react-select";
import PopupModal from "./PopupModal";
import DownloadTableButtons from "./components/Downloadpdfexcel";
import { FaFilePdf, FaRegFileAlt } from "react-icons/fa"; // <-- added FaRegFileAlt

const InventryIndenting = () => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [asset, setAsset] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestMaterialOpen, setIsRequestMaterialOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [showRFP, setShowRFP] = useState(false);
  const [rfpId, setRfpId] = useState(null);
  const [requestfor, setRequestfor] = useState("");
  const fileInputRef = useRef();
  const [selectedFileName, setSelectedFileName] = useState("");
  const userId = sessionStorage.getItem("userId");
  const [selectedLogoName, setSelectedLogoName] = useState("");
  const [selectedSpecFileName, setSelectedSpecFileName] = useState("");
  const [documentOptions, setDocumentOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Indent ID", accessor: "id" },
    { header: "Request for", accessor: "request_for" },
    { header: "Category", accessor: "category" },
    { header: "Request Material", accessor: "asset_name" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Approval Date", accessor: "approval_date" },
    { header: "Status", accessor: "status" },
  ];
  const [formData, setFormData] = useState({
    title: "",
    issuedDate: new Date().toISOString().split("T")[0], // <-- auto fetch current date
    dueDate: "",
    description: "",
    file: null,
    document_name: "",
    logo: null,
    logoUrl: "",
    requiredDocument: "",
    organization: "",
  });
  const resetForm = () => {
    setFormData({
      organization: "",
      logo: "",
      logoUrl: "",
      file: null,
      title: "",
      issuedDate: new Date().toISOString().split("T")[0], // <-- auto fetch current date
      dueDate: "",
      description: "",
      requiredDocument: "",
    });
    setSelectedLogoName(""); // if you're tracking selected file name
    setSelectedSpecFileName(""); // ✅ reset specification file name
  };

  const handleIconClick = () => {
    fileInputRef.current.click(); // triggers hidden input
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file, // file is the correct key in your state
        document_name: "", // clear previously uploaded name if any
      }));
      setSelectedSpecFileName(file.name); // use separate state
    }
  };

  useEffect(() => {
    if (showRFP) {
      setSelectedFileName("No file chosen");
      setFormData((prev) => ({ ...prev, logo: null }));
    }
  }, [showRFP]);

  const handleGenerate = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in session storage");
      const publish_id = await getDmsPublishId(
        "purchase",
        "RFP_SPECIFICATION",
        "RFP_SPECIFICATION"
      );
      // ✅ Validate form fields before upload
      if (
        !formData.title ||
        !formData.issuedDate ||
        !formData.dueDate ||
        !formData.file
        // !formData.description
      ) {
        setModalProps({
          type: "warning",
          title: "Missing Information",
          message:
            "Please fill in all required fields: Title, Dates, File, and Description.",
          onClose: () => setShowModal(false),
        });
        setShowModal(true);
        return; // stop execution
      }

      // === Upload Specification File ===
      const fileFormData = new FormData();
      fileFormData.append("documents", formData.file);
      fileFormData.append("ref", "RFP");
      fileFormData.append(
        "metadata",
        JSON.stringify([
          {
            service: "purchase",
            publish_id,
            user_id: userId,
            document_name: formData.file?.name || "document-file.pdf",
          },
        ])
      );
      fileFormData.append("custom_folder", "purchase");

      const fileUploadRes = await axios.post(
        API.DMS_UPLOAD ||
          "https://devapi.softtrails.net/saas/dms/test/dmsapi/upload-documents",
        fileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fileUrl = fileUploadRes.data?.uploaded_files?.[0]?.file_url;
      if (!fileUrl) throw new Error("Specification file upload failed");

      // === Prepare and send RFP update payload ===
      const rfpPayload = {
        user_id: userId,
        rfp_id: rfpId,
        Title: formData.title,
        rfp_start_date: formData.issuedDate,
        rfp_end_date: formData.dueDate,
        upload_file_link: fileUrl,
        required_doc: { documents: [formData.requiredDocument] },
        additional_description: {
          description: formData.description,
        },
      };

      const rfpResponse = await axios.put(
        `${API.PURCHASE_API}/rfps/update_rfp/${rfpId}`,
        rfpPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("RFP updated successfully:", rfpResponse.data);
      setModalProps({
        type: "success",
        title: "Success",
        message: "RFP generated successfully.",
        onClose: () => setShowModal(false),
      });
      setShowRFP(false);
      resetForm();
      fetchRequests(); // <-- Refresh table after RFP generated
    } catch (error) {
      console.error("Error generating RFP:", error);

      if (error.response?.data?.message === "RFP not found") {
        setModalProps({
          type: "warning",
          title: "RFP not found",
          message: "Please update the logo and organization name first.",
          onClose: () => setShowModal(false),
        });
      } else {
        setModalProps({
          type: "error",
          title: "Error",
          message:
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to generate RFP.",
          onClose: () => setShowModal(false),
        });
      }
    }
  };

  const fetchRequests = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [indentingRes, salesIndentingRes] = await Promise.all([
        axios.get(`${API.PURCHASE_API}/indenting`, { headers }),
        axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, { headers }),
      ]);

      // Check if data exists and is an array
      const indentingData = Array.isArray(indentingRes.data)
        ? indentingRes.data
        : [];

      const salesIndentingData = Array.isArray(salesIndentingRes.data)
        ? salesIndentingRes.data
        : [];

      salesIndentingData.forEach((item) => {
        item.id = item.indent_id; // 🔹 normalize field
      });

      const combinedData = [...indentingData, ...salesIndentingData];

      setRequests(combinedData);
    } catch (error) {
      console.error("API fetch error:", error?.response || error);
      setModalProps({
        type: "error",
        title: "Error!",
        message:
          "Failed to fetch indenting or sales indenting data. " +
          (error?.response?.message || error.message || ""),
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`${API.PURCHASE_API}/indenting/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((request) => request.id !== id));
      setModalProps({
        type: "success",
        title: "Deleted!",
        message: "The indent has been deleted.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error!",
        message: "Failed to delete the indent.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };
  const handleRequestMaterialClick = (item) => {
    setSelectedRequest(item);
    setIsRequestMaterialOpen(true);
    setIsEditOpen(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoUrl: "", // reset uploaded link
      }));
      setSelectedLogoName(file.name);
    }
  };

  //  const handleGenerateRFPClick = async (item = null) => {
  //    const indentingId = item?.id ?? selectedRequest?.id;

  //    if (!indentingId) {
  //      setModalProps({
  //        type: "error",
  //        title: "Error!",
  //        message: "Indenting ID not found.",
  //        onClose: () => setShowModal(false),
  //      });
  //      setShowModal(true);
  //      return;
  //    }

  //    try {
  //      let response;
  //      if (typeof indentingId === "string" && indentingId.startsWith("IND-")) {
  //        response = await axios.put(
  //          "https://devapi.softtrails.net/saas/purchase/test/purchase/sales/salesIndent",
  //          { ids: [indentingId] },
  //          { headers: { Authorization: `Bearer ${token}` } }
  //        );
  //        if (response.data?.rfp_id) setRfpId(response.data.rfp_id);
  //      } else {
  //        response = await axios.put(
  //          `https://devapi.softtrails.net/saas/purchase/test/purchase/indenting/${indentingId}/rfp`,
  //          {},
  //          { headers: { Authorization: `Bearer ${token}` } }
  //        );
  //        if (response.data?.RFP_ID) setRfpId(response.data.RFP_ID);
  //        else setRfpId(null);
  //        fetchDetails();
  //      }

  //      setShowRFP(true);
  //      fetchDetails();
  //    } catch (error) {
  //      console.error("Generate RFP error:", error);
  //      setModalProps({
  //        type: "error",
  //        title: "Error!",
  //        message:
  //          error.response?.data?.message ||
  //          error.response?.data?.error ||
  //          error.message ||
  //          "Failed to generate RFP. Please try again.",
  //        onClose: () => setShowModal(false),
  //      });
  //      setShowModal(true);
  //      fetchDetails();
  //    }
  //  };

  const handleGenerateRFPClick = async (item = null) => {
    const indentingId = item?.id ?? selectedRequest?.id;

    try {
      let response;
      // Check if indentingId is a string and starts with "IND-"
      if (typeof indentingId === "string" && indentingId.startsWith("CIN-")) {
        // Sales Indenting API
        response = await axios.put(
          `${API.PURCHASE_API}/sales/salesIndent`,
          { ids: [indentingId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Handle response as needed (e.g., setRfpId, etc.)
        if (response.data.rfp_id) {
          setRfpId(response.data.rfp_id);
        }
      } else {
        // Indenting RFP API
        response = await axios.put(
          `${API.PURCHASE_API}/indenting/${indentingId}/rfp`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.RFP_ID) {
          setRfpId(response.data.RFP_ID);
        } else {
          setRfpId(null);
        }
        // setRfpId(selectedRequest.rfp_id);
        fetchDetails(); // 👉 fetch latest org + logo data
      }

      setShowRFP(true);
      fetchDetails();
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error!",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to generate RFP. Please try again.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      setShowRFP(true);
      fetchDetails(); // 👉 fetch latest org + logo data

      if (error.response?.data?.RFP_ID) {
        setRfpId(error.response.data.RFP_ID);
      } else if (item?.rfp_id) {
        setRfpId(item.rfp_id);
      } else if (selectedRequest?.rfp_id) {
        setRfpId(selectedRequest.rfp_id);
      }
    }
  };

  const filteredRequests = requests.filter((item) => {
    let matches = true;

    // ✅ Always show only "Approved" status
    if (item.status !== "Approved") {
      matches = false;
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      const inAssetName = item.asset_name?.toLowerCase().includes(searchTerm);
      const inCategory = item.category?.toLowerCase().includes(searchTerm);
      const inRequestFor = item.request_for?.toLowerCase().includes(searchTerm);
      if (!(inAssetName || inCategory || inRequestFor)) {
        matches = false;
      }
    }

    if (requestfor && item.request_for !== requestfor) {
      matches = false;
    }

    if (asset && item.category !== asset) {
      matches = false;
    }

    if (department && item.dept_id !== parseInt(department)) {
      matches = false;
    }

    if (status && item.status !== status) {
      matches = false;
    }

    return matches;
  });

  const handleAssetChange = (e) => {
    setAsset(e.target.value);
    setStatus("");
  };

  const handlerequestforChange = (e) => {
    setRequestfor(e.target.value);
    setAsset(""); // Reset category selection
  };

  const handlePreviewRFP = async (item) => {
    if (!item) {
      setModalProps({
        type: "error",
        title: "Error!",
        message: "Filename is missing!",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      return;
    }

    try {
      console.log("Previewing RFP:", item.rfp_id);
      console.log("Using token:", token);

      const response = await axios.get(
        `${API.PURCHASE_API}/rfps/preview_rfp/${item.rfp_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, "_blank");
      } else {
        throw new Error("File URL not found in response");
      }
    } catch (error) {
      console.error("Preview RFP Error:", error);

      setModalProps({
        type: "error",
        title: "Error!",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to preview RFP",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  const getDmsPublishId = async (service_name, doctype, doc_name) => {
    try {
      console.log("Fetching publish_id for:", {
        service_name,
        doctype,
        doc_name,
      });
      const res = await axios.get(
        API.DMS_MAPPING_CHECK ||
          "https://devapi.softtrails.net/saas/dms/test/mapping/check",
        {
          params: { service_name, doctype, doc_name },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.data.dms_publish_id) throw new Error("No publish_id returned");
      return res.data.dms_publish_id;
    } catch (err) {
      const msg = err.response?.data?.error || "Unknown error";
      throw new Error(msg);
    }
  };

  const handleSave = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in session storage");

      let logoUrl = formData.logoUrl; // default to prefilled logo URL

      // === Upload Logo only if new file selected ===
      if (formData.logo instanceof File) {
        const publish_id = await getDmsPublishId(
          "purchase",
          "ORGANIZATION_LOGO",
          "ORGANIZATION_LOGO"
        );
        const logoFormData = new FormData();
        logoFormData.append("documents", formData.logo);
        logoFormData.append("ref", "RFP");
        logoFormData.append(
          "metadata",
          JSON.stringify([
            {
              service: "purchase",
              publish_id,
              user_id: userId,
              document_name: formData.logo.name,
            },
          ])
        );
        logoFormData.append("custom_folder", "purchase");

        const logoUploadRes = await axios.post(
          API.DMS_UPLOAD ||
            "https://devapi.softtrails.net/saas/dms/test/dmsapi/upload-documents",
          logoFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        logoUrl = logoUploadRes.data?.uploaded_files?.[0]?.file_url;
        if (!logoUrl) throw new Error("Logo upload failed");
      }

      // === Create RFP ===
      const rfpPayload = {
        user_id: userId,
        rfp_id: rfpId,
        Organization_Name: formData.organization,
        Logo: logoUrl,
      };

      const rfpResponse = await axios.post(
        `${API.PURCHASE_API}/rfps/create_rfp`,
        rfpPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("RFP created successfully:", rfpResponse.data);
      setModalProps({
        type: "success",
        title: "Success!",
        message: "RFP created successfully!",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    } catch (error) {
      console.error("Error saving RFP:", error);
      const apiMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create RFP";
      setModalProps({
        type: "error",
        message: apiMsg,
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API.PURCHASE_API}/rfps/organization_rfp_details?user_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orgData = response.data?.data || [];

      const orgNames = orgData.map((item) => item.organization_name).join(", ");

      setFormData((prev) => ({
        ...prev,
        organization: orgNames,
        logo: orgData[0]?.logo_file_link || "",
        logoUrl: orgData[0]?.logo_file_link || "",
      }));
    } catch (error) {
      console.error("Failed to fetch organization data:", error);
    } finally {
      setLoading(false); // stop loader
    }
  };

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (requestfor) {
        try {
          const response = await axios.get(
            `${API.PURCHASE_API}/assets?request_for=${requestfor}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const categories = Array.isArray(response.data)
            ? response.data.map((item) => item.category)
            : [];
          setCategoryOptions([...new Set(categories)].sort());
        } catch (error) {
          console.error("Error fetching category options:", error);
          setCategoryOptions([]);
        }
      } else {
        setCategoryOptions([]);
      }
    };

    fetchCategoryOptions();
  }, [requestfor]);
  const requestForOptions = [
    { value: "Movable", label: "Movable" },
    { value: "Raw Materials", label: "Raw Materials" },
  ];

  const categorySelectOptions = categoryOptions.map((cat) => ({
    value: cat,
    label: cat,
  }));

  useEffect(() => {
    // Only fetch when popup opens
    if (!showRFP) return;

    const fetchDocumentOptions = async () => {
      try {
        // 1. Get service_id for "purchase"
        const serviceRes = await axios.get(`${API.API_BASE}/dms/test/service`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const purchaseService = serviceRes.data.find(
          (s) => s.name?.toLowerCase() === "purchase"
        );
        if (!purchaseService) throw new Error("Purchase service not found");
        const service_id = purchaseService.id;

        // 2. Get doctype_id for "POI" (or any doctype you want)
        const doctypeRes = await axios.get(`${API.API_BASE}/dms/test/doctype`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctype = doctypeRes.data.find(
          (d) => d.doctype?.toLowerCase() === "required documents"
        );
        if (!doctype) throw new Error("Doctype not found");
        const doctype_id = doctype.id;

        // 3. Fetch document options using service_id and doctype_id
        const docRes = await axios.get(
          `${API.API_BASE}/dms/test/dmsapi/upload?service_id=${service_id}&doctype_id=${doctype_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocumentOptions(
          (docRes.data || []).map((doc) => ({
            value: doc.doc_name,
            label:
              doc.doc_name + (doc.description ? ` - ${doc.description}` : ""),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch document types", err);
        setDocumentOptions([]);
      }
    };

    fetchDocumentOptions();
  }, [showRFP]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6; // Change as needed

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  // Slice requests for the current page
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportData = filteredRequests.map((item, idx) => ({
    sno: idx + 1,
    id: item.id,
    request_for: item.request_for,
    category: item.category,
    asset_name: item.asset_name,
    quantity: item.quantity,
    approval_date: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString("en-GB")
      : "",
    status: item.status,
  }));

  return (
    <div className="p-2">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <div style={{ minWidth: 180 }}>
          <Select
            options={requestForOptions}
            value={
              requestForOptions.find((opt) => opt.value === requestfor) || null
            }
            onChange={(opt) =>
              handlerequestforChange({ target: { value: opt?.value || "" } })
            }
            placeholder="Request for"
            isClearable
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <Select
            options={categorySelectOptions}
            value={
              categorySelectOptions.find((opt) => opt.value === asset) || null
            }
            onChange={(opt) =>
              handleAssetChange({ target: { value: opt?.value || "" } })
            }
            placeholder="All Category"
            isClearable
          />
        </div>
        <div className="flex-1 flex justify-end">
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="Inventry"
          />
        </div>
      </div>
      <div
        className="overflow-x-auto rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
      >
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black">
            {" "}
            <tr>
              <th className="p-2 text-center">S. No.</th>
              <th className="p-2 text-center">Indent ID</th>
              <th className="p-2 text-center">Request for</th>
              <th className="p-2 text-center">Category</th>
              {/* <th className="p-2 text-center">Request Material</th> */}
              <th className="p-2 text-center">RFP ID</th>
              <th className="p-2 text-center">Quantity</th>
              <th className="p-2 text-center">Approval Date</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((item, index) => (
              <tr key={item.id} className="odd:bg-blue-50">
                <td className="p-2 text-center">
                  {index + 1 + (currentPage - 1) * rowsPerPage}
                </td>
                <td
                  className="p-2 text-center cursor-pointer"
                  onClick={() => handleRequestMaterialClick(item)}
                >
                  {item.id}
                </td>
                <td className="p-2 text-center ">{item.request_for}</td>
                <td className="p-2 text-center">{item.category}</td>
                {/* <td
                  className="p-2 text-center  text-custome-blue cursor-pointer"
                  onClick={() => handleRequestMaterialClick(item)}
                >
                  {item.asset_name}
                </td> */}
                <td className="p-2 text-center">
                  {item.rfp_id || ""}
                </td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-center">
                  {new Date(item.updated_at).toLocaleDateString("en-GB")}
                </td>

                {/* {item.rfp_id ? (
                  <td
                    className="p-2 flex items-center justify-center text-custome-blue font-semibold cursor-pointer"
                    onClick={() => handlePreviewRFP(item)}
                  >
                    <FaFilePdf color="red" size={18} />
                  </td>
                ) : (
                  <td className="p-2 text-center text-black-400 font-bold"></td>
                )}
               */}
                <td className="p-2 flex items-center justify-center gap-2">
                  {/* Preview PDF (only when rfp_id exists) */}
                  {item.rfp_id ? (
                    <div
                      className="text-custome-blue cursor-pointer"
                      title="Preview RFP"
                      onClick={() => handlePreviewRFP(item)}
                    >
                      <FaFilePdf color="red" size={18} />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">&nbsp;</div>
                  )}

                  {/* Generate / Regenerate RFP (visible for every row) */}
                  <div
                    className="bg-blue-600 text-white p-1 rounded cursor-pointer hover:bg-blue-700"
                    title={item.rfp_id ? "Regenerate RFP" : "Generate RFP"}
                    onClick={() => handleGenerateRFPClick(item)}
                  >
                    <FaRegFileAlt size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-4 justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-white border-gray-300  border rounded disabled:opacity-50"
        >
          &lt;
        </button>

        <button className="px-4 py-2 bg-custome-blue border-custome-blue  text-white rounded">
          {currentPage}
        </button>

        <span className="px-2">of</span>

        <button className="px-4 py-2 border rounded text-custome-blue">
          {totalPages}
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
      {/* Request Material Popup */}
      {isRequestMaterialOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[50%] max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Indent Details</h2>
              <button onClick={() => setIsRequestMaterialOpen(false)}>
                <span className="text-red-500 text-2xl">✖</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div className="flex">
                <span className="font-semibold w-32">Indent Id:</span>
                <span>{selectedRequest.id || "9876543234567"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Request for:</span>
                <span>{selectedRequest.request_for || "Raw material"}</span>
              </div>

              <div className="flex">
                <span className="font-semibold w-32">Category:</span>
                <span>{selectedRequest.category || "category name"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Request material:</span>
                <span>{selectedRequest.asset_name || "Computer"}</span>
              </div>

              <div className="flex">
                <span className="font-semibold w-32">Quantity:</span>
                <span>{selectedRequest.quantity || "98"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">UOM:</span>
                <span>{selectedRequest.uom || "xyz"}</span>
              </div>

              <div className="flex">
                <span className="font-semibold w-32">Workflow:</span>
                <span>{selectedRequest.workflow || "Workflow name"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32">Budget:</span>
                <span>{selectedRequest.budget || "Dehradun"}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-1">Description:</p>
              <p className="text-justify text-sm">{selectedRequest.remarks}</p>
            </div>

            <div className="mt-6 flex justify-start gap-4">
              <button
                onClick={handleGenerateRFPClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Generate RFP
              </button>

              <button
                onClick={() => setIsRequestMaterialOpen(false)}
                className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-5 w-[95%] max-w-3xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-xl">Request for proposal</h2>
                <p className="text-sm text-gray-600">
                  {rfpId ? rfpId : "Loading RFP ID..."}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowRFP(false);
                }}
                className="text-red-600 text-2xl"
              >
                ✖
              </button>
            </div>
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {loading ? (
                <div className="col-span-full text-center py-8 text-blue-600 font-semibold">
                  Loading organization details...
                </div>
              ) : (
                <>
                  {/* Info message for prefilled data */}
                  {(formData.organization || formData.logoUrl) && (
                    <div className="col-span-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 text-sm rounded">
                      This logo and organization name are fetched from
                      previously saved data.
                      <br />
                      You can update the existing info or upload a new one
                      below.
                    </div>
                  )}

                  {/* Organization Input */}
                  <div className="col-span-full md:col-span-2">
                    <label className="block font-medium">
                      Your organization description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Organization name, Address, PinCode"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block font-medium ">
                      Your Image/logo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      className="hidden border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-700 bg-white">
                      <span
                        className={`truncate w-full ${
                          formData.logoUrl
                            ? "text-blue-600 cursor-pointer underline"
                            : ""
                        }`}
                        onClick={() => {
                          if (formData.logoUrl)
                            window.open(formData.logoUrl, "_blank");
                        }}
                        title={formData.logoUrl ? "Click to view logo" : ""}
                      >
                        {formData.logoUrl || selectedLogoName || "Upload logo"}
                      </span>
                      <FaUpload
                        className="text-gray-400 ml-2 flex-shrink-0 cursor-pointer"
                        onClick={handleIconClick}
                      />
                    </div>
                  </div>
                  {/* <div>
                    <label className="block font-medium mb-1">
                      Your Image/logo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <div
                      onClick={handleIconClick}
                      className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-700 cursor-pointer bg-white"
                    >
                      <span className="truncate w-full">
                        {formData.logoUrl || selectedLogoName || "Upload logo"}
                      </span>
                      <FaUpload className="text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </div> */}

                  {/* GO Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleSave}
                      className="bg-custome-blue text-white px-4 py-2 text-sm rounded w-full"
                    >
                      GO
                    </button>
                  </div>
                </>
              )}
            </div>
            <hr className="border-t border-gray-300 my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Start Date</label>
                <input
                  type="text"
                  value={formData.issuedDate}
                  disabled
                  className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            {/* File Upload */}
            {/* File Upload */}
            <div className="mb-6 border-2 border-dashed border-gray-400 p-6 text-center rounded">
              <p className="mb-2 text-gray-600">
                Choose a specification file or drag & drop it here.
              </p>
              <p className="mb-2 text-sm text-gray-500">
                PDF format, up to 10 MB.
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="text-blue-600 cursor-pointer underline"
              >
                Browse File
              </label>

              {selectedSpecFileName && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  Selected File: {selectedSpecFileName}
                </p>
              )}
            </div>
            {/* Description */}
            <div className="mb-4">
              <label className="block font-medium">
                Additional Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Required Documents</label>
              <Select
                options={documentOptions}
                value={documentOptions.filter((opt) =>
                  Array.isArray(formData.requiredDocument)
                    ? formData.requiredDocument.includes(opt.value)
                    : false
                )}
                onChange={(opts) =>
                  setFormData({
                    ...formData,
                    requiredDocument: opts ? opts.map((opt) => opt.value) : [],
                  })
                }
                placeholder="Select or type document"
                isClearable
                isSearchable
                isMulti
                className="w-full"
              />
            </div>
            {/* Action Buttons */}
            <div className="flex justify-start gap-4">
              <button
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                GENERATE
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowRFP(false);
                  fetchRequests(); // <-- Refresh table when popup is closed
                }}
                className="border border-gray-500 text-gray-700 px-6 py-2 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && <PopupModal {...modalProps} />}
    </div>
  );
};

export default InventryIndenting;
