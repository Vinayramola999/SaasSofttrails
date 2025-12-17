import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import EmployeeList from "./EmployeeList";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63"];

export default function DMS() {
  const [employeeData, setEmployeeData] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState([]);
  const [locationCounts, setLocationCounts] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [totalCounts, setTotalCounts] = useState({
    totalEmployees: 0,
    inactiveEmployees: 0,
    totalDepartments: 0,
    totalLocations: 0,
    maleEmployees: 0,
    femaleEmployees: 0,
  });
  const [activeDeptIndex, setActiveDeptIndex] = useState(null);
  const [activeLocationIndex, setActiveLocationIndex] = useState(null);

  const CustomDeptLabel = ({ x, y, width, index, activeIndex, details }) => {
    if (index !== activeIndex || !details) return null;
    const keys = Object.keys(details);
    const lineHeight = 14;
    const totalHeight = keys.length * lineHeight;
    const labelYStart = y - totalHeight - 5;
    const adjustedY = labelYStart < 0 ? y + 15 : y - 10;

    return (
      <>
        {keys.map((key, i) => (
          <text
            key={i}
            x={x + width / 2}
            y={adjustedY + i * lineHeight}
            fill="#333"
            textAnchor="middle"
            fontSize={12}
          >
            {`${key} (${details[key]})`}
          </text>
        ))}
      </>
    );
  };

  const CustomLocationLabel = ({
    x,
    y,
    width,
    index,
    activeIndex,
    details,
  }) => {
    if (index !== activeIndex || !details) return null;
    const keys = Object.keys(details);
    const lineHeight = 14;
    const totalHeight = keys.length * lineHeight;
    const renderAbove = y - totalHeight > 20;
    const startY = renderAbove ? y - 10 - (keys.length - 1) * lineHeight : y + 15;

    return (
      <>
        {keys.map((key, i) => (
          <text
            key={i}
            x={x + width / 2}
            y={startY + i * lineHeight}
            fill="#333"
            textAnchor="middle"
            fontSize={12}
          >
            {`${key} (${details[key]})`}
          </text>
        ))}
      </>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const userRes = await axios.get(
          "https://devapi.softtrails.net/saas/test/users/flagged-catgeory-users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const deptRes = await axios.get("https://devapi.softtrails.net/saas/test/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const users = userRes.data.users || [];
        const depts = deptRes.data || [];

        setEmployeeData(users);
        setFilteredEmployees(users);
        setDepartments(depts);

        const totalEmployees = users.length;
        const inactiveEmployees = users.filter(
          (u) => u.user_status === "inactive"
        ).length;
        const maleEmployees = users.filter((u) => u.gender === "Male").length;
        const femaleEmployees = totalEmployees - maleEmployees;

        const deptCounts = depts.map((d) => {
          const usersInDept = users.filter((u) => u.dept_name === d.dept_name);
          const subDeptMap = usersInDept.reduce((acc, u) => {
            const sub = u.sub_dept_name || "N/A";
            acc[sub] = (acc[sub] || 0) + 1;
            return acc;
          }, {});
          return {
            name: d.dept_name,
            value: usersInDept.length,
            details: subDeptMap,
          };
        });

        const uniqueLocalities = [
          ...new Set(users.map((u) => u.locality || "Unknown")),
        ];
        const locCounts = users.reduce((acc, u) => {
          const loc = u.locality || "Unknown";
          const subLoc = u.sub_dept_name || "N/A";
          const existing = acc.find((item) => item.name === loc);
          if (existing) {
            existing.value += 1;
            existing.details[subLoc] = (existing.details[subLoc] || 0) + 1;
          } else {
            acc.push({
              name: loc,
              value: 1,
              details: { [subLoc]: 1 },
            });
          }
          return acc;
        }, []);

        setTotalCounts({
          totalEmployees,
          inactiveEmployees,
          totalDepartments: depts.length,
          totalLocations: uniqueLocalities.length,
          maleEmployees,
          femaleEmployees,
        });
        setDepartmentCounts(deptCounts);
        setLocationCounts(locCounts);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const filterEmployees = (search, department) => {
    let filtered = [...employeeData];
    if (search) {
      const terms = search.toLowerCase().split(" ");
      filtered = filtered.filter((emp) =>
        terms.every(
          (t) =>
            emp.first_name?.toLowerCase().includes(t) ||
            emp.last_name?.toLowerCase().includes(t) ||
            emp.user_id?.toString().includes(t) ||
            emp.dept_name?.toLowerCase().includes(t) ||
            emp.email?.toLowerCase().includes(t) ||
            emp.user_status?.toLowerCase().includes(t) ||
            emp.phone_no?.toLowerCase().includes(t)
        )
      );
    }
    if (department) {
      filtered = filtered.filter((emp) => emp.dept_name === department);
    }
    setFilteredEmployees(filtered);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    filterEmployees(val, selectedDepartment);
  };

  const handleDepartmentChange = (e) => {
    const val = e.target.value;
    setSelectedDepartment(val);
    filterEmployees(searchText, val);
  };

  const pieData = [
    { name: "Male", value: totalCounts.maleEmployees },
    { name: "Female", value: totalCounts.femaleEmployees },
  ];

  const cardStyle =
    "p-4 bg-white rounded-xl border border-gray-300 shadow-lg w-full min-h-[250px] flex flex-col";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Cards Section */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* Employees */}
          <Card className={cardStyle}>
            <Typography variant="h6" className="mb-2 text-center sm:text-left">
              Employees: {totalCounts.totalEmployees}
            </Typography>
            <div className="flex flex-col sm:flex-row items-center justify-center flex-1">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      outerRadius="70%"
                      label
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="ml-2 text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Departments */}
          <Card className={cardStyle}>
            <Typography variant="h6" className="mb-2 text-center sm:text-left">
              Departments: {totalCounts.totalDepartments}
            </Typography>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={departmentCounts}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis />
                  <Bar
                    dataKey="value"
                    fill="#4CAF50"
                    onMouseEnter={(_, i) => setActiveDeptIndex(i)}
                    onMouseLeave={() => setActiveDeptIndex(null)}
                  >
                    <LabelList
                      content={(props) => (
                        <CustomDeptLabel
                          {...props}
                          activeIndex={activeDeptIndex}
                          details={departmentCounts[props.index]?.details}
                        />
                      )}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Locations */}
          <Card className={cardStyle}>
            <Typography variant="h6" className="mb-2 text-center sm:text-left">
              Locations: {totalCounts.totalLocations}
            </Typography>
            <div className="flex-1">
              {locationCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={locationCounts}
                    onMouseLeave={() => setActiveLocationIndex(null)}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis />
                    <Bar
                      dataKey="value"
                      fill="#FF9800"
                      onMouseEnter={(_, i) => setActiveLocationIndex(i)}
                    >
                      <LabelList
                        content={(props) => (
                          <CustomLocationLabel
                            {...props}
                            activeIndex={activeLocationIndex}
                            details={locationCounts[props.index]?.details}
                          />
                        )}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography align="center">No Location Data</Typography>
              )}
            </div>
          </Card>
        </Box>

        {/* Search and Upload Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-6">
          <TextField
            placeholder="Search"
            value={searchText}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-500" fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                height: "32px",
                borderRadius: "9999px", 
                backgroundColor: "#fff",
                fontSize: "0.8rem",
                paddingRight: "6px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d1d5db", 
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9ca3af", 
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#3b82f6", 
                },
              },
            }}
            className="w-40 sm:w-48 md:w-56 transition-all duration-200"
          />

          <select
            className="border border-gray-300 rounded-xl bg-white px-2 py-2 sm:w-1/4"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.dept_id} value={d.dept_name}>
                {d.dept_name}
              </option>
            ))}
          </select>

          {/* <Link
            to="/documentUpload"
            className="sm:ml-auto flex items-center justify-center bg-blue-700 text-white rounded-md p-2"
          >
            <CloudUploadOutlinedIcon />
            <span className="ml-2">Upload Documents</span>
          </Link> */}
        </div>

        {/* Employee List */}
        <div className="mt-6">
          <EmployeeList employee={filteredEmployees} />
        </div>
      </Box>
    </Box>
  );
}
