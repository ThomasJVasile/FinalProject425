<template>
  <v-container class="d-flex justify-center">
    <v-card v-if="event" class="pa-4" max-width="500">
      <v-card-title class="text-center">
        <h1>{{ event.eventName }}</h1>
      </v-card-title>

      <v-divider></v-divider>

      <v-row class="mt-4">
        <v-col cols="12" class="text-center">
          <p><strong>Owner:</strong></p>
          <v-avatar v-if="ownerAvatar" size="50">
            <img :src="ownerAvatar" alt="Avatar" style="object-fit: cover; width: 100%; height: 100%;" />
          </v-avatar>
          <p>{{ ownerName }}</p>
        </v-col>

        <v-col cols="12" class="text-center">
          <p><strong>Date:</strong> {{ event.eventDate }}</p>
          <p><strong>Description:</strong> {{ event.eventDescription }}</p>
        </v-col>

        <v-col cols="12" v-if="eventImageUrl" class="text-center">
          <v-img :src="eventImageUrl" alt="Event Image" max-width="100%" />
        </v-col>

        <v-col cols="12" v-else class="text-center">
          <p>No image available for this event.</p>
        </v-col>

        <v-col cols="12" class="text-center">
          <!-- Check if the event is restricted, display "Request to Join" if restricted is 1 -->
          <v-btn v-if="event.isRestricted === true" color="primary" @click="requestToJoin">Request to Join</v-btn>
          <!-- Otherwise, display "Join" button -->
          <v-btn v-else color="primary" @click="JoinEvent">Join</v-btn>
        </v-col>

        <v-col cols="12" v-if="message" class="text-center">
          <v-alert type="success" v-if="message" class="mt-4">{{ message }}</v-alert>
        </v-col>

        <v-col cols="12" v-if="isOwner" class="text-center mt-4">
          <v-btn color="red" @click="deleteEvent">Delete Event</v-btn>
        </v-col>

        <v-col cols="12" class="text-center mt-4">
          <google-map :center="{ lat: event.latitude, lng: event.longitude }" :zoom="15"
            style="height: 300px; width: 100%;">
            <Marker v-if="markerOptions" :options="markerOptions" />
          </google-map>
          <!-- <Marker v-if="markerOptions" :options="markerOptions" /> -->
        </v-col>
      </v-row>
    </v-card>

    <v-card v-else class="pa-4">
      <v-card-title class="text-center">
        <h1>Loading... Please wait a moment</h1>
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "@/firebase";
import { arrayUnion, doc, getDoc, updateDoc, deleteDoc, collection, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleMap, Marker } from "vue3-google-map";

export default {
  components: {
    GoogleMap,
    Marker,
  },

  data() {
    return {
      event: null,
      ownerName: "Loading...",
      ownerAvatar: null,
      message: "",
      eventImageUrl: null,
      isOwner: false,
      markerOptions: null,
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

        if (this.event.latitude && this.event.longitude) {
          this.markerOptions = {
            position: { lat: this.event.latitude, lng: this.event.longitude },
            title: this.event.eventName,
          };
          console.log("Step 3: Marker options set:", this.markerOptions);
        } else {
          console.warn("Step 4: No coordinates found for marker.");
        }

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
          console.log("Event Location:", this.event.latitude, this.event.longitude);
        } else {
          console.warn("Step 7: No event image specified in Firestore.");
          this.eventImageUrl = null;
        }
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

    async requestToJoin() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        this.message = "You must be logged in to request to join an event.";
        this.hideMessageAfterDelay();
        return;
      }

      try {
        console.log("Requesting to join event...");
        const eventId = this.$route.params.id;

        const requestDocRef = doc(collection(db, "RequestJoin"), `${currentUser.uid}_${eventId}`);

        await setDoc(requestDocRef, {
          RequestingUserUID: currentUser.uid,
          EventOwnerUID: this.event.createdBy,
          EventID: eventId,
          EventName: this.event.eventName,
          status: "pending",
          timestamp: new Date()
        });

        this.message = "Your request to join has been sent.";
        console.log("Join request submitted:", {
          RequestingUserUID: currentUser.uid,
          EventOwnerUID: this.event.createdBy,
          EventID: eventId,
        });
      } catch (error) {
        this.message = "Failed to send join request.";
        console.error("Error sending join request:", error);
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
.owner-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 1px solid #ccc;
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
</style>
