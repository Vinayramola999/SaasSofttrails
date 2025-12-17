import axios from "axios";
import API from "../config/api";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import IndentApprovals from "./IndentApprovals";
import Select from "react-select";
import PopupModal from "./PopupModal";
import DownloadTableButtons from "./components/Downloadpdfexcel";

const Approvals = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("allRequests");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [reason, setReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState(""); // "Rejected" or "Resubmitted"
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });

  const tabs = [
    { id: "allRequests", label: "All Requests" },
    { id: "indent", label: "Approved Indent" },
    // { id: "allocation", label: "Allocation" },
    { id: "paymentStatus", label: "Payment Status" },
  ];

  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [budgetOptions, setBudgetOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Resubmitted", label: "Resubmitted" },
    { value: "Pending", label: "Pending" },
  ];
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "User Id", accessor: "user_id" },
    { header: "Department", accessor: "department" },
    { header: "Request", accessor: "asset_name" },
    { header: "Request for", accessor: "request_for" },
    { header: "Quantity", accessor: "quantity" },
    { header: "UOM", accessor: "uom" },
    { header: "Budget", accessor: "budget" },
    { header: "Status", accessor: "status" },
  ];

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      height: "40px",
      borderRadius: "0.75rem", // rounded-xl
      fontSize: "16px",
      backgroundColor: "#F4F4F4",
      borderColor: "#d1d5db", // Tailwind border-gray-300
      boxShadow: "none",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "40px",
      padding: "0 12px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "40px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827", // Tailwind text-gray-900
      fontSize: "16px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280", // Tailwind text-gray-400
      fontSize: "16px",
    }),
  };

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API.PURCHASE_API}/budget-workflow/workflows`, { headers: { Authorization: `Bearer ${token}` } });
      setWorkflows(response.data); // assuming response.data is an array
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    axios.get(`${API.PURCHASE_API}/budget/department/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        // Convert budget_name array to array of objects
        const names = Array.isArray(res.data.budget_name)
          ? res.data.budget_name
          : [];
        const budgets = names.map((name, idx) => ({
          id: idx + 1, // or use name as id if unique
          budget_name: name,
        }));
        setBudgetOptions(budgets);
      })
      .catch((err) => console.error("Error fetching budgets:", err));
  }, [token]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API.API_BASE}/test/departments`, { headers: { Authorization: `Bearer ${token}` } });
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    axios.get(`${API.PURCHASE_API}/indenting`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setData(response.data))
      .catch((error) => console.error(error));
  }, [token]);

  useEffect(() => {
    const fetchAllIndentingData = async () => {
      try {
        const [indentingRes, salesRes] = await Promise.all([
          axios.get(`${API.PURCHASE_API}/indenting`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const combinedData = [
          ...(Array.isArray(indentingRes.data) ? indentingRes.data : []),
          ...(Array.isArray(salesRes.data) ? salesRes.data : []),
        ];

        setData(combinedData);
      } catch (error) {
        console.error("Error fetching indenting data:", error);
      }
    };

    if (token) {
      fetchAllIndentingData();
    }
  }, [token]);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(""); // or null based on budget dropdown

  const filteredData = data.filter((item) => {
    const matchesStatus = selectedStatus
      ? item.status === selectedStatus
      : true;
    const matchesBudget = selectedBudget
      ? String(item.budget_id) === String(selectedBudget)
      : true;

    // Search by User Id, Department Name, Request, Request for, etc.
    const departmentName =
      departments.find((b) => b.dept_id === item.dept_id)?.dept_name || "";
    const matchesSearch = searchTerm
      ? (
          item.user_id +
          " " +
          departmentName +
          " " +
          (item.asset_name || "") +
          " " +
          (item.request_for || "") +
          " " +
          (item.uom || "") +
          " " +
          (item.status || "")
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return matchesStatus && matchesBudget && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Change as needed

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedRequests = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);
  const handleStatusClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };
  const handleCancel = () => {
    setShowModal(false); // this will hide the modal
  };

  const handleConfirm = () => {
    // perform action
    setShowModal(false); // hide modal after confirming
  };
  const handleStatusUpdate = (status, reasonText = "") => {
    if (!selectedItem) return;

    const payload = {
      user_id: selectedItem.user_id,
      status: status,
      reasons: reasonText, // send reason to backend
    };

    axios.put(`${API.PURCHASE_API}/indenting/update-status/${selectedItem.id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log(`${status} successful:`, response.data);

        // Show custom PopupModal
        setModalProps({
          type: "success",
          title: "Status Updated",
          message: `Request has been ${status.toLowerCase()} successfully.`,
          status, // <-- add this line
        });
        setShowModal(true);
      })
      .catch((error) => {
        console.error(`${status} failed:`, error);

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong!";

        // Optional: show error as PopupModal (or you can keep Swal for errors)
        setModalProps({
          title: "Request Failed",
          message: errorMessage,
          type: "error",
          onCancel: handleCancel,
        });
        setShowModal(true);
      });
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const budgetSelectOptions = [
    { value: "", label: "All Budgets" },
    ...(Array.isArray(budgetOptions) ? budgetOptions : []).map((b) => ({
      value: b.id,
      label: b.budget_name,
    })),
  ];

  //   const handleModalClose = () => {
  //   setModal({ ...modal, open: false });
  //   // Optional: refresh data or update local state
  //   fetchData(); // or refetch updated list
  // };
  const exportData = filteredData.map((item, idx) => ({
    sno: idx + 1,
    user_id: item.user_id,
    department:
      departments.find((b) => b.dept_id === item.dept_id)?.dept_name || "N/A",
    asset_name: item.asset_name,
    request_for: item.request_for,
    quantity: item.quantity,
    uom: item.uom,
    budget:
      budgetOptions.find((b) => b.id === item.budget_id)?.budget_name || "N/A",
    status: item.status,
  }));
  return (
    <div className="flex">
      <div className="p-3 w-full">
        {/* Tab Navigation */}
        <div className="flex flex-col w-[100%] mt-5">
          <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
              style={{
                width: `calc(100% / ${tabs.length})`,
                left: `${
                  (tabs.findIndex((t) => t.id === activeTab) * 100) /
                  tabs.length
                }%`,
              }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${
                  activeTab === tab.id ? "text-white" : "text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "allRequests" && (
              <>
                <div className="flex mb-4 gap-4 items-center">
                  <div className="relative w-1/4">
                    <input
                      type="text"
                      placeholder="Search"
                      className="border border-gray-300 w-full p-2 pl-10 rounded-xl bg-[#FFFFFF] h-10 text-base"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ minHeight: "40px" }}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="w-1/6 bg-white  ">
                    <Select
                      className="w-full bg-[#FFFFFF]"
                      styles={selectStyles}
                      options={budgetSelectOptions}
                      value={
                        budgetSelectOptions.find(
                          (opt) => opt.value === selectedBudget
                        ) || budgetSelectOptions[0]
                      }
                      onChange={(opt) => setSelectedBudget(opt.value)}
                      isSearchable
                      placeholder="All Budgets"
                    />
                  </div>
                  <div className="w-1/6 ">
                    <Select
                      className="w-full bg-[#FFFFFF]"
                      styles={selectStyles}
                      options={statusOptions}
                      value={
                        statusOptions.find(
                          (opt) => opt.value === selectedStatus
                        ) || statusOptions[0]
                      }
                      onChange={(opt) => setSelectedStatus(opt.value)}
                      isSearchable
                      placeholder="All Status"
                    />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <DownloadTableButtons
                      data={exportData}
                      columns={columns}
                      fileName="AllRequests"
                    />
                  </div>
                </div>
                <div
                  className="overflow-x-auto rounded-lg shadow bg-white p-4"
                  style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
                >
                  <table className="w-full bg-white rounded-lg border-collapse">
                    <thead className="border-b-2 border-black top-0 bg-white z-10">
                      <tr className="p-4">
                        <th>S. No.</th>
                        <th className="p-2">User Id</th>
                        <th className="p-2">Department</th>
                        <th className="p-2">Request</th>
                        <th className="p-2">Request for</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">UOM</th>
                        <th className="p-2">Budget</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRequests.length > 0 ? (
                        paginatedRequests.map((item, index) => (
                          <tr
                            key={index}
                            className="odd:bg-blue-50 text-center"
                          >
                            <td className="p-2">
                              {index + 1 + (currentPage - 1) * rowsPerPage}
                            </td>
                            {/* <td className="p-2">{item.user_id}</td> */}
                            {/* <td className="p-2">{item.user_id?.name || "N/A"}</td> */}
                           
                            <td className="p-2">
                              {typeof item.user_id === "object"
                                ? item.user_id.name || "N/A"
                                : item.user_id || "N/A"}
                            </td>
                            <td className="p-2">
                              {departments.find(
                                (b) => b.dept_id === item.dept_id
                              )?.dept_name || "N/A"}
                            </td>
                            <td className="p-2">{item.asset_name}</td>
                            <td className="p-2">{item.request_for}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">{item.uom}</td>
                            {/* <td className="p-2">
                              {budgetOptions.find(
                                (b) => b.id === item.budget_id
                              )?.budget_name || "N/A"}
                            </td> */}
                            <td className="p-2">
                              {budgetOptions.find(
                                (b) => b.id === item.budget_id
                              )?.budget_name?.name || "N/A"}
                            </td>
                            <td
                              className={`cursor-pointer ${
                                item.status === "Pending"
                                  ? "text-yellow-500 underline"
                                  : item.status === "Approved"
                                  ? "text-[#0FB900] underline"
                                  : item.status === "Rejected"
                                  ? "text-[#f33535] underline"
                                  : item.status === "Updated"
                                  ? "text-[#f33535] underline"
                                  : item.status === "Resubmitted"
                                  ? "text-[#2500b9]"
                                  : ""
                              }`}
                              onClick={() =>
                                (item.status === "Pending" ||
                                  item.status === "Approved" ||
                                  item.status === "Updated") &&
                                handleStatusClick(item)
                              }
                            >
                              {item.status}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="p-4 text-center text-gray-500"
                          >
                            No requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center gap-2 mt-4 justify-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
              </>
            )}
            {activeTab === "indent" && (
              <div>
                {" "}
                <IndentApprovals />{" "}
              </div>
            )}
            {activeTab === "allocation" && <div>Allocation Content</div>}
            {activeTab === "paymentStatus" && (
              <div>Payment Status Content WIP</div>
            )}
          </div>
        </div>
        {/* Popup */}
        {isPopupOpen && selectedItem && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[830px] max-w-full relative">
              <button
                className="absolute top-4 right-4 text-red-600 text-xl"
                onClick={closePopup}
              >
                ✖
              </button>

              <h2 className="text-xl font-bold text-left mb-1">
                #{selectedItem.id}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {departments.find((b) => b.dept_id === selectedItem.dept_id)
                  ?.dept_name || "N/A"}
              </p>

              {/* Grid layout for form fields */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium">
                    Request for
                  </label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={selectedItem.request_for}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={selectedItem.category_name || "Category name"}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Request Material
                  </label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={selectedItem.asset_name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Quantity</label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={selectedItem.quantity}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">UOM</label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={selectedItem.uom}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Budget</label>
                  <input
                    type="text"
                    className="border rounded-md w-full px-2 py-1"
                    value={
                      budgetOptions.find((b) => b.id === selectedItem.budget_id)
                        ?.budget_name || "N/A"
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="border rounded-md w-full px-2 py-2"
                  rows="4"
                  value={selectedItem.remarks}
                  readOnly
                />
              </div>

              {/* Action buttons selectedItem */}
              {selectedItem.status === "Pending" ? (
                <div className="flex justify-between">
                  <div>
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
                      onClick={() => {
                        setPendingStatus("Resubmitted");
                        setShowReasonPopup(true);
                      }}
                    >
                      Resubmit
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
                      onClick={() => {
                        setPendingStatus("Rejected");
                        setShowReasonPopup(true);
                      }}
                    >
                      Reject
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                      onClick={() => handleStatusUpdate("Approved")}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ) : selectedItem.status === "Approved" ? (
                <div className="flex justify-start">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
                    onClick={() => {
                      setPendingStatus("Resubmitted");
                      setShowReasonPopup(true);
                    }}
                  >
                    Resubmit
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
                      onClick={() => {
                        setPendingStatus("Rejected");
                        setShowReasonPopup(true);
                      }}
                    >
                      Reject
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                      onClick={() => handleStatusUpdate("Approved")}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {showReasonPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-[32px] w-[600px] max-w-[95vw] p-6 shadow-xl relative">
              <button
                className="absolute top-4 right-4 text-2xl text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setShowReasonPopup(false)}
              >
                &#10005;
              </button>
              <h2 className="text-xl font-bold mb-4">
                {pendingStatus === "Resubmitted" ? "Resubmit" : "Reject"}
              </h2>{" "}
              <label className="block text-base font-medium mb-2">Reason</label>
              <textarea
                className="border rounded-xl w-full p-3 mb-8 min-h-[120px] resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason here..."
              />
              <div className="flex mr-8 gap-6 mt-2">
                <button
                  className="bg-custome-blue text-white flex-1 py-2 rounded-lg font-semibold"
                  onClick={() => {
                    handleStatusUpdate(pendingStatus, reason);
                    setShowReasonPopup(false);
                    setReason("");
                  }}
                >
                  Submit
                </button>
                <button
                  className="border border-black flex-1 py-2 rounded-lg font-semibold"
                  onClick={() => setShowReasonPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <PopupModal
            type={modalProps.type}
            title={modalProps.title}
            message={modalProps.message}
            onClose={() => {
              setShowModal(false);
              if (modalProps.type === "success") {
                setData((prevData) =>
                  prevData.map((item) =>
                    item.id === selectedItem.id
                      ? { ...item, status: modalProps.status }
                      : item
                  )
                );
                closePopup();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Approvals;
