<!--This is a page to display what the user have created -->
<template>
  <div class="events-page">
    <main class="content">
      <!-- Title -->
      <h1>My Events</h1>

      <!-- Search Bar -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events"
        class="search-bar"
      />

      <!-- List of User-Created Events -->
      <div class="event-list">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
        >
          <img
            v-if="event.imageUrl"
            :src="event.imageUrl"
            class="event-img"
            alt="Event image"
          />
          <div v-else class="event-img-placeholder">No Image</div>
          <div class="event-info">
            <h2>{{ event.eventName }}</h2>
            <p>{{ event.eventDescription }}</p>
            <p>People attending: {{ event.AttendanceCount }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { db } from "@/firebase"; // Firebase Firestore instance
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore query methods
import { getAuth } from "firebase/auth"; // Firebase Authentication

export default {
  data() {
    return {
      events: [], // List of events created by the user
      searchQuery: "", // Search query for filtering events
    };
  },
  computed: {
    // Filters the events based on the search query
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.events.filter(
        (event) =>
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.eventDescription || "").toLowerCase().includes(query)
      );
    },
  },
  async created() {
    try {
      const auth = getAuth(); // Get Firebase Authentication instance
      const user = auth.currentUser; // Get the currently logged-in user

      if (user) {
        const userUid = user.uid; // Get the user's UID

        // Query Firestore for events created by the logged-in user
        const eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userUid) // Only fetch events where `createdBy` matches the user's UID
        );

        const querySnapshot = await getDocs(eventsQuery); // Execute the query

        // Process and store the events
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          const AttendanceCount = eventData.participants
            ? eventData.participants.length
            : 0;

          this.events.push({
            id: doc.id,
            AttendanceCount,
            ...eventData,
          });
        });
      } else {
        console.warn("No authenticated user found.");
      }
    } catch (error) {
      console.error("Error fetching user events:", error);
    }
  },
};
</script>

<style scoped>
* {
  font-family: Arial, sans-serif;
}

.events-page {
  padding: 20px;
  background-color: #f5f5f5;
}

.content {
  flex-grow: 1;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.event-card {
  cursor: default;
}

.event-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.event-img-placeholder {
  width: 100%;
  height: 150px;
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #888;
}

.event-info {
  margin-top: 10px;
}

.event-info h2 {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.event-info p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #555;
}
</style>
