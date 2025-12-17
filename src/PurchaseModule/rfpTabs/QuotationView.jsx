import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const QuotationView = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!quotationId) return setLoading(false);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/Allquotations/${quotationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // API shapes vary. Prefer res.data.data, fallback to res.data
        const payload = res.data?.data ?? res.data ?? null;
        setData(payload);
      } catch (err) {
        console.error("Failed to fetch quotation:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId, token]);

  if (loading) return <div className="p-6">Loading quotation...</div>;

  if (!data)
    return (
      <div className="p-6">
        <div className="mb-4">Quotation not found.</div>
        <button className="border px-4 py-2" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );

  // Try to resolve common fields
  const quotationNo = data.quotation_id || data.quotationId || data.id || "--";
  const quotationDate = data.quotation_date || data.date || null;
  const validity = data.validity_date || data.validity || "--";
  const rfpId = data.rfp_id || data.rfpId || "--";
  const vendor = data.vendor_name || data.vendor || "--";

  // Items may be under different keys
  const items =
    data.items || data.line_items || data.required_items || data.quotation_items || [];

  // If items not found, try to detect an items-like array inside the payload
  const detectItemsFromData = (payload) => {
    if (!payload || typeof payload !== "object") return [];
    // Search top-level values for arrays of objects that look like line items
    for (const key of Object.keys(payload)) {
      const val = payload[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        const sample = val[0];
        // Heuristic: presence of quantity or unit_price or asset_name or item_name or total_amount
        if (
          "quantity" in sample ||
          "unit_price" in sample ||
          "asset_name" in sample ||
          "item_name" in sample ||
          "total_amount" in sample ||
          "amount" in sample
        ) {
          console.debug("Detected items array under key:", key, val);
          return val;
        }
      }
    }
    return [];
  };

  const resolvedItems = items.length > 0 ? items : detectItemsFromData(data);

  // Totals calculation helpers
  const parseNumber = (v) => {
    if (v == null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const amount = (resolvedItems || []).reduce((acc, it) => {
    const line = parseNumber(it.total_amount) || (parseNumber(it.unit_price) * parseNumber(it.quantity));
    return acc + line;
  }, 0);

  const taxTotal = (resolvedItems || []).reduce((acc, it) => {
    const base = parseNumber(it.total_amount) || (parseNumber(it.unit_price) * parseNumber(it.quantity));
    const taxPerc = parseNumber(it.tax_percentage) || parseNumber(it.tax) || 0;
    return acc + (base * taxPerc) / 100;
  }, 0);

  const totalWithTax = amount + taxTotal;

  // Simple number to words (supports up to crores)
  const numberToWords = (num) => {
    if (!Number.isFinite(num)) return "zero rupees";
    const a = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + inWords(n % 100) : "");
      if (n < 100000) return inWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
      return inWords(Math.floor(n / 10000000)) + " crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    };

    const rounded = Math.floor(Math.abs(num));
    const words = rounded === 0 ? "zero" : inWords(rounded);
    return words.charAt(0).toUpperCase() + words.slice(1) + " rupees.";
  };

  const totalInWords = numberToWords(Math.round(totalWithTax));

  return (
    <div className="p-6 min-h-[70vh]">
      {/* Top breadcrumb/header (back button + breadcrumbs + RFP id) */}
      <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl p-2 rounded-full hover:bg-gray-100"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <div className="text-xs text-gray-600">
              {vendor || "Vendor Name"} &nbsp; &gt; &nbsp; {data.contact_person || data.vendor_contact_name || ""} &nbsp; &gt; &nbsp; 
            </div>
            <div className="text-sm font-semibold mt-1">{rfpId || "--"}</div>
          </div>
        </div>
        {/* Right side intentionally left empty (removed Reject Quotation button) */}
        <div />
      </div>
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Quotation</h2>
            <div className="mt-3 text-sm text-gray-700">
              <div>
                <strong>Quotation No.</strong> {quotationNo}
              </div>
              <div>
                <strong>Quotation date</strong> {quotationDate ? new Date(quotationDate).toLocaleDateString() : "--"}
              </div>
              <div>
                <strong>Validity date</strong> {validity ? new Date(validity).toLocaleDateString() : "--"  }
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-700">
            <div>
              <strong>RFP ID.</strong> {rfpId}
            </div>
           
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Item & Description</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Tax (%)</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {resolvedItems && resolvedItems.length > 0 ? (
                resolvedItems.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 align-top">
                      <div className="font-semibold">{it.asset_name || it.item_name || it.name || it.material_name || "Item"}</div>
                      <div className="text-sm text-gray-600">{it.description || it.desc || ""}</div>
                    </td>
                    <td className="p-3 text-center">{it.quantity ?? it.qty ?? "--"}</td>
                    <td className="p-3 text-center">{it.unit_price ? `₹${Number(it.unit_price).toLocaleString()}` : (it.price ? `₹${it.price}` : "--")}</td>
                    <td className="p-3 text-center">{it.tax_percentage ?? it.tax ?? "--"}</td>
                    <td className="p-3 text-center">{it.total_amount ? `₹${Number(it.total_amount).toLocaleString()}` : (it.amount ? `₹${it.amount}` : "--")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-600">
                    No line items available for this quotation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals - right aligned to match screenshot */}
        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-1/3 lg:w-1/4 p-4">
            <div className="border rounded p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <div>Amount</div>
                <div>₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <div>Taxable amount</div>
                <div>₹{(amount - taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Total(INR)</div>
                  <div className="text-xs text-gray-500 mt-1">Total (in words)</div>
                  <div className="text-sm mt-1">{totalInWords}</div>
                </div>

                <div className="text-2xl font-bold">₹{totalWithTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
