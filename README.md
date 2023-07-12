 # Curtain Web API
---

This is a node.js package used to interact with the Curtain Web REST API.

## Installation

```bash
npm install curtain-web-api pouchdb -s
npm install @types/pouchdb -D
```

## Usage

```typescript
import { CurtainWebApi } from 'curtain-web-api';

const curtainAPI = new CurtainWebApi("https://curtain-api-location/")


// Login to the API 

curtainAPI.login("username", "password").then((result) => {
    console.log(result);
    // The result is an object containing the user's information
}).catch((error) => {
    console.log(error);
});

// Get the user's information
curtainAPI.getUser().then((result) => {
    console.log(result);
    // The result is an object containing the user's information similar to the login but can only be performed after login have succeeded
}).catch((error) => {
    console.log(error);
});

// Get session information
curtainAPI.getSessionSettings(sessionId).then((result) => {
    console.log(result);
    // The result is an object containing the session's basic information without any data
}).catch((error) => {
    console.log(error);
});


// Get session data
curtainAPI.postSettings(sessionId, sessionToken).then((result) => {
    console.log(result);
    // The result is an object containing the session's data
}).catch((error) => {
    console.log(error);
});


// Upload session data
curtainAPI.putSettings(settings, enableToPublic, description, sessionType).then((result) => {
    console.log(result);
    // The result is an object containing the session's data
}).catch((error) => {
    console.log(error);
});
```