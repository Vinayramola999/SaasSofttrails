//  LOGIN WITH CODE AND Schema  ///
// import React, { useState } from 'react';
// import axios from 'axios';
// import logo from '../assests/SoftTrails.png';
// import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
// import login from '../assests/login.jpg';
// import PasswordResetPopup from '../Components/PasswordResetPopup';
// import OtpVerificationPopup from '../Components/OtpVerificationPopup';
// import ForgotPasswordPopup from '../Components/ForgotPasswordPopup1';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [code, setCode] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
//   const [showOtpVerificationPopup, setShowOtpVerificationPopup] = useState(false);
//   const [showOtpVerificationPopup1, setShowOtpVerificationPopup1] = useState(false);
//   const [showForgotPasswordPopup, setForgotPasswordPopup] = useState(false);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const navigate = useNavigate();

//   // Verify email & company code
//  const handleEmailVerify = async (e) => {
//   e.preventDefault();
//   if (loading) return;
//   setLoading(true);

//   try {
//     const response = await axios.post(
//       'https://globalparameters.softtrails.net/saas/test/users/mail-verify',
//       { email: email.toLowerCase(), code }
//     );

//     if (response.status === 403) {
//       if (response.data?.schema_name) {
//         sessionStorage.setItem('schema_name', response.data.schema_name);
//       }
//       setShowPasswordResetPopup(true);
//     } else {
//       const { message, schema_name } = response.data;

//       if (message === 'User found. You can proceed to login.') {
//         if (schema_name) {
//           sessionStorage.setItem('schema_name', schema_name);
//         }
//         setIsEmailVerified(true);
//         setSuccess('Email verified! Please enter your password.');
//         setError('');
//       } else if (message === 'OTP sent to email') {
//         setSuccess('OTP sent. Please check your email.');
//         setError('');
//       } else {
//         setError('Invalid email or company code.');
//         setSuccess('');
//       }
//     }
//   } catch (err) {
//     if (err.response && err.response.status === 403) {
//       if (err.response.data?.schema_name) {
//         sessionStorage.setItem('schema_name', err.response.data.schema_name);
//       }
//       setShowPasswordResetPopup(true);
//     } else {
//       setError('Verification failed. Please check your email and company code.');
//     }
//     setSuccess('');
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     setLoading(true);

//     try {
//       const schema_name = sessionStorage.getItem('schema_name');
//       const response = await axios.post(
//         'https://globalparameters.softtrails.net/saas/test/users/login',
//         {
//           email: email.toLowerCase(),
//           password,
//           schema_name,
//           code,
//         }
//       );

//       const { token, userId } = response.data;
//       if (token && userId) {
//         sessionStorage.setItem('token', token);
//         sessionStorage.setItem('userId', userId);
//         sessionStorage.setItem('companyCode', code);

//         setSuccess('Login successful!');
//         setError('');
//         setTimeout(() => navigate('/Cards'), 1000);
//       } else {
//         throw new Error('Token or User ID not received');
//       }
//     } catch (err) {
//       setError('Invalid email or password.');
//       setSuccess('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   const handleOtpSent = () => {
//     setForgotPasswordPopup(false);
//     setShowOtpVerificationPopup1(true);
//   };

//   const handleOtpSent1 = () => {
//     setForgotPasswordPopup(false);
//     setShowOtpVerificationPopup1(true);
//   };

//   return (
//     <div className="h-screen flex flex-col md:flex-row bg-white">
//       {/* Left Section */}
//       <div className="hidden md:flex w-1/2 justify-center items-center bg-gray-50">
//         <img src={login} alt="Login Illustration" className="object-cover h-full w-full" />
//       </div>

//       {/* Right Section */}
//       <div className="relative w-full md:w-1/2 bg-white flex flex-col min-h-screen p-6">
//         {/* Logo */}
//         <div className="absolute top-4 right-4">
//           <img src={logo} alt="Higher India Logo" className="h-6 md:h-6" />
//         </div>

//         {/* Content */}
//         <div className="flex-grow w-full flex flex-col items-center">
//           <div className="p-8 rounded-lg w-full max-w-md mt-6 md:mt-12">
//             {/* Title */}
//             <div className="text-center mb-6">
//               <h3 className="text-lg md:text-xl font-semibold mt-2">
//                 Login with your account
//               </h3>
//               <p className="text-gray-600 text-sm">Provide your registered email</p>
//             </div>

//             {/* Form */}
//             <form onSubmit={isEmailVerified ? handleLogin : handleEmailVerify}>
//               {/* Email */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
//                 <div className="relative">
//                   <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaEnvelope className="text-black" />
//                   </span>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required
//                     disabled={isEmailVerified}
//                     className={`w-full py-3 pl-10 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
//                       isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''
//                     }`}
//                     placeholder="Enter Email"
//                   />
//                 </div>
//               </div>

//               {/* Company Code */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 text-sm font-bold mb-2">Company Code</label>
//                 <input
//                   type="text"
//                   value={code}
//                   onChange={(e) => setCode(e.target.value)}
//                   required
//                   disabled={isEmailVerified}
//                   className={`w-full py-3 px-4 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
//                     isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''
//                   }`}
//                   placeholder="Enter Company Code"
//                 />
//               </div>

//               {/* Password */}
//               {isEmailVerified && (
//                 <>
//                   <div className="mb-2 relative">
//                     <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
//                       Password
//                     </label>
//                     <span className="absolute inset-y-0 left-0 pl-3 mt-7 flex items-center pointer-events-none">
//                       <FaKey className="text-black" />
//                     </span>
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       id="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//                       placeholder="Enter Password"
//                     />
//                     <span
//                       className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
//                       onClick={togglePasswordVisibility}
//                     >
//                       {showPassword ? <FaEye /> : <FaEyeSlash />}
//                     </span>
//                   </div>
//                   <p className="text-sm text-blue-600 mb-3">
//                     <button type="button" onClick={() => setForgotPasswordPopup(true)}>
//                       Forgot Password?
//                     </button>
//                   </p>
//                 </>
//               )}

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 className="w-full py-3 bg-custome-blue text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//               >
//                 {isEmailVerified ? 'Login' : 'Verify Email'}
//               </button>

//               {/* Errors & Success */}
//               {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
//               {success && <div className="mt-4 text-green-500 text-sm">{success}</div>}
//             </form>

//             {/* Popups */}
//             {showForgotPasswordPopup && (
//               <ForgotPasswordPopup
//                 email={email}
//                 onOtpSent={handleOtpSent1}
//                 onClose={() => setForgotPasswordPopup(false)}
//               />
//             )}
//             {showPasswordResetPopup && (
//               <PasswordResetPopup
//                 email={email}
//                 onOtpSent={handleOtpSent}
//                 onClose={() => setShowPasswordResetPopup(false)}
//               />
//             )}
//             {showOtpVerificationPopup && (
//               <OtpVerificationPopup
//                 email={email}
//                 onClose={() => setShowOtpVerificationPopup(false)}
//               />
//             )}
//             {showOtpVerificationPopup1 && (
//               <OtpVerificationPopup
//                 email={email}
//                 onClose={() => setShowOtpVerificationPopup1(false)}
//               />
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center text-xs text-gray-500 mb-4">
//           SoftTrail is a product of HigherIndia Pvt. Ltd. <br />
//           An ISO 9001:2015 | ISO 27001:2022 | CMMI Level 5 Company
//         </div>
//       </div>
//     </div>
//   );
// };
// export default Login;

///////////// Company Code URL LOGIN /////////////
import React, { useState } from 'react';
import axios from 'axios';
import logo from '../assests/SoftTrails.png';
import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import login from '../assests/login.jpg';
import PasswordResetPopup from '../Components/PasswordResetPopup';
import OtpVerificationPopup from '../Components/OtpVerificationPopup';
import ForgotPasswordPopup from '../Components/ForgotPasswordPopup1';

const Login = () => {
  const { ccode } = useParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(ccode || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
  const [showOtpVerificationPopup, setShowOtpVerificationPopup] = useState(false);
  const [showOtpVerificationPopup1, setShowOtpVerificationPopup1] = useState(false);
  const [showForgotPasswordPopup, setForgotPasswordPopup] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  console.log("Company Code from URL:", ccode);

  // Verify email & company code
  const handleEmailVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.post('https://globalparameters.softtrails.net/users/mail-verify',
        { email: email.toLowerCase(), code }
      );

      if (response.status === 403) {
        if (response.data?.schema_name) {
          sessionStorage.setItem('schema_name', response.data.schema_name);
        }
        setShowPasswordResetPopup(true);
      } else {
        const { message, schema_name } = response.data;

        if (message === 'User found. You can proceed to login.') {
          if (schema_name) {
            sessionStorage.setItem('schema_name', schema_name);
          }
          setIsEmailVerified(true);
          setSuccess('Email verified! Please enter your password.');
          setError('');
        } else if (message === 'OTP sent to email') {
          setSuccess('OTP sent. Please check your email.');
          setError('');
        } else {
          setError('Invalid email or company code.');
          setSuccess('');
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        if (err.response.data?.schema_name) {
          sessionStorage.setItem('schema_name', err.response.data.schema_name);
        }
        setShowPasswordResetPopup(true);
      } else {
        setError('Verification failed. Please check your email and company code.');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const schema_name = sessionStorage.getItem('schema_name');
      const response = await axios.post(
        'https://globalparameters.softtrails.net/users/login',
        {
          email: email.toLowerCase(),
          password,
          schema_name,
          code,
        }
      );

      const { token, userId } = response.data;
      if (token && userId) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('companyCode', code);

        setSuccess('Login successful!');
        setError('');
        setTimeout(() => navigate('/Cards'), 1000);
      } else {
        throw new Error('Token or User ID not received');
      }
    } catch (err) {
      setError('Invalid email or password.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleOtpSent = () => {
    setForgotPasswordPopup(false);
    setShowOtpVerificationPopup1(true);
  };

  const handleOtpSent1 = () => {
    setForgotPasswordPopup(false);
    setShowOtpVerificationPopup1(true);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 justify-center items-center bg-gray-50">
        <img src={login} alt="Login Illustration" className="object-cover h-full w-full" />
      </div>

      {/* Right Section */}
      <div className="relative w-full md:w-1/2 bg-white flex flex-col min-h-screen p-6">
        {/* Logo */}
        <div className="absolute top-4 right-4">
          <img src={logo} alt="Higher India Logo" className="h-6 md:h-6" />
        </div>

        {/* Content */}
        <div className="flex-grow w-full flex flex-col items-center">
          <div className="p-8 rounded-lg w-full max-w-md mt-6 md:mt-12">
            {/* Title */}
            <div className="text-center mb-6">
              <h3 className="text-lg md:text-xl font-semibold mt-2">
                Login with your account
              </h3>
              <p className="text-gray-600 text-sm">Provide your registered email</p>
            </div>

            {/* Form */}
            <form onSubmit={isEmailVerified ? handleLogin : handleEmailVerify}>
              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-black" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isEmailVerified}
                    className={`w-full py-3 pl-10 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    placeholder="Enter Email"
                  />
                </div>
              </div>

              {/* Company Code */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Company Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isEmailVerified || ccode}
                  className={`w-full py-3 px-4 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  placeholder="Enter Company Code"
                />
              </div>

              {/* Password */}
              {isEmailVerified && (
                <>
                  <div className="mb-2 relative">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <span className="absolute inset-y-0 left-0 pl-3 mt-7 flex items-center pointer-events-none">
                      <FaKey className="text-black" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter Password"
                    />
                    <span
                      className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mb-3">
                    <button type="button" onClick={() => setForgotPasswordPopup(true)}>
                      Forgot Password?
                    </button>
                  </p>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-custome-blue text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {isEmailVerified ? 'Login' : 'Verify Email'}
              </button>

              {/* Errors & Success */}
              {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
              {success && <div className="mt-4 text-green-500 text-sm">{success}</div>}
            </form>

            {/* Popups */}
            {showForgotPasswordPopup && (
              <ForgotPasswordPopup
                email={email}
                onOtpSent={handleOtpSent1}
                onClose={() => setForgotPasswordPopup(false)}
              />
            )}
            {showPasswordResetPopup && (
              <PasswordResetPopup
                email={email}
                onOtpSent={handleOtpSent}
                onClose={() => setShowPasswordResetPopup(false)}
              />
            )}
            {showOtpVerificationPopup && (
              <OtpVerificationPopup
                email={email}
                onClose={() => setShowOtpVerificationPopup(false)}
              />
            )}
            {showOtpVerificationPopup1 && (
              <OtpVerificationPopup
                email={email}
                onClose={() => setShowOtpVerificationPopup1(false)}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mb-4">
          SoftTrail is a product of HigherIndia Pvt. Ltd. <br />
          An ISO 9001:2015 | ISO 27001:2022 | CMMI Level 5 Company
        </div>
      </div>
    </div>
  );
};
export default Login;