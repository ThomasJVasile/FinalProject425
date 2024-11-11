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

      <button type="submit">Create Event</button>
    </form>

    <p v-else>You must be logged in to create an event.</p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      eventTitle: "",
      eventDate: "",
      eventLocation: "",
      eventDescription: "",
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
        const newEvent = {
          eventName: this.eventTitle,
          eventDate: this.eventDate,
          eventLocation: this.eventLocation,
          eventDescription: this.eventDescription,
          createdBy: currentUser.uid,
          ownerName: `${userData.firstName} ${userData.lastName}`, // owner REAL name
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
