// export default AllRequest;
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../config/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";
import PopupModal from "./PopupModal";
import DownloadTableButtons from "./components/Downloadpdfexcel";

// Helper for department ID to Name mapping
const deptIdToNameMap = {
  1: "Development",
  3: "HR",
};

const AllRequest = () => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [asset, setAsset] = useState("");
  const [department, setDepartment] = useState(""); // Will store dept_id
  const [status, setStatus] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestMaterialOpen, setIsRequestMaterialOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [requestfor, setRequestfor] = useState("");
  const [assetOptions, setAssetOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Request for", accessor: "request_for" },
    { header: "Category", accessor: "category" },
    { header: "Request Material", accessor: "asset_name" },
    { header: "Quantity", accessor: "quantity" },
    { header: "UOM", accessor: "uom" },
    { header: "Status", accessor: "status" },
  ];
  const filteredRequests = requests.filter((item) => {
    let matches = true;

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

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Change as needed

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [indentingRes, salesIndentingRes] = await Promise.all([
          axios.get(`${API.PURCHASE_API}/indenting`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        // ✅ Indenting response is array directly
        const indentingData = Array.isArray(indentingRes.data)
          ? indentingRes.data
          : [];

        // ✅ Sales response has `data` inside `data`
        const salesData = Array.isArray(salesIndentingRes.data)
          ? salesIndentingRes.data
          : [];

        // Merge both
        const combinedRequests = [...indentingData, ...salesData];
        setRequests(combinedRequests);

        if (combinedRequests.length > 0) {
          // Asset Options
          const uniqueAssetNames = [
            ...new Set(
              combinedRequests.map((item) => item.asset_name).filter(Boolean)
            ),
          ];
          setAssetOptions(uniqueAssetNames.sort());

          // Department Options
          const uniqueDeptIds = [
            ...new Set(
              combinedRequests
                .map((item) => item.dept_id)
                .filter((id) => id !== null && id !== undefined)
            ),
          ];
          const deptOpts = uniqueDeptIds
            .map((id) => ({
              value: id.toString(),
              label: `${deptIdToNameMap[id] || `Department ID ${id}`}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setDepartmentOptions(deptOpts);

          // Status Options
          const uniqueStatuses = [
            ...new Set(
              combinedRequests.map((item) => item.status).filter(Boolean)
            ),
          ];
          setStatusOptions(uniqueStatuses.sort());
        } else {
          setAssetOptions([]);
          setDepartmentOptions([]);
          setStatusOptions([]);
        }
      } catch (error) {
        console.error("Error fetching indenting data:", error);
        setRequests([]);
        setAssetOptions([]);
        setDepartmentOptions([]);
        setStatusOptions([]);
        setModalProps({
          type: "error",
          title: "Error!",
          message: "Failed to fetch indenting or sales indenting data.",
        });
        setShowModal(true);
      }
    };

    fetchRequests();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API.PURCHASE_API}/indenting/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests((prev) => prev.filter((request) => request.id !== id));
      setModalProps({
        type: "success",
        title: "Deleted!",
        message: "The indent has been deleted.",
      });
      setShowModal(true);
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error",
        message: "Failed to delete the indent.",
      });
      setShowModal(true);
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (item) => {
    setEditData({ ...item }); // item has request_for (lowercase f)
    setIsEditOpen(true);
    setIsRequestMaterialOpen(false);
  };

  const handleUpdate = async () => {
    if (!editData) return;

    try {
      const payload = {
        asset_name: editData.asset_name || "Default Asset",
        remarks: editData.remarks || "",
        quantity: Number(editData.quantity) || 0,
        user_id: createdBy,
        request_for: editData.request_for,
        category: editData.category,
      };

      const response = await axios.put(
        `${API.PURCHASE_API}/indenting/update-details/${editData.id}`,
        payload, // ✅ request body
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ config
        }
      );

      if (response.status === 200) {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === editData.id
              ? { ...item, ...response.data.updatedIndenting }
              : item
          )
        );
        setIsEditOpen(false);
        setModalProps({
          type: "success",
          title: "Success!",
          message: "Request updated successfully!",
        });
        setShowModal(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update request. Please try again.";
      setModalProps({
        type: "error",
        title: "Error!",
        message: errorMessage,
      });
      setShowModal(true);
      console.error("Update error:", error.response || error);
    }
  };

  const handleRequestMaterialClick = (item) => {
    setSelectedRequest(item);
    setIsRequestMaterialOpen(true);
    setIsEditOpen(false);
  };

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (requestfor) {
        try {
          const response = await axios.get(`${API.PURCHASE_API}/assets?request_for=${requestfor}`, { headers: { Authorization: `Bearer ${token}` } });
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
  }, [requestfor, token]);

  const handleAssetChange = (e) => {
    setAsset(e.target.value);
    setStatus("");
  };

  const handlerequestforChange = (e) => {
    setRequestfor(e.target.value);
    setAsset(""); // Reset category selection
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    // setAsset("");
  };

  useEffect(() => {
    const fetchCategoryOptionsForEdit = async () => {
      if (editData?.request_for) {
        try {
          const response = await axios.get(
            `${API.PURCHASE_API}/assets?request_for=${editData.request_for}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const categories = Array.isArray(response.data)
            ? response.data.map((item) => item.category)
            : [];
          setCategoryOptions([...new Set(categories)].sort());
        } catch (error) {
          console.error("Error fetching category options for edit:", error);
          setCategoryOptions([]);
        }
      }
    };

    if (isEditOpen && editData) {
      fetchCategoryOptionsForEdit();
    }
  }, [editData, isEditOpen, token]);

  const requestForOptions = [
    { value: "Movable", label: "Movable" },
    { value: "Raw Materials", label: "Raw Materials" },
    { value: "Sales", label: "Sales" },
  ];
  const categorySelectOptions = categoryOptions.map((cat) => ({
    value: cat,
    label: cat,
  }));
  const exportData = filteredRequests.map((item, idx) => ({
    sno: idx + 1,
    request_for: item.request_for,
    category: item.category,
    asset_name: item.asset_name,
    quantity: item.quantity,
    uom: item.uom,
    status: item.status,
  }));
  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-4 mb-4">
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

        <select
          value={status}
          onChange={handleStatusChange}
          className="border p-2 rounded-xl"
        >
          <option value="">All Status</option>
          {statusOptions.map((statusName) => (
            <option key={statusName} value={statusName}>
              {statusName}
            </option>
          ))}
        </select>
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
          <thead className="border-b-2 border-black  bg-white z-10">
            <tr>
              <th className="p-2 text-center">S. No.</th>
              <th className="p-2 text-center">Request for</th>
              <th className="p-2 text-center">Category</th>
              <th className="p-2 text-center">Request Material</th>
              <th className="p-2 text-center">Quantity</th>
              <th className="p-2 text-center">UOM</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((item, index) => (
                <tr key={item.id} className="odd:bg-blue-50">
                  <td className="p-2 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>{" "}
                  <td className="p-2 text-center">{item.request_for}</td>
                  <td className="p-2 text-center">{item.category}</td>
                  <td
                    className="p-2 text-center text-blue-600 cursor-pointer"
                    onClick={() => handleRequestMaterialClick(item)}
                  >
                    {item.asset_name}
                  </td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-center">{item.uom}</td>
                  <td
                    className={`p-2 text-center ${
                      item.status === "Pending"
                        ? "text-orange-500"
                        : item.status === "Approved"
                        ? "text-green-500"
                        : item.status === "Rejected"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {item.status}
                  </td>
                  <td className="p-2 flex justify-center items-center gap-4">
                    {/* Edit Action */}
                    <div
                      className={`relative group flex items-center justify-center ${
                        item.status === "Pending" ||
                        item.status === "Resubmitted"
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40"
                      }`}
                      onClick={() => {
                        if (
                          item.status === "Pending" ||
                          item.status === "Resubmitted"
                        ) {
                          handleEdit(item);
                        }
                      }}
                    >
                      <FaEdit className="text-blue-500 text-lg" />

                      {/* Tooltip for disabled status */}
                      {item.status !== "Pending" &&
                        item.status !== "Resubmitted" && (
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            Edit not allowed
                          </div>
                        )}
                    </div>

                    {/* Delete Action */}
                    <div
                      className={`flex items-center justify-center cursor-pointer ${
                        item.status === "Approved"
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        if (item.status !== "Approved") {
                          setDeleteId(item.id);
                          setShowDeleteModal(true);
                        }
                      }}
                    >
                      <FaTrash className="text-red-500" size={16} />{" "}
                      {/* 👈 smaller size */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
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

      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-5 rounded-xl w-[40%]">
            {" "}
            {/* Adjusted width for better fit */}
            <div className="flex justify-between items-center">
              <h2 className="font-bold mb-4 text-left">Edit Raise Request</h2>
              <button onClick={() => setIsEditOpen(false)}>
                <span className="text-red-500 text-2xl">✖</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {" "}
              {/* Responsive grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request For
                </label>
                <Select
                  options={requestForOptions}
                  value={
                    requestForOptions.find(
                      (opt) => opt.value === editData.request_for
                    ) || null
                  }
                  onChange={(opt) =>
                    setEditData({
                      ...editData,
                      request_for: opt?.value || "",
                      category: "",
                    })
                  }
                  placeholder="Select Request For"
                  isClearable
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  options={categorySelectOptions}
                  value={
                    categorySelectOptions.find(
                      (opt) => opt.value === editData.category
                    ) || null
                  }
                  onChange={(opt) =>
                    setEditData({
                      ...editData,
                      category: opt?.value || "",
                    })
                  }
                  placeholder="Select Category"
                  isClearable
                  className="w-full"
                  isDisabled={
                    !editData.request_for || categoryOptions.length === 0
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={editData.quantity || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, quantity: e.target.value })
                  }
                  className="border p-2 w-full rounded-xl"
                  min="0"
                />
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
              Description (Remarks)
            </label>
            <textarea
              placeholder="Enter description here..."
              value={editData.remarks || ""}
              onChange={(e) =>
                setEditData({ ...editData, remarks: e.target.value })
              }
              className="p-2 border rounded-lg w-full mb-6"
              rows="3"
            />
            <div className="flex justify-start gap-4 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-[#005AE6] min-w-[100px] text-white p-2 rounded-lg hover:bg-blue-700" // Added min-width
              >
                Update
              </button>
              <button
                onClick={() => setIsEditOpen(false)}
                className="border border-black min-w-[100px] p-2 rounded-lg hover:bg-gray-100" // Added min-width
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
          onClose={() => setShowModal(false)}
        />
      )}
      {showDeleteModal && (
        <PopupModal
          type="delete"
          title="Are you sure?"
          message="This action cannot be undone."
          onConfirm={async () => {
            await handleDelete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
        />
      )}
      {isRequestMaterialOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[50%] max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Raise request details</h2>
              <button onClick={() => setIsRequestMaterialOpen(false)}>
                <span className="text-red-500 text-2xl">✖</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">Indent Id:</span>
                <span>{selectedRequest.id || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">
                  Request for:
                </span>
                <span>{selectedRequest.request_for || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">Category:</span>
                <span>{selectedRequest.category || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">
                  Request material:
                </span>
                <span>{selectedRequest.asset_name || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">Quantity:</span>
                <span>{selectedRequest.quantity || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">UOM:</span>
                <span>{selectedRequest.uom || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">Workflow:</span>
                <span>{selectedRequest.workflow_id || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-32 shrink-0">Budget ID:</span>
                <span>{selectedRequest.budget_id || "N/A"}</span>
              </div>
              <div className="flex md:col-span-2">
                <span className="font-semibold w-32 shrink-0">
                  Created By User ID:
                </span>
                <span>{selectedRequest.user_id || "N/A"}</span>
              </div>
              <div className="flex md:col-span-2">
                <span className="font-semibold w-32 shrink-0">Department:</span>
                <span>
                  {selectedRequest.dept_id
                    ? `${
                        deptIdToNameMap[selectedRequest.dept_id] ||
                        "Unknown Dept."
                      }`
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-semibold mb-1">Description (Remarks):</p>
              <p className="text-justify text-sm break-words">
                {selectedRequest.remarks || "No description provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRequest;
