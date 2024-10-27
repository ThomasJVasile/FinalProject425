   <template>
    <div>
      <h1>Create a New Event</h1>
      <form @submit.prevent="createEvent">
        <label for="title">Event Title:</label>
        <input type="text" v-model="eventTitle" id="title" required />
  
        <label for="date">Event Date:</label>
        <input type="date" v-model="eventDate" id="date" required />
  
        <label for="description">Event Description:</label>
        <textarea v-model="eventDescription" id="description" required></textarea>
  
        <button type="submit">Create Event</button>
      </form>
  
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";  
  import { collection, addDoc } from "firebase/firestore";
  
  export default {
    data() {
      return {
        eventTitle: "",
        eventDate: "",
        eventDescription: "",
        message: ""
      };
    },
    methods: {
      async createEvent() {
        // Event object to store in Firestore
        const newEvent = {
          eventName: this.eventTitle,
          eventDate: this.eventDate,
          eventDescription: this.eventDescription,
          createdBy: "User"  //auth need
        };
  
        try {
          // Add event to Firestore
          await addDoc(collection(db, "events"), newEvent);
          this.message = "Event created successfully!";
          
          this.eventTitle = "";
          this.eventDate = "";
          this.eventDescription = "";
        } catch (error) {
          this.message = "Failed to create event. Try again.";
          console.error("Error creating event:", error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /*later */
  form {
    display: flex;
    flex-direction: column;
    width: 300px;
  }
  
  input, textarea {
    margin-bottom: 10px;
  }
  </style>
  