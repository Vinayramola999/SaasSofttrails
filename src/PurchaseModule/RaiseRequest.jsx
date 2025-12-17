import { Select, MenuItem, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import API from "../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Icon } from "@iconify/react";
import PopupModal from "./PopupModal";

const RaiseRequest = ({ deptName }) => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [assetType, setAssetType] = useState(" "); // Default to "new"
  const [requestFor, setRequestFor] = useState("");
  const [category, setCategory] = useState("");
  const [requestAsset, setRequestAsset] = useState("");
  const [customAsset, setCustomAsset] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [uom, setUom] = useState("");
  const [materialData, setMaterialData] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [allocation, setAllocation] = useState(null);
  const [requestForOptions, setRequestForOptions] = useState([
    "Movable",
    "Raw Materials",
    "Sales",
    "Create New",
  ]);
  const [showCreateNewInput, setShowCreateNewInput] = useState(false);
  const [newRequestForValue, setNewRequestForValue] = useState("");
  // ...rest of your state...
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]); // Stores fetched workflows
  const [selectedWorkflow, setSelectedWorkflow] = useState(""); // Stores selected workflow
  const [budgetOptions, setBudgetOptions] = useState([]); // Store All Budgets
  const [selectedBudget, setSelectedBudget] = useState("");
  const { userId } = useParams();
  const [employeeId, setEmployeeId] = useState(null);
  const navigate = useNavigate();
  const canShowRestOfForm = requestFor && category && requestAsset;
  // ...existing imports...
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const storedEmployeeId = sessionStorage.getItem("employeeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
  }, [userId]);

  const resetForm = () => {
    setRequestAsset("");
    setCategory("");
    setRequestFor("");
    setSelectedWorkflow("");
    setBudget("");
    setQuantity("");
    setUom("");
    setBudget("");
    setDescription("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const assetToSubmit =
      requestAsset === "Others" ? customAsset : requestAsset;

    const missingFields = [];

    if (!requestFor) missingFields.push("Request For");
    if (!category) missingFields.push("Category");
    if (!assetToSubmit) missingFields.push("Asset");
    if (!quantity) missingFields.push("Quantity");
    if (!uom) missingFields.push("UOM");
    // if (!selectedWorkflow) missingFields.push("Workflow");
    if (!selectedBudget) missingFields.push("Budget");

    if (missingFields.length > 0) {
      setModalProps({
        type: "error",
        title: "Missing Fields!",
        message: (
          <div>
            <div className="mb-2 text-base">
              Please fill the following fields before submitting:
            </div>
            <div className="text-sm text-gray-700">
              {missingFields.join(", ")}
            </div>
          </div>
        ),
      });

      setShowModal(true);
      return;
    }

    const payload = {
      user_id: createdBy,
      asset_name: assetToSubmit,
      quantity,
      remarks: description,
      uom,
      category,
      request_for: requestFor,
      workflow_id: selectedWorkflow,
      budget: selectedBudget,
    };

    try {
      const response = await axios.post(`${API.PURCHASE_API}/indenting`, payload, { headers: { Authorization: `Bearer ${token}` } });

      console.log("Response:", response.data);

      setModalProps({
        type: "success",
        title: "Success!",
        message: "Request submitted successfully!",
      });
      setShowModal(true);

      // Optional: clear form after success
      setRequestFor("");
      setCategory("");
      setRequestAsset("");
      setCustomAsset("");
      setQuantity("");
      setUom("");
      setDescription("");
      setSelectedWorkflow("");
      setSelectedBudget("");
    } catch (error) {
      let errorMessage = "Failed to submit request. Please try again.";
      let errorCode = error.response?.status;

      if (error.response) {
        const data = error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        // Customize error based on known codes/messages
        if (errorCode === 404 && errorMessage.includes("User")) {
          errorMessage = "User not found.";
        } else if (errorCode === 404 && errorMessage.includes("Workflow")) {
          errorMessage = " Workflow not found.";
        } else if (errorCode === 404 && errorMessage.includes("Budget")) {
          errorMessage = " Budget not associated with this workflow.";
        } else if (errorCode === 403 && errorMessage.includes("not assigned")) {
          errorMessage = " User is not assigned to this workflow.";
        } else if (
          errorCode === 403 &&
          errorMessage.includes("roles assigned") // or use partial match
        ) {
          errorMessage = " No roles assigned for this workflow or this action.";
        } else if (errorCode === 403 && errorMessage.includes("authorized")) {
          errorMessage = " User role not authorized for this workflow.";
        } else if (
          errorCode === 500 &&
          errorMessage.toLowerCase().includes("error creating")
        ) {
          errorMessage = "Error creating indenting request.";
        }
      }
      resetForm(); // from useForm()

      Swal.fire({
        title: `Error ${errorCode || ""}`,
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleYesClick = () => {
    navigate("/RepoAllTab", {
      state: {
        requestFor, // selected "requestedFor"
        category, // selected "category"
        requestAsset, // selected "material"
        type: "inventory", // ✅ hardcoded value
      },
    });
  };

  const [existingQuantity, setExistingQuantity] = useState(null);

  useEffect(() => {
    if (category) {
      const fetchFromPurchase = axios.get(
        `${API.PURCHASE_API}/assets?request_for=${requestFor}&category=${category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchFromColumnTypes = axios.get(
        `${API.COLUMN_TYPES_API}/getColumnTypesAndData/${category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Promise.all([fetchFromPurchase, fetchFromColumnTypes])
        .then(([res1, res2]) => {
          const purchaseAssets = res1.data.map((item) => ({
            asset_name: item.asset_name,
            source: "purchaseAssets",
          }));

          const columnAssets = res2.data.data.map((item) => ({
            asset_name: item.material_name || item["Asset Name"], // fallback
            quantity: item.quantity,
            uom: item.uom,
            unit_cost: item["Unit Cost"] || item.unit_cost,
            status: item.status,
            created_at: item.created_at,
            source: "columnTypes",
            ...item, // keep original keys
          }));

          const combined = [...purchaseAssets, ...columnAssets];

          // Remove undefined/null names
          const filtered = combined.filter((item) => item.asset_name);

          setAssetOptions(filtered.map((item) => item.asset_name)); // dropdown
          setMaterialData(filtered); // full data
          setRequestAsset(""); // reset input
        })
        .catch((err) =>
          console.error("Error fetching combined asset data:", err)
        );
    }
  }, [assetType, category, requestFor]);

  useEffect(() => {
    if (requestAsset && materialData.length > 0) {
      const matched = materialData.find(
        (item) => item?.material_name === requestAsset
      );
      if (matched) {
        setExistingQuantity(matched.quantity || 0);
      } else {
        setExistingQuantity(null);
      }
    }
  }, [requestAsset, assetType, materialData]);

  useEffect(() => {
    if (requestFor) {
      const formattedRequestFor = requestFor.toLowerCase().replace(/\s+/g, "");

      // Fetch both APIs, but handle errors separately
      Promise.allSettled([
        axios.get(
          // https://devapi.softtrails.net/saas/java/test/api/categories
          `${API.PRO_API}/categories/${formattedRequestFor}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API.PURCHASE_API}/assets?request_for=${requestFor}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]).then(([res1, res2]) => {
        let categoriesFromFirstAPI = [];
        let categoriesFromSecondAPI = [];

        if (res1.status === "fulfilled" && Array.isArray(res1.value.data)) {
          categoriesFromFirstAPI = res1.value.data.map(
            (cat) => cat.categoriesname
          );
        }
        if (res2.status === "fulfilled" && Array.isArray(res2.value.data)) {
          categoriesFromSecondAPI = res2.value.data.map(
            (item) => item.category
          );
        }

        const mergedCategories = [
          ...new Set([
            ...categoriesFromFirstAPI.filter(Boolean),
            ...categoriesFromSecondAPI.filter(Boolean),
          ]),
        ];

        setCategoryOptions(mergedCategories);
        setCategory(""); // Reset category selection
        setAssetOptions([]); // Reset material options
      });
    }
  }, [requestFor]);

  //Fetch workflow
  useEffect(() => {
    axios.get(`${API.WORKFLOW_API}/workflow/get-modules/module?module_name=Purchase Management&sub_module_name=Indenting`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setWorkflowOptions(
          Array.isArray(res.data.workflows) ? res.data.workflows : []
        );
      })
      .catch((err) => console.error("Error fetching workflows:", err));
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

  return (
    <div className="max-w-5xl mx-auto p-8 ml-0 bg-white rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto p-4">
        <h2 className="text-2xl text-blue-950 font-semibold mb-6 text-left">
          Raise Request for
        </h2>

        <>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="w-full">
                <label className="block text-black mb-1 font-bold">
                  Request For
                </label>

                {!showCreateNewInput ? (
                  <Autocomplete
                    freeSolo
                    options={requestForOptions}
                    value={requestFor}
                    forcePopupIcon={true}
                    popupIcon={
                      <Icon icon="mdi:chevron-down" width="24" height="24" />
                    }
                    onChange={(event, newValue) => {
                      if (newValue === "Create New") {
                        setShowCreateNewInput(true);
                        setNewRequestForValue("");
                      } else {
                        setRequestFor(newValue);
                        setCategory("");
                        setRequestAsset("");
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change") {
                        setRequestFor(newInputValue);
                        setCategory("");
                        setRequestAsset("");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select Request For"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="flex gap-2">
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Enter new Request For"
                      value={newRequestForValue}
                      onChange={(e) => setNewRequestForValue(e.target.value)}
                      InputProps={{
                        sx: {
                          height: "36px",
                          fontSize: "14px",
                          backgroundColor: "#F4F4F4",
                        },
                      }}
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 rounded"
                      onClick={() => {
                        if (
                          newRequestForValue &&
                          !requestForOptions.includes(newRequestForValue)
                        ) {
                          const updatedOptions = [
                            ...requestForOptions.slice(0, -1),
                            newRequestForValue,
                            "Create New",
                          ];
                          setRequestForOptions(updatedOptions);
                          setRequestFor(newRequestForValue);
                        }
                        setShowCreateNewInput(false);
                        setCategory("");
                        setRequestAsset("");
                      }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="border px-3 rounded"
                      onClick={() => setShowCreateNewInput(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {requestFor && (
                <div className="w-full">
                  <label className="block text-black mb-1 font-bold">
                    Category
                  </label>
                  <Autocomplete
                    freeSolo
                    options={categoryOptions}
                    value={category}
                    forcePopupIcon={true}
                    popupIcon={<Icon icon="mdi:chevron-down" />}
                    onChange={(e, newValue) => {
                      setCategory(newValue);
                      setRequestAsset(""); // Reset selected material
                      setAssetOptions([]); // Reset material dropdown list
                      setMaterialData([]); // (Optional) Reset material data
                      setSelectedWorkflow(""); // Reset workflow
                      setSelectedBudget(""); // Reset budget
                    }}
                    onInputChange={(e, newInputValue) => {
                      if (e?.type === "change") {
                        setCategory(newInputValue);
                        setRequestAsset(""); // Reset selected material
                        setAssetOptions([]); // Reset material dropdown list
                        setMaterialData([]); // (Optional) Reset material data
                        setSelectedWorkflow(""); // Reset workflow
                        setSelectedBudget(""); // Reset budget
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select Category"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {category && (
                <div className="w-full">
                  <label className="block text-black mb-1 font-bold">
                    Material
                  </label>
                  <Autocomplete
                    freeSolo
                    options={assetOptions}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : ""
                    }
                    value={requestAsset}
                    forcePopupIcon={true}
                    popupIcon={<Icon icon="mdi:chevron-down" />} // Always show arrow
                    onChange={(e, newValue) => {
                      setRequestAsset(newValue);

                      const selectedMaterial = materialData?.find(
                        (item) => item?.material_name === newValue
                      );
                      setUom(selectedMaterial?.uom || "");
                      setDescription(selectedMaterial?.remarks || "");
                    }}
                    onInputChange={(e, newInputValue) => {
                      if (e?.type === "change") {
                        setRequestAsset(newInputValue);

                        const selectedMaterial = materialData.find(
                          (item) => item.material_name === newInputValue
                        );
                        setUom(selectedMaterial?.uom || "");
                        setDescription(selectedMaterial?.remarks || "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select Material"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {canShowRestOfForm && (
              <>
                <label htmlFor="description" className="mb-1 font-bold">
                  Description
                </label>
                <textarea
                  placeholder=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2 border rounded w-full mb-4 bg-[#F4F4F4] text-gray-700" // <-- add this
                />

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label htmlFor="quantity" className="mb-1 font-bold">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      placeholder=""
                      value={quantity === 0 ? "" : quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);

                        if (isNaN(val)) {
                          setQuantity(0);
                          setAllocation(false);
                          return;
                        }

                        setQuantity(val);

                        if (requestAsset && val > 0) {
                          setAllocation(true);
                        } else {
                          setAllocation(false);
                        }
                      }}
                      className="p-2 border rounded"
                      min="0"
                      style={{ backgroundColor: "#F4F4F4" }} // <-- add this
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="uom" className="mb-1 font-bold">
                      UOM (Unit of Measure)
                    </label>
                    <TextField
                      variant="outlined"
                      size="small"
                      value={uom}
                      onChange={(e) => setUom(e.target.value)}
                      InputProps={{
                        sx: {
                          height: "36px",
                          fontSize: "14px",
                          backgroundColor: "#F4F4F4",
                        },
                      }}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="workflow" className="mb-1 font-bold">
                      Workflow
                    </label>
                    <Autocomplete
                      freeSolo
                      options={workflowOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : option.workflow_name || ""
                      }
                      value={
                        workflowOptions.find(
                          (w) => w.workflow_id === selectedWorkflow
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        setSelectedWorkflow(newValue?.workflow_id || "");
                      }}
                      forcePopupIcon={true}
                      popupIcon={
                        <Icon icon="mdi:chevron-down" width="24" height="24" />
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.workflow_id === value?.workflow_id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select Workflow"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              height: "36px",
                              fontSize: "14px",
                              backgroundColor: "#F4F4F4",
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label htmlFor="budget" className="mb-1 font-bold">
                      Budget
                    </label>
                    {/* <Autocomplete
                      freeSolo
                      options={budgetOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : option.budget_name || ""
                      }
                      value={
                        budgetOptions.find((b) => b.id === selectedBudget) ||
                        null
                      }
                      forcePopupIcon={true}
                      popupIcon={
                        <Icon icon="mdi:chevron-down" width="24" height="24" />
                      }
                      onChange={(event, newValue) => {
                        setSelectedBudget(newValue?.id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select Budget"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              height: "36px",
                              fontSize: "14px",
                              backgroundColor: "#F4F4F4",
                            },
                          }}
                        />
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value?.id
                      }
                    /> */}
                    <Autocomplete
                      freeSolo
                      options={budgetOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : // support both { budget_name: 'Name' } or { name: 'Name' } shapes
                            (option?.budget_name?.name ?? option?.budget_name ?? option?.name ?? "")
                      }
                      value={budgetOptions.find((b) => b.id === selectedBudget) || null}
                      forcePopupIcon={true}
                      popupIcon={<Icon icon="mdi:chevron-down" width="24" height="24" />}
                      onChange={(event, newValue) => {
                        setSelectedBudget(newValue?.id || "");
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select Budget"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              height: "36px",
                              fontSize: "14px",
                              backgroundColor: "#F4F4F4",
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {existingQuantity !== null &&
                  existingQuantity !== undefined && (
                    <div className="flex flex-row items-center gap-2 bg-yellow-100 p-4 rounded-lg mb-4">
                      <p className="text-gray-800 font-medium">
                        NOTE: For <strong>{requestAsset}</strong>,{" "}
                        <strong>
                          {existingQuantity !== null
                            ? existingQuantity
                            : allocation !== true}
                        </strong>{" "}
                        quantity is already available. Do you want to allocate
                        this?
                      </p>

                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={handleYesClick}
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white"
                        >
                          Yes
                        </button>

                        {/* <button
                          type="button"
                          onClick={() => setAllocation(false)}
                          className="px-6 py-2 rounded-lg bg-red-600 text-white"
                        >
                          No
                        </button> */}
                      </div>
                    </div>
                  )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-custome-blue text-white px-6 py-2 rounded-lg w-1/4"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="border w-1/4 px-6 py-2 rounded-lg"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
          {showModal && (
            <PopupModal
              type={modalProps.type}
              title={modalProps.title}
              message={modalProps.message}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      </div>
    </div>
  );
};

export default RaiseRequest;
