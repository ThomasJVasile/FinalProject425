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
  


