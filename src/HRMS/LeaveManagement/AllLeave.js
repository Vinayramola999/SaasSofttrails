
// import axios from 'axios';
// import React, { useState, useEffect, useRef } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
// import Swal from 'sweetalert2';
// import AddButton from "../../NewComponents/AddButton";
// import { FaPlus } from "react-icons/fa";
// import SearchButton from "../../NewComponents/SearchButton";

// const LeaveManagement = () => {
//     const [leaves, setLeaves] = useState([]);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [currentStep, setCurrentStep] = useState(1);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, id: null });
//     const [isPopupOpen, setIsPopupOpen] = useState(false);
//     const [selectedLeave, setSelectedLeave] = useState(null);
//     const [error, setError] = useState(false);
//     const [formData, setFormData] = useState({
//         leave_type: '',
//         description: '',
//         allocation_type: '',
//         allocation: '',
//         carry_forward: false,
//         carry_forward_type: '',
//         constraint_type: '',
//         value: '',
//         percentage: '',
//         max_requests: ''
//     });
//     const [errors, setErrors] = useState({
//         leave_type: '',
//         description: '',
//         allocation_type: '',
//         allocation: '',
//         constraint_type: '',
//         value: '',
//         max_requests: '',
//         carry_forward: '',
//         carry_forward_type: '',
//         percentage: '',
//     });
//     const [errorMessage, setErrorMessage] = useState("");
//     const leaveTypeRef = useRef(null);

//     const handleSubmit = async (e) => {
//         let cleanedFormData = { ...formData };
//         // Validate carry forward fields
//         if (cleanedFormData.carry_forward) {
//             if (!cleanedFormData.carry_forward_type || !cleanedFormData.percentage) {
//                 const errorMsg = 'Carry Forward Type and Value are required when Carry Forward is Yes.';
//                 setError(errorMsg);
//                 return;
//             }
//         } else {
//             delete cleanedFormData.carry_forward_type;
//             delete cleanedFormData.percentage;
//         }
//         const apiUrl = `https://devapi.softtrails.net/hrms/test/leave/leave-types`; // Ensure this URL is correct
//         const token = sessionStorage.getItem('token');

//         try {
//             const response = await fetch(apiUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(cleanedFormData),
//             });

//             // Log response status and full response for debugging
//             console.log('Response Status:', response.status);
//             const data = await response.json();
//             console.log('Full Response:', data);

//             // Check if the response status is 201
//             if (response.ok && response.status === 201) {
//                 setLeaves(prevLeaves => [...prevLeaves, cleanedFormData]);
//                 setIsAddModalOpen(false);
//                 setFormData({
//                     leave_type: '',
//                     description: '',
//                     allocation_type: '',
//                     allocation: '',
//                     constraint_type: '',
//                     value: '',
//                     carry_forward: false,
//                     carry_forward_type: '',
//                     percentage: '',
//                     max_requests: ''
//                 });
//                 // Check if leaveTypeRef is valid before calling focus
//                 if (leaveTypeRef.current) {
//                     leaveTypeRef.current.focus();
//                 } else {
//                     console.error('leaveTypeRef is null');
//                 }
//                 const successMsg = data.message || "Leave type added successfully!";
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Success',
//                     text: successMsg,
//                     confirmButtonText: 'OK',
//                 }).then(() => {
//                     fetchLeaves();
//                 });
//             } else {
//                 // If response is not successful, show the error
//                 const errorMsg = data.message || 'Failed to add leave. Please try again.';
//                 console.error('Response Error:', errorMsg);
//                 setError(errorMsg);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: errorMsg,
//                     confirmButtonText: 'OK',
//                 });
//             }
//         } catch (error) {
//             // Catch any unexpected errors, such as network issues
//             const errorMsg = 'An error occurred while creating leave type. Please check the console for more details.';
//             console.error('Error occurred while adding leave:', error);
//             setError(errorMsg);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: errorMsg,
//                 confirmButtonText: 'OK',
//             });
//         }
//     };

//     const handleSubmitButton = () => {
//         if (formData.carry_forward) {
//             if (!formData.carry_forward_type || !formData.percentage) {
//                 setErrorMessage("Please provide both carry-forward type and percentage.");
//                 return; // Stop further execution
//             }
//         }
//         setErrorMessage("");
//         setIsAddModalOpen(false);
//         setCurrentStep(1);
//         handleFormReset();
//         handleSubmit();

//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//         validateField(name, value);
//     };

//     const nextStep = () => {
//         if (currentStep === 1) {
//             if (!formData.leave_type) {
//                 setErrors({ leave_type: "Leave Type is required." });
//                 return;
//             }
//         }
//         if (currentStep === 2) {
//             if (!formData.allocation_type) {
//                 setErrors({ allocation_type: "Allocation Type is required." });
//                 return;
//             }
//             if (!formData.allocation) {
//                 setErrors({ allocation: "Allocation is required." });
//                 return;
//             }
//         }
//         if (currentStep === 3) {
//             if (!formData.constraint_type) {
//                 setErrors({ constraint_type: "Constraint Type is required." });
//                 return;
//             }
//             if (!formData.value) {
//                 setErrors({ value: "Value is required." });
//                 return;
//             }
//         }
//         setErrors({});
//         setCurrentStep(currentStep + 1);
//     };

//     useEffect(() => {
//         fetchLeaves();
//     }, []);

//     const validateField = (name, value) => {
//         let error = '';

//         // Example validation
//         if (name === 'leave_type' && !value) {
//             error = 'Leave type is required';
//         }
//         setErrors({
//             ...errors,
//             [name]: error,
//         });
//     };

//     const getToken = () => {
//         const token = sessionStorage.getItem('token');
//         return token;
//     };
//     const token = getToken();

//     const prevStep = () => {
//         setCurrentStep(currentStep - 1);
//     };

//     const handleFormReset = () => {
//         setFormData({
//             leave_type: '',
//             description: '',
//             allocation_type: '',
//             allocation: '',
//             constraint_type: '',
//             value: '',
//             carry_forward: false,
//             carry_forward_type: '',
//             percentage: '',
//             max_requests: ''
//         });
//         setErrors(''); // Clear any error messages
//     };

//     const fetchLeaves = async () => {
//         const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage
//         try {
//             const response = await fetch('https://devapi.softtrails.net/hrms/test/leave/leave-types', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`, // Add token to the Authorization header
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch leaves');
//             }

//             const data = await response.json();
//             if (data.leave_types && Array.isArray(data.leave_types)) {
//                 // Sort the leave types alphabetically by the `leave_type` field
//                 const sortedLeaveTypes = data.leave_types.sort((a, b) =>
//                     a.leave_type.localeCompare(b.leave_type) // Case-insensitive alphabetical sort
//                 );
//                 setLeaves(sortedLeaveTypes);
//             } else {
//                 console.error('Fetched data is not in the expected format:', data);
//                 setLeaves([]);
//             }
//         } catch (error) {
//             console.error('Error fetching leaves:', error);
//             setLeaves([]);
//         }
//     };

//     const confirmDelete = (id) => {
//         setShowDeleteConfirm({ show: true, id });
//     };

//     const handleDelete = async () => {
//         const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage
//         try {
//             await axios.delete(`https://devapi.softtrails.net/hrms/test/leave/leave-types/${showDeleteConfirm.id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });
//             Swal.fire({
//                 icon: "success",
//                 title: "Deleted!",
//                 text: `Leave Type deleted successfully.`,
//                 confirmButtonColor: "#3085d6",
//             });
//             setShowDeleteConfirm({ show: false, id: null });
//             fetchLeaves(); // Refresh leave types list
//         } catch (error) {
//             console.error("Error deleting leave type:", error);

//             // If the error message contains "is still referenced from table"
//             if (error.response?.data?.details?.includes("is still referenced from table")) {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Cannot Delete",
//                     text: "This leave type is being used in leave requests and cannot be deleted.",
//                     confirmButtonColor: "#d33",
//                 });
//             } else {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Error",
//                     text: "Failed to delete leave type. Please try again later.",
//                     confirmButtonColor: "#d33",
//                 });
//             }
//         }
//     };

//     const handleLeaveClick = (leave) => {
//         setSelectedLeave(leave);
//         setIsPopupOpen(true);
//     };

//     const closePopup = () => {
//         setIsPopupOpen(false);
//         setSelectedLeave(null);
//     };

//     const renderStep = () => {
//         switch (currentStep) {
//             case 1:
//                 return (
//                     <>
//                         <div className="mb-4">
//                             <label htmlFor="leave_type">
//                                 Leave Type<span className='text-red-600'>*</span>
//                             </label>
//                             <input
//                                 ref={leaveTypeRef} // Attach ref to the leave_type input
//                                 type="text"
//                                 id="leave_type"
//                                 name="leave_type"
//                                 value={formData.leave_type}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.leave_type ? 'border-red-500' : ''}`}
//                                 placeholder="Enter Leave Type"
//                                 required
//                             />
//                             {errors.leave_type && (
//                                 <p className="text-red-500 text-sm">{errors.leave_type}</p> // Show the error message
//                             )}
//                         </div>
//                         <div className="mb-4">
//                             <label htmlFor="description">Description</label>
//                             <input
//                                 type="text"
//                                 id="description"
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.description ? 'border-red-500' : ''}`}
//                                 placeholder="Enter Description"
//                             />
//                         </div>
//                         {errors.description && <p className="text-red-500 text-[10px]">{errors.description}</p>}

//                     </>
//                 );
//             case 2:
//                 return (
//                     <>
//                         <div className="mb-4">
//                             <label htmlFor="allocation_type">Allocation Type<span className='text-red-600'>*</span></label>
//                             <select
//                                 id="allocation_type"
//                                 name="allocation_type"
//                                 value={formData.allocation_type}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.allocation_type ? 'border-red-500' : ''}`}
//                                 required
//                             >
//                                 <option value="">Select Allocation Type</option>
//                                 <option value="yearly">Yearly</option>
//                                 <option value="monthly">Monthly</option>
//                             </select>
//                             {errors.allocation_type && <p className="text-red-500 text-[10px]">{errors.allocation_type}</p>}

//                         </div>
//                         <div className="mb-4">
//                             <label htmlFor="allocation">Allocation<span className='text-red-600'>*</span></label>
//                             <input
//                                 type="number"
//                                 id="allocation"
//                                 name="allocation"
//                                 value={formData.allocation}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.allocation ? 'border-red-500' : ''}`}
//                                 placeholder="Enter Allocation"
//                                 required
//                                 min="0" // Ensure the value can't go below 0
//                             />
//                             {errors.allocation && <p className="text-red-500 text-[10px]">{errors.allocation}</p>}
//                         </div>

//                     </>
//                 );
//             case 3:
//                 return (
//                     <>
//                         <div className="mb-4">
//                             <label htmlFor="constraint_type" className="block text-sm font-medium text-gray-700">
//                                 Constraint Type <span className='text-red-600'>*</span>
//                             </label>
//                             <select
//                                 id="constraint_type"
//                                 name="constraint_type"
//                                 value={formData.constraint_type}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.constraint_type ? 'border-red-500' : ''}`}
//                                 required
//                             >
//                                 <option value="">Select Constraint Type</option>
//                                 <option value="min">Minimum</option>
//                                 <option value="max">Maximum</option>
//                             </select>
//                             {errors.constraint_type && <p className="text-red-500 text-[10px]">{errors.constraint_type}</p>}
//                         </div>
//                         <div className="mb-4">
//                             <label htmlFor="value" className="block text-sm font-medium text-gray-700">
//                                 Value<span className='text-red-600'>*</span>
//                             </label>
//                             <input
//                                 type="number"
//                                 id="value"
//                                 name="value"
//                                 value={formData.value}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 rounded-md p-2 ${errors.value ? 'border-red-500' : ''}`}
//                                 placeholder="Enter Allocation"
//                                 required
//                                 min="0"
//                             />
//                             {errors.value && <p className="text-red-500 text-[10px]">{errors.value}</p>}
//                         </div>
//                     </>
//                 );
//             case 4:
//                 return (
//                     <>
//                         <div className="mb-4">
//                             <label htmlFor="max_requests">
//                                 Set max. trenches of leave request you can apply according to allocation type{' '}
//                                 <span className={'text-red-500'}>*</span>
//                             </label>
//                             <input
//                                 type="number"
//                                 id="max_requests"
//                                 name="max_requests"
//                                 value={formData.max_requests}
//                                 onChange={handleChange}
//                                 className={`w-full border border-gray-300 text-[14px] rounded-md p-2 ${errors.max_requests ? 'border-red-500' : ''}`}
//                                 placeholder="Enter Requests"
//                                 min="0"
//                             />
//                             {errors.max_requests && <p className="text-red-500 text-xs mt-1">{errors.max_requests}</p>}
//                         </div>
//                     </>
//                 );
//             case 5:
//                 return (
//                     <>
//                         <div className="mb-4">
//                             <label>Carry Forward <span className='text-red-600'>*</span></label>
//                             <select
//                                 id="carry_forward"
//                                 name="carry_forward"
//                                 value={formData.carry_forward}
//                                 onChange={handleChange}
//                                 className="w-full border border-gray-300 rounded-md p-2"
//                                 required
//                             >
//                                 <option value="">Select</option>
//                                 <option value="true">Yes</option>
//                                 <option value="false">No</option>
//                             </select>
//                         </div>
//                         {errors.carry_forward && <p className="text-red-500 text-[10px]">{errors.carry_forward}</p>}

//                         {formData.carry_forward === 'true' && (
//                             <>
//                                 <div className="mb-4">
//                                     <label htmlFor="carry_forward_type">Carry Forward Type<span className='text-red-600'>*</span></label>
//                                     <select
//                                         id="carry_forward_type"
//                                         name="carry_forward_type"
//                                         value={formData.carry_forward_type}
//                                         onChange={handleChange}
//                                         className="w-full border border-gray-300 rounded-md p-2"
//                                         required
//                                     >
//                                         <option value="">Select Type</option>
//                                         <option value="Percentage">Percentage</option>
//                                         <option value="Value">Value</option>
//                                     </select>
//                                 </div>
//                                 {errors.carry_forward_type && <p className="text-red-500 text-[10px]">{errors.carry_forward_type}</p>}

//                                 <div className="mb-4">
//                                     <label htmlFor="percentage">Carry Forward Value<span className='text-red-600'>*</span></label>
//                                     <input
//                                         type="number"
//                                         id="percentage"
//                                         name="percentage"
//                                         value={formData.percentage}
//                                         onChange={handleChange}
//                                         className="w-full border border-gray-300 rounded-md p-2"
//                                         placeholder="Enter Value"
//                                         min="0"
//                                         required
//                                     />
//                                 </div>
//                                 {errors.percentage && <p className="text-red-500 text-[10px]">{errors.percentage}</p>}

//                             </>
//                         )}
//                     </>
//                 );
//             default:
//                 return null;
//         }
//     };

//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 25;

//     const handleSearch = (event) => {
//         setSearchTerm(event.target.value);
//         setCurrentPage(1); // Reset to the first page on a new search
//     };

//     const filteredLeaves = leaves.filter(
//         (leave) =>
//             leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             leave.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             leave.allocation_type?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
//     const paginatedLeaves = filteredLeaves.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     /////////////////////EDIT SUBMIT//////////////////
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editData, setEditData] = useState(null);

//     const validateForm = (data) => {
//         const validationErrors = {};

//         if (!data.leave_type || data.leave_type.trim() === '') {
//             validationErrors.leave_type = 'Leave type is required';
//         }

//         // Add other field validations here if needed, like:
//         // if (!data.start_date) validationErrors.start_date = 'Start date is required';
//         // if (!data.end_date) validationErrors.end_date = 'End date is required';

//         return validationErrors;
//     };

//     const handleEditSubmit = async () => {
//         const validationErrors = validateForm(formData); // ✅ validate entire form
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors); // show validation messages
//             return;
//         }

//         try {
//             const token = sessionStorage.getItem('token'); // 🔑 get token from sessionStorage

//             const response = await fetch(`https://devapi.softtrails.net/hrms/test/leave/leave-types/${editData.id}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`, // 🔐 add token to Authorization header
//                 },
//                 body: JSON.stringify(formData),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to update leave');
//             }

//             setIsEditModalOpen(false);
//             setEditData(null);
//             handleFormReset();
//             fetchLeaves();
//         } catch (error) {
//             console.error('Update error:', error);
//             setErrorMessage("Something went wrong while updating.");
//         }
//     };

//     const handleEditClick = (leave) => {
//         setEditData(leave); // populate the data to be edited
//         setFormData(leave); // reusing the formData for editing
//         setCurrentStep(1);  // reset to first step
//         setIsEditModalOpen(true);
//     };

//     return (
//         <div className=' w-full'>
//             <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-3">
//                 <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Create Leave</AddButton>
//                 <div className="flex-grow"><SearchButton value={searchTerm} onChange={handleSearch} /></div>
//             </div>

//             {/* Add Modal */}
//             {isAddModalOpen && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white rounded-lg p-4 w-96">
//                         <div className="flex justify-end">
//                             <button
//                                 type="button"
//                                 className="text-black font-bold text-xl"
//                                 onClick={() => {
//                                     setIsAddModalOpen(false);
//                                     handleFormReset();
//                                 }}
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <h2 className="text-lg font-bold">Create Leave </h2>
//                         <form onSubmit={(e) => e.preventDefault()}>
//                             {renderStep()}
//                             {/* Error message */}
//                             {errorMessage && (
//                                 <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
//                             )}
//                             <div className="flex justify-between mt-4">
//                                 {/* Hide Previous button in step 1 */}
//                                 {currentStep > 1 && (
//                                     <button
//                                         type="button"
//                                         onClick={prevStep}
//                                         className="bg-gray-300 px-4 py-2 rounded">
//                                         Previous
//                                     </button>
//                                 )}
//                                 {currentStep < 5 ? (
//                                     <button
//                                         type="button" // Ensure this is a button type
//                                         className="bg-blue-500 text-white px-4 py-2 rounded"
//                                         onClick={nextStep}
//                                     >
//                                         Next
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="submit"
//                                         className="bg-green-500 text-white px-4 py-2 rounded"
//                                         onClick={handleSubmitButton}
//                                     >
//                                         Submit
//                                     </button>
//                                 )}
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Edit Modal */}
//             {isEditModalOpen && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white rounded-lg p-4 w-96">
//                         <div className="flex justify-end">
//                             <button
//                                 type="button"
//                                 className="text-black font-bold text-xl"
//                                 onClick={() => {
//                                     setIsEditModalOpen(false);
//                                     handleFormReset();
//                                 }}
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         <h2 className="text-lg font-bold">Edit Leave</h2>
//                         <form onSubmit={(e) => e.preventDefault()}>
//                             {renderStep()}
//                             {errorMessage && (
//                                 <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
//                             )}
//                             <div className="flex justify-between mt-4">
//                                 {currentStep > 1 && (
//                                     <button
//                                         type="button"
//                                         onClick={prevStep}
//                                         className="bg-gray-300 px-4 py-2 rounded"
//                                     >
//                                         Previous
//                                     </button>
//                                 )}
//                                 {currentStep < 5 ? (
//                                     <button
//                                         type="button"
//                                         className="bg-blue-500 text-white px-4 py-2 rounded"
//                                         onClick={nextStep}
//                                     >
//                                         Next
//                                     </button>
//                                 ) : (
//                                     <button
//                                         type="submit"
//                                         className="bg-green-500 text-white px-4 py-2 rounded"
//                                         onClick={handleEditSubmit}
//                                     >
//                                         Update
//                                     </button>
//                                 )}
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Leaves Table */}
//             <div className="overflow-x-auto max-h-96 rounded-lg">
//                 <div className="relative w-full bg-white rounded-lg overflow-hidden">
//                     <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
//                         <table className="min-w-full table-auto border-collapse text-sm">
//                             <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
//                                 <tr>
//                                     <th className="p-5 text-left text-black">S.No</th>
//                                     <th className="p-5 text-left text-black">Leave Type</th>
//                                     <th className="p-5 text-left text-black">Description</th>
//                                     <th className="p-5 text-left text-black">Allocation Type</th>
//                                     <th className="p-5 text-left text-black">Allocation </th>
//                                     <th className="p-5 text-left text-black">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
//                                 {paginatedLeaves.map((leave, index) => (
//                                     <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
//                                         <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                                         <td className="px-5 py-4 text-left text-[14px] text-custome-blue underline cursor-pointer" onClick={() => handleLeaveClick(leave)}>{leave.leave_type}</td>
//                                         <td className="px-5 py-4 text-left text-[14px] text-black">{leave.description || "NA"}</td>
//                                         <td className="px-5 py-4 text-left text-[14px] text-black">{leave.allocation_type === 'monthly' ? 'Monthly' : leave.allocation_type === 'yearly' ? 'Yearly' : leave.allocation_type}</td>
//                                         <td className="px-5 py-4 text-left text-[14px] text-black">{leave.allocation}</td>
//                                         <td className="py-4 px-4 border-b space-x-2">
//                                             <button onClick={() => confirmDelete(leave.id)} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
//                                             <button onClick={() => handleEditClick(leave)} className="text-blue-500 underline"><FontAwesomeIcon icon={faEdit} /></button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/*****************PAGINATION*****************/}
//                 <div className="sticky bottom-0 left-0 w-full border-t border-gray-300 z-10 flex justify-center items-center gap-2 px-4 py-2">
//                     {/* Previous Button */}
//                     <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         &lt;
//                     </button>

//                     {/* Page Info */}
//                     <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
//                     <span>of</span>
//                     <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
//                         {totalPages}
//                     </span>

//                     {/* Next Button */}
//                     <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         &gt;
//                     </button>
//                 </div>
//             </div>

//             {/* Popup for Leave Details */}
//             {isPopupOpen && selectedLeave && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
//                         {/* Header */}
//                         <div className="flex justify-between items-center border-b pb-4 mb-4">
//                             <h2 className="text-2xl font-bold text-gray-800">Leave Type Details</h2>
//                             <button
//                                 onClick={closePopup}
//                                 className="text-gray-600 hover:text-gray-900 transition duration-200"
//                             >
//                                 ✖
//                             </button>
//                         </div>

//                         {/* Content */}
//                         <div className="grid grid-cols-2 gap-4 text-gray-700">
//                             <p><strong>Leave Type:</strong></p>
//                             <p>{selectedLeave.leave_type}</p>

//                             <p><strong>Description:</strong></p>
//                             <p>{selectedLeave.description || 'NA'}</p>

//                             <p><strong>Allocation Type:</strong></p>
//                             <p>
//                                 {selectedLeave.allocation_type === "monthly"
//                                     ? "Monthly"
//                                     : selectedLeave.allocation_type === "yearly"
//                                         ? "Yearly"
//                                         : selectedLeave.allocation_type}
//                             </p>
//                             <p><strong>Allocation:</strong></p>
//                             <p>{selectedLeave.allocation}</p>

//                             <p><strong>Constraint Type:</strong></p>
//                             <p> {selectedLeave.constraint_type === "min"
//                                 ? "Minimum"
//                                 : selectedLeave.constraint_type === "max"
//                                     ? "Maximum"
//                                     : selectedLeave.constraint_type}
//                             </p>

//                             <p><strong>Value:</strong></p>
//                             <p>{selectedLeave.value}</p>

//                             <p><strong>Maximum Requests:</strong></p>
//                             <p>{selectedLeave.max_requests || "NA"}</p>

//                             <p><strong>Carry Forward:</strong></p>
//                             <p>{selectedLeave.carry_forward ? "Yes" : "No"}</p>

//                             <p><strong>Carry Forward Type:</strong></p>
//                             <p>{selectedLeave.carry_forward_type || 'NA'}</p>

//                             <p><strong>Percentage:</strong></p>
//                             <p>{selectedLeave.percentage || "NA"}</p>
//                         </div>
//                         <div className="flex justify-end mt-6">
//                             <button
//                                 onClick={closePopup}
//                                 className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Confirmation Popup */}
//             {showDeleteConfirm.show && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white p-6 rounded-md shadow-lg w-96">
//                         <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
//                         <p>Are you sure you want to delete this leave type?</p>
//                         <div className="flex justify-between mt-4">
//                             <button
//                                 onClick={() => setShowDeleteConfirm({ show: false, id: null })}
//                                 className="bg-gray-300 px-4 py-2 rounded"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDelete}
//                                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
// export default LeaveManagement;

/////////////////////////////////////////
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
// import Swal from 'sweetalert2';
// import AddButton from "../../NewComponents/AddButton";
// import { FaPlus } from "react-icons/fa";
// import SearchButton from "../../NewComponents/SearchButton";

// const LeaveManagement = () => {
//     const [leaves, setLeaves] = useState([]);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, id: null });

//     useEffect(() => {
//         fetchLeaves();
//     }, []);

//     const fetchLeaves = async () => {
//         const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage
//         try {
//             const response = await fetch('https://devapi.softtrails.net/hrms/test/leave/leave-types', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`, // Add token to the Authorization header
//                     'Content-Type': 'application/json',
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch leaves');
//             }

//             const data = await response.json();
//             if (data.leave_types && Array.isArray(data.leave_types)) {
//                 const sortedLeaveTypes = data.leave_types.sort((a, b) =>
//                     a.leave_type.localeCompare(b.leave_type) 
//                 );
//                 setLeaves(sortedLeaveTypes);
//             } else {
//                 console.error('Fetched data is not in the expected format:', data);
//                 setLeaves([]);
//             }
//         } catch (error) {
//             console.error('Error fetching leaves:', error);
//             setLeaves([]);
//         }
//     };

//     const confirmDelete = (id) => {
//         setShowDeleteConfirm({ show: true, id });
//     };

//     const handleDelete = async () => {
//         const token = sessionStorage.getItem('token'); // Retrieve token from sessionStorage
//         try {
//             await axios.delete(`https://devapi.softtrails.net/hrms/test/leave/leave-types/${showDeleteConfirm.id}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });
//             Swal.fire({
//                 icon: "success",
//                 title: "Deleted!",
//                 text: `Leave Type deleted successfully.`,
//                 confirmButtonColor: "#3085d6",
//             });
//             setShowDeleteConfirm({ show: false, id: null });
//             fetchLeaves(); // Refresh leave types list
//         } catch (error) {
//             console.error("Error deleting leave type:", error);

//             // If the error message contains "is still referenced from table"
//             if (error.response?.data?.details?.includes("is still referenced from table")) {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Cannot Delete",
//                     text: "This leave type is being used in leave requests and cannot be deleted.",
//                     confirmButtonColor: "#d33",
//                 });
//             } else {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Error",
//                     text: "Failed to delete leave type. Please try again later.",
//                     confirmButtonColor: "#d33",
//                 });
//             }
//         }
//     };

//     const [searchTerm, setSearchTerm] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 25;

//     const handleSearch = (event) => {
//         setSearchTerm(event.target.value);
//         setCurrentPage(1); 
//     };

//     const filteredLeaves = leaves.filter(
//         (leave) =>
//             leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             leave.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             leave.allocation_type?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
//     const paginatedLeaves = filteredLeaves.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );

//     const handlePageChange = (page) => {
//         setCurrentPage(page);
//     };

//     //////////////////////////////Add Leave//////////////////////////////
//     const [newLeave, setNewLeave] = useState({
//         leave_type: "",
//         policy_id: "",
//         category_id: "",
//         description: "",
//     });
//     const [policies, setPolicies] = useState([]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setNewLeave((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleAddLeave = async (e) => {
//         e.preventDefault();
//         const token = sessionStorage.getItem("token");

//         try {
//             await axios.post("https://devapi.softtrails.net/hrms/test/leave/leave-types", newLeave, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });

//             Swal.fire({
//                 icon: "success",
//                 title: "Success",
//                 text: "Leave created successfully!",
//             });

//             setIsAddModalOpen(false);
//             setNewLeave({
//                 leave_type: "",
//                 policy_id: "",
//                 category_id: "",
//                 description: "",
//             });
//             fetchLeaves(); // optional: refresh your leave list
//         } catch (error) {
//             console.error("Error creating leave:", error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Error",
//                 text: "Failed to create leave. Please try again.",
//             });
//         }
//     };

//     const fetchPolicies = async () => {
//         const token = sessionStorage.getItem("token");
//         try {
//             const response = await axios.get("https://devapi.softtrails.net/hrms/test/leave/policies", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             });
//             setPolicies(response.data?.policies || []);
//         } catch (error) {
//             console.error("Error fetching policies:", error);
//         }
//     };

//     useEffect(() => {
//         if (isAddModalOpen) {
//             fetchPolicies();
//         }
//     }, [isAddModalOpen]);

//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchCategories = async () => {
//         try {
//             const response = await axios.get("https://devapi.softtrails.net/saas/test/user-category/all");
//             if (response.data.success) {
//                 const activeCategories = response.data.data.filter(
//                     (cat) => cat.status.toLowerCase() === "active"
//                 );
//                 setCategories(activeCategories);
//             } else {
//                 setCategories([]);
//             }
//         } catch (error) {
//             console.error("Failed to fetch categories:", error);
//             setCategories([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCategories();
//     }, []);


//     return (
//         <div className=' w-full'>
//             <div className="flex flex-wrap items-center justify-between gap-4 mt-4 mb-3">
//                 <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Create Leave</AddButton>
//                 <div className="flex-grow"><SearchButton value={searchTerm} onChange={handleSearch} /></div>
//             </div>

//             {isAddModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
//                         <h2 className="text-xl font-semibold mb-4">Create Leave</h2>

//                         <form onSubmit={handleAddLeave}>
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">Leave Type<span className='text-red-500'>*</span></label>
//                                 <input
//                                     type="text"
//                                     name="leave_type"
//                                     value={newLeave.leave_type}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 />
//                             </div>

//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">Policy</label>
//                                 <select
//                                     name="policy_id"
//                                     value={newLeave.policy_id}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 >
//                                     <option value="">Select Policy</option>
//                                     {policies.map((policy) => (
//                                         <option key={policy.id} value={policy.id}>
//                                             {policy.policy_name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Category <span className='text-red-500'>*</span>
//                                 </label>
//                                 <select
//                                     name="category_id"
//                                     value={newLeave.category_id}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 >
//                                     <option value="">Select Category</option>
//                                     {categories
//                                         .filter((cat) => cat.status === "active")
//                                         .map((cat) => (
//                                             <option key={cat.category_id} value={cat.category_id}>
//                                                 {cat.category}
//                                             </option>
//                                         ))}
//                                 </select>
//                             </div>

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium mb-1">Description</label>
//                                 <textarea
//                                     name="description"
//                                     value={newLeave.description}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     rows={3}
//                                 />
//                             </div>

//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsAddModalOpen(false)}
//                                     className="bg-gray-300 px-4 py-2 rounded"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                                 >
//                                     Submit
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Leaves Table */}
//             <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
//                 <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//                     <table className="min-w-full table-auto border-collapse text-sm">
//                         <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
//                             <tr>
//                                 <th className="p-5 text-left text-black">S.No</th>
//                                 <th className="p-5 text-left text-black">Leave Type</th>
//                                 <th className="p-5 text-left text-black">Description</th>
//                                 <th className="p-5 text-left text-black">Policy Name</th>
//                                 <th className="p-5 text-left text-black">Category</th>
//                                 <th className="p-5 text-left text-black">Status</th>
//                                 <th className="p-5 text-left text-black">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
//                             {paginatedLeaves.map((leave, index) => (
//                                 <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type}</td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{leave.description || "NA"}</td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{leave.policy_id}</td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{leave.category_id}</td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{leave.status}</td>
//                                     <td className="py-4 px-4 border-b space-x-2">
//                                         <button onClick={() => confirmDelete(leave.id)} className="text-red-600"><FontAwesomeIcon icon={faTrash} /></button>
//                                         {/* <button onClick={() => handleEditClick(leave)} className="text-blue-500 underline"><FontAwesomeIcon icon={faEdit} /></button> */}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/*****************PAGINATION*****************/}
//                 <div className="sticky bottom-0 left-0 w-full border-t border-gray-300 z-10 flex justify-center items-center gap-2 px-4 py-2">
//                     {/* Previous Button */}
//                     <button
//                         onClick={() => handlePageChange(currentPage - 1)}
//                         disabled={currentPage === 1}
//                         className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         &lt;
//                     </button>

//                     {/* Page Info */}
//                     <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
//                     <span>of</span>
//                     <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
//                         {totalPages}
//                     </span>

//                     {/* Next Button */}
//                     <button
//                         onClick={() => handlePageChange(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                         className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         &gt;
//                     </button>
//                 </div>
//             </div>

//             {/* Delete Confirmation Popup */}
//             {showDeleteConfirm.show && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                     <div className="bg-white p-6 rounded-md shadow-lg w-96">
//                         <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
//                         <p>Are you sure you want to delete this leave type?</p>
//                         <div className="flex justify-between mt-4">
//                             <button
//                                 onClick={() => setShowDeleteConfirm({ show: false, id: null })}
//                                 className="bg-gray-300 px-4 py-2 rounded"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDelete}
//                                 className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
// export default LeaveManagement;

////////////////////////////////////////
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import Pagination from "../../NewComponents/Pagination";
// import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
// import MessageModal from "../../NewComponents/MessageModal";
// import MultiSelectDropdown from "../../NewComponents/MultiSelectDropdown";
// import { FaPlus } from 'react-icons/fa';
// import AddButton from "../../NewComponents/AddButton";

// const AllLeave = () => {
//     const [policies, setPolicies] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [leaves, setLeaves] = useState([]);

//     // Modal states
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

//     // Success/Error Message Modal
//     const [message, setMessage] = useState("");
//     const [messageType, setMessageType] = useState("success");

//     const [newLeave, setNewLeave] = useState({
//         leave_type: "",
//         policy_id: "",
//         description: "",
//         category_ids: [],
//     });

//     // Pagination
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 25;
//     const totalPages = Math.ceil(leaves.length / itemsPerPage);
//     const paginatedLeaves = leaves.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );
//     const token = sessionStorage.getItem("token");

//     const fetchPolicies = async () => {
//         try {
//             const res = await axios.get("https://devapi.softtrails.net/hrms/test/leave/", {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setPolicies(res.data.data || []);
//         } catch (err) {
//             console.error("Error fetching policies", err);
//         }
//     };

//     const fetchCategories = async () => {
//         try {
//             const res = await axios.get("https://devapi.softtrails.net/saas/test/user-category/all", {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setCategories(res.data.data || []);
//         } catch (err) {
//             console.error("Error fetching categories", err);
//         }
//     };

//     const fetchLeaves = async () => {
//         try {
//             const res = await axios.get("https://devapi.softtrails.net/hrms/test/leave/leave-types", {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setLeaves(res.data.leave_types || []);
//         } catch (err) {
//             console.error("Error fetching leave types", err);
//         }
//     };

//     useEffect(() => {
//         fetchPolicies();
//         fetchCategories();
//         fetchLeaves();
//     }, []);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         // For multi-select category
//         if (name === "category_ids") {
//             const selectedOptions = Array.from(
//                 e.target.selectedOptions,
//                 (option) => parseInt(option.value)
//             );
//             setNewLeave((prev) => ({ ...prev, category_ids: selectedOptions }));
//         } else {
//             setNewLeave((prev) => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleAddLeave = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post(
//                 "https://devapi.softtrails.net/hrms/test/leave/leave-types",
//                 newLeave,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setIsAddModalOpen(false);
//             setNewLeave({
//                 leave_type: "",
//                 policy_id: "",
//                 description: "",
//                 category_ids: [],
//             });
//             fetchLeaves();
//             setMessage("Leave created successfully!");
//             setMessageType("success");
//         } catch (err) {
//             console.error("Error adding leave", err);
//             const errorMsg =
//                 err.response?.data?.message || err.response?.data?.error || err.message;

//             setMessage(errorMsg);
//             setMessageType("error");
//         }
//     };

//     const confirmDelete = async () => {
//         try {
//             await axios.delete(
//                 `https://devapi.softtrails.net/hrms/test/leave/leave-types/${showDeleteConfirm.id}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setShowDeleteConfirm(null);
//             fetchLeaves();
//             setMessage("Leave deleted successfully!");
//             setMessageType("success");
//         } catch (err) {
//             console.error("Error deleting leave", err);
//             setMessage("Failed to delete leave.");
//             setMessageType("error");
//         }
//     };

//     ///////////// Edit Code ////////////////////
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editLeave, setEditLeave] = useState(null);

//     const handleEditInputChange = (e) => {
//         const { name, value } = e.target;
//         setEditLeave((prev) => ({ ...prev, [name]: value }));
//     };

//     const openEditModal = (leave) => {
//         setEditLeave({
//             ...leave,
//             status: leave.status ? "true" : "false",
//         });
//         setIsEditModalOpen(true);
//     };

//     const handleEditLeave = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.put(
//                 `https://devapi.softtrails.net/hrms/test/leave/leave-types/${editLeave.id}`,
//                 {
//                     ...editLeave,
//                     status: editLeave.status === "true", // convert back to boolean
//                 },
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setIsEditModalOpen(false);
//             setEditLeave(null);
//             fetchLeaves();
//             setMessage("Leave updated successfully. Changes will apply in the next allocation cycle.");
//             setMessageType("success");
//         } catch (err) {
//             console.error("Error updating leave", err);
//             const errorMsg = err.response?.data?.message || "Failed to update leave.";
//             setMessage(errorMsg);
//             setMessageType("error");
//         }
//     };
//     ///////////// End Edit Code ////////////////////

//     return (
//         <div className="w-full">
//             {/* Add Leave Button */}
//             <div className="justify-between flex mb-3 mt-4">
//                 <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Create Leave</AddButton>
//             </div>

//             {/* Add Leave Modal */}
//             {isAddModalOpen && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
//                         <h2 className="text-xl font-semibold mb-4">Create Leave</h2>

//                         <form onSubmit={handleAddLeave}>
//                             {/* Leave Type */}
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Leave Type<span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="leave_type"
//                                     value={newLeave.leave_type}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 />
//                             </div>

//                             {/* Policy */}
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Policy<span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     name="policy_id"
//                                     value={newLeave.policy_id}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 >
//                                     <option value="">Select Policy</option>
//                                     {policies.map((policy) => (
//                                         <option key={policy.id} value={policy.id}>
//                                             {policy.policy_name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Category (Multi-select Dropdown) */}
//                             <MultiSelectDropdown
//                                 label="Category"
//                                 required
//                                 options={categories
//                                     .filter((cat) => cat.status === "active")
//                                     .map((cat) => ({
//                                         value: cat.category_id,
//                                         label: cat.category,
//                                     }))}
//                                 selected={newLeave.category_ids}
//                                 onChange={(val) => setNewLeave({ ...newLeave, category_ids: val })}
//                             />

//                             {/* Description */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     name="description"
//                                     value={newLeave.description}
//                                     onChange={handleInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     rows={3}
//                                 />
//                             </div>

//                             {/* Buttons */}
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsAddModalOpen(false)}
//                                     className="bg-gray-300 px-4 py-2 rounded"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                                 >
//                                     Submit
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Leave Table */}
//             <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
//                 <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//                     <table className="min-w-full table-auto border-collapse text-sm">
//                         <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
//                             <tr>
//                                 <th className="p-5 text-left text-black">S.No</th>
//                                 <th className="p-5 text-left text-black">Leave Type</th>
//                                 <th className="p-5 text-left text-black">Description</th>
//                                 <th className="p-5 text-left text-black">Policy</th>
//                                 <th className="p-5 text-left text-black">Categories</th>
//                                 <th className="p-5 text-left text-black">Status</th>
//                                 <th className="p-5 text-left text-black">Date</th>
//                                 <th className="p-5 text-left text-black">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {paginatedLeaves.map((leave, index) => (
//                                 <tr key={leave.id} className={`${index % 2 === 0 ? "bg-tableblue" : "bg-white"}`} >
//                                     <td className="px-5 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                                     <td className="px-5 py-4">{leave.leave_type}</td>
//                                     <td className="px-5 py-4">{leave.description || "NA"}</td>
//                                     <td className="px-5 py-4">{policies.find((p) => p.id === leave.policy_id)?.policy_name || leave.policy_id}</td>
//                                     <td className="px-5 py-4">{leave.category_ids && leave.category_ids.length > 0 ? leave.category_ids.map((id) => categories.find((c) => c.category_id === id)?.category || id).join(", ") : "NA"}</td>
//                                     <td className="px-5 py-4"><span className={`px-3 py-1 font-medium ${leave.status ? " text-green-600" : " text-red-600"}`} >{leave.status ? "Active" : "Inactive"}</span></td>
//                                     <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.created_at).toLocaleDateString("en-GB")}</td>
//                                     <td className="px-5 py-4">
//                                         <button onClick={() => openEditModal(leave)} className="text-blue-600" > <FontAwesomeIcon icon={faEdit} /></button>
//                                         <button onClick={() => setShowDeleteConfirm(leave)} className="text-red-600" > <FontAwesomeIcon icon={faTrash} /> </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 {/* Pagination */}
//                 <Pagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     onPageChange={setCurrentPage}
//                 />
//             </div>

//             {/* Delete Confirmation Modal */}
//             <DeleteConfirmModal
//                 open={!!showDeleteConfirm}
//                 onCancel={() => setShowDeleteConfirm(null)}
//                 onConfirm={confirmDelete}
//                 title="Delete Leave?"
//                 message={`Are you sure you want to delete "${showDeleteConfirm?.leave_type}"?`}
//             />

//             {isEditModalOpen && editLeave && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
//                         <h2 className="text-xl font-semibold mb-4">Edit Leave</h2>

//                         <form onSubmit={handleEditLeave}>
//                             {/* Leave Type */}
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Leave Type<span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="leave_type"
//                                     value={editLeave.leave_type}
//                                     onChange={handleEditInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 />
//                             </div>

//                             {/* Policy */}
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Policy<span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     name="policy_id"
//                                     value={editLeave.policy_id}
//                                     onChange={handleEditInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 >
//                                     <option value="">Select Policy</option>
//                                     {policies.map((policy) => (
//                                         <option key={policy.id} value={policy.id}>
//                                             {policy.policy_name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Category */}
//                             <MultiSelectDropdown
//                                 label="Category"
//                                 required
//                                 options={categories
//                                     .filter((cat) => cat.status === "active")
//                                     .map((cat) => ({
//                                         value: cat.category_id,
//                                         label: cat.category,
//                                     }))}
//                                 selected={editLeave.category_ids}
//                                 onChange={(val) => setEditLeave({ ...editLeave, category_ids: val })}
//                             />

//                             {/* Description */}
//                             <div className="mb-3">
//                                 <label className="block text-sm font-medium mb-1">Description</label>
//                                 <textarea
//                                     name="description"
//                                     value={editLeave.description}
//                                     onChange={handleEditInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     rows={3}
//                                 />
//                             </div>

//                             {/* Status */}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium mb-1">
//                                     Status<span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     name="status"
//                                     value={editLeave.status}
//                                     onChange={handleEditInputChange}
//                                     className="w-full border border-gray-300 rounded-md p-2"
//                                     required
//                                 >
//                                     <option value="true">Active</option>
//                                     <option value="false">Inactive</option>
//                                 </select>
//                             </div>

//                             {/* Buttons */}
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsEditModalOpen(false)}
//                                     className="bg-gray-300 px-4 py-2 rounded"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                                 >
//                                     Update
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Message Modal */}
//             <MessageModal message={message} type={messageType} setMessage={setMessage} />
//         </div>
//     );
// };
// export default AllLeave;



///////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import axios from "axios";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "../../NewComponents/Pagination";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import MessageModal from "../../NewComponents/MessageModal";
import MultiSelectDropdown from "../../NewComponents/MultiSelectDropdown";
import { FaPlus } from 'react-icons/fa';
import AddButton from "../../NewComponents/AddButton";

const AllLeave = () => {
    const [policies, setPolicies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Success/Error Message Modal
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [newLeave, setNewLeave] = useState({
        leave_type: "",
        policy_id: "",
        description: "",
        category_ids: [],
        department_ids: [], // ✅ added
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const totalPages = Math.ceil(leaves.length / itemsPerPage);
    const paginatedLeaves = leaves.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const token = sessionStorage.getItem("token");

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("https://devapi.softtrails.net/saas/test/departments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const activeDepts = res.data.filter(
                (d) => d.status?.toLowerCase() === "active"
            );
            setDepartments(activeDepts);
        } catch (err) {
            console.error("Error fetching departments", err);
        }
    };

    const fetchPolicies = async () => {
        try {
            const res = await axios.get("https://devapi.softtrails.net/hrms/test/leave/get-policy", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPolicies(res.data.data || []);
        } catch (err) {
            console.error("Error fetching policies", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("https://devapi.softtrails.net/saas/test/user-category/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data.data || []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await axios.get("https://devapi.softtrails.net/hrms/test/leave/all-leave-types", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaves(res.data.leave_types || []);
        } catch (err) {
            console.error("Error fetching leave types", err);
        }
    };

    useEffect(() => {
        fetchPolicies();
        fetchCategories();
        fetchLeaves();
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // For multi-select category
        if (name === "category_ids") {
            const selectedOptions = Array.from(
                e.target.selectedOptions,
                (option) => parseInt(option.value)
            );
            setNewLeave((prev) => ({ ...prev, category_ids: selectedOptions }));
        } else {
            setNewLeave((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "https://devapi.softtrails.net/hrms/test/leave/leave-types",
                newLeave,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setIsAddModalOpen(false);
            setNewLeave({
                leave_type: "",
                policy_id: "",
                description: "",
                category_ids: [],
            });
            fetchLeaves();
            setMessage("Leave created successfully!");
            setMessageType("success");
        } catch (err) {
            console.error("Error adding leave", err);
            const errorMsg =
                err.response?.data?.message || err.response?.data?.error || err.message;

            setMessage(errorMsg);
            setMessageType("error");
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(
                `https://devapi.softtrails.net/hrms/test/leave/leave-types/${showDeleteConfirm.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setShowDeleteConfirm(null);
            fetchLeaves();
            setMessage("Leave deleted successfully!");
            setMessageType("success");
        } catch (err) {
            console.error("Error deleting leave", err);
            setMessage("Failed to delete leave.");
            setMessageType("error");
        }
    };

    ///////////// Edit Code ////////////////////
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLeave, setEditLeave] = useState(null);

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditLeave((prev) => ({ ...prev, [name]: value }));
    };

    const openEditModal = (leave) => {
        setEditLeave({
            ...leave,
            status: leave.status ? "true" : "false",
        });
        setIsEditModalOpen(true);
    };

    // ✅ Department selection handler
    // For Add Modal
    // const handleDepartmentChange = (selected) => {
    //     // If "All Departments" selected
    //     if (selected.includes("all")) {
    //         const allDeptIds = departments.map((d) => d.dept_id);
    //         setNewLeave((prev) => ({ ...prev, department_ids: allDeptIds }));
    //     } else {
    //         setNewLeave((prev) => ({ ...prev, department_ids: selected }));
    //     }
    // };

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleDepartmentChange = (selected) => {
        if (selected.includes("all")) {
            const allDeptIds = departments.map((d) => d.dept_id);
            setNewLeave((prev) => ({ ...prev, department_ids: allDeptIds }));
        } else {
            setNewLeave((prev) => ({ ...prev, department_ids: selected }));
        }
    };

    const openDetailsModal = (leave) => {
        setSelectedLeave(leave);
        setIsDetailsModalOpen(true);
    };


    // For Edit Modal
    const handleEditDepartmentChange = (selected) => {
        if (selected.includes("all")) {
            const allDeptIds = departments.map((d) => d.dept_id);
            setEditLeave((prev) => ({ ...prev, department_ids: allDeptIds }));
        } else {
            setEditLeave((prev) => ({ ...prev, department_ids: selected }));
        }
    };

    const handleEditLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `https://devapi.softtrails.net/hrms/test/leave/leave-types/${editLeave.id}`,
                {
                    ...editLeave,
                    status: editLeave.status === "true", // convert back to boolean
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setIsEditModalOpen(false);
            setEditLeave(null);
            fetchLeaves();
            setMessage("Leave updated successfully. Changes will apply in the next allocation cycle.");
            setMessageType("success");
        } catch (err) {
            console.error("Error updating leave", err);
            const errorMsg = err.response?.data?.message || "Failed to update leave.";
            setMessage(errorMsg);
            setMessageType("error");
        }
    };
    ///////////// End Edit Code ////////////////////

    return (
        <div className="w-full">
            {/* Add Leave Button */}
            <div className="justify-between flex mb-3 mt-4">
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Create Leave</AddButton>
            </div>

            {/* Add Leave Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create Leave</h2>

                        <form onSubmit={handleAddLeave}>
                            {/* Leave Type */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Leave Type<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="leave_type"
                                    value={newLeave.leave_type}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            {/* Policy */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Policy<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="policy_id"
                                    value={newLeave.policy_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Policy</option>
                                    {policies.map((policy) => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.policy_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ✅ Department Multi-Select */}
                            <MultiSelectDropdown
                                label="Departments"
                                options={[
                                    { value: "all", label: "All Departments" },
                                    ...departments.map((d) => ({ value: d.dept_id, label: d.dept_name })),
                                ]}
                                selected={newLeave.department_ids}
                                onChange={(val) => setNewLeave((prev) => ({ ...prev, department_ids: val }))}
                                required
                            />


                            {/* Category (Multi-select Dropdown) */}
                            <MultiSelectDropdown
                                label="Category"
                                required
                                options={categories
                                    .filter((cat) => cat.status === "active")
                                    .map((cat) => ({
                                        value: cat.category_id,
                                        label: cat.category,
                                    }))}
                                selected={newLeave.category_ids}
                                onChange={(val) => setNewLeave({ ...newLeave, category_ids: val })}
                            />

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={newLeave.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    rows={3}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Table */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Leave Type</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Policy</th>
                                <th className="p-5 text-left text-black">Categories</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeaves.map((leave, index) => (
                                <tr key={leave.id} className={`${index % 2 === 0 ? "bg-tableblue" : "bg-white"}`} >
                                    <td className="px-5 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td
                                        className="px-5 py-4 text-blue-600 cursor-pointer hover:underline"
                                        onClick={() => openDetailsModal(leave)}
                                    >
                                        {leave.leave_type}
                                    </td>
                                    <td className="px-5 py-4">{leave.description || "NA"}</td>
                                    <td className="px-5 py-4">{policies.find((p) => p.id === leave.policy_id)?.policy_name || leave.policy_id}</td>
                                    <td className="px-5 py-4">{leave.category_ids && leave.category_ids.length > 0 ? leave.category_ids.map((id) => categories.find((c) => c.category_id === id)?.category || id).join(", ") : "NA"}</td>
                                    <td className="px-5 py-4"><span className={`font-medium ${leave.status ? " text-green-600" : " text-red-600"}`} >{leave.status ? "Active" : "Inactive"}</span></td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => openEditModal(leave)} className="text-blue-600" > <FontAwesomeIcon icon={faEdit} /></button>
                                        <button onClick={() => setShowDeleteConfirm(leave)} className="text-red-600" > <FontAwesomeIcon icon={faTrash} /> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                open={!!showDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Leave?"
                message={`Are you sure you want to delete "${showDeleteConfirm?.leave_type}"?`}
            />

            {isEditModalOpen && editLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Leave</h2>

                        <form onSubmit={handleEditLeave}>
                            {/* Leave Type */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Leave Type<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="leave_type"
                                    value={editLeave.leave_type}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            {/* Policy */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Policy<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="policy_id"
                                    value={editLeave.policy_id}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Policy</option>
                                    {policies.map((policy) => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.policy_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ✅ Department Multi-Select */}
                            <MultiSelectDropdown
                                label="Department"
                                required
                                options={[
                                    { value: "all", label: "All Departments" },
                                    ...departments.map((d) => ({
                                        value: d.dept_id,
                                        label: d.dept_name,
                                    })),
                                ]}
                                selected={editLeave.department_ids || []}
                                onChange={handleEditDepartmentChange}
                            />

                            {/* Category */}
                            <MultiSelectDropdown
                                label="Category"
                                required
                                options={categories
                                    .filter((cat) => cat.status === "active")
                                    .map((cat) => ({
                                        value: cat.category_id,
                                        label: cat.category,
                                    }))}
                                selected={editLeave.category_ids}
                                onChange={(val) => setEditLeave({ ...editLeave, category_ids: val })}
                            />

                            {/* Description */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={editLeave.description}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    rows={3}
                                />
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Status<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={editLeave.status}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            <MessageModal message={message} type={messageType} setMessage={setMessage} />

            {isDetailsModalOpen && selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">Leave Details</h2>

                        <div className="space-y-3 text-sm">
                            <div><strong>Leave Type:</strong> {selectedLeave.leave_type}</div>

                            <div><strong>Description:</strong> {selectedLeave.description || "NA"}</div>

                            <div>
                                <strong>Policy:</strong>{" "}
                                {policies.find((p) => p.id === selectedLeave.policy_id)?.policy_name ||
                                    selectedLeave.policy_id ||
                                    "NA"}
                            </div>

                            <div>
                                <strong>Categories:</strong>{" "}
                                {selectedLeave.category_ids && selectedLeave.category_ids.length > 0
                                    ? selectedLeave.category_ids
                                        .map(
                                            (id) =>
                                                categories.find((c) => c.category_id === id)?.category ||
                                                id
                                        )
                                        .join(", ")
                                    : "NA"}
                            </div>

                            <div>
                                <strong>Departments:</strong>{" "}
                                {selectedLeave.department_ids && selectedLeave.department_ids.length > 0
                                    ? selectedLeave.department_ids
                                        .map(
                                            (id) =>
                                                departments.find((d) => d.dept_id === id)?.dept_name || id
                                        )
                                        .join(", ")
                                    : "NA"}
                            </div>

                            <div>
                                <strong>Status:</strong>{" "}
                                <span
                                    className={`font-medium ${selectedLeave.status ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {selectedLeave.status ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div>
                                <strong>Created At:</strong>{" "}
                                {new Date(selectedLeave.created_at).toLocaleDateString("en-GB")}
                            </div>
                        </div>

                        <div className="flex justify-end mt-5">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AllLeave;