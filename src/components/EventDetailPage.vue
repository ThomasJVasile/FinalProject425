
<template>
  <div class="container">
    <div v-if="event" class="box">
      <h1>{{ event.eventName }}</h1> 
      <div class="owner-info">
        <p><strong>Owner:</strong></p>
        <img
          v-if="ownerAvatar"
          :src="ownerAvatar"
          alt="Owner Avatar"
          class="owner-avatar"
        />
        <p> {{ ownerName }}</p>
      </div>

      <p><strong>Date:</strong> {{ event.eventDate }}</p>
      <p><strong>Description:</strong> {{ event.eventDescription }}</p>
      <div v-if="eventImageUrl">
        <img :src="eventImageUrl" alt="Event Image" style="max-width: 100%; height: auto; margin-top: 15px;" />
      </div>
      <div v-else>
        <p>No image available for this event.</p>
      </div>
      <button class="join-button" @click="JoinEvent">Join</button>
      <p v-if="message" class="message">{{ message }}</p>

      <!-- beefore demo match this button with join maybe so it looks better -->
      <div v-if="isOwner" style="margin-top: 20px;">
        <button class="delete-button" @click="deleteEvent">Delete Event</button>
      </div>
      <GoogleMap
        :center="{ lat: event.latitude, lng: event.longitude }"
        :zoom="15"
        style="width: 100%; height: 300px; margin-top: 15px;"
      >
      </GoogleMap>
    </div>
    <div v-else>
      <h1>Loading... Please wait a moment</h1>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { arrayUnion, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleMap } from "vue3-google-map";

export default {
  components: {
    GoogleMap,
  },
  
  data() {
    return {
      event: null,
      ownerName: "Loading...",
      ownerAvatar: null,
      message: "",
      eventImageUrl: null,
      isOwner: false, 
    };
  },
  async created() {
    const eventId = this.$route.params.id;
    try {
      console.log("Step 1: Fetching event details...");
      // Fetch event details
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (eventDoc.exists()) {
        this.event = eventDoc.data();
        console.log("Step 2: Event details fetched:", this.event);

        // Fetch owner details
        const ownerDoc = await getDoc(doc(db, "users", this.event.createdBy));
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data();
          this.ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
          this.ownerAvatar = ownerData.avatarUrl || ownerData.photoURL || null;
          console.log("Step 3: Owner details fetched:", this.ownerName, this.ownerAvatar);
        } else {
          console.error("Owner details not found.");
          this.ownerName = "Unknown User";
          this.ownerAvatar = null;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;
        this.isOwner = currentUser && currentUser.uid === this.event.createdBy;
        console.log("Step 4: Is user the owner?", this.isOwner);

        // Fetch event image URL
        if (this.event.imageUrl) {
          console.log("Step 5: Fetching event image URL...");
          this.eventImageUrl = this.event.imageUrl; 
          console.log("Step 6: Event image URL fetched:", this.eventImageUrl);
        } else {
          console.warn("Step 7: No event image specified in Firestore.");
          this.eventImageUrl = null; 
        }
        this.initializeMap(this.event.latitude, this.event.longitude);
      } else {
        console.error("No such event found!");
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  },
  methods: {
    hideMessageAfterDelay() {
      setTimeout(() => {
        this.message = ""; // Clear message
      }, 2000); // Delay in milliseconds
    },


    async JoinEvent() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        this.message = "You must be logged in to join an event.";
        this.hideMessageAfterDelay();
        return;
      }
      try {
        console.log("Joining event...");
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
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
          this.message = "You have already joined this event.";
          this.hideMessageAfterDelay();
          return;
        }

        await updateDoc(eventRef, {
          participants: arrayUnion(username),
        });

        this.message = "You have joined the event.";
        console.log("User joined event:", username);
      } catch (error) {
        this.message = "Failed to join event.";
        console.error("Error joining event:", error);
      }
      this.hideMessageAfterDelay();
    },
    async deleteEvent() {
      const confirmDelete = confirm("Are you sure you want to delete this event?");
      if (!confirmDelete) return;

      try {
        const eventId = this.$route.params.id;
        await deleteDoc(doc(db, "events", eventId));
        alert("Event deleted successfully.");
        this.$router.push("/homepage"); 
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete the event.");
      }
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
.delete-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s ease;
}
.delete-button:hover {
  background-color: #e60000;
}

.owner-info {
  display: flex;
  align-items: center;
  justify-content: center; 
  margin-bottom: 15px;
  text-align: center; 
}
.owner-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 1px solid #ccc;
}


* {
  font-family: Arial, sans-serif;
}

</style>
