const http = require('http');
const express = require('express');
const session = require('express-session');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const randomString = require("randomstring");

const { createHash } = require('crypto');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'ping one',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.set('view engine', 'ejs');

// Express endpoint to redirect to the login path for PingOne
app.get('/login', async (req, res) => {
    // Generate a unique code_verifier for this session
    const code_verifier = randomString.generate(128);
    req.session.code_verifier = code_verifier;

    // Create the authorization url expected by PingOne
    authorizationRequest = new URL(process.env.PINGONE_AUTH_ENDPOINT);
    authorizationRequest.searchParams.append('redirect_uri', process.env.REDIRECT_URI);
    authorizationRequest.searchParams.append('client_id', process.env.PINGONE_CLIENT_ID);
    authorizationRequest.searchParams.append('scope', process.env.PINGONE_SCOPES);
    authorizationRequest.searchParams.append('response_type', 'code');
    const code_challenge = createHash('sha256').update(code_verifier).digest('base64url');
    authorizationRequest.searchParams.append('code_challenge', code_challenge);
    authorizationRequest.searchParams.append('code_challenge_method', 'S256');

    // Redirect to the PingOne authorization url for your environment to begin the authentication process
    res.redirect(authorizationRequest.toString());
});

// Extract the callback path if the redirect uri is present, otherwise use /callback
const redirectUri = process.env.REDIRECT_URI;
const match = redirectUri.match(/:\d+(\/.*)/);
const callbackPath = match ? match[1] : "/callback";

// Express endpoint serving as the REDIRECT_URI for PingOne
// Expecting query parameter of `code`
app.get(callbackPath, async (req, res) => {
    const authorizationCode = req.query?.code;

    // Check for the authorization code
    if (!authorizationCode) {
        res.status(404).send('Authorization code not found:' + req.url);
    }

    // Retrieve the code_verifier from the session
    const code_verifier = req.session.code_verifier;
    if (!code_verifier) {
        return res.status(400).send('Code verifier not found in session');
    }

    // The authorization code flow requires auth code based on the user credentials and
    // the base64 encoded client credentials assigned to the application created in PingOne
    const url = process.env.PINGONE_TOKEN_ENDPOINT;
    const clientCredentials = process.env.PINGONE_CLIENT_ID + ':' + process.env.PINGONE_CLIENT_SECRET;
    const authorizationHeader = 'Basic ' + Buffer.from(clientCredentials).toString('base64');

    // URLSearchParams is used as the Content-Type is application/x-www-form-urlencoded
    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', authorizationCode);
    body.append('redirect_uri', process.env.REDIRECT_URI);
    body.append('code_verifier', code_verifier);

    // Back channel call to PingOne for the user access token
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authorizationHeader
            },
            body
        });

        if (response.ok) {
            // Authentication Successful
            const result = await response.json();

            // Update the success action for your app's implementation here
            // Save tokens to session data
            req.session.data = {
                accessToken: result.access_token,
                idToken: result.id_token
            }

            // Redirect to the user dashboard
            res.redirect('/dashboard');
        } else {
            // Unexpected response
            res.status(response.status).send(response.json());
        }
    } catch (error) {
        // Error response
        console.log(error);
        res.status(500).send(error);
    }
});

// End the app session as well as the PingOne session
app.get('/logout', async function(req, res){
    req.session.destroy();
    res.redirect(process.env.PINGONE_SIGNOFF_ENDPOINT);
});

// Website dashboard page
app.get('/dashboard', function(req, res){
    // Re-authenticate if no session is found
    if (!req.session.data) {
        return res.redirect('login');
    }

    // Session exists so render dashboard
    res.render('dashboard', {
        accessToken: req.session.data.accessToken,
        idToken: req.session.data.idToken
    });
});

// Website default page
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);