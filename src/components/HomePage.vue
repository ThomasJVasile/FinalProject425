<template>
  <v-container class="home-page" fluid>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="sidebar">
          <v-card-title>Filter by Location</v-card-title>
          <v-text-field v-model="locationQuery" label="Enter city or town" solo></v-text-field>
          <v-card-title>Categories</v-card-title>
          <v-list>
            <v-list-item v-for="category in categories" :key="category">
              <v-checkbox :label="category" />
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card class="content">
          <v-card-title>
            <v-text-field v-model="searchQuery" label="Search for events" solo></v-text-field>
          </v-card-title>

          <v-row>
            <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6" md="4">
              <v-card class="event-card" @click="goToEventDetail(event.id)">
                <v-img v-if="event.imageUrl" :src="event.imageUrl" height="200px"></v-img>
                <v-card-title>{{ event.eventName }}</v-card-title>
                <v-card-subtitle>
                  Owner: {{ event.ownerName || "Unknown Owner" }}
                </v-card-subtitle>
                <v-card-subtitle>
                  Location: {{ event.eventLocation || "location" }}
                </v-card-subtitle>

                <v-card-text>
                  <div>{{ event.eventDescription }}</div>
                  <div>People attending: {{ event.AttendanceCount }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      events: [],
      searchQuery: "",
      categories: [
        "Cars",
        "Sports",
        "Writing",
        "Learning",
        "Games",
        "Jobs",
        "Parties",
        "Crafts",
        "Dogs",
      ],
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
.home-page {
  background-color: #e6e6e6;
  padding: 20px;
}

.sidebar {
  padding: 20px;
}

.content {
  padding: 20px;
}

.event-card {
  cursor: pointer;
}

.event-card img {
  object-fit: cover;
  border-radius: 4px;
}

.v-card-title {
  font-size: 1.2rem;
  color: #000000;
}

.v-card-subtitle {
  font-size: 0.9rem;
  color: #000000;
}
</style>
