// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import Sidebar from "../Sidebar/HRMSidebar";
// import Header from "./Header";
// import { motion } from "framer-motion";
// import Cropper from "react-easy-crop"; // Import Cropper
// import getCroppedImg from "./cropImageHelper"; // Utility function for cropping
// import { FaCamera, FaEdit, FaTimes } from "react-icons/fa";
// import DocumentPage from "./EmployeeDocuments";
// import DocUpload from "./EmployeeDocUpload";
// import PersonalInfo from "./personalInfo";
// import JobDetails from "../employee data/JobDetails";

// function EmployeeLayout() {
//   const fileInputRef = useRef(null);
//   const { userId } = useParams();
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeData, setEmployeeData] = useState(null);
//   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [imageSrc, setImageSrc] = useState(null);
//   const [cropType, setCropType] = useState("profile");

//   const [backgroundImage, setBackgroundImage] = useState("");
//   const [profileImage, setProfileImage] = useState(
//     "https://via.placeholder.com/150?text=Profile+Photo"
//   );

//   useEffect(() => {
//     const storedEmployeeId =
//       sessionStorage.getItem("employeeeId") || sessionStorage.getItem("userId");
//     if (storedEmployeeId) {
//       setEmployeeId(storedEmployeeId);
//     }
//     return () => {
//       sessionStorage.removeItem("employeeeId");
//     };
//   }, [userId]);

//   useEffect(() => {
//     if (employeeId) {
//       axios
//         .get("https://devapi.softtrails.net/hrms/test/users")
//         .then((response) => {
//           const filteredData = response.data.filter(
//             (item) => item.user_id === parseInt(employeeId)
//           );
//           setEmployeeData(filteredData.length > 0 ? filteredData[0] : null);
//         })
//         .catch(() => setEmployeeData(null));
//     }
//   }, [employeeId]);

//   const handleFileSelect = (event, type) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         setImageSrc(reader.result);
//         setCropType(type);
//         setIsCropModalOpen(true);
//       };
//     }
//   };

//   const handleCropComplete = (_, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   };

//   const handleSaveCroppedImage = async () => {
//     try {
//       const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
//       if (cropType === "profile") {
//         setProfileImage(croppedImage);
//       } else {
//         setBackgroundImage(croppedImage);
//       }
//       setIsCropModalOpen(false);
//     } catch (error) {
//       console.error("Error cropping image:", error);
//     }
//   };

//   return (
//     <div className="overflow-hidden px-2 rounded-2xl bg-stone-50">
//       <div className="flex gap-3 max-md:flex-col">
//         <Sidebar />
//         <div className="flex flex-col w-[81%] max-md:w-full">
//           <Header />
//           <div className="mt-4">
//             <div className="flex gap-5 max-md:flex-col">
//               <div className="flex flex-col w-[40%] max-md:w-full">
//                 <div className="flex flex-col pb-20 bg-white border border-neutral-200 rounded-lg">
//                   <div
//                     className="relative flex items-end h-[204px] w-full bg-cover bg-center rounded-t-lg"
//                     style={{
//                       backgroundImage: `url('${backgroundImage}')`,
//                     }}
//                   >
//                     {/* Profile Photo */}
//                     <div className="absolute -bottom-10 left-4">
//                       <img
//                         src={profileImage}
//                         alt="Profile"
//                         className="w-24 h-24 rounded-full border-2 border-white shadow-md cursor-pointer"
//                       />
//                       <button
//                         onClick={() => fileInputRef.current.click()}
//                         className="absolute bottom-0 right-0 p-2 bg-gray-800 text-white rounded-full shadow-lg"
//                       >
//                         <FaCamera />
//                       </button>
//                     </div>
//                     <button
//                       onClick={() => fileInputRef.current.click()}
//                       className="absolute right-4 bottom-4 p-2 bg-blue-600 text-white rounded-full"
//                     >
//                       <FaEdit />
//                     </button>
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       accept="image/*"
//                       onChange={(e) => handleFileSelect(e, "profile")}
//                       style={{ display: "none" }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Crop Modal */}
//               {isCropModalOpen && (
//                 <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
//                   <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-md">
//                     <h2 className="text-lg font-semibold mb-4">Crop Image</h2>
//                     <div className="relative w-full h-64">
//                       <Cropper
//                         image={imageSrc}
//                         crop={crop}
//                         zoom={zoom}
//                         aspect={cropType === "profile" ? 1 / 1 : 16 / 9}
//                         onCropChange={setCrop}
//                         onZoomChange={setZoom}
//                         onCropComplete={handleCropComplete}
//                       />
//                     </div>
//                     <div className="flex justify-between mt-4">
//                       <button
//                         onClick={() => setIsCropModalOpen(false)}
//                         className="px-4 py-2 bg-gray-500 text-white rounded-md"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleSaveCroppedImage}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-md"
//                       >
//                         Crop & Save
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Tab Navigation */}
//               <div className="flex flex-col w-[90%]">
//                 <div className="flex flex-col gap-4">
//                   <div className="flex gap-2 rounded-full p-1 relative">
//                     <motion.div
//                       layoutId="activeTab"
//                       className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
//                       style={{
//                         width: `calc(100% / ${["personalInfo", "jobInfo", "documents"].length})`,
//                         left: `${(["personalInfo", "jobInfo", "documents"].findIndex((t) => t === "personalInfo") * 100) / 3}%`,
//                       }}
//                       transition={{ type: "spring", stiffness: 600, damping: 20 }}
//                     />
//                   </div>
//                   <div className="mt-6">
//                     <PersonalInfo />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EmployeeLayout;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop"; // Import Cropper
import getCroppedImg from "./cropImageHelper"; // Utility function for cropping
import {
  FaCamera,
  FaEdit,
  FaEnvelope,
  FaMarsStroke,
  FaPhone,
} from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import DocumentPage from "./EmployeeDocuments";
import DocUpload from "./EmployeeDocUpload";
import PersonalInfo from "./personalInfo";
import JobDetails from "./JobDetails";
import Swal from "sweetalert2";
import HRPoliciesTab from "./HRPoliciesTab";

function EmployeeLayout() {
  const fileInputRef = useRef(null);
  const userId = useParams(); // Extract userId from URL\
  console.warn(userId.employeeId);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropType, setCropType] = useState("profile");
  const [activeTab, setActiveTab] = useState("personalInfo");

  const tabs = [
    { id: "personalInfo", label: "Personal Info" },
    { id: "jobInfo", label: "Job Info" },
    { id: "documents", label: "My Documents" },
    { id: "hrpolicies", label: "HR Policy" },   
  ];

  useEffect(() => {
    const storedEmployeeId =
      sessionStorage.getItem("employeeeId") || sessionStorage.getItem("userId");
    if (storedEmployeeId) {
      setEmployeeId(userId.employeeId);
    }

  }, [userId]);

  useEffect(() => {
  if (employeeId) {
    axios
      .get("https://devapi.softtrails.net/hrms/test/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        const filteredData = response.data.users.filter(
          (item) => item.user_id === parseInt(employeeId)
        );

        if (filteredData.length > 0) {
          setEmployeeData(filteredData[0]);
        } else {
          console.error("Employee not found");
          setEmployeeData(null);
        }

        console.log("Filtered employee data:", filteredData);
        console.log("Stored employeeId:", employeeId);
        console.log("API response:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setEmployeeData(null);
      });
  }
}, [employeeId]);


  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCropType(type); // Set crop type (either 'profile' or 'background')

      setImageSrc(fileUrl); // Set image for cropping modal
      setIsCropModalOpen(true); // Open crop modal
    }
  };

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  const handleSaveCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (cropType === "profile") {
        setProfileImage(croppedImage);
      } else {
        setBackgroundImage(croppedImage);
      }
      setIsCropModalOpen(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCopyClick = (userId) => {
    navigator.clipboard
      .writeText(userId)
      .then(() => {
        Swal.fire("User ID copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
      });
  };

  const [backgroundImage, setBackgroundImage] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150?text=Profile+Photo"
  );
  const handleEditClick = (type) => {
    fileInputRef.current.dataset.type = type; // Set the image type (profile or background)
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleProfileClick = () => {
    setIsModalOpen(true); // Open modal
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="overflow-hidden px-2 rounded-2xl">
      <div className="flex gap-3 max-md:flex-col">
        <div className="flex flex-col w-full max-md:w-full h-full min-h-screen">
          <div className="flex flex-col w-full max-md:mt-8">
            <div className="mt-4 ">
              <div className="flex  gap-5 max-md:flex-col">
                <div className="flex -mt-4  h-screen flex-col w-[40%] max-md:w-full">
                  <div className="flex flex-col h-screen pb-20 bg-white border border-neutral-200 rounded-lg">
                    <div
                      className="relative flex items-end h-[204px] w-full bg-cover bg-center rounded-t-lg"
                      style={{
                        backgroundImage: `url('${backgroundImage ||
                          "https://miro.medium.com/v2/resize:fit:1400/0*IMK4r0ciK6Sa7k_k"
                          }')`,
                      }}
                    >
                      {/* Profile Photo */}
                      <div className="absolute -bottom-10 left-4">
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full border-2 border-white shadow-md cursor-pointer"
                          onClick={handleProfileClick} // Open modal to view enlarged profile
                          style={{
                            backgroundImage: `url('${backgroundImage ||
                              "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid"
                              }')`,
                          }}
                        />
                        <button
                          onClick={() => {
                            fileInputRef.current.dataset.type = "profile"; // Set type to profile
                            handleEditClick("profile"); // Trigger the cropping flow for profile
                          }}
                          className="absolute bottom-0 right-0 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 focus:outline-none"
                        >
                          <FaCamera />
                        </button>
                      </div>
                      {/* Edit Icon for Background */}
                      <button
                        onClick={() => {
                          fileInputRef.current.dataset.type = "background"; // Set type to background
                          handleEditClick("background"); // Trigger the cropping flow for background
                        }}
                        className="absolute right-4 bottom-4 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none"
                      >
                        <FaEdit />
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) =>
                          handleFileSelect(e, fileInputRef.current.dataset.type)
                        } // Pass the correct image type
                        style={{ display: "none" }}
                      />
                    </div>

                    <div className="flex flex-col mt-10 ml-7 max-w-full w-[223px]">
                      {employeeData ? (
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold text-black">
                            {employeeData.first_name} {employeeData.last_name}
                          </div>
                          <div className="flex items-center gap-2 ml-auto bg-gray-200 px-3 py-1 rounded-full cursor-pointer">
                            <div className="text-sm text-gray-700">
                              {employeeData.emp_id}
                            </div>
                            <FaCopy
                              className="text-gray-500 cursor-pointer"
                              onClick={() =>
                                handleCopyClick(employeeData.emp_id)
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <p>Loading...</p>
                      )}
                      {/* Modal for Enlarged Profile Photo */}
                      {isCropModalOpen && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                          <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-md">
                            <h2 className="text-lg font-semibold mb-4">
                              Crop Image
                            </h2>
                            <div className="relative w-full h-64">
                              <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={cropType === "profile" ? 1 / 1 : 16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                              />
                            </div>
                            <div className="flex justify-between mt-4">
                              <button
                                onClick={() => setIsCropModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveCroppedImage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                              >
                                Crop & Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isModalOpen && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                          onClick={handleCloseModal}
                        >
                          <div
                            className="bg-white p-4 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={profileImage}
                              alt="Profile"
                              className="w-[400px] h-[400px] object-cover rounded-lg"
                            />
                            <button
                              onClick={handleCloseModal}
                              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="mt-4">
                        {employeeData ? (
                          <>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-gray-700">
                                <FaEnvelope />{" "}
                              </span>
                              <div>
                                <div className=" text-base font-medium text-gray-700">
                                  Mail Id
                                </div>
                                <div className=" text-xs text-gray-600">
                                  {employeeData.email || "NA"}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-gray-700">
                                <FaPhone />{" "}
                              </span>
                              <div>
                                <div className="text-base font-medium text-gray-700">
                                  Mobile Phone
                                </div>
                                <div className="text-xs text-gray-600">
                                  {employeeData.phone_no || "NA"}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-gray-700">
                                <FaMarsStroke />{" "}
                              </span>
                              <div>
                                <div className="text-base font-medium text-gray-700">
                                  Gender
                                </div>
                                <div className="text-xs text-gray-600">
                                  {employeeData.gender || "NA"}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p>Loading...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-[90%]">
                  <div className="flex flex-col gap-4">
                    {/* Tab Navigation */}
                    <div className="flex gap-2 rounded-full p-1 relative">
                      {/* Animated Background for Active Tab (Exclude 'uploadDocuments') */}
                      {activeTab !== "uploadDocuments" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                          style={{
                            width: `calc(100% / ${tabs.length})`,
                            left: `${(tabs.findIndex((t) => t.id === activeTab) *
                                100) /
                              tabs.length
                              }%`,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 20,
                          }}
                        />
                      )}

                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id && tab.id !== "uploadDocuments"
                              ? "text-white"
                              : "text-gray-700"
                            }`}
                          onClick={() => setActiveTab(tab.id)}
                          style={
                            tab.id === "uploadDocuments"
                              ? { backgroundColor: "transparent" }
                              : {}
                          }
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div>
                      {activeTab === "personalInfo" && <PersonalInfo />}
                      {activeTab === "jobInfo" && <JobDetails />}
                      {activeTab === "documents" && (
                        <DocumentPage setActiveTab={setActiveTab} />
                      )}
                      {activeTab === "uploadDocuments" && (
                        <DocUpload setActiveTab={setActiveTab} />
                      )}
                      {activeTab === "hrpolicies" && <HRPoliciesTab />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EmployeeLayout;