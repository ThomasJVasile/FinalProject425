
<template>
  <div>
    <v-container v-if="event" class="event-container d-flex justify-center">
      <v-row class="pa-6" style="width: 100%; max-width: 1200px;">
        <!-- Left Side -->
        <v-col cols="12" md="8">
          <v-card class="pa-4 mb-4" outlined>
            <div class="d-flex align-center mb-3">
              <v-avatar v-if="ownerAvatar" size="50" class="mr-3">
                <img :src="ownerAvatar" alt="Avatar" class="avatar-img" />
              </v-avatar>
              <div>
                <p class="mb-0">
                  <router-link :to="`/profile/${event.createdBy}`" style="text-decoration: none; color: #1976d2; font-weight: bold;">
                    {{ ownerName }}
                  </router-link>
                </p>
              </div>
            </div>

            <h1 class="text-h5 font-weight-bold mb-2">{{ event.eventName }}</h1>
            <p class="mb-4">{{ event.eventDescription }}</p>
            <v-img :src="eventImageUrl || ''" class="event-image mb-4" cover height="300px" />
            <!-- <p>{{ event.eventDate }}</p>
            <p>{{ event.eventLocation }}</p> -->
            <div class="event-meta">
              <span>📅 {{ event.eventDate }}</span>
              <span>📍 {{ event.eventLocation }}</span>
            </div>

          </v-card>
        </v-col>

        <!-- Right Side -->
        <v-col cols="12" md="4">
          <v-card class="pa-4 mb-4" outlined>
            <v-btn v-if="!isOwner" color="primary" block class="mb-3" @click="event.isRestricted ? requestToJoin() : JoinEvent()">
              {{ event.isRestricted ? 'Request to Join' : 'Join' }}
            </v-btn>

            <v-alert v-if="message" type="success" class="mb-3">{{ message }}</v-alert>

            <v-btn v-if="isOwner" color="red" block class="mb-3" @click="deleteEvent">Delete Event</v-btn>

            <google-map :center="{ lat: event.latitude, lng: event.longitude }" :zoom="15" class="map-container">
              <Marker v-if="markerOptions" :options="markerOptions" />
            </google-map>
          </v-card>

          <!-- Comments Section -->
          <v-card class="pa-4" outlined>
            <h3 class="mb-3">Comments</h3>
            <v-textarea v-model="newComment" label="Write a comment..." auto-grow outlined class="mb-2" />
            <v-btn color="primary" block class="mb-4" @click="submitComment">Post Comment</v-btn>

            <div v-if="comments.length === 0" class="text-caption text-center mb-2">No comments yet. Be the first to ask something!</div>
            <v-list two-line v-else>
              <v-list-item v-for="(comment, index) in comments" :key="index">
                <!-- <v-list-item-content>
                  <router-link :to="`/profile/${comment.uid}`" style="text-decoration: none; color: #1976d2; font-weight: bold;">
                    {{ comment.username }}
                  </router-link>
                  <v-list-item-subtitle>{{ comment.text }}</v-list-item-subtitle>
                </v-list-item-content> -->

                <v-list-item-content>
                  <p>
                    <router-link :to="`/profile/${comment.uid}`" style="text-decoration: none; color: #1976d2; font-weight: bold;">
                      {{ comment.username }}
                    </router-link>: {{ comment.text }}
                  </p>
                </v-list-item-content>

              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else class="d-flex justify-center align-center" style="height: 80vh;">
      <v-card class="pa-6" outlined>
        <v-card-title class="text-center">Loading... Please wait</v-card-title>
      </v-card>
    </v-container>
  </div>
</template>

<!-- Leave <script> and <style> untouched -->




<script>
import { db } from "@/firebase";
import { arrayUnion, doc, getDoc, getDocs, updateDoc, deleteDoc, collection, setDoc } from "firebase/firestore";
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
      comments: [],
      newComment: "",

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
    await this.fetchComments();

  },
  methods: {
    async submitComment() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        this.message = "You must be logged in to post a comment.";
        this.hideMessageAfterDelay();
        return;
      }

      if (!this.newComment.trim()) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const username = userDoc.exists() ? userDoc.data().username : "Anonymous";

        const eventId = this.$route.params.id;
        const commentRef = doc(collection(db, "events", eventId, "comments"));

        await setDoc(commentRef, {
          uid: currentUser.uid,
          username,
          text: this.newComment.trim(),
          timestamp: new Date(),
        });

        this.newComment = "";
        this.fetchComments(); // reload comments after posting
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    },

    async fetchComments() {
      const eventId = this.$route.params.id;
      const commentsSnapshot = await getDocs(collection(db, "events", eventId, "comments"));

      this.comments = commentsSnapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => b.timestamp - a.timestamp); // newest first
    },

    //comments ^^^



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
          UserIDs: arrayUnion(currentUser.uid),
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

        // Fetch user data to get the username
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) {
          this.message = "User information not found.";
          this.hideMessageAfterDelay();
          return;
        }

        const userData = userDoc.data();
        const username = userData.username || "Unknown User";

        const requestDocRef = doc(collection(db, "RequestJoin"), `${currentUser.uid}_${eventId}`);

        await setDoc(requestDocRef, {
          RequestingUserUID: currentUser.uid,
          RequestingUsername: username, // Added username
          EventOwnerUID: this.event.createdBy,
          EventID: eventId,
          EventName: this.event.eventName,
          status: "pending",
          timestamp: new Date(),
        });

        this.message = "Your request to join has been sent.";
        console.log("Join request submitted:", {
          RequestingUserUID: currentUser.uid,
          RequestingUsername: username, // Logging the username
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

/* demo to make it look bigger  */
.event-container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.v-card {
  width: 100%;
  max-width: 900px;
}

.avatar-img {
  object-fit: cover;
  width: 80px !important;
  height: 80px !important;
  border-radius: 50%;
  margin-bottom: 10px;
}

.event-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  margin-top: 15px;
}

.map-container {
  width: 100%;
  height: 350px !important;
  margin-top: 20px;
}

.map {
  width: 100%;
  height: 100%;
}

.event-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 16px;
  color: #555;
  margin-top: 8px;
}

</style>
