// import React, { useState, useCallback, useEffect } from "react";
// import "react-date-range/dist/styles.css"; 
// import "react-date-range/dist/theme/default.css";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { useDropzone } from "react-dropzone";

// function DocumentUpload() {
//   const [files, setFiles] = useState([]);
//   const [formData, setFormData] = useState({
//     employeeName: "",
//     employeeId: "",
//     documentType: "",
//     serviceType: "",
//     documentName: "",
//     dateRange: { startDate: new Date(), endDate: new Date() },
//   });
//   const [employeeList, setEmployeeList] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [documentTypes, setDocumentTypes] = useState([]);
//   const [services, setServices] = useState([]);
//   const [documentType, setDocumentType] = useState("");
//   const [serviceType, setServiceType] = useState("");
//   const [documentName, setDocumentName] = useState(""); // Input field for document name
//   const [filteredDocumentTypes, setFilteredDocumentTypes] = useState([]);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const response = await axios.get("https://devapi.softtrails.net/hrms/test/users");
//         setEmployeeList(response.data);
//       } catch (error) {
//         console.error("Error fetching employee details:", error);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // Fetch Document Types
//   useEffect(() => {
//     const fetchDocumentTypes = async () => {
//       try {
//         const response = await axios.get(
//           "https://devapi.softtrails.net/hrms/test/dms/doctypes"
//         );
//         setDocumentTypes(response.data);
//       } catch (error) {
//         console.error("Error fetching document types:", error);
//       }
//     };
//     fetchDocumentTypes();
//   }, []);

//   // Fetch Services
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await axios.get(
//           "https://devapi.softtrails.net/hrms/test/dms/services"
//         );
//         setServices(response.data);
//       } catch (error) {
//         console.error("Error fetching services:", error);
//       }
//     };
//     fetchServices();
//   }, []);

//   useEffect(() => {
//     if (serviceType) {
//       const filteredDocs = documentTypes.filter(
//         (doc) => doc.service_id === parseInt(serviceType)
//       );
//       setFilteredDocumentTypes(filteredDocs);
//     } else {
//       setFilteredDocumentTypes([]);
//     }
//     setDocumentType(""); 
//   }, [serviceType, documentTypes]);

//   const handleEmployeeNameChange = (value) => {
//     setFormData((prev) => ({ ...prev, employeeName: value, employeeId: "" }));

//     if (value.length > 2) {
//       const filtered = employeeList.filter((emp) =>
//         `${emp.first_name} ${emp.last_name}`
//           .toLowerCase()
//           .includes(value.toLowerCase())
//       );
//       setFilteredEmployees(filtered);
//       setShowDropdown(filtered.length > 0);
//     } else {
//       setShowDropdown(false);
//     }
//   };

//   const handleSelectEmployee = (selectedEmployee) => {
//     setFormData((prev) => ({
//       ...prev,
//       employeeName: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
//       employeeId: selectedEmployee.emp_id,
//     }));
//     setShowDropdown(false);
//   };

//   const onDrop = useCallback((acceptedFiles) => {
//     const newFiles = acceptedFiles.map((file) => ({
//       file,
//       name: file.name,
//       size: `${Math.round(file.size / 1024)} KB`,
//       progress: 0,
//       // status: "uploading",
//     }));
//     setFiles((prev) => [...prev, ...newFiles]);
//   }, []);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: {
//       "image/jpeg": [".jpeg", ".jpg"],
//       "image/png": [".png"],
//       "application/pdf": [".pdf"],
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
//         [".docx"],
//     },
//     maxSize: 50 * 1024 * 1024,
//   });

//   // Handle Form Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("Submitting Date Range:", formData.dateRange); // Debugging log

//     if (files.length === 0) {
//       Swal.fire("Please upload at least one file.");
//       return;
//     }

//     try {
//       const formDataUpload = new FormData();

//       // Append multiple files
//       files.forEach((fileObj) => {
//         formDataUpload.append("documents", fileObj.file);
//       });

//       // Append metadata
//       const metadata = JSON.stringify([{
//         // service_id: formData.serviceType,
//         doctype_id: formData.documentType,
//         user_id: formData.employeeId,
//         document_name: documentName,
//       }]);
//       formDataUpload.append("metadata", metadata);
//       const response = await axios.post(
//         "https://devapi.softtrails.net/hrms/test/dms/upload-documents",
//         formDataUpload,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );
//       if (response.status === 200) {
//         Swal.fire("Documents uploaded successfully!");
//         setFiles([]);
//         setFormData({
//           employeeName: "",
//           employeeId: "",
//           documentType: "",
//           serviceType: "",
//           documentName: "",
//           dateRange: { startDate: new Date(), endDate: new Date() },
//         });
//       } else {
//         Swal.fire("Failed to upload documents.");
//       }
//     } catch (error) {
//       console.error("Error uploading documents:", error);
//       Swal.fire("An error occurred while uploading. Please try again.");
//     }
//   };

//   // Handle Service Change
//   const handleServiceChange = (e) => {
//     const value = e.target.value;
//     setFormData((prev) => ({ ...prev, serviceType: value }));
//     setServiceType(value);
//   };

//   // Handle Document Type Change
//   const handleDocumentTypeChange = (e) => {
//     const value = e.target.value;
//     setFormData((prev) => ({ ...prev, documentType: value }));
//     setDocumentType(value);
//   };

//   const removeFile = (fileName) => {
//     setFiles((prev) => prev.filter((f) => f.name !== fileName));
//   };
//   return (
//     <div className="flex h-screen">
//       <div className="flex flex-col ml-4 flex-1">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col w-full max-w-2xl mx-auto border rounded-lg p-6 bg-white shadow-md overflow-y-auto"
//         >
//           {/* Employee Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
//             <div className="relative">
//               <label className="block text-sm font-medium mb-2">
//                 Employee Name
//               </label>
//               <input
//                 type="text"
//                 value={formData.employeeName}
//                 onChange={(e) => handleEmployeeNameChange(e.target.value)}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter Employee Name"
//               />
//               {showDropdown && (
//                 <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg shadow-md max-h-40 overflow-auto">
//                   {filteredEmployees.map((emp) => (
//                     <li
//                       key={emp.emp_id}
//                       className="p-2 hover:bg-gray-200 cursor-pointer"
//                       onClick={() => handleSelectEmployee(emp)}
//                     >
//                       {emp.first_name} {emp.last_name} (ID: {emp.emp_id})
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Employee ID
//               </label>
//               <input
//                 type="text"
//                 value={formData.employeeId}
//                 readOnly
//                 className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
//               />
//             </div>
//           </div>

//           {/* Dropdowns */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Service</label>
//               <select
//                 value={formData.serviceType}
//                 onChange={handleServiceChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Service</option>
//                 {services.map((service) => (
//                   <option key={service.id} value={service.id}>
//                     {service.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Document Type
//               </label>
//               <select
//                 value={formData.documentType}
//                 onChange={handleDocumentTypeChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Document Type</option>
//                 {filteredDocumentTypes.map((doc) => (
//                   <option key={doc.id} value={doc.id}>
//                     {doc.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Document Name & Date Range */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">
//                 Document Name
//               </label>
//               <input
//                 type="text"
//                 value={documentName}
//                 onChange={(e) => setDocumentName(e.target.value)}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter document name"
//               />
//             </div>
//           </div>
//           <div
//             {...getRootProps()}
//             className="flex flex-col justify-center items-center px-10 py-8 mt-5 border border-dashed border-gray-400 rounded-lg text-center cursor-pointer hover:border-blue-500 transition"
//           >
//             <input {...getInputProps()} />
//             <img
//               src="https://cdn.builder.io/api/v1/image/assets/TEMP/d70348f7cd0c1bb0d28679a142a2b623d21584ac9e10279b245f1a9b1ff953b4"
//               alt=""
//               className="w-12 mb-2"
//             />
//             <p className="text-sm text-gray-600">
//               {isDragActive
//                 ? "Drop files here"
//                 : "Choose a file or drag & drop it here."}
//             </p>
//             <button
//               type="button"
//               className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             >
//               Browse File
//             </button>
//           </div>

//           {/* Uploaded Files */}
//           {files.length > 0 && (
//             <div className="mt-5 space-y-4">
//               {files.map((file, index) => (
//                 <div
//                   key={index}
//                   className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
//                 >
//                   <div className="flex items-center gap-4">
//                     <img
//                       src="https://cdn.builder.io/api/v1/image/assets/TEMP/c590ee249ca2486afe5be42672ee58290c0280cf584124d34565f0611e86b91a"
//                       alt=""
//                       className="w-8"
//                     />
//                     <div>
//                       <p className="text-sm font-medium">{file.name}</p>
//                       <p className="text-xs text-gray-500">
//                         {file.size} KB | Type: {file.description}
//                       </p>
//                       <p
//                         className={`text-xs ${
//                           file.status === "completed"
//                             ? "text-green-600"
//                             : "text-black"
//                         }`}
//                       >
//                         {file.status === "completed"
//                           ? "Completed"
//                           : "Uploading..."}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => removeFile(file.name)}
//                     aria-label="Remove file"
//                   >
//                     <img
//                       src="https://cdn.builder.io/api/v1/image/assets/TEMP/de674b81710f2e47c159a539bdaaeedc589c0647cf37d6059fe0fa688e6e90e6"
//                       alt=""
//                       className="w-6"
//                     />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full py-3 mt-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             Submit
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
// export default DocumentUpload;



//////////////// WITH DMS INTEGRATION ///////////////
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDropzone } from "react-dropzone";

function DocumentUpload() {
  const [files, setFiles] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeEmail: "",
    employeeId: "",
    documentName: "",
  });

  // Fetch Active Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("https://devapi.softtrails.net/hrms/test/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const activeUsers = response.data.users?.filter(
          (user) => user.user_status === "active"
        );
        setEmployeeList(activeUsers || []);
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Search employee by name or email
  const handleEmployeeSearch = (value) => {
    setFormData((prev) => ({
      ...prev,
      employeeName: value,
      employeeEmail: "",
      employeeId: "",
    }));

    if (value.length > 1) {
      const filtered = employeeList.filter(
        (emp) =>
          `${emp.first_name} ${emp.last_name}`
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          emp.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectEmployee = (emp) => {
    setFormData((prev) => ({
      ...prev,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      employeeEmail: emp.email,
      employeeId: emp.emp_id,
    }));
    setShowDropdown(false);
  };

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  // Fetch DMS Publish ID
  const getDmsPublishId = async () => {
    const url = "https://devapi.softtrails.net/saas/dms/test/mapping/check";
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.get(url, {
        params: {
          service_name: "HRMS",
          doctype: "HR Upload Document",
          doc_name: "HR Upload Document",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      return response.data.dms_publish_id || null;
    } catch (error) {
      console.error("Mapping check failed:", error);
      return null;
    }
  };

  // Upload File Logic
  const handleFileUpload = async (file) => {
    const publishId = await getDmsPublishId();
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!file || !publishId || !userId || !token) {
      console.warn("Missing required fields for file upload");
      return null;
    }

    const uploadData = new FormData();
    uploadData.append("documents", file);
    uploadData.append("ref", "DMS");

    const metadata = [
      {
        service: "HRMS",
        publish_id: parseInt(publishId),
        user_id: formData.employeeId || userId,
        document_name: file.name.replace(/[^a-zA-Z0-9_.\- ]/g, ""),
      },
    ];
    uploadData.append("metadata", JSON.stringify(metadata));

    try {
      const response = await fetch(
        "https://devapi.softtrails.net/saas/dms/test/dmsapi/upload-documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();
      return data.uploaded_files?.[0]?.file_url || null;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      Swal.fire("Please select an employee.");
      return;
    }

    if (files.length === 0) {
      Swal.fire("Please upload at least one document.");
      return;
    }

    try {
      const uploadPromises = files.map((fileObj) => handleFileUpload(fileObj.file));
      await Promise.all(uploadPromises);

      Swal.fire("Documents uploaded successfully!");
      setFiles([]);
      setFormData({
        employeeName: "",
        employeeEmail: "",
        employeeId: "",
        documentName: "",
      });
    } catch (error) {
      Swal.fire("An error occurred during upload. Please try again.");
      console.error(error);
    }
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col ml-4 flex-1">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-2xl mx-auto border rounded-lg p-6 bg-white shadow-md overflow-y-auto"
        >
          {/* Employee Name / Email Search */}
          <div className="relative mb-4">
            <label className="block text-sm font-medium mb-2">
              Employee Name / Email
            </label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) => handleEmployeeSearch(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or email"
            />
            {showDropdown && (
              <ul className="absolute z-10 bg-white border w-full mt-1 rounded-lg shadow-md max-h-40 overflow-auto">
                {filteredEmployees.map((emp) => (
                  <li
                    key={emp.user_id}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleSelectEmployee(emp)}
                  >
                    {emp.first_name} {emp.last_name} —{" "}
                    <span className="text-gray-500 text-sm">{emp.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Employee ID */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Employee ID</label>
            <input
              type="text"
              value={formData.employeeId}
              readOnly
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          {/* Document Upload Section */}
          <div
            {...getRootProps()}
            className="flex flex-col justify-center items-center px-10 py-8 mt-5 border border-dashed border-gray-400 rounded-lg text-center cursor-pointer hover:border-blue-500 transition"
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop files here"
                : "Choose a file or drag & drop it here."}
            </p>
            <button
              type="button"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Browse File
            </button>
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mt-5 space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <button onClick={() => removeFile(file.name)}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 mt-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
export default DocumentUpload;