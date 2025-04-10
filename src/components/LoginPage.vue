<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-5" max-width="400px" outlined>
      <v-card-title class="text-center">
        <v-typography variant="h5">Log In</v-typography>
      </v-card-title>

      <v-form @submit.prevent="handleLogin">
        <v-text-field v-model="email" label="Email" type="email" outlined dense required />

        <v-text-field v-model="password" label="Password" type="password" outlined dense required />

        <v-btn type="submit" color="primary" block class="mt-4">Log In</v-btn>
      </v-form>

      <v-alert v-if="errorMessage" type="error" class="mt-3" dismissible>
        {{ errorMessage }}
      </v-alert>

      <v-alert v-if="successMessage" type="success" class="mt-3" dismissible>
        {{ successMessage }}
      </v-alert>

      <v-divider class="my-4">OR</v-divider>

      <v-btn @click="loginWithGoogle" color="blue" block class="mt-3">Continue with Google</v-btn>
      <v-btn @click="loginWithApple" color="black" block class="mt-3">Continue with Apple</v-btn>

      <v-card-text class="text-center mt-4">
        New here? <v-btn to="/RegisterPage" text>Create an account</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
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
        await user.reload();

        if (!user.emailVerified) {
          console.log("Please verify your email before logging in.");
          this.errorMessage = "Please verify your email to login.";
          this.successMessage = "";
          await auth.signOut(); 
          return;
        }


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
.v-container {
  background-color: #f5f5f5;
}

.v-card {
  background-color: #ffffff;
}

.v-btn {
  font-size: 16px;
}

.v-alert {
  font-size: 14px;
}
</style>
