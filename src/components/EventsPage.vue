<!--This is a page to display what the user have created and joined -->
<template>
  <div class="events-page">
    <!-- Back Arrow -->
    <div class="back-arrow" @click="$router.push('/UserProfilePage')">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Profile</span>
    </div>

    <main class="content">
      <!-- Title -->
      <h1>My Events</h1>

      <!-- Event Type Tabs -->
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

      <!-- Search Bar -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events"
        class="search-bar"
      />

      <!-- List of Events -->
      <div class="event-list">
        <div
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-card"
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
            
            <!-- Reactions Section -->
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

            <!-- Comments Section -->
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
        <!-- No Events Message -->
        <div v-if="filteredEvents.length === 0" class="no-events">
          <i class="fas fa-calendar-times"></i>
          <p>{{ activeTab === 'created' ? 'You haven\'t created any events yet.' : 'You haven\'t joined any events yet.' }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { db } from "@/firebase"; // Firebase Firestore instance
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"; // Firestore query methods
import { getAuth } from "firebase/auth"; // Firebase Authentication

export default {
  data() {
    return {
      createdEvents: [], // List of events created by the user
      joinedEvents: [], // List of events joined by the user
      searchQuery: "", // Search query for filtering events
      activeTab: 'created', // Default tab
      activeCommentEvent: null, // Track which event's comments are visible
      newComment: "", // Store new comment text
    };
  },
  computed: {
    // Returns the appropriate event list based on active tab
    currentEvents() {
      return this.activeTab === 'created' ? this.createdEvents : this.joinedEvents;
    },
    // Filters the events based on the search query
    filteredEvents() {
      const query = this.searchQuery.toLowerCase();
      return this.currentEvents.filter(
        (event) =>
          (event.eventName || "").toLowerCase().includes(query) ||
          (event.eventDescription || "").toLowerCase().includes(query)
      );
    },
  },
  methods: {
    isEventLiked(eventId) {
      const event = [...this.createdEvents, ...this.joinedEvents]
        .find(e => e.id === eventId);
      const currentUser = getAuth().currentUser;
      return event?.likes?.includes(currentUser.uid) || false;
    },

    async toggleLike(eventId) {
      try {
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;

        const eventRef = doc(db, "events", eventId);
        const event = [...this.createdEvents, ...this.joinedEvents]
          .find(e => e.id === eventId);

        if (this.isEventLiked(eventId)) {
          // Unlike
          await updateDoc(eventRef, {
            likes: arrayRemove(currentUser.uid)
          });
          if (event) {
            event.likes = event.likes.filter(uid => uid !== currentUser.uid);
          }
        } else {
          // Like
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

    showComments(eventId) {
      this.activeCommentEvent = this.activeCommentEvent === eventId ? null : eventId;
      this.newComment = "";
    },

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

        await updateDoc(eventRef, {
          comments: arrayUnion(comment)
        });

        // Update local state
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

    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

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
  async created() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userUid = user.uid;
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

.search-bar {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.event-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

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

.user-link {
  color: #1877f2;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}
</style>
