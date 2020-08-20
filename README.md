# danielgiljam.com

My portfolio site.

For the initial version it would consolidate projects of mine from different sources and display them neatly at the domain _danielgiljam.com_.

## Project Structure

Everything would be hosted on Firebase.

### Back-End

- Firestore would be used for the database (containing projects)
- Firestore Security Rules, Cloud Functions and Pub/Subs would make sure the database is kept up to date, maintain its integrity, generate meta-data, etc.
- There would be a library for managing the database
  - Used primarily for the inital population of the database
  - Secondarily used by the Cloud Functions and Pub/Subs
  - Possibly also used by future tools for managing the data in the database (tools that I would develop in the future)

### Front-End

- Statically hosted
- Hydrates client-side
  - Integrates with the browser using History API, Service Worker API, etc.
- Modern app-like website
- The implementation for the initial version uses Next.js and React (because I'm used to those technologies)
- I plan to implement later versions with a custom Rollup build system and Preact + native web components for the UI

## What You Can Do As Of Right Now

### Populate The Database

_**NOTE:** You need Node.js 12.9.0 or later!_

1. [Get a Firebase Service Account Key](https://firebase.google.com/docs/firestore/quickstart#initialize) and place it in the root of the project and rename it to `firebase-service-account-key.json`
1. Start up the Firebase Local Emulator Suite
1. Write a `.env` file where you specify the following environment variables:
   ```bash
   # The URL that the Firebase Local Emulator Suite spits out when it fires up
   FIREBASE_EMULATOR_HOST="localhost:8080"
   # A valid GitHub Access Token so that the "populate" script can access GitHub's API
   GITHUB_ACCESS_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
1. Write a `populate-instructions.json` file
1. Run `npm run populate`
1. Inspect your data at `http://localhost:4000/firestore`

### View A Very WIP Version Of The Front-End

1. Run `npm run dev`
2. Open `http://localhost:3000` in your browser
