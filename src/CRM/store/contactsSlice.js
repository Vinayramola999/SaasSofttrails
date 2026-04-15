// src/CRM/store/contactsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { CRM_ENDPOINTS } from "../config/api";
const token = () => sessionStorage.getItem("token");

// Fetch contacts by customerId
export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (customerId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${CRM_ENDPOINTS.CONTACTS}?customer_id=${customerId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch contacts");
    }
  }
);

// Add contact
export const addContact = createAsyncThunk(
  "contacts/addContact",
  async ({ customerId, payload }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        CRM_ENDPOINTS.CONTACTS,
        { ...payload, customer_id: customerId },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add contact");
    }
  }
);

// Edit contact
export const editContact = createAsyncThunk(
  "contacts/editContact",
  async ({ contactId, payload }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        CRM_ENDPOINTS.CONTACT(contactId),
        payload,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to edit contact");
    }
  }
);

// Delete contact
export const deleteContact = createAsyncThunk(
  "contacts/deleteContact",
  async (contactId, { rejectWithValue }) => {
    try {
      await axios.delete(CRM_ENDPOINTS.CONTACT(contactId), {
        headers: { Authorization: `Bearer ${token()}` },
      });
      return contactId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete contact");
    }
  }
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetContacts: (state) => {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addContact.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      // Edit
      .addCase(editContact.fulfilled, (state, action) => {
        const idx = state.data.findIndex(
          (c) => c.contact_id === action.payload.contact_id
        );
        if (idx !== -1) state.data[idx] = action.payload;
      })
      // Delete
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.data = state.data.filter((c) => c.contact_id !== action.payload);
      });
  },
});

export const { resetContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
