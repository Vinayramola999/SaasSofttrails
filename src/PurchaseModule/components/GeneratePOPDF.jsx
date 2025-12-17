// // import jsPDF from "jspdf";
// // import "jspdf-autotable";

// // export default function generatePOPDF({ company, supplier, order, items, terms, returnBlob = true }) {
// //   const doc = new jsPDF();

// //   // Header
// //   doc.setFontSize(14);
// //   doc.text(company?.name || "", 14, 20);
// //   doc.setFontSize(10);
// //   doc.text(
// //     [
// //       company?.address,
// //       company?.city,
// //       company?.country
// //     ].filter(Boolean).join(", "),
// //     14, 28
// //   );
// //   doc.text(
// //     `GST: ${company?.gst || ""} | PAN: ${company?.pan || ""}`,
// //     14, 34
// //   );

// //   // Supplier Info
// //   doc.setFontSize(10);
// //   doc.text(`Supplier: ${supplier?.name || ""}`, 14, 50);
// //   doc.text(
// //     [supplier?.address, supplier?.city].filter(Boolean).join(", "),
// //     14, 56
// //   );
// //   doc.text(
// //     `Phone: ${supplier?.phone || ""} | GST: ${supplier?.gst || ""}`,
// //     14, 62
// //   );

// //   // Order Info
// //   doc.text(`PO Number: ${order?.number || ""}`, 150, 20);
// //   doc.text(`Date: ${order?.date || ""}`, 150, 26);

// //   // Table
// //   doc.autoTable({
// //     startY: 70,
// //     head: [["Sr No", "Item", "Description", "U/M", "Unit Price", "Qty", "Tax", "Total"]],
// //     body: (items || []).map((item, idx) => [
// //       idx + 1,
// //       item.item || item.product_name || "",
// //       item.description || "",
// //       item.uom || item.unit || "",
// //       item.unitPrice || item.unit_price || "",
// //       item.qty || item.quantity || "",
// //       item.tax || "",
// //       item.total || ((item.quantity || 0) * (item.unit_price || 0)) || "",
// //     ]),
// //     styles: { fontSize: 9 },
// //     headStyles: { fillColor: [240, 240, 240], textColor: 50 },
// //   });

// //   // Terms & Conditions
// //   let y = doc.lastAutoTable.finalY + 10;
// //   doc.setFontSize(12);
// //   doc.text("Terms & Conditions:", 14, y);
// //   y += 6;

// //   if (Array.isArray(terms) && terms.length > 0) {
// //     doc.setFontSize(10);
// //     terms.forEach((t, i) => {
// //       // If t is an object with title/description
// //       if (typeof t === "object" && (t.title || t.description)) {
// //         doc.text(`• ${t.title ? t.title + ": " : ""}${t.description || ""}`, 18, y);
// //       } else if (typeof t === "string") {
// //         doc.text(`• ${t}`, 18, y);
// //       }
// //       y += 6;
// //     });
// //   }

// //   // Total
// //   y += 10;
// //   doc.setFontSize(12);
// //   doc.text(`TOTAL AMOUNT :`, 14, y);
// //   doc.setFontSize(12);
// //   doc.text(`${order?.totalAmount || ""}`, 70, y);
// //   y += 8;
// //   if (order?.amountInWords) {
// //     doc.setFontSize(11);
// //     doc.text(order.amountInWords, 14, y);
// //     y += 6;
// //     doc.text("Rupees", 14, y);
// //   }

// //   // Footer
// //   y += 20;
// //   doc.setFontSize(9);
// //   doc.text("For any queries, contact: Sales@higherindia.net", 14, 285);
// //   doc.text("Phone: +91 22 1234 5678", 14, 290);
// //   doc.text("Authorized Signatory", 150, 285);
// //   doc.text("TechCorp Solutions", 150, 290);

// //   // Return as Blob (for DMS upload) or Save
// //   if (returnBlob) {
// //     return doc.output("blob");
// //   } else {
// //     doc.save(`${order?.number || "PO"}.pdf`);
// //   }
// // }

// import jsPDF from "jspdf";
// import "jspdf-autotable";

// export default function generatePOPDF({
//   company = {
//     name: "Higher India Pvt Ltd",
//     address: "2/1 Raipur Road, Survey Chowk,",
//     city: "Dehradun, Uttarakhand, 248001",
//     country: "India",
//     gst: "27AABCT1234L1Z5",
//     pan: "AABCT1234L",
//   },
//   supplier = {
//     name: "ABC Suppliers Pvt Ltd",
//     address: "123 Industrial Area, Phase-II",
//     city: "Delhi, India",
//     phone: "+91 9876543210",
//     gst: "07AACCF1234Q1Z2",
//   },
//   order = {},
//   items = [],
//   terms = [],
//   returnBlob = true,
// }) {
//   const doc = new jsPDF();

//   // Company Header
//   doc.setFontSize(14);
//   doc.text(company.name, 14, 20);
//   doc.setFontSize(10);
//   doc.text(
//     [company.address, company.city, company.country].filter(Boolean).join(", "),
//     14,
//     28
//   );
//   doc.text(`GST: ${company.gst} | PAN: ${company.pan}`, 14, 34);

//   // Logo placeholder (if you add image from assets)
//   // Example:
//   // const img = new Image();
//   // img.src = '/assets/logo.png'; // path to your logo
//   // doc.addImage(img, 'PNG', 160, 10, 35, 20);

//   // Supplier Info (dummy for now)
//   doc.setFontSize(10);
//   doc.text(`Supplier: ${supplier.name}`, 14, 50);
//   doc.text(
//     [supplier.address, supplier.city].filter(Boolean).join(", "),
//     14,
//     56
//   );
//   doc.text(
//     `Phone: ${supplier.phone} | GST: ${supplier.gst}`,
//     14,
//     62
//   );

//   // Order Info
//   doc.text(`PO Number: ${order.number || "PO-0001"}`, 150, 20);
//   doc.text(`Date: ${order.date || new Date().toLocaleDateString()}`, 150, 26);

//   // Table
//   doc.autoTable({
//     startY: 70,
//     head: [
//       ["Sr No", "Item", "Description", "U/M", "Unit Price", "Qty", "Tax", "Total"],
//     ],
//     body: (items || []).map((item, idx) => [
//       idx + 1,
//       item.item || item.product_name || "",
//       item.description || "",
//       item.uom || item.unit || "",
//       item.unitPrice || item.unit_price || "",
//       item.qty || item.quantity || "",
//       item.tax || "",
//       item.total || (item.quantity || 0) * (item.unit_price || 0) || "",
//     ]),
//     styles: { fontSize: 9 },
//     headStyles: { fillColor: [240, 240, 240], textColor: 50 },
//   });

//   // Terms & Conditions
//   let y = doc.lastAutoTable.finalY + 10;
//   doc.setFontSize(12);
//   doc.text("Terms & Conditions:", 14, y);
//   y += 6;

//   if (Array.isArray(terms) && terms.length > 0) {
//     doc.setFontSize(10);
//     terms.forEach((t) => {
//       if (typeof t === "object" && (t.title || t.description)) {
//         doc.text(`• ${t.title ? t.title + ": " : ""}${t.description || ""}`, 18, y);
//       } else if (typeof t === "string") {
//         doc.text(`• ${t}`, 18, y);
//       }
//       y += 6;
//     });
//   }

//   // Total
//   y += 10;
//   doc.setFontSize(12);
//   doc.text("TOTAL AMOUNT :", 14, y);
//   doc.text(`${order.totalAmount || "0.00"}`, 70, y);
//   y += 8;
//   if (order.amountInWords) {
//     doc.setFontSize(11);
//     doc.text(order.amountInWords, 14, y);
//     y += 6;
//     doc.text("Rupees", 14, y);
//   }

//   // Footer
//   y += 20;
//   doc.setFontSize(9);
//   doc.text("For any queries, contact: Sales@higherindia.net", 14, 285);
//   doc.text("Phone: +91 22 1234 5678", 14, 290);
//   doc.text("Authorized Signatory", 150, 285);
//   doc.text("Higher India Pvt Ltd", 150, 290);

//   // Return Blob or Save
//   if (returnBlob) {
//     return doc.output("blob");
//   } else {
//     doc.save(`${order.number || "PO"}.pdf`);
//   }
// }

import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from '../../assests/Logo.png';
export default function generatePOPDF({
  company = {
    name: "Higher India Pvt Ltd",
    address: "2/1 Raipur Road, Survey Chowk,",
    city: "Dehradun, Uttarakhand, 248001",
    country: "India",
    gst: "27AABCT1234L1Z5",
    pan: "AABCT1234L",
  },
  supplier = {
    name: "ABC Suppliers Pvt Ltd",
    address: "123 Industrial Area, Phase-II",
    city: "Delhi, India",
    phone: "+91 9876543210",
    gst: "07AACCF1234Q1Z2",
  },
  order = {},
  items = [],
  terms = [],
  returnBlob = true,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header layout
  const leftX = 40;
  const rightX = pageWidth - 40;

    doc.addImage(logo, "PNG", 14, 10, 30, 15); 

  let curY = 36;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Higher India Pvt Ltd", leftX, curY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const addr = [company.address || "2/1 Raipur Road, Survey Chowk,", company.city || "Dehradun, Uttarakhand, 248001", company.country || "India"].filter(Boolean).join(", ");
  doc.text(addr, leftX, curY + 14);
  doc.text(`GST: ${company.gst || "27AABCT1234L1Z5"}`, leftX, curY + 28);
  doc.text(`PAN: ${company.pan || "AABCT1234L"}`, leftX, curY + 42);

  // Purchase Order title (right)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Purchase Order Placed On", rightX, 36, { align: "right" });

  // PO Number and Date under title (right aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`PO Number: ${order.number || "PO-0001"}`, rightX, 54, { align: "right" });
  doc.text(`Date: ${order.date || new Date().toLocaleDateString()}`, rightX, 68, { align: "right" });

  // Supplier block - boxed on right under the PO details
  const supplierBoxTop = 84;
  // Build supplier lines and wrap them to the box width so height adapts to content
  const supplierLinesRaw = [];
  if (supplier?.name) supplierLinesRaw.push(supplier.name);
  if (supplier?.address) supplierLinesRaw.push(supplier.address);
  if (supplier?.city) supplierLinesRaw.push(supplier.city);
  if (supplier?.phone) supplierLinesRaw.push(`Phone: ${supplier.phone}`);
  if (supplier?.gst) supplierLinesRaw.push(`GST: ${supplier.gst}`);

  const boxWidth = 220; // reasonable width for supplier box
  const boxLeft = rightX - boxWidth; // keep right margin same as rightX
  const fontSizeSupplier = 10;
  const lineHeight = fontSizeSupplier + 4;

  // Wrap each raw line into array of wrapped lines
  doc.setFontSize(fontSizeSupplier);
  const wrappedLines = supplierLinesRaw.map((ln) => doc.splitTextToSize(ln, boxWidth - 16));
  const totalWrapped = wrappedLines.reduce((sum, arr) => sum + arr.length, 0);

  const headerHeight = 14; // space for "Supplier:" header
  const padding = 8;
  const boxHeight = padding + headerHeight + totalWrapped * lineHeight + padding;

  doc.setDrawColor(220);
  doc.rect(boxLeft, supplierBoxTop - 6, boxWidth, boxHeight);

  // Draw header and lines
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Supplier:", boxLeft + 8, supplierBoxTop + 8);
  doc.setFont("helvetica", "normal");

  // Start y position for wrapped content
  let sy = supplierBoxTop + 8 + headerHeight;
  wrappedLines.forEach((arr) => {
    arr.forEach((textLine) => {
      doc.text(textLine, boxLeft + 8, sy);
      sy += lineHeight;
    });
  });

  // Move to table start
  const tableStartY = supplierBoxTop + 86;

  // Table - items
  doc.autoTable({
    startY: tableStartY,
    head: [
      ["Sr. No.", "Item", "Description", "U/M", "Unit Price", "Qty", "Tax", "Total"],
    ],
    body: (items || []).map((item, idx) => [
      idx + 1,
      item.item || item.product_name || "",
      item.description || "",
      item.uom || item.unit || "",
      item.unitPrice != null ? String(item.unitPrice) : String(item.unit_price || ""),
      item.qty != null ? String(item.qty) : String(item.quantity || ""),
      item.tax || "",
      item.total != null ? String(item.total) : String(((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)),
    ]),
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [245, 245, 245], textColor: 40, halign: "center" },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 110 },
      2: { cellWidth: 130 },
      3: { cellWidth: 40 },
      4: { cellWidth: 70 },
      5: { cellWidth: 40 },
      6: { cellWidth: 40 },
      7: { cellWidth: 70 },
    },
    didDrawPage: function (data) {
      // optional: draw a thin separator line below header
      doc.setDrawColor(230);
      doc.line(leftX, tableStartY - 12, pageWidth - leftX, tableStartY - 12);
    },
  });

  // Terms & Conditions
  let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : tableStartY + 120;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions:", leftX, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (Array.isArray(terms) && terms.length > 0) {
    terms.forEach((t) => {
      const line = typeof t === "string" ? `• ${t}` : `• ${t.title ? t.title + ": " : ""}${t.description || ""}`;
      const split = doc.splitTextToSize(line, pageWidth - leftX * 2);
      doc.text(split, leftX, y);
      y += split.length * 12;
    });
  } else {
    doc.text("• Standard terms apply.", leftX, y);
    y += 14;
  }

  // Totals block (right bottom) - compute from items
  const computedAmount = (items || []).reduce((acc, it) => {
    const qty = it.qty ?? it.quantity ?? 0;
    const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
    const line = it.total != null ? Number(it.total) : Number(qty) * Number(unitPrice || 0);
    return acc + Number(line || 0);
  }, 0);

  const computedTax = (items || []).reduce((acc, it) => {
    const qty = it.qty ?? it.quantity ?? 0;
    const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
    const line = it.total != null ? Number(it.total) : Number(qty) * Number(unitPrice || 0);
    const taxPerc = it.tax ?? it.tax_percentage ?? 0;
    return acc + (Number(line || 0) * Number(taxPerc || 0)) / 100;
  }, 0);

  const grandTotal = computedAmount + computedTax;

  // simple number to words (uppercase RUPEES)
  const toWords = (num) => {
    if (!Number.isFinite(num)) return "ZERO RUPEES";
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
    return words.toUpperCase() + " RUPEES";
  };

  // Render totals block on the right
  y += 14;
  const labelX = pageWidth - 260; // left edge of totals block
  const valueX = pageWidth - 40; // right aligned value

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Amount:", labelX, y);
  doc.text(`₹${computedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, y, { align: "right" });

  y += 14;
  doc.text("Tax:", labelX, y);
  doc.text(`₹${computedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL (INR):", labelX, y);
  doc.text(`₹${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX, y, { align: "right" });

  // Amount in words
  const words = order.amountInWords || toWords(Math.round(grandTotal));
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  // place words at left margin
  doc.text(words, leftX, y);
  y += 12;
  doc.text("Rupees", leftX, y);

  // Footer (authorized signatory etc.)
  const footerY = Math.max(y + 30, doc.internal.pageSize.getHeight() - 60);
  doc.setFontSize(9);
  doc.text("For any queries, contact: Sales@higherindia.net", leftX, footerY - 6);
  doc.text("Phone: +91 22 1234 5678", leftX, footerY + 6);
  doc.text("Authorized Signatory", pageWidth - 160, footerY - 6);
  doc.text(company.name || "", pageWidth - 160, footerY + 10);

  // Return Blob or save
  if (returnBlob) {
    return doc.output("blob");
  } else {
    doc.save(`${order.number || "PO"}.pdf`);
  }
}