import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/pantry-users";

export const addPantryUser = async (profileID, pantryID, userAuthority) => {
  return await axios.post(API_URL, { profileID, pantryID, userAuthority });
};

export const deletePantryUser = async (profileID, pantryID) => {
  return await axios.delete(`${API_URL}/${profileID}/${pantryID}`);
};

export const getUserSubscriptions = async (profileID) => {
  return await axios.get(`${API_URL}/${profileID}/subscriptions`);
};

export const fetchPantryUsers = async () => {
  return await axios.get(API_URL);
};

export const fetchPantryUsersWithProfiles = async (pantryID) => {
  return await axios.get(`${API_URL}/${pantryID}/profiles`);
};

export const updateUserAuthority = async (
  profileID,
  pantryID,
  userAuthority
) => {
  return await axios.put(`${API_URL}/${profileID}/${pantryID}/authority`, {
    userAuthority,
  });
};
