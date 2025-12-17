import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const InfoSection = ({ title, icon, fields, onEdit }) => {
  const column1Fields = fields.slice(0, 6);
  const column2Fields = fields.slice(6);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-h-[500px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <button className="text-gray-500 hover:text-gray-700" onClick={onEdit}>
          ✎
        </button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/2">
          {column1Fields.map(({ label, value, isTitle }, index) => (
            <div key={index} className="flex gap-4 mb-2">
              <div
                className={`w-1/3 font-medium text-gray-600 ${isTitle ? "font-bold underline" : ""
                  }`}
              >
                {label}
              </div>
              <div className="w-2/3 text-gray-500">{value}</div>
            </div>
          ))}
        </div>

        {column2Fields.length > 0 && (
          <div className="w-1/2">
            {column2Fields.map(({ label, value, isTitle }, index) => (
              <div key={index} className="flex gap-4 mb-2">
                <div
                  className={`w-1/3 font-medium text-gray-600 ${isTitle ? "font-bold underline text-base" : ""
                    }`}
                >
                  {label}
                </div>
                <div className="w-2/3 text-gray-500">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EditModal = ({ visible, onClose, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});

  // List of non-editable fields
  const nonEditableFields = [
    "Full Name",
    "Email",
    "Joining Date",
    "Department",
    "Sub Department",
    "Pin",
    "Emergency Contact",
  ];

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Details</h2>
        {Object.keys(formData || {}).filter((key) => key !== "Spouse Details").map((key, index) => (
          <div key={index} className="mb-4">
            <label className="block font-medium mb-2">{key}</label>
            {nonEditableFields.includes(key) ? (
              // Render non-editable fields as plain text or read-only input
              <input
                type="text"
                name={key}
                value={formData[key]}
                readOnly
                className="w-full border border-gray-300 bg-gray-100 text-gray-600 rounded px-2 py-1"
              />
            ) : (
              // Editable fields
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => onSave(formData)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const PersonalInfo = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const userId = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);

  useEffect(() => {
    // Retrieve the employeeId from sessionStorage, fallback to localStorage
    const storedEmployeeId =
      sessionStorage.getItem("employeeeId") || sessionStorage.getItem("userId");
    if (storedEmployeeId) {
      setEmployeeId(userId.employeeId || storedEmployeeId);
    }
  }, [userId]);

 useEffect(() => {
  if (!employeeId) return;

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get user data with Authorization header
      const userRes = await axios.get(
        `https://devapi.softtrails.net/hrms/test/users/id_user/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const userData = userRes.data.user;

      // 2. Get locations (with header if protected)
      const locationRes = await axios.get(`https://devapi.softtrails.net/hrms/test/loc`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const locations = locationRes.data;

      const matchedLocation = locations.find(
        (loc) =>
          loc.locality.trim().toLowerCase() ===
          userData.locality?.trim().toLowerCase()
      );
      const matchedPin = matchedLocation?.code || "";

      const transformedSections = [
        {
          title: "Personal Information",
          icon: "👤",
          fields: [
            {
              label: "Full Name:",
              value: `${userData.first_name} ${userData.last_name}`,
            },
            {
              label: "D.O.B.:",
              value: userData?.dob
                ? new Date(userData.dob).toLocaleDateString("en-CA")
                : "",
            },
            { label: "Blood Group:", value: userData?.blood || "NA" },
            {
              label: "Marital Status:",
              value: userData?.marital_status || "",
            },
            { label: "Department:", value: userData?.dept_name || "" },
            {
              label: "Education:",
              value: userData?.extra_details?.education || "",
            },
            { label: "Spouse Details", isTitle: true },
            {
              label: "Spouse Name",
              value:
                userData?.extra_details?.spouse_details?.spouse_name || "",
            },
            {
              label: "Spouse Occupation",
              value:
                userData?.extra_details?.spouse_details?.spouse_occupation ||
                "",
            },
            {
              label: "Spouse Contact Number",
              value:
                userData?.extra_details?.spouse_details
                  ?.spouse_contact_number || "",
            },
          ],
        },
        {
          title: "Contact Information",
          icon: "📞",
          fields: [
            { label: "Email:", value: userData?.email || "" },
            { label: "Locality:", value: userData?.locality || "" },
            { label: "Pin:", value: matchedPin },
            {
              label: "Emergency Contact:",
              value:
                userData?.extra_details?.emergency_contact?.contact_number ||
                "",
            },
          ],
        },
      ];

      setSections(transformedSections);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [employeeId]);

  const handleEdit = (section) => {
    const editData = section.fields.reduce((acc, field) => {
      if (!field.isTitle) {
        acc[field.label.replace(":", "")] = field.value;
      }
      return acc;
    }, {});
    setCurrentEditData(editData);
    setModalVisible(true);
  };

 const handleSave = async (updatedData) => {
  try {
    const postPayload = {
      user_id: employeeId,
      dob: updatedData["D.O.B."] || "",
      blood_group: updatedData["Blood Group"] || "",
      pin: updatedData["Pin"] || "",
      address: updatedData["Locality"] || "",
      marital_status: updatedData["Marital Status"] || "",
      personal_number: updatedData["Personal Phone"] || "",
      emergency_contact: {
        contact_number: updatedData["Emergency Contact"] || "",
      },
      spouse_details: {
        spouse_name: updatedData["Spouse Name"] || "",
        spouse_occupation: updatedData["Spouse Occupation"] || "",
        spouse_contact_number: updatedData["Spouse Contact Number"] || "",
      },
    };

    await axios.post(
      "https://devapi.softtrails.net/hrms/test/users/user-details",
      postPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );

    const updatedSections = sections.map((section) => {
      if (section.title === "Personal Information") {
        return {
          ...section,
          fields: section.fields.map((field) => ({
            ...field,
            value: updatedData[field.label.replace(":", "")] || field.value,
          })),
        };
      }
      return section;
    });

    setSections(updatedSections);
    Swal.fire("Success!", "Your changes have been saved.", "success");
    setModalVisible(false);
    setError(null);
  } catch (error) {
    console.error("Failed to save data", error);
    Swal.fire("Error!", "Failed to save changes. Please try again.", "error");
    setModalVisible(false);
  }
};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 overflow-y-auto">
        {sections.slice(0, 2).map((section, index) => (
          <InfoSection
            key={index}
            title={section.title}
            icon={section.icon}
            fields={section.fields}
            onEdit={() => handleEdit(section)}
          />
        ))}
      </div>
      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={currentEditData}
        onSave={handleSave}
      />
    </div>
  );
};
export default PersonalInfo;