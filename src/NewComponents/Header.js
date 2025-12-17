import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";
import ProfileDropdown from '../ProfileDropdown';
import { createPortal } from "react-dom";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 80, left: 1200 });

  const toggleDropdown = () => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 240; // approx width
      const margin = 10;

      let left = rect.left;
      let top = rect.bottom + 5;

      if (left + dropdownWidth > window.innerWidth - margin) {
        left = window.innerWidth - dropdownWidth - margin;
      }

      // Clamp to 750px max
      if (left > 1580) {
        left = 1580;
      }

      setDropdownPos({ top, left });
    }
    setDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `https://devapi.softtrails.net/saas/test/users/id_user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data?.user) {
            setUserData(response.data.user); // 👈 FIX: only set the actual user object
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token]);

  const handleNavigate = () => {
    if (location.pathname.includes("/employeelayout")) {
      navigate("/HRCorner"); // Go to /dms if on employeelayout/:id
    } else {
      navigate("/Cards"); // Otherwise, go to /Cards
    }
  };

  const getHeading = () => {
    switch (location.pathname) {
      case "/documentUpload":
        return "Upload Employee Documents";
      case "/employeelayout":
        return "Employee Layout";
      case "/Reports":
        return "Dashboard";
      case "/PurchaseModule":
      case "/PurchaseWorkflow":
      case "/Approval":
        return "Purchase Module";
      case "/FinancialBudget":
        return "Finance";
      case "/Organization":
        return "Organization Setup";
      case "/Leave":
        return "Leave Management";
      case "/HRCorner":
        return "HR Corner";
      case "/Users":
        return "Directory Service";
      case "/LogsPage":
        return "Logs";
      case "/AccessPrivilege":
        return "Access Privilege";
      case "/Profile":
        return "Profile";
      case "/Project":
        return "Project";
      case "/ProjectApproval":
        return "Approvals";
      case "/AllocationRequest":
        return "Allocation Request";
      case "/AllTab":
        return "Approvals";
      case "/ResubmittedApproval":
        return "Logs";
      case "/RepoAllTab":
        return "Asset Management";
      case "/CategoryTab":
        return "Asset Category";
      case "/Depreciation":
        return "Asset Valuation";
      case "/Workflow":
        return "Approval Workflow";
      case "/AssetHistory":
        return "Asset History";
      case "/AllTabs":
        return "Custom Template";
      case "/HRPolicies":
        return "HR Policy";
      case "/TabNavigation":
      case "/ApprovalWorkflow":
        return "CRM";
      case "/VendorManagement":
        return "Vendor Management";
      case "/PurchaseProcess":
        return "Purchase Process";
      case "/Processtab":
        return "Approval Process";
      case "/dms/setup":
        return "Document Management System";
      case "/AMSTab":
        return "Attendance Management System";
      case "/dms/upload":
        return "Document File Upload"
      case "/PMSTab":
        return "Performance Management";
      case "/PurchaseApproval":
        return "Purchase Approval";
      case "/SetupWorkflow":
        return "Approval Workflow";
      case "/ProjectEstimation":
        return "Production Estimation";
      case "/ProductionOutput":
        return "Production Output";
      case "/CRMTabs":
        return "CRM/Customers";
      case "/Lead":
        return "Lead";
      case "/SalesProcess":
        return "Sales Process";
      default:
        return "Employee Data";
    }
  };

  /********************************ACCESS*****************************/
  const [hasAMSAccessEmployees, setHasAMSAccessEmployees] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAMSAccess = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');
        if (!userId || !token) {
          console.error('userId or token is missing');
          return;
        }
        const response = await axios.get(`https://devapi.softtrails.net/saas/test/access/access/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Access API Response:', response.data);
        const userAccess = response.data;
        const hasEmployeeAccess = userAccess.some(access => access.api_name === 'DMS');
        setHasAMSAccessEmployees(hasEmployeeAccess);
      } catch (error) {
        console.error('Error occurred during API call: ', error);
        if (error.response) {
          console.error('API Response error:', error.response.data);
          console.error('Status code:', error.response.status);
        } else if (error.request) {
          console.error('No response received from API:', error.request);
        } else {
          // Something else happened in setting up the request
          console.error('Error message:', error.message);
        }
        setHasAMSAccessEmployees(false);
      } finally {
        setLoading(false);
      }
    };
    checkAMSAccess();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="bg-custome-blue rounded-lg w-full px-3 py-3 mb-3 flex flex-col sm:flex-row justify-between items-center shadow-lg sticky top-0">
        {/* Logo Section */}
        <div className="flex items-center">
          <button onClick={handleNavigate} type="button" className="flex items-center p-2 rounded-full mr-2">
            {location.pathname.includes("/employeelayout") ? (
              hasAMSAccessEmployees ? (
                <FaArrowLeft className="text-white" size={25} />
              ) : null
            ) : (
              <FaHome className="text-white" size={25} />
            )}
          </button>
          <h1 className="text-white text-2xl sm:text-2xl font-bold">{getHeading()}</h1>
        </div>

        {/* User Profile Button */}
        {userData && (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              type="button"
              className="bg-white flex items-center rounded-full mt-2 sm:mt-0 sm:mr-5 px-2 py-2"
            >
              <div className="bg-white rounded-3xl flex items-center">
                <div className="mr-2">
                  <img
                    src="http://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                    alt="Profile Icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xs sm:text-sm font-semibold text-custome-black">
                    {userData.first_name} {userData.last_name}
                  </h3>
                </div>
              </div>
            </button>

            {dropdownOpen &&
              createPortal(
                <>
                  {/* Backdrop only for blur/dim effect */}
                  <div
                    className="fixed inset-0 bg-transparent z-[99998]"
                    onClick={() => setDropdownOpen(false)}
                  />

                  {/* Dropdown box */}
                  <div
                    ref={dropdownRef}
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      zIndex: 99999
                    }}
                    className="rounded-lg shadow-lg p-2"
                  >
                    <ProfileDropdown />
                  </div>
                </>,
                document.body
              )
            }
          </div>
        )}
      </div>
    </div>
  );
};
export default Header;





///////////////////////////////////////////////////////////////
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { FaHome, FaArrowLeft } from "react-icons/fa";
// import ProfileDropdown from "../ProfileDropdown";
// import { createPortal } from "react-dom";

// const Header = () => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [userData, setUserData] = useState(null);
//   const buttonRef = useRef(null);
//   const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

//   const calculateDropdownPosition = () => {
//     if (buttonRef.current && dropdownRef.current) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       const dropdownWidth = dropdownRef.current.offsetWidth || 240;
//       const dropdownHeight = dropdownRef.current.offsetHeight || 200;
//       const margin = 10;

//       let left = rect.left;
//       let top = rect.bottom + 5;

//       if (left + dropdownWidth > window.innerWidth - margin) {
//         left = window.innerWidth - dropdownWidth - margin;
//       }

//       if (rect.bottom + dropdownHeight > window.innerHeight - margin) {
//         top = rect.top - dropdownHeight - 5;
//       }

//       if (left < margin) {
//         left = margin;
//       }

//       setDropdownPos({ top, left });
//     }
//   };

//   const toggleDropdown = () => {
//     if (!dropdownOpen) {
//       calculateDropdownPosition();
//     }
//     setDropdownOpen((prev) => !prev);
//   };

//   useEffect(() => {
//     if (dropdownOpen) {
//       window.addEventListener("resize", calculateDropdownPosition);
//       window.addEventListener("scroll", calculateDropdownPosition, true);
//     }
//     return () => {
//       window.removeEventListener("resize", calculateDropdownPosition);
//       window.removeEventListener("scroll", calculateDropdownPosition, true);
//     };
//   }, [dropdownOpen]);

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setDropdownOpen(false);
//     }
//   };

//   useEffect(() => {
//     if (dropdownOpen) {
//       document.addEventListener("click", handleClickOutside);
//     } else {
//       document.removeEventListener("click", handleClickOutside);
//     }
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [dropdownOpen]);

//   const getToken = () => sessionStorage.getItem("token");
//   const token = getToken();

//   useEffect(() => {
//     const userId = sessionStorage.getItem("userId");
//     if (userId) {
//       const fetchUserData = async () => {
//         try {
//           const response = await axios.get(
//             `https://devapi.softtrails.net/saas/test/users/id_user/${userId}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           if (response.data) setUserData(response.data);
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//         }
//       };
//       fetchUserData();
//     }
//   }, [token]);

//   const handleNavigate = () => {
//     if (location.pathname.includes("/employeelayout")) {
//       navigate("/HRCorner");
//     } else {
//       navigate("/Cards");
//     }
//   };

//   const getHeading = () => {
//     switch (location.pathname) {
//       case "/documentUpload":
//         return "Upload Employee Documents";
//       case "/employeelayout":
//         return "Employee Layout";
//       case "/Reports":
//         return "Reports";
//       // ... keep rest of your cases
//       default:
//         return "Employee Data";
//     }
//   };

//   return (
//     <div className="flex flex-col w-full">
//       <div className="bg-custome-blue rounded-lg w-full px-2 sm:px-3 py-2 sm:py-3 mb-3
//                   flex flex-wrap sm:flex-nowrap justify-between items-center gap-2
//                   shadow-lg sticky top-0">

//         {/* Left Section: Logo + Heading */}
//         <div className="flex items-center flex-shrink-0 min-w-0">
//           <button
//             onClick={handleNavigate}
//             type="button"
//             className="flex items-center p-1 sm:p-2 rounded-full mr-2"
//           >
//             {location.pathname.includes("/employeelayout") ? (
//               <FaArrowLeft className="text-white" size={20} />
//             ) : (
//               <FaHome className="text-white" size={20} />
//             )}
//           </button>
//           <h1 className="text-white text-base sm:text-lg md:text-2xl font-bold truncate">
//             {getHeading()}
//           </h1>
//         </div>

//         {/* Right Section: User Profile */}
//         {userData && (
//           <div className="relative flex-shrink-0">
//             <button
//               onClick={toggleDropdown}
//               ref={buttonRef}
//               type="button"
//               className="bg-white flex items-center rounded-full px-2 py-1 sm:px-3 sm:py-2"
//             >
//               <img
//                 src="http://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
//                 alt="Profile Icon"
//                 className="h-6 w-6 sm:h-8 sm:w-8 rounded-full mr-2"
//               />
//               <h3 className="text-xs sm:text-sm md:text-base font-semibold text-custome-black
//                         truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
//                 {userData.first_name} {userData.last_name}
//               </h3>
//             </button>

//             {dropdownOpen &&
//               createPortal(
//                 <>
//                   <div
//                     className="fixed inset-0 bg-transparent z-[99998]"
//                     onClick={() => setDropdownOpen(false)}
//                   />
//                   <div
//                     ref={dropdownRef}
//                     style={{
//                       position: "fixed",
//                       top: dropdownPos.top,
//                       left: Math.min(
//                         dropdownPos.left,
//                         window.innerWidth - 220
//                       ),
//                       zIndex: 99999,
//                     }}
//                     className="bg-white rounded-lg shadow-lg p-2 min-w-[200px] max-w-[90vw]"
//                   >
//                     <ProfileDropdown />
//                   </div>
//                 </>,
//                 document.body
//               )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default Header;