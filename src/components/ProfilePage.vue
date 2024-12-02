<template>
  <div>
    <!-- Profile Header -->
    <div class="profile-header">
      <!-- Displaying the profile picture with an option to change it -->
      <img :src="user.photoURL || 'https://via.placeholder.com/150'" alt="Profile Picture" class="profile-picture" />
      <div class="user-details">
        <h1>{{ user.displayName || 'No Name Provided' }}</h1> <!-- Exact name from Firebase Auth -->
        <!-- Allow users to upload a new profile picture -->
        <input type="file" @change="handleProfilePictureChange" />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="createEventModal = true">Create Event</button>
      <button @click="updateStatusModal = true">Update Status</button>
    </div>

    <!-- Create Event Modal -->
    <div v-if="createEventModal" class="modal">
      <div class="modal-content">
        <h2>Create Event</h2>
        <input v-model="newEvent.title" type="text" placeholder="Event Title" />
        <textarea v-model="newEvent.description" placeholder="Event Description"></textarea>
        <input type="date" v-model="newEvent.date" />
        <button @click="createEvent">Create</button>
        <button @click="createEventModal = false">Cancel</button>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="updateStatusModal" class="modal">
      <div class="modal-content">
        <h2>Update Status</h2>
        <textarea v-model="newStatus.note" placeholder="Write your note about the host..."></textarea>
        <input type="file" @change="handleFileChange" />
        <button @click="updateStatus">Post Status</button>
        <button @click="updateStatusModal = false">Cancel</button>
      </div>
    </div>

    <!-- Events Section (Only show if events exist) -->
    <div v-if="events.length > 0" class="user-events">
      <button @click="showEvents = !showEvents">{{ showEvents ? 'Hide Events' : 'Show Events' }}</button>
      <div v-if="showEvents">
        <ul>
          <li v-for="event in events" :key="event.id">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <p>{{ event.date }}</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Display Status Updates -->
    <div v-if="statusUpdates.length > 0" class="user-status">
      <h2>Your Status Updates</h2>
      <ul>
        <li v-for="status in statusUpdates" :key="status.id">
          <p>{{ status.note }}</p>
          <img v-if="status.imageURL" :src="status.imageURL" alt="Status Image" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { db, storage } from "@/firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default {
  name: "ProfilePage",
  data() {
    return {
      user: {
        displayName: "",
        email: "",
        photoURL: "",
      },
      events: [],
      statusUpdates: [],
      newEvent: {
        title: "",
        description: "",
        date: "",
      },
      newStatus: {
        note: "",
        image: null,
        imageURL: null,
      },
      createEventModal: false,
      updateStatusModal: false,
      showEvents: false,
    };
  },
  methods: {
    async fetchUserData() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        this.user.displayName = user.displayName || "No Name Provided";
        this.user.email = user.email || "No email available";
        this.user.photoURL = user.photoURL || "https://via.placeholder.com/150";

        const eventsSnapshot = await getDocs(collection(db, "events"));
        this.events = eventsSnapshot.docs.map(doc => doc.data());

        const statusSnapshot = await getDocs(collection(db, "statusUpdates"));
        this.statusUpdates = statusSnapshot.docs.map(doc => doc.data());
      }
    },
    async handleProfilePictureChange(event) {
      const file = event.target.files[0];
      if (file) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          try {
            // Upload the file to Firebase Storage
            const storageRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Wait for the upload to finish
            await uploadTask;
            const photoURL = await getDownloadURL(storageRef);

            // Update the user's photoURL in Firebase Authentication
            await updateDoc(doc(db, "users", user.uid), {
              photoURL: photoURL,
            });

            // Update the local user data
            this.user.photoURL = photoURL;
          } catch (error) {
            console.error("Error uploading profile picture: ", error);
          }
        }
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newStatus.image = file;
      }
    },
    async createEvent() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && this.newEvent.title && this.newEvent.description) {
        try {
          await addDoc(collection(db, "events"), {
            userId: user.uid,
            title: this.newEvent.title,
            description: this.newEvent.description,
            date: this.newEvent.date,
            createdAt: new Date(),
          });
          this.createEventModal = false;
          this.fetchUserData();
        } catch (error) {
          console.error("Error creating event: ", error);
        }
      }
    },
    async updateStatus() {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && this.newStatus.note) {
        try {
          let imageURL = null;
          if (this.newStatus.image) {
            const storageRef = ref(storage, `statusUpdates/${user.uid}/${Date.now()}_${this.newStatus.image.name}`);
            const uploadTask = uploadBytesResumable(storageRef, this.newStatus.image);

            await uploadTask;
            imageURL = await getDownloadURL(storageRef);
          }

          await addDoc(collection(db, "statusUpdates"), {
            userId: user.uid,
            note: this.newStatus.note,
            imageURL: imageURL,
            createdAt: new Date(),
          });
          this.updateStatusModal = false;
          this.fetchUserData();
        } catch (error) {
          console.error("Error updating status: ", error);
        }
      }
    },
  },
  mounted() {
    this.fetchUserData();
  },
};
</script>

<style scoped>
/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 80%;
}

textarea,
input {
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
}

button {
  margin: 10px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #3e9e74;
}

/* Profile and Event Styles */
.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
}

.profile-picture {
  border-radius: 50%;
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.user-details h1 {
  font-size: 1.5rem;
  margin: 0;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

.user-events,
.user-status {
  margin-top: 30px;
}

.user-events h2,
.user-status h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.user-events ul,
.user-status ul {
  list-style: none;
  padding-left: 0;
}

.user-events li,
.user-status li {
  background-color: #f4f4f4;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

img {
  max-width: 100%;
  height: auto;
}
</style>
