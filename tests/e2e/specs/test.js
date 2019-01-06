// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  "default e2e tests": browser => {
    browser
      .url(process.env.VUE_DEV_SERVER_URL)
      .waitForElementVisible("div[class=login-container]", 5000)
      .assert.title("Sign In with Auth0")
      .end();
  }
};
