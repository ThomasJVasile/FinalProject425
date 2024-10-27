import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import LoginPage from "./components/LoginPage.vue";
import CreateEvent from "./components/CreateEvent.vue";  
import RegisterPage from "./components/RegisterPage.vue";
import EventDetailPage from "./components/EventDetailPage.vue"; 


const routes = [
  { path: "/homepage", name: "HomePage", component: HomePage },
  { path: "/log-in", name: "LoginPage", component: LoginPage },
 // {path: ""}
  { path: "/create-event", name: "CreateEvent", component: CreateEvent },
  { path: "/eventDetailPage/:id", name: "EventDetailPage", component: EventDetailPage },  // Add CreateEvent route
  { path: "/RegisterPage", name: "RegisterPage", component: RegisterPage},
  { path: "/", redirect: "/homepage" }  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
