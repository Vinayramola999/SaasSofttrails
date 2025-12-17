// import axios from 'axios';
// import Modal from 'react-modal';
// import Swal from 'sweetalert2';
// import { useNavigate } from 'react-router-dom';
// import React, { useState, useEffect } from 'react';
// Modal.setAppElement('#root');

// const OrganizationTab = () => {
//     const [emails, setEmails] = useState([]);
//     const [selectedEmail, setSelectedEmail] = useState('');
//     const [apiAccess, setApiAccess] = useState([]);

//     //for each states
//     const [isORGChecked, setIsORGChecked] = useState(false);

//     // ORG child states
//     const [isSummaryChecked, setIsSummaryChecked] = useState(false);
//     const [isDeptChecked, setIsDeptChecked] = useState(false);
//     const [isLocationChecked, setIsLocationChecked] = useState(false);
//     const [isDesignationChecked, setIsDesignationChecked] = useState(false);
//     const [isDomainChecked, setIsDomainChecked] = useState(false);
//     const [isUserCategoryChecked, setIsUserCategoryChecked] = useState(false);
//     const [hasAmsAccess, setHasAmsAccess] = useState(false);

//    useEffect(() => {
//     const fetchEmails = async () => {
//         try {
//             const response = await axios.get(
//                 'https://devapi.softtrails.net/saas/test/users/email_users',
//                 {
//                     headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` },
//                 }
//             );
//             const emailsArray = response.data.users || []; // ✅ extract users array
//             setEmails(emailsArray);
//         } catch (error) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'Error fetching emails.'
//             });
//         }
//     };
//     fetchEmails();
// }, []);

//     const handleEmailChange = async (e) => {
//         const userId = e.target.value;
//         setSelectedEmail(userId);
//         if (userId) {
//             try {
//                 const response = await axios.get(`https://devapi.softtrails.net/saas/test/access/access/${userId}`, {
//                     headers: {
//                         'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
//                     },
//                 });
//                 const filteredAccess = response.data.filter(access => access.user_id === parseInt(userId));
//                 const apiAccessNames = filteredAccess.map(access => access.api_name);
//                 setApiAccess(apiAccessNames);
//                 setHasAmsAccess(apiAccessNames.includes('update_access'));
//                 setIsSummaryChecked(apiAccessNames.includes('Summary'));
//                 setIsORGChecked(apiAccessNames.includes('ORG'));
//                 setIsDeptChecked(apiAccessNames.includes('Dept'));
//                 setIsDomainChecked(apiAccessNames.includes('Domain'));
//                 setIsDesignationChecked(apiAccessNames.includes('Designation'));
//                 setIsLocationChecked(apiAccessNames.includes('Location'));
//                 setIsUserCategoryChecked(apiAccessNames.includes('UserCategory'));
//             } catch (error) {
//                 Swal.fire({
//                     icon: 'warning',
//                     title: 'No Access',
//                     text: 'No Access is available for the provided User.',
//                 });
//             }
//         } else {
//             setApiAccess([]);
//             setIsSummaryChecked(false);
//             setIsORGChecked(false);
//             setIsDeptChecked(false);
//             setIsDomainChecked(false);
//             setIsDesignationChecked(false);
//             setIsLocationChecked(false);
//             setIsUserCategoryChecked(false);
//         }
//     };

//     const handleApiAccessChange = async (apiName) => {
//         const isAlreadySelected = apiAccess.includes(apiName);
//         setApiAccess((prev) =>
//             isAlreadySelected
//                 ? prev.filter((name) => name !== apiName) // Remove API if unchecked
//                 : [...prev, apiName] // Add API if checked
//         );

//         if (apiName === 'update_access') {
//             setHasAmsAccess((prev) => !prev);
//         }
//         else if (apiName === 'ORG') {
//             setIsORGChecked((prev) => !prev);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const token = sessionStorage.getItem('token');
//         if (!token) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Unauthorized',
//                 text: 'Token does not exist.',
//             });
//             return;
//         }
//         const selectedModule = 'ORG';
//         const selectedApiAccess = [];
//         if (isORGChecked) selectedApiAccess.push('ORG');
//         if (isSummaryChecked) selectedApiAccess.push('Summary');
//         if (isDeptChecked) selectedApiAccess.push('Dept');
//         if (isDomainChecked) selectedApiAccess.push('Domain');
//         if (isDesignationChecked) selectedApiAccess.push('Designation');
//         if (isLocationChecked) selectedApiAccess.push('Location');
//         if (isUserCategoryChecked) selectedApiAccess.push('UserCategory');
//         try {
//             const response = await axios.put(
//                 'https://devapi.softtrails.net/saas/test/access/update_access',
//                 {
//                     user_id: selectedEmail,
//                     module: selectedModule,
//                     api_access: selectedApiAccess,
//                 },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 }
//             );
//             if (response.status === 200) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Success',
//                     text: 'User Updated Successfully!',
//                 });
//             } else if (response.data.error === "User not found. Please check the email entered.") {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'User Not Found',
//                     text: 'Please check the email entered.',
//                 });
//             } else {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: `Error: ${response.data.error}`,
//                 });
//             }
//         } catch (error) {
//             const { response } = error;

//             if (response) {
//                 if (response.status === 403) {
//                     Swal.fire({
//                         icon: 'warning',
//                         title: 'Permission Denied',
//                         text: 'You do not have permission to perform this action.',
//                     });
//                 } else if (response.status === 404) {
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'User Not Found',
//                         text: 'Please check the email entered.',
//                     });
//                 } else {
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Update Failed',
//                         text: 'Error updating API access.',
//                     });
//                 }
//             } else {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Network Error',
//                     text: 'Error updating API access.',
//                 });
//             }
//         }
//     };

//     //TOKEN AND USERPROFILE START
//     const navigate = useNavigate();
//     const getToken = () => {
//         const token = sessionStorage.getItem('token');
//         return token;
//     };
//     const token = getToken();
//     //END

//     ////////////////////////////////////////////////////////////////////////////////
//     return (
//         <div className="w-full h-[90vh]">
//             <div className="bg-white p-4 rounded-lg shadow-md mt-3">
//                 <form onSubmit={handleSubmit}>
//                     {/* Email Selection */}
//                     <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4">
//                             Select Email:
//                         </label>
//                         <select
//                             id="email"
//                             value={selectedEmail}
//                             onChange={handleEmailChange}
//                             required
//                             className="block w-full sm:w-[60%] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
//                         >
//                             <option value="">Select an email</option>
//                             {emails.map((user, index) => (
//                                 <option key={index} value={user.user_id}>
//                                     {user.email}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Permissions Section */}
//                     <div className="flex flex-col sm:flex-row mt-6">
//                         <div className="w-full sm:w-1/2 rounded-lg p-4 overflow-y-auto h-[300px]">
//                             <label className="flex items-center font-semibold text-blue-700 text-lg">
//                                 <input
//                                     type="checkbox"
//                                     onChange={() => setIsORGChecked(!isORGChecked)}
//                                     checked={isORGChecked}
//                                     className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                                 />
//                                 <span className="ml-2">Organization Setup</span>
//                             </label>

//                             {isORGChecked && (
//                                 <div className="ml-5 mt-3 flex-col">
//                                     <label className="flex items-center">
//                                         <input type="checkbox" onChange={() => setIsSummaryChecked(!isSummaryChecked)} checked={isSummaryChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">Summary</span>
//                                     </label>
//                                     <label className="flex items-center">
//                                         <input type="checkbox" onChange={() => setIsDeptChecked(!isDeptChecked)} checked={isDeptChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">Dept</span>
//                                     </label>
//                                     <label className="flex items-center mt-2">
//                                         <input type="checkbox" onChange={() => setIsLocationChecked(!isLocationChecked)} checked={isLocationChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">Location</span>
//                                     </label>
//                                     <label className="flex items-center mt-2">
//                                         <input type="checkbox" onChange={() => setIsDesignationChecked(!isDesignationChecked)} checked={isDesignationChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">Designation</span>
//                                     </label>
//                                     <label className="flex items-center mt-2">
//                                         <input type="checkbox" onChange={() => setIsDomainChecked(!isDomainChecked)} checked={isDomainChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">Domain</span>
//                                     </label>
//                                     {/* <label className="flex items-center mt-2">
//                                         <input type="checkbox" onChange={() => setIsUserCategoryChecked(!isUserCategoryChecked)} checked={isUserCategoryChecked} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" /> <span className="ml-2">User Directory</span>
//                                     </label> */}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="mt-6 ml-5"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"> Update Access</button></div>
//                 </form>
//             </div>
//         </div>
//     );
// };
// export default OrganizationTab;


///////////////////For Global Parameters//////////////////////
import axios from 'axios';
import Swal from 'sweetalert2';
import React, { useState } from 'react';
import Select from "react-select";
import useFetchEmails from '../NewComponents/useFetchEmails';

const OrganizationTab = () => {
    const [selectedEmail, setSelectedEmail] = useState('');
    const emails = useFetchEmails();
    const [isORGChecked, setIsORGChecked] = useState(false);
    const [isSummaryChecked, setIsSummaryChecked] = useState(false);
    const [isDeptChecked, setIsDeptChecked] = useState(false);
    const [isLocationChecked, setIsLocationChecked] = useState(false);
    const [isDesignationChecked, setIsDesignationChecked] = useState(false);
    const [isDomainChecked, setIsDomainChecked] = useState(false);
    const [isUserCategoryChecked, setIsUserCategoryChecked] = useState(false);

    // User Directory / UM
    const [isUMChecked, setIsUMChecked] = useState(false);
    const [isUMCChecked, setIsUMCChecked] = useState(false);
    const [isRoleChecked, setIsRoleChecked] = useState(false);
    const [isUserChecked, setIsUserChecked] = useState(false);
    const [isAddUserChecked, setIsAddUserChecked] = useState(false);
    const [isDeleteUserChecked, setIsDeleteUserChecked] = useState(false);
    const [isEditUserChecked, setIsEditUserChecked] = useState(false);

    // Access Privilege (AMS)
    const [hasAmsAccess, setHasAmsAccess] = useState(false);
    const [isAccessPrivilegeChecked, setIsAccessPrivilegeChecked] = useState(false);

    // UCS
    const [isUCSChecked, setIsUCSChecked] = useState(false);

    // WF
    const [isWFChecked, setIsWFChecked] = useState(false);

    const handleEmailChange = async (e) => {
        const userId = e.target.value;
        setSelectedEmail(userId);
        if (!userId) return;

        try {
            const response = await axios.get(
                `https://devapi.softtrails.net/saas/test/access/access/${userId}`,
                { headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } }
            );

            const apiAccessNames = response.data
                .filter(a => a.user_id === parseInt(userId))
                .map(a => a.api_name);

            // Organization Setup
            setIsORGChecked(apiAccessNames.includes('ORG'));
            setIsSummaryChecked(apiAccessNames.includes('Summary'));
            setIsDeptChecked(apiAccessNames.includes('Dept'));
            setIsLocationChecked(apiAccessNames.includes('Location'));
            setIsDesignationChecked(apiAccessNames.includes('Designation'));
            setIsDomainChecked(apiAccessNames.includes('Domain'));
            setIsUserCategoryChecked(apiAccessNames.includes('UserCategory'));

            // User Directory / UM
            setIsUMChecked(apiAccessNames.some(a => ['UMC', 'Role', 'UM', 'AddUM', 'DltUM', 'EditUM'].includes(a)));
            setIsUMCChecked(apiAccessNames.includes('UMC'));
            setIsRoleChecked(apiAccessNames.includes('Role'));
            setIsUserChecked(apiAccessNames.includes('UM'));
            setIsAddUserChecked(apiAccessNames.includes('AddUM'));
            setIsDeleteUserChecked(apiAccessNames.includes('DltUM'));
            setIsEditUserChecked(apiAccessNames.includes('EditUM'));

            // Access Privilege (AMS)
            setIsAccessPrivilegeChecked(apiAccessNames.includes('AccessPrivilege'));
            setHasAmsAccess(apiAccessNames.includes('update_access'));

            // UCS
            setIsUCSChecked(apiAccessNames.includes('UCS'));

            // WF
            setIsWFChecked(apiAccessNames.includes('WF'));

        } catch (error) {
            Swal.fire({
                icon: 'warning',
                title: 'No Access',
                text: 'No Access is available for the provided User.',
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        if (!token) return Swal.fire({ icon: 'error', title: 'Unauthorized', text: 'Token does not exist.' });

        const orgAccess = [];
        if (isORGChecked) orgAccess.push('ORG', 'Summary', 'Dept', 'Location', 'Designation', 'Domain','UserCategory');

        const userAccess = [];
        if (isUMCChecked) userAccess.push('UMC');
        if (isRoleChecked) userAccess.push('Role');
        if (isUserChecked) userAccess.push('UM');
        if (isAddUserChecked) userAccess.push('AddUM');
        if (isDeleteUserChecked) userAccess.push('DltUM');
        if (isEditUserChecked) userAccess.push('EditUM');

        const amsAccess = [];
        if (isAccessPrivilegeChecked || hasAmsAccess) amsAccess.push('AccessPrivilege', 'update_access');

        const ucsAccess = [];
        if (isUCSChecked) ucsAccess.push('UCS');

        const wfAccess = [];
        if (isWFChecked) wfAccess.push('WF');

        try {
            // ORG
            await axios.put('https://devapi.softtrails.net/saas/test/access/update_access', {
                user_id: selectedEmail,
                module: 'ORG',
                api_access: orgAccess,
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            // UM
            await axios.put('https://devapi.softtrails.net/saas/test/access/update_access', {
                user_id: selectedEmail,
                module: 'UM',
                api_access: userAccess,
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            // AMS (Access Privilege)
            await axios.put('https://devapi.softtrails.net/saas/test/access/update_access', {
                user_id: selectedEmail,
                module: 'AMS',
                api_access: amsAccess,
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            // UCS
            await axios.put('https://devapi.softtrails.net/saas/test/access/update_access', {
                user_id: selectedEmail,
                module: 'UCS',
                api_access: ucsAccess,
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            // WF
            await axios.put('https://devapi.softtrails.net/saas/test/access/update_access', {
                user_id: selectedEmail,
                module: 'WF',
                api_access: wfAccess,
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            Swal.fire({ icon: 'success', title: 'Success', text: 'User Access Updated Successfully!' });

        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Error updating API access.' });
        }
    };

    return (
        <div className="w-full h-[90vh] overflow-auto">
            <div className="bg-white p-4 rounded-lg shadow-md mt-3">
                <form onSubmit={handleSubmit}>
                    {/* Email Selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
                        >
                            Select User:
                        </label>
                        <div className="w-full sm:w-[60%]">
                            <Select
                                id="email"
                                options={emails}
                                value={emails.find((user) => user.value === selectedEmail) || null}
                                onChange={(selectedOption) => {
                                    handleEmailChange({ target: { value: selectedOption?.value || "" } });
                                }}
                                placeholder="Search or select user..."
                                isSearchable
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: "0.5rem",
                                        padding: "2px",
                                        borderColor: "#d1d5db",
                                        boxShadow: "none",
                                        "&:hover": { borderColor: "#2563eb" },
                                    }),
                                }}
                            />
                        </div>
                    </div>

                    {/* Access Sections */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 p-4">
                        {/* Organization Setup */}
                        <div className="rounded-lg p-4 border">
                            <label className="flex items-center font-semibold text-blue-700 text-lg">
                                <input type="checkbox" checked={isORGChecked} onChange={() => setIsORGChecked(!isORGChecked)} className="h-4 w-4" />
                                <span className="ml-2">Organization Setup</span>
                            </label>
                            {isORGChecked && (
                                <div className="ml-5 mt-3 space-y-1">
                                    <label className="flex items-center"><input type="checkbox" checked={isSummaryChecked} onChange={() => setIsSummaryChecked(!isSummaryChecked)} className="h-4 w-4" /> <span className="ml-2">Summary</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isDeptChecked} onChange={() => setIsDeptChecked(!isDeptChecked)} className="h-4 w-4" /> <span className="ml-2">Dept</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isLocationChecked} onChange={() => setIsLocationChecked(!isLocationChecked)} className="h-4 w-4" /> <span className="ml-2">Location</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isDesignationChecked} onChange={() => setIsDesignationChecked(!isDesignationChecked)} className="h-4 w-4" /> <span className="ml-2">Designation</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isDomainChecked} onChange={() => setIsDomainChecked(!isDomainChecked)} className="h-4 w-4" /> <span className="ml-2">Domain</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isUserCategoryChecked} onChange={() => setIsUserCategoryChecked(!isUserCategoryChecked)} className="h-4 w-4" /> <span className="ml-2">User Category</span></label>
                                </div>
                            )}
                        </div>

                        {/* User Directory / UM */}
                        <div className="rounded-lg p-4 border">
                            <label className="flex items-center font-semibold text-blue-700 text-lg">
                                <input type="checkbox" checked={isUMChecked} onChange={() => setIsUMChecked(!isUMChecked)} className="h-4 w-4" />
                                <span className="ml-2">User Directory</span>
                            </label>
                            {isUMChecked && (
                                <div className="ml-5 mt-3 space-y-1">
                                    <label className="flex items-center"><input type="checkbox" checked={isUMCChecked} onChange={() => setIsUMCChecked(!isUMCChecked)} className="h-4 w-4" /> <span className="ml-2">Directory Service</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isRoleChecked} onChange={() => setIsRoleChecked(!isRoleChecked)} className="h-4 w-4" /> <span className="ml-2">Group / Role</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={isUserChecked} onChange={() => setIsUserChecked(!isUserChecked)} className="h-4 w-4" /> <span className="ml-2">Users</span></label>
                                    {isUserChecked && (
                                        <div className="ml-6 mt-2 text-sm">
                                            <label className="flex items-center mt-2"><input type="checkbox" checked={isAddUserChecked} onChange={() => setIsAddUserChecked(!isAddUserChecked)} className="h-4 w-4" /> <span className="ml-2">Add User</span></label>
                                            <label className="flex items-center mt-2"><input type="checkbox" checked={isDeleteUserChecked} onChange={() => setIsDeleteUserChecked(!isDeleteUserChecked)} className="h-4 w-4" /> <span className="ml-2">Delete User</span></label>
                                            <label className="flex items-center mt-2"><input type="checkbox" checked={isEditUserChecked} onChange={() => setIsEditUserChecked(!isEditUserChecked)} className="h-4 w-4" /> <span className="ml-2">Edit User</span></label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Access Privilege (AMS) */}
                        <div className="rounded-lg p-4 border">
                            <label className="flex items-center font-semibold text-blue-700 text-lg">
                                <input type="checkbox" checked={isAccessPrivilegeChecked} onChange={() => setIsAccessPrivilegeChecked(!isAccessPrivilegeChecked)} className="h-4 w-4" />
                                <span className="ml-2">Access Privilege</span>
                            </label>
                        </div>

                        {/* UCS */}
                        <div className="rounded-lg p-4 border">
                            <label className="flex items-center font-semibold text-blue-700 text-lg">
                                <input type="checkbox" checked={isUCSChecked} onChange={() => setIsUCSChecked(!isUCSChecked)} className="h-4 w-4" />
                                <span className="ml-2">Custom Template</span>
                            </label>
                        </div>

                        {/* WF */}
                        <div className="rounded-lg p-4 border">
                            <label className="flex items-center font-semibold text-blue-700 text-lg">
                                <input type="checkbox" checked={isWFChecked} onChange={() => setIsWFChecked(!isWFChecked)} className="h-4 w-4" />
                                <span className="ml-2">Approval Workflow</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 ml-5">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Update Access
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default OrganizationTab;