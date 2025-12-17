// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Typography,
//   Box,
//   TextField,
//   InputAdornment,
// } from "@mui/material";
// import axios from "axios";
// import AdminSidebar from "../Sidebar/HRMSidebar";
// import Header from "./Header";
// import EmployeeList from "./EmployeeList";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip as RechartsTooltip,
// } from "recharts";
// import { Link } from "react-router-dom";
// import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
// import { SearchIcon } from "lucide-react";

// const COLORS = ["#1976D2", "#E53935"];
// const GENDER_COLORS = ["#0288D1", "#F48FB1"];

// const DMS = () => {
//   const [employeeData, setEmployeeData] = useState([]);
//   const [departmentCounts, setDepartmentCounts] = useState([]);
//   const [locationCounts, setLocationCounts] = useState([]);
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [selectedDepartment, setSelectedDepartment] = useState("");
//   const [departments, setDepartments] = useState([]);
//   const [totalCounts, setTotalCounts] = useState({
//     totalEmployees: 0,
//     inactiveEmployees: 0,
//     totalDepartments: 0,
//     maleEmployees: 0,
//     femaleEmployees: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userResponse = await axios.get(
//           "https://devapi.softtrails.net/hrms/test/users"
//         );
//         const departmentResponse = await axios.get(
//           "https://devapi.softtrails.net/saas/test/departments"
//         );
//         const users = userResponse.data;
//         const departments = departmentResponse.data;

//         setEmployeeData(users);
//         setFilteredEmployees(users);
//         setDepartments(departments);

//         const totalEmployees = users.length;
//         const inactiveEmployees = users.filter(
//           (user) => user.user_status === "inactive"
//         ).length;
//         const maleEmployees = users.filter(
//           (user) => user.gender === "Male"
//         ).length;
//         const femaleEmployees = totalEmployees - maleEmployees;

//         const departmentCounts = departments.map((dept) => {
//           const deptUsers = users.filter(
//             (user) => user.dept_name === dept.dept_name
//           );
//           return { name: dept.dept_name, value: deptUsers.length };
//         });

//         // Extract unique localities
//         const uniqueLocalities = [
//           ...new Set(users.map((user) => user.locality)),
//         ];
//         const locationCounts = users.reduce((acc, user) => {
//           const locality = user.locality || "Unknown"; // Handle empty locality
//           const existing = acc.find((item) => item.name === locality);
//           if (existing) {
//             existing.value += 1;
//           } else {
//             acc.push({ name: locality, value: 1 });
//           }
//           return acc;
//         }, []);

//         setTotalCounts({
//           totalEmployees,
//           inactiveEmployees,
//           totalDepartments: departments.length,
//           totalLocations: uniqueLocalities.length,
//           maleEmployees,
//           femaleEmployees,
//         });
//         setDepartmentCounts(departmentCounts);
//         setLocationCounts(locationCounts);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   console.log(departmentCounts);

//   const filterEmployees = (search, department) => {
//     let filtered = [...employeeData];

//     console.log(
//       "Filtering employees with search:",
//       search,
//       "and department:",
//       department
//     );

//     if (search) {
//       const searchTerms = search.toLowerCase().split(" ");

//       filtered = filtered.filter((employee) =>
//         searchTerms.every(
//           (term) =>
//             employee.first_name?.toLowerCase().includes(term) ||
//             employee.last_name?.toLowerCase().includes(term) ||
//             employee.user_id?.toString().includes(term) ||
//             employee.dept_name?.toString().includes(term) ||
//             employee.email?.toLowerCase().includes(term) ||
//             employee.user_status?.toLowerCase().includes(term) ||
//             employee.phone_no?.toLowerCase().includes(term)
//         )
//       );
//     }

//     if (department) {
//       filtered = filtered.filter(
//         (employee) => employee.dept_name === department
//       );
//     }

//     console.log("Filtered Employees:", filtered);

//     setFilteredEmployees(filtered);
//   };

//   const handleSearchChange = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchText(value);
//     filterEmployees(value, selectedDepartment);
//   };

//   const handleDepartmentChange = (e) => {
//     const value = e.target.value;
//     setSelectedDepartment(value);
//     filterEmployees(searchText, value);
//   };

//   const pieData = [
//     { name: "Male", value: totalCounts.maleEmployees },
//     { name: "Female", value: totalCounts.femaleEmployees },
//   ];

//   const cardStyle =
//     "p-4 bg-white rounded-xl border border-gray-300 shadow-lg w-full h-56 flex flex-col justify-center items-center hover:shadow-xl transition duration-300";

//   return (
//     <Box sx={{ display: "flex", overflow: "hidden" }}>
//       <Box sx={{ display: "flex", height: "100vh" }}>
//         <AdminSidebar />
//         <Box
//           sx={{
//             flexGrow: 1,
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//             m: 2,
//           }}
//         >
//           <Header />
//           {/* Scrollable content area */}
//           <Box sx={{ flexGrow: 1, overflowY: "auto", padding: 2 }}>
//             <Box className="grid grid-cols-3 gap-4">
//               <Card className={cardStyle}>
//                 <Typography variant="h6" className="mb-4">
//                   Employees: {totalCounts.totalEmployees}
//                 </Typography>

//                 <div className="flex items-center">
//                   {/* Pie Chart */}
//                   <PieChart width={160} height={160}>
//                     <Pie
//                       data={pieData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={0}
//                       outerRadius={70}
//                       fill="#8884d8"
//                       dataKey="value"
//                       label={({
//                         cx,
//                         cy,
//                         midAngle,
//                         innerRadius,
//                         outerRadius,
//                         value,
//                       }) => {
//                         const radius =
//                           innerRadius + (outerRadius - innerRadius) / 2;
//                         const x =
//                           cx + radius * Math.cos(-midAngle * (Math.PI / 180));
//                         const y =
//                           cy + radius * Math.sin(-midAngle * (Math.PI / 180));

//                         return (
//                           <text
//                             x={x}
//                             y={y}
//                             fill="white"
//                             textAnchor="middle"
//                             dominantBaseline="central"
//                             fontSize={16}
//                             fontWeight="bold"
//                             stroke="black"
//                             strokeWidth={0.3}
//                           >
//                             {value}
//                           </text>
//                         );
//                       }}
//                     >
//                       {pieData.map((entry, i) => (
//                         <Cell
//                           key={`cell-${i}`}
//                           fill={COLORS[i % COLORS.length]}
//                         />
//                       ))}
//                     </Pie>
//                     <RechartsTooltip />
//                   </PieChart>

//                   {/* Legend Section */}
//                   <div className="ml-4 flex flex-col">
//                     {pieData.map((entry, i) => (
//                       <div key={entry.name} className="flex items-center mb-2">
//                         <div
//                           className="w-4 h-4 rounded-full"
//                           style={{ backgroundColor: COLORS[i % COLORS.length] }}
//                         />
//                         <span className="ml-2 text-sm">{entry.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </Card>

//               <Card className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg w-full h-56">
//                 <Typography variant="h6" className="mb-4">
//                   Departments: {totalCounts.totalDepartments}
//                 </Typography>
//                 <div className="flex-1 flex items-center justify-center mt-2 -mb-12">
//                   {" "}
//                   <BarChart width={300} height={150} data={departmentCounts}>
//                     <XAxis
//                       dataKey="name"
//                       angle={-25}
//                       textAnchor="end" // Align the text
//                       interval={0} // Show all labels
//                       height={60}
//                       tick={{ fontSize: 10 }} // 👈 yeh add karo font size ke liye
//                     />
//                     <YAxis />
//                     <RechartsTooltip />
//                     <Bar dataKey="value" fill="#4CAF50" />
//                   </BarChart>
//                 </div>
//               </Card>

//               <Card className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg w-full h-56">
//                 <Typography variant="h6" className="mb-4">
//                   Locations: {totalCounts.totalLocations}
//                 </Typography>
//                 {locationCounts.length > 0 ? (
//                   <BarChart width={300} height={150} data={locationCounts}>
//                     <XAxis
//                       dataKey="name"
//                       angle={-25}
//                       textAnchor="end"
//                       interval={0} 
//                       height={60}
//                     />
//                     <YAxis />
//                     <RechartsTooltip />
//                     <Bar dataKey="value" fill="#FF9800" />
//                   </BarChart>
//                 ) : (
//                   <Typography>No Location Data Available</Typography>
//                 )}
//               </Card>
//             </Box>

//             {/* Search Section */}
//             <div className="mt-4 p-4 gap-20 flex">
//               <TextField
//                 placeholder="Search"
//                 className="w-1/4 rounded-xl border-gray-300 border p-2 h-10"
//                 value={searchText}
//                 onChange={handleSearchChange}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon className="text-gray-500" />
//                     </InputAdornment>
//                   ),
//                   sx: {
//                     borderRadius: "12px",
//                     height: "20px",
//                     padding: "0 10px",
//                     background: "white",
//                   },
//                 }}
//               />
//               <select
//                 placeholder="Department"
//                 className="ml-3 w-1/5 rounded-xl border-gray-300 border-2 bg-white h-10"
//                 value={selectedDepartment}
//                 onChange={handleDepartmentChange}
//               >
//                 <option value="" disabled>
//                   Select Department
//                 </option>
//                 {departments.map((dept) => (
//                   <option key={dept.dept_id} value={dept.dept_name}>
//                     {dept.dept_name}
//                   </option>
//                 ))}
//               </select>

//               {/* <button className="bg-blue-700 text-white border rounded-md ml-80 p-2 flex items-center space-x-2">
//                 <Link to={"/documentUpload"}>
//                   <CloudUploadOutlinedIcon />
//                   <span className="ml-2">Upload Documents</span>
//                 </Link>
//               </button> */}
//             </div>

//             {/* Employee List Section */}
//             <Box sx={{ flexGrow: 1 }}>
//               <EmployeeList employee={filteredEmployees} />
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// };
// export default DMS;