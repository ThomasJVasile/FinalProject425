<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <label for="email">Email:</label>
      <input v-model="email" type="email" id="email" required />
      <br>
      <label for="password">Password:</label>
      <input v-model="password" type="password" id="password" required />
      <br>
      <button type="submit">Login</button>
      <p>{{ message }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LoginPage',
  setup() {
    const email = ref('');
    const password = ref('');
    const message = ref('');

    // Hardcoded credentials for testing
    const hardcodedEmail = 'test@example.com';
    const hardcodedPassword = 'password123';

    const login = () => {
      if (email.value === hardcodedEmail && password.value === hardcodedPassword) {
        message.value = 'Login successful!';
      } else {
        message.value = 'Login failed: Invalid email or password';
      }
    };

    return { email, password, login, message };
  }
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
