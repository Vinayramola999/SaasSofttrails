// Centralized API configuration for CRM module
const BASE_URL = (process.env.REACT_APP_API_CRM_BASE_URL || "https://globalparameters.softtrails.net").replace(/\/+$/, "");

export const CRM_ENDPOINTS = {
  // Customer endpoints
  CUSTOMERS: `${BASE_URL}/customers`,
  CUSTOMER: (id) => `${BASE_URL}/customers/${id}`,
  CUSTOMER_FLAG: (id) => `${BASE_URL}/customers/${id}/flag`,
  CUSTOMER_FLAGGED: `${BASE_URL}/customers/flagged`,
  CUSTOMER_VERIFY: (id) => `${BASE_URL}/customers/${id}/verify`,
  
  // Contact endpoints
  CONTACTS: `${BASE_URL}/contacts`,
  CONTACT: (id) => `${BASE_URL}/contacts/${id}`,
  CONTACTS_WITH_DETAILS: `${BASE_URL}/contacts/with-customer-details`,
  
  // Auth/Token endpoints
  VERIFY_TOKEN: "https://globalparameters.softtrails.net/users/verify-token",
};

export const API_GLOBAL_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") || "https://globalparameters.softtrails.net";

export default BASE_URL;
