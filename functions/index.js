const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Listens for new cases added to any of the database's collections
// and logs the added case info in the audit collection
exports.logCaseAdded = functions.database.ref('')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const added = snapshot.toJSON();
      // Get the case ID
      const caseID = added.caseID;
      // Get the collection that has been written to
      const coll = snapshot.ref.root.child.key;

      // Add this new datasnapshot to the audit log
      // (reference path has a /1 at the end to signals this was
      // the creation of a new case)
      return database.ref('/audits/'+coll+'/'+caseID+'/1').set(added);
    });

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseUpdated = functions.database.ref('')
      .onUpdate((change, context) => {

      // Get the datasnapshot before the change was made
      const old = change.before.toJSON();
      // Get the case ID
      const caseID = old.caseID;
      // Get the collection that was updated
      const coll = old.ref.root.child.key;

      // Add this updated datasnapshot to the audit log
      // Create the appropriate reference path for the audit log object
      // by seeing if this is a subsequent addition to an already existing
      // audit log object and, if so, adjusting the path accordingly
      const addr = '/audits/'+coll+'/'+caseID+'/2';
      if (database.ref(addr) != null) {
        const num = 2;
        while (database.ref(addr) != null) {
          num += 1;
          addr = '/audits/'+coll+'/'+caseID+'/'+String(num);
        }
      }

      // Add this data snapshot to the audit log
      return database.ref(addr).set(old);
        });

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseUpdated = functions.database.ref('')
      .onUpdate((change, context) => {

      // Get the datasnapshot before the change was made
      const old = change.before.toJSON();
      // Get the case ID
      const caseID = old.caseID;
      // Get the collection that was updated
      const coll = old.ref.root.child.key;

      // Add this data snapshot to the audit log
      // (reference path has a /-1 at the end to signal this was
      // the deletion of a case)
      return database.ref('/audits/'+coll+'/'+caseID+'/-1').set(old);
        });
