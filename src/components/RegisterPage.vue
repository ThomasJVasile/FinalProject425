<template>
    <div>
        <h1> Register now </h1>
    </div>
    <form @submit.prevent="register">
        <label for="email">Email:</label>
        <input v-model="email" type="text" id="email" name="email"/>
        <br>
        <label for="username">Username:</label>
        <input v-model="username" type="text" id="username" name="username"/>
        <br>
        <label for="password">Password:</label>
        <input v-model="password" type="text" id="password" name="password"/>
        <br>
        <label for="confirmpassword">Confirm Password:</label>
        <input v-modle= "confirmpassword" type="text" id="confirmpassword" name="confirmpassword"/>
        <br>
        <button type="submit">Register Now</button>
    </form>
</template> 

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref } from "vue";
import { UseRouter } from "vue-router";

export default {
  setup() {
    const router = UseRouter();
    const email = ref("");
    const username = ref("");
    const password = ref(""); 
    const confirmPassword = ref(""); 

    const register = async () => {
      if (password.value != confirmPassword.value) {
        alert("Passwords do not match.");
        return;
      }
      try {
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        alert("Registration successful.");
        router.push("/homepage");
      }
      catch (error) {
        alert("Registration failed: " + error.message);
      }

    };
    return {email, username, password, confirmPassword, register};
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
