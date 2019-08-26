// Setup a dictionary to map from header names (such as Loved Ones) to the
// database collection name (loved_ones).
const headerToColl = {'Case Overview': 'cases',
                      'Client': 'clients',
                      'Loved Ones': 'loved_ones',
                      'Notes': 'notes',
                      'Recordings': 'records',
                      'Volunteer': 'volunteers'};

// Get case ID parameters from the URL (generated and passed in
// by search.html)
function getURLParams() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

// Format the field names in the database so they are better to read.
// For instance, 'lastKnownLocation' should be 'Last Known Location'
// and 'caseID' should be 'Case ID'.
function formatWords(field) {
    // Add a space before each capital letter unless it was immediately
    // preceded by a capital letter. This makes sure that 'caseID' does
    // not become 'Case I D'.
    let newField = '';
    let prevCapital = false;

    for (let i = 0; i < field.length; i++) {
        const ch = field.charAt(i);

        // Check if the previous character was not capitalized and the
        // current character is a capital letter.
        if (/[A-Z]/.test(ch) && !prevCapital) {
            newField += ' ';
        }

        newField += ch;

        // Update prevCapital.
        prevCapital = false;

        if (/[A-Z]/.test(ch)) {
            prevCapital = true;
        }
    }

    // Capitalize the first character of newField.
    newField = newField[0].toUpperCase() + newField.substr(1);

    return newField;
}

// Create a string that is the same as the input string except single
// quotes are replaced with the HTML entity for a single quote.
function escapeSingleQuotes(original) {
    let replaced = '';

    for (let i = 0; i < original.length; i++) {
        if (original.charAt(i) == '\'') {
            // Add the HTML entity for a single quote.
            replaced += "&#39";
        }
        else {
            replaced += original.charAt(i);
        }
    }

    return replaced;
}

var useAltColor1 = false;

// append HTML for data with subsections
function appendSubHtml(subheader, data, id, pathBase) {
	var sectionBg = (useAltColor1 ? 'altColor1' : 'altColor2');
	var runningHtml = '<tr class=\"' + sectionBg + '\"><td><h4>&nbsp;&nbsp;' + subheader + '</h4></td><td><table>';

	for (let key in data) {
		let label = formatWords(key);
		let value = escapeSingleQuotes(data[key]);
		let path = pathBase + '/' + key;
		console.log('path in appendHTML: ' + path);

		runningHtml += "<tr><td>" + label + ":</td><td><input id='" + path + "' value='" + value + "' readonly></input></td></tr>";
	}

	return runningHtml + '</table></td></tr>';
}

// Create a new section in the HTML to display some data.
function appendHTML(data, header, id) {
	let section = document.getElementById("CaseData");
	let html = '';
	if (section.innerHTML == null) section.innerHTML = html;
	let basepath = headerToColl[header] + '/' + id + '/';

	useAltColor1 = !useAltColor1;
	var sectionBg = (useAltColor1 ? 'altColor1' : 'altColor2');

	// Make sure there is actually some data to add.
	if (data == null) {
		console.log('appendHTML is returning early for header', header)
		return;
	}

	// Add the section to the html.
	html += '<tr class=\"' + sectionBg + '\"><td colspan=2><h3>' + header + '</h3></td></tr>';

	// Add the data to the html.
	for (let key in data) {
		const label = formatWords(key);

		let path = basepath + key;
		console.log('path in appendHTML: ' + path);

		if (data[key].constructor.name !== "Object") {
			// When setting the value of the HTML tag, we wrap the text in
			// single quotes so that multiple words can be displayed.
			// However, the text could have single quotes, so we have to
			// convert them to the appropriate HTML entity.
			const value = escapeSingleQuotes(data[key]);

			// skip adding the html for redundant listings of the Case ID
			if ((header == "Case Overview") || (label != "Case ID"))
				html += "<tr class=\"" + sectionBg + "\"><td>" + label + ":</td><td><input id='" + path + "' value='" + value + "' readonly></input></td></tr>";
		} else {
			html += appendSubHtml(label,data[key],key,path);
		}
	}
	section.innerHTML += html;
}

// this version makes a simple edit dialog from the available data
// main drawback is that fields which are expected, but have no data, are omitted
// other drawbacks: fields are presented alphabetically by label, which may not be halpful
// 					it also doesn't know fields that have a limited set of values
function MakeEditFromCase(caseObject) {
	useAltColor1 = false;

	appendHTML(caseObject.caseData, 'Case Overview', caseObject.caseID);
	appendHTML(caseObject.clientData, 'Client', caseObject.caseID);
	appendHTML(caseObject.loData, 'Loved Ones', caseObject.caseID);
	appendHTML(caseObject.recordData, 'Recordings', caseObject.caseID);
	appendHTML(caseObject.volunteerData, 'Volunteers', caseObject.caseID);
	appendHTML(caseObject.noteData, 'Notes', caseObject.caseID);
}

/*
// this is a template for the following constructor, implemented as a JSON array.
// the data is nested, so the constructor can potentially be written recursively

// this is a quick-and-dirty solution, so we only allow the top level to have
// arrays.  Also, in a concession to how Firebase is laid out, we never create an
// array in the database, as the data becomes harder to correlate and update.  We
// instead create a label for each array object, which gives a fixed path for each
// editable field.  --- mwalsh 20190819
var mmEditTemplate = [
	{
		groupName: "Case Overview",
		dbPath: "/cases/caseID",
		localPath: "caseData",
		fieldList: [
			{
				fieldName: "caseStatus",
				fieldType: "menu",
				valueList: [
					{vValue: -1, vLabel: "cold"},
					{vValue: 0, vLabel: "open"},
					{vValue: 1, vLabel: "closed"}
				]
			},
			{
				fieldName: "deliveryStatus",
				fieldType: "menu",
				valueList: [
					{vValue: -2, vLabel: "did not post"},
					{vValue: 0, vLabel: "undelivered"},
					{vValue: 1, vLabel: "delivered"}
				]
			},
			{
				fieldName: "reunionStatus",
				fieldType: "menu",
				valueList: [
					{vValue: -3, vLabel: "can't find client"},
					{vValue: -2, vLabel: "n/a"},
					{vValue: -1, vLabel: "declined"},
					{vValue: 0, vLabel: "not yet reunited"},
					{vValue: 1, vLabel: "reunited"}
				]
			},
			{fieldName: "deliveryDate", fieldType: "date"},
			{fieldName: "reunionDate", fieldType: "date"},
			{fieldName: "FBLink", fieldType: "text"},
			{fieldName: "FBLinkDate", fieldType: "date"},
			{
				fieldName: "partnerInfo",
				fieldType: "object",
				subFieldList: [
					{fieldName: "partnerOrg", fieldType: "text"},
					{fieldName: "caseWorkerOrg", fieldType: "text"},
					{fieldName: "caseWorkerName", fieldType: "text"},
					{fieldName: "caseWorkerEmail", fieldType: "text"},
					{fieldName: "caseWorkerPhone", fieldType: "text"}
				]
			}
		]
	},
	{
		groupName: "Client",
		dbPath: "/clients/caseID",
		localPath: "clientData",
		fieldList: [
			{fieldName:	"name", fieldType: "text"},
			{fieldName: "currentCity", fieldType: "text"},
			{fieldName: "contactInfo", fieldType: "text"},
			{fieldName: "DOB", fieldType: "date"},
			{fieldName: "hometown", fieldType: "text"}
		]
	},
	{
		groupName: "Loved Ones",
		dbPath: "/loved_ones/caseID",
		localPath: "loData",
		isArray: true,
		arrayLabelForm: "LO_nnnnn",
		fieldList: [
			{fieldName: "name", fieldType: "text"},
			{fieldName: "age", fieldType: "numeric"},
			{fieldName: "relationship", fieldType: "text"},
			{fieldName: "lastKnownLocation", fieldType: "text"},
			{fieldName: "lastConnected", fieldType: "date"},
			{fieldName: "contactInfo", fieldType: "text"}
		]
	},
	{
		groupName: "Recordings",
		dbPath: "/records/caseID",
		localPath: "recordData",
		fieldList: [
			{fieldName: "recordingDate", fieldType: "date"},
			{fieldName: "lastWorkedOn", fieldType: "date"},
			{fieldName: "youtubeLink", fieldType: "text"},
			{fieldName: "attachmentLink", fieldType: "text"}
		]
	},
	{
		groupName: "Volunteers",
		dbPath: "/volunteers/caseID",
		localPath: "volunteerData",
		fieldList: [
			{fieldName: "volunteerName", fieldType: "text"},
			{fieldName: "volunteerContactInfo", fieldType: "text"},
			{fieldName: "caseManagerName", fieldType: "text"},
			{fieldName: "caseMarkedCold", fieldType: "text"},
			{fieldName: "linktoMM", fieldType: "text"},
			{fieldName: "messengerName", fieldType: "text"},
			{fieldName: "messengerEmail", fieldType: "text"},
			{fieldName: "messengerPhone", fieldType: "text"}
		]
	},
	{
		groupName: "Notes",
		dbPath: "/notes/caseID",
		localPath: "noteData",
		fieldList: [
			{fieldName: "caseNotes", fieldType: "text"},
			{fieldName: "detectivePhone", fieldType: "text"},
			{fieldName: "submissionNotes", fieldType: "date"},
			{fieldName: "detectiveNotes", fieldType: "text"}
		]
	}
];

// this version addresses the bugs in the first dialog constructor.
// first, it creates the edit dialog from a template, allowing it to select the appropriate
// input control for each field.  after creating each field, it will populate it from the case
// object, if the data is present
function MakeEditFromTemplate(template,caseObject) {
	;
}
*/
