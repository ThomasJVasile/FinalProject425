import { shallowMount } from "@vue/test-utils";
import CreateEvent from "@/components/CreateEvent.vue";

describe("CreateEvent.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(CreateEvent);
    
    jest.spyOn(wrapper.vm, "moderateContent").mockResolvedValue(true);
    jest.spyOn(wrapper.vm, "GeoLocationAddress").mockResolvedValue({
      latitude: 36.1699, longitude: -115.1398 
    });
  });

  it("should not create event if the user is not authenticated", async () => {
    await wrapper.setData({ isAuthenticated: false });
    await wrapper.vm.$nextTick();

    await wrapper.vm.createEvent();
    expect(wrapper.vm.message).toBe("You must be logged in to create an event.");
  });

  it("should block event creation if the title contains inappropriate content", async () => {
    await wrapper.setData({ isAuthenticated: true, eventTitle: "BadWordHere" });
    await wrapper.vm.$nextTick();

    jest.spyOn(wrapper.vm, "moderateContent").mockResolvedValue(false);
    
    await wrapper.vm.createEvent();
    expect(wrapper.vm.message).toBe("Your event title contains inappropriate content.");
  });

  it("should successfully create an event if all conditions are met", async () => {
    await wrapper.setData({
      isAuthenticated: true,
      eventTitle: "Fun Party",
      eventDate: "2025-03-10",
      eventLocation: "Las Vegas",
      eventDescription: "Let's have fun and do Vegas stuff :> ",
      selectedCategories: ["Parties"],
    });
    await wrapper.vm.$nextTick();

    await wrapper.vm.createEvent();
    expect(wrapper.vm.message).toBe("Event created successfully!");
  });
});
