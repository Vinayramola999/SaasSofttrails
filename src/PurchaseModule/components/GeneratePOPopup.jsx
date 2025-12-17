import axios from "axios";
import React, { useEffect, useState } from "react";
import API from "../../config/api";
import TermsConditionsForm from "./TermsConditionsForm;";
// import generatePOPDF from "./GeneratePopdf";
import generatePurchaseOrderPDF from "./Generate";
import generatePOPDF from "./GeneratePOPDF";
import PopupModal from "../PopupModal";
const GeneratePOPopup = ({ open, fetchPOs, onClose }) => {
  const [form, setForm] = useState({
    quotationId: "",
    vendorName: "",
    productName: "",
    unit: "",
    quantity: 0,
    unitPrice: "",
    deliveryDate: "",
    deliveryAddress: "",
    terms: "",
  });
  const [company, setCompany] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    gst: "",
    pan: "",
  });
  const [supplier, setSupplier] = useState({});
  const [poNumber, setPoNumber] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [productItems, setProductItems] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();

  useEffect(() => {
    if (open) {
      const date = new Date();
      const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(1000 + Math.random() * 9000);
      setPoNumber(`PO-${yyyymmdd}-${random}`);
      fetchQuotations();
    }
  }, [open]);

  const fetchQuotations = async () => {
    try {
      const res = await axios.get(`${API.PURCHASE_API}/supplier_quotation/Allquotations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && Array.isArray(res.data.data)) {
        setQuotations(res.data.data);
      }
    } catch (err) {
      setQuotations([]);
      console.error("Error fetching quotations", err);
    }
  };

  const fetchCompanyDetails = async (quotationId) => {
    try {
      const res = await axios.get(`${API.PURCHASE_API}/supplier_quotation/vendor_details/${quotationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const org = res.data?.data?.organization || {};
      setCompany({
        name: org.name || "",
        address: org.address || "",
        city: org.city || "",
        country: org.country || "",
        gst: org.gst_number || "",
        pan: org.pan_no || "",
      });
    } catch (err) {
      setCompany({
        name: "",
        address: "",
        city: "",
        country: "",
        gst: "",
        pan: "",
      });
    }
  };
  const fetchQuotationDetails = async (id) => {
    if (!id) return;
    try {
      // Fetch main quotation details
      const res = await axios.get(`${API.PURCHASE_API}/supplier_quotation/Allquotations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch vendor details (NEW API)
      const vendorRes = await axios.get(`${API.PURCHASE_API}/supplier_quotation/vendor_details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Merge both API responses
      const detail = res.data?.data || {};
      const vendorDetail = vendorRes.data?.data || {};
      await fetchCompanyDetails(id);

      // Store all data from both APIs
      setVendorName(detail.vendor_name || vendorDetail.vendor_name || "");
      setProductItems([
        {
          product_name: detail.asset_name,
          unit: detail.uom,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          vendor_address: vendorDetail.vendor_address || detail.vendor_address,
          vendor_city: vendorDetail.vendor_city || detail.vendor_city,
          vendor_phone: vendorDetail.vendor_phone || detail.vendor_phone,
          vendor_gst: vendorDetail.vendor_gst || detail.vendor_gst,
          description: detail.description,
          tax: detail.tax,
        },
      ]);
      setForm((prev) => ({
        ...prev,
        quotationId: detail.quotation_id,
        vendorName: detail.vendor_name || vendorDetail.vendor_name || "",
        productName: detail.asset_name || "",
        unit: detail.uom || "",
        quantity: detail.quantity || 0,
        unitPrice: detail.unit_price || "",
      }));
      setSupplier({
        name: detail.supplier_name || vendorDetail.vendor_name,
        address: vendorDetail.vendor_address || detail.vendor_address,
        city: vendorDetail.city || detail.city,
        phone: vendorDetail.landline_num || detail.landline_num,
        gst: vendorDetail.gst_number || detail.gst_number,
      });
    } catch (err) {
      setVendorName("");
      setProductItems([]);
      setSearchError("Quotation details not found");
    }
  };

  // const fetchQuotationDetails = async (id) => {
  //   if (!id) return;
  //   try {
  //     const res = await axios.get(
  //       `https://devapi.softtrails.net/saas/purchase/test/purchase/supplier_quotation/Allquotations/${id}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (res.data && res.data.data) {
  //       const detail = res.data.data;
  //       setVendorName(detail.vendor_name || "");
  //       setProductItems([
  //         {
  //           product_name: detail.asset_name,
  //           unit: detail.uom,
  //           quantity: detail.quantity,
  //           unit_price: detail.unit_price,
  //           vendor_address: detail.vendor_address,
  //           vendor_city: detail.vendor_city,
  //           vendor_phone: detail.vendor_phone,
  //           vendor_gst: detail.vendor_gst,
  //           description: detail.description,
  //           tax: detail.tax,
  //         },
  //       ]);
  //       setForm((prev) => ({
  //         ...prev,
  //         quotationId: detail.quotation_id,
  //         vendorName: detail.vendor_name || "",
  //         productName: detail.asset_name || "",
  //         unit: detail.uom || "",
  //         quantity: detail.quantity || 0,
  //         unitPrice: detail.unit_price || "",
  //       }));
  //       setSupplier({
  //         name: detail.vendor_name,
  //         address: detail.vendor_address,
  //         city: detail.vendor_city,
  //         phone: detail.vendor_phone,
  //         gst: detail.vendor_gst,
  //       });
  //     } else {
  //       setVendorName("");
  //       setProductItems([]);
  //       setSearchError("Quotation details not found.");
  //     }
  //   } catch (err) {
  //     setVendorName("");
  //     setProductItems([]);
  //     setSearchError("Quotation details not found");
  //   }
  // };

  const getDmsPublishId = async (service_name, doctype, doc_name) => {
    try {
      const res = await axios.get(API.DMS_MAPPING_CHECK, {
        params: { service_name, doctype, doc_name },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.dms_publish_id) throw new Error("No publish_id returned");
      return res.data.dms_publish_id;
    } catch (err) {
      const msg = err.response?.data?.error || "Unknown error";
      throw new Error(msg);
    }
  };

  const handleGeneratePO = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in session storage");
      const publish_id = await getDmsPublishId(
        "purchase",
        "Purchase Order",
        "Purchase Order"
      );

      // Prepare PO data for PDF
      const poData = {
        company,
        supplier,
        order: {
          number: poNumber,
          date: form.deliveryDate || new Date().toLocaleDateString(),
          totalAmount:
            (productItems[0]?.quantity || 0) *
            (productItems[0]?.unit_price || 0),
          amountInWords: "", // Add conversion if needed
        },
        items: productItems.map((item, idx) => ({
          sr: idx + 1,
          item: item.product_name,
          description: item.description || "",
          uom: item.unit,
          unitPrice: item.unit_price,
          qty: item.quantity,
          tax: item.tax || "",
          total: (item.quantity || 0) * (item.unit_price || 0),
          totalWithTax: "", // optional
        })),
        terms: form.terms || [],
        returnBlob: true,
      };

      let pdfBlob = await generatePOPDF(poData);

      if (!(pdfBlob instanceof Blob)) {
        pdfBlob = new Blob([pdfBlob], { type: "application/pdf" });
      }

      // 3. Prepare FormData for DMS upload
      const fileFormData = new FormData();
      fileFormData.append("documents", pdfBlob, `${poNumber}.pdf`);
      fileFormData.append("ref", "PO");
      fileFormData.append(
        "metadata",
        JSON.stringify([
          {
            service: "purchase",
            publish_id,
            user_id: userId,
            document_name: `${poNumber}.pdf`,
          },
        ])
      );
      fileFormData.append("custom_folder", "purchase");

      // 4. Upload PDF to DMS
      const fileUploadRes = await axios.post(API.DMS_UPLOAD, fileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const fileUrl = fileUploadRes.data?.uploaded_files?.[0]?.file_url;
      if (!fileUrl) throw new Error("PO document upload failed");

      // 5. Create PO with file URL
      const poPayload = {
        po_id: poNumber,
        quotation_id: quotationId,
        delivery_date: form.deliveryDate,
        delivery_address: form.deliveryAddress,
        po_file: fileUrl,
      };

      await axios.post(`${API.PURCHASE_API}/purchase_order/createPO`, poPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

    // Refresh parent table and close popup immediately
    if (fetchPOs) {
      try {
        await fetchPOs();
      } catch (e) {
        console.warn("fetchPOs threw:", e);
      }
    }
    if (onClose) onClose();

    // Reset form/state
    setForm({
      quotationId: "",
      vendorName: "",
      productName: "",
      unit: "",
      quantity: 0,
      unitPrice: "",
      deliveryDate: "",
      deliveryAddress: "",
      terms: "",
    });
    setCompany({
      name: "",
      address: "",
      city: "",
      country: "",
      gst: "",
      pan: "",
    });
    setSupplier({});
    setPoNumber("");
    setQuotationId("");
    setVendorName("");
    setProductItems([]);
    setSearchError("");

    // Show success modal to user (non-blocking)
    setModalProps({
      type: "success",
      title: "Success!",
      message: "Purchase Order generated and uploaded successfully.",
      onClose: () => setShowModal(false),
    });
    setShowModal(true);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to generate Purchase Order."
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 scrollbar-hide">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0057FF] to-[#1E90FF] rounded-t-xl px-6 py-4 flex justify-between items-center">
          <div className="text-white text-lg font-semibold">
            Create Purchase Order
          </div>
          <div className="flex items-center gap-6">
            <div className="text-white font-medium">PO #: {poNumber}</div>
            <button
              className="text-white text-2xl"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="px-8 py-6">
          {/* Quotation ID & Vendor Name */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Quotation ID</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={quotationId}
                onChange={(e) => {
                  setQuotationId(e.target.value);
                  fetchQuotationDetails(e.target.value);
                }}
              >
                <option value="">Select Quotation</option>
                {quotations.map((q) => (
                  <option key={q.quotation_id} value={q.quotation_id}>
                    {q.quotation_id}
                  </option>
                ))}
              </select>
              {searchError && (
                <div className="text-red-500 text-sm mt-1">{searchError}</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Vendor Name</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                value={vendorName}
                readOnly
              />
            </div>
          </div>

          {/* Product Items */}
          <div className="mb-4 font-semibold text-gray-700">Product Items</div>
          {productItems.length > 0 ? (
            productItems.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 mb-4 bg-[#F7F9FB] p-4 rounded-lg"
              >
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Product Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value={item.product_name}
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Unit</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value={item.unit}
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value={item.quantity}
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">Unit Price</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value={item.unit_price}
                    readOnly
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 mb-6">No items available</div>
          )}

          {/* Delivery Information */}
          <div className="mb-4 font-semibold text-gray-700">
            Delivery Information
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Delivery Date</label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2"
                value={form.deliveryDate}
                onChange={(e) =>
                  setForm({ ...form, deliveryDate: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Delivery Address</label>
              <input
                type="text"
                placeholder="Enter delivery address"
                className="w-full border rounded-lg px-3 py-2"
                value={form.deliveryAddress}
                onChange={(e) =>
                  setForm({ ...form, deliveryAddress: e.target.value })
                }
              />
            </div>
          </div>

          <TermsConditionsForm
            onChange={(updatedTerms) =>
              setForm((prev) => ({ ...prev, terms: updatedTerms }))
            }
          />

          {/* Total Amount */}
          <div className="flex justify-between items-center mb-6">
            <div className="font-semibold text-gray-700">Total Amount:</div>
            <div className="text-[#0057FF] text-xl font-bold">
              ₹
              {(
                (productItems[0]?.quantity || 0) *
                (productItems[0]?.unit_price || 0)
              ).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-2">
            <button
              type="button"
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold"
              onClick={handleGeneratePO}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#0057FF] text-white py-2 rounded-lg font-semibold"
              // You can add your send PO logic here
            >
              Send Purchase Order
            </button>
          </div>
        </form>
      </div>
      {showModal && <PopupModal {...modalProps} />}
    </div>
  );
};

export default GeneratePOPopup;
