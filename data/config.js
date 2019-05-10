/**
 *
 * javascript file that contains some configurations
 *
 */


'use strict';

const tabFileName = 'data/translationTable.csv';

//                        true/on false/off
const variationSwitch = [ "with", "without"];

const title = "symbotrans";
const copyrightAdditionalAuthors = "";
const additionalFooter = "";

const licenseName = "";

// some default values
let defaultInput = ["abc"];

let defaultSrcSystem = 0;
let defaultDstSystem = 1;
let debugMode = false;

// filter of translations
let removeLongSrcParts = true;
let removeDuplicateDstParts = true;
let removeSmallerDstParts = true;

let expertMode = false;
let outputOnly = false;

let bracketPartDetection = false;
let input_limit = 18;

