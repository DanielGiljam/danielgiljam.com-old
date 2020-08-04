#!/usr/bin/env ts-node-script

import firestore from "../../lib/firestore"
import populate from "../../lib/firestore/populate"
import instructions from "../../populate-instructions.json"

populate(firestore, instructions, "projects", {
  testMode: true,
  writeDump: true,
}).catch((error) => console.error(error))
