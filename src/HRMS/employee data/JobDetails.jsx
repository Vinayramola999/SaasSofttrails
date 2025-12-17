// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Container, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
// import { useParams } from 'react-router-dom';
// import { FaTasks } from 'react-icons/fa';

// const JobDetailsPortal = () => {
//   const [jobDetails, setJobDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [managerDesignation, setManagerDesignation] = useState(null);
//   const { userId } = useParams();

//    useEffect(() => {
//      const storedEmployeeId = sessionStorage.getItem("employeeeId");
//      if (storedEmployeeId) {
//        setEmployeeId(storedEmployeeId);
//      }

//    }, [userId]);

//   useEffect(() => {
//     if (employeeId) {
//       axios.get(`https://devapi.softtrails.net/hrms/test/users/id_user/${employeeId}`) 
//         .then(response => {
//           const jobData = response.data;
//           setJobDetails(jobData);
//           setLoading(false);

//           // Fetch manager designation
//           if (jobData?.manager_id) {
//             axios.get(`https://devapi.softtrails.net/hrms/test/users`)
//               .then(managerResponse => {
//                 const manager = managerResponse.data.find(user => user.user_id === jobData.manager_id);
//                 if (manager) {
//                   setManagerDesignation(`${manager.first_name} ${manager.last_name}`);
//                 } else {
//                   setManagerDesignation('Not available');
//                 }
//               })
//               .catch(error => {
//                 console.error('Error fetching manager data:', error);
//                 setManagerDesignation('Not available');
//               });
//           }
//         })
//         .catch(error => {
//           console.error('Error fetching job details:', error);
//           setLoading(false);
//         });
//     }
//   }, [employeeId]);

//   if (loading) {
//     return <CircularProgress />;
//   }

//   if (!jobDetails) {
//     return <Typography variant="h7">Job details not available.</Typography>;
//   }

//   return (
//     <Container>
//       <Typography variant="h5" gutterBottom>
//         <div className="flex items-center gap-2">
//           <FaTasks />
//           <span>Job Details</span>
//         </div>
//       </Typography>

//       <Card>
//         <CardContent>
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Job Title:</Typography>
//               <Typography>{jobDetails.designation || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Department:</Typography>
//               <Typography>{jobDetails.dept_name || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Joining Date:</Typography>
//               <Typography>{jobDetails.joining_date ? jobDetails.joining_date.split('T')[0] : 'Not available'}</Typography>
//               </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Manager:</Typography>
//               <Typography>{managerDesignation || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Location:</Typography>
//               <Typography>{jobDetails.locality || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Job Band/Grade:</Typography>
//               <Typography>{jobDetails.band || 'Hierarchical level of the job.'}</Typography>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// };
// export default JobDetailsPortal;


///////////////////////////////////////////////////////////////////////
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   CircularProgress
// } from '@mui/material';
// import { FaTasks } from 'react-icons/fa';

// const JobDetailsPortal = () => {
//   const [jobDetails, setJobDetails] = useState({}); // Initialize as empty object
//   const [loading, setLoading] = useState(true);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [managerDesignation, setManagerDesignation] = useState('Not available');

//   useEffect(() => {
//     const storedEmployeeId = sessionStorage.getItem("userId");
//     if (storedEmployeeId) {
//       setEmployeeId(storedEmployeeId);
//     } else {
//       setLoading(false); // Stop loading even if no ID found
//     }
//   }, []);

//   useEffect(() => {
//   if (employeeId) {
//     const token = sessionStorage.getItem("token");

//     const fetchJobDetails = async () => {
//       try {
//         // Fetch job details
//         const response = await axios.get(
//           `https://devapi.softtrails.net/hrms/test/users/id_user/${employeeId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const jobData = response.data.user;
//         setJobDetails(jobData);
//         setLoading(false);
//         if (jobData?.manager_id) {
//           try {
//             const managerResponse = await axios.get("https://devapi.softtrails.net/hrms/test/users", {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             });

//             const manager = managerResponse.data.find(
//               (user) => user.user_id === jobData.manager_id
//             );

//             if (manager) {
//               setManagerDesignation(`${manager.first_name} ${manager.last_name}`);
//             } else {
//               setManagerDesignation("Not available");
//             }
//           } catch (err) {
//             console.error("Error fetching manager details:", err);
//             setManagerDesignation("Not available");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching job details:", error);
//         setLoading(false);
//       }
//     };

//     fetchJobDetails();
//   }
// }, [employeeId]);


//   if (loading) {
//     return <CircularProgress />;
//   }

//   return (
//     <Container>
//       <Typography variant="h5" gutterBottom>
//         <div className="flex items-center gap-2">
//           <FaTasks />
//           <span>Job Details</span>
//         </div>
//       </Typography>

//       <Card>
//         <CardContent>
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Job Title:</Typography>
//               <Typography>{jobDetails.designation || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Department:</Typography>
//               <Typography>{jobDetails.dept_name || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Joining Date:</Typography>
//               <Typography>
//                 {jobDetails.joining_date
//                   ? jobDetails.joining_date.split('T')[0]
//                   : 'Not available'}
//               </Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Manager:</Typography>
//               <Typography>{managerDesignation}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Location:</Typography>
//               <Typography>{jobDetails.locality || 'Not available'}</Typography>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h7">Job Band/Grade:</Typography>
//               <Typography>{jobDetails.band || 'Not available'}</Typography>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>
//     </Container>
//   );
// };
// export default JobDetailsPortal;



import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import { FaTasks } from "react-icons/fa";
import axios from "axios";

const JobDetailsPortal = () => {
  const [jobDetails, setJobDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [managerName, setManagerName] = useState("Not available");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");
    if (!userId || !token) {
      console.error("❌ Missing userId or token");
      setLoading(false);
      return;
    }
    axios
      .get(`https://devapi.softtrails.net/saas/test/users/id_user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const jobData = response.data.user;
        setJobDetails(jobData);
        setManagerName(jobData?.manager_name || "Not available");
      })
      .catch((error) => {
        console.error("❌ Error fetching job details:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
  }

  // Capitalize first letter for status
  const formatStatus = (status) => {
    if (!status) return "Not available";
    const formatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const color =
      formatted.toLowerCase() === "active"
        ? "text-green-600"
        : formatted.toLowerCase() === "inactive"
        ? "text-red-600"
        : "text-gray-700";
    return <span className={`font-semibold ${color}`}>{formatted}</span>;
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        <div className="flex items-center gap-2 text-gray-800">
          <FaTasks />
          <span>Job Details</span>
        </div>
      </Typography>

      <Card className="shadow-md rounded-xl">
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employee ID:</Typography>
              <Typography>{jobDetails.emp_id || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employee Name:</Typography>
              <Typography>
                {jobDetails.first_name || ""} {jobDetails.last_name || ""}
              </Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Job Title:</Typography>
              <Typography>{jobDetails.designation || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Department:</Typography>
              <Typography>{jobDetails.dept_name || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Sub Department:</Typography>
              <Typography>{jobDetails.sub_dept_name || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Manager:</Typography>
              <Typography>{managerName}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Location:</Typography>
              <Typography>{jobDetails.locality || "Not available"}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Employment Status:</Typography>
              <Typography>{formatStatus(jobDetails.user_status)}</Typography>
            </div>

            <div className="flex flex-col min-w-[250px]">
              <Typography variant="subtitle2">Profile Created At:</Typography>
              <Typography>
                {jobDetails.user_created_at
                  ? new Date(jobDetails.user_created_at).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "Not available"}
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JobDetailsPortal;