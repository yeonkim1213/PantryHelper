// src/services/pantryService.js
import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/pantries";

export const fetchPantries = async () => {
  return await axios.get(API_URL);
};

export const addPantry = async (pantryData) => {
  return await axios.post(API_URL, pantryData);
};

export const updatePantry = async (pantryID, pantryData) => {
  return await axios.put(`${API_URL}/${pantryID}`, pantryData);
};

export const deletePantry = async (pantryID) => {
  return await axios.delete(`${API_URL}/${pantryID}`);
};

export const getPantryEmail = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}/email`);
};

export const getPantryLocation = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}/location`);
};

export const getPantryPhone = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}/phone`);
};

export const getPantryName = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}/name`);
};

export const verifyPantry = async (accessCode, pantryID) => {
  return await axios.post(`${API_URL}/verify-access-code`, {
    accessCode,
    pantryID,
  });
};
