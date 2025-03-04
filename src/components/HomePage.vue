<template>
  <v-container class="home-page" fluid>
    <v-row>
      <v-col cols="12" md="3">
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


          <div class="scrollable-events">
            <v-row>
              <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6" md="4">
                <v-card class="event-card light-blue-shadow"
                tabindex="0"
                @keypress.enter="goToEventDetail(event.id)"
                @click="goToEventDetail(event.id)"
                @mouseover="speakEventDetails(event)"
                aria-label="Event details">
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
      isListening: false, // Tracks whether speech recognition is active
      recognition: null, // Store recognition instance
      isSpeaking : false,
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

  mounted() {
    // Add event listener when component is mounted
    window.addEventListener("keydown", this.handleKeyPress);
    window.addEventListener("keyup", this.handleKeyRelease);
  },

  beforeUnmount() {
    // Remove event listener to prevent memory leaks
    window.removeEventListener("keydown", this.handleKeyPress);
    window.removeEventListener("keyup", this.handleKeyRelease);
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
  methods:   
  {
    handleKeyPress(event) {
      if (event.key === "Shift") {
        this.toggleVoiceSearch();
      } else if (event.key === "`") {
        this.isSpeaking = !this.isSpeaking;
        // console.log("Shift key pressed - Speech enabled.");
        console.log("Text-to-speech toggled:", this.isSpeaking);
        if (!this.isSpeaking) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
      }
      }
    },

    handleKeyRelease(event) {
      if (event.key === "Shift") {
        // Stop text-to-speech when Shift is released
        //this.isSpeaking = false;
      }
    },


    toggleVoiceSearch() {
      if (this.isListening) {
        this.stopVoiceSearch();
      } else {
        this.startVoiceSearch();
      }
    },

    startVoiceSearch() {
      if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition.");
      return;
  }

    this.recognition = new window.webkitSpeechRecognition();
    this.recognition.lang = "en-US";
    this.recognition.continuous = true;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event) => {
      this.searchQuery = event.results[0][0].transcript;
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
    console.log("Voice search activated");
  },

    stopVoiceSearch() {
      if (this.recognition) {
        this.recognition.stop();
        this.isListening = false;
        console.log("Voice search deactivated");
      }
    },

    speakEventDetails(event) {
      if (!this.isSpeaking) {
        console.log("Skipping speech: Shift not held.");
        return;
  }

      const message = `
        Event: ${event.eventName}. 
        Owner: ${event.ownerName || "Unknown owner"}. 
        Location: ${event.eventLocation || "Not specified"}. 
        Description: ${event.eventDescription || "No description provided"}.
        Number of attendees: ${event.AttendanceCount}.
      `;

      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = "en-US";
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
},

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

.v-container {
  padding: 10px !important; 
}

.sidebar {
  padding: 10px;
  width: 250px;
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







<!-- 





<template>
  <v-container fluid class="px-2">
    <v-row>
      
      <v-col cols="12" sm="3" class="sidebar">
        <v-card class="blue-shadow" aria-label="Event filters">
          <v-card-title class="text-center">Filter by Location</v-card-title>
          <v-text-field v-model="locationQuery" label="Enter city or town" solo dense aria-label="Enter a location to filter events"></v-text-field>

          <v-card-title class="text-center">Categories</v-card-title>
          <v-list dense aria-label="Category filters">
            <v-list-item v-for="category in categories" :key="category">
              <v-checkbox v-model="selectedCategories" :label="category" :value="category" class="small-checkbox" />
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

     
      <v-col cols="12" sm="9">
        <v-text-field v-model="searchQuery" label="Search for events" solo dense class="mb-3"></v-text-field>
        <v-row dense>
          <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6" md="4">
            <v-card 
              class="event-card blue-shadow"
              tabindex="0"
              @click="goToEventDetail(event.id)"
              @keypress.enter="goToEventDetail(event.id)"
              @mouseover="speakEventDetails(event)"
              aria-label="Event details"
              style="cursor: pointer;"
            >
              <v-img v-if="event.imageUrl" :src="event.imageUrl" height="150px"></v-img>
              <v-card-title>{{ event.eventName }}</v-card-title>
              <v-card-subtitle>Owner: {{ event.ownerName || "Unknown Owner" }}</v-card-subtitle>
              <v-card-subtitle>Location: {{ event.eventLocation || "Location Unknown" }}</v-card-subtitle>
              <v-card-text>
                <div>{{ event.eventDescription }}</div>
                <div>People attending: {{ event.AttendanceCount }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
      searchQuery: "",
      locationQuery: "",
      selectedCategories: [],
      events: [],
      categories: ["Cars", "Sports", "Writing", "Learning", "Games", "Jobs", "Parties", "Crafts", "Dogs"],
    };
  },
  computed: {
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.events.filter((event) => {
        const matchesSearchQuery =
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.ownerName || "").toLowerCase().includes(query);

        const matchesCategory =
          this.selectedCategories.length === 0 ||
          (event.categories && event.categories.some((category) => this.selectedCategories.includes(category)));

        return matchesSearchQuery && matchesCategory;
      });
    },
  },
  async created() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      this.events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        AttendanceCount: doc.data().participants ? doc.data().participants.length : 0,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },
  methods: {
    goToEventDetail(id) {
      this.$router.push(`/eventDetailPage/${id}`);
    },
    speakEventDetails(event) {
      const message = `
        Event: ${event.eventName}. 
        Owner: ${event.ownerName || "Unknown owner"}. 
        Location: ${event.eventLocation || "Not specified"}. 
        Description: ${event.eventDescription || "No description provided"}.
        Number of attendees: ${event.AttendanceCount}.
      `;
      const speech = new SpeechSynthesisUtterance(message);
      speech.lang = "en-US";
      speech.rate = 1;
      window.speechSynthesis.speak(speech);
    },
  },
};
</script>

<style scoped>
.v-container {
  padding: 10px !important; 
}

.sidebar {
  width: 250px;
  padding: 5px;
}

/* Adjust event card size */
.event-card {
  padding: 10px !important;
  margin: 5px !important;
  width: 100%;
}

/* Reduce spacing between event cards */
.v-row {
  margin: 0 !important;
}

/* Make images responsive */
.v-img {
  object-fit: cover;
  height: 150px !important; /* Reduce image height */
}

/* Reduce event card title size */
.v-card-title {
  font-size: 1rem !important;
}

/* Reduce category checkbox size */
.v-list-item {
  padding: 1px 0 !important;
}
</style> -->
