import admin from "firebase-admin"

import serviceAccountKey from "../../../firebase-service-account-key.json"

const initializeAdminSDK = (): admin.app.App => {
  try {
    return admin.app()
  } catch (error) {
    return admin.initializeApp({
      credential: admin.credential.cert(
        serviceAccountKey as admin.ServiceAccount,
      ),
    })
  }
}

export default initializeAdminSDK
