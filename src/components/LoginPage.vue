<template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-5" max-width="400px" outlined>
      <v-card-title class="text-center">
        <v-typography variant="h5">Log In</v-typography>
      </v-card-title>

      <v-form @submit.prevent="handleLogin">
        <v-text-field v-model="email" label="Email" type="email" outlined dense required 
          class="v-text-field-custom" />

        <v-text-field v-model="password" label="Password" type="password" outlined dense required 
          class="v-text-field-custom" />

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

      <v-dialog v-model="showForgotPasswordDialog" max-width="400px">
        <v-card>
          <v-card-title>Reset Password</v-card-title>
          <v-card-text>
            <p class="mb-4">Enter your email address and we'll send you a link to reset your password.</p>
            <v-form @submit.prevent="handlePasswordReset">
              <v-text-field
                v-model="resetEmail"
                label="Email"
                type="email"
                outlined
                dense
                required
              />
              <v-alert
                v-if="resetMessage"
                :type="resetStatus"
                class="mt-3"
                dismissible
              >
                {{ resetMessage }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              text
              @click="showForgotPasswordDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              :loading="isResetting"
              @click="handlePasswordReset"
            >
              Send Reset Link
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
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
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        await user.reload();

        if (!user.emailVerified) {
          this.errorMessage = "Please verify your email to login.";
          this.successMessage = "";
          await auth.signOut();
          return;
        }

        this.successMessage = `Welcome back, ${user.email}!`;
        this.errorMessage = "";
        this.$router.push("/homepage");
      } catch (error) {
        this.errorMessage =
          error.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : "Please enter a correct password or email";
        this.successMessage = "";
      }
    },

    async loginWithGoogle() {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        this.successMessage = `Logged in as ${user.displayName}`;
        this.errorMessage = "";
        this.$router.push("/homepage");
      } catch (error) {
        this.errorMessage = "Google login failed. Please try again.";
        this.successMessage = "";
      }
    },

    loginWithApple() {
      console.log("do this before demo!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    },

    async handlePasswordReset() {
      if (!this.resetEmail) {
        this.resetMessage = "Please enter your email address";
        this.resetStatus = "error";
        return;
      }

      this.isResetting = true;
      const auth = getAuth();

      try {
        await sendPasswordResetEmail(auth, this.resetEmail);
        this.resetMessage = "Password reset email sent! Please check your inbox.";
        this.resetStatus = "success";
        
        setTimeout(() => {
          this.showForgotPasswordDialog = false;
          this.resetMessage = "";
          this.resetEmail = "";
        }, 3000);

      } catch (error) {
        console.error("Password reset failed:", error);
        this.resetStatus = "error";
        
        switch (error.code) {
          case 'auth/user-not-found':
            this.resetMessage = "No account found with this email address.";
            break;
          case 'auth/invalid-email':
            this.resetMessage = "Please enter a valid email address.";
            break;
          case 'auth/too-many-requests':
            this.resetMessage = "Too many attempts. Please try again later.";
            break;
          default:
            this.resetMessage = "Failed to send reset email. Please try again.";
        }
      } finally {
        this.isResetting = false;
      }
    }
  },
};
</script>

<style scoped>
.v-container {
  background-color: var(--v-background-base);
}

.v-card {
  background-color: var(--v-card-background);
}

.v-text-field-custom input {
  color: var(--v-text-base);
}

.v-btn {
  font-size: 16px;
}

.v-alert {
  font-size: 14px;
}

.v-divider {
  border-color: var(--v-divider-color);
}

.v-btn {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.v-btn.primary {
  background-color: var(--v-primary-base);
  color: var(--v-on-primary-base);
}

.v-btn.primary:hover {
  background-color: var(--v-primary-darken);
}

.v-btn.blue {
  background-color: #3b82f6;
  color: white;
}

.v-btn.black {
  background-color: #1e1e1e;
  color: white;
}
</style>

