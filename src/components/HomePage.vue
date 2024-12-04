<template>
  <div class="home-page">
    <aside class="sidebar">
      <h3>Categories</h3>
      <ul>
        <li><input type="checkbox" /> Cars</li>
        <li><input type="checkbox" /> Sports</li>
        <li><input type="checkbox" /> Writing</li>
        <li><input type="checkbox" /> Learning</li>
        <li><input type="checkbox" /> Games</li>
        <li><input type="checkbox" /> Jobs</li>
        <li><input type="checkbox" /> Parties</li>
        <li><input type="checkbox" /> Crafts</li>
        <li><input type="checkbox" /> Dogs</li>
      </ul>
    </aside>

    <main class="content">
      <h1>Events</h1>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search for events"
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
    </main>
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
* {
  font-family: Arial, sans-serif;
}

.home-page {
  display: flex;
  padding: 20px;
  background-color: #f5f5f5;
  gap: 20px;
}

.sidebar {
  width: 250px;
}

.sidebar h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar ul li {
  margin: 5px 0;
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
  cursor: pointer;
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
