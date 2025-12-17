import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostJob from './PostJob';
import TalentDatabase from './TalentDatabase';
import FlagData from './FlagApplicant';

const RecruitmentTab = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("TalentDatabase");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "TalentDatabase", label: "Talent Database" }]);

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
                    const response = await axios.get(`https://devapi.softtrails.net/saas/test/users/id_user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.data.user) {
                        const user = response.data.user;
                        setUserData(user);
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
                const hasTalentAccess = userAccess.some(access => access.api_name === 'TalentDatabase');
                const hasUploadAccess = userAccess.some(access => access.api_name === 'FlagData');
                const hasPostJobAccess = userAccess.some(access => access.api_name === 'PostJob');
                const accessibleTabs = [];
                if (hasPostJobAccess) accessibleTabs.push({ id: "PostJob", label: "Post Job" });
                if (hasTalentAccess) accessibleTabs.push({ id: "TalentDatabase", label: "Talent Database" });
                if (hasUploadAccess) accessibleTabs.push({ id: "FlagData", label: "Flagged Applicant" });
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
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                            style={{
                                width: `calc(100% / ${tabs.length})`,
                                left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 20,
                            }}
                        />
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-gray-700"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow h-screen">
                        {activeTab === "PostJob" && <PostJob />}
                        {activeTab === "TalentDatabase" && <TalentDatabase />}
                        {activeTab === "FlagData" && <FlagData />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RecruitmentTab;