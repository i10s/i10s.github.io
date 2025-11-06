module.exports = {
  require: ['tests/setup.js'],
  spec: 'tests/**/*.test.js',
  timeout: 5000,
  ui: 'bdd',
  reporter: 'spec',
  color: true,
  bail: false,
  recursive: true
};
