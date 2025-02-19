import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/inventory"; // URL change to aws later

export const fetchInventory = async (currentPantry) => {
  return await axios.get(API_URL, { params: { pantryID: currentPantry } });
};

export const addItem = async (item, pantryID) => {
  return await axios.post(API_URL, { ...item, pantryID });
};

export const updateItem = async (id, item, pantryID) => {
  return await axios.put(`${API_URL}/${id}`, { ...item, pantryID });
};

export const deleteItem = async (id, pantryID) => {
  return await axios.delete(`${API_URL}/${id}`, { params: { pantryID } });
};

export const addOutgoingEntry = async (outgoingEntry, pantryID) => {
  return await axios.post(`${API_URL}/Outgoing`, {
    ...outgoingEntry,
    pantryID,
  });
};

export const addIncomingEntry = async (incomingEntry, pantryID) => {
  return await axios.post(`${API_URL}/Incoming`, {
    ...incomingEntry,
    pantryID,
  });
};
