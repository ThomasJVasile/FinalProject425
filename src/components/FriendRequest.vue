<!-- 
  This is the friend request implementation. It shows:
  1. Pending friend requests you've received
  2. Your current friends list
  3. Options to accept/reject requests and remove friends
  The implementation will be fully functional by spring 2025
-->

<template>
  <div class="friend-request-page">
    <!-- Back button to return to previous page -->
    <div class="back-arrow" @click="$router.go(-1)">
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </div>

    <h1>Friend Requests</h1>
    
    <!-- Pending Requests Section - Shows people who want to be your friend -->
    <div class="requests-section">
      <h2>
        <i class="fas fa-user-clock"></i>
        Pending Requests
        <!-- Shows number of pending requests if you have any -->
        <span v-if="receivedRequests.length > 0" class="request-count">
          {{ receivedRequests.length }}
        </span>
      </h2>
      
      <!-- Loading state while fetching requests -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading requests...
      </div>
      
      <!-- Empty state when no requests -->
      <div v-else-if="receivedRequests.length === 0" class="no-requests">
        <i class="fas fa-user-friends"></i>
        <p>No pending friend requests</p>
      </div>

      <!-- List of friend requests -->
      <ul v-else class="request-list">
        <li v-for="request in receivedRequests" :key="request.id" class="request-item">
          <div class="request-info">
            <!-- User avatar placeholder -->
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <!-- Request details with sender name and timestamp -->
            <div class="request-details">
              <strong>{{ request.senderUsername }}</strong>
              <span class="request-date">{{ formatDate(request.timestamp) }}</span>
            </div>
          </div>
          <!-- Accept/Reject buttons -->
          <div class="request-actions">
            <button @click="acceptRequest(request)" class="accept-btn">
              <i class="fas fa-check"></i> Accept
            </button>
            <button @click="rejectRequest(request.id)" class="reject-btn">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Friends List Section - Shows all your current friends -->
    <div class="friends-section">
      <h2>
        <i class="fas fa-users"></i>
        My Friends
        <!-- Shows total number of friends -->
        <span v-if="friends.length > 0" class="friend-count">
          {{ friends.length }}
        </span>
      </h2>

      <!-- Loading state while fetching friends -->
      <div v-if="loadingFriends" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading friends...
      </div>

      <!-- Empty state when no friends -->
      <div v-else-if="friends.length === 0" class="no-friends">
        <i class="fas fa-user-plus"></i>
        <p>No friends yet</p>
      </div>

      <!-- List of friends -->
      <ul v-else class="friends-list">
        <li v-for="friend in friends" :key="friend.id" class="friend-item">
          <div class="friend-info">
            <!-- Friend's avatar (shows default if none provided) -->
            <div class="user-avatar">
              <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="friend.username" />
              <i v-else class="fas fa-user"></i>
            </div>
            <!-- Friend's details with link to their profile -->
            <div class="friend-details">
              <router-link :to="'/profile/' + friend.id" class="friend-name">
                {{ friend.username }}
              </router-link>
              <span v-if="friend.location" class="friend-location">
                <i class="fas fa-map-marker-alt"></i>
                {{ friend.location }}
              </span>
            </div>
          </div>
          <!-- Remove friend button -->
          <button @click="removeFriend(friend.id)" class="remove-friend-btn">
            <i class="fas fa-user-minus"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// Import all the Firebase stuff we need
import { db } from '@/firebase';
import {
  collection,
  deleteDoc,
  query,
  where,
  doc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  name: 'FriendRequest',
  
  // Component data - keeps track of requests, friends, and loading states
  data() {
    return {
      receivedRequests: [], // List of friend requests you've received
      friends: [], // List of your current friends
      loading: true, // Shows loading spinner while fetching requests
      loadingFriends: true, // Shows loading spinner while fetching friends
      error: null, // Stores any errors that occur
      unsubscribe: null, // Cleanup function for requests listener
      unsubscribeFriends: null, // Cleanup function for friends listener
    };
  },

  methods: {
    // Makes timestamps look nice and readable
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    },

    // When someone wants to be your friend and you accept
    async acceptRequest(request) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return;

      try {
        // Create friendship docs for both users (it's a two-way street!)
        const friendship1 = doc(db, 'friendships', `${currentUser.uid}_${request.senderID}`);
        const friendship2 = doc(db, 'friendships', `${request.senderID}_${currentUser.uid}`);

        // Save the friendships in the database
        await setDoc(friendship1, {
          users: [currentUser.uid, request.senderID],
          timestamp: serverTimestamp(),
        });

        await setDoc(friendship2, {
          users: [request.senderID, currentUser.uid],
          timestamp: serverTimestamp(),
        });

        // Remove the request since you're friends now
        await deleteDoc(doc(db, 'friendRequests', request.id));
        
        // Let them know it worked!
        alert('Friend request accepted!');
      } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Oops! Failed to accept request. Try again?');
      }
    },

    // When you don't want to be friends with someone
    async rejectRequest(requestId) {
      try {
        // Just delete the request
        await deleteDoc(doc(db, 'friendRequests', requestId));
        alert('Friend request rejected');
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        alert('Failed to reject request. Try again?');
      }
    },

    // When you want to end a friendship 💔
    async removeFriend(friendId) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return;

      try {
        // Delete both friendship documents (it takes two to tango!)
        await deleteDoc(doc(db, 'friendships', `${currentUser.uid}_${friendId}`));
        await deleteDoc(doc(db, 'friendships', `${friendId}_${currentUser.uid}`));
        
        alert('Friend removed');
      } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend. Try again?');
      }
    },

    // Sets up real-time updates for requests and friends
    setupRealtimeListeners() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Clean up old listeners if they exist
      if (this.unsubscribe) this.unsubscribe();
      if (this.unsubscribeFriends) this.unsubscribeFriends();

      // Listen for new friend requests in real-time
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      // Update the requests list whenever something changes
      this.unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        console.log('Friend requests snapshot:', snapshot.docs.map(doc => doc.data()));
        this.receivedRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          senderUsername: doc.data().fromUserName || 'Anonymous',
          senderID: doc.data().fromUserId,
          timestamp: doc.data().timestamp,
          ...doc.data()
        }));
        this.loading = false;
      }, (error) => {
        console.error('Error fetching friend requests:', error);
        this.loading = false;
      });

      // Keep the friends list up to date in real-time
      const friendshipsQuery = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', currentUser.uid)
      );

      // Update friends list whenever something changes
      this.unsubscribeFriends = onSnapshot(friendshipsQuery, async (snapshot) => {
        console.log('Friendships snapshot:', snapshot.docs.map(doc => doc.data()));
        // Use a Set to store unique friend IDs
        const uniqueFriendIds = new Set();
        snapshot.docs.forEach(doc => {
          const friendId = doc.data().users.find(id => id !== currentUser.uid);
          if (friendId) {
            uniqueFriendIds.add(friendId);
          }
        });

        // Convert Set to Array and fetch friend data
        const friendPromises = Array.from(uniqueFriendIds).map(async (friendId) => {
          const friendDocRef = doc(db, 'users', friendId);
          const friendDoc = await getDoc(friendDocRef);
          
          if (friendDoc.exists()) {
            return {
              id: friendId,
              ...friendDoc.data()
            };
          }
          return null;
        });

        // Wait for all friend data to load
        const friends = await Promise.all(friendPromises);
        this.friends = friends.filter(friend => friend !== null);
        this.loadingFriends = false;
      }, (error) => {
        console.error('Error fetching friends:', error);
        this.loadingFriends = false;
      });
    },
  },

  // Start listening for changes when the component loads
  mounted() {
    this.setupRealtimeListeners();
  },

  // Clean up listeners when we're done - keep it tidy!
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeFriends) this.unsubscribeFriends();
  },
};
</script>

<style scoped>
/* Main page layout */
.friend-request-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Back button styling */
.back-arrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #65676b;
  cursor: pointer;
  padding: 8px;
  margin-bottom: 20px;
  width: fit-content;
  transition: color 0.2s ease;
}

.back-arrow:hover {
  color: #1877f2;
}

/* Page headings */
h1 {
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 24px;
}

h2 {
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Badge counters for requests and friends */
.request-count, .friend-count {
  background: #1877f2;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
}

/* Section cards */
.requests-section, .friends-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Loading and empty states */
.loading, .no-requests, .no-friends {
  text-align: center;
  padding: 40px;
  color: #65676b;
}

.loading i, .no-requests i, .no-friends i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #1877f2;
}

/* Lists styling */
.request-list, .friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* List items */
.request-item, .friend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.request-item:last-child, .friend-item:last-child {
  border-bottom: none;
}

/* User info layout */
.request-info, .friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Avatar styling */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar i {
  font-size: 20px;
  color: #65676b;
}

/* User details layout */
.request-details, .friend-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Request timestamp */
.request-date {
  font-size: 12px;
  color: #65676b;
}

/* Action buttons container */
.request-actions {
  display: flex;
  gap: 8px;
}

/* Button styles */
.accept-btn, .reject-btn, .remove-friend-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

/* Accept button */
.accept-btn {
  background: #42b72a;
  color: white;
}

.accept-btn:hover {
  background: #36a420;
}

/* Reject button */
.reject-btn {
  background: #e4e6eb;
  color: #1a1a1a;
}

.reject-btn:hover {
  background: #d8dadf;
}

/* Remove friend button */
.remove-friend-btn {
  background: none;
  color: #65676b;
  padding: 8px;
}

.remove-friend-btn:hover {
  background: #f0f2f5;
  color: #dc3545;
}

/* Friend name link */
.friend-name {
  color: #1a1a1a;
  font-weight: 600;
  text-decoration: none;
}

.friend-name:hover {
  text-decoration: underline;
}

/* Friend location */
.friend-location {
  font-size: 12px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
