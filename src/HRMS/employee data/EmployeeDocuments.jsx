// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import { faTrash } from '@fortawesome/free-solid-svg-icons';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import pdf from '../../assests/folder.png';
// // import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
// // import AddButton from "../../NewComponents/AddButton";
// // import Pagination from "../../NewComponents/Pagination";   // ✅ import pagination

// // const DocumentPage = ({ setActiveTab }) => {
// //   const [documents, setDocuments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [employeeId, setEmployeeId] = useState(null);
// //   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
// //   const [selectedDoc, setSelectedDoc] = useState(null);
// //   const [deleting, setDeleting] = useState(false);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const documentsPerPage = 25;
// //   const API_URL = "https://devapi.softtrails.net/hrms/test/dmsapi/documents";

// //   useEffect(() => {
// //     const storedEmployeeId = sessionStorage.getItem("employeeeId");
// //     if (storedEmployeeId) {
// //       setEmployeeId(storedEmployeeId);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     const fetchDocuments = async () => {
// //       if (!employeeId) return;
// //       setLoading(true);
// //       try {
// //         const response = await axios.get(API_URL);
// //         const filteredDocs = response.data.filter(
// //           (doc) => String(doc.uploaded_by?.id) === String(employeeId)
// //         );
// //         setDocuments(filteredDocs);
// //       } catch (err) {
// //         setError("Failed to load documents. Please try again.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchDocuments();
// //   }, [employeeId]);

// //   const confirmDelete = (doc) => {
// //     setSelectedDoc(doc);
// //     setDeleteModalOpen(true);
// //   };

// //   const handleDelete = async () => {
// //     if (!selectedDoc) return;
// //     try {
// //       setDeleting(true);
// //       await axios.delete(`${API_URL}/${selectedDoc.document_id}`);
// //       setDocuments((prev) =>
// //         prev.filter((doc) => doc.document_id !== selectedDoc.document_id)
// //       );
// //       setDeleteModalOpen(false);
// //       setSelectedDoc(null);
// //     } catch (err) {
// //       console.error("Delete failed:", err);
// //       alert("Failed to delete document. Please try again.");
// //     } finally {
// //       setDeleting(false);
// //     }
// //   };

// //   // Pagination Logic
// //   const indexOfLastDocument = currentPage * documentsPerPage;
// //   const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
// //   const currentDocuments = documents.slice(
// //     indexOfFirstDocument,
// //     indexOfLastDocument
// //   );
// //   const totalPages = Math.ceil(documents.length / documentsPerPage);

// //   const handlePageChange = (page) => {
// //     if (page >= 1 && page <= totalPages) {
// //       setCurrentPage(page);
// //     }
// //   };

// //   const handleUploadDocumentClick = () => {
// //     setActiveTab("uploadDocuments");
// //   };

// //   return (
// //     <div className="p-4">
// //       <div className="flex items-center justify-between mb-4">
// //         <AddButton onClick={handleUploadDocumentClick}>Upload Document</AddButton>
// //       </div>

// //       {loading ? (
// //         <p>Loading documents...</p>
// //       ) : error ? (
// //         <p className="text-red-600">{error}</p>
// //       ) : documents.length === 0 ? (
// //         <p>No documents found for this user.</p>
// //       ) : (
// //         <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
// //           {/* Scrollable Table */}
// //           <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
// //             <table className="min-w-full table-auto border-collapse text-sm">
// //               <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
// //                 <tr>
// //                   <th className="p-5 text-left text-black">S.No</th>
// //                   <th className="p-5 text-left text-black">Name</th>
// //                   <th className="p-5 text-left text-black">Service</th>
// //                   <th className="p-5 text-left text-black">Type</th>
// //                   <th className="p-5 text-left text-black">Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
// //                 {currentDocuments.map((doc, index) => (
// //                   <tr key={doc.document_id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
// //                     <td className="px-5 py-4 text-left text-[14px] text-black">{indexOfFirstDocument + index + 1}</td>
// //                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.custom_folder}</td>
// //                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.service?.name}</td>
// //                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.document_type?.name}</td>
// //                     <td className="px-2 md:px-4 py-2 text-left">
// //                       <div className="flex items-center space-x-3">
// //                         <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc)} > <FontAwesomeIcon icon={faTrash} /> </button>
// //                         <a href={doc.document_url} target="_blank" rel="noopener noreferrer" ><img src={pdf} alt="PDF" className="w-6 h-6 object-contain cursor-pointer"/></a>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>

// //           <Pagination
// //             currentPage={currentPage}
// //             totalPages={totalPages}
// //             onPageChange={handlePageChange}
// //           />
// //         </div>
// //       )}

// //       {/* Delete Modal */}
// //       <DeleteConfirmModal
// //         open={deleteModalOpen}
// //         title="Delete Document?"
// //         message={`Are you sure you want to delete "${selectedDoc?.document_name}"?`}
// //         onCancel={() => setDeleteModalOpen(false)}
// //         onConfirm={handleDelete}
// //         loading={deleting}
// //       />
// //     </div>
// //   );
// // };

// // export default DocumentPage;



// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import pdf from '../../assests/folder.png';
// import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
// import AddButton from "../../NewComponents/AddButton";
// import Pagination from "../../NewComponents/Pagination";   

// const DocumentPage = ({ setActiveTab }) => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [employeeId, setEmployeeId] = useState(null);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [deleting, setDeleting] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const documentsPerPage = 25;
//   const API_URL = "https://devapi.softtrails.net/hrms/test/dmsapi/documents";

//   useEffect(() => {
//     const storedEmployeeId = sessionStorage.getItem("employeeId");
//     if (storedEmployeeId) {
//       setEmployeeId(storedEmployeeId);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       if (!employeeId) return;
//       setLoading(true);
//       try {
//         const response = await axios.get(API_URL);
//         const filteredDocs = response.data.filter(
//           (doc) => String(doc.uploaded_by?.id) === String(employeeId)
//         );
//         setDocuments(filteredDocs);
//       } catch (err) {
//         setError("Failed to load documents. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, [employeeId]);

//   const confirmDelete = (doc) => {
//     setSelectedDoc(doc);
//     setDeleteModalOpen(true);
//   };

//   const handleDelete = async () => {
//     if (!selectedDoc) return;
//     try {
//       setDeleting(true);
//       await axios.delete(`${API_URL}/${selectedDoc.document_id}`);
//       setDocuments((prev) =>
//         prev.filter((doc) => doc.document_id !== selectedDoc.document_id)
//       );
//       setDeleteModalOpen(false);
//       setSelectedDoc(null);
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Failed to delete document. Please try again.");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Pagination Logic
//   const indexOfLastDocument = currentPage * documentsPerPage;
//   const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
//   const currentDocuments = documents.slice(
//     indexOfFirstDocument,
//     indexOfLastDocument
//   );
//   const totalPages = Math.ceil(documents.length / documentsPerPage);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleUploadDocumentClick = () => {
//     setActiveTab("uploadDocuments");
//   };

//   return (
//     <div className="p-4">
//       <div className="flex items-center justify-between mb-4">
//         <AddButton onClick={handleUploadDocumentClick}>Upload Document</AddButton>
//       </div>

//       {loading ? (
//         <p>Loading documents...</p>
//       ) : error ? (
//         <p className="text-red-600">{error}</p>
//       ) : documents.length === 0 ? (
//         <p>No documents found for this user.</p>
//       ) : (
//         <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
//           {/* Scrollable Table */}
//           <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//             <table className="min-w-full table-auto border-collapse text-sm">
//               <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
//                 <tr>
//                   <th className="p-5 text-left text-black">S.No</th>
//                   <th className="p-5 text-left text-black">Name</th>
//                   <th className="p-5 text-left text-black">Service</th>
//                   <th className="p-5 text-left text-black">Type</th>
//                   <th className="p-5 text-left text-black">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
//                 {currentDocuments.map((doc, index) => (
//                   <tr key={doc.document_id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
//                     <td className="px-5 py-4 text-left text-[14px] text-black">{indexOfFirstDocument + index + 1}</td>
//                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.custom_folder}</td>
//                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.service?.name}</td>
//                     <td className="px-5 py-4 text-left text-[14px] text-black">{doc.document_type?.name}</td>
//                     <td className="px-2 md:px-4 py-2 text-left">
//                       <div className="flex items-center space-x-3">
//                         <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc)} > <FontAwesomeIcon icon={faTrash} /> </button>
//                         <a href={doc.document_url} target="_blank" rel="noopener noreferrer" ><img src={pdf} alt="PDF" className="w-6 h-6 object-contain cursor-pointer"/></a>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}

//       {/* Delete Modal */}
//       <DeleteConfirmModal
//         open={deleteModalOpen}
//         title="Delete Document?"
//         message={`Are you sure you want to delete "${selectedDoc?.document_name}"?`}
//         onCancel={() => setDeleteModalOpen(false)}
//         onConfirm={handleDelete}
//         loading={deleting}
//       />
//     </div>
//   );
// };

// export default DocumentPage;


/////////////////////////////////////
import React, { useEffect, useState } from "react";
import axios from "axios";
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import pdf from '../../assests/folder.png';
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import AddButton from "../../NewComponents/AddButton";
import Pagination from "../../NewComponents/Pagination";   

const DocumentPage = ({ setActiveTab }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);   // ✅ employeeId → userId
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 25;
  const API_URL = "https://devapi.softtrails.net/hrms/test/dmsapi/documents";

  useEffect(() => {
    // ✅ sessionStorage se userId le rahe hain
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setLoading(false); // agar userId hi nahi hai to loading atka na rahe
    }
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        const filteredDocs = response.data.filter(
          (doc) => String(doc.uploaded_by?.id) === String(userId)   // ✅ yaha userId use
        );
        setDocuments(filteredDocs);
      } catch (err) {
        setError("Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [userId]);

  const confirmDelete = (doc) => {
    setSelectedDoc(doc);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/${selectedDoc.document_id}`);
      setDocuments((prev) =>
        prev.filter((doc) => doc.document_id !== selectedDoc.document_id)
      );
      setDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Pagination Logic
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = documents.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );
  const totalPages = Math.ceil(documents.length / documentsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleUploadDocumentClick = () => {
    setActiveTab("uploadDocuments");
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AddButton onClick={handleUploadDocumentClick}>Upload Document</AddButton>
      </div>

      {loading ? (
        <p>Loading documents...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : documents.length === 0 ? (
        <p>No documents found for this user.</p>
      ) : (
        <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
          {/* Scrollable Table */}
          <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                <tr>
                  <th className="p-5 text-left text-black">S.No</th>
                  <th className="p-5 text-left text-black">Name</th>
                  <th className="p-5 text-left text-black">Service</th>
                  <th className="p-5 text-left text-black">Type</th>
                  <th className="p-5 text-left text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                {currentDocuments.map((doc, index) => (
                  <tr key={doc.document_id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
                    <td className="px-5 py-4 text-left text-[14px] text-black">{indexOfFirstDocument + index + 1}</td>
                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.document_name}</td>
                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.service?.name}</td>
                    <td className="px-5 py-4 text-left text-[14px] text-black">{doc.document_type?.name}</td>
                    <td className="px-2 md:px-4 py-2 text-left">
                      <div className="flex items-center space-x-3">
                        <button className="text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc)} > <FontAwesomeIcon icon={faTrash} /> </button>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer" ><img src={pdf} alt="PDF" className="w-6 h-6 object-contain cursor-pointer"/></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Document?"
        message={`Are you sure you want to delete "${selectedDoc?.document_name}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

export default DocumentPage;
