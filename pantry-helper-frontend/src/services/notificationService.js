import axios from "axios";

const API_URL = "//www.pantry-helper.com/api/notifications"; // URL change to aws later

export const fetchNotifications = async (profileID) => {
  try {
    const response = await axios.get(`${API_URL}/${profileID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const addNotification = async ({
  profileID,
  pantryID,
  detail,
  isRead,
}) => {
  try {
    const response = await axios.post(API_URL, {
      profileID: profileID,
      pantryID: pantryID,
      detail: detail,
      isRead: isRead,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationID) => {
  try {
    const response = await axios.delete(`${API_URL}/${notificationID}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (profileID) => {
  try {
    const response = await axios.patch(`${API_URL}/${profileID}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
