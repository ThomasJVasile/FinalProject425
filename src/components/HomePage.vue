<!-- 


<template>
  <div>
    <h1>Events</h1>
    <nav>
      <router-link to="/homepage">Home</router-link> |
      <router-link to="/log-in">Log In</router-link> |
      <router-link to="/create-event">Create Event</router-link>  
    </nav>
    <ul>
      <li v-for="event in events" :key="event.id">
        <strong>{{ event.eventName }}</strong> ({{ event.eventDate }}): {{ event.eventDescription }}
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from "@/firebase"; 
import { collection, getDocs, addDoc } from "firebase/firestore";

export default {
  data() {
    return {
      events: []
    };
  },
  async created() {
    // HardCode
    const testEvent = {
      eventName: "Hardcoded Test Event",
      eventDate: "2024-10-26",
      eventDescription: "This is a hardcoded test event.",
      createdBy: "Thomas"
    };

    // Add the hardcoded event to Firestore
    await addDoc(collection(db, "events"), testEvent);

    // Fetching
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      this.events.push({ id: doc.id, ...doc.data() });
    });
  }
};
</script>

<style scoped>
/* for style later*/
nav {
  margin-bottom: 20px;
}

router-link {
  margin-right: 10px;
}
</style> -->


<template>
  <div>
    <h1>Events</h1>
    <div class="event-list">
      <div 
        v-for="event in events" 
        :key="event.id" 
        class="event-card"
        @click="goToEventDetail(event.id)"
      >
        <img class="event-img" src="https://via.placeholder.com/100" alt="Event image" />
        <div class="event-info">
          <h2>{{ event.eventName }}</h2>
          <p>Owner: {{ event.createdBy }}</p>
          <p>{{ event.eventDescription }}</p>
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
    };
  },
  async created() {
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      this.events.push({ id: doc.id, ...doc.data() });
    });
  },
  methods: {
    goToEventDetail(id) {
      this.$router.push(`/eventDetailPage/${id}`);
    }
  }
};
</script>

<style scoped>
.event-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
</style>
