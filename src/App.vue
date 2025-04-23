<template>
  <v-app>
   
    <NavBar />

   
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "@/components/NavBar.vue";

export default {
  name: "App",
  components: {
    NavBar,
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
