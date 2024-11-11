   <template>
    <div v-if="event">
      <h1>{{ event.eventName }}</h1>
      <p><strong>Owner:</strong> {{ ownerName }}</p>
      <p><strong>Date:</strong> {{ event.eventDate }}</p>
      <p><strong>Description:</strong> {{ event.eventDescription }}</p>
    </div>
    <div v-else>
      <h1>Loading... Please wait a moment</h1>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";
  import { doc, getDoc } from "firebase/firestore";
  
  export default {
    data() {
      return {
        event: null,
        ownerName: "Loading...", 
      };
    },
    async created() {
      const eventId = this.$route.params.id; 
      try {
        // event details
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          this.event = eventDoc.data();
          //owner details
          const ownerDoc = await getDoc(doc(db, "users", this.event.createdBy));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            this.ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
          } else {
            console.log("Owner details not found.");
            this.ownerName = "Unknown User";
          }
        } else {
          console.log("No such event!");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    },
  };
  </script>
  
  <style scoped>
  /* CHANGE THIS BEFORE DEMO!!!!!!!!! */
  </style>
  