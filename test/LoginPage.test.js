import { mount } from '@vue/test-utils';
import LoginPage from "../src/components/LoginPage.vue";


describe('LoginPage.vue', () => {
  it('renders the login form', () => {
    const wrapper = mount(LoginPage);
    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('updates email and password fields', async () => {
    const wrapper = mount(LoginPage);
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    expect(wrapper.vm.email).toBe('test@example.com');
    expect(wrapper.vm.password).toBe('password123');
  });
});
