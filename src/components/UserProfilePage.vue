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
          @change="uploadProfilePicture"
        />
      </div>

      <!-- User Name Section -->
      <div class="profile-info">
        <!-- Displays the user's first and last name -->
        <h1>{{ firstName }} {{ lastName }}</h1>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="profile-tabs">

      <button>
    <i class="fa fa-users"></i> Friends
    </button>

    <button @click="goToPage('EventsPage')">
    <i class="fa fa-calendar"></i> Events
    </button>
        
        <button>
  <i class="fa fa-image"></i> Photos
</button>

  <button>
  <i class="fa fa-cog"></i> Settings
</button>
<button>
  <i class="fa fa-clock"></i> Timeline
</button>
      <!-- Navigation tabs displayed as buttons -->
      
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      profilePicture: "placeholder-profile.png", // Default placeholder image for the profile picture
      firstName: "Lalise", // User's first name
      lastName: "Gizaw", // User's last name
    };
  },
  methods: {
    // Handles uploading a new profile picture
    uploadProfilePicture(event) {
      const file = event.target.files[0]; // Get the selected file
      if (file) {
        const reader = new FileReader(); // Create a FileReader instance
        reader.onload = (e) => {
          this.profilePicture = e.target.result; // Update the profile picture with the uploaded image
        };
        reader.readAsDataURL(file); // Convert the file into a Data URL for display
      }
    },
    // Navigates to the specified page
    goToPage(pageName) {
      this.$router.push({ name: pageName }); // Uses Vue Router to navigate to the specified page
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
  border: 2px solid #007bff; /* Blue border around the picture */
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
  background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black background */
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

#profile-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(120deg, #eb64c2, #ffffff); /* Background gradient */
  border-radius: 8px; /* Rounded corners for the card */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for a card effect */
}

.profile-picture img {
  transition: transform 0.3s, box-shadow 0.3s; /* Smooth transition for hover effects */
}




</style>
