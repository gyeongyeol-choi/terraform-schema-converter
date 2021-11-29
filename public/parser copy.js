function parseJson() {

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
    /*
    var Request = function() {  
        this.getParameter = function(name) {  
            var rtnval = '';  
            var nowAddress = unescape(location.href);  
            var parameters = (nowAddress.slice(nowAddress.indexOf('?') + 1,  
                    nowAddress.length)).split('&');  
            for (var i = 0; i < parameters.length; i++) {  
                var varName = parameters[i].split('=')[0];  
                if (varName.toUpperCase() == name.toUpperCase()) {  
                    rtnval = parameters[i].split('=')[1];  
                    break;  
                }  
            }  
            return rtnval;  
        }  
    }

    var request = new Request();
    */
    var schemaMap = new Map();

    readJSON("./json/terraform_schema.json", function(text){
        var Data = JSON.parse(text);

        var typeList = ['provider', 'resource', 'datasource']
        var schemaList;
        var requiredField = new Array();
        var schemaArray = new Array();
        //var schemaMap = new Map();
        var schemaData;
        var tmpPath;

        for (const type of typeList) {
            if (type == "provider") {
                schemaData = Data.provider_schemas['aws'].provider.block;
                requiredField = [];

                renameKey(schemaData, 'attributes', 'properties');
                mergeKey(schemaData, 'block_types', 'properties');

                Object.keys(schemaData.properties).forEach(function(k){

                    if (schemaData.properties[k].type == "bool") {
                        schemaData.properties[k].type = "boolean";
                    } else if (Array.isArray(schemaData.properties[k].type)) {
                        if (schemaData.properties[k].type[0] == "list" || schemaData.properties[k].type[0] == "set") {
                            schemaData.properties[k].type = "array";
                        } else if (schemaData.properties[k].type[0] == "map") {
                            schemaData.properties[k].type = "map";
                        }
                    }

                    if (schemaData.properties[k].hasOwnProperty('required') && schemaData.properties[k].required) {
                        requiredField.push(k);
                    }
                    
                    if (schemaData.properties[k].hasOwnProperty('block') && schemaData.properties[k].block.hasOwnProperty('attributes')) {

                        replaceKey(schemaData.properties[k], 'block', 'attributes', 'properties');

                        Object.keys(schemaData.properties[k].properties).forEach(function(i){
                            if (schemaData.properties[k].properties[i].type == "bool") {
                                schemaData.properties[k].properties[i].type = "boolean";
                            } else if (Array.isArray(schemaData.properties[k].properties[i].type)) {
                                if (schemaData.properties[k].properties[i].type[0] == "list" || schemaData.properties[k].properties[i].type[0] == "set") {
                                    //schemaData.properties[k].properties[i].type[0] = "array";
                                    schemaData.properties[k].properties[i].type = "array";
                                } else if (schemaData.properties[k].properties[i].type[0] == "map") {
                                    schemaData.properties[k].properties[i].type = "map";
                                }
                            }
                        })
                    }

                })

                schemaData.title = "provider-aws"
                schemaData.required = requiredField;
                schemaArray.push(schemaData);
                schemaMap.set(schemaData.title, schemaData);


            } else {
                if (type == "resource") {
                    schemaList = Object.getOwnPropertyNames(Data.provider_schemas['aws'].resource_schemas);
                    tmpPath = Data.provider_schemas['aws'].resource_schemas;
                } else if (type == "datasource") {
                    schemaList = Object.getOwnPropertyNames(Data.provider_schemas['aws'].data_source_schemas);
                    tmpPath = Data.provider_schemas['aws'].data_source_schemas;
                }


                for (const key of schemaList) {
                    schemaData = tmpPath[key].block;
                    requiredField = [];

                    renameKey(schemaData, 'attributes', 'properties');
                    mergeKey(schemaData, 'block_types', 'properties');

                    Object.keys(schemaData.properties).forEach(function(k){
                        

                        if (schemaData.properties[k].type == "bool") {
                            schemaData.properties[k].type = "boolean";
                        } else if (Array.isArray(schemaData.properties[k].type)) {
                            if (schemaData.properties[k].type[0] == "list" || schemaData.properties[k].type[0] == "set") {
                                schemaData.properties[k].type = "array";
                            } else if (schemaData.properties[k].type[0] == "map") {
                                schemaData.properties[k].type = "map";
                            }
                        }

                        if (schemaData.properties[k].hasOwnProperty('required') && schemaData.properties[k].required) {
                            requiredField.push(k);
                        }
                        
                        if (schemaData.properties[k].hasOwnProperty('block') && schemaData.properties[k].block.hasOwnProperty('attributes')) {

                            replaceKey(schemaData.properties[k], 'block', 'attributes', 'properties');

                            Object.keys(schemaData.properties[k].properties).forEach(function(i){
                                if (schemaData.properties[k].properties[i].type == "bool") {
                                    schemaData.properties[k].properties[i].type = "boolean";
                                } else if (Array.isArray(schemaData.properties[k].properties[i].type)) {
                                    if (schemaData.properties[k].properties[i].type[0] == "list" || schemaData.properties[k].properties[i].type[0] == "set") {
                                        //schemaData.properties[k].properties[i].type[0] = "array";
                                        schemaData.properties[k].properties[i].type = "array";
                                    } else if (schemaData.properties[k].properties[i].type[0] == "map") {
                                        schemaData.properties[k].properties[i].type = "map";
                                    }
                                }
                            })
                        }
                    })   
                    schemaData.title = type + "-" + key;
                    schemaData.required = requiredField;
                    schemaArray.push(schemaData);
                    schemaMap.set(schemaData.title, schemaData);
                }
            }

    }
        //alert(JSON.stringify(schemaMap, null, 2));
        //document.write(JSON.stringify(schemaMap));
        //console.log(schemaMap);
    });

    //var str = JSON.stringify(schemaMap, (key, value) => (value instanceof Map ? [...value] : value)); //JSON.stringify(Array.from(schemaMap.entries()));
    //console.log(schemaMap);
    console.log("test");
    return schemaMap;
}