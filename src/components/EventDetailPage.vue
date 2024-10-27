   <template>
    <div v-if="event">
      <h1>{{ event.eventName }}</h1>
      <p><strong>Owner:</strong> {{ event.createdBy }}</p>
      <p><strong>Date:</strong> {{ event.eventDate }}</p>
      <p><strong>Description:</strong> {{ event.eventDescription }}</p>
    </div>
    <div v-else>
      <h1>Loading... PLZ w8 a sec</h1> 
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";
  import { doc, getDoc } from "firebase/firestore";
  
  export default {
    data() {
      return {
        event: null,  
      };
    },
    async created() {
      const eventId = this.$route.params.id;  // here i get id
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          this.event = eventDoc.data();
        } else {
          console.log("No such event!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    }
  };
  </script>
  
  <style scoped>
  /* later */
  </style>
  