<template>
  <v-container class="home-page" fluid>
    <v-row>
      <v-col cols="12" md="3" class="sidebar-col">
        <v-card class="sidebar blue-shadow" aria-label="Event filters">
          <v-card-title>Filter by Location</v-card-title>
          <v-text-field v-model="locationQuery" label="Enter city or town" solo aria-label="Enter a location to filter events"></v-text-field>
          <v-card-title>Categories</v-card-title>
          <v-list aria-label="Category filters"></v-list>
          <v-list>
            <v-list-item v-for="category in categories" :key="category">
              <v-checkbox :label="category" v-model="selectedCategories" :value="category" aria-labelledby="category"/>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card class="content blue-shadow">
          <v-card-title>
            <v-text-field v-model="searchQuery" label="Search for events" solo></v-text-field>
          </v-card-title>

          <v-btn-toggle v-model="dateFilter" class="mb-4" mandatory>
            <v-btn value="today">Today</v-btn>
            <v-btn value="thisWeek">This Week</v-btn>
            <v-btn value="nextWeek">Next Week</v-btn>
          </v-btn-toggle>

          <div class="map-container">
            <div id="map" style="height: 400px; width: 100%;"></div>
          </div>

         
          <div v-for="(categoryGroup, categoryName) in groupedEvents" :key="categoryName">
            <h3>{{ categoryName }}</h3>
            <v-slide-group show-arrows>
              <v-slide-item
                v-for="(event, index) in categoryGroup"
                :key="index"
              >

                <!-- <v-card class="mx-2 modern-card" max-width="220" @click="goToEventDetail(event.id)">
                  <v-img :src="event.imageUrl || ''" height="140px" class="rounded-t"></v-img>
                  <v-card-title class="text-wrap font-weight-bold text-primary">
                    {{ event.eventName }}
                  </v-card-title>
                  <v-card-subtitle class="text-caption">
                    <i class="fas fa-user"></i> {{ event.ownerName || 'Unknown' }}
                  </v-card-subtitle>
                  <v-card-text class="text-caption">
                    <div><i class="fas fa-calendar"></i> {{ event.date.toDateString() }}</div>
                    <div v-if="event.eventLocation"><i class="fas fa-map-marker-alt"></i> {{ event.eventLocation }}</div>
                    <div><i class="fas fa-users"></i> {{ event.participants?.length || 0 }} attending</div>
                  </v-card-text>
                </v-card> -->

                
                <v-card class="mx-2 modern-card" max-width="220" max-height="320" @click="goToEventDetail(event.id)">
                  <v-img 
                    :src="event.imageUrl || ''" 
                    height="140px" 
                    class="rounded-t-lg"
                    cover
                  />
                  <v-card-title class="text-wrap font-weight-bold text-primary">
                    {{ event.eventName }}
                  </v-card-title>
                  <v-card-subtitle class="text-caption">
                    <i class="fas fa-user"></i> {{ event.ownerName || 'Unknown' }}
                  </v-card-subtitle>
                  <v-card-text class="text-caption">
                    <div><i class="fas fa-calendar"></i> {{ event.date.toDateString?.() || 'No Date' }}</div>
                    <div v-if="event.eventLocation"><i class="fas fa-map-marker-alt"></i> {{ event.eventLocation }}</div>
                    <div><i class="fas fa-users"></i> {{ event.participants?.length || 0 }} attending</div>
                  </v-card-text>
                </v-card>

              </v-slide-item>
            </v-slide-group>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { watch } from "vue";

/* global google */

export default {
  setup() {
    const dateFilter = ref(""); // empty means all future events

    const events = ref([]);
    const locationQuery = ref("");
    const searchQuery = ref("");
    const categories = ref([
      "Cars",
      "Sports",
      "Writing",
      "Learning",
      "Games",
      "Jobs",
      "Parties",
      "Crafts",
      "Dogs",
    ]);
    const selectedCategories = ref([]);


const groupedEvents = computed(() => {
  const groups = {};

  const now = new Date();
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const thisWeek = new Date();
  const endOfThisWeek = new Date(thisWeek);
  endOfThisWeek.setDate(thisWeek.getDate() + (7 - thisWeek.getDay()));

  const nextWeek = new Date(endOfThisWeek);
  const endOfNextWeek = new Date(nextWeek);
  endOfNextWeek.setDate(nextWeek.getDate() + 7);

  const query = searchQuery.value.toLowerCase();
  const location = locationQuery.value.toLowerCase();
  const selected = selectedCategories.value;
  const date = dateFilter.value;

  for (const event of events.value) {
    const eventDate = event.date ? new Date(event.date) : null;
    if (!eventDate || eventDate < now) continue;

    let dateMatch = true;
    if (date === "today") {
      dateMatch = eventDate >= startOfToday && eventDate <= endOfToday;
    } else if (date === "thisWeek") {
      dateMatch = eventDate <= endOfThisWeek;
    } else if (date === "nextWeek") {
      dateMatch = eventDate > endOfThisWeek && eventDate <= endOfNextWeek;
    }

    const matchesSearch =
      event.eventName?.toLowerCase().includes(query) ||
      event.ownerName?.toLowerCase().includes(query);

    const matchesLocation =
      !location || event.eventLocation?.toLowerCase().includes(location);

    const matchesCategory =
      selected.length === 0 || (event.categories && event.categories.some(cat => selected.includes(cat)));

    if (matchesSearch && matchesLocation && matchesCategory && dateMatch) {
      const cats = event.categories || ["Other"];
      for (const cat of cats) {
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(event);
      }
    }
  }

  return groups;
});





    const goToEventDetail = (id) => {
      window.location.href = `/eventDetailPage/${id}`;
    };
  

    const loadMapWithMarkers = () => {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 39.5, lng: -98.35 },
    zoom: 4,
  });

  for (const catEvents of Object.values(groupedEvents.value)) {
    for (const event of catEvents) {
      if (event.latitude && event.longitude) {
        const marker = new google.maps.Marker({
          position: {
            lat: event.latitude,
            lng: event.longitude,
          },
          map,
          title: event.eventName,
        });

        // const infoWindow = new google.maps.InfoWindow({
        //   content: `<strong>${event.eventName}</strong>`
        // });

        const infoWindow = new google.maps.InfoWindow({
          content: `<strong><a href="/eventDetailPage/${event.id}" style="text-decoration: none; color: #2b78e4;">${event.eventName}</a></strong>`
        });


        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }
    }
  }
};


const fetchEvents = async () => {
  const querySnapshot = await getDocs(collection(db, "events"));
  events.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: new Date(data.eventDate), // 🔥 Convert the string to a Date
    };
  });
  console.log("EVENTS REPEAT CHECK: ", events.value )
  if (window.google) {
    loadMapWithMarkers();
  } else {
    window.initMap = loadMapWithMarkers;
  }
};


    onMounted(fetchEvents);
    
    watch([groupedEvents], () => {
      if (window.google) {
        loadMapWithMarkers();
      }
    });


    return {
      events,
      locationQuery,
      searchQuery,
      categories,
      selectedCategories,
      groupedEvents,
      dateFilter, 
      goToEventDetail,
    };
  },
};
</script>

<style scoped>
.sidebar-col {
  max-width: 280px;
  min-width: 240px;
}

.home-page {
  padding: 16px;
}
.sidebar {
  padding: 16px;
}
.content {
  padding: 16px;
}
.blue-shadow {
  box-shadow: 0 2px 4px rgba(0, 0, 255, 0.2);
}
.map-container {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.modern-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  margin-bottom: 8px; /* small buffer to avoid clipping idk if it is too big */
}

.modern-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.rounded-t {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

</style>
