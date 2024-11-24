<!-- 
<template>
  <div>
    <h1>Events</h1>
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
   // const testEvent = {
    //  eventName: "Hardcoded Test Event",
     // eventDate: "2024-10-26",
    //  eventDescription: "This is a hardcoded test event.",
    //  createdBy: "Thomas"
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
/* Acheck later */
</style> -->


<template>
  <div>
    <h1>Events</h1>
    <nav>
      <router-link to="/homepage">Home</router-link> |
      <router-link to="/log-in">Log In</router-link> |
      <router-link to="/create-event">Create Event</router-link>  <!-- Add Create Event button -->
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
   //   eventName: "Hardcoded Test Event",
    //  eventDate: "2024-10-26",
    //  eventDescription: "This is a hardcoded test event.",
    //  createdBy: "Thomas"
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
</style>
