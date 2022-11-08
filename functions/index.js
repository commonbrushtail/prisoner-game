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

exports.onRoomClosing = functions
  .region("asia-southeast1")
  .database.ref("/rooms/{roomId}/")
  .onUpdate((change, context) => {
    //var roomId = context.params.roomId;

    if (Object.keys(change.after.val()).length < 5) {
      var ref = change.after.ref;
      return ref.remove();
    } else if (change.after.val().roomClosing === true || (change.after.val().guestLeaving && change.after.val().hostLeaving)) {
      var ref = change.after.ref;
      return ref.remove();
    }
  });
