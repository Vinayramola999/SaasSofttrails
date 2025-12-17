import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const CityUserChart = () => {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   const token = sessionStorage.getItem("token"); // Get token from sessionStorage
  //   const headers = {
  //     Authorization: `Bearer ${token}`,
  //   };

  //   // Fetch locations
  //   axios
  //     .get("https://devapi.softtrails.net/saas/test/loc", { headers })
  //     .then((res) => setLocations(res.data))
  //     .catch((err) => console.error("Error fetching locations:", err));

  //   // Fetch users
  //   axios
  //     .get("https://devapi.softtrails.net/saas/test/users", { headers })
  //     .then((res) => setUsers(res.data))
  //     .catch((err) => console.error("Error fetching users:", err));
  // }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Get token from sessionStorage
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch locations
    axios
      .get("https://devapi.softtrails.net/saas/test/loc", { headers })
      .then((res) => {
        if (res.data) {
          setLocations(res.data); 
        } else {
          setLocations([]);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));

    // Fetch users
    axios
      .get("https://devapi.softtrails.net/saas/test/users", { headers })
      .then((res) => {
        if (res.data && res.data.users) {
          setUsers(res.data.users);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const getUserCountByLocality = (locality) => {
    return users.filter(
      (user) =>
        user.locality &&
        user.locality.toLowerCase() === locality.toLowerCase()
    ).length;
  };

  const localityLabels = locations.map((loc) => loc.locality);
  const cityMap = Object.fromEntries(locations.map((loc) => [loc.locality, loc.city]));
  const userCounts = localityLabels.map((locality) => getUserCountByLocality(locality));

  const chartData = {
    labels: localityLabels,
    datasets: [
      {
        label: "Users per Locality",
        data: userCounts,
        backgroundColor: "blue",
        hoverBackgroundColor: "darkblue",
        barThickness: 18,
        maxBarThickness: 20,
        categoryPercentage: 0.6,
        barPercentage: 0.8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const locality = chartData.labels[tooltipItem.dataIndex];
            const city = cityMap[locality];
            const users = tooltipItem.raw;
            return `Users: ${users}, Locality: ${locality}, City: ${city}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          display: false, // ❌ hide y-axis grid lines
        },
      },
      x: {
        grid: {
          display: false, // ❌ hide x-axis grid lines
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-blue-300 w-full h-[300px] flex flex-col items-center justify-center overflow-auto scrollbar-hide">
      <div className="flex justify-center items-center mt-4">
        <h2 className="text-lg font-semibold ">Location</h2>
      </div>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};
export default CityUserChart;