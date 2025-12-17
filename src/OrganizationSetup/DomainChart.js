import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';

Chart.register(ArcElement, Tooltip);

const DomainChart = () => {
    const [domains, setDomains] = useState([]);
    const [users, setUsers] = useState([]);
    const [userCounts, setUserCounts] = useState([]);

    useEffect(() => {
        const token = sessionStorage.getItem("token"); 

        // Fetch domains
        axios
            .get("https://devapi.softtrails.net/saas/test/domain", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setDomains(res.data);
            })
            .catch((error) => {
                console.error("Error fetching domains:", error);
            });

        // Fetch users
        axios
            .get("https://devapi.softtrails.net/saas/test/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                if (res.data && res.data.users) {
                    setUsers(res.data.users); // ✅ Correct field
                } else {
                    setUsers([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setUsers([]); // fallback to empty array
            });
    }, []);

    useEffect(() => {
        // Count users per domain
        const counts = domains.map((domain) => {
            const domainName = domain.domain_name.toLowerCase();
            const count = users.filter((user) =>
                user.email.toLowerCase().includes(domainName)
            ).length;
            return count;
        });

        setUserCounts(counts);
    }, [domains, users]);

    const chartData = {
        labels: domains.map((d) => d.domain_name),
        datasets: [
            {
                label: 'Users',
                data: userCounts,
                backgroundColor: ['#3dd9c0', '#f47e60', '#a166ff', '#7e77f9'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        cutout: '80%',
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.formattedValue} USERS`;
                    },
                },
            },
        },
    };
    return (
        // <div className="w-70 h-80 relative mx-auto shadow-md rounded-xl p-2 bg-white border border-blue-300 w-full max-w-4xl">
        //   <div className="text-center font-semibold mb-2">Domain</div>
        //   <Doughnut data={chartData} options={chartOptions} />
        //   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        //     <p className="text-xl font-bold">{domains.length.toString().padStart(2, '0')}</p>
        //     <p className="text-xs text-gray-500">DOMAINS</p>
        //   </div>
        // </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-300 w-full h-[300px] flex flex-col items-center justify-center overflow-auto scrollbar-hide">
            {/* <div className="text-center font-semibold mb-2">Domain</div> */}
            <div className="flex justify-center items-center mb-4">
                <h2 className="text-lg font-semibold ">Domain</h2>
            </div>

            {/* Centered Chart with Overlayed Text */}
            <div className="relative flex items-center justify-center h-56">
                <Doughnut data={chartData} options={chartOptions} />

                {/* Center Text Over Doughnut */}
                <div className="absolute flex flex-col items-center justify-center">
                    <p className="text-xl font-bold">{domains.length.toString().padStart(2, '0')}</p>
                    <p className="text-xs text-gray-500">DOMAINS</p>
                </div>
            </div>
        </div>
    );
};
export default DomainChart;