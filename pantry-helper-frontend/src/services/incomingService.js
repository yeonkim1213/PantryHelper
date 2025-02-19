import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/inventory/incoming"; // URL change to aws later

export const fetchIncomingInventory = async (currentPantry) => {
  return await axios.get(API_URL, { params: { pantryID: currentPantry } });
};
