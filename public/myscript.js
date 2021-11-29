function readJSON(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function renameKey ( obj, oldKey, newKey ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
}

function mergeKey ( obj, oldKey, newKey ) {
    Object.assign (obj[newKey], obj[oldKey]);
    delete obj[oldKey];
}

function replaceKey ( obj, oldKey1, oldKey2, newKey ) {
    obj[newKey] = obj[oldKey1][oldKey2];
    delete obj[oldKey1];
}