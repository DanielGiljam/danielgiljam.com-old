import {homedir} from "os"
import {relative} from "path"

import admin from "firebase-admin"

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
if (serviceAccountKey == null) {
  throw new Error(
    "Environment variable FIREBASE_SERVICE_ACCOUNT_KEY is not defined.",
  )
}

const databaseURL = process.env.FIREBASE_DATABASE_URL
if (databaseURL == null) {
  throw new Error("Environment variable FIREBASE_DATABASE_URL is not defined.")
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(relative(
  __dirname,
  serviceAccountKey.replace(/^~\//, homedir() + "/"),
))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
})

export default admin.firestore()
