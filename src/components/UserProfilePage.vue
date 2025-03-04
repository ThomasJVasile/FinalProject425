<template>
  <div id="profile-page">
    <!-- Header Section with Profile Picture and Basic Info -->
    <div class="profile-header">
      <div class="profile-picture"> 
        <div class="profile-circle">
          <img 
            v-if="profilePicture" 
            :src="profilePicture" 
            alt="Profile Picture" 
            class="profile-image" 
          />
          <i class="fa fa-user user-icon" v-if="!profilePicture"></i>    
          <label for="profile-upload" class="camera-icon">
            <i class="fa fa-camera"></i>
          </label>
          <input 
            id="profile-upload" 
            type="file" 
            accept="image/*" 
            @change="onFileChange" 
          />
        </div>
        <button @click="uploadProfilePicture" class="upload-button">Save</button>
      </div>

      <div class="basic-info">
        <h1>{{ firstName || lastName ? firstName + " " + lastName : username || "Guest" }}</h1>
        <div class="location" v-if="userLocation">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ userLocation }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <button class="tab-button" @click="goToPage('FriendRequests')"><i class="fa fa-user-friends"></i> Friend Requests</button>
      <button class="tab-button" @click="goToPage('EventsPage')"><i class="fa fa-calendar"></i> My Events</button>
      <button class="tab-button"><i class="fa fa-image"></i> Photos</button>
      <button class="tab-button" @click="goToPage('SettingsPage')"><i class="fa fa-cog"></i> Settings</button>
    </div>

    <!-- Main Content Area -->
    <div class="profile-content">
      <!-- About and Interests Section -->
      <div class="profile-main">
        <!-- About Section -->
        <div class="content-card">
          <h2>About</h2>
          <div class="bio-text" v-if="userBio">{{ userBio }}</div>
          <div class="no-content" v-else>No bio added yet</div>
        </div>

        <!-- Interests Section -->
        <div class="content-card">
          <h2>Interests & Hobbies</h2>
          <div class="interests-container">
            <ul class="interests-list" v-if="userInterests && userInterests.length > 0">
              <li v-for="(interest, index) in userInterests" 
                  :key="index" 
                  class="interest-item">
                <i class="fas fa-circle"></i>
                {{ interest }}
              </li>
            </ul>
            <div class="no-content" v-else>No interests added yet</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Message -->
    <p v-if="message" class="message">{{ message }}</p>
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
      userBio: "",
      userInterests: [],
      userLocation: "",
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
            
            // New data from settings
            this.userBio = userData.bio || "";
            this.userInterests = userData.interests || [];
            this.userLocation = userData.location || "";
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
#profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f0f2f5;
}

.profile-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.profile-picture {
  flex-shrink: 0;
}

.basic-info {
  flex-grow: 1;
}

.basic-info h1 {
  color: #1a1a1a;
  margin: 0;
  font-size: 24px;
}

.profile-tabs {
  background: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: none;
  color: #65676b;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #f0f2f5;
}

.tab-button i {
  margin-right: 8px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-main {
  width: 100%;
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.content-card h2 {
  color: #1a1a1a;
  font-size: 20px;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e6eb;
}

.bio-text {
  color: #1a1a1a;
  line-height: 1.5;
}

.interests-container {
  width: 100%;
}

.interests-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #1a1a1a;
  font-size: 0.95rem;
  border-bottom: 1px solid #f0f2f5;
}

.interest-item:last-child {
  border-bottom: none;
}

.interest-item i {
  font-size: 6px;
  color: #65676b;
}

.no-content {
  color: #65676b;
  font-style: italic;
}

.location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #65676b;
  margin-top: 8px;
}

.location i {
  color: #1877f2;
}

/* Preserve existing styles for profile picture and upload functionality */
.profile-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #ddd;
  position: relative;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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

.upload-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #1877f2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.upload-button:hover {
  background-color: #166fe5;
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 10px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #1877f2;
}
</style>