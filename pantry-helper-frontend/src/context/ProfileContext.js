// src/context/ProfileContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  saveProfile,
  updateProfile as updateProfileService,
} from "../services/profileService";
import axios from "axios";
import { getProfileById } from "../services/profileService";

// Create Profile Context
const ProfileContext = createContext();

// Profile Provider Component
export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds the Google OAuth response
  const [profile, setProfile] = useState(null); // Holds the user's profile information
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Google login function
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => setUser(tokenResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  const fetchProfileWithCurrentPantry = async (profileID) => {
    try {
      const response = await getProfileById(profileID);
      const profileData = response.data;
      setProfile(profileData);
      localStorage.setItem("profile", JSON.stringify(profileData));
    } catch (error) {
      console.error("Error fetching profile with currentPantry:", error);
    }
  };

  // Function to save profile to backend
  const saveProfileToBackend = async (profileData) => {
    try {
      const response = await saveProfile({
        name: profileData.name,
        email: profileData.email,
        emailPreference: emailNotifications,
        // Add other necessary fields here (e.g., userAuthority, pantryID)
      });
      const savedProfile = response.data;
      // Update profile with profileID from backend
      setProfile((prevProfile) => ({
        ...prevProfile,
        profileID: savedProfile.profileID,
      }));
      // Save updated profile to localStorage
      localStorage.setItem(
        "profile",
        JSON.stringify({ ...profileData, profileID: savedProfile.profileID })
      );
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Fetch user profile once user state is updated
  useEffect(() => {
    if (user && user.access_token) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          const userInfo = res.data;
          setProfile(userInfo);
          if (profile && profile.profileID) {
            fetchProfileWithCurrentPantry(profile.profileID);
          }
        })
        .catch((err) => console.log("Error fetching user info:", err));
    }
  }, [user]);

  // Save profile to backend once it's fetched and does not have profileID
  useEffect(() => {
    if (profile && !profile.profileID) {
      saveProfileToBackend(profile);
    }
  }, [profile]);

  // Initialize profile from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  // Persist profile to localStorage whenever it changes and has profileID
  useEffect(() => {
    if (profile && profile.profileID) {
      localStorage.setItem("profile", JSON.stringify(profile));
    }
  }, [profile]);

  // Google logout function
  const logOut = () => {
    googleLogout();
    setUser(null);
    setProfile(null);
    localStorage.removeItem("profile"); // Ensure localStorage is cleared
  };

  // Function to update email notifications
  const updateEmailNotifications = async (status) => {
    setEmailNotifications(status);
    if (profile && profile.profileID) {
      try {
        // Update profile on the backend
        await updateProfileService(profile.profileID, {
          ...profile,
          emailPreference: status,
        });
        // Update profile state locally
        setProfile((prevProfile) => ({
          ...prevProfile,
          emailPreference: status,
        }));
        // Update localStorage
        localStorage.setItem(
          "profile",
          JSON.stringify({
            ...profile,
            emailPreference: status,
          })
        );
      } catch (error) {
        console.error("Error updating email preference:", error);
      }
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        login,
        logOut,
        emailNotifications,
        updateEmailNotifications,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the Profile context
export const useProfile = () => useContext(ProfileContext);
