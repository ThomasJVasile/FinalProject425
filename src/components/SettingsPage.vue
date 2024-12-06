<template>
  <div class="settings-page">
    <h1>Settings</h1>

    <!-- Ok, let's try tabs here for navigation -->
    <div class="settings-tabs">
      <button @click="activeTab = 'account'">Account</button>
      <button @click="activeTab = 'profile'">Profile</button>
      <button @click="activeTab = 'privacy'">Privacy</button>
      <button @click="activeTab = 'notifications'">Notifications</button>
    </div>

    <!-- show content based on active tab -->
    <div class="settings-content">
      <div v-if="activeTab === 'account'">

<!-- Account -->	  
 <h2>Account Settings</h2>
  <form @submit.prevent="updateAccount">
         
          <label>
            Username:
            <input type="text" v-model="username" />
          </label>
          <label>
            Email:
            <input type="email" v-model="email" />
          </label>
          <label>
            Password:
            <input type="password" v-model="password" />
          </label>
          <button type="submit">Save Changes</button>
        </form>
      </div>

      <div v-if="activeTab === 'profile'">
        <h2>Profile Settings</h2>
        <form @submit.prevent="updateProfile">
          <label>
            Bio:
            <!-- Should I add a character limit here?? -->
            <textarea v-model="bio"></textarea>
          </label>
          <label>
            Profile Picture:
            <input type="file" @change="uploadProfilePicture" />
          </label>
          <button type="submit">Save Changes</button>
        </form>
      </div>

      <div v-if="activeTab === 'privacy'">
        <h2>Privacy Settings</h2>
        <label>
          <input type="checkbox" v-model="profileVisibility" />
          Make my profile private
        </label>
        <label>
          <input type="checkbox" v-model="postVisibility" />
          Hide my posts from the public
        </label>
        <button @click="savePrivacySettings">Save Privacy Settings</button>
      </div>

      <div v-if="activeTab === 'notifications'">
        <h2>Notification Settings</h2>
        <!-- Umm, should this also have categories? -->
        <label>
          <input type="checkbox" v-model="emailNotifications" />
          Enable Email Notifications
        </label>
        <label>
          <input type="checkbox" v-model="pushNotifications" />
          Receive Email Notificatin 
        </label>
        <button @click="saveNotificationSettings">Save Notification Settings</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
data() {
    return {
        activeTab: 'account', 
        username: "", // ok, hardcoded for now
        email: "", // gotta add validation later
        password: "", // ahh, empty for now
        bio: "", // I should make this dynamic later
        profileVisibility: false, // by default, not private
        postVisibility: false, // ok, also public posts for now
        emailNotifications: true, // I like emails
        pushNotifications: true // and I like notifications
    }
},
methods: {
    updateAccount() {
        // TODO: Add actual validation here
        console.log("Updated account settings: ", this.username, this.email);
    },
    updateProfile() {
        console.log("Profile updated with bio: ", this.bio);
        // should I add profile picture saving here??
    },
    uploadProfilePicture(event) {
        const file = event.target.files[0];
        if (file) {
            console.log("Profile picture upload triggered!");
            // maybe add preview here? file.name?
        }
    },
    savePrivacySettings() {
        console.log("Privacy updated to:", this.profileVisibility, this.postVisibility);
    },
    saveNotificationSettings() {
        console.log("Notifications updated:", this.emailNotifications, this.pushNotifications);
    }
}
}
</script>

<style scoped>
/* Ok, time for some styles */
.settings-page {
padding: 20px;
font-family: Arial, sans-serif; /* classic, but gotta look nicer */
}

/* this is for the tabs */
.settings-tabs {
display: flex;
gap: 10px;
margin-bottom: 20px;
/* I think I can add hover effects?? */
}

/* tab buttons */
.settings-tabs button {
padding: 10px 20px;
background-color: #f0f0f0;
border: 1px solid #ddd;
/* corners are rounded. nice */
border-radius: 5px;
cursor: pointer;
transition: background-color 0.3s;
}

/* hmm, hover effect */
.settings-tabs button:hover {
background-color: #007bff;
color: white;
}

/* ok content box looks good */
.settings-content {
padding: 20px;
border: 1px solid #ddd;
border-radius: 5px;
background-color: #fff;
}

/* tried aligning labels */
form label {
display: block;
margin-bottom: 10px;
}

/* inputs and textareas */
form input,
form textarea {
width: 100%;
padding: 10px;
margin-top: 5px;
border: 1px solid #ccc;
/* let's round these corners too */
border-radius: 5px;
}

form button {
/* gotta style the save button */
margin-top: 10px;
padding: 10px 20px;
background-color: #007bff;
color: white;
border: none;
border-radius: 5px;
cursor: pointer;
}

form button:hover {
/* hover! */
background-color: #0056b3;
}
</style>
