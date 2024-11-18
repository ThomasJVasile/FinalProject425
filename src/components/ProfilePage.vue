<template>
  <div>
    <h1>User Profile</h1>
    
    <!-- Displaying user information -->
    <p><strong>:</strong> {{ user.name }}</p>
    
    <!-- Display buttons for different sections (no functionality for now) -->
    <div>
      <button>Events Attended</button>
      <button>Events Hosted</button>
      <button>Friends</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      // Hardcoded user data for demonstration, you can replace this with dynamic data later
      user: {
        name: 'Jane Doe'
      }
    };
  }
};
</script>

<style scoped>
h1 {
  text-align: center;
  color: #42b983;
}

button {
  display: block;
  margin: 10px 0;
  padding: 10px 20px;
  background-color: pink; /* Changed background color to pink */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #f06292; /* Slightly darker pink on hover */
}
</style>
