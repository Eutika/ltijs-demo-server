require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')
const { connect } = require('http2')
const lti = require('ltijs').Provider

console.log(process.env)

// Setup
lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS },
    debug: true
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.redirect(process.env.APP_URL)
})


// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: 'moodle',
    clientId: process.env.CLIENT_ID,
    authenticationEndpoint: process.env.AUTH_ENDPOINT,
    accesstokenEndpoint: process.env.TOKEN_ENDPOINT,
    authConfig: { method: 'JWK_SET', key: process.env.KEY_ENDPOINT }
  })
}

setup()
