<template>
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
            <input type="checkbox" />
            Parties
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Crafts
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" />
            Dogs
          </label>
        </div>
      </aside>

      <div class="event-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search for event"
          class="search-bar"
        />

        <div class="event-list">
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="event-card"
            @click="goToEventDetail(event.id)"
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
              <p>Owner: {{ event.ownerName || "Unknown Owner" }}</p>
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
      return this.events.filter(
        (event) =>
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.ownerName || "").toLowerCase().includes(query)
      );
    },
  },

  async created() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      for (const doc of querySnapshot.docs) {
        const eventData = doc.data();
        const AttendanceCount = eventData.participants
          ? eventData.participants.length
          : 0;

        if (eventData.imageUrl) {
          console.log(`Fetching image for event ${eventData.eventName}`);
        } else {
          console.log(`No image URL for event: ${eventData.eventName}`);
        }

        this.events.push({
          id: doc.id,
          AttendanceCount,
          ...eventData,
        });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
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

.event-img-placeholder {
  width: 100px;
  height: 100px;
  background-color: #ddd;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #888;
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
</style>
