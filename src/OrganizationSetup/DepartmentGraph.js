import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const DepartmentChart = () => {
    const [departmentData, setDepartmentData] = useState([]);
    const [totalDepartments, setTotalDepartments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF5678"];

    useEffect(() => {
        const fetchDepartmentAndUsers = async () => {
            try {
                const token = sessionStorage.getItem("token"); // Get token from sessionStorage

                const deptResponse = await fetch("https://devapi.softtrails.net/saas/test/departments", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const userResponse = await fetch("https://devapi.softtrails.net/saas/test/users", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });  

                if (!deptResponse.ok || !userResponse.ok) throw new Error("Failed to fetch data");

                const departments = await deptResponse.json();
                const usersData = await userResponse.json();
                const users = usersData.users || []; // ✅ extract users array from response

                setTotalDepartments(departments.length);

                // Count users per department
                const userCounts = users.reduce((acc, user) => {
                    acc[user.dept_name] = (acc[user.dept_name] || 0) + 1;
                    return acc;
                }, {});

                // Only include departments with at least 1 user
                const formattedData = departments
                    .map((dept, index) => ({
                        name: dept.dept_name,
                        value: userCounts[dept.dept_name] || 0,
                        color: COLORS[index % COLORS.length],
                    }))
                    .filter((dept) => dept.value > 0);

                setDepartmentData(formattedData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentAndUsers();
    }, []);


    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded shadow-md text-sm">
                    <p className="font-bold">{payload[0].name}</p>
                    <p>{payload[0].value} Users</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-300 w-full h-[300px] flex flex-col items-center justify-center overflow-auto scrollbar-hide">
            {/* Header */}
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-lg font-semibold ">Departments :{totalDepartments}</h2>
            </div>

            {/* Loading & Error Messages */}
            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && (
                <div className="flex flex-col md:flex-row md:items-center justify-center">
                    {/* Pie Chart */}
                    <div className="flex justify-center">
                        <PieChart width={250} height={250} className="md:w-64 md:h-64">
                            <Pie
                                data={departmentData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {departmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </div>

                    {/* Right Section: Total & Legend */}
                    <div className="flex flex-col items-center md:items-start md:ml-8">

                        {/* Legend for Department Colors */}
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {departmentData.map((dept, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: dept.color }}
                                    ></div>
                                    <span className="text-[10px] font-medium">{dept.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DepartmentChart;