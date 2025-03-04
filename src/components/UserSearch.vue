<template>
  <div class="user-search">
    <!-- Back Arrow -->
    <div class="back-arrow" @click="$router.go(-1)">
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </div>

    <h1>Find People</h1>
    
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        @input="searchUsers"
        placeholder="Search by name..."
        class="search-input"
      />
      <i class="fas fa-search search-icon"></i>
    </div>

    <div class="users-list" v-if="searchResults.length > 0">
      <div v-for="user in searchResults" :key="user.id" class="user-card">
        <div class="user-avatar">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.firstName" />
          <i v-else class="fas fa-user"></i>
        </div>
        <div class="user-info">
          <router-link :to="'/profile/' + user.id" class="user-name">
            {{ user.firstName }} {{ user.lastName }}
          </router-link>
          <span class="user-location" v-if="user.location">
            <i class="fas fa-map-marker-alt"></i> {{ user.location }}
          </span>
        </div>
      </div>
    </div>
    <div v-else-if="!searchQuery" class="initial-state">
      <i class="fas fa-users"></i>
      <p>Search for other users by typing their name above</p>
    </div>
    <div v-else-if="searchQuery && !isLoading && searchResults.length === 0" class="no-results">
      <i class="fas fa-search"></i>
      <p>No users found matching "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export default {
  setup() {
    const searchQuery = ref('');
    const searchResults = ref([]);
    const isLoading = ref(false);
    let searchTimeout = null;

    const searchUsers = async () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      searchTimeout = setTimeout(async () => {
        if (!searchQuery.value.trim()) {
          searchResults.value = [];
          return;
        }

        isLoading.value = true;
        try {
          const searchTerm = searchQuery.value.toLowerCase().trim();
          
          // Search in firstName
          const firstNameQuery = query(
            collection(db, 'users'),
            where('firstName', '>=', searchTerm),
            where('firstName', '<=', searchTerm + '\uf8ff'),
            orderBy('firstName'),
            limit(10)
          );

          // Search in lastName
          const lastNameQuery = query(
            collection(db, 'users'),
            where('lastName', '>=', searchTerm),
            where('lastName', '<=', searchTerm + '\uf8ff'),
            orderBy('lastName'),
            limit(10)
          );

          const [firstNameSnapshot, lastNameSnapshot] = await Promise.all([
            getDocs(firstNameQuery),
            getDocs(lastNameQuery)
          ]);

          // Combine and deduplicate results
          const results = new Map();
          
          [...firstNameSnapshot.docs, ...lastNameSnapshot.docs].forEach(doc => {
            if (!results.has(doc.id)) {
              results.set(doc.id, {
                id: doc.id,
                ...doc.data()
              });
            }
          });

          searchResults.value = Array.from(results.values());
          
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          isLoading.value = false;
        }
      }, 300);
    };

    return {
      searchQuery,
      searchResults,
      isLoading,
      searchUsers
    };
  }
};
</script>

<style scoped>
.user-search {
  max-width: 600px;
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
  margin-bottom: 20px;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #1877f2;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #65676b;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-avatar {
  width: 48px;
  height: 48px;
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
  font-size: 24px;
  color: #65676b;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: #1a1a1a;
  font-weight: 600;
  text-decoration: none;
}

.user-name:hover {
  text-decoration: underline;
}

.user-location {
  font-size: 0.9rem;
  color: #65676b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.initial-state, .no-results {
  text-align: center;
  padding: 40px 20px;
  color: #65676b;
  background: white;
  border-radius: 8px;
}

.initial-state i, .no-results i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #1877f2;
}

.initial-state p, .no-results p {
  margin: 0;
  font-size: 1rem;
}
</style> 