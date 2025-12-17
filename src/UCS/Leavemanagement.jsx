import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const LeaveManagementContent = () => {
    const [activeTab, setActiveTab] = useState("leaveRequest");
    const [notificationType, setNotificationType] = useState("email"); // 'email' or 'sms'

    // --- Separate State for Email and SMS ---
    const initialConfigState = {
        selectedService: "",
        selectedTemplateId: "",
        selectedTemplateName: "",
        variables: [], // Variables specific to the selected template for this type
        selectedVariables: {}, // Mapping for this type { varName: columnNameOrOther }
        customMappedVariables: {}, // Custom input for 'other' for this type { varName: customValue }
        isConfigured: false, // Optional: Track if this type has been configured/fetched
    };

    const [emailConfig, setEmailConfig] = useState({ ...initialConfigState });
    const [smsConfig, setSmsConfig] = useState({ ...initialConfigState });

    // --- Shared State (Fetched Data) ---
    // Store services/templates fetched based on the *currently selected* notificationType
    const [currentServices, setCurrentServices] = useState([]);
    const [currentTemplates, setCurrentTemplates] = useState([]);
    // Columns are always the same
    const [columns, setColumns] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [submittedData, setSubmittedData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [fetchError, setFetchError] = useState(null);



    // --- Fetch Effects ---

    // Fetch Columns (Runs once)
    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const response = await axios.get("http://13.204.15.86:8336/ucs/columns?tableName=leave_requests");
                setColumns(response.data || []);
            } catch (error) {
                console.error("Error fetching columns:", error);
                setColumns([]);
            }
        };
        fetchColumns();
    }, []);

    // Fetch Services & Templates based on *CURRENT* Notification Type
    useEffect(() => {
        let isMounted = true; // Prevent state update on unmounted component

        const fetchServicesAndTemplates = async () => {
            // Reset lists before fetching
            if (isMounted) {
                setCurrentServices([]);
                setCurrentTemplates([]);
            }

            const serviceUrl =
                notificationType === "email"
                    ? "http://13.204.15.86:8336/api/email/all"
                    : "http://13.204.15.86:8336/api/sms/all";
            const templateApiUrl =
                notificationType === "email"
                    ? "http://13.204.15.86:8336/api/templates/getByRole/Email"
                    : "http://13.204.15.86:8336/api/templates/getByRole/Sms";

            try {
                const [serviceResponse, templateResponse] = await Promise.all([
                    axios.get(serviceUrl),
                    axios.get(templateApiUrl)
                ]);

                if (isMounted) {
                    setCurrentServices(serviceResponse.data || []);
                    setCurrentTemplates(templateResponse.data || []);
                }

            } catch (error) {
                console.error(`Error fetching data for ${notificationType}:`, error);
                if (isMounted) {
                    setCurrentServices([]);
                    setCurrentTemplates([]);
                }
            }
        };

        fetchServicesAndTemplates();

        return () => {
            isMounted = false; // Cleanup function
        };

    }, [notificationType]); // Re-fetch when notificationType changes

    // Fetch Variables for the relevant config when its template changes
    useEffect(() => {
        let isMounted = true;
        const fetchVariables = async (config, setConfig, type) => {
            const templateIdToFetch = config.selectedTemplateId;

            // Clear old variables for this specific config
            setConfig(prev => ({ ...prev, variables: [], selectedVariables: {}, customMappedVariables: {} }));

            if (!templateIdToFetch) return; // No template selected for this type

            try {
                const role = type === "email" ? "Email" : "SMS";
                const response = await axios.get(
                    `http://13.204.15.86:8336/ucs/getVariables`,
                    { params: { templateId: templateIdToFetch, Role: role } }
                );
                if (isMounted) {
                    setConfig(prev => ({ ...prev, variables: response.data || [] }));
                }
            } catch (error) {
                console.error(`Error fetching variables for ${type}:`, error);
                if (isMounted) {
                    // Clear variables on error for this specific config
                    setConfig(prev => ({ ...prev, variables: [] }));
                }
            }
        };

        // Fetch for Email if template selected
        if (emailConfig.selectedTemplateId) {
            fetchVariables(emailConfig, setEmailConfig, 'email');
        } else {
            setEmailConfig(prev => ({ ...prev, variables: [], selectedVariables: {}, customMappedVariables: {} })); // Clear if no template
        }

        // Fetch for SMS if template selected
        if (smsConfig.selectedTemplateId) {
            fetchVariables(smsConfig, setSmsConfig, 'sms');
        } else {
            setSmsConfig(prev => ({ ...prev, variables: [], selectedVariables: {}, customMappedVariables: {} })); // Clear if no template
        }

        return () => { isMounted = false; };

        // Trigger when either template ID changes
    }, [emailConfig.selectedTemplateId, smsConfig.selectedTemplateId]);


    // --- Event Handlers (Update the specific config object) ---

    const handleNotificationTypeChange = (type) => {
        setNotificationType(type);
        // Fetching for the new type happens via useEffect
    };

    // Generic handler template - updates either email or sms config
    const handleConfigChange = (type, field, value) => {
        const setConfig = type === 'email' ? setEmailConfig : setSmsConfig;
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    // Specific handler for template change to also update name/ID and clear variables
    const handleTemplateChange = (type, field, value) => {
        const setConfig = type === 'email' ? setEmailConfig : setSmsConfig;
        const currentTemplateList = currentTemplates; // Use the list fetched for the active type
        let selectedId = "";
        let selectedName = "";

        if (field === 'selectedTemplateId') {
            selectedId = value;
            const template = currentTemplateList.find(t => t.templateId === selectedId);
            selectedName = template ? template.templateName : "";
        } else { // field === 'selectedTemplateName'
            selectedName = value;
            const template = currentTemplateList.find(t => t.templateName === selectedName);
            selectedId = template ? template.templateId : "";
        }

        setConfig(prev => ({
            ...prev,
            selectedTemplateId: selectedId,
            selectedTemplateName: selectedName,
            // Variable fetch will be triggered by useEffect dependency change
            variables: [],
            selectedVariables: {},
            customMappedVariables: {}
        }));
    };


    // Update variable mapping for the specific type
    const handleVariableMappingChange = (type, variableName, selectedValue) => {
        const setConfig = type === 'email' ? setEmailConfig : setSmsConfig;
        setConfig(prev => {
            const newSelectedVariables = { ...prev.selectedVariables, [variableName]: selectedValue };
            const newCustomMappedVariables = { ...prev.customMappedVariables };
            if (selectedValue !== 'other') {
                delete newCustomMappedVariables[variableName];
            }
            return {
                ...prev,
                selectedVariables: newSelectedVariables,
                customMappedVariables: newCustomMappedVariables
            };
        });
    };

    // Update custom input for the specific type
    const handleCustomInputChange = (type, variableName, value) => {
        const setConfig = type === 'email' ? setEmailConfig : setSmsConfig;
        setConfig(prev => ({
            ...prev,
            customMappedVariables: { ...prev.customMappedVariables, [variableName]: value }
        }));
    };


    // Reset both configurations
    const handleCancel = () => {
        setNotificationType("email"); // Default back to email
        setActiveTab("leaveRequest"); // Default back to first tab
        setEmailConfig({ ...initialConfigState });
        setSmsConfig({ ...initialConfigState });
        setCurrentServices([]); // Clear fetched data as well
        setCurrentTemplates([]);
    };


    const handleSubmit = async () => {
        // Determine which config is active and validate that one
        const configToSubmit = notificationType === "email" ? emailConfig : smsConfig;
        const typeLabel = notificationType === "email" ? "Email" : "SMS";
        const setConfigToReset = notificationType === 'email' ? setEmailConfig : setSmsConfig; // Get the setter for the current type

        // Basic Validations for the *active* config
        if (!configToSubmit.selectedService) {
            Swal.fire({ icon: "warning", title: "Missing Field", text: `Please select a Service Name for ${typeLabel}.` });
            return;
        }
        if (!configToSubmit.selectedTemplateId) {
            Swal.fire({ icon: "warning", title: "Missing Field", text: `Please select a Template ID or Name for ${typeLabel}.` });
            return;
        }
        // Check variable mapping for the *active* config
        for (const variable of configToSubmit.variables) {
            const selectedValue = configToSubmit.selectedVariables[variable];
            if (!selectedValue) {
                Swal.fire({ icon: "warning", title: "Missing Mapping", text: `Please map the variable "${variable}" for ${typeLabel}.` });
                return;
            }
            if (selectedValue === 'other' && !configToSubmit.customMappedVariables[variable]?.trim()) {
                Swal.fire({ icon: "warning", title: "Missing Custom Value", text: `Please enter a custom value for "${variable}" for ${typeLabel}.` });
                return;
            }
        }

        // --- Construct Payload ---
        let moduleName = "LRI"; // Default: Leave Request
        if (activeTab === "leaveApproval") moduleName = "LA"; // Adjust as needed
        if (activeTab === "leaveFinalApproval") moduleName = "LR"; // Leave Approval

        const payload = {
            moduleName: moduleName,
            type: typeLabel,
            // Conditionally add Email/SMS template ID and service based on the *active* type
            ...(notificationType === "email" && {
                Email: configToSubmit.selectedTemplateId,
                emailService: configToSubmit.selectedService
            }),
            ...(notificationType === "sms" && {
                SMS: configToSubmit.selectedTemplateId,
                smsService: configToSubmit.selectedService
            }),
            variableMappings: configToSubmit.variables.map((variable) => {
                const selectedValue = configToSubmit.selectedVariables[variable];
                if (selectedValue === 'other') {
                    return {
                        variables: variable,
                        otherMappedVariables: configToSubmit.customMappedVariables[variable] || "",
                    };
                } else {
                    return {
                        variables: variable,
                        mappedVariables: selectedValue || "",
                    };
                }
            }),
        };

        console.log("Submitting Payload:", JSON.stringify(payload, null, 2));

        try {
            await axios.post("http://13.204.15.86:8336/ucs/mappedVariables", payload);
            Swal.fire({ icon: "success", title: "Success!", text: `${typeLabel} saved successfully.` });

            // --- <<< ADD THIS PART >>> ---
            // Reset the state for the successfully submitted type
            setConfigToReset({ ...initialConfigState });

            fetchSubmittedData();


        } catch (error) {
            console.error(`Error submitting ${typeLabel} mapping:`, error);
            const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
            Swal.fire({ icon: "error", title: "Error!", text: errorMsg });
        }
    };

    const fetchSubmittedData = async () => {
        setLoadingData(true);
        setFetchError(null);
    
        try {
            const response = await fetch("http://13.204.15.86:8336/ucs/all");
            if (!response.ok) throw new Error("Failed to fetch data");
    
            const result = await response.json();
            console.log("API Response Data:", result);
    
            // ✅ Correctly assign type per mapped variable
            const flattened = result.flatMap((entry) => {
                if (!entry.mappedVariables) return [];
    
                return entry.mappedVariables.map((v) => ({
                    ...v,
                    moduleName: entry.moduleName,
                    type: v.type, // <-- Use actual type from the variable
                }));
            });
    
            console.log("Flattened Variables:", flattened);
            setSubmittedData(flattened);
            filterDataByType(notificationType, flattened); // You can conditionally filter
    
        } catch (error) {
            console.error("Error:", error);
            setFetchError("Failed to load data.");
        } finally {
            setLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchSubmittedData();
    }, []);
    


    const filterDataByType = (type, data = submittedData) => {
        const upperType = type.toLowerCase() === "sms" ? "SMS" : "Email";
        const filtered = data.filter((item) => item.type === upperType);
        setFilteredData(filtered);
    };

    const [modules, setModules] = useState([]);

    useEffect(() => {
        const fetchModules = async () => {
          try {
            const response = await fetch('http://13.204.15.86:8336/api/modules');
            const data = await response.json();
            setModules(data.modules || []);
          } catch (error) {
            console.error("Failed to fetch modules:", error);
          }
        };
      
        fetchModules();
      }, []);
      



    return (
        <div className="bg-white p-6 mx-auto my-1">
            {/* Tabs */}
            <div className="flex border-b mb-1">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "leaveRequest" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("leaveRequest")}
                >
                    Leave Request Initiator
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "leaveApproval" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("leaveApproval")}
                >
                    Leave Request Approver
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === "leaveFinalApproval" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("leaveFinalApproval")}
                >
                    Leave Approval
                </button>
            </div>

            {/* Radio Buttons */}
            <div className="flex gap-6 mb-3 mt-4"> {/* Added mt-4 */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="notificationType" // Ensure name is same for radio group
                        value="email"
                        checked={notificationType === "email"}
                        onChange={() => handleNotificationTypeChange("email")} // Use specific handler
                        className="form-radio text-blue-600 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="notificationType" // Ensure name is same for radio group
                        value="sms"
                        checked={notificationType === "sms"}
                        onChange={() => handleNotificationTypeChange("sms")} // Use specific handler
                        className="form-radio text-blue-600 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">SMS</span>
                </label>
            </div>

            {/* Configuration Area - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Email Section --- */}
                <div className={`p-4 border rounded-md transition-opacity duration-300 ${notificationType === "email" ? "bg-blue-50 border-blue-400 opacity-100" : "opacity-50 pointer-events-none border-gray-200"}`}>
                    <h3 className="text-md font-semibold text-blue-700 mb-3">Email Notification</h3>

                    {/* Service Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleConfigChange('email', 'selectedService', e.target.value)}
                            value={emailConfig.selectedService}
                            // Populate with services fetched for the *active* type, disable if not active or no services
                            disabled={notificationType !== 'email' || currentServices.length === 0}
                        >
                            <option value="">Select Service Name</option>
                            {/* Only show services if email is active */}
                            {notificationType === 'email' && currentServices.map((service) => (
                                <option key={`email-${service.serviceId || service.serviceName}`} value={service.serviceName}>
                                    {service.serviceName}
                                </option>
                            ))}
                        </select>
                        {notificationType === 'email' && currentServices.length === 0 && <p className="text-xs text-red-500 mt-1">No Email services found or loading...</p>}
                    </div>

                    {/* Template ID / Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => handleTemplateChange('email', 'selectedTemplateId', e.target.value)}
                                value={emailConfig.selectedTemplateId}
                                disabled={notificationType !== 'email' || currentTemplates.length === 0}
                            >
                                <option value="">Select Template ID</option>
                                {notificationType === 'email' && currentTemplates.map((template) => (
                                    <option key={`email-${template.templateId}`} value={template.templateId}>
                                        {template.templateId}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => handleTemplateChange('email', 'selectedTemplateName', e.target.value)}
                                value={emailConfig.selectedTemplateName}
                                disabled={notificationType !== 'email' || currentTemplates.length === 0}
                            >
                                <option value="">Select Template Name</option>
                                {notificationType === 'email' && currentTemplates.map((template) => (
                                    <option key={`email-name-${template.templateId}`} value={template.templateName}>
                                        {template.templateName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {notificationType === 'email' && currentTemplates.length === 0 && <p className="text-xs text-red-500 -mt-4 mb-4">No Email templates found or loading...</p>}


                    {/* Email Variables */}
                    {emailConfig.variables.length > 0 && (
                        <div>
                            <div className="flex flex-wrap gap-4">
                                {emailConfig.variables.map((variable, idx) => (
                                    <div key={`email-var-${idx}`} className="w-full sm:w-auto flex-1 min-w-[150px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">{variable}</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm mb-1 focus:ring-blue-500 focus:border-blue-500"
                                            value={emailConfig.selectedVariables[variable] || ""}
                                            onChange={(e) => handleVariableMappingChange('email', variable, e.target.value)}
                                            disabled={notificationType !== 'email'}
                                        >
                                            <option value="">Select Column or Other</option>
                                            {columns.map((col, i) => (<option key={`email-col-${i}`} value={col}>{col}</option>))}
                                            <option value="other">Other (Custom Input)</option>
                                        </select>
                                        {emailConfig.selectedVariables[variable] === 'other' && (
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 mt-1"
                                                placeholder="Enter custom value"
                                                value={emailConfig.customMappedVariables[variable] || ""}
                                                onChange={(e) => handleCustomInputChange('email', variable, e.target.value)}
                                                disabled={notificationType !== 'email'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Message if template selected but no variables */}
                    {notificationType === 'email' && emailConfig.selectedTemplateId && emailConfig.variables.length === 0 && <p className="text-sm text-gray-500 mt-2">No variables found for this template or still loading...</p>}

                </div>

                {/* --- SMS Section --- */}
                <div className={`p-4 border rounded-md transition-opacity duration-300 ${notificationType === "sms" ? "bg-blue-50 border-blue-400 opacity-100" : "opacity-50 pointer-events-none border-gray-200"}`}>
                    <h3 className="text-md font-semibold text-blue-700 mb-3">SMS Notification</h3>

                    {/* Service Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <select
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleConfigChange('sms', 'selectedService', e.target.value)}
                            value={smsConfig.selectedService}
                            disabled={notificationType !== 'sms' || currentServices.length === 0}
                        >
                            <option value="">Select Service Name</option>
                            {notificationType === 'sms' && currentServices.map((service) => (
                                <option key={`sms-${service.serviceId || service.serviceName}`} value={service.serviceName}>
                                    {service.serviceName}
                                </option>
                            ))}
                        </select>
                        {notificationType === 'sms' && currentServices.length === 0 && <p className="text-xs text-red-500 mt-1">No SMS services found or loading...</p>}
                    </div>

                    {/* Template ID / Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => handleTemplateChange('sms', 'selectedTemplateId', e.target.value)}
                                value={smsConfig.selectedTemplateId}
                                disabled={notificationType !== 'sms' || currentTemplates.length === 0}
                            >
                                <option value="">Select Template ID</option>
                                {notificationType === 'sms' && currentTemplates.map((template) => (
                                    <option key={`sms-${template.templateId}`} value={template.templateId}>
                                        {template.templateId}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                            <select
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => handleTemplateChange('sms', 'selectedTemplateName', e.target.value)}
                                value={smsConfig.selectedTemplateName}
                                disabled={notificationType !== 'sms' || currentTemplates.length === 0}
                            >
                                <option value="">Select Template Name</option>
                                {notificationType === 'sms' && currentTemplates.map((template) => (
                                    <option key={`sms-name-${template.templateId}`} value={template.templateName}>
                                        {template.templateName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {notificationType === 'sms' && currentTemplates.length === 0 && <p className="text-xs text-red-500 -mt-4 mb-4">No SMS templates found or loading...</p>}


                    {/* SMS Variables */}
                    {smsConfig.variables.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-3 border-t pt-3">Map Template Variables</h4>
                            <div className="flex flex-wrap gap-4">
                                {smsConfig.variables.map((variable, idx) => (
                                    <div key={`sms-var-${idx}`} className="w-full sm:w-auto flex-1 min-w-[150px]">
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">{variable}</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md p-2 text-sm mb-1 focus:ring-blue-500 focus:border-blue-500"
                                            value={smsConfig.selectedVariables[variable] || ""}
                                            onChange={(e) => handleVariableMappingChange('sms', variable, e.target.value)}
                                            disabled={notificationType !== 'sms'}
                                        >
                                            <option value="">Select Column or Other</option>
                                            {columns.map((col, i) => (<option key={`sms-col-${i}`} value={col}>{col}</option>))}
                                            <option value="other">Other (Custom Input)</option>
                                        </select>
                                        {smsConfig.selectedVariables[variable] === 'other' && (
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 mt-1"
                                                placeholder="Enter custom value"
                                                value={smsConfig.customMappedVariables[variable] || ""}
                                                onChange={(e) => handleCustomInputChange('sms', variable, e.target.value)}
                                                disabled={notificationType !== 'sms'}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Message if template selected but no variables */}
                    {notificationType === 'sms' && smsConfig.selectedTemplateId && smsConfig.variables.length === 0 && <p className="text-sm text-gray-500 mt-2">No variables found for this template or still loading...</p>}
                </div>
            </div> {/* End Grid */}

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-6 border-t pt-4">
                <button
                    type="button"
                    onClick={handleCancel} // Use the updated cancel handler
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    // Disable based on the *currently active* config's state
                    disabled={
                        notificationType === 'email'
                            ? (emailConfig.variables.length === 0 || !emailConfig.selectedTemplateId || !emailConfig.selectedService)
                            : (smsConfig.variables.length === 0 || !smsConfig.selectedTemplateId || !smsConfig.selectedService)
                    }
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${(notificationType === 'email'
                        ? (emailConfig.variables.length === 0 || !emailConfig.selectedTemplateId || !emailConfig.selectedService)
                        : (smsConfig.variables.length === 0 || !smsConfig.selectedTemplateId || !smsConfig.selectedService))
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                >
                    Submit {notificationType === 'email' ? 'Email' : 'SMS'}
                </button>
            </div>

            {/* Submitted Data Table */}
            <div className="mt-10">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">
                    Submitted Notification Configs ({notificationType.toUpperCase()})
                </h2>

                {loadingData && <p className="text-sm text-blue-500">Loading submitted data...</p>}
                {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}

                {!loadingData && filteredData.length === 0 && (
                    <p className="text-sm text-gray-500">No {notificationType.toUpperCase()} submissions found.</p>
                )}

                {!loadingData && filteredData.length > 0 && (
                    <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full bg-white text-sm text-gray-700">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="px-4 py-2 border-b">Module Name</th>
                                    <th className="px-4 py-2 border-b">Notification Type</th>
                                    <th className="px-4 py-2 border-b">Variable</th>
                                    <th className="px-4 py-2 border-b">Mapped Variable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b">{item.moduleName}</td>
                                        <td className="px-4 py-2 border-b">{item.type}</td>
                                        <td className="px-4 py-2 border-b">{item.variables}</td>
                                        <td className="px-4 py-2 border-b">{item.mappedVariables}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>        
        </div>
    );
};

export default LeaveManagementContent;