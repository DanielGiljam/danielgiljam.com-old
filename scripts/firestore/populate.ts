#!/usr/bin/env ts-node

import firestore from "../../lib/firestore"
import populate from "../../lib/firestore/populate"
import instructions from "../../populate-instructions.json"

populate(firestore, instructions, {
  testMode: true,
  writeDump: true,
}).catch((error) => console.error(error))
