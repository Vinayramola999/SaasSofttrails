import React from "react";
export default function generatePurchaseOrderPDF({
  company = {
    name: "Higher India Pvt Ltd",
    address: "2/1 Raipur Road,Survey Chowk,",
    city: "Dehradun, Uttarakhand, 248001",
    country: "India",
    gst: "27AABCT1234L1Z5",
    pan: "Generate",
  },
  supplier = {},
  order = {},
  items = [],
  terms = [],
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl">
        <div className="w-full bg-white relative overflow-hidden font-roboto">
          {/* Header Section */}
          <div className="px-4 sm:px-5 pt-3 pb-32 sm:pb-36">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
              {/* Left Column - Logo and Company Info */}
              <div className="flex-1">
                <div className="mb-8">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/0d20f8387f7d9f9d3e05d90d8222dca15904acad?width=275"
                    alt="Soft Trails Logo"
                    className="h-7 w-auto"
                    style={{ width: "138px", height: "29px" }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-gray-800 font-medium text-xs" style={{ fontSize: "12px", lineHeight: "32px" }}>
                    {company.name}
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    {company.address}
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    {company.city}
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    {company.country}
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    <span>GST No: </span>
                    <span>{company.gst}</span>
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    <span>PAN No: </span>
                    <span>{company.pan}</span>
                  </div>
                </div>
              </div>
              {/* Right Column - Order Info and Supplier Details */}
              <div className="flex-1 text-right sm:text-right">
                <h1 className="text-blue-700 font-bold text-right mb-4" style={{ fontSize: "14px", fontWeight: "700", color: "#1E40AF" }}>
                  Purchase Order placed on
                </h1>
                <div className="space-y-1 mb-5">
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    <span>PO Number: </span>
                    <span>{order.number}</span>
                  </div>
                  <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                    <span>Date: </span>
                    <span>{order.date}</span>
                  </div>
                </div>
                <div className="border-t border-blue-300 pt-1 pr-4 flex justify-end">
                  <div
                    className="space-y-1 text-right"
                    style={{ maxWidth: 300, width: "100%", wordBreak: "break-word" }}
                  >
                    {supplier?.name ? (
                      <div className="text-gray-600 font-medium text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                        {supplier.name}
                      </div>
                    ) : null}

                    {supplier?.address ? (
                      <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                        {supplier.address}
                      </div>
                    ) : null}

                    {supplier?.city ? (
                      <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                        {supplier.city}
                      </div>
                    ) : null}

                    {supplier?.phone ? (
                      <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                        <span className="font-medium">Phone:</span>&nbsp;
                        <span>{supplier.phone}</span>
                      </div>
                    ) : null}

                    {supplier?.gst ? (
                      <div className="text-gray-600 text-xs" style={{ fontSize: "10px", lineHeight: "20px" }}>
                        <span className="font-medium">GST:</span>&nbsp;
                        <span>{supplier.gst}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Table Section */}
          <div className="mx-4 sm:mx-5 mb-8">
            <div className="w-full border border-gray-300 overflow-x-auto">
              <table className="w-full text-xs" style={{ fontSize: "8px" }}>
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-bold text-gray-600 w-8" style={{ height: "37px" }}>
                      <div>Sr.</div>
                      <div>No.</div>
                    </th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-bold text-gray-600 w-20">Item</th>
                    <th className="border-r border-gray-300 px-3 py-2 text-center font-bold text-gray-600 flex-1">Description</th>
                    <th className="border-r border-gray-300 px-1 py-2 text-center font-bold text-gray-600 w-8">U/M</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-bold text-gray-600 w-16">
                      <div>Unit</div>
                      <div>Price</div>
                    </th>
                    <th className="border-r border-gray-300 px-1 py-2 text-center font-bold text-gray-600 w-8">Qty</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-bold text-gray-600 w-10">Tax</th>
                    <th className="border-r border-gray-300 px-2 py-2 text-center font-bold text-gray-600 w-16">Total</th>
                    <th className="px-2 py-2 text-center font-bold text-gray-600 w-20">
                      <div>Total with</div>
                      <div>Tax</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = item.qty ?? item.quantity ?? 0;
                    const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
                    const lineTotal = item.total ?? qty * unitPrice;
                    const taxPerc = item.tax ?? item.tax_percentage ?? 0;
                    const totalWithTax = lineTotal + (lineTotal * (taxPerc || 0)) / 100;
                    return (
                      <tr key={idx} className="border-b border-gray-300">
                        <td className="border-r border-gray-300 px-2 py-2 text-center text-black" style={{ height: "35px" }}>{item.sr || idx + 1}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center text-black">{item.item || item.product_name || item.name || "Item"}</td>
                        <td className="border-r border-gray-300 px-3 py-2 text-left text-black">{item.description || item.desc || ""}</td>
                        <td className="border-r border-gray-300 px-1 py-2 text-center text-black">{item.uom || item.unit || "Nos"}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-right text-black">{unitPrice ? `₹${Number(unitPrice).toLocaleString()}` : "--"}</td>
                        <td className="border-r border-gray-300 px-1 py-2 text-center text-black">{qty}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-center text-black">{taxPerc ? `${taxPerc} %` : "--"}</td>
                        <td className="border-r border-gray-300 px-2 py-2 text-right text-black">{`₹${Number(lineTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</td>
                        <td className="px-2 py-2 text-right text-black">{totalWithTax ? `₹${Number(totalWithTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "--"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Terms and Conditions Section */}
          <div className="mx-4 sm:mx-5 mb-8">
            <h3 className="text-gray-800 font-bold mb-2" style={{ fontSize: "14px", fontWeight: "600", lineHeight: "28px" }}>
              Terms and Conditions:
            </h3>
            <div className="space-y-1 text-gray-600" style={{ fontSize: "10px", lineHeight: "20px" }}>
              {(terms || []).map((term, idx) => (
                <div key={idx}>• {term.title}: {term.description}</div>
              ))}
            </div>
          </div>
          {/* Total Amount Section */}
          {/* Compute totals */}
          {(() => {
            const computedAmount = items.reduce((acc, it) => {
              const qty = it.qty ?? it.quantity ?? 0;
              const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
              const line = it.total ?? qty * unitPrice;
              return acc + Number(line || 0);
            }, 0);

            const computedTax = items.reduce((acc, it) => {
              const qty = it.qty ?? it.quantity ?? 0;
              const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
              const line = it.total ?? qty * unitPrice;
              const taxPerc = it.tax ?? it.tax_percentage ?? 0;
              return acc + (Number(line || 0) * (taxPerc || 0)) / 100;
            }, 0);

            const grandTotal = computedAmount + computedTax;

            // Simple number to words (uppercase)
            const toWords = (num) => {
              if (!Number.isFinite(num)) return "ZERO";
              // reuse small conversion from QuotationView style but uppercase and simpler
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

            return (
              <div className="mx-4 sm:mx-5 mb-8 flex justify-end">
                <div className="w-full md:w-1/3 lg:w-1/4 p-4">
                  <div className="border rounded p-4 text-right">
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>Amount</div>
                      <div>₹{computedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <div>Tax</div>
                      <div>₹{computedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>

                    <hr className="my-3" />

                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-700 text-left">
                        <div className="font-medium">Total(INR)</div>
                        <div className="text-xs text-gray-500 mt-1">Total (in words)</div>
                        <div className="text-sm mt-1">{toWords(Math.round(grandTotal))}</div>
                      </div>

                      <div className="text-2xl font-bold">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Footer Section */}
          <div className="mx-4 sm:mx-5 pt-4 border-t border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4">
              <div className="space-y-1">
                <div className="text-gray-500" style={{ fontSize: "8px", lineHeight: "20px" }}>
                  For any queries, contact: Sales@higherindia.net
                </div>
                <div className="text-gray-500" style={{ fontSize: "8px", lineHeight: "20px" }}>
                  Phone: +91 22 1234 5678
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 mb-2" style={{ fontSize: "8px", lineHeight: "20px" }}>
                  Authorized Signatory
                </div>
                <div className="w-28 h-10 border-b border-gray-400 mb-2"></div>
                <div className="text-gray-400" style={{ fontSize: "8px", lineHeight: "16px" }}>
                  TechCorp Solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}