<!-- <template>
  <div class="events-page">
    <h1>Events</h1>
    <div class="events-container">
      <aside class="filters">
      <h3>Filters</h3>
        <div>
          <label>
            <input type="checkbox" />
            Cars
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Sports
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Writing
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Learning
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Games
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Jobs
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox"/>
            Parties
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox"/>
            Crafts
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox"/>
            Dogs
          </label>
        </div>
    </aside>
    
    <div class="main-content">

    </div>

    <div class="main-content">
      
    </div>

    <div class="event-container">
      <input 
        type="text"
        v-model="searchQuery"
        placeholder="Search for event"
        class="search-bar"/>

      <div class="event-list">
      <div 
        v-for="event in filteredEvents" 
        :key="event.id" 
        class="event-card"
        @click="goToEventDetail(event.id)"
      >
        <img class="event-img" src="https://via.placeholder.com/100" alt="Event image" />
        <div class="event-info">
          <h2>{{ event.eventName }}</h2>
          <p>Owner: {{ event.ownerName || 'Unknown Owner' }}</p>
          <p>{{ event.eventDescription }}</p>
          <p>People attending: {{ event.AttendanceCount }}</p>
        </div>
      </div>
    </div>
    </div>

    </div>
    
  </div>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      events: [],
      searchQuery: "",
    };
  },
  computed: {
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.events.filter((event) =>
        (event.eventName || "").toLowerCase().includes(query) ||
        (event.ownerName || "").toLowerCase().includes(query)
    );
    },
  },

  async created() {
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      const eventData = doc.data();
      const AttendanceCount = eventData.participants ? eventData.participants.length: 0;
      this.events.push({ id: doc.id, AttendanceCount, ...eventData });
    });
  },
  methods: {
    goToEventDetail(id) {
      this.$router.push(`/eventDetailPage/${id}`);
    },
  },
};
</script>

<style scoped>

.events-page {
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  min-height: 100vh; 
  padding: 20px;
  box-sizing: border-box; 
  background-color: #f3f3f3; 
}


.event-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #000000;
  border-radius: 8px;
  padding: 10px;
  transition: box-shadow 0.2s ease;
  gap: 20px;
  max-height: 63vh;
  overflow-y: auto;
}

.events-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  left: 20%;
}

.filters {
  width: 200px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.event-card {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.event-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.event-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
}

.event-info {
  margin-left: 20px;
}

.event-info h2 {
  margin: 0;
  font-size: 1.5rem;
}

.event-info p {
  margin: 5px 0;
  color: #555;
}

.event-info p:last-child {
  font-weight: bold;
  color: #333;
}

</style> -->

<template>
  <div class="container">
    <div v-if="event" class="box">
      <h1>{{ event.eventName }}</h1>
      <p><strong>Owner:</strong> {{ ownerName }}</p>
      <p><strong>Date:</strong> {{ event.eventDate }}</p>
      <p><strong>Description:</strong> {{ event.eventDescription }}</p>
      <div v-if="eventImageUrl">
        <img :src="eventImageUrl" alt="Event Image" style="max-width: 100%; height: auto; margin-top: 15px;" />
      </div>
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
      eventImageUrl: null,
    };
  },
  async created() {
    const eventId = this.$route.params.id;
    try {
      console.log("Fetching event details...");
      // Fetch event details
      const eventDoc = await getDoc(doc(db, "events", eventId));
      if (eventDoc.exists()) {
        this.event = eventDoc.data();
        console.log("Event details fetched:", this.event);

        // Fetch owner details
        const ownerDoc = await getDoc(doc(db, "users", this.event.createdBy));
        if (ownerDoc.exists()) {
          const ownerData = ownerDoc.data();
          this.ownerName = `${ownerData.firstName} ${ownerData.lastName}`;
          console.log("Owner details fetched:", this.ownerName);
        } else {
          console.error("Owner details not found.");
          this.ownerName = "Unknown User";
        }

        // Fetch event image URL
        if (this.event.imageUrl) {
          console.log("Fetching event image URL...");
          this.eventImageUrl = this.event.imageUrl;
          console.log("Event image URL fetched from Firestore:", this.eventImageUrl);
        } else {
          console.log("No event image specified. Using hardcoded URL for debugging.");
          this.eventImageUrl =
            "https://firebasestorage.googleapis.com/v0/b/get-together-b52a1.firebasestorage.app/o/event-picture%2F1731389095201_Screenshot%202024-03-27%20175159.png?alt=media&token=c0e6c572-88ab-4b16-a92b-df58d42377fe";
          console.log("Hardcoded event image URL:", this.eventImageUrl);
        }
      } else {
        console.error("No such event found!");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
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
