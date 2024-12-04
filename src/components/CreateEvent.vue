<template>
  <div class="create-event-container">
    <div class="form-wrapper">
      <h1>Create a New Event</h1>
      <form @submit.prevent="createEvent" v-if="isAuthenticated">
        <label for="title">Event Title:</label>
        <input type="text" v-model="eventTitle" id="title" class="input-field" required />

        <label for="date">Event Date:</label>
        <input type="date" v-model="eventDate" id="date" class="input-field" required />

        <!-- <label for="location">Event Location:</label>
        <input type="text" v-model="eventLocation" id="location" class="input-field" required /> -->

        <label for="description">Event Description:</label>
        <textarea v-model="eventDescription" id="description" class="textarea-field" required></textarea>

        <label for="image">Event Image:</label>
        <input type="file" @change="onFileChange" id="image" class="file-input" accept="image/*" />

        <button type="submit" class="submit-button">Create Event</button>
      </form>

      <p v-else class="auth-message">You must be logged in to create an event.</p>
      <p v-if="message" class="message">{{ message }}</p>
    </div>
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
      // eventLocation: "",
      eventDescription: "",
      eventImage: null,
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
      this.eventImage = event.target.files[0]; 
    },

    // this is not working and is not letting us create event with location on

    // !!!!!!


    // async GeoLocationAddress(address) {
    //   try {
    //     const response = await fetch(
    //       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    //         address
    //       )}&key=YOUR_API_KEY`
    //     );
    //     const data = await response.json();
    //     if (data.status === "OK") {
    //       const location = data.results[0].geometry.location;
    //       return {
    //         latitude: location.lat,
    //         longitude: location.lng,
    //       };
    //     } else {
    //       throw new Error("Geocoding failed: " + data.status);
    //     }
    //   } catch (error) {
    //     console.error("Error during geo-location: ", error);
    //     throw error;
    //   }
    // },

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
          const imageRef = storageRef(storage, `event-picture/${Date.now()}_${this.eventImage.name}`);
          const snapshot = await uploadBytes(imageRef, this.eventImage);
          imageUrl = await getDownloadURL(snapshot.ref);
        }

        // const getLocation = await this.GeoLocationAddress(this.eventLocation);

        const newEvent = {
          eventName: this.eventTitle,
          eventDate: this.eventDate,
          // eventLocation: this.eventLocation,
          eventDescription: this.eventDescription,
          // latitude: getLocation.latitude,
          // longitude: getLocation.longitude,
          createdBy: currentUser.uid,
          ownerName: `${userData.firstName} ${userData.lastName}`,
          imageUrl,
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
      // this.eventLocation = ""; 
      this.eventDescription = "";
      this.eventImage = null;
    },
  },
};
</script>

<style scoped>
.create-event-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  min-height: 100vh;
  padding: 20px;
}

.form-wrapper {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h1 {
  font-size: 24px;
  color: #333333;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555555;
  text-align: left;
}

.input-field,
.textarea-field,
.file-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 14px;
  color: #555555;
}

.textarea-field {
  height: 80px;
  resize: none;
}

.submit-button {
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #45a049;
}

.auth-message {
  color: #ff0000;
  margin-top: 20px;
}

.message {
  margin-top: 20px;
  font-size: 14px;
  color: #007bff;
}
</style>
