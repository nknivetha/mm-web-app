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

      // Get the collection that has been written to
      const coll = snapshot.ref.parent.key;

      // Make sure the addition isn't in the audits or queue collections
      if (coll != 'audits' && col1 != 'queue') {

            // Grab the current value of what was written to the Realtime Database.
            const added = snapshot();
            const addedObj = added.toJSON();
            // Get the case ID
            const caseID = addedObj.caseID;

            // Add this new datasnapshot to the audit log
            // (reference path has a /1 at the end to signals this was
            // the creation of a new case)
            return database.ref('/audits/'+coll+'/'+caseID+'/1').set(added);
      }
});

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseUpdated = functions.database.instance('miraclemessages-v2').ref('{coll}/{caseID}')
      .onUpdate((change, context) => {

      // Get the collection that was being updated
      const col1 = context.params.coll

      // Make sure the change isn't being made in the audits or queue collections
      if (col1 != 'audits' && col1 != 'queue') {

            // Get the datasnapshot before the change was made
            const old = change.before;
            const oldObj = old.toJSON();

            // Add this updated datasnapshot to the audit log
            // Create the appropriate reference path for the audit log object
            // by seeing if this is a subsequent addition to an already existing
            // audit log object and, if so, adjusting the path accordingly
            var i = 2;
            var auditRef = db.doc('audits/'+col1+'/'+context.params.caseID+'/'+String(i));
            while (auditRef.exists) {
                  i++;
                  auditRef = db.doc('audits/'+col1+'/'+context.params.caseID+'/'+String(i));
            }
            var addr = 'audits/'+coll+'/'+context.params.caseID+'/'+String(i);

            // Add this data snapshot to the audit log
            return old.ref.root.child(addr).set(oldObj);
      }
});

// Listens for existing cases being updated in any of the db's collections
// and logs the old case info in the audit collection
exports.logCaseDeleted = functions.database.ref('')
      .onDelete((change, context) => {

      // Get the collection of the deleted case
      const coll = old.ref().parent.key;

      // Make sure the delete isn't happening in the audits or queue collections
      if (coll != 'audits' && col1 != 'queue') {

            // Get the datasnapshot before the change was made
            const old = change.before;
            const oldObj = old.toJSON();
            // Get the case ID
            const caseID = oldObj.caseID;

            // Add this data snapshot to the audit log
            // (reference path has a /-1 at the end to signal this was
            // the deletion of a case)
            return database.ref('/audits/'+coll+'/'+caseID+'/-1').set(old);
      }
});
