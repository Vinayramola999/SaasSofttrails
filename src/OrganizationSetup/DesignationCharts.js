import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
const COLORS = ["#FFA07A", "#4682B4", "#32CD32", "#FF4500", "#8A2BE2", "#20B2AA"];

const DashboardCharts = () => {
    const [designationData, setDesignationData] = useState([]);
    const [totalDesignations, setTotalDesignations] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token"); // Get token from sessionStorage

                const [designationRes, usersRes] = await Promise.all([
                    fetch("https://devapi.softtrails.net/saas/test/designation", {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    fetch("https://devapi.softtrails.net/saas/test/users", {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                if (!designationRes.ok || !usersRes.ok) throw new Error("Failed to fetch data");

                const designations = await designationRes.json();
                const usersData = await usersRes.json();

                const users = usersData.users || []; // ✅ use the correct field

                setTotalDesignations(designations.length);

                // Count users per designation
                const designationCounts = {};
                users.forEach((user) => {
                    const designation = user.designation || "Unknown";
                    designationCounts[designation] = (designationCounts[designation] || 0) + 1;
                });

                // Map designations with user count and filter where value > 0
                const formattedData = designations
                    .map((desig, index) => ({
                        name: desig.designation,
                        value: designationCounts[desig.designation] || 0,
                        color: COLORS[index % COLORS.length],
                    }))
                    .filter((item) => item.value > 0); // Filter designations with 0 users

                setDesignationData(formattedData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 rounded shadow-md text-sm">
                    <p className="font-bold">{payload[0].name}</p>
                    <p>{payload[0].value} User(s)</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-300 w-full h-[300px] flex flex-col items-center justify-center overflow-auto scrollbar-hide">
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-lg font-semibold">Designation :{totalDesignations}</h2>
            </div>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {!loading && !error && (
                <div className="flex flex-col md:flex-row md:items-center justify-center">
                    <div className="flex justify-center">
                        <PieChart width={250} height={250}>
                            <Pie
                                data={designationData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {designationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </div>

                    <div className="flex flex-col items-center md:items-start md:ml-8">

                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                            {designationData.map((desig, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: desig.color }}></div>
                                    <span className="text-[10px] font-medium">{desig.name} ({desig.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DashboardCharts;