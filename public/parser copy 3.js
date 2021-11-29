//import terraformSchema from './json/terraform_schema.json';
/*
import { readFile } from 'fs/promises';
const terraformSchema = JSON.parse(
    await readFile(
        new URL('./json/terraform_schema.json', import.meta.url)
    )
);
*/

function parseJson(cloud) {
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

    function renameKey2(obj, oldKey1, oldKey2, newKey) {
        obj[newKey] = obj[oldKey1][oldKey2];
        delete obj[oldKey1][oldKey2];
    }

    function mergeKey2(obj, oldKey1, oldKey2, newKey) {
        Object.assign(obj[newKey], obj[oldKey1][oldKey2]);
        delete obj[oldKey1][oldKey2];
    }

    const schemaMap = new Map();

    readJSON('./json/terraform_schema.json', function (text) {
        const terraformSchema = JSON.parse(text);

        const typeList = ['provider', 'resource', 'datasource'];
        let schemaList;
        let requiredField = [];
        const schemaArray = [];
        let tmpPath;

        for (const type of typeList) {
            if (type === 'provider') {
                schemaList = [terraformSchema.provider_schemas[cloud].provider];
                tmpPath = terraformSchema.provider_schemas[cloud].provider;
            } else if (type === 'resource') {
                schemaList = Object.getOwnPropertyNames(
                    terraformSchema.provider_schemas[cloud].resource_schemas
                );
                tmpPath = terraformSchema.provider_schemas[cloud].resource_schemas;
            } else if (type === 'datasource') {
                schemaList = Object.getOwnPropertyNames(
                    terraformSchema.provider_schemas[cloud].data_source_schemas
                );
                tmpPath = terraformSchema.provider_schemas[cloud].data_source_schemas;
            }

            for (let key of schemaList) {
                let schemaData = new Object();
                if (type === 'provider') {
                    schemaData = tmpPath.block;
                    key = cloud;
                } else {
                    schemaData = tmpPath[key].block;
                }
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
                            schemaData.properties[k].items = { type: schemaData.properties[k].type[1] };
                            schemaData.properties[k].type = 'array';
                        } else if (schemaData.properties[k].type[0] === 'map') {
                            schemaData.properties[k].items = { type: schemaData.properties[k].type[1] };
                            schemaData.properties[k].type = 'map'; // 'object'아닌가? 확인 필요****
                        }
                    }

                    if (
                        schemaData.properties[k].hasOwnProperty('required') &&
                        schemaData.properties[k].required
                    ) {
                        requiredField.push(k);
                        delete schemaData.properties[k].required;
                    }

                    if (
                        schemaData.properties[k].hasOwnProperty('block') &&
                        schemaData.properties[k].block.hasOwnProperty('attributes')
                    ) {
                        renameKey2(
                            schemaData.properties[k],
                            'block',
                            'attributes',
                            'properties'
                        );

                        if (schemaData.properties[k].block.hasOwnProperty('block_types')){
                            mergeKey2(
                                schemaData.properties[k],
                                'block',
                                'block_types',
                                'properties'
                            );
                        }

                        Object.keys(schemaData.properties[k].properties).forEach(function (i) {
                            if (schemaData.properties[k].properties[i].type === 'bool') {
                                schemaData.properties[k].properties[i].type = 'boolean';
                            } else if (
                                Array.isArray(schemaData.properties[k].properties[i].type)
                            ) {
                                if (
                                    schemaData.properties[k].properties[i].type[0] === 'list' ||
                                    schemaData.properties[k].properties[i].type[0] === 'set'
                                ) {
                                    schemaData.properties[k].properties[i].items = { type: schemaData.properties[k].properties[i].type[1] };
                                    schemaData.properties[k].properties[i].type = 'array';
                                } else if (
                                    schemaData.properties[k].properties[i].type[0] === 'map'
                                ) {
                                    schemaData.properties[k].properties[i].items = { type: schemaData.properties[k].properties[i].type[1] };
                                    schemaData.properties[k].properties[i].type = 'map'; // 'object'아닌가? 확인 필요****
                                }
                            }

                            if (
                                schemaData.properties[k].properties[i].hasOwnProperty('block') &&
                                schemaData.properties[k].properties[i].block.hasOwnProperty('attributes')
                            ) {
                                renameKey2(
                                    schemaData.properties[k].properties[i],
                                    'block',
                                    'attributes',
                                    'properties'
                                );
                                if (schemaData.properties[k].properties[i].block.hasOwnProperty('block_types')){
                                    mergeKey2(
                                        schemaData.properties[k].properties[i],
                                        'block',
                                        'block_types',
                                        'properties'
                                    );
                                }
                                Object.keys(schemaData.properties[k].properties[i].properties).forEach(function (j) {
                                    if (schemaData.properties[k].properties[i].properties[j].type === 'bool') {
                                        schemaData.properties[k].properties[i].properties[j].type = 'boolean';
                                    } else if (
                                        Array.isArray(schemaData.properties[k].properties[i].properties[j].type)
                                    ) {
                                        if (
                                            schemaData.properties[k].properties[i].properties[j].type[0] === 'list' ||
                                            schemaData.properties[k].properties[i].properties[j].type[0] === 'set'
                                        ) {
                                            schemaData.properties[k].properties[i].properties[j].items = { type: schemaData.properties[k].properties[i].properties[j].type[1] };
                                            schemaData.properties[k].properties[i].properties[j].type = 'array';
                                        } else if (
                                            schemaData.properties[k].properties[i].properties[j].type[0] === 'map'
                                        ) {
                                            schemaData.properties[k].properties[i].properties[j].items = { type: schemaData.properties[k].properties[i].properties[j].type[1] };
                                            schemaData.properties[k].properties[i].properties[j].type = 'map'; // 'object'아닌가? 확인 필요****
                                        }
                                    }
                                });
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
    });
    return schemaMap;
}
//export default parseJson;