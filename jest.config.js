module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'vue'],
  transformIgnorePatterns: ['/node_modules/']
};
