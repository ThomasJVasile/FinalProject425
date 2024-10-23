<template>
  <div id="app">
    <nav>
      <router-link to="/homepage">Home</router-link> |
      <router-link to="/log-in">Log In</router-link>
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
</style>
