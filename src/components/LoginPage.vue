<!-- <template>
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

        <v-btn
          text
          class="forgot-password-link"
          @click="showForgotPasswordDialog = true"
          style="text-transform:none; font-size: 14px; margin-bottom: 8px;"
        >
          Forgot Password?
        </v-btn>

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

    <v-dialog v-model="showForgotPasswordDialog" max-width="400">
      <v-card>
        <v-card-title>Reset Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="forgotPasswordEmail"
            label="Enter your email"
            type="email"
            required
          />
          <v-alert
            v-if="forgotPasswordMessage"
            :type="forgotPasswordSuccess ? 'success' : 'error'"
            class="mt-2"
            dense
          >
            {{ forgotPasswordMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showForgotPasswordDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="sendPasswordReset">Send Link</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
      showForgotPasswordDialog: false,
      forgotPasswordEmail: "",
      forgotPasswordMessage: "",
      forgotPasswordSuccess: false,
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

    async sendPasswordReset() {
      this.forgotPasswordMessage = "";
      this.forgotPasswordSuccess = false;
      if (!this.forgotPasswordEmail) {
        this.forgotPasswordMessage = "Please enter your email address.";
        return;
      }
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, this.forgotPasswordEmail);
        this.forgotPasswordMessage = "Password reset link sent! Check your email.";
        this.forgotPasswordSuccess = true;
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          this.forgotPasswordMessage = "No user found with this email.";
        } else if (error.code === "auth/invalid-email") {
          this.forgotPasswordMessage = "Invalid email address.";
        } else {
          this.forgotPasswordMessage = "Failed to send reset email. Please try again.";
        }
        this.forgotPasswordSuccess = false;
      }
    },
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

.forgot-password-link {
  min-width: 0;
  padding: 0;
  margin-left: 0;
  color: #1976d2 !important;
}
.forgot-password-link:hover {
  text-decoration: underline;
}

.v-dialog .v-card {
  background: #fff !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  border-radius: 12px;
  padding: 16px 0;
}

.v-dialog .v-text-field,
.v-dialog .v-text-field input {
  background: #fff !important;
}
</style>
 -->


 <template>
  <v-container fluid class="d-flex justify-center align-center" style="height: 100vh;">
    <v-card class="pa-5" max-width="400px" elevation="10" rounded="xl">
      <v-card-title class="text-center">
        <v-icon class="mr-2">mdi-lock</v-icon>
        <span class="text-h6 font-weight-bold">Log In</span>
      </v-card-title>

      <v-form @submit.prevent="handleLogin">
        <v-text-field
          v-model="email"
          label="Email"
          type="email"
          outlined
          dense
          required
          class="mt-3"
        />

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          outlined
          dense
          required
          class="mt-3"
        />

        <v-btn
          text
          class="forgot-password-link"
          @click="showForgotPasswordDialog = true"
          style="text-transform:none; font-size: 14px; margin-bottom: 8px;"
        >
          Forgot Password?
        </v-btn>

        <v-btn type="submit" color="primary" block class="mt-4">Log In</v-btn>
      </v-form>

      <v-alert v-if="errorMessage" type="error" class="mt-3" dense>
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="successMessage" type="success" class="mt-3" dense>
        {{ successMessage }}
      </v-alert>

      <v-divider class="my-4">OR</v-divider>

      <v-btn
        @click="loginWithGoogle"
        color="white"
        class="google-btn mb-2"
        block
        elevation="1"
        prepend-icon="mdi-google"
      >
        Continue with Google
      </v-btn>

      <v-btn
        @click="loginWithApple"
        color="black"
        class="mb-2"
        block
        elevation="1"
        prepend-icon="mdi-apple"
      >
        Continue with Apple
      </v-btn>

      <v-card-text class="text-center mt-4">
        New here?
        <v-btn to="/RegisterPage" text class="ml-1 text-primary font-weight-bold">
          Create an account
        </v-btn>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showForgotPasswordDialog" max-width="400">
      <v-card>
        <v-card-title>Reset Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="forgotPasswordEmail"
            label="Enter your email"
            type="email"
            required
          />
          <v-alert
            v-if="forgotPasswordMessage"
            :type="forgotPasswordSuccess ? 'success' : 'error'"
            class="mt-2"
            dense
          >
            {{ forgotPasswordMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showForgotPasswordDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="sendPasswordReset">Send Link</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
      showForgotPasswordDialog: false,
      forgotPasswordEmail: "",
      forgotPasswordMessage: "",
      forgotPasswordSuccess: false,
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

    async sendPasswordReset() {
      this.forgotPasswordMessage = "";
      this.forgotPasswordSuccess = false;
      if (!this.forgotPasswordEmail) {
        this.forgotPasswordMessage = "Please enter your email address.";
        return;
      }
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, this.forgotPasswordEmail);
        this.forgotPasswordMessage = "Password reset link sent! Check your email.";
        this.forgotPasswordSuccess = true;
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          this.forgotPasswordMessage = "No user found with this email.";
        } else if (error.code === "auth/invalid-email") {
          this.forgotPasswordMessage = "Invalid email address.";
        } else {
          this.forgotPasswordMessage = "Failed to send reset email. Please try again.";
        }
        this.forgotPasswordSuccess = false;
      }
    },
  },
};
</script>

<style scoped>
.v-container {
  background-color: #f4f6f8;
}

.google-btn {
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  font-weight: 500;
}

.v-btn .v-icon {
  margin-right: 8px;
}

.v-card-title {
  justify-content: center;
}

.v-dialog .v-card {
  background: #fff !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  border-radius: 12px;
  padding: 16px 0;
}

.v-dialog .v-text-field,
.v-dialog .v-text-field input {
  background: #fff !important;
}
</style>
