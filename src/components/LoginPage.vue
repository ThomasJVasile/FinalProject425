<template>
  <div>
    <h1>Log In</h1>
    <form>
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" />
      <br />
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" />
      <br />
      <button type="submit">Log In</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
};
</script>

<style scoped>
h1 {
  text-align: center;
  color: #42b983;
}
form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
