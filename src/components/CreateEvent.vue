<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-5" max-width="500px" outlined>
      <v-card-title class="text-center">
        <v-typography variant="h5">Create a New Event</v-typography>
      </v-card-title>

      <v-form @submit.prevent="createEvent" v-if="isAuthenticated">
        <v-text-field v-model="eventTitle" label="Event Title" placeholder="Enter event title" outlined dense
          required />
        <v-text-field v-model="eventDate" label="Event Date" type="date" outlined dense required />
        <v-text-field v-model="eventLocation" label="Event Location" placeholder="Enter event location" outlined dense
          required />

        <v-select v-model="selectedCategories" :items="eventCategories" label="Select Categories" outlined dense
          multiple required></v-select>

        <v-textarea v-model="eventDescription" label="Event Description" placeholder="Write a brief description..."
          outlined dense required />
        <v-file-input v-model="eventImage" label="Event Image" accept="image/*" outlined dense @change="onFileChange" />
        <!-- Restriction Switch -->
        <v-switch v-model="isRestricted" label="Restricted Event" :color="isRestricted ? 'red' : 'green'"
          class="mt-2" />

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
import { moderateImage } from "@/utils/imageModeration";
import { moderateContent } from "@/utils/contentModeration";


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
      eventCategories: [
        "Cars",
        "Sports",
        "Writing",
        "Learning",
        "Games",
        "Jobs",
        "Parties",
        "Crafts",
        "Dogs",],
      isAuthenticated: false,
      selectedCategories: [],
    };
  },
  created() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticated = !!user;
    });
    // this.runTest()
  },
  methods: {
    async onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const isSafe = await moderateImage(file);
      if (!isSafe) {
        this.message = "This image is inappropriate and cannot be uploaded.";
        this.eventImage = null;
        return;
      }

      this.eventImage = file;
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
      //   const isSafe = await moderateContent(this.eventDescription);
      //   if (!isSafe) {
      //     this.message = "Your event description contains inappropriate content.";
      //     return;
      // }

      //if i say this.moderateContent.... i get a warning 

      // Check if the event title is appropriate
      const isTitleSafe = await moderateContent(this.eventTitle);
      if (!isTitleSafe) {
        this.message = "Your event title contains inappropriate content.";
        return;
      }

      // Check if the event description is appropriate
      const isDescriptionSafe = await moderateContent(this.eventDescription);
      if (!isDescriptionSafe) {
        this.message = "Your event description contains inappropriate content.";
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
          categories: this.selectedCategories,
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
    // runTest() {
    //   console.log("Running unit test for GeoLocationAddress...");
    //   global.fetch = async function (url) {
    //     if (url.includes("San Francisco")) {
    //       return {
    //         json: async () => ({
    //           status: "OK",  // Valid status indicating the geocoding request was successful
    //           results: [{}]  // Just an empty object to simulate that there is a result
    //         })
    //       };
    //     } else if (url.includes("Non-existent Location")) {
    //       return {
    //         json: async () => ({
    //           status: "ZERO_RESULTS",  // Status indicating no results were found
    //           results: []  // No re
    //         })
    //       };
    //     }
    //   };
    //   this.GeoLocationAddress("San Francisco, CA").then(result => {
    //     console.log("Test passed for valid address:", result);
    //   }).catch(error => {
    //     console.error("Test failed for valid address:", error);
    //   });

    //   this.GeoLocationAddress("Non-existent Location").then(result => {
    //     console.log("Test passed for invalid address:", result);
    //   }).catch(error => {
    //     console.error("Test failed for invalid address:", error.message);
    //   });
    // },
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
