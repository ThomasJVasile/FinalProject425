<template>

  <!-- the following is the template for the profile page. -->
  <!-- (1) -->
  <div id="profile-page">
    <!-- Header for the profile (1) -->
    <!-- (2) -->
    <div class="profile-header">
      <!-- for profile picture -->
      <!-- profile container(2)  -->

      <!-- (3) -->
      <div class="profile-picture"> 
        <!-- for profile circle (4) -->
        <div class="profile-circle">

          <!-- Displaying the profile picture with an option to change it --> 
          <img 
            v-if="profilePicture" 
            :src="profilePicture" 
            alt="Profile Picture" 
            class="profile-image" 
          />
          
          <!-- Placeholder User Icon if No Picture --> 
          <!-- https://fontawesome.com/icons/user?s=solid  -->
          <i class="fa fa-user user-icon" v-if="!profilePicture"></i>    

          <!-- Camera Icon for Upload -->
          <label for="profile-upload" class="camera-icon">
            <i class="fa fa-camera"></i>
          </label>

          <!-- Hidden File Input for Upload -->
          <input 
            id="profile-upload" 
            type="file" 
            accept="image/*" 
            @change="onFileChange" 
          />
          <!-- (1) -->

        </div>
        <!-- Save Button -->
        <button @click="uploadProfilePicture" class="upload-button">Save</button>
        <!-- (2) -->
      </div>

      <!-- User Name Section -->
      <!-- (5) -->
      <div class="profile-info">
        <!-- Safely Display User's Name, Username, or Email -->
        <h1>{{ firstName || lastName ? firstName + " " + lastName : username || "Guest" }}</h1>
        <!-- (3) -->
      </div>
      <!-- (4) -->

    </div>
  

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <button><i class="fa fa-users"></i> Friends</button>
      <button @click="goToPage('EventsPage')"><i class="fa fa-calendar"></i> My Events</button>
      <button><i class="fa fa-image"></i> Photos</button>
      <button @click="goToPage('SettingsPage')"><i class="fa fa-cog"></i> Settings</button>
      <button><i class="fa fa-clock"></i> Timeline</button>
    </div>

    <!-- Feedback Message -->
    <p v-if="message" class="message">{{ message }}</p>
    <!-- (5) -->

  </div>

</template>









<script>
// Correct Firebase Imports
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/firebase"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default {
  data() {
    return {
      profilePicture: null, // Profile picture URL
      user: {},             // Authenticated user
      firstName: "",        // User's first name from Firestore
      lastName: "",         // User's last name from Firestore
      username: "",         // User's username from Firestore
      selectedFile: null,   // Stores the uploaded file
      message: "",          // Displays success or error messages
    };
  },

  async created() {
    const auth = getAuth();

    // Track user state changes
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        this.user = currentUser;

        try {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.profilePicture =
              userData.avatarUrl || currentUser.photoURL || "placeholder-profile.png";
            
            // Extract Firestore name fields
            this.firstName = userData.firstName || "";
            this.lastName = userData.lastName || "";
            this.username = userData.username || "";
          } else {
            this.profilePicture = currentUser.photoURL || "placeholder-profile.png"; 
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        this.user = {}; 
      }
    });
  },

  methods: {
    onFileChange(event) {
      this.selectedFile = event.target.files[0]; 
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
          // Upload file to Firebase Storage
          const avatarRef = storageRef(
            storage,
            `user-avatars/${user.uid}_${this.selectedFile.name}`
          );

          const snapshot = await uploadBytes(avatarRef, this.selectedFile);
          const avatarUrl = await getDownloadURL(snapshot.ref);

          // Update Firestore with new profile picture URL
          await updateDoc(doc(db, "users", user.uid), {
            avatarUrl: avatarUrl,
          });

          // Update Firebase Auth user profile
          await user.updateProfile({
            photoURL: avatarUrl,
          });

          this.profilePicture = avatarUrl; 
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
/* backgound  */
#profile-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(120deg, #050f30, #ffffff);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(194, 179, 179, 0.808);
}


.profile-header {
  display: flex;
  align-items: center;
  width: 100%;
}

/* profile pictire style */
.profile-picture {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Profile Picture Circle */
.profile-circle {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 10px;
}

/* Default User Icon */
.user-icon {
  font-size: 70px;
  color: #555;
}

/* Profile Image */
.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Camera Icon Overlay */
.camera-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: white;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  border: 2px solid #ddd;
}

.camera-icon:hover {
  background: #eee;
}

/* Hidden File Input */
.profile-picture input {
  display: none;
}

/* User Name Styling */
.profile-info h1 {
  font-size: 24px;
  margin: 0;
  color: rgb(255, 255, 255);
}

/* Navigation Tabs */
.profile-tabs {
  display: flex;
  margin-top: 20px;
  gap: 10px;
}

.profile-tabs button {
  padding: 10px 20px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
}

.profile-tabs button:hover {
  background-color: #e0e0e0;
}

/* Upload Button */
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

/* Feedback Message */
.message {
  margin-top: 10px;
  font-size: 14px;
  color: #007bff;
}
</style>