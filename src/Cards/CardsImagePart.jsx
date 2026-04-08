import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import DMS from "../assests/DMS.jpg";
import UCS from "../assests/UCS.jpg";
import HRMS from "../assests/HRMS.jpg";
import PM from "../assests/PurchaseModule.jpg";
import CRM from "../assests/CRM.jpg";
import Access from "../assests/Access.jpg";
import Logs from "../assests/Logs.jpg";
import FB from "../assests/FinancialBudget.jpg";
import UD from "../assests/User Directory.jpg";
import ASM from "../assests/Asset.jpg";
import WF from "../assests/UCS.jpg";
import HMS from "../assests/HRMS.jpg";
import { MAIN_API_BASE } from "../config/apiBase";

const allServices = [
  { key: "ORG", title: "Organization Setup", img: Access, path: "/Organization", },
  // { key: "UMC", title: "Directory Service", img: UD, path: "/Users" },
  { key: "HRMS", title: "Human Resource Management System", img: HRMS, path: "/HRMS", },
  { key: "ASM", title: "Asset Management System", img: ASM, path: "/AssetManagement", },
  { key: "PAL", title: "Product Assembly Line", img: Logs, path: "/ProductAssembly" },
  // { key: "doc_management", title: "Document Management System", img: DMS, path: "/dms", },
  { key: "CRM", title: "Customer Relationship Management", img: CRM, path: "/CRMTabs", },
  // { key: "UCS", title: "Communication Service", img: UCS, path: "/AllTabs" },
  { key: "purchase_module", title: "Purchase Module", img: PM, path: "/PurchaseModule", },
  { key: "Budget", title: "Financial Budget", img: FB, path: "/FinancialBudget", },
  // { key: "WF", title: "Workflow", img: WF, path: "/SetupWorkflow" },
  // { key: "update_access", title: "Access Privilege", img: Access, path: "/AccessPrivilege", },
  { key: "LogsAccess", title: "Logs", img: Logs, path: "/LogsPage" },
  { key: "CMS", title: "CMS", img: Access, path: "/setup" },
  { key: "HMS", title: "Hospital Management", img: HMS, path: "/HospitalManagement" },
];

// const CardsImagePart = () => {
//   const [services, setServices] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAccess = async () => {
//       try {
//         const token = sessionStorage.getItem("token");
//         const userId = sessionStorage.getItem("userId");
//         const cardTitles = allServices.map((service) => service.key);
//         const res = await axios.post(`${MAIN_API_BASE}/access/verify-access`,
//           {
//             user_id: parseInt(userId),
//             pages: cardTitles,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const allowedKeys = Object.keys(res.data).filter(
//           (key) => res.data[key]
//         );
//         const filtered = allServices.filter((service) =>
//           allowedKeys.includes(service.key)
//         );
//         setServices(filtered);
//       } catch (error) {
//         console.error("Error fetching access:", error);
//       }
//     };
//     fetchAccess();
//   }, []);

//   return (
//     <div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
//         {services.map((service, index) => (
//           <motion.div
//             key={index}
//             className="relative group cursor-pointer bg-white rounded-xl shadow-md overflow-hidden min-w-0 w-full aspect-[4/3]"
//             whileHover={{ scale: 1.03 }}
//             transition={{ duration: 0.3 }}
//             onClick={() => navigate(service.path)}
//           >
//             <img
//               src={service.img}
//               alt={service.title}
//               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//             />
//             <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm p-3 text-center">
//               {service.title}
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

const CardsImagePart = () => {
    const [services, setServices] = useState([]);
    const [noAccess, setNoAccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const isFirstUser = userId === "1";

    const fetchAccess = async () => {
        try {
            const cardTitles = allServices.map((service) => service.key);
            const res = await axios.post(
                `${MAIN_API_BASE}/access/verify-access`,
                {
                    user_id: parseInt(userId),
                    pages: cardTitles,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const allowedKeys = Object.keys(res.data).filter((key) => res.data[key]);
            const filtered = allServices.filter((service) =>
                allowedKeys.includes(service.key)|| service.key === "HMS"
            );
            setServices(filtered);
            setNoAccess(allowedKeys.length === 0);
        } catch (error) {
            console.error('Error fetching access:', error);
            setNoAccess(true);
        }
    };

    const handleSetupModule = async () => {
        try {
            setLoading(true);
            await axios.post(
                `${MAIN_API_BASE}/test1/create1`,
                { user_id: parseInt(userId) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            await fetchAccess();
        } catch (error) {
            console.error("Error in setup module:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccess();
    }, []);

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        className="relative group cursor-pointer bg-white rounded-xl shadow-md overflow-hidden min-w-0 w-full aspect-[4/3]"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => navigate(service.path)}
                    >
                        <img
                            src={service.img}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-sm p-3 text-center">
                            {service.title}
                        </div>
                    </motion.div>
                ))}
            </div>

            {noAccess && (
                <div className="mt-6 w-full max-w-md bg-white border border-gray-200 rounded-xl shadow p-5 text-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            No Access Available
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isFirstUser
                                ? "Click below to setup your modules."
                                : "You don’t have access to any modules. Please contact your administrator."}
                        </p>

                        {isFirstUser && (
                            <button
                                onClick={handleSetupModule}
                                disabled={loading}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Setting up..." : "Setup Module"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default CardsImagePart;
