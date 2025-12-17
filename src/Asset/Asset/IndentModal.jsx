import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE } from "../../config/apiBase"
const IndentModal = ({ asset, onClose }) => {
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");

  const [budgetList, setBudgetList] = useState([]);
  const [categoryName, setCategoryName] = useState("Loading...");

  const [selectedBudget, setSelectedBudget] = useState(null);

  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(true);

  // ---------- MESSAGE MODAL STATES ----------
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, warning

  const token = sessionStorage.getItem("token");
  const user_id = sessionStorage.getItem("userId");
  const categoryId = asset?.category_id;

  // Fetch Category
  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(
        "https://devapi.softtrails.net/saas/java/test/api/categories/rawmaterials",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const match = res.data.find((c) => c.categoryId === categoryId);
        setCategoryName(match ? match.categoriesname : "N/A");
      })
      .finally(() => setLoadingCategory(false));
  }, [categoryId]);

  // Workflow list


  // Budget list
  useEffect(() => {
    axios
      .get(
        `https://devapi.softtrails.net/saas/purchase/test/purchase/budget/department/${user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setBudgetList(
          (res.data?.budgets || []).map((b) => ({
            value: b.id,
            label: b.name,
            workflow_id: b.workflow_id,
            workflow_name: b.workflow_name,
          }))
        );
      })
      .finally(() => setLoadingBudget(false));
  }, [asset]);

  // ----------- SUBMIT HANDLER WITH MESSAGE MODAL -----------
  const handleSubmit = async () => {
    if (!selectedBudget || !quantity) {
      setMessage("Please fill all required fields");
      setMessageType("warning");
      return;
    }

    if (!selectedBudget.workflow_id) {
      setMessage("Selected budget does not have a linked workflow.");
      setMessageType("error");
      return;
    }

    const payload = {
      user_id,
      workflow_id: selectedBudget.workflow_id,
      products: [
        {
          asset_name: asset.material_name,
          quantity: Number(quantity),
          uom: asset.uom,
          category: categoryName,
          request_for: "Raw Materials",
          remarks,
          budget: selectedBudget.value,
        },
      ],
    };

    try {
      await axios.post(
        "https://devapi.softtrails.net/saas/purchase/test/purchase/indenting",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // SUCCESS MESSAGE
      setMessage("Indent Created Successfully!");
      setMessageType("success");

      // Auto-close modal after message disappears
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      // ERROR MESSAGE
      setMessage("Indent request failed. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] overflow-hidden"
          >
            {/* HEADER */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Raise Indent Request</h2>
                <p className="text-xs text-gray-500 mt-1">Submit a new request for approval</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              {/* ASSET DETAILS CARD */}
              <div className="bg-slate-50 rounded-xl p-4 border border-blue-100/50 mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Asset Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Material Name</span>
                    <p className="font-semibold text-gray-800 text-sm truncate" title={asset.material_name}>
                      {asset.material_name}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Category</span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {loadingCategory ? "Loading..." : categoryName}
                    </p>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">UOM</span>
                    <p className="font-medium text-gray-800 text-sm bg-white px-2 py-0.5 rounded border border-gray-200 inline-block">
                      {asset.uom}
                    </p>
                  </div>
                </div>
              </div>

              {/* INDENT FORM */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Select Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Select Budget <span className="text-red-500">*</span>
                    </label>
                    <Select
                      isLoading={loadingBudget}
                      options={budgetList}
                      value={selectedBudget}
                      onChange={setSelectedBudget}
                      placeholder="Choose a budget..."
                      classNamePrefix="react-select"
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 8,
                        colors: {
                          ...theme.colors,
                          primary: "#2563eb",
                        },
                      })}
                    />
                  </div>

                  {/* Linked Workflow */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Linked Workflow
                    </label>
                    <div className={`w-full p-2.5 border rounded-lg text-sm flex items-center justify-between ${selectedBudget?.workflow_name
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}>
                      <span className="font-medium">
                        {selectedBudget?.workflow_name || "Auto-selected via Budget"}
                      </span>
                      {selectedBudget?.workflow_name && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                          LINKED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quantity Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Remarks
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any additional notes here..."
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                Submit Indent
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </>
  );
};

export default IndentModal;
