<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-5" max-width="500px" outlined>
      <v-card-title class="text-center">
        <v-typography variant="h5">Create a New Event</v-typography>
      </v-card-title>

      <v-form @submit.prevent="createEvent" v-if="isAuthenticated">
        <v-text-field
          v-model="eventTitle"
          label="Event Title"
          placeholder="Enter event title"
          outlined
          dense
          required
        />

        <v-text-field
          v-model="eventDate"
          label="Event Date"
          type="date"
          outlined
          dense
          required
        />

        <v-text-field
          v-model="eventLocation"
          label="Event Location"
          placeholder="Enter event location"
          outlined
          dense
          required
        />

        <v-textarea
          v-model="eventDescription"
          label="Event Description"
          placeholder="Write a brief description..."
          outlined
          dense
          required
        />

        <v-file-input
          v-model="eventImage"
          label="Event Image"
          accept="image/*"
          outlined
          dense
          @change="onFileChange"
        />

        <!-- Restriction Switch -->
        <v-switch
          v-model="isRestricted"
          label="Restricted Event"
          :color="isRestricted ? 'red' : 'green'"
          class="mt-2"
        />

        <v-btn type="submit" color="primary" block class="mt-4">Create Event</v-btn>
      </v-form>

      <p v-else class="auth-message text-center mt-3">You must be logged in to create an event.</p>
      <p v-if="message" class="message text-center mt-3">{{ message }}</p>
    </v-card>
  </v-container>
</template>

<script>
import { db, storage } from "@/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  data() {
    return {
      eventTitle: "",
      eventDate: "",
      eventLocation: "",
      eventDescription: "",
      eventImage: null,
      isRestricted: false, // Added isRestricted property
      message: "",
      isAuthenticated: false,
    };
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticated = !!user;
    });
  },
  methods: {
    async onFileChange(event) {
      this.eventImage = event.target.files[0];
      // Check if an image was selected
    if (this.eventImage) {
      // Check if the image contains inappropriate content using Google Vision API
      const isInappropriate = await this.checkImageInappropriateness(this.eventImage);
      
      if (isInappropriate) {
        this.message = "The image contains inappropriate content. Please upload a different image.";
        this.eventImage = null;  // Clear the invalid image
        return;
      }
      
      // Proceed with uploading the image if it's appropriate
      // (This is the current flow in your original code)
    }
  },

  async checkImageInappropriateness(image) {
    const apiKey = 'AIzaSyBRGMfXTlwVqjSZQrmn0fioEsyIpUFLefA';  // Use your API key here
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
    // Convert the image to Base64
    const reader = new FileReader();
    const imageBase64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    // Make a request to Google Cloud Vision API
    const requestBody = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'SAFE_SEARCH_DETECTION' }],
        },
      ],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      if (data.responses && data.responses[0].safeSearchAnnotation) {
        const safeSearch = data.responses[0].safeSearchAnnotation;
        // If any of the safe search labels is "LIKELY" or "VERY_LIKELY", we reject the image
        if (safeSearch.adult === 'LIKELY' || safeSearch.adult === 'VERY_LIKELY' || 
            safeSearch.violence === 'LIKELY' || safeSearch.violence === 'VERY_LIKELY') {
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking image:", error);
    }
    
    return false;  // Return false if no inappropriate content is detected
  },

     async GeoLocationAddress(address) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=AIzaSyDc9ouuqPa6pc_M1-8LC83LaIOq1AQBbok`
        );
        const data = await response.json();
        if (data.status === "OK") {
          const location = data.results[0].geometry.location;
          return {
            latitude: location.lat,
            longitude: location.lng,
          };
        } else {
          throw new Error("Geocoding failed: " + data.status);
        }
      } catch (error) {
        console.error("Error during geo-location: ", error);
        throw error;
      }
    },

    async createEvent() {
      if (!this.isAuthenticated) {
        this.message = "You must be logged in to create an event.";
        return;
      }

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (!userDoc.exists()) {
          throw new Error("User not found");
        }

        const userData = userDoc.data();
        let imageUrl = "";

        if (this.eventImage) {
          const imageRef = storageRef(
            storage,
            `event-picture/${Date.now()}_${this.eventImage.name}`
          );
          const snapshot = await uploadBytes(imageRef, this.eventImage);
          imageUrl = await getDownloadURL(snapshot.ref);
        }

        const getLocation = await this.GeoLocationAddress(this.eventLocation);

        const newEvent = {
          eventName: this.eventTitle,
          eventDate: this.eventDate,
          eventLocation: this.eventLocation,
          eventDescription: this.eventDescription,
          latitude: getLocation.latitude,
          longitude: getLocation.longitude,
          createdBy: currentUser.uid,
          ownerName: `${userData.firstName} ${userData.lastName}`,
          imageUrl,
          eventParticipants: [],
          isRestricted: this.isRestricted, // Save restriction status
          UserIDs: [],
        };

        await addDoc(collection(db, "events"), newEvent);
        this.message = "Event created successfully!";
        this.resetForm();
      } catch (error) {
        this.message = "Failed to create event. Try again.";
        console.error("Error creating event:", error);
      }
    },
    resetForm() {
      this.eventTitle = "";
      this.eventDate = "";
      this.eventLocation = "";
      this.eventDescription = "";
      this.eventImage = null;
      this.isRestricted = false; // Reset restriction status
    },
  },
};
</script>

<style scoped>
.blue-shadow {
  box-shadow: 0 4px 10px rgba(70, 88, 146, 0.4) !important;
  transition: box-shadow 0.3s ease-in-out;
}


.auth-message {
  color: #ff0000;
}

.message {
  margin-top: 20px;
  font-size: 14px;
  color: #007bff;
}
</style>

