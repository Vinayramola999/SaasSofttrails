import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from 'axios';

const OtpVerificationPopup = ({ email, onClose }) => {
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOtp = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const to = sessionStorage.getItem('schema_name');
      const response = await axios.post('https://devapi.softtrails.net/saas/test/otp/verify-otp',
        { email, otp, to },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.data.message === "OTP verified. You can now reset your password.") {
        setOtpVerified(true);
        setError('');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const to = sessionStorage.getItem('schema_name');
      await axios.post('https://devapi.softtrails.net/saas/test/otp/request-otp',
        { email, to },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setTimer(30);
      setCanResend(false);
      setError('');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP.');
    }
  };

  // const handleResetPassword = async () => {
  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match.');
  //     return;
  //   }
  //   try {
  //     const token = sessionStorage.getItem('token');
  //     await axios.post('https://devapi.softtrails.net/saas/test/otp/reset-password',
  //       { email, password, confirmPassword },
  //       {
  //         headers: { 'Authorization': `Bearer ${token}` }
  //       }
  //     );
  //     alert('Password reset successfully. You can now log in.');
  //     onClose();
  //     window.location.href = '/';
  //   } catch (err) {
  //     console.error('Error resetting password:', err);
  //     setError('Failed to reset password.');
  //   }
  // };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      Swal.fire({
        icon: "warning",
        title: "Mismatch",
        text: "Passwords do not match!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const to = sessionStorage.getItem("schema_name");
      await axios.post(
        "https://devapi.softtrails.net/saas/test/otp/reset-password",
        { email, password, confirmPassword ,to},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: "Password reset successfully. You can now log in.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        onClose();
        window.location.href = "/";
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reset password. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const validatePassword = (pwd) => /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(pwd);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setErrors("Password must be at least 8 characters long, contain an uppercase letter and a number.");
    } else {
      setErrors('');
    }
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
        {otpVerified ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Reset Your Password</h3>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter new password"
              />
              <span
                onClick={toggleShowPassword}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}
            </div>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Confirm new password"
              />
              <span
                onClick={toggleShowPassword}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm">Passwords do not match.</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!password || !confirmPassword || password !== confirmPassword || errors}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Reset Password
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">Enter OTP</h3>
            <p className="mb-4">An OTP has been sent to your email.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded-lg mb-2"
              placeholder="Enter OTP"
            />
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleResendOtp}
                disabled={!canResend}
                className={`py-2 px-4 rounded ${canResend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} text-white`}
              >
                {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Verify OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationPopup;
