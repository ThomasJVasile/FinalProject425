<!-- <template>
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
import { db } from "@/firebase";  // Firebase initialization
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      events: []
    };
  },
  async created() {
    // Fetch ing 
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      this.events.push({ id: doc.id, ...doc.data() });
    });
  }
};
</script>

<style scoped>
/* change later */
</style> -->


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
/* Acheck later */
</style>
