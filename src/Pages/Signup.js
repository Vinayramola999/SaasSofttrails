import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    validateFirstName,
    validateLastName,
    validatePhone,
    validateEmail,
    validateRole
} from '../Components/validate';

const Register = () => {
    const [formErrors, setFormErrors] = useState({
        first_name: null,
        last_name: null,
        phone_no: null,
        email: null,
        dept_id: null,
        location: null,
        role: null,
        location_id: null,
        emp_id: null,
        user_status: null,
    });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_no: '',
        email: '',
        location_id: '',
        dept_id: '',
        dept_name: '',
        role: '',
        location: '',
        emp_id: '',
        user_status: 'active',
    });
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState({ status: 'active' });
    const [locations, setLocations] = useState([]);
    const navigate = useNavigate();
    const [designations, setDesignations] = useState([]);
    const [notification, setNotification] = useState({ message: '', color: '' });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('https://devapi.softtrails.net/saas/test/departments', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                setDepartments(response.data || []);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [id]: (() => {
                switch (id) {
                    case 'first_name':
                        return validateFirstName(value);
                    case 'last_name':
                        return validateLastName(value);
                    case 'phone_no':
                        return validatePhone(value);
                    case 'email':
                        return validateEmail(value);
                    case 'role':
                        return validateRole(value);
                    default:
                        return null;
                }
            })(),
        }));
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleDepartmentChange = (e) => {
        const selectedDeptId = parseInt(e.target.value, 10);
        const selectedDept = departments.find(dept => dept.dept_id === selectedDeptId);

        setFormData({
            ...formData,
            dept_id: selectedDeptId,
            dept_name: selectedDept ? selectedDept.dept_name : '',
        });

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            dept_id: selectedDeptId ? null : 'Department is required.',
        }));
    };

    const isFormValid = () => {
        return (
            formData.first_name &&
            formData.last_name &&
            formData.phone_no &&
            formData.email &&
            formData.dept_id &&
            formData.emp_id &&
            formData.user_status &&
            formData.location_id &&
            !Object.values(formErrors).some((error) => error !== null)
        );
    };
    const handleSignUp = async (e) => {
        e.preventDefault();
        console.log(formData);  // Log formData to debug

        if (!isFormValid()) {
            setNotification({ message: 'Please provide all required details.', color: 'red' });
            return;
        }
        try {
            const selectedDept = departments.find(dept => dept.dept_id === formData.dept_id);
            const selectedLocation = locations.find(location => location.location_id === formData.location_id);

            const dept_name = selectedDept ? selectedDept.dept_name : '';
            const location_name = selectedLocation ? selectedLocation.locality : '';

            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_no: formData.phone_no,
                email: formData.email,
                dept_name: dept_name,
                dept_id: formData.dept_id,
                emp_id: formData.emp_id,
                user_status: formData.user_status,
                location: location_name || "NA"
            };
            console.log('Sending payload:', payload);
            const response = await axios.post('https://devapi.softtrails.net/saas/test/signup', payload);
            if (response.data.message === 'User registered successfully.') {
                setNotification({ message: 'Registration successful.', color: 'green' });
                setUsers((prevUsers) => [
                    ...prevUsers,
                    {
                        ...formData,
                        dept_name: dept_name,
                        location: location_name,
                    }
                ]);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (response.data.message === 'Email already exists.') {
                setNotification({ message: 'Email already exists.', color: 'red' });
            } if (error.response && error.response.message.includes('already exists')) {
                setError('Employee ID already exists. Please use a different ID.');
            }
            else {
                setNotification({ message: 'Registration failed. Please try again.', color: 'red' });
            }
        } catch (error) {
            console.error('Error during registration:', error);

            if (error.response) {
                console.error('Error response data:', error.response.data);
            }
        }
    };

    useEffect(() => {
        fetchDesignations();
        fetchLocation();
    }, []);

    const handleLocationChange = (e) => {
        const selectedLocationId = parseInt(e.target.value, 10);
        const selectedLocation = locations.find(location => location.location_id === selectedLocationId);

        setFormData({
            ...formData,
            location_id: selectedLocationId,
            location: selectedLocation ? selectedLocation.location : '',
        });

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            location_id: selectedLocationId ? null : 'Location is required.',
        }));
    };

    const handleDesignationChange = (e) => {
        const selectedDesignationId = parseInt(e.target.value, 10);
        const selectedDesignation = designations.find(designation => designation.designation_id === selectedDesignationId);

        setFormData({
            ...formData,
            designation_id: selectedDesignationId,
            designation_name: selectedDesignation ? selectedDesignation.designation_name : '',
        });

        setFormErrors((prevErrors) => ({
            ...prevErrors,
            designation_id: selectedDesignationId ? null : 'Designation is required.',
        }));
    };

    useEffect(() => {
        const handlePopState = () => {
            navigate('/AMS');
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    const fetchDesignations = async () => {
        try {
            const response = await axios.get('https://devapi.softtrails.net/saas/test/designation');
            setDesignations(response.data);
        } catch (error) {
            console.error('Error fetching designations:', error);
        }
    };

    const fetchLocation = async () => {
        try {
            const response = await axios.get('https://devapi.softtrails.net/saas/test/loc');
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleStatusChange = (e) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            user_status: value,
        }));
    };

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
                <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                    {notification.message && (
                        <div
                            className={`mb-4 p-3 text-center text-${notification.color}-500 bg-${notification.color}-100 border border-${notification.color}-300 rounded`}
                        >
                            {notification.message}
                        </div>
                    )}
                    <form onSubmit={handleSignUp}>
                        {/* First Name and Last Name */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            {/* First Name */}
                            <div>
                                <label htmlFor="first_name">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                    placeholder="First Name"
                                />
                                {formErrors.first_name && (
                                    <span className="text-red-500">{formErrors.first_name}</span>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="last_name">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                    placeholder="Last Name"
                                />
                                {formErrors.last_name && (
                                    <span className="text-red-500">{formErrors.last_name}</span>
                                )}
                            </div>
                        </div>
                        {/* Phone Number and E-mail*/}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="phone_no">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="phone_no"
                                    value={formData.phone_no}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                    placeholder="Phone Number"
                                />
                                {formErrors.phone_no && (
                                    <span className="text-red-500">{formErrors.phone_no}</span>
                                )}
                            </div>
                            <div>
                                <label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                    placeholder="Email"
                                />
                                {formErrors.email && (
                                    <span className="text-red-500">{formErrors.email}</span>
                                )}
                            </div>

                        </div>
                        {/* Employee ID and Location */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div >
                                <label htmlFor="emp_id">
                                    Employee ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="emp_id"
                                    value={formData.emp_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                    placeholder="Employee ID"
                                />
                                {formErrors.emp_id && (
                                    <span className="text-red-500">{formErrors.emp_id}</span>
                                )}
                            </div>
                            <div>
                                <label htmlFor="location_id">Location <span className="text-red-500">*</span></label>
                                <select
                                    id="location_id"
                                    value={formData.location_id} // Use location_id for the value
                                    onChange={handleLocationChange} // Handle location change
                                    className="w-full border border-gray-700  rounded-md p-2"
                                >
                                    <option value="">Select Location</option>
                                    {locations.map((location) => (
                                        <option key={location.location_id} value={location.location_id}>
                                            {location.locality}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.location_id && (
                                    <span className="text-red-500">{formErrors.location_id}</span>
                                )}

                            </div>
                        </div>
                        {/* Designation and Department*/}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="dept_id">Department <span className="text-red-500">*</span></label>
                                <select
                                    id="dept_id"
                                    value={formData.dept_id}
                                    onChange={handleDepartmentChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.dept_id} value={dept.dept_id}>
                                            {dept.dept_name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.dept_id && (
                                    <span className="text-red-500">{formErrors.dept_id}</span>
                                )}
                            </div>
                            <div>
                                <label htmlFor="designation_id">Designation <span className="text-red-500">*</span></label>
                                <select
                                    id="designation_id"
                                    value={formData.designation_id}
                                    onChange={handleDesignationChange}
                                    className="w-full border border-gray-700  rounded-md p-2"
                                >
                                    <option value="">Select Designation</option>
                                    {designations.map((designation) => (
                                        <option key={designation.desig_id} value={designation.desig_id}>
                                            {designation.designation}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.designation_id && (
                                    <span className="text-red-500">{formErrors.designation_id}</span>
                                )}
                            </div>
                        </div>
                        {/*Status */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">
                            <div >
                                <label htmlFor="user_status">
                                    User Status <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center">
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            name="user_status"
                                            value="active"
                                            checked={formData.user_status === "active"}
                                            onChange={handleStatusChange}
                                            className="mr-2"
                                        />
                                        Active
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="user_status"
                                            value="inactive"
                                            checked={formData.user_status === "inactive"}
                                            onChange={handleStatusChange}
                                            className="mr-2"
                                        />
                                        Inactive
                                    </label>
                                </div>
                                {formErrors.user_status && (
                                    <span className="text-red-500">{formErrors.user_status}</span>
                                )}
                            </div>
                        </div>
                        {/* Submit Button */}
                        <div className="grid gap-4 mb-4 md:grid-cols-2">                                    <button
                            type="submit"
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg w-2/3"
                        >
                            Add User
                        </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default Register;
