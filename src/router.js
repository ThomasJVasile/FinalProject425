import { createRouter, createWebHistory } from "vue-router";
import HomePage from "./components/HomePage.vue";
import LoginPage from "./components/LoginPage.vue";
import CreateEvent from "./components/CreateEvent.vue";  
import RegisterPage from "./components/RegisterPage.vue";
import EventDetailPage from "./components/EventDetailPage.vue"; 
import UserInboxPage from "./components/UserInboxPage.vue";
import UserProfilePage from "@/components/UserProfilePage.vue";
import EventsPage from "./components/EventsPage.vue";
import SettingsPage from "./components/SettingsPage.vue";
import FriendRequest from "@/components/FriendRequest.vue";

const routes = [
  { path: "/homepage", name: "HomePage", component: HomePage },
  { path: "/log-in", name: "LoginPage", component: LoginPage },
  { path: "/create-event", name: "CreateEvent", component: CreateEvent },
  { path: "/eventDetailPage/:id", name: "EventDetailPage", component: EventDetailPage },
  { path: "/RegisterPage", name: "RegisterPage", component: RegisterPage },
  { path: "/UserInboxPage", name: "UserInboxPage", component: UserInboxPage },
  { path: "/UserProfilePage", name: "UserProfilePage", component: UserProfilePage },
  { path: "/EventsPage", name: "EventsPage", component: EventsPage },
  { path: "/SettingsPage", name: "SettingsPage", component: SettingsPage },
  { path: "/friend-requests", name: "FriendRequests", component: FriendRequest },
  { path: "/", redirect: "/homepage" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;