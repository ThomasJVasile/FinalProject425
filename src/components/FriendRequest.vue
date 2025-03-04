<!-- This is the freidn request implementation. It is currently not functioning when the assignment is submitted bbut will be by spring 2025 -->



<template>
  <div class="friend-request-page">
    <div class="back-arrow" @click="$router.go(-1)">
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </div>

    <h1>Friend Requests</h1>
    
    <!-- Pending Requests Section -->
    <div class="requests-section">
      <h2>
        <i class="fas fa-user-clock"></i>
        Pending Requests
        <span v-if="receivedRequests.length > 0" class="request-count">
          {{ receivedRequests.length }}
        </span>
      </h2>
      
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading requests...
      </div>
      
      <div v-else-if="receivedRequests.length === 0" class="no-requests">
        <i class="fas fa-user-friends"></i>
        <p>No pending friend requests</p>
      </div>

      <ul v-else class="request-list">
        <li v-for="request in receivedRequests" :key="request.id" class="request-item">
          <div class="request-info">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="request-details">
              <strong>{{ request.senderUsername }}</strong>
              <span class="request-date">{{ formatDate(request.timestamp) }}</span>
            </div>
          </div>
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

    <!-- Friends List Section -->
    <div class="friends-section">
      <h2>
        <i class="fas fa-users"></i>
        My Friends
        <span v-if="friends.length > 0" class="friend-count">
          {{ friends.length }}
        </span>
      </h2>

      <div v-if="loadingFriends" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Loading friends...
      </div>

      <div v-else-if="friends.length === 0" class="no-friends">
        <i class="fas fa-user-plus"></i>
        <p>No friends yet</p>
      </div>

      <ul v-else class="friends-list">
        <li v-for="friend in friends" :key="friend.id" class="friend-item">
          <div class="friend-info">
            <div class="user-avatar">
              <img v-if="friend.avatarUrl" :src="friend.avatarUrl" :alt="friend.username" />
              <i v-else class="fas fa-user"></i>
            </div>
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
          <button @click="removeFriend(friend.id)" class="remove-friend-btn">
            <i class="fas fa-user-minus"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      receivedRequests: [],
      friends: [],
      loading: true,
      loadingFriends: true,
      error: null,
      unsubscribe: null,
      unsubscribeFriends: null,
    };
  },

  methods: {
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

    async acceptRequest(request) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return;

      try {
        // Create friendship documents for both users
        const friendship1 = doc(db, 'friendships', `${currentUser.uid}_${request.senderID}`);
        const friendship2 = doc(db, 'friendships', `${request.senderID}_${currentUser.uid}`);

        await setDoc(friendship1, {
          users: [currentUser.uid, request.senderID],
          timestamp: serverTimestamp(),
        });

        await setDoc(friendship2, {
          users: [request.senderID, currentUser.uid],
          timestamp: serverTimestamp(),
        });

        // Delete the request
        await deleteDoc(doc(db, 'friendRequests', request.id));
        
        // Show success message
        this.$toast.success('Friend request accepted!');
      } catch (error) {
        console.error('Error accepting friend request:', error);
        this.$toast.error('Failed to accept request. Please try again.');
      }
    },

    async rejectRequest(requestId) {
      try {
        await deleteDoc(doc(db, 'friendRequests', requestId));
        this.$toast.success('Friend request rejected');
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        this.$toast.error('Failed to reject request. Please try again.');
      }
    },

    async removeFriend(friendId) {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return;

      try {
        // Delete both friendship documents
        await deleteDoc(doc(db, 'friendships', `${currentUser.uid}_${friendId}`));
        await deleteDoc(doc(db, 'friendships', `${friendId}_${currentUser.uid}`));
        
        this.$toast.success('Friend removed');
      } catch (error) {
        console.error('Error removing friend:', error);
        this.$toast.error('Failed to remove friend. Please try again.');
      }
    },

    setupRealtimeListeners() {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Clean up previous listeners
      if (this.unsubscribe) this.unsubscribe();
      if (this.unsubscribeFriends) this.unsubscribeFriends();

      // Listen for friend requests
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

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

      // Listen for friends
      const friendshipsQuery = query(
        collection(db, 'friendships'),
        where('users', 'array-contains', currentUser.uid)
      );

      this.unsubscribeFriends = onSnapshot(friendshipsQuery, async (snapshot) => {
        console.log('Friendships snapshot:', snapshot.docs.map(doc => doc.data()));
        const friendPromises = snapshot.docs.map(async (doc) => {
          const friendId = doc.data().users.find(id => id !== currentUser.uid);
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          return {
            id: friendId,
            ...friendDoc.data()
          };
        });

        this.friends = await Promise.all(friendPromises);
        this.loadingFriends = false;
      }, (error) => {
        console.error('Error fetching friends:', error);
        this.loadingFriends = false;
      });
    },
  },

  mounted() {
    this.setupRealtimeListeners();
  },

  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeFriends) this.unsubscribeFriends();
  },
};
</script>

<style scoped>
.friend-request-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

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

.request-count, .friend-count {
  background: #1877f2;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
}

.requests-section, .friends-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

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

.request-list, .friends-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

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

.request-info, .friend-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

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

.request-details, .friend-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.request-date {
  font-size: 12px;
  color: #65676b;
}

.request-actions {
  display: flex;
  gap: 8px;
}

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

.accept-btn {
  background: #42b72a;
  color: white;
}

.accept-btn:hover {
  background: #36a420;
}

.reject-btn {
  background: #e4e6eb;
  color: #1a1a1a;
}

.reject-btn:hover {
  background: #d8dadf;
}

.remove-friend-btn {
  background: none;
  color: #65676b;
  padding: 8px;
}

.remove-friend-btn:hover {
  background: #f0f2f5;
  color: #dc3545;
}

.friend-name {
  color: #1a1a1a;
  font-weight: 600;
  text-decoration: none;
}

.friend-name:hover {
  text-decoration: underline;
}

.friend-location {
  font-size: 12px;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
