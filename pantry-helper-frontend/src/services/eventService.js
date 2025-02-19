import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/events";

export const addEvent = async (event) => {
  return await axios.post(API_URL, event);
};

export const updateEvent = async (id, event) => {
  return await axios.put(`${API_URL}/${id}`, event);
};

export const deleteEvent = async (eventId, pantryID) => {
  return await axios.delete(`${API_URL}/${eventId}`, { params: { pantryID } });
};

export const fetchEventsByPantry = async (pantryID) => {
  return await axios.get(`${API_URL}/pantry/${pantryID}`);
};
