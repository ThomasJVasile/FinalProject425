   <template>
    <div class="container">
      <div v-if="event" class="box">
        <h1>{{ event.eventName }}</h1>
        <p><strong>Owner:</strong> {{ ownerName }}</p>
        <p><strong>Date:</strong> {{ event.eventDate }}</p>
        <p><strong>Description:</strong> {{ event.eventDescription }}</p>
        <button class="join-button" @click="joinEvent">Join</button>
      </div>
      <div v-else>
        <h1>Loading... Please wait a moment</h1>
      </div>
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
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}
.box {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 80%;
  max-width: 500px;
}
h1 {
  margin-bottom: 15px;
  font-size: 24px;
}

p {
  margin: 5px 0;
  font-size: 18px;
}
  </style>
  