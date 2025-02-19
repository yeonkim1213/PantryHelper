import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/requests";

export const addRequest = async (requestData) => {
  return await axios.post(API_URL, requestData);
};

export const getRequestsByPantryID = async (pantryID) => {
  return axios.get(`${API_URL}/pantry/${pantryID}`);
};

export const deleteRequest = async (profileID, pantryID, itemName) => {
  return axios.delete(
    `${API_URL}/${profileID}/${pantryID}/${encodeURIComponent(itemName)}`
  );
};

export const markRequestCompleted = async (profileID, pantryID, itemName) => {
  return axios.put(`${API_URL}/complete`, { profileID, pantryID, itemName });
};

export const markRequestIncomplete = async (profileID, pantryID, itemName) => {
  return axios.put(`${API_URL}/incomplete`, { profileID, pantryID, itemName });
};

export const updateRequest = async (profileID, pantryID, itemName, updates) => {
  return axios.put(
    `${API_URL}/update/${profileID}/${pantryID}/${encodeURIComponent(
      itemName
    )}`,
    updates
  );
};
