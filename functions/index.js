const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
admin.initializeApp();
const firestore = admin.firestore();

exports.onUserStatusChanged = functions.database.ref("/status/{uid}/status").onUpdate(async (change, context) => {
  // Get the data written to Realtime Database

  const uid = context.params.uid;
  const userStatusFirestoreRef = firestore.doc(`users/${uid}`);

  const eventStatus = change.after.val();

  if (eventStatus === "offline") {
    return userStatusFirestoreRef.set({ status: "offline" }, { merge: true });
  }

  console.log(eventStatus, "xxxevent-staus");
  console.log(context.params.uid, "user uid context");
  //   const userStatusFirestoreRef = firestore.doc(`status/${context.params.uid}`);
});
