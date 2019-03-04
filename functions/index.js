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
      const added = snapshot();
      const addedObj = added.toJSON();
      // Get the case ID
      const caseID = addedObj.caseID;
      // Get the collection that has been written to
      const coll = snapshot.ref.parent.key;

      // Add this new datasnapshot to the audit log
      // (reference path has a /1 at the end to signals this was
      // the creation of a new case)
      return database.ref('/audits/'+coll+'/'+caseID+'/1').set(added);
    });

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseUpdated = functions.database.instance('miraclemessages-v2').ref('{coll}/{caseID}')
      .onUpdate((change, context) => {

      // Get the datasnapshot before the change was made
      const old = change.before;
      const oldObj = old.toJSON();

      // Get the collection that was updated
      console.log("Hiya it's me");
      console.log("Let's try this: " + JSON.stringify(oldObj));

      // Add this updated datasnapshot to the audit log
      // Create the appropriate reference path for the audit log object
      // by seeing if this is a subsequent addition to an already existing
      // audit log object and, if so, adjusting the path accordingly
      var addr = 'audits/'+context.params.coll+'/'+context.params.caseID+'/2';
      console.log('Let us see: ' + addr);


      console.log('No issues so far: '+addr);
      // Add this data snapshot to the audit log
      return old.ref.root.child(addr).set(oldObj);
        });

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseDeleted = functions.database.ref('')
      .onDelete((change, context) => {

      // Get the datasnapshot before the change was made
      const old = change.before;
      const oldObj = old.toJSON();
      // Get the case ID
      const caseID = oldObj.caseID;
      // Get the collection that was updated
      const coll = old.ref().parent.key;

      // Add this data snapshot to the audit log
      // (reference path has a /-1 at the end to signal this was
      // the deletion of a case)
      return database.ref('/audits/'+coll+'/'+caseID+'/-1').set(old);
        });
