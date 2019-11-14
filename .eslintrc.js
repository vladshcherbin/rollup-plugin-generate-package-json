module.exports = {
  extends: 'airbnb-base',
  rules: {
    'comma-dangle': ['error', 'never'],
    semi: ['error', 'never']
  },
  overrides: [{
    files: ['tests/fixtures/src/**/*.js'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['@google-cloud/bigquery', 'koa'] }]
    }
  }],
  env: {
    jest: true
  }
}
