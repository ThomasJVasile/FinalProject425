<template>
  <v-container class="home-page" fluid>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="sidebar blue-shadow">

          <v-card-title>Filter by Location</v-card-title>
          <v-text-field v-model="locationQuery" label="Enter city or town" solo></v-text-field>
          <v-card-title>Categories</v-card-title>
          <v-list>
            <v-list-item v-for="category in categories" :key="category">
              <v-checkbox :label="category" v-model="selectedCategories" :value="category" class="custom-checkbox" />
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card class="content blue-shadow">

          <v-card-title>
            <v-text-field v-model="searchQuery" label="Search for events" solo></v-text-field>
          </v-card-title>


          <div class="scrollable-events">
            <v-row>
              <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6" md="4">
                <v-card class="event-card light-blue-shadow" @click="goToEventDetail(event.id)">
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
          </div>
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
      selectedCategories: [],
    };
  },
  computed: {
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.events.filter((event) => {
        const matchesSearchQuery =
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.ownerName || "").toLowerCase().includes(query);

        // const matchesLocationQuery =
        //   (this.locationQuery === "" || event.eventLocation?.toLowerCase().includes(this.locationQuery.toLowerCase()));

        const matchesCategory = this.selectedCategories.length === 0 ||
          (event.categories && event.categories.some(category => this.selectedCategories.includes(category)));

        // return matchesSearchQuery && matchesLocationQuery && matchesCategory;
        return matchesSearchQuery && matchesCategory;
      });

      // return this.events.filter(
      //   (event) =>
      //     (event.eventName || "").toLowerCase().includes(query) ||
      //     (event.ownerName || "").toLowerCase().includes(query)
      // );
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
/* .home-page {
  background-color: #e6e6e6;
  padding: 20px;
} */


.light-blue-shadow {
  box-shadow: 0 4px 10px rgba(86, 99, 139, 0.4) !important;
  transition: box-shadow 0.3s ease-in-out;
}

.blue-shadow {
  box-shadow: 0 4px 10px rgba(70, 88, 146, 0.4) !important;
  transition: box-shadow 0.3s ease-in-out;
}

/* Stronger blue shadow on focus */
.blue-input:focus-within {
  box-shadow: 0 6px 14px rgba(0, 0, 255, 0.6) !important;
}

.sidebar {
  padding: 20px;
  width: 350px;
}

.content {
  padding: 20px;
  width: 95%;
}

.event-card {
  white-space: normal;
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

.scrollable-events {
  max-height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}


/* Style the scrollbar itself */
.scrollable-events::-webkit-scrollbar {
  width: 10px;
  /* Set the width of the scrollbar */
}

/* Style the scrollbar track (the part the thumb moves within) */
.scrollable-events::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* Light gray track */
  border-radius: 5px;
}

/* Style the scrollbar thumb (the draggable part) */
.scrollable-events::-webkit-scrollbar-thumb {
  background: #2043b4;
  /* Darker gray thumb */
  border-radius: 5px;
}

/* Style the scrollbar thumb when hovered */
.scrollable-events::-webkit-scrollbar-thumb:hover {
  background: #1814e0;
  /* Even darker gray on hover */
}
</style>
