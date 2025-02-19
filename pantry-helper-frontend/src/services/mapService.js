import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/map";

// Save the map layout to the database
export const saveMapLayout = async (pantryID, layoutData) => {
  return await axios.post(API_URL, { pantryID, layout: layoutData });
};

// Fetch the map layout for a specific pantry
export const fetchMapLayout = async (pantryID) => {
  return await axios.get(`${API_URL}/pantry/${pantryID}`);
};
