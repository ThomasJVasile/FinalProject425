<template>
    <div class="profile-page">
      <h1>Edit Profile</h1>
      <div class="profile-container">
        <div class="avatar-container">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            alt="User Avatar"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">No Avatar</div>
          <input type="file" @change="onFileChange" class="avatar-upload" />
          <button @click="uploadAvatar" class="upload-button">Upload Avatar</button>
        </div>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </template>
  




  <script>
  import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
  import { db, storage } from "@/firebase";
  import { doc, updateDoc, getDoc } from "firebase/firestore";
  import { getAuth } from "firebase/auth";
  
  export default {
    data() {
      return {
        userAvatar: null, 
        selectedFile: null, 
        message: "", 
      };
    },
    async created() {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.userAvatar = userData.avatarUrl || null; 
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    },
    methods: {
      onFileChange(event) {
        this.selectedFile = event.target.files[0]; 
      },
      async uploadAvatar() {
        if (!this.selectedFile) {
          this.message = "Please select a file to upload.";
          return;
        }
  
        const auth = getAuth();
        const user = auth.currentUser;
  
        if (user) {
          try {
            const avatarRef = storageRef(
              storage,
              `user-avatars/${user.uid}_${this.selectedFile.name}`
            );
            const snapshot = await uploadBytes(avatarRef, this.selectedFile);
            const avatarUrl = await getDownloadURL(snapshot.ref);
            await updateDoc(doc(db, "users", user.uid), {
              avatarUrl: avatarUrl,
            });
  
            this.userAvatar = avatarUrl;
            this.message = "Avatar updated successfully!";
          } catch (error) {
            console.error("Error uploading avatar: ", error);
            this.message = "Failed to upload avatar. Please try again.";
          }
        }
      },
    },
  };
  </script>

<style scoped>
.profile-page {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}

.profile-container {
  margin: 20px auto;
  max-width: 400px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #aaa;
}

.avatar-upload {
  margin-top: 10px;
}

.upload-button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #45a049;
}

.message {
  margin-top: 20px;
  font-size: 14px;
  color: #007bff;
}
</style>

  