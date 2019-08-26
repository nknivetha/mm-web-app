// this file should be loaded after firebase.js and firebase-database.js

// creating the case data from the database
// completion function for assigning the data (has to be static)
// this decouples the building of the edit page from the accumulation of the data
// (see the MakeEditDialog function below)

// the unkeptPromises variable keeps track of the number of database requests that have not
// yet fired their completion function.  This imposes synchronous behavior on what is intended
// to be an asynchronous data platform (Firebase), but it makes sure that the user interfaces 
// with the object only when it is all here
function addFromDB(dataref, caseObjectPart, caseObject )  {
	try {
		dataref.once('value').then(
			function(snapshot) {
				// add the info to the caseObject
				let data = snapshot.val();
				for (let key in data) {
					caseObjectPart[key] = data[key];
				}
				caseObject.unkeptPromises -= 1;
			}
		);
	}
	catch(e) {
		caseObject.unkeptPromises -= 1;	// when no data exists, but data was requested (??)
	}
}

// master plan
function MakeCaseFromDB(caseID, theDB, onlyNotes=false) {
	var caseObject = {};
	caseObject.caseID = caseID;
	caseObject.noteData = {};
	caseObject.unkeptPromises = 1;
	addFromDB( theDB.ref("/notes/"+caseID) , caseObject.noteData , caseObject );

	if (!onlyNotes) {
		caseObject.clientData = {};
		caseObject.loData = {};
		caseObject.recordData = {};
		caseObject.caseData = {};
		caseObject.volunteerData = {};
		caseObject.unkeptPromises += 5;

		addFromDB( theDB.ref("/cases/"+caseID) , caseObject.caseData , caseObject );
		addFromDB( theDB.ref("/clients/"+caseID) , caseObject.clientData , caseObject );
		addFromDB( theDB.ref("/loved_ones/"+caseID) , caseObject.loData , caseObject );
		addFromDB( theDB.ref("/records/"+caseID) , caseObject.recordData , caseObject );
		addFromDB( theDB.ref("/volunteers/"+caseID) , caseObject.volunteerData , caseObject );
	}

	return caseObject;
}
