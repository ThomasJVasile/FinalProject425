import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import LoginPage from "./components/LoginPage.vue";
import CreateEvent from "./components/CreateEvent.vue";  

const routes = [
  { path: "/homepage", name: "HomePage", component: HomePage },
  { path: "/log-in", name: "LoginPage", component: LoginPage },
 // {path: ""}
  { path: "/create-event", name: "CreateEvent", component: CreateEvent },  // Add CreateEvent route
  { path: "/", redirect: "/homepage" }  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
