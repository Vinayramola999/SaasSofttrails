import React, { useState } from "react";

import axios from "axios";
import Pagination from "../../NewComponents/Pagination";
import { faTrash,faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import PolicyDetailsModal from "./PolicyDetailsModal";

const PolicyTable = ({ policies, fetchPolicies }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [policyToDelete, setPolicyToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const itemsPerPage = 25;
    const totalPages = Math.ceil((policies?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPolicies = policies?.slice(startIndex, startIndex + itemsPerPage) || [];

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Open delete modal
    const handleDeleteClick = (policy) => {
        setPolicyToDelete(policy);
        setIsDeleteModalOpen(true);
    };

    // Confirm deletion
    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            await axios.delete(
                `https://devapi.softtrails.net/hrms/test/leave/leave-policy/${policyToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            setPolicyToDelete(null);
            setLoading(false);
            fetchPolicies();
        } catch (error) {
            console.error("Delete failed:", error);
            setLoading(false);
        }
    };

    // ✅ Open policy details
    const handleViewDetails = (policy) => {
        setSelectedPolicy(policy);
        setIsDetailsOpen(true);
    };

    return (
        <div className="relative mt-3">
            <div className="h-[75vh] sm:h-[60vh] md:h-[30vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Policy Name</th>
                                <th className="p-5 text-left text-black">Allocation Frequency</th>
                                <th className="p-5 text-left text-black">Allocation</th>
                                <th className="p-5 text-left text-black">Half Day Allowed</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="6" className="h-3 bg-white"></td></tr>
                            {currentPolicies.map((policy, index) => (
                                <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {(currentPage - 1) * itemsPerPage + index + 1} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewDetails(policy)} > {policy.policy_name} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{policy.allocation_type}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{policy.allocation}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {policy.half_day_allowed ? "Yes" : "No"} </td>
                                    <td className="px-5 py-4"><span className={`font-medium ${policy.status ? " text-green-600" : " text-red-600"}`} >{policy.status ? "Active" : "Inactive"}</span></td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(policy.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="px-2 md:px-4 py-2 text-left">
                                        <button className="text-red-500 hover:text-red-700 mr-2" onClick={() => handleDeleteClick(policy)} > <FontAwesomeIcon icon={faTrash} /> </button>
                                        <button className="text-red-500 hover:text-red-700 mr-2" > <FontAwesomeIcon icon={faEdit} /> </button>
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

            <DeleteConfirmModal
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                loading={loading}
                title="Delete Policy?"
                message={`Are you sure you want to delete policy "${policyToDelete?.policy_name}"?`}
            />

            <PolicyDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                policy={selectedPolicy}
            />
        </div>
    );
};
export default PolicyTable;




// import React, { useState } from "react";
// import axios from "axios";
// import Pagination from "../../NewComponents/Pagination";
// import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
// import PolicyDetailsModal from "./PolicyDetailsModal";
// import Swal from "sweetalert2";

// const PolicyTable = ({ policies, fetchPolicies }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [policyToDelete, setPolicyToDelete] = useState(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [selectedPolicy, setSelectedPolicy] = useState(null);
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);

//   // Edit States
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [policyToEdit, setPolicyToEdit] = useState(null);
//   const [editForm, setEditForm] = useState({
//     policy_name: "",
//     allocation_type: "",
//     allocation: "",
//     half_day_allowed: false,
//     status: true,
//   });

//   const itemsPerPage = 25;
//   const totalPages = Math.ceil((policies?.length || 0) / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentPolicies =
//     policies?.slice(startIndex, startIndex + itemsPerPage) || [];

//   const handlePageChange = (page) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//   };

//   // 🗑️ Delete Handling
//   const handleDeleteClick = (policy) => {
//     setPolicyToDelete(policy);
//     setIsDeleteModalOpen(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!policyToDelete) return;
//     setLoading(true);
//     try {
//       await axios.delete(
//         `https://devapi.softtrails.net/hrms/test/leave/leave-policy/${policyToDelete.id}`
//       );
//       setIsDeleteModalOpen(false);
//       setPolicyToDelete(null);
//       setLoading(false);
//       fetchPolicies();
//       Swal.fire("Deleted!", "Policy deleted successfully.", "success");
//     } catch (error) {
//       console.error("Delete failed:", error);
//       setLoading(false);
//       Swal.fire("Error", "Failed to delete policy.", "error");
//     }
//   };

//   // 👁️ View Details
//   const handleViewDetails = (policy) => {
//     setSelectedPolicy(policy);
//     setIsDetailsOpen(true);
//   };

//   // ✏️ Edit Policy
//   const handleEditClick = (policy) => {
//     setPolicyToEdit(policy);
//     setEditForm({
//       policy_name: policy.policy_name || "",
//       allocation_type: policy.allocation_type || "",
//       allocation: policy.allocation || "",
//       half_day_allowed: policy.half_day_allowed || false,
//       status: policy.status || true,
//     });
//     setIsEditOpen(true);
//   };

//   const handleEditChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEditForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleUpdatePolicy = async () => {
//     try {
//       await axios.put(
//         `https://devapi.softtrails.net/hrms/test/leave/leave-policy/${policyToEdit.id}`,
//         editForm
//       );
//       Swal.fire({
//         icon: "success",
//         title: "Policy Updated Successfully",
//         confirmButtonColor: "#3085d6",
//       });
//       setIsEditOpen(false);
//       fetchPolicies();
//     } catch (error) {
//       console.error("Error updating policy:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Update Failed",
//         text:
//           error.response?.data?.message || "Something went wrong while updating.",
//       });
//     }
//   };

//   return (
//     <div className="relative mt-3">
//       <div className="h-[75vh] sm:h-[60vh] md:h-[30vh] rounded-lg flex flex-col">
//         <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//           <table className="min-w-full table-auto border-collapse text-sm">
//             <thead
//               className="text-[14px] font-medium bg-white sticky top-0"
//               style={{ boxShadow: "0 2px 0 black" }}
//             >
//               <tr>
//                 <th className="p-5 text-left text-black">S.No</th>
//                 <th className="p-5 text-left text-black">Policy Name</th>
//                 <th className="p-5 text-left text-black">Allocation Frequency</th>
//                 <th className="p-5 text-left text-black">Allocation</th>
//                 <th className="p-5 text-left text-black">Half Day Allowed</th>
//                 <th className="p-5 text-left text-black">Status</th>
//                 <th className="p-5 text-left text-black">Date</th>
//                 <th className="p-5 text-left text-black">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td colSpan="6" className="h-3 bg-white"></td>
//               </tr>
//               {currentPolicies.map((policy, index) => (
//                 <tr
//                   key={index}
//                   className={`${
//                     (index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"
//                   }`}
//                 >
//                   <td className="px-5 py-4 text-left text-[14px] text-black">
//                     {(currentPage - 1) * itemsPerPage + index + 1}
//                   </td>
//                   <td
//                     className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer hover:underline"
//                     onClick={() => handleViewDetails(policy)}
//                   >
//                     {policy.policy_name}
//                   </td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">
//                     {policy.allocation_type}
//                   </td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">
//                     {policy.allocation}
//                   </td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">
//                     {policy.half_day_allowed ? "Yes" : "No"}
//                   </td>
//                   <td className="px-5 py-4">
//                     <span
//                       className={`font-medium ${
//                         policy.status ? " text-green-600" : " text-red-600"
//                       }`}
//                     >
//                       {policy.status ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">
//                     {new Date(policy.created_at).toLocaleDateString("en-GB")}
//                   </td>
//                   <td className="px-2 md:px-4 py-2 text-left">
//                     <button
//                       className="text-blue-500 hover:text-blue-700 mr-2"
//                       onClick={() => handleEditClick(policy)}
//                       title="Edit Policy"
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </button>
//                     <button
//                       className="text-red-500 hover:text-red-700"
//                       onClick={() => handleDeleteClick(policy)}
//                       title="Delete Policy"
//                     >
//                       <FontAwesomeIcon icon={faTrash} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={handlePageChange}
//         />
//       </div>

//       {/* 🗑️ Delete Modal */}
//       <DeleteConfirmModal
//         open={isDeleteModalOpen}
//         onCancel={() => setIsDeleteModalOpen(false)}
//         onConfirm={handleConfirmDelete}
//         loading={loading}
//         title="Delete Policy?"
//         message={`Are you sure you want to delete policy "${policyToDelete?.policy_name}"?`}
//       />

//       {/* 👁️ Details Modal */}
//       <PolicyDetailsModal
//         isOpen={isDetailsOpen}
//         onClose={() => setIsDetailsOpen(false)}
//         policy={selectedPolicy}
//       />

//       {/* ✏️ Edit Modal */}
//       {isEditOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
//           <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
//             <h2 className="text-lg font-semibold mb-4 text-center">
//               Edit Policy
//             </h2>

//             <div className="space-y-3">
//               <div>
//                 <label className="text-sm font-medium">Policy Name</label>
//                 <input
//                   type="text"
//                   name="policy_name"
//                   value={editForm.policy_name}
//                   onChange={handleEditChange}
//                   className="w-full border p-2 rounded-md"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium">
//                   Allocation Frequency
//                 </label>
//                 <input
//                   type="text"
//                   name="allocation_type"
//                   value={editForm.allocation_type}
//                   onChange={handleEditChange}
//                   className="w-full border p-2 rounded-md"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Allocation</label>
//                 <input
//                   type="number"
//                   name="allocation"
//                   value={editForm.allocation}
//                   onChange={handleEditChange}
//                   className="w-full border p-2 rounded-md"
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   name="half_day_allowed"
//                   checked={editForm.half_day_allowed}
//                   onChange={handleEditChange}
//                 />
//                 <label className="text-sm">Half Day Allowed</label>
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   name="status"
//                   checked={editForm.status}
//                   onChange={handleEditChange}
//                 />
//                 <label className="text-sm">Active Status</label>
//               </div>
//             </div>

//             <div className="flex justify-end mt-5 gap-3">
//               <button
//                 onClick={() => setIsEditOpen(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdatePolicy}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default PolicyTable;