import { shallowMount } from "@vue/test-utils";
import HomePage from "@/components/HomePage.vue";

describe("HomePage.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(HomePage, {
      data() {
        return {
          searchQuery: "",
          selectedCategories: ["Sports"],
          events: [
            { id: 1, eventName: "Basketball Game", ownerName: "Alex", categories: ["Sports"] },
            { id: 2, eventName: "Chess Tournament", ownerName: "Sam", categories: ["Games"] },
          ],
        };
      },
    });
  });

  it("should filter events based on search query", async () => {
    wrapper.setData({ searchQuery: "Basketball" });
    expect(wrapper.vm.filteredEvents).toHaveLength(1);
    expect(wrapper.vm.filteredEvents[0].eventName).toBe("Basketball Game");
  });

  it("should filter events based on selected category", async () => {
    expect(wrapper.vm.filteredEvents).toHaveLength(1);
    expect(wrapper.vm.filteredEvents[0].eventName).toBe("Basketball Game");
  });

  it("should return all events if no filters are applied", async () => {
    wrapper.setData({ searchQuery: "", selectedCategories: [] });
    expect(wrapper.vm.filteredEvents).toHaveLength(2);
  });
});
