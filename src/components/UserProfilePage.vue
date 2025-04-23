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
            @error="profilePicture = null"
          />
          <svg 
            v-else 
            class="default-avatar" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
              fill="#65676b"
            />
          </svg>
          <button 
            class="camera-button"
            @click="$refs.fileInput.click()"
            title="Update profile picture"
          >
            <i class="fa fa-camera"></i>
          </button>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            class="file-input"
          />
        </div>
      </div>

      <div class="basic-info">
        <h1>{{ firstName || lastName ? firstName + " " + lastName : username || "Guest" }}</h1>
        <div class="username" v-if="username">@{{ username }}</div>
        <div class="location" v-if="userLocation">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ userLocation }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">
      <!-- LG: Reordered navigation tabs -->
      <button class="tab-button" @click="goToPage('EventsPage')"><i class="fa fa-calendar"></i> Events</button>
      <button class="tab-button" @click="goToPage('FriendRequests')"><i class="fa fa-user-friends"></i> Friends</button>
      <button class="tab-button"><i class="fa fa-image"></i> Photos</button>
      <button class="tab-button" @click="goToPage('SettingsPage')"><i class="fa fa-cog"></i> Settings</button>

      <!-- 
      <button class="tab-button" @click="goToPage('FriendRequests')"><i class="fa fa-user-friends"></i> Friend Requests</button>
      <button class="tab-button" @click="goToPage('EventsPage')"><i class="fa fa-calendar"></i> My Events</button>
      <button class="tab-button"><i class="fa fa-image"></i> Photos</button>
      <button class="tab-button" @click="goToPage('SettingsPage')"><i class="fa fa-cog"></i> Settings</button>
      
      -->
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
    // Handle file selection and upload
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // Upload file to Firebase Storage
        const avatarRef = storageRef(
          storage,
          `user-avatars/${this.user.uid}_${file.name}`
        );

        const snapshot = await uploadBytes(avatarRef, file);
        const avatarUrl = await getDownloadURL(snapshot.ref);

        // Update Firestore with new profile picture URL
        await updateDoc(doc(db, "users", this.user.uid), {
          avatarUrl: avatarUrl,
        });

        // Update Firebase Auth user profile
        await this.user.updateProfile({
          photoURL: avatarUrl,
        });

        // Update local state
        this.profilePicture = avatarUrl;
        this.message = "Profile picture updated successfully!";
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        this.message = "Failed to upload profile picture. Please try again.";
      }
    },

    goToPage(pageName) {
      this.$router.push({ name: pageName });
    },

    handleImageError() {
      this.profilePicture = null;
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

/* Profile picture circle */
.profile-circle {
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #f0f2f5;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* Profile image */
.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Default avatar styling */
.default-avatar {
  width: 100%;
  height: 100%;
  padding: 20%;
  background: #e4e6eb;
}

/* Camera button styling */
.camera-button {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(31, 41, 55, 0.7); /* bg-gray-800/70 */
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.camera-button:hover {
  background: rgba(55, 65, 81, 0.8); /* hover:bg-gray-700/80 */
  transform: scale(1.05);
}

.camera-button i {
  color: white; /* text-white */
  font-size: 16px;
}

/* Hide the file input */
.file-input {
  display: none;
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

.username {
  color: #65676b;
  font-size: 0.9rem;
  margin: 4px 0;
}
</style>