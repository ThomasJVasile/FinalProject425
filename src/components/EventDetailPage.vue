   <template>
    <div class="container">
      <div v-if="event" class="box">
        <h1>{{ event.eventName }}</h1>
        <p><strong>Owner:</strong> {{ ownerName }}</p>
        <p><strong>Date:</strong> {{ event.eventDate }}</p>
        <p><strong>Description:</strong> {{ event.eventDescription }}</p>
        <button class="join-button" @click="JoinEvent">Join</button>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
      <div v-else>
        <h1>Loading... Please wait a moment</h1>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase";
  import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
  import { getAuth } from "firebase/auth";
  
  export default {
    data() {
      return {
        event: null,
        ownerName: "Loading...",
        message: "",
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
    methods: {
      hideMessageAfterDelay() {
        setTimeout(() => {
        this.message = ""; // make message go away
        }, 2000); // delay in milliseconds
      },


      async JoinEvent() {
        const auth = getAuth();
        const CurrentUser = auth.currentUser;
        if (!CurrentUser) { // if user not logged in
          this.message = "You must be logged in to join an event."
          this.hideMessageAfterDelay();
          return;
        }
        try {
          const userDoc = await getDoc(doc(db, "users", CurrentUser.uid));
          if (!userDoc.exists()) {
            this.message = "User information not found.";
            this.hideMessageAfterDelay();
            return;
          }
          const userData = userDoc.data();
          const username = userData.username;
          const eventId = this.$route.params.id;
          const eventRef = doc(db, "events", eventId);

          const eventDoc = await getDoc(eventRef);
          if (!eventDoc.exists()) {
            this.message = "Event not found.";
            this.hideMessageAfterDelay();
            return;
          }

          const eventData = eventDoc.data();
          if (eventData.participants && eventData.participants.includes(username)) {
            this.message = "You have already joined this event";
            this.hideMessageAfterDelay();
            return;
          }

          await updateDoc(eventRef, {
            participants: arrayUnion(username),
          });

          this.message = "You have joined the event";
          
        } catch (error) {
          this.message = "Failed to join event.";
          console.error("Error joining event", error);
        }
        this.hideMessageAfterDelay();
      },
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

.message {
  margin-top: 15px;
  color: green;
  font-size: 16px;
}

</style>
  