module.exports = function(env) {
  console.log('env ----------> ', env)

  return {

    CORS_ENABLED: true,
    CORS_ORIGIN: 'array:https://prod-onrr-cms.app.cloud.gov,https://prod-onrr-frontend.app.cloud.gov,https://beta.onrr.gov,http://0.0.0.0:8055'
  }
};
