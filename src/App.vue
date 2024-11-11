<template>
  <div id="app">
    <nav>
      <div class = "navigation">
        <router-link to="/homepage">Home</router-link> |
        <router-link to="/log-in">Log In</router-link> |
        <router-link to="/RegisterPage">Register</router-link> |
        <router-link to="/create-event">Create Event</router-link> 
      </div>
      <div class = "user_icon">
        <i class="fas fa-user-circle"></i>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
nav {
  text-align: center;
  margin-bottom: 20px;
}
router-link {
  margin: 0 10px;
}

.user_icon {
  position: absolute;
  right: 20px; 
  font-size: 2.6rem;
  cursor: pointer;
}

.user_icon:hover {
  color: #ffffffa0;
}


</style>
