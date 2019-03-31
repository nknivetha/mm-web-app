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

// Create a new section in the HTML to display some data.
function appendHTML(header, data, id, originalData) {
    let section = document.getElementById(header);
    let html = '';

    // Make sure there is actually some data to add.
    if (data == null) {
        console.log('appendHTML is returning early for header', header)
        return;
    }

    // Add the section to the html.
    html += '<h3>' + header + '</h3>';

    // Add the data to the html.
    for (let key in data) {
        let tagID = id + '/' + key
        const label = formatWords(key)

        // When setting the value of the HTML tag, we wrap the text in
        // single quotes so that multiple words can be displayed.
        // However, the text could have single quotes, so we have to
        // convert them to the appropriate HTML entity.
        const value = escapeSingleQuotes(data[key]);
        html += label + ": <input id='" + tagID + "' value='" + value + "' readonly></input><br>";

        // Add this data to the originalData dictionary.
        let path = headerToColl[header] + '/' + id + '/' + key;
        console.log('path in appendHTML: ' + path);
        originalData[path] = value;
    }

    section.innerHTML += html;
}

// Add data to the webpage from a database reference.
function addFromRef(dataRef, header, id, originalData) {
    dataRef.once('value').then(function(snapshot) {
        // Add the information to the webpage.
        appendHTML(header, snapshot.val(), id, originalData);

        // Print the data for debugging purposes.
        console.log('(' + snapshot.key + ',' + header + ') =>', snapshot.val());
    });
}

// Read some documents from the database.
function getData(caseID, originalData, parentDir='', firstNoteOnly=false) {
    // Get all of the information for this case.
    addFromRef(db.ref(parentDir + '/cases/' + caseID), 'Case Overview', caseID, originalData);
    addFromRef(db.ref(parentDir + '/clients/' + caseID), 'Client', caseID, originalData);
    addFromRef(db.ref(parentDir + '/loved_ones/' + caseID), 'Loved Ones', caseID, originalData);
    addFromRef(db.ref(parentDir + '/records/' + caseID), 'Records', caseID, originalData);
    addFromRef(db.ref(parentDir + '/volunteers/' + caseID), 'Volunteer', caseID, originalData);

    // Setup the query to the notes.
    let notesQuery = null;

    if (firstNoteOnly) {
        // We only want to get the first note. This is used for the 'proposed'
        // branch of the database, as the caseID is not stored in the note.
        notesQuery = db.ref(parentDir + '/notes/').limitToFirst(1);
    }
    else {
        notesQuery = db.ref(parentDir + '/notes/').orderByChild('caseID').equalTo(caseID);
    }

    notesQuery.once('value').then(function(snapshot) {
        data = snapshot.val();

        for (let key in data) {
            console.log('finding notes. key:', key);
            appendHTML('Notes', data[key], key, originalData);
        }
        console.log(snapshot.key, '=>', snapshot.val());
    });
}
