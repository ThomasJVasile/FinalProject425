<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Log In</h1>
      <form @submit.prevent="handleLogin">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />

        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit" class="login-button">Log In</button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <div class="alt-login-options">
        <p class="divider">OR</p>
        <button @click="loginWithGoogle" class="google-login">Continue with Google</button>
        <button @click="loginWithApple" class="apple-login">Continue with Apple</button>
      </div>

      <p class="create-account">
        New here? <a href="/RegisterPage" class="create-account-link">Create an account</a>
      </p>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    async handleLogin() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const user = userCredential.user;
        this.successMessage = `Welcome back, ${user.email}!`;
        this.errorMessage = "";
        console.log("Login successful:", user);
        this.$router.push("/homepage");
      } catch (error) {
        console.error("Login failed:", error);
        this.errorMessage =
          error.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : "Failed to log in. Please check your credentials.";
        this.successMessage = "";
      }
    },


    // async loginWithGoogle() {
    //   const auth = getAuth();
    //   const provider = new GoogleAuthProvider();
    //   try {
    //     const result = await signInWithPopup(auth, provider);
    //     const user = result.user;
    //     this.successMessage = `Logged in as ${user.displayName}`;
    //     this.errorMessage = "";
    //     console.log("Google login successful:", user);
    //     this.$router.push("/homepage");
    //   } catch (error) {
    //     console.error("Google login failed:", error);
    //     this.errorMessage = "Google login failed. Please try again.";
    //     this.successMessage = "";
    //   }
    // },

  async loginWithGoogle() { //this works but we still have to verify id for students somehow
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google login successful:", user);
    this.successMessage = `Logged in as ${user.displayName}`;
    this.errorMessage = "";
    this.$router.push("/homepage");
  } catch (error) {
    console.error("Google login failed:", error);
    this.errorMessage = "Google login failed. Please try again.";
    this.successMessage = "";
  }
},

    loginWithApple() {
      console.log("do this before demo!!!!!!!!!!!!!!!!!!!!!!!!!!!!"); //before demo
    },



    
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

.success-message {
  color: green;
  margin-top: 10px;
  font-size: 14px;
}

.alt-login-options {
  margin-top: 20px;
}

.alt-login-options .divider {
  margin: 15px 0;
  font-size: 12px;
  color: #888;
}

.alt-login-options button {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.alt-login-options .google-login {
  background-color: #ffffff;
  color: #000;
  border: 1px solid #ccc;
}

.alt-login-options .google-login:hover {
  background-color: #f1f1f1;
}

.alt-login-options .apple-login {
  background-color: #000000;
  color: #fff;
}

.alt-login-options .apple-login:hover {
  background-color: #333;
}

.create-account {
  margin-top: 20px;
  font-size: 14px;
}

.create-account-link {
  color: #007bff;
  text-decoration: none;
}

.create-account-link:hover {
  text-decoration: underline;
}
</style>
