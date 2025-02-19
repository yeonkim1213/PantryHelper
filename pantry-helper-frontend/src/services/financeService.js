import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/finance";

export const getFinanceRecords = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}`);
};

export const addFinanceRecord = async (pantryID, record) => {
  return await axios.post(`${API_URL}/${pantryID}`, record);
};

export const updateFinanceRecord = async (id, updatedRecord) => {
  return await axios.put(`${API_URL}/${id}`, updatedRecord);
};

export const deleteFinanceRecord = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};
