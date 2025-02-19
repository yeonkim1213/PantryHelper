import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/subscriptions";

export const getUserSubscriptions = async (profileID) => {
  return await axios.get(`${API_URL}/profile/${profileID}/subscriptions`);
};

export const getEmailsByPantryId = async (pantryID) => {
  return await axios.get(`${API_URL}/profile/${pantryID}/emails`);
};

export const getProfileIDbyPantry = async (pantryID) => {
  return await axios.get(`${API_URL}/profile/${pantryID}/profileID`);
};
