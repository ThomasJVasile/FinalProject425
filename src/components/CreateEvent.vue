<template>
    <div>
      <h1>Create an Event</h1>
      <form @submit.prevent="createEvent">
        <label for="event-name">Event Name:</label>
        <input type="text" v-model="eventName" id="event-name" required />
  
        <label for="event-date">Event Date:</label>
        <input type="date" v-model="eventDate" id="event-date" required />
  
        <label for="event-description">Event Description:</label>
        <textarea v-model="eventDescription" id="event-description"></textarea>
  
        <button type="submit">Create Event</button>
      </form>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";  
  import { collection, addDoc } from "firebase/firestore";
  
  export default {
    data() {
      return {
        eventName: '',
        eventDate: '',
        eventDescription: '',
      };
    },
    methods: {
      async createEvent() {
        try {
          const event = {
            eventName: this.eventName,
            eventDate: this.eventDate,
            eventDescription: this.eventDescription,
            createdBy: "Thomas",  // Hardcoded for now, THIS MUST GO THRUGH AUTH
          };
  
          // Add the event to Firestore
          await addDoc(collection(db, "events"), event);
  
          // Reset form after event creation
          this.eventName = '';
          this.eventDate = '';
          this.eventDescription = '';
          alert("Event created successfully!");
  
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* i have to change this late  */
  </style>
  