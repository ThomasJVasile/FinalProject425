<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <label for="email">Email:</label>
      <input v-model="email" type="email" id="email" required />
      <br />
      <label for="password">Password:</label>
      <input v-model="password" type="password" id="password" required />
      <br />
      <button type="submit">Login</button>
      <p>{{ message }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

export default {
  name: "LoginPage",
  setup() {
    const email = ref("");
    const password = ref("");
    const message = ref("");
    const router = useRouter();

    const login = async () => {
      const authentication = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(
          authentication,
          email.value,
          password.value
        );
        const user = userCredential.user;
        message.value = "Login successful";
        localStorage.setItem("userName", user.displayName || "Anonymous");
        router.push("/homepage");
      } catch (error) {
        message.value = "Login failed: " + error.message;
      }
    };

    return { email, password, login, message };
  },
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
