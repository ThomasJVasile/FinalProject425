<template>
  <div id="profile-page">
    <!-- Header section for the profile -->
    <div class="profile-header">
      <!-- Profile Picture Section -->
      <div class="profile-picture">
        <label for="profile-upload">
          <!-- Displays the user's profile picture -->
          <img :src="profilePicture" alt="Profile Picture" />
          <!-- Overlay with a camera icon for uploading a new picture -->
          <div class="upload-symbol">
            <i class="fa fa-camera"></i> <!-- FontAwesome camera icon -->
          </div>
        </label>
        <!-- Hidden file input for uploading profile pictures -->
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          @change="onFileChange"
        />
        <!-- Save button -->
        <button @click="uploadProfilePicture" class="upload-button">
          Save Profile Picture
        </button>
      </div>

      <!-- User Name Section -->
      <div class="profile-info">
        <h1>{{ userName }}</h1>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <button><i class="fa fa-users"></i> Friends</button>
      <button @click="goToPage('EventsPage')"><i class="fa fa-calendar"></i> My Events</button>
      <button><i class="fa fa-image"></i> Photos</button>
      <button @click="goToPage('SettingsPage')"><i class="fa fa-cog"></i> Settings</button>
      <button><i class="fa fa-clock"></i> Timeline</button>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase"; // Firebase instance
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  data() {
    return {
      profilePicture: "placeholder-profile.png", // Placeholder image
      userName: "", // User's name
      selectedFile: null, // File selected for upload
      message: "", // Message for success or errors
    };
  },
  async created() {
    // Fetch user details from Firestore on component creation
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.userName = userData.name || "Guest"; // Set user's name
          this.profilePicture = userData.avatarUrl || "placeholder-profile.png"; // Set profile picture
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  },
  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0]; // Store the selected file
    },
    async uploadProfilePicture() {
      if (!this.selectedFile) {
        this.message = "Please select a file to upload.";
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          // Create a reference for the file in Firebase Storage
          const avatarRef = storageRef(
            storage,
            `user-avatars/${user.uid}_${this.selectedFile.name}`
          );

          // Upload the file to Firebase Storage
          const snapshot = await uploadBytes(avatarRef, this.selectedFile);

          // Get the URL of the uploaded file
          const avatarUrl = await getDownloadURL(snapshot.ref);

          // Update Firestore document with the new profile picture URL
          await updateDoc(doc(db, "users", user.uid), {
            avatarUrl: avatarUrl,
          });

          this.profilePicture = avatarUrl; // Update the UI with the new profile picture
          this.message = "Profile picture updated successfully!";
        } catch (error) {
          console.error("Error uploading profile picture:", error);
          this.message = "Failed to upload profile picture. Please try again.";
        }
      }
    },
    goToPage(pageName) {
      this.$router.push({ name: pageName });
    },
  },
};
</script>

<style scoped>
/* Container for the overall profile page */
#profile-page {
  display: flex;
  flex-direction: column; /* Arrange items vertically */
  align-items: flex-start; /* Align items to the left */
  padding: 20px;
  background: linear-gradient(120deg, #050f30, #ffffff); /* Background gradient */
  border-radius: 8px; /* Rounded corners for the card */
  box-shadow: 0 4px 8px rgba(194, 179, 179, 0.808); /* Subtle shadow for a card effect */
}

/* Header section containing profile picture and name */
.profile-header {
  display: flex;
  align-items: center;
  width: 100%; /* Full width of the container */
}

/* Profile picture container */
.profile-picture {
  position: relative; /* Allows positioning of the camera icon */
}

/* Styling for the profile picture */
.profile-picture img {
  width: 100px; /* Fixed width for the profile picture */
  height: 100px; /* Fixed height for the profile picture */
  border-radius: 50%; /* Makes the image circular */
  cursor: pointer; /* Changes the cursor to indicate clickable */
  border: 2px solid #f80c0c; /* Blue border around the picture */
}

/* Hidden file input */
.profile-picture input {
  display: none; /* Hides the file input from view */
}

/* Overlay for the camera icon */
.upload-symbol {
  position: absolute; /* Positioned relative to the profile-picture container */
  bottom: 10px; /* Positioned 10px from the bottom */
  right: 10px; /* Positioned 10px from the right */
  background-color: rgba(223, 16, 16, 0.7); /* Semi-transparent black background */
  color: white; /* White color for the camera icon */
  width: 24px; /* Fixed width for the overlay */
  height: 24px; /* Fixed height for the overlay */
  border-radius: 50%; /* Makes the overlay circular */
  display: flex; /* Flexbox to center the camera icon */
  justify-content: center; /* Centers the icon horizontally */
  align-items: center; /* Centers the icon vertically */
  font-size: 14px; /* Font size for the camera icon */
  pointer-events: none; /* Prevents interference with click events on the label */
}

/* Profile name styling */
.profile-info {
  margin-left: 20px; /* Adds space between the profile picture and name */
}

.profile-info h1 {
  font-size: 24px; /* Font size for the user's name */
  margin: 0; /* Removes extra margins */
  color: #333; /* Dark gray color for the text */
}

/* Navigation tabs styling */
.profile-tabs {
  display: flex; /* Arrange the tabs horizontally */
  justify-content: flex-start; /* Align tabs to the left */
  margin-top: 20px; /* Adds spacing above the tabs */
  gap: 10px; /* Adds spacing between each tab */
}

.profile-tabs button {
  padding: 10px 20px; /* Adds padding to the buttons */
  background-color: #f0f0f0; /* Light gray background color */
  border: 1px solid #ccc; /* Light border around the buttons */
  border-radius: 5px; /* Rounded corners for the buttons */
  cursor: pointer; /* Pointer cursor for interactivity */
}

.profile-tabs button:hover {
  background-color: #e0e0e0; /* Slightly darker background on hover */
}

.upload-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #45a049;
}

.message {
  margin-top: 10px;
  font-size: 14px;
  color: #007bff;
}
</style>
