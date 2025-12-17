// import React from 'react';
// import axios from 'axios';

// const PasswordResetPopup = ({ email, onClose, onOtpSent }) => {
  
//   const handleSendOtp = async () => {
//     try {
//       const token = sessionStorage.getItem('token');
//       await axios.post('https://devapi.softtrails.net/saas/test/otp/request-otp',
//         { email },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           }
//         }
//       );
//       onOtpSent();
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       alert('Failed to send OTP.');
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//       <div className="bg-white p-8 rounded-md shadow-lg">
//         <h3 className="text-2xl font-bold mb-4">Password Reset Required</h3>
//         <p className="mb-4">You are logging in for the first time.<br /> We have sent a one-time password (OTP) to your registered email address.</p>
//         <input type="text" value={email} disabled className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700" />
//         <div className="flex justify-end mt-4">
//           <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"> Cancel</button>
//           <button onClick={handleSendOtp} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Send OTP</button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default PasswordResetPopup;

import React, { useState } from 'react';
import axios from 'axios';

const PasswordResetPopup = ({ email, onClose, onOtpSent ,to}) => {
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setLoading(true); // Start loading
      const token = sessionStorage.getItem('token');
      const to = sessionStorage.getItem('schema_name');
      await axios.post(
        'https://devapi.softtrails.net/saas/test/otp/request-otp',
        { email ,to},
        
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      onOtpSent();
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Failed to send OTP.');
    } finally {
      setLoading(false); // Stop loading (whether success or error)
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Password Reset Required</h3>
        <p className="mb-4">
          You are logging in for the first time.
          <br /> We have sent a one-time password (OTP) to your registered email address.
        </p>
        <input
          type="text"
          value={email}
          disabled
          className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSendOtp}
            className={`${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-2 px-4 rounded`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPopup;