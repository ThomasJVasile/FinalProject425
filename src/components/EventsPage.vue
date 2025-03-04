<!--This is a page to display what the user have created and joined -->
<template>
  <div class="events-page">
    <!-- Back Arrow - Takes you back to your profile -->
    <div class="back-arrow" @click="$router.push('/UserProfilePage')">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Profile</span>
    </div>

    <main class="content">
      <!-- Title -->
      <h1>My Events</h1>

      <!-- Event Type Tabs - Switch between events you created and joined -->
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

      <!-- Search Bar - Find specific events by name or description -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events"
        class="search-bar"
      />

      <!-- List of Events - Shows all your events with details and interactions -->
      <div class="event-list">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
        >
          <!-- Event Image - Shows event picture if available -->
          <img
            v-if="event.imageUrl"
            :src="event.imageUrl"
            class="event-img"
            alt="Event image"
          />
          <div v-else class="event-img-placeholder">No Image</div>
          
          <!-- Event Details - Name, creator, description, and attendance -->
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
            
            <!-- Reactions - Like and comment buttons -->
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

            <!-- Comments Section - View and add comments -->
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
          </div>
        </div>
        <!-- No Events Message - Shows when you haven't created/joined any events -->
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-times"></i>
          <p>{{ activeTab === 'created' ? 'You haven\'t created any events yet.' : 'You haven\'t joined any events yet.' }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
// Import Firebase stuff we need
import { db } from "@/firebase"; // For database operations
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"; // For querying and updating data
import { getAuth } from "firebase/auth"; // For user authentication

export default {
  // Component data - keeps track of events, search, and UI state
  data() {
    return {
      createdEvents: [], // Events you've made yourself
      joinedEvents: [], // Events you're participating in
      searchQuery: "", // What you're searching for
      activeTab: 'created', // Which tab is selected (created/joined)
      activeCommentEvent: null, // Which event's comments are showing
      newComment: "", // Text for a new comment
    };
  },

  // Computed properties - filter and organize our events
  computed: {
    // Gets the right list of events based on which tab you're on
    currentEvents() {
      return this.activeTab === 'created' ? this.createdEvents : this.joinedEvents;
    },
    // Filters events based on what you're searching for
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
    // Checks if you've liked an event
    isEventLiked(eventId) {
      const event = [...this.createdEvents, ...this.joinedEvents]
        .find(e => e.id === eventId);
      const currentUser = getAuth().currentUser;
      return event?.likes?.includes(currentUser.uid) || false;
    },

    // Handles liking/unliking an event
    async toggleLike(eventId) {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const eventRef = doc(db, "events", eventId);
        const event = [...this.createdEvents, ...this.joinedEvents]
          .find(e => e.id === eventId);

        if (this.isEventLiked(eventId)) {
          // Unlike - remove your like
          await updateDoc(eventRef, {
            likes: arrayRemove(currentUser.uid)
          });
          if (event) {
            event.likes = event.likes.filter(uid => uid !== currentUser.uid);
          }
        } else {
          // Like - add your like
          await updateDoc(eventRef, {
            likes: arrayUnion(currentUser.uid)
          });
          if (event) {
            event.likes = [...(event.likes || []), currentUser.uid];
          }
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },

    // Shows/hides comments for an event
    showComments(eventId) {
      this.activeCommentEvent = this.activeCommentEvent === eventId ? null : eventId;
      this.newComment = "";
    },

    // Adds a new comment to an event
    async addComment(eventId) {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser || !this.newComment.trim()) return;

        const eventRef = doc(db, "events", eventId);
        const comment = {
          id: Date.now().toString(),
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anonymous',
          text: this.newComment.trim(),
          timestamp: serverTimestamp()
        };

        // Save to database
        await updateDoc(eventRef, {
          comments: arrayUnion(comment)
        });

        // Update local display
        const event = [...this.createdEvents, ...this.joinedEvents]
          .find(e => e.id === eventId);
        if (event) {
          event.comments = [...(event.comments || []), comment];
        }

        this.newComment = "";
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },

    // Makes timestamps look nice
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

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
            likes: eventData.likes || [],
            comments: eventData.comments || [],
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
          where("participants", "array-contains", userUid)
        );
        const querySnapshot = await getDocs(eventsQuery);
        
        this.joinedEvents = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            id: doc.id,
            AttendanceCount: eventData.participants ? eventData.participants.length : 0,
            likes: eventData.likes || [],
            comments: eventData.comments || [],
            ...eventData,
          };
        });
      } catch (error) {
        console.error("Error fetching joined events:", error);
      }
    },
  },

  // When the component is created, fetch all events
  async created() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userUid = user.uid;
        // Load both created and joined events at the same time
        await Promise.all([
          this.fetchCreatedEvents(userUid),
          this.fetchJoinedEvents(userUid)
        ]);
      } else {
        console.warn("No authenticated user found.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
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

/* Reactions section styling */
.event-reactions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.reaction-btn:hover {
  background: #f0f2f5;
}

.reaction-btn.liked {
  color: #e41e3f;
}

.reaction-btn i {
  font-size: 1.1rem;
}

/* Comments section styling */
.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.comment {
  padding: 0.5rem;
  border-bottom: 1px solid #f0f2f5;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-text {
  margin: 0;
  color: #1a1a1a;
}

/* Comment input styling */
.comment-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.comment-input input {
  flex-grow: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.comment-input input:focus {
  border-color: #1877f2;
}

.comment-input button {
  padding: 0.5rem;
  border: none;
  background: #1877f2;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.comment-input button:hover {
  background: #166fe5;
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
</style>
