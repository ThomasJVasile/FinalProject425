<template>
  <div id="profile-page">
    <div class="profile-header">
      <!-- Section for the profile picture -->
      <div class="profile-picture">
        <label for="profile-upload">
          <!-- Displays the user's profile picture -->
          <img :src="profilePicture" alt="Profile Picture" />
        </label>
        <!-- File input to upload a new profile picture -->
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          @change="uploadProfilePicture"
        />
      </div>

      <!-- Section for the user's name -->
      <div class="profile-info">
        <!-- Displays the user's first and last name -->
        <h1>{{ firstName }} {{ lastName }}</h1>
      </div>
    </div>

    <!-- Navigation tabs section -->
    <div class="profile-tabs">
      <!-- Navigation tabs displayed as buttons -->
      <button @click="goToPage('HomePage')">Home</button> <!-- Home tab -->
      <button>Friends</button> <!-- Friends tab (no additional implementation yet) -->
      <button @click="$router.push('/events')">Events</button>
      <button>Events</button> <!-- Events tab (no additional implementation yet) -->
      <button>Photos</button> <!-- Photos tab (no additional implementation yet) -->
      <button>Settings</button> <!-- Settings tab (no additional implementation yet) -->
      <button>Timeline</button> <!-- Timeline tab (no additional implementation yet) -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      profilePicture: "placeholder-profile.png", // Default placeholder image
      firstName: "John", // First name of the user
      lastName: "Doe", // Last name of the user
    };
  },
  methods: {
    // Method to handle profile picture upload
    uploadProfilePicture(event) {
      const file = event.target.files[0]; // Get the selected file
      if (file) {
        const reader = new FileReader(); // Create a FileReader instance
        reader.onload = (e) => {
          this.profilePicture = e.target.result; // Update the profile picture with the uploaded image
        };
        reader.readAsDataURL(file); // Convert the file into a data URL for display
      }
    },
    // Navigates to the specified page
    goToPage(pageName) {
      this.$router.push({ name: pageName }); // Uses Vue Router to navigate to the page
    },
  },
};
</script>

<style scoped>
/* Styles for the overall profile page */
#profile-page {
  display: flex;
  flex-direction: column; /* Arrange items vertically */
  align-items: flex-start; /* Align items to the left */
  padding: 20px;
}

/* Header section containing profile picture and name */
.profile-header {
  display: flex;
  align-items: center;
  width: 100%; /* Full width */
}

/* Profile picture styling */
.profile-picture {
  position: relative;
}

.profile-picture img {
  width: 100px;
  height: 100px;
  border-radius: 50%; /* Makes the image circular */
  cursor: pointer; /* Changes cursor to pointer for clickable effect */
  border: 2px solid #007bff; /* Blue border around the picture */
}

.profile-picture input {
  display: none; /* Hide file input */
}

/* Profile name styling */
.profile-info {
  margin-left: 20px; /* Adds space between profile picture and name */
}

.profile-info h1 {
  font-size: 24px; /* Font size for the name */
  margin: 0;
  color: #333; /* Dark gray color for the text */
}

/* Styling for navigation tabs */
.profile-tabs {
  display: flex; /* Arrange tabs horizontally */
  justify-content: flex-start; /* Align tabs to the left */
  margin-top: 20px; /* Add spacing below the header */
  gap: 10px; /* Space between each tab */
}

.profile-tabs button {
  padding: 10px 20px; /* Add padding inside the buttons */
  background-color: #f0f0f0; /* Light gray background */
  border: 1px solid #ccc; /* Light border */
  border-radius: 5px; /* Rounded corners */
  cursor: pointer; /* Pointer cursor for interactivity */
}

.profile-tabs button:hover {
  background-color: #e0e0e0; /* Slightly darker gray on hover */
}
</style>
