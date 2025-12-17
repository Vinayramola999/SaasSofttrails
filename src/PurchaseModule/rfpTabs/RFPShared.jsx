import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../../config/api";
import DownloadTableButtons from "../components/Downloadpdfexcel";

export default function RFPShared() {
  const token = sessionStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [selectedRfp, setSelectedRfp] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch sample list of shared RFPs - replace endpoint as needed
  const fetchShared = async () => {
    setLoading(true);
    try {
      // Example API call; if backend endpoint differs, update accordingly
      const res = await axios.get(`${API.PURCHASE_API}/rfps/shared`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          rfp_id: selectedRfp || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          q: search || undefined,
          page: currentPage,
        },
      });

      // Expecting array at res.data.data or res.data
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setData(items);
    } catch (err) {
      // fallback: keep empty or show sample
      console.error("Failed to fetch shared RFPs", err?.response || err);
      setData([
        {
          rfp_id: "RFP-123-55",
          vendor_id: "VID-123-345",
          shared_date: "2025-01-12",
          sender_name: "Pankaj Rana",
          sender_contact: "pankurana8936@gmail.com",
          vendor_contact: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShared();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRfp, dateFrom, dateTo, currentPage]);

  const exportData = data.map((row, idx) => ({
    sno: idx + 1,
    rfp_id: row.rfp_id,
    vendor_id: row.vendor_id,
    shared_date: row.shared_date,
    sender_name: row.sender_name,
    sender_contact: row.sender_contact,
    vendor_contact: row.vendor_contact,
  }));

  const totalPages = Math.max(1, Math.ceil((data.length || 0) / rowsPerPage));
  const paginated = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="p-6 min-h-[60vh] rounded-xl ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">RFP Shared</h2>
          <p className="text-sm text-gray-500">View and manage all shared RFP records</p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadTableButtons data={exportData} columns={[{ header: "S. No.", accessor: "sno" }, { header: "RFP ID", accessor: "rfp_id" }]} fileName="RFP_Shared" />
        </div>
      </div>

      <div className="flex gap-4 items-center mb-4">
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-10 pr-3 py-2 border rounded w-72"
          />
        </div>

        <select value={selectedRfp} onChange={(e) => setSelectedRfp(e.target.value)} className="border rounded px-3 py-2">
          <option value="">Select RFP ID</option>
          {/* If you want to populate dynamically, fetch distinct RFP ids */}
          <option value="RFP-123-55">RFP-123-55</option>
        </select>

        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border px-3 py-2 rounded" />
          <span className="text-sm text-gray-500">TO</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border px-3 py-2 rounded" />
        </div>

        <div className="ml-auto" />
      </div>

      <div className="border rounded bg-white" style={{ minHeight: 300 }}>
        <table className="w-full text-sm border-collapse ">
          <thead className="bg-white">
            <tr className="border-b">
              <th className="p-3 text-left">S. No.</th>
              <th className="p-3 text-left">RFP ID</th>
              <th className="p-3 text-left">Vendor ID</th>
              <th className="p-3 text-left">Shared Date</th>
              <th className="p-3 text-left">Sender Name</th>
              <th className="p-3 text-left">Sender Contact</th>
              <th className="p-3 text-left">Vendor Contact</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">No shared RFPs found.</td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={row.rfp_id + "-" + idx} className={idx % 2 === 0 ? "bg-blue-50" : ""}>
                  <td className="p-3">{(currentPage - 1) * rowsPerPage + idx + 1}.</td>
                  <td className="p-3">{row.rfp_id}</td>
                  <td className="p-3">{row.vendor_id}</td>
                  <td className="p-3">{row.shared_date ? new Date(row.shared_date).toLocaleDateString("en-GB") : "--"}</td>
                  <td className="p-3">{row.sender_name}</td>
                  <td className="p-3">{row.sender_contact}</td>
                  <td className="p-3 text-blue-600 underline cursor-pointer">{row.vendor_contact || "view vendor contacts"}</td>
                  <td className="p-3">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded">Re-Share</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button className="px-3 py-2 bg-white border rounded" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
        <div className="px-3 py-2 bg-blue-600 text-white rounded">{currentPage}</div>
        <div className="px-2 text-sm">of</div>
        <div className="px-3 py-2 border rounded">{totalPages}</div>
        <button className="px-3 py-2 bg-white border rounded" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
      </div>
    </div>
  );
}
