// Setup a dictionary to map from header names (such as Loved Ones) to the
// database collection name (loved_ones).
const headerToColl = {'Case Overview': 'cases',
                      'Client': 'clients',
                      'Loved Ones': 'loved_ones',
                      'Notes': 'notes',
                      'Records': 'records',
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

// changed the HTML display to use a table structure.  useAltColor1 alternates the
// background between alternating rows for easier readability
var useAltColor1 = false;

// append HTML for data with subsections
// subsections (like arrays of loved ones) have their data shown as a table within 
// the td cell of the top-level table
function appendSubHtml(subheader, data, id, pathBase, originalData) {
	var sectionBg = (useAltColor1 ? 'altColor1' : 'altColor2');
	var runningHtml = '<tr class=\"' + sectionBg + '\"><td><h4>&nbsp;&nbsp;' + subheader + '</h4></td><td><table>';
	
	for (let key in data) {
		let label = formatWords(key);
		let value = escapeSingleQuotes(data[key]);
		let path = pathBase + '/' + key;
		console.log('path in appendHTML: ' + path);
		originalData[path] = value;
		
		runningHtml += "<tr><td>" + label + ":</td><td><input id='" + path + "' value='" + value + "' readonly></input></td></tr>";
	}
	
	return runningHtml + '</table></td></tr>';
}

// Create a new section in the HTML to display some data.
// Looks for the HTML element "CaseData" (a <table> element) and appends row data
// to whatever may already be there

function appendHTML(header, data, id, originalData) {
	let section = document.getElementById("CaseData");
	let html = '';
	if (section.innerHTML == null) section.innerHTML = html;
	
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
		let tagID = id + '/' + key
		const label = formatWords(key)
		
		let path = headerToColl[header] + '/' + id + '/' + key;
		console.log('path in appendHTML: ' + path);
		
		if (data[key].constructor.name !== "Object") {
			// When setting the value of the HTML tag, we wrap the text in
			// single quotes so that multiple words can be displayed.
			// However, the text could have single quotes, so we have to
			// convert them to the appropriate HTML entity.
			const value = escapeSingleQuotes(data[key]);
			// Add this data to the originalData dictionary.
			originalData[path] = value;

			// skip adding the html for redundant listings of the Case ID
			if ((header == "Case Overview") || (label != "Case ID"))
				html += "<tr class=\"" + sectionBg + "\"><td>" + label + ":</td><td><input id='" + path + "' value='" + value + "' readonly></input></td></tr>";
		} else {
			html += appendSubHtml(label,data[key],key,path,originalData);
		}
	}
	section.innerHTML += html;
}

// Add data to the webpage from a database reference.
function addFromRef(dataRef, header, id, originalData) {
    dataRef.once('value').then(
		function(snapshot) {
			// Add the information to the webpage.
			appendHTML(header, snapshot.val(), id, originalData);

			// Print the data for debugging purposes.
			console.log('(' + snapshot.key + ',' + header + ') =>', snapshot.val());
		}
	);
}

// Read some documents from the database.
function getData(caseID, originalData, parentDir='', numNotes=100000, onlyNotes=false) {
	useAltColor1 = false;
	
    // Get all of the information for this case.
    if (!onlyNotes) {
        addFromRef(db.ref(parentDir + '/cases/' + caseID), 'Case Overview', caseID, originalData);
        addFromRef(db.ref(parentDir + '/clients/' + caseID), 'Client', caseID, originalData);
        addFromRef(db.ref(parentDir + '/loved_ones/' + caseID), 'Loved Ones', caseID, originalData);
        addFromRef(db.ref(parentDir + '/records/' + caseID), 'Records', caseID, originalData);
        addFromRef(db.ref(parentDir + '/volunteers/' + caseID), 'Volunteer', caseID, originalData);
    }

    // Setup the query to the notes.
    let notesQuery = null;
    notesQuery = db.ref(parentDir + '/notes/').orderByChild('caseID').equalTo(caseID).limitToLast(numNotes);

    notesQuery.once('value').then(function(snapshot) {
        data = snapshot.val();

        for (let key in data) {
            console.log('finding notes. key:', key);
            appendHTML('Notes', data[key], key, originalData);
        }
        console.log(snapshot.key, '=>', snapshot.val());
    });
}
