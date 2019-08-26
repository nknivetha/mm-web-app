// this file should be loaded after firebase.js and firebase-database.js

// safe_assign used when importing data and certain values may be undefined
function safe_assign(c,a,b) {
	if ( typeof b !== 'undefined' )
		c[a] = b;
}

// used to create case object from CSV import
function MakeCaseFromCsv(csvRec) {
	var cName = csvRec["C0"];											// column A = Client Name
	var ID = cName + String(Math.floor(Math.random() * 100000));
	ID = ID.replace(/\s+/g, '');
	ID = ID.replace(/[/.]/g, '-');										// slashes in the case ID cause false nesting in the data

	if (ID.length < 6)
		return null;													// bogus record if name is too short
	
	var cData = {};
	cData.caseID = ID;
	try {
		cData.clientData = {};
		safe_assign(cData.clientData , "name" , cName);
		safe_assign(cData.clientData , "currentCity" , csvRec["C1"]);		// column B = Client Current City
		safe_assign(cData.clientData , "contactInfo" , csvRec["C2"]);		// column C = How To Reach Again
		safe_assign(cData.clientData , "DOB" , csvRec["C32"]);				// column AG = Client DOB
		safe_assign(cData.clientData , "hometown" , csvRec["C33"]);			// column AH = Client Hometown

		cData.loData = {};
		if (csvRec["C35"])
		{
			var loData1 = {};
			safe_assign(loData1 , "name" , csvRec["C35"]);					// column AJ = LO1 Name
			safe_assign(loData1 , "relationship" , csvRec["C36"]);			// column AK = LO1 Relationship
			safe_assign(loData1 , "age" , csvRec["C37"]);					// column AL = LO1 Age
			safe_assign(loData1 , "lastKnownLocation" , csvRec["C38"]);		// column AM = LO1 LK Loc
			safe_assign(loData1 , "lastConnected" , csvRec["C39"]);			// column AN = LO1 Last Connected
			safe_assign(loData1 , "contactInfo" , csvRec["C40"]);			// column AO = LO1 Contact Info
			safe_assign(cData.loData , "LO_1" , loData1);					// first loved one in array
			
			if (csvRec["C42"]) {
				var loData2 = {};
				safe_assign(loData2 , "name" , csvRec["C41"]);				// column AP = LO2 Name
				safe_assign(loData2 , "relationship" , csvRec["C42"]);		// column AQ = LO2 Relationship
				safe_assign(loData2 , "age" , csvRec["C43"]);				// column AR = LO2 Age
				safe_assign(loData2 , "lastKnownLocation" , csvRec["C44"]);	// column AS = LO2 LK Loc
				safe_assign(loData2 , "lastConnected" , csvRec["C45"]);		// column AT = LO2 Last Connected
				safe_assign(loData2 , "contactInfo" , csvRec["C46"]);		// column AU = LO2 Contact Info
				safe_assign(cData.loData , "LO_2", loData2);					// second loved one in array
			}
		}

		cData.recordData = {};
		safe_assign(cData.recordData , "recordingDate" , csvRec["C3"]);		// column D = Recording
		safe_assign(cData.recordData , "lastWorkedOn" , csvRec["C4"]);		// column E = Last Worked On
		safe_assign(cData.recordData , "youtubeLink" , csvRec["C21"]);		// column V = link to the MM (YouTube)
		safe_assign(cData.recordData , "attachmentLink" , csvRec["C22"]);	// column W = Attachments or Client Photo
																		// column X = Firebase ID

		cData.noteData = {};
		if (csvRec["C12"]) {
			safe_assign(cData.noteData , "caseNotes" , csvRec["C12"]);			// column M = Case Notes
			safe_assign(cData.noteData , "detectivePhone" , csvRec["C13"]);		// column N = Detective Phone
		}
		if (csvRec["C34"]) {
			safe_assign(cData.noteData , "submissionNotes" , csvRec["C34"]);	// column AI = Notes from Submission
		}
		if (csvRec["C47"]) {
			safe_assign(cData.noteData , "detectiveNotes" , csvRec["C47"]);		// column AT = Case Notes from Detective
		}

		cData.caseData = {};
		var caseStat = csvRec["C7"];						// column H = Case Status
		if (caseStat == "cold") {
			cData.caseData.caseStatus = -1;
		}
		else if (caseStat == "open" || caseStat == "waiting") {
			cData.caseData.caseStatus = 0;
		}
		else if (caseStat == "closed") {
			cData.caseData.caseStatus = 1;
		}
		
		var deliveryStat = csvRec["C8"];					// column I = Delivery Status
		if (deliveryStat == "did not post") {
			cData.caseData.deliveryStatus = -2;
		}
		else if (deliveryStat == "undelivered") {
			cData.caseData.deliveryStatus = 0;
		}
		else if (deliveryStat == "delivered") {
			cData.caseData.deliveryStatus = 1;
		}
		
		var reunionStat = csvRec["C9"];						// column J = Reunion Status
		// column K = Went home with intent to stay
		if (deliveryStat == "not yet reunited") {
			cData.caseData.reunionStatus = 0;
		}
		else if (reunionStat == "reunited") {
			cData.caseData.reunionStatus = 1;
		}
		else if (reunionStat == "declined") {
			cData.caseData.reunionStatus = -1;
		}
		else if (reunionStat == "n/a") {
			cData.caseData.reunionStatus = -2;
		}
		else if (reunionStat == "can't find client") {
			cData.caseData.reunionStatus = -3;
		}
		
		// get correct delivery date
		if (csvRec["C11"]) {
			safe_assign(cData.caseData , "deliveryDate" , csvRec["C11"]);	// column L = Date of Delivery | Cold
		}
		else if (csvRec["C14"]){
			safe_assign(cData.caseData , "deliveryDate" , csvRec["C14"]);	// column O = Delivery
		}
		
		safe_assign(cData.caseData , "reunionDate" , csvRec["C15"]);		// column P = Reunion
		safe_assign(cData.caseData , "FBLink" , csvRec["C16"]);			// column Q = FB Link
		safe_assign(cData.caseData , "FBLinkDate" , csvRec["C17"]);		// column R = FB Link Date
		// check if working with partner org for the case
		if (csvRec["C27"]) {
			cData.caseData.partnerInfo = {};
			safe_assign(cData.caseData.partnerInfo , "partnerOrg" , csvRec["C27"]);		// column AB = Partner Org
			safe_assign(cData.caseData.partnerInfo , "caseWorkerOrg" , csvRec["C28"]);	// column AC = Case Worker Org
			safe_assign(cData.caseData.partnerInfo , "caseWorkerName" , csvRec["C29"]);	// column AD = Case Worker Name
			safe_assign(cData.caseData.partnerInfo , "caseWorkerEmail" , csvRec["C30"]);	// column AE = Case Worker Email
			safe_assign(cData.caseData.partnerInfo , "caseWorkerPhone" , csvRec["C31"]);	// column AF = Case Worker Phone
		}

		cData.volunteerData {};
		safe_assign(cData.volunteerData , "volunteerName" , csvRec["C5"]);			// column F = Messenger Name
		safe_assign(cData.volunteerData , "volunteerContactInfo" , csvRec["C6"]);	// column G = Messenger Email
		safe_assign(cData.volunteerData , "caseManagerName" , csvRec["C18"]);		// column S = Case Manager
		safe_assign(cData.volunteerData , "caseMarkedCold" , csvRec["C19"]);			// Column T = Case Managers_if you mark a case as "cold" after 2 weeks, please add the number 1 here
		safe_assign(cData.volunteerData , "linktoMM" , csvRec["C20"]);				// Column U = Link to the MM
		safe_assign(cData.volunteerData , "messengerName" , csvRec["C24"]);			// column Y = Messenger Name
		safe_assign(cData.volunteerData , "messengerEmail" , csvRec["C25"]);			// column Z = Messenger Email
		safe_assign(cData.volunteerData , "messengerPhone" , csvRec["C26"]);			// column AA = Messenger Phone
	}
	catch (err) {
		window.alert(err.message);
		return null;
	} finally {
		return cData;
	}
}
