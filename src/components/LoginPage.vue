<template>
  <!-- Main container for the login page -->
  <div class="login-container">
    <!-- Box containing the login form and other elements -->
    <div class="login-box">
      <!-- Title of the login section -->
      <h1>Log In</h1>
      <!-- Login form -->
      <form @submit.prevent="handleLogin">
        <!-- Label for the email input field -->
        <label for="email">Email</label>
        <!-- Email input field, bound to 'email' data property -->
        <input
          type="email"
          id="email"
          v-model="email"
          placeholder="Enter your email"
          required
        />

        <!-- Label for the password input field -->
        <label for="password">Password</label>
        <!-- Password input field, bound to 'password' data property -->
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />

        <!-- Submit button for the login form -->
        <button type="submit" class="login-button">Log In</button>
      </form>

      <!-- Error message displayed when there is an issue with login -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <!-- Success message displayed when login is successful -->
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <!-- Alternative login options -->
      <div class="alt-login-options">
        <!-- Divider text for visual separation -->
        <p class="divider">OR</p>
        <!-- Button to log in using Google -->
        <button @click="loginWithGoogle" class="google-login">Continue with Google</button>
        <!-- Button to log in using Apple -->
        <button @click="loginWithApple" class="apple-login">Continue with Apple</button>
      </div>

      <!-- Link to the account creation page -->
      <p class="create-account">
        New here? <a href="/RegisterPage" class="create-account-link">Create an account</a>
      </p>
    </div>
  </div>
</template>

<script>
/* Import Firebase authentication functions */
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default {
  /* Define reactive data properties */
  data() {
    return {
      email: "", // User's email input
      password: "", // User's password input
      errorMessage: "", // Message to display if there's a login error
      successMessage: "", // Message to display on successful login
    };
  },
  methods: {
    /* Handle login using email and password */
    async handleLogin() {
      const auth = getAuth(); // Initialize Firebase authentication
      try {
        // Sign in using the email and password provided
        const userCredential = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const user = userCredential.user; // Get user details
        this.successMessage = `Welcome back, ${user.email}!`; // Set success message
        this.errorMessage = ""; // Clear any existing error messages
        console.log("Login successful:", user);
        this.$router.push("/homepage"); // Redirect to the homepage
      } catch (error) {
        console.error("Login failed:", error); // Log the error
        // Set error message based on the error code
        this.errorMessage =
          error.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : "Please enter a correct password or email";
        this.successMessage = ""; // Clear success message
      }
    },

    /* Handle login using Google */
    async loginWithGoogle() {
      const auth = getAuth(); // Initialize Firebase authentication
      const provider = new GoogleAuthProvider(); // Set up Google provider for authentication
      try {
        // Sign in using Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user; // Get user details
        console.log("Google login successful:", user);
        this.successMessage = `Logged in as ${user.displayName}`; // Set success message
        this.errorMessage = ""; // Clear any existing error messages
        this.$router.push("/homepage"); // Redirect to the homepage
      } catch (error) {
        console.error("Google login failed:", error); // Log the error
        this.errorMessage = "Google login failed. Please try again."; // Set error message
        this.successMessage = ""; // Clear success message
      }
    },

    /* Placeholder for login using Apple (to be implemented) */
    loginWithApple() {
      console.log("do this before demo!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    },
  },
};
</script>

<style scoped>
/* Main container styling for centering content */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

/* Styling for the login box */
.login-box {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* Form styling */
form {
  display: flex;
  flex-direction: column;
}

/* Input field styling */
input {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

/* Button styling for the login button */
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

/* Change button color on hover */
button:hover {
  background-color: #45a049;
}

/* Styling for error messages */
.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}

/* Styling for success messages */
.success-message {
  color: green;
  margin-top: 10px;
  font-size: 14px;
}

/* Styling for alternative login options */
.alt-login-options {
  margin-top: 20px;
}

/* Divider text styling */
.alt-login-options .divider {
  margin: 15px 0;
  font-size: 12px;
  color: #888;
}

/* Styling for alternative login buttons */
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

/* Google login button styling */
.alt-login-options .google-login {
  background-color: #ffffff;
  color: #000;
  border: 1px solid #ccc;
}

/* Change Google button color on hover */
.alt-login-options .google-login:hover {
  background-color: #f1f1f1;
}

/* Apple login button styling */
.alt-login-options .apple-login {
  background-color: #000000;
  color: #fff;
}

/* Change Apple button color on hover */
.alt-login-options .apple-login:hover {
  background-color: #333;
}

/* Styling for account creation link */
.create-account {
  margin-top: 20px;
  font-size: 14px;
}

/* Link styling */
.create-account-link {
  color: #007bff;
  text-decoration: none;
}

/* Change link style on hover */
.create-account-link:hover {
  text-decoration: underline;
}

/* Default font for the entire page */
* {
  font-family: Arial, sans-serif;
}
</style>
