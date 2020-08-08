#!/usr/bin/env ts-node-script

import populate from "../../lib/firestore/populate"
import instructions from "../../populate-instructions.json"
import initializeAdminSDK from "../../src/firebase/initializeAdminSDK"

populate(initializeAdminSDK().firestore(), instructions, "projects", {
  testMode: true,
  writeDump: true,
  writeNetworkDump: true,
}).catch((error) => console.error(error))
