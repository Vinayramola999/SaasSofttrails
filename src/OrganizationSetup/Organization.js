import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Summary from './Summary';
import Department from './Departments';
import Location from './Location';
import Designation from './Designation';
import Domain from './Domain';
import UserCategory from './UserCategory';
import VerifyToken from '../NewComponents/VerifyToken';

const Organization = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "summary", label: "Summary" }]);
    VerifyToken("/Organization");

    const getToken = () => {
        const token = sessionStorage.getItem('token');
        return token;
    };
    const token = getToken();

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(
                        `https://devapi.softtrails.net/saas/test/users/id_user/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.data?.user) {
                        setUserData(response.data.user); // 👈 FIX: set only the nested user object
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [token, userId]);

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

                const userAccess = response.data;
                const hasSummaryAccess = userAccess.some(access => access.api_name === 'Summary');
                const hasDepartmentAccess = userAccess.some(access => access.api_name === 'Dept');
                const hasLocationAccess = userAccess.some(access => access.api_name === 'Location');
                const hasDesignationAccess = userAccess.some(access => access.api_name === 'Designation');
                const hasDomainAccess = userAccess.some(access => access.api_name === 'Domain');
                const hasUserCategoryAccess = userAccess.some(access => access.api_name === 'UserCategory');
                const accessibleTabs = [];
                if (hasSummaryAccess) accessibleTabs.push({ id: "summary", label: "Summary" });
                if (hasDepartmentAccess) accessibleTabs.push({ id: "departments", label: "Department" });
                if (hasLocationAccess) accessibleTabs.push({ id: "location", label: "Location" });
                if (hasDesignationAccess) accessibleTabs.push({ id: "designation", label: "Designation" });
                if (hasDomainAccess) accessibleTabs.push({ id: "domain", label: "Domain" });
                if (hasUserCategoryAccess) accessibleTabs.push({ id: "usercategory", label: "User Category" });
                setTabs(accessibleTabs);
                setActiveTab(accessibleTabs[0].id);
            } catch (error) {
                console.error('Error during API call: ', error);
            } finally {
                setLoading(false);
            }
        };

        checkAMSAccess();
    }, []);

    return (
        <div className='flex flex-col w-full'>
            <div className="flex flex-col w-[100%]">
                <div className="flex flex-col  gap-4">
                    <div className="flex gap-2 w-[65%] rounded-full p-1 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                            style={{ width: `calc(100% / ${tabs.length})`, left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`, }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 20,
                            }}
                        />

                        {tabs.map((tab) => (
                            <button key={tab.id} className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-black"}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-grow border-gray-300 h-screen">
                        {activeTab === "summary" && <Summary />}
                        {activeTab === "departments" && <Department />}
                        {activeTab === "location" && <Location />}
                        {activeTab === "designation" && <Designation />}
                        {activeTab === "domain" && <Domain />}
                        {activeTab === "usercategory" && <UserCategory />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Organization;