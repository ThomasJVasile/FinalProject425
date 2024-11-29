
<template>
  <div>
    <h1>Create a New Event</h1>
    <form @submit.prevent="createEvent" v-if="isAuthenticated">
      <label for="title">Event Title:</label>
      <input type="text" v-model="eventTitle" id="title" required />

      <label for="date">Event Date:</label>
      <input type="date" v-model="eventDate" id="date" required />

      <label for="location">Event Location:</label>
      <input type="text" v-model="eventLocation" id="location" required />

      <label for="description">Event Description:</label>
      <textarea v-model="eventDescription" id="description" required></textarea>

      <label for="image">Event Image:</label>
      <input type="file" @change="onFileChange" id="image" accept="image/*" />

      <button type="submit">Create Event</button>
    </form>

    <p v-else>You must be logged in to create an event.</p>
    <p v-if="message">{{ message }}</p>
  </div>
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
      eventImage: null, // New property for the image file
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
    onFileChange(event) {
      this.eventImage = event.target.files[0]; // Capture the selected file
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
        } 
        else {
          throw new Error("Geocoding failed: " + data.status);
        }

        } catch (error) {
          console.error("error during geo location: ", error);
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

        // Upload the image to Firebase Storage
        if (this.eventImage) {
          const imageRef = storageRef(storage, `event-picture/${Date.now()}_${this.eventImage.name}`); // Specify the path
          const snapshot = await uploadBytes(imageRef, this.eventImage);
          imageUrl = await getDownloadURL(snapshot.ref); // Get the image URL
        }


        const getLocation = await this.GeoLocationAddress(this.eventLocation);

        // Create the event object
        const newEvent = {
          eventName: this.eventTitle,
          eventDate: this.eventDate,
          eventLocation: this.eventLocation,
          eventDescription: this.eventDescription,
          latitude: getLocation.latitude,
          longitude: getLocation.longitude,
          createdBy: currentUser.uid,
          ownerName: `${userData.firstName} ${userData.lastName}`,
          imageUrl, // Save the image URL
          eventParticipants: [],
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
    },
  },
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  width: 300px;
}

input,
textarea {
  margin-bottom: 10px;
}
</style>
