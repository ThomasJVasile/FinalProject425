<template>
  <v-app>
    
    <NavBar :isDark="isDark" :toggleDarkMode="toggleDarkMode" />

   
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import { useTheme } from 'vuetify';
import { watch, ref } from 'vue';

export default {
  name: "App",
  components: {
    NavBar,
  },
  setup() {
    const theme = useTheme();
    
    // Make the dark mode state reactive and update when the theme changes
    const isDark = ref(theme.global.name.value === 'dark');

    // Toggle Dark/Light Mode
    const toggleDarkMode = () => {
      const newTheme = isDark.value ? 'light' : 'dark';
      theme.global.name.value = newTheme;
      isDark.value = !isDark.value; // Update the isDark state
    };

    // Persist theme preference
    watch(() => theme.global.name.value, (newTheme) => {
      localStorage.setItem('theme', newTheme);
    });

    // On startup, load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.global.name.value = savedTheme;
      isDark.value = savedTheme === 'dark'; // Sync the isDark state
    }

    return {
      isDark,
      toggleDarkMode
    };
  },
};
</script>

<style scoped>

@media (max-width: 768px) {
  .v-main {
    padding: 8px;
  }
}

</style>
