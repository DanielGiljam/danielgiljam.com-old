#!/usr/bin/env ts-node-script

import dotenv from "dotenv"

import populate from "../../lib/firestore/populate"
import instructions from "../../populate-instructions.json"
import initializeAdminSDK from "../../src/firebase/firestore/admin/initialize"

dotenv.config()

populate(
  initializeAdminSDK().firestore(),
  instructions,
  "projects",
).catch((error) => console.error(error))
