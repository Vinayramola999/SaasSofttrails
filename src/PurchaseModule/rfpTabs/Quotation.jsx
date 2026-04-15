import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import DownloadTableButtons from "../components/Downloadpdfexcel";
import { toast } from "react-toastify";
import Select from "react-select";
import PopupModal from "../PopupModal";
// import ManualQuotationModal from "./ManualQuotationModal";
const Quotation = () => {
  const createdBy = sessionStorage.getItem("userId");
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const { userId } = useParams();
  const [rfpOptions, setRfpOptions] = useState([]);
  const [selectedRfp, setSelectedRfp] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [docStatus, setDocStatus] = useState({}); // { docName: "Qualified" | "Disqualified" }
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [popupModalProps, setPopupModalProps] = useState({
    type: "warning",
    title: "",
    message: "",
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFinalStatusModal, setShowFinalStatusModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const navigate = useNavigate();
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Date", accessor: "quotation_date" },
    { header: "Quotation Id.", accessor: "quotation_id" },
    { header: "RFP ID", accessor: "rfp_id" },
    { header: "Vendor", accessor: "vendor_name" },
    { header: "Status", accessor: "status" },
  ];
  const handleViewHistory = async (quotationId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/history/${quotationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.success === false) {
        setHistory([]);
        setShowHistoryModal(false);
        setPopupModalProps({
          type: "warning",
          title: "No History",
          message:
            response.data?.message || "No history found for this quotation ID.",
        });
        setShowPopupModal(true);
        return;
      }
      // Handle nested structure from API response and group by version
      const historyObject = response.data?.history || {};
      const groupedByVersion = {};
      
      // Group all items by their version
      Object.entries(historyObject).forEach(([itemName, versions]) => {
        if (Array.isArray(versions)) {
          versions.forEach((version) => {
            const versionKey = version.version || "1.0";
            if (!groupedByVersion[versionKey]) {
              groupedByVersion[versionKey] = {
                version: versionKey,
                items: [],
                created_at: version.created_at,
              };
            }
            groupedByVersion[versionKey].items.push({
              ...version,
              item_name: itemName,
            });
          });
        }
      });
      
      // Convert to array and sort by created_at (newest first)
      const sortedHistory = Object.values(groupedByVersion).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      
      setHistory(sortedHistory);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching quotation history:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch quotation history.";
      setPopupModalProps({
        type: "error",
        title: "Error",
        message: errMsg,
      });
      setShowPopupModal(true);
    }
  };

  // Fetch RFP options on mount
  useEffect(() => {
    const fetchRfps = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/rfp_ids/quotation`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRfpOptions(res.data?.data || []);
      } catch (err) {
        setRfpOptions([]);
      }
    };
    fetchRfps();
  }, [token]);

  // Convert RFP options to react-select format
  const rfpSelectOptions = rfpOptions.map((rfp) => ({
    value: rfp.rfp_id,
    label: rfp.rfp_id,
  }));

  // Fetch quotations when RFP is selected
  useEffect(() => {
    if (!selectedRfp) {
      setQuotations([]);
      return;
    }
    setLoading(true);
    // In your useEffect for fetching quotations:
    axios
      .get(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/rfp/${selectedRfp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        // Map documents for popup and normalize id field
        const mapped = data.map((row) => {
          let documents = [];
          if (row.required_doc) {
            try {
              // Parse required_doc if it's a JSON string
              const docObj = typeof row.required_doc === 'string' 
                ? JSON.parse(row.required_doc) 
                : row.required_doc;
              documents = Object.entries(docObj).map(([name, url]) => ({
                name,
                url,
              }));
            } catch (e) {
              console.error('Error parsing required_doc:', e);
              documents = [];
            }
          }
          return {
            // ensure component uses `quotation_id`
            quotation_id: row.quotation_id || row.quotation_group_id || "",
            // keep original fields
            ...row,
            // documents normalized from required_doc
            documents,
          };
        });

        setQuotations(mapped);
      })
      .catch(() => setQuotations([]))
      .finally(() => setLoading(false));
  }, [selectedRfp, token]);

  const filteredQuotations = quotations.filter((row) => {
    // Search by vendor, quotation no, etc.
    const searchMatch =
      !search ||
      (row.vendor_name &&
        row.vendor_name.toLowerCase().includes(search.toLowerCase())) ||
      (row.quotation_id && String(row.quotation_id).includes(search)) ||
      (row.rfp_id && String(row.rfp_id).includes(search));
    // Date filter
    const date = row.quotation_date ? new Date(row.quotation_date) : null;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const dateMatch =
      (!from || (date && date >= from)) && (!to || (date && date <= to));
    return searchMatch && dateMatch;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredQuotations.length / rowsPerPage);

  const paginatedData = filteredQuotations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredQuotations.length, totalPages]);

  const statusLifecycle = {
    Received: ["Rejected", "Technically Qualified", "Technically Disqualified"],
    "Technically Disqualified": ["Technically Qualified", "Rejected"],
    "Technically Qualified": [
      "Commercially Qualified",
      "Commercially Disqualified",
      "Rejected",
    ],
    "Commercially Disqualified": ["Rejected", "Commercially Qualified"],
    "Commercially Qualified": ["Negotiation", "Rejected"],
    Negotiation: ["Rejected", "Closed"],
  };

  const handleUpdateStatus = async () => {
    if (!selectedQuotation) return;

    const allQualified = Object.values(docStatus).every(
      (v) => v === "Qualified"
    );
    let newStatus = "Rejected";
    if (newStatus === "Commercially Qualified") {
      setShowCommercialModal(true);
    }
    // Status transition logic
    switch (selectedQuotation.status) {
      case "Received":
        newStatus = allQualified
          ? "Technically Qualified"
          : "Technically Disqualified";
        break;
      case "Technically Disqualified":
        newStatus = allQualified ? "Technically Qualified" : "Rejected";
        break;
      case "Technically Qualified":
        newStatus = allQualified
          ? "Commercially Qualified"
          : "Commercially Disqualified";
        break;
      case "Commercially Disqualified":
        newStatus = allQualified ? "Commercially Qualified" : "Rejected";
        break;
      case "Commercially Qualified":
        newStatus = allQualified ? "Negotiation" : "Rejected";
        break;
      case "Negotiation":
        newStatus = allQualified ? "Closed" : "Rejected";
        break;
      default:
        newStatus = "Rejected";
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
        {
          status: newStatus,
          user_id: createdBy,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update status in quotations table
      setQuotations((prev) =>
        prev.map((q) =>
          q.quotation_id === selectedQuotation.quotation_id
            ? { ...q, status: newStatus }
            : q
        )
      );
      setShowDocModal(false);
    } catch (err) {
      alert("Failed to update status");
    }
  };
  const getFileIcon = (fileName) => {
    if (!fileName) return "mdi:file-document";
    
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: { icon: "mdi:file-pdf", color: "#d32f2f" },
      doc: { icon: "mdi:file-word", color: "#2b5797" },
      docx: { icon: "mdi:file-word", color: "#2b5797" },
      xls: { icon: "mdi:file-excel", color: "#217346" },
      xlsx: { icon: "mdi:file-excel", color: "#217346" },
      ppt: { icon: "mdi:file-powerpoint", color: "#d24726" },
      pptx: { icon: "mdi:file-powerpoint", color: "#d24726" },
      jpg: { icon: "mdi:file-image", color: "#1976d2" },
      jpeg: { icon: "mdi:file-image", color: "#1976d2" },
      png: { icon: "mdi:file-image", color: "#1976d2" },
      zip: { icon: "mdi:file-zip", color: "#f57c00" },
    };
    
    return iconMap[ext] || { icon: "mdi:file-document", color: "#666" };
  };

  const exportData = filteredQuotations.map((row, idx) => ({
    sno: idx + 1,
    quotation_date: row.quotation_date
      ? new Date(row.quotation_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "--",
    quotation_id: row.quotation_id || "--",
    rfp_id: row.rfp_id || "--",
    vendor_name: row.vendor_name || "--",
    status: row.status || "--",
  }));
  return (
    <div className="p-6  min-h-[70vh] rounded-xl">
      {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} /> */}
      {/* <div className="pl-4 pt-2">
        <button
          className="bg-[#0057FF] text-white font-semibold px-5 py-2 rounded-lg shadow mb-4"
          onClick={() => setShowPopup(true)}
        >
          + Manual Quotation
        </button>
      </div> */}
      
      {/* <ManualQuotationModal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        quotationOptions={rfpSelectOptions}
      /> */}
      <div className="flex gap-4 mb-4 items-center">
        {/* Filters */}
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-400 text-lg">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <circle cx="8" cy="8" r="7" strokeWidth="2" />
              <path d="M17 17L13 13" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            className="border rounded px-3 py-2 pl-9 w-56"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={rfpSelectOptions}
          value={
            selectedRfp ? { value: selectedRfp, label: selectedRfp } : null
          }
          onChange={(option) => setSelectedRfp(option ? option.value : "")}
          placeholder="Select RFP ID"
          isClearable
          isSearchable
          className="w-48"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: "#ccc",
              borderRadius: "0.375rem",
            }),
          }}
        />
        <div className="flex items-center border rounded px-2 py-1">
          <input
            type="date"
            className="border-none outline-none px-2 py-1 bg-transparent"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
          <span className="mx-2 text-gray-500 font-medium">TO</span>
          <input
            type="date"
            className="border-none outline-none px-2 py-1 bg-transparent"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
          <span className="ml-2 text-gray-400">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <rect x="2" y="4" width="14" height="12" rx="2" strokeWidth="2" />
              <path d="M6 2v4M12 2v4" strokeWidth="2" />
            </svg>
          </span>
        </div>
        <div className="flex-1 flex justify-end">
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="Quotations"
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
      >
        {" "}
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black  bg-white z-10">
            <tr className="border-b-2 border-gray-200 text-black text-left">
              <th className="p-2">S. No.</th>
              <th className="p-2">Date</th>
              <th className="p-2">Quotation Id.</th>
              <th className="p-2">RFP ID</th>
              <th className="p-2">Vendor</th>
              <th className="p-2">Status</th>
              {/* <th className="py-2 px-3 font-medium text-left">Amount</th> */}
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  Please wait... Selected RFP is loading quotations.
                </td>
              </tr>
            ) : filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  Select an RFP first to see quotations, or no quotations are
                  available.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.quotation_id || idx} className="odd:bg-blue-50">
                  <td className="p-2">{idx + 1}.</td>
                  <td className="p-2">
                    {row.quotation_date
                      ? new Date(row.quotation_date).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "--"}
                  </td>
                  <td className="p-2">
                    {row.quotation_id ? (
                      <button
                        className="text-blue-600 underline"
                        onClick={() =>
                          navigate(`/quotation/${row.quotation_id}`)
                        }
                      >
                        {row.quotation_id}
                      </button>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="p-2">{row.rfp_id || "--"}</td>
                  <td className="p-2">{row.vendor_name || "--"}</td>
                  <td className="p-2">
                    <button
                      className={`underline ${
                        row.status === "Negotiation" || "Closed"
                          ? "text-blue-600 "
                          : "text-blue-600 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (row.status === "Negotiation") return;

                        setSelectedQuotation(row);

                        if (row.status === "Commercially Qualified") {
                          setShowCommercialModal(true);
                        } else if (row.status === "Final" || row.status === "Closed") {
                          setShowFinalStatusModal(true);
                          setRejectionReason("");
                        } else {
                          setShowDocModal(true);

                          // Initialize docStatus for this quotation
                          if (row.documents && row.documents.length > 0) {
                            const initialStatus = {};
                            row.documents.forEach((doc) => {
                              // Use document name as key for consistency
                              const key = doc.name || doc.url || "";
                              if (key) initialStatus[key] = "Qualified";
                            });
                            setDocStatus(initialStatus);
                          } else {
                            setDocStatus({});
                          }
                        }
                      }}
                    >
                      {row.status || "--"}
                    </button>
                  </td>
                  {/* <td className="py-2 px-3">
          ₹{row.total_with_tax ? Number(row.total_with_tax).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "--"}
        </td> */}
                  <td className="p-2">
                    <button
                      title="View History"
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => handleViewHistory(row.quotation_id)} // use actual ID
                    >
                      <Icon icon="mdi:history" width="20" height="20" />
                    </button>
                  </td>{" "}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showHistoryModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-[1200]">
            <div className="bg-white p-8 rounded-lg w-3/4 max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Negotiation History</h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-500 hover:text-red-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {history.length > 0 ? (
                <div className="space-y-6">
                  {history.map((round, roundIdx) => {
                    const date = new Date(round.created_at);
                    const dateStr = date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const timeStr = date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    
                    // Calculate total for this round
                    const totalForRound = round.items.reduce(
                      (sum, item) => sum + parseFloat(item.total_with_tax || item.total_amount || 0),
                      0
                    );
                    
                    const isLatest = roundIdx === 0;

                    return (
                      <div key={roundIdx} className="relative">
                        {/* Timeline connector */}
                        {roundIdx < history.length - 1 && (
                          <div className="absolute left-6 top-20 w-1 h-16 bg-gradient-to-b from-blue-400 to-gray-300"></div>
                        )}

                        {/* Main card */}
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center pt-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                isLatest
                                  ? "bg-blue-600 border-blue-600 shadow-lg"
                                  : "bg-gray-300 border-gray-400"
                              }`}
                            ></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-blue-50 rounded-lg p-5 border border-blue-200">
                            {/* Header - Negotiation Round */}
                            <div className="flex justify-between items-start mb-4 pb-3 border-b border-blue-200">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                  Negotiation Round {round.version}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {dateStr} at {timeStr}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Status: Negotiated
                                </span>
                              </div>
                            </div>

                            {/* Items in this round */}
                            <div className="space-y-4 mb-4">
                              {round.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="bg-white rounded p-3 border-l-4 border-blue-500">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-800">{item.item_name}</h4>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-600">Unit Price</p>
                                      <p className="font-semibold text-gray-900">
                                        ₹{parseFloat(item.unit_price).toLocaleString("en-IN", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Tax ({item.tax_percentage}%)</p>
                                      <p className="font-semibold text-gray-900">
                                        ₹{parseFloat(item.tax_amount).toLocaleString("en-IN", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Item Total</p>
                                      <p className="font-bold text-blue-600">
                                        ₹{parseFloat(item.total_with_tax).toLocaleString("en-IN", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Reason for change */}
                                  {item.reason_for_change && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <p className="text-xs text-yellow-700">
                                        <strong>📝 Reason:</strong> {item.reason_for_change}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Round total */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded p-4 text-white">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg">Final Value for Round {round.version}</span>
                                <span className="text-2xl font-bold">
                                  ₹{totalForRound.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No history found.</p>
                </div>
              )}

              {/* Summary section */}
              {history.length > 0 && (
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800 mb-4">Price Negotiation Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded p-4 border border-green-200">
                      <p className="text-xs text-green-700 font-semibold">INITIAL PRICE</p>
                      <p className="text-xl font-bold text-green-800 mt-2">
                        ₹{history[history.length - 1].items.reduce(
                          (sum, item) => sum + parseFloat(item.total_with_tax || 0),
                          0
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Round {history[history.length - 1].version}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-4 border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold">CURRENT PRICE</p>
                      <p className="text-xl font-bold text-blue-800 mt-2">
                        ₹{history[0].items.reduce(
                          (sum, item) => sum + parseFloat(item.total_with_tax || 0),
                          0
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Round {history[0].version}</p>
                    </div>
                    <div className="bg-purple-50 rounded p-4 border border-purple-200">
                      <p className="text-xs text-purple-700 font-semibold">TOTAL ROUNDS</p>
                      <p className="text-xl font-bold text-purple-800 mt-2">{history.length}</p>
                      <p className="text-xs text-purple-600 mt-1">Negotiation Rounds</p>
                    </div>
                  </div>
                  
                  {history.length > 1 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded border border-red-200">
                      <p className="text-sm font-semibold text-gray-800">
                        Price Change: 
                        <span className="ml-2 text-lg font-bold text-orange-600">
                          {(
                            ((history[0].items.reduce((sum, item) => sum + parseFloat(item.total_with_tax || 0), 0) -
                              history[history.length - 1].items.reduce((sum, item) => sum + parseFloat(item.total_with_tax || 0), 0)) /
                              history[history.length - 1].items.reduce((sum, item) => sum + parseFloat(item.total_with_tax || 0), 0)) *
                            100
                          ).toFixed(2)}
                          %
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  onClick={() => setShowHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {showDocModal && selectedQuotation && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: 400,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                position: "relative",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#d32f2f",
                  cursor: "pointer",
                }}
                onClick={() => setShowDocModal(false)}
              >
                ×
              </button>
              <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
                Documents
              </h2>
              {(selectedQuotation.documents || []).length > 0 ? (
                selectedQuotation.documents.map((doc, idx) => {
                  // doc is an object { name, url }
                  const docUrl = doc.url || "";
                  const docName = doc.name || `Document-${idx + 1}`;
                  const statusKey = docName; // Use name as consistent key
                  
                  return (
                    <div key={idx} style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 500, marginBottom: 6 }}>
                        {docName}
                      </div>
                      <div
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "6px",
                          padding: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: 8,
                        }}
                      >
                        {(() => {
                          const fileInfo = getFileIcon(docName);
                          return (
                            <Icon 
                              icon={fileInfo.icon} 
                              width="24" 
                              height="24" 
                              style={{ color: fileInfo.color }} 
                            />
                          );
                        })()}
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#0052CC",
                            textDecoration: "underline",
                          }}
                        >
                          {docName}
                        </a>
                      </div>
                      <div style={{ display: "flex", gap: 18 }}>
                        <label>
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={docStatus[statusKey] === "Qualified"}
                            onChange={() =>
                              setDocStatus((prev) => ({
                                ...prev,
                                [statusKey]: "Qualified",
                              }))
                            }
                          />{" "}
                          Qualified
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={docStatus[statusKey] === "Disqualified"}
                            onChange={() =>
                              setDocStatus((prev) => ({
                                ...prev,
                                [statusKey]: "Disqualified",
                              }))
                            }
                          />{" "}
                          Disqualified
                        </label>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ marginTop: 12, color: "#888" }}>
                  No document uploaded yet.
                </div>
              )}

              <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                <button
                  style={{
                    background: "#0052CC", // stable blue instead of invalid token
                    color: "#fff",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: (selectedQuotation.documents || []).length === 0 ? "not-allowed" : "pointer",
                    opacity: (selectedQuotation.documents || []).length === 0 ? 0.5 : 1,
                  }}
                  onClick={handleUpdateStatus}
                  disabled={(selectedQuotation.documents || []).length === 0}
                >
                  Update
                </button>
                <button
                  style={{
                    background: "#fff",
                    color: "#0052CC",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "1px solid #0052CC",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDocModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showCommercialModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: 340,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                position: "relative",
                textAlign: "center",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#d32f2f",
                  cursor: "pointer",
                }}
                onClick={() => setShowCommercialModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                Select Commercial Action
              </h2>
              <div style={{ color: "#555", marginBottom: 18 }}>
                Take the next step by choosing to negotiate or reject.
              </div>
              <div
                style={{ display: "flex", gap: 16, justifyContent: "center" }}
              >
                <button
                  style={{
                    background: "#0052CC",
                    color: "#fff",
                    padding: "10px 28px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    // Update status to Negotiation
                    await axios.put(
                      `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                      {
                        status: "Negotiation",
                        user_id: createdBy,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setQuotations((prev) =>
                      prev.map((q) =>
                        q.quotation_id === selectedQuotation.quotation_id
                          ? { ...q, status: "Negotiation" }
                          : q
                      )
                    );
                    setShowCommercialModal(false);
                  }}
                >
                  Negotiate
                </button>
                <button
                  style={{
                    background: "#d32f2f",
                    color: "#fff",
                    padding: "10px 28px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    // Update status to Rejected
                    await axios.put(
                      `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                      {
                        status: "Rejected",
                        user_id: createdBy,
                      }
                    );
                    setQuotations((prev) =>
                      prev.map((q) =>
                        q.quotation_id === selectedQuotation.quotation_id
                          ? { ...q, status: "Rejected" }
                          : q
                      )
                    );
                    setShowCommercialModal(false);
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
        {showFinalStatusModal && selectedQuotation && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: 500,
                padding: 32,
                borderRadius: 12,
                boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                position: "relative",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  color: "#d32f2f",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setShowFinalStatusModal(false);
                  setRejectionReason("");
                }}
                aria-label="Close"
              >
                ×
              </button>
              
              <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Final Status Action
              </h2>
              <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
                Update the status of this quotation. If rejecting, please provide a reason.
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <button
                  style={{
                    flex: 1,
                    background: "#10b981",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    try {
                      await axios.put(
                        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                        {
                          status: "Accepted",
                          user_id: createdBy,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setQuotations((prev) =>
                        prev.map((q) =>
                          q.quotation_id === selectedQuotation.quotation_id
                            ? { ...q, status: "Accepted" }
                            : q
                        )
                      );
                      setShowFinalStatusModal(false);
                      setRejectionReason("");
                      setPopupModalProps({
                        type: "success",
                        title: "Success",
                        message: "Quotation accepted successfully.",
                      });
                      setShowPopupModal(true);
                    } catch (err) {
                      setPopupModalProps({
                        type: "error",
                        title: "Error",
                        message: err.response?.data?.message || "Failed to accept quotation.",
                      });
                      setShowPopupModal(true);
                    }
                  }}
                >
                  ✓ Accept
                </button>
                <button
                  style={{
                    flex: 1,
                    background: "#ef4444",
                    color: "#fff",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // Show reason field when reject is clicked
                    const reasonField = document.getElementById("rejection-reason-field");
                    if (reasonField) {
                      reasonField.style.display = reasonField.style.display === "none" ? "block" : "none";
                    }
                  }}
                >
                  ✕ Reject
                </button>
              </div>

              {/* Rejection Reason Field */}
              <div id="rejection-reason-field" style={{ display: "none", marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    style={{
                      flex: 1,
                      background: "#ef4444",
                      color: "#fff",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: 16,
                      border: "none",
                      cursor: rejectionReason.trim() ? "pointer" : "not-allowed",
                      opacity: rejectionReason.trim() ? 1 : 0.6,
                    }}
                    onClick={async () => {
                      if (!rejectionReason.trim()) {
                        setPopupModalProps({
                          type: "warning",
                          title: "Required",
                          message: "Please provide a reason for rejection.",
                        });
                        setShowPopupModal(true);
                        return;
                      }
                      try {
                        await axios.put(
                          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                          {
                            status: "Rejected",
                            rejection_reason: rejectionReason,
                            user_id: createdBy,
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setQuotations((prev) =>
                          prev.map((q) =>
                            q.quotation_id === selectedQuotation.quotation_id
                              ? { ...q, status: "Rejected" }
                              : q
                          )
                        );
                        setShowFinalStatusModal(false);
                        setRejectionReason("");
                        setPopupModalProps({
                          type: "success",
                          title: "Success",
                          message: "Quotation rejected successfully.",
                        });
                        setShowPopupModal(true);
                      } catch (err) {
                        setPopupModalProps({
                          type: "error",
                          title: "Error",
                          message: err.response?.data?.message || "Failed to reject quotation.",
                        });
                        setShowPopupModal(true);
                      }
                    }}
                    disabled={!rejectionReason.trim()}
                  >
                    Confirm Rejection
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: "#f3f4f6",
                      color: "#666",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: 16,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const reasonField = document.getElementById("rejection-reason-field");
                      if (reasonField) {
                        reasonField.style.display = "none";
                      }
                      setRejectionReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* paginatedData */}
        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <button className="w-10 h-10 rounded bg-blue-600 text-white font-bold">
            {currentPage}
          </button>
          <span className="mx-1">of</span>
          <button className="w-10 h-10 rounded border border-blue-600 text-blue-600 font-bold bg-white">
            {totalPages}
          </button>
          <button
            className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
        {showPopupModal && (
          <PopupModal
            type={popupModalProps.type}
            // title={popupModalProps.title}
            message={popupModalProps.message}
            onClose={() => setShowPopupModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Quotation;
