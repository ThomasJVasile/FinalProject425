<template>
  <div class="settings-page">
    <!-- Back Arrow -->
    <div class="back-arrow" @click="$router.push('/UserProfilePage')">
      <i class="fas fa-arrow-left"></i>
      <span>Back to Profile</span>
    </div>

    <h1>Settings</h1>

    <!-- Navigation Tabs -->
    <div class="settings-tabs">
      <button 
        @click="activeTab = 'account'"
        :class="{ active: activeTab === 'account' }"
      >Account</button>
      <button 
        @click="activeTab = 'profile'"
        :class="{ active: activeTab === 'profile' }"
      >Profile</button>
      <button 
        @click="activeTab = 'privacy'"
        :class="{ active: activeTab === 'privacy' }"
      >Privacy</button>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Account Settings -->
      <div v-if="activeTab === 'account'" class="settings-section">
        <h2>Account Settings</h2>
        <form @submit.prevent="updateAccountSettings">
          <div class="form-group">
            <label>Display Name</label>
            <input 
              type="text" 
              v-model="accountSettings.displayName" 
              placeholder="Enter your display name"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="accountSettings.email" 
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label>Birthday</label>
            <input 
              type="date" 
              v-model="accountSettings.birthday"
            />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              v-model="accountSettings.phone"
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group">
            <label>Location</label>
            <input 
              type="text" 
              v-model="accountSettings.location"
              placeholder="Enter your location"
            />
          </div>

          <button type="submit" class="save-button">Save Account Settings</button>
        </form>
      </div>

      <!-- Profile Settings -->
      <div v-if="activeTab === 'profile'" class="settings-section">
        <h2>Profile Settings</h2>
        <form @submit.prevent="updateProfileSettings">
          <div class="form-group">
            <label>Profile Picture</label>
            <div class="profile-picture-section">
              <img 
                v-if="profileSettings.pictureUrl" 
                :src="profileSettings.pictureUrl" 
                class="profile-preview"
              />
              <div v-else class="profile-placeholder">
                No picture selected
              </div>
              <input 
                type="file" 
                @change="handleProfilePicture" 
                accept="image/*"
                ref="profilePicInput"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Bio</label>
            <textarea 
              v-model="profileSettings.bio"
              placeholder="Tell us about yourself..."
              maxlength="500"
              rows="4"
            ></textarea>
            <span class="character-count">{{ profileSettings.bio.length }}/500</span>
          </div>

          <div class="form-group">
            <label>Interests</label>
            <div class="interests-container">
              <input 
                type="text" 
                v-model="newInterest"
                @keyup.enter="addInterest"
                placeholder="Add an interest and press Enter"
              />
              <div class="interests-tags">
                <span 
                  v-for="(interest, index) in profileSettings.interests" 
                  :key="index"
                  class="interest-tag"
                >
                  {{ interest }}
                  <button @click.prevent="removeInterest(index)" class="remove-tag">×</button>
                </span>
              </div>
            </div>
          </div>

          <button type="submit" class="save-button">Save Profile Settings</button>
        </form>
      </div>

      <!-- Privacy Settings -->
      <div v-if="activeTab === 'privacy'" class="settings-section">
        <h2>Privacy Settings</h2>
        <form @submit.prevent="updatePrivacySettings">
          <div class="privacy-options">
            <div class="privacy-option">
              <label class="switch-label">
                <span>Profile Visibility</span>
                <div class="switch">
                  <input 
                    type="checkbox" 
                    v-model="privacySettings.isProfilePrivate"
                  />
                  <span class="slider"></span>
                </div>
                <span class="switch-text">{{ privacySettings.isProfilePrivate ? 'Private' : 'Public' }}</span>
              </label>
              <p class="option-description">
                When private, only friends can view your full profile
              </p>
            </div>

            <div class="privacy-option">
              <label class="switch-label">
                <span>Event Visibility</span>
                <div class="switch">
                  <input 
                    type="checkbox" 
                    v-model="privacySettings.hideEvents"
                  />
                  <span class="slider"></span>
                </div>
                <span class="switch-text">{{ privacySettings.hideEvents ? 'Hidden' : 'Visible' }}</span>
              </label>
              <p class="option-description">
                Control who can see events you're attending
              </p>
            </div>

            <div class="privacy-option">
              <label class="switch-label">
                <span>Friend List Visibility</span>
                <div class="switch">
                  <input 
                    type="checkbox" 
                    v-model="privacySettings.hideFriendList"
                  />
                  <span class="slider"></span>
                </div>
                <span class="switch-text">{{ privacySettings.hideFriendList ? 'Hidden' : 'Visible' }}</span>
              </label>
              <p class="option-description">
                Control who can see your friend list
              </p>
            </div>
          </div>

          <button type="submit" class="save-button">Save Privacy Settings</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc,
} from 'firebase/firestore';
import { 
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '@/firebase';

export default {
  name: 'SettingsPage',
  setup() {
    const activeTab = ref('account');
    const newInterest = ref('');

    const accountSettings = ref({
      displayName: '',
      email: '',
      birthday: '',
      phone: '',
      location: '',
    });

    const profileSettings = ref({
      pictureUrl: '',
      bio: '',
      interests: [],
    });

    const privacySettings = ref({
      isProfilePrivate: false,
      hideEvents: false,
      hideFriendList: false,
    });

    // Load user settings
    const loadUserSettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (userData) {
            // Construct display name from firstName and lastName, or use existing displayName
            const displayName = userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`.trim()
              : userData.displayName || '';

            accountSettings.value = {
              displayName: displayName,
              email: userData.email || user.email || '',
              birthday: userData.birthday || '',
              phone: userData.phone || '',
              location: userData.location || '',
            };

            profileSettings.value = {
              pictureUrl: userData.pictureUrl || '',
              bio: userData.bio || '',
              interests: userData.interests || [],
            };

            privacySettings.value = {
              isProfilePrivate: userData.isProfilePrivate || false,
              hideEvents: userData.hideEvents || false,
              hideFriendList: userData.hideFriendList || false,
            };
          }
        } catch (error) {
          console.error('Error loading user settings:', error);
        }
      }
    };

    // Update functions
    const updateAccountSettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Split display name into first and last name
          const names = accountSettings.value.displayName.trim().split(' ');
          const firstName = names[0] || '';
          const lastName = names.slice(1).join(' ') || '';

          // Update both display name and split names
          await updateDoc(doc(db, 'users', user.uid), {
            displayName: accountSettings.value.displayName,
            firstName: firstName,
            lastName: lastName,
            email: accountSettings.value.email,
            birthday: accountSettings.value.birthday,
            phone: accountSettings.value.phone,
            location: accountSettings.value.location,
          });

          // Also update the auth profile
          await user.updateProfile({
            displayName: accountSettings.value.displayName
          });

          alert('Account settings updated successfully!');
          
          // Reload settings to refresh the display
          await loadUserSettings();
        } catch (error) {
          console.error('Error updating account settings:', error);
          alert('Failed to update account settings. Please try again.');
        }
      }
    };

    const handleProfilePicture = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          const imageRef = storageRef(storage, `profile-pictures/${user.uid}`);
          await uploadBytes(imageRef, file);
          const downloadUrl = await getDownloadURL(imageRef);
          
          profileSettings.value.pictureUrl = downloadUrl;
          await updateDoc(doc(db, 'users', user.uid), {
            pictureUrl: downloadUrl,
          });
        } catch (error) {
          console.error('Error uploading profile picture:', error);
          alert('Failed to upload profile picture. Please try again.');
        }
      }
    };

    const updateProfileSettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Create a reference to the user's document
          const userRef = doc(db, 'users', user.uid);
          
          // Get current user data first
          const userDoc = await getDoc(userRef);
          const currentData = userDoc.exists() ? userDoc.data() : {};

          // Create an array that combines existing and new interests
          const updatedInterests = [...new Set([...(currentData.interests || []), ...profileSettings.value.interests])];

          // Update the document with new data, preserving existing fields
          await updateDoc(userRef, {
            ...currentData,
            bio: profileSettings.value.bio,
            interests: updatedInterests,
            pictureUrl: profileSettings.value.pictureUrl,
          });

          alert('Profile settings updated successfully!');
          
          // Force a reload of the user settings
          await loadUserSettings();
        } catch (error) {
          console.error('Error updating profile settings:', error);
          alert('Failed to update profile settings. Please try again.');
        }
      }
    };

    const updatePrivacySettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            isProfilePrivate: privacySettings.value.isProfilePrivate,
            hideEvents: privacySettings.value.hideEvents,
            hideFriendList: privacySettings.value.hideFriendList,
          });
          alert('Privacy settings updated successfully!');
        } catch (error) {
          console.error('Error updating privacy settings:', error);
          alert('Failed to update privacy settings. Please try again.');
        }
      }
    };

    const addInterest = () => {
      if (newInterest.value.trim() && !profileSettings.value.interests.includes(newInterest.value.trim())) {
        profileSettings.value.interests.push(newInterest.value.trim());
        newInterest.value = '';
      }
    };

    const removeInterest = (index) => {
      profileSettings.value.interests.splice(index, 1);
    };

    onMounted(() => {
      loadUserSettings();
    });

    return {
      activeTab,
      accountSettings,
      profileSettings,
      privacySettings,
      newInterest,
      updateAccountSettings,
      updateProfileSettings,
      updatePrivacySettings,
      handleProfilePicture,
      addInterest,
      removeInterest,
    };
  },
};
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.settings-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
}

.settings-tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.settings-tabs button.active {
  color: #007bff;
  background: #e6f0ff;
}

.settings-tabs button:hover {
  background: #f5f5f5;
}

.settings-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
}

.save-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.save-button:hover {
  background: #0056b3;
}

.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.character-count {
  display: block;
  text-align: right;
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.interests-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  background: #e6f0ff;
  color: #007bff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
  line-height: 1;
}

.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.privacy-option {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #007bff;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.switch-text {
  min-width: 60px;
}

.option-description {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.875rem;
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
</style>
