#!/usr/bin/env ts-node

import firestore from "../../lib/firestore"
import populate from "../../lib/firestore/populate"
import instructions from "../../populate-instructions.json"

populate(firestore, instructions).catch((error) => console.error(error))
