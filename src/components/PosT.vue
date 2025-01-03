<!-- This template is for social post. I have not fugureed out how to connecet to home mpage or profile so I just only implemented vue file for now -->
<!-- Implimented by Lalise -->

<template>
  <!-- Comment Section Wrapper -->
  <div class="comments-section">
    <!-- Post Details Section -->
    <div class="comments-header">
      <div class="comments-stats">
        <!--number of likes and comments  -->
     <span><i class="fa fa-thumbs-up"></i> {{ likes }}</span>
        <span><i class="fa fa-comment"></i> {{ comments.length }}</span>
      </div>
      <!-- Post Owner Information -->
      <div class="post-owner">
        <div class="avatar">
          <img :src="creator.avatar" alt="Owner Avatar" />
        </div>
        <div class="username">
          <a href="#">@{{ creator.user }}</a>
        </div>
      </div>
    </div>

    <!-- Comments List Component -->
    <div class="comments-wrapper custom-scrollbar">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <div class="comment-avatar">
          <img :src="comment.avatar" alt="User Avatar" />
        </div>
        <div class="comment-content">
          <p><strong>{{ comment.user }}</strong>: {{ comment.text }}</p>
        </div>
      </div>
    </div>

    <!-- New Comment Form -->
    <form @submit.prevent="submitComment" class="comment-form">
      <input v-model="newComment" type="text" placeholder="Write a comment..." required />
      <button type="submit">Post</button>
    </form>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  data() {
    return {
      likes: 0, //like at 0 
      newComment: "", // Ncoments 
      creator: {
        avatar: "",
        // user: '' // how to display user names 
      },
      current_user: {
        avatar: '',
      },
      comments: [
        {
          id: uuidv4(),
          user: 'example',
          avatar: 'http://via.placeholder.com/100x100/a74848',
          text: 'This is an example comment.'
        }
      ]
    };
  },
  methods: {
    submitComment() {
      if (this.newComment.trim()) {
        this.comments.push({
          id: uuidv4(),
          user: this.current_user.user,
          avatar: this.current_user.avatar,
          text: this.newComment.trim()
        });
        this.newComment = ""; // Reset input field
      }
    }
  }
};
</script>

<style scoped>
/* Comment Section Wrapper Styling */
.comments-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Comments Header Styling */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* Comment Stats Styling */
.comments-stats span {
  margin-right: 10px;
  font-size: 0.9rem;
  color: #555;
}

/* Post Owner Styling */
.post-owner {
  display: flex;
  align-items: center;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username a {
  margin-left: 10px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

/* Comments Wrapper Styling */
.comments-wrapper {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

/* Comment Item Styling */
.comment {
  display: flex;
  margin-bottom: 10px;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.comment-content p {
  margin: 0;
  font-size: 0.9rem;
}

/* New Comment Form Styling */
.comment-form {
  display: flex;
  gap: 10px;
}

.comment-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-form button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-form button:hover {
  background: #0056b3;
}
</style>




<!--This is the resouirce I used 
https://dev.to/daltonic/how-to-build-a-social-networking-site-with-vuejs-facebook-clone-2bpa?comments_sort=top
https://dev.to/tsanak/simple-comment-section-with-vue-components-1cdm


-->
