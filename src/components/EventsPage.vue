
<template>
  <div class="events-page">
    
    <div class="back-arrow" @click="$router.push('/UserProfilePage')">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Profile</span>
    </div>

    <main class="content">
      
      <h1>My Events</h1>

      
      <div class="event-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'created' }]"
          @click="activeTab = 'created'"
        >
          <i class="fas fa-plus-circle"></i> Created Events
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'joined' }]"
          @click="activeTab = 'joined'"
        >
          <i class="fas fa-calendar-check"></i> Joined Events
        </button>
      </div>

      
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events"
        class="search-bar"
      />

    
      <div class="event-list">
        <!-- <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
        > -->
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
          @click="$router.push(`/eventDetailPage/${event.id}`)"
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
            <div class="event-creator">
              <router-link :to="'/profile/' + event.createdBy" class="creator-link">
                <i class="fas fa-user"></i>
                {{ event.ownerName || 'Anonymous' }}
              </router-link>
            </div>
            <p>{{ event.eventDescription }}</p>
            <p>People attending: {{ event.AttendanceCount }}</p>
            
            <!-- Comment out the reactions and comments sections -->
            <!--
            <div class="event-reactions">
              <button 
                class="reaction-btn" 
                :class="{ 'liked': isEventLiked(event.id) }"
                @click="toggleLike(event.id)"
              >
                <i class="fas" :class="isEventLiked(event.id) ? 'fa-heart' : 'fa-heart-o'"></i>
                <span>{{ event.likes?.length || 0 }}</span>
              </button>
              <button 
                class="reaction-btn"
                @click="showComments(event.id)"
              >
                <i class="fas fa-comment"></i>
                <span>{{ event.comments?.length || 0 }}</span>
              </button>
            </div>

            <div v-if="activeCommentEvent === event.id" class="comments-section">
              <div class="comments-list">
                <div v-for="comment in event.comments" :key="comment.id" class="comment">
                  <div class="comment-header">
                    <router-link :to="'/profile/' + comment.userId" class="user-link">
                      <strong>{{ comment.userName }}</strong>
                    </router-link>
                    <span class="comment-time">{{ formatTimestamp(comment.timestamp) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.text }}</p>
                </div>
              </div>
              <div class="comment-input">
                <input 
                  v-model="newComment"
                  placeholder="Write a comment..."
                  @keyup.enter="addComment(event.id)"
                />
                <button @click="addComment(event.id)">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
            -->

            
            <div v-if="activeTab === 'created'" class="event-actions">
              <!-- <v-btn
                color="primary"
                small
                @click="openEditDialog(event)"
                class="edit-button"
              >
                <i class="fas fa-edit"></i>
                Edit
              </v-btn> -->
              <v-btn
                color="primary"
                small
                @click.stop="openEditDialog(event)"
                class="edit-button"
              >
                <i class="fas fa-edit"></i>
                Edit
              </v-btn>

            </div>
          </div>
        </div>
        <!-- No Events Message - Shows when you haven't created/joined any events -->
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-times"></i>
          <p>{{ activeTab === 'created' ? 'You haven\'t created any events yet.' : 'You haven\'t joined any events yet.' }}</p>
        </div>
      </div>
    </main>

    <!-- Edit Event Dialog -->
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card v-if="selectedEvent">
        <v-card-title>
          <span class="text-h5">Edit Event</span>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="saveEventChanges">
            <v-text-field
              v-model="editedEvent.eventName"
              label="Event Name"
              required
            ></v-text-field>

            <v-textarea
              v-model="editedEvent.eventDescription"
              label="Description"
              required
            ></v-textarea>

            <v-text-field
              v-model="editedEvent.eventLocation"
              label="Location"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedEvent.eventDate"
              label="Date"
              type="date"
              required
            ></v-text-field>

            <v-select
              v-model="editedEvent.categories"
              :items="categories"
              label="Categories"
              multiple
              chips
            ></v-select>

            <v-switch
              v-model="editedEvent.isRestricted"
              label="Restricted Event"
              color="primary"
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="editDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" variant="text" @click="saveEventChanges">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// Import Firebase stuff we need
import { db } from "@/firebase"; // For database operations
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore"; // For querying and updating data
import { getAuth } from "firebase/auth"; // For user authentication

export default {
  // Component data - keeps track of events, search, and UI state
  data() {
    return {
      createdEvents: [], // Events you've made yourself
      joinedEvents: [], // Events you're participating in
      searchQuery: "", // What you're searching for
      activeTab: 'created', // Which tab is selected (created/joined)
      // activeCommentEvent: null, // Which event's comments are showing
      // newComment: "", // Text for a new comment
      editDialog: false,
      selectedEvent: null,
      editedEvent: {},
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
      authUnsubscribe: null,
    };
  },


  computed: {
    // Gets the right list of events based on which tab you're on
    currentEvents() {
      return this.activeTab === 'created' ? this.createdEvents : this.joinedEvents;
    },
   
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.currentEvents.filter(
        (event) =>
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.eventDescription || "").toLowerCase().includes(query)
      );
    },
  },

  // Methods - all the things we can do with events
  methods: {
    // Gets all events you've created
    async fetchCreatedEvents(userUid) {
      try {
        const eventsQuery = query(
          collection(db, "events"),
          where("createdBy", "==", userUid)
        );
        const querySnapshot = await getDocs(eventsQuery);
        
        this.createdEvents = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            AttendanceCount: eventData.participants ? eventData.participants.length : 0,
            ...eventData,
          };
        });
      } catch (error) {
        console.error("Error fetching created events:", error);
      }
    },

    // Gets all events you've joined
    async fetchJoinedEvents(userUid) {
      try {
        const eventsQuery = query(
          collection(db, "events"),
          // where("participants", "array-contains", userUid)
          where("UserIDs", "array-contains", userUid)

        );
        const querySnapshot = await getDocs(eventsQuery);
        
        this.joinedEvents = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            AttendanceCount: eventData.participants ? eventData.participants.length : 0,
            ...eventData,
          };
        });
      } catch (error) {
        console.error("Error fetching joined events:", error);
      }
    },

    // Opens the edit dialog for an event
    openEditDialog(event) {
      this.selectedEvent = event;
      this.editedEvent = { ...event };
      this.editDialog = true;
    },

    // Saves the changes made to an event
    async saveEventChanges() {
      try {
        const eventRef = doc(db, "events", this.selectedEvent.id);
        await updateDoc(eventRef, {
          eventName: this.editedEvent.eventName,
          eventDescription: this.editedEvent.eventDescription,
          eventLocation: this.editedEvent.eventLocation,
          eventDate: this.editedEvent.eventDate,
          categories: this.editedEvent.categories,
          isRestricted: this.editedEvent.isRestricted,
          lastUpdated: new Date(),
        });

        // Update the local state
        const index = this.createdEvents.findIndex(e => e.id === this.selectedEvent.id);
        if (index !== -1) {
          this.createdEvents[index] = { 
            ...this.createdEvents[index], 
            ...this.editedEvent 
          };
        }

        this.editDialog = false;
        // Show success message
        alert('Event updated successfully!');
      } catch (error) {
        console.error("Error updating event:", error);
        alert('Failed to update event. Please try again.');
      }
    },

    // Handle user name updates
    async handleUserNameUpdate(event) {
      const { firstName, lastName } = event.detail;
      const fullName = `${firstName} ${lastName}`.trim();

      // Update names in created events
      this.createdEvents = this.createdEvents.map(event => {
        if (event.createdBy === getAuth().currentUser?.uid) {
          return {
            ...event,
            ownerName: fullName
          };
        }
        return event;
      });

      // Update names in joined events
      this.joinedEvents = this.joinedEvents.map(event => {
        if (event.createdBy === getAuth().currentUser?.uid) {
          return {
            ...event,
            ownerName: fullName
          };
        }
        return event;
      });
    },
  },

  mounted() {
    const auth = getAuth();
    this.authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userUid = user.uid;
        await Promise.all([
          this.fetchCreatedEvents(userUid),
          this.fetchJoinedEvents(userUid)
        ]);
        window.addEventListener('userNameUpdated', this.handleUserNameUpdate);
      } else {
        // Optionally clear events if user logs out
        this.createdEvents = [];
        this.joinedEvents = [];
      }
    });
  },

  beforeUnmount() {
    window.removeEventListener('userNameUpdated', this.handleUserNameUpdate);
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  },
};
</script>

<style scoped>
/* Basic page layout */
* {
  font-family: Arial, sans-serif;
}

.events-page {
  padding: 20px;
  background-color: #f5f5f5;
}

.content {
  flex-grow: 1;
}

/* Tab styling */
.event-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: white;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button.active {
  background: #007bff;
  color: white;
}

.tab-button:hover:not(.active) {
  background: #f0f2f5;
}

/* Search bar styling */
.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

/* Event cards grid layout */
.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

/* Individual event card styling */
.event-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-2px);
}

/* Event image styling */
.event-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.event-img-placeholder {
  width: 100%;
  height: 150px;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #888;
}

/* Event information styling */
.event-info {
  padding: 15px;
}

.event-info h2 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 10px 0;
}

.event-info p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

/* Back button styling */
.back-arrow {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.back-arrow:hover {
  color: #007bff;
}

.back-arrow i {
  font-size: 1.2rem;
}

/* Empty state styling */
.no-events {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.no-events i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.no-events p {
  margin: 0;
  font-size: 1rem;
}

/* Event creator link styling */
.event-creator {
  margin-bottom: 10px;
}

.creator-link {
  color: #1877f2;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.creator-link:hover {
  text-decoration: underline;
}

/* User link styling */
.user-link {
  color: #1877f2;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}

/* Event actions styling */
.event-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.edit-button {
  margin-left: auto;
}

/* Responsive styles */
@media (max-width: 600px) {
  .v-dialog {
    margin: 16px;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .edit-button {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
