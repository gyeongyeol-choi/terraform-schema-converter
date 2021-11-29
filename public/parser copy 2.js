//import terraformSchema from './json/terraform_schema.json';
/*
import { readFile } from 'fs/promises';
const terraformSchema = JSON.parse(
    await readFile(
        new URL('./json/terraform_schema.json', import.meta.url)
    )
);
*/

function parseJson() {
    function readJSON(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }

    function renameKey(obj, oldKey, newKey) {
        if (oldKey in obj) {
            obj[newKey] = obj[oldKey];
            delete obj[oldKey];
        }
    }
    function mergeKey(obj, oldKey, newKey) {
        Object.assign(obj[newKey], obj[oldKey]);
        delete obj[oldKey];
    }
    function replaceKey(obj, oldKey1, oldKey2, newKey) {
        obj[newKey] = obj[oldKey1][oldKey2];
        delete obj[oldKey1];
    }


    const schemaMap = new Map();

    readJSON('./json/terraform_schema.json', function (text) {
        var terraformSchema = JSON.parse(text);

        const typeList = ['provider', 'resource', 'datasource'];
        let schemaList;
        let requiredField = [];
        const schemaArray = [];
        let tmpPath;

        for (const type of typeList) {
            if (type === 'provider') {
                const schemaData = terraformSchema.provider_schemas['aws'].provider.block;
                requiredField = [];

                renameKey(schemaData, 'attributes', 'properties');
                mergeKey(schemaData, 'block_types', 'properties');

                Object.keys(schemaData.properties).forEach(function (k) {
                    if (schemaData.properties[k].type === 'bool') {
                        schemaData.properties[k].type = 'boolean';
                    } else if (Array.isArray(schemaData.properties[k].type)) {
                        if (
                            schemaData.properties[k].type[0] === 'list' ||
                            schemaData.properties[k].type[0] === 'set'
                        ) {
                            schemaData.properties[k].items = {type: schemaData.properties[k].type[1]};
                            schemaData.properties[k].type = 'array';
                        } else if (schemaData.properties[k].type[0] === 'map') {
                            schemaData.properties[k].type = 'map'; // 'object'아닌가? 확인 필요****
                        }
                    }

                    if (
                        schemaData.properties[k].hasOwnProperty('required') &&
                        schemaData.properties[k].required
                    ) {
                        requiredField.push(k);
                    }

                    if (
                        schemaData.properties[k].hasOwnProperty('block') &&
                        schemaData.properties[k].block.hasOwnProperty('attributes')
                    ) {
                        replaceKey(
                            schemaData.properties[k],
                            'block',
                            'attributes',
                            'properties'
                        );

                        Object.keys(schemaData.properties[k].properties).forEach(function (
                            i
                        ) {
                            if (schemaData.properties[k].properties[i].type === 'bool') {
                                schemaData.properties[k].properties[i].type = 'boolean';
                            } else if (
                                Array.isArray(schemaData.properties[k].properties[i].type)
                            ) {
                                if (
                                    schemaData.properties[k].properties[i].type[0] === 'list' ||
                                    schemaData.properties[k].properties[i].type[0] === 'set'
                                ) {
                                    schemaData.properties[k].properties[i].items = {type : schemaData.properties[k].properties[i].type[1]};
                                    schemaData.properties[k].properties[i].type = 'array';
                                } else if (
                                    schemaData.properties[k].properties[i].type[0] === 'map'
                                ) {
                                    schemaData.properties[k].properties[i].type = 'map'; // 'object'아닌가? 확인 필요****
                                }
                            }
                        });
                    }
                });

                schemaData.title = 'provider-aws';
                schemaData.required = requiredField;
                schemaArray.push(schemaData);
                schemaMap.set(schemaData.title, schemaData);
            } else {
                if (type === 'resource') {
                    schemaList = Object.getOwnPropertyNames(
                        terraformSchema.provider_schemas['aws'].resource_schemas
                    );
                    tmpPath = terraformSchema.provider_schemas['aws'].resource_schemas;
                } else if (type === 'datasource') {
                    schemaList = Object.getOwnPropertyNames(
                        terraformSchema.provider_schemas['aws'].data_source_schemas
                    );
                    tmpPath = terraformSchema.provider_schemas['aws'].data_source_schemas;
                }

                for (const key of schemaList) {
                    const schemaData = tmpPath[key].block;
                    requiredField = [];

                    renameKey(schemaData, 'attributes', 'properties');
                    mergeKey(schemaData, 'block_types', 'properties');

                    Object.keys(schemaData.properties).forEach(function (k) {
                        if (schemaData.properties[k].type === 'bool') {
                            schemaData.properties[k].type = 'boolean';
                        } else if (Array.isArray(schemaData.properties[k].type)) {
                            if (
                                schemaData.properties[k].type[0] === 'list' ||
                                schemaData.properties[k].type[0] === 'set'
                            ) {
                                schemaData.properties[k].items = {type: schemaData.properties[k].type[1]};
                                schemaData.properties[k].type = 'array';
                            } else if (schemaData.properties[k].type[0] === 'map') {
                                schemaData.properties[k].type = 'map'; // 'object'아닌가? 확인 필요****
                            }
                        }

                        if (
                            schemaData.properties[k].hasOwnProperty('required') &&
                            schemaData.properties[k].required
                        ) {
                            requiredField.push(k);
                        }

                        if (
                            schemaData.properties[k].hasOwnProperty('block') &&
                            schemaData.properties[k].block.hasOwnProperty('attributes')
                        ) {
                            replaceKey(
                                schemaData.properties[k],
                                'block',
                                'attributes',
                                'properties'
                            );

                            Object.keys(schemaData.properties[k].properties).forEach(function (
                                i
                            ) {
                                if (schemaData.properties[k].properties[i].type === 'bool') {
                                    schemaData.properties[k].properties[i].type = 'boolean';
                                } else if (
                                    Array.isArray(schemaData.properties[k].properties[i].type)
                                ) {
                                    if (
                                        schemaData.properties[k].properties[i].type[0] === 'list' ||
                                        schemaData.properties[k].properties[i].type[0] === 'set'
                                    ) {
                                        schemaData.properties[k].properties[i].items = {type: schemaData.properties[k].properties[i].type[1]};
                                        schemaData.properties[k].properties[i].type = 'array';
                                    } else if (
                                        schemaData.properties[k].properties[i].type[0] === 'map'
                                    ) {
                                        schemaData.properties[k].properties[i].type = 'map'; // 'object'아닌가? 확인 필요****
                                    }
                                }
                            });
                        }
                    });
                    schemaData.title = type + '-' + key;
                    schemaData.required = requiredField;
                    schemaArray.push(schemaData);
                    schemaMap.set(schemaData.title, schemaData);
                }
            }
        }
    });
    return schemaMap;
}
//export default parseJson;