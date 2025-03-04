<!--This is a page to display what the user have created and joined -->
<template>
  <div class="events-page">
    <!-- Back Arrow -->
    <div class="back-arrow" @click="$router.push('/UserProfilePage')">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Profile</span>
    </div>

    <main class="content">
      <!-- Title -->
      <h1>My Events</h1>

      <!-- Event Type Tabs -->
      <div class="event-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'created' }]"
          @click="activeTab = 'created'"
        >
          <i class="fas fa-plus-circle"></i> Created Events
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'joined' }]"
          @click="activeTab = 'joined'"
        >
          <i class="fas fa-calendar-check"></i> Joined Events
        </button>
      </div>

      <!-- Search Bar -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events"
        class="search-bar"
      />

      <!-- List of Events -->
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
        <!-- No Events Message -->
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-times"></i>
          <p>{{ activeTab === 'created' ? 'You haven\'t created any events yet.' : 'You haven\'t joined any events yet.' }}</p>
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
      createdEvents: [], // List of events created by the user
      joinedEvents: [], // List of events joined by the user
      searchQuery: "", // Search query for filtering events
      activeTab: 'created', // Default tab
    };
  },
  computed: {
    // Returns the appropriate event list based on active tab
    currentEvents() {
      return this.activeTab === 'created' ? this.createdEvents : this.joinedEvents;
    },
    // Filters the events based on the search query
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.currentEvents.filter(
        (event) =>
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.eventDescription || "").toLowerCase().includes(query)
      );
    },
  },
  methods: {
    async fetchCreatedEvents(userUid) {
      try {
        const eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userUid)
        );
        const querySnapshot = await getDocs(eventsQuery);
        
        this.createdEvents = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            AttendanceCount: eventData.participants ? eventData.participants.length : 0,
            ...eventData,
          };
        });
      } catch (error) {
        console.error("Error fetching created events:", error);
      }
    },
    async fetchJoinedEvents(userUid) {
      try {
        const eventsQuery = query(
          collection(db, "events"),
          where("participants", "array-contains", userUid)
        );
        const querySnapshot = await getDocs(eventsQuery);
        
        this.joinedEvents = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            AttendanceCount: eventData.participants ? eventData.participants.length : 0,
            ...eventData,
          };
        });
      } catch (error) {
        console.error("Error fetching joined events:", error);
      }
    },
  },
  async created() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userUid = user.uid;
        await Promise.all([
          this.fetchCreatedEvents(userUid),
          this.fetchJoinedEvents(userUid)
        ]);
      } else {
        console.warn("No authenticated user found.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

.event-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: white;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button.active {
  background: #007bff;
  color: white;
}

.tab-button:hover:not(.active) {
  background: #f0f2f5;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.event-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-2px);
}

.event-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.event-img-placeholder {
  width: 100%;
  height: 150px;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #888;
}

.event-info {
  padding: 15px;
}

.event-info h2 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 10px 0;
}

.event-info p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.back-arrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.back-arrow:hover {
  color: #007bff;
}

.back-arrow i {
  font-size: 1.2rem;
}

.no-events {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.no-events i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.no-events p {
  margin: 0;
  font-size: 1rem;
}
</style>
