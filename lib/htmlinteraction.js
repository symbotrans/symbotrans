/**
 * Copyright (c) 2019, Sönke Fischer
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 *
 * javascript file to interact with a specific html file
 * relying on core functionality defined in converter.js
 *
 */


'use strict';

/* *****************************************************
 * These variables need to be defined here or elsewhere
 *
 * const title = "symbotrans";
 * const copyrightAdditionalAuthors = "";
 *
 * const licenseName = "";
 *
 * let expertMode = false;
 * let outputOnly = false;
 *
 * let input_limit = 18;
 *
 ******************************************************/

// should hold the input HTML element
let input_field;


// "main"
window.onload = init(buildPage);

/**
 *
 * initially create page content ...
 */
function buildPage() {
  document.title = title;
  input_field = document.getElementById("input_field");

  parseUrlParameters();

  createExpertModeElements();

  fillSystemSelectors();
  fillCharCollection();

  // set copyright year
  let y = new Date().getFullYear();
  if (y > 2019) {
    document.getElementById("copyright_year_field").innerHTML = "- " + y;
  }

  // set copyright additional authors
  if (copyrightAdditionalAuthors != "") {
    document.getElementById("copyright_additional_authors_field").innerHTML = copyrightAdditionalAuthors;
  }

  // set license name
  if (licenseName != "") {
    document.getElementById("license_link").innerHTML = licenseName;
  }

  if (outputOnly) {
    document.getElementById("input").style.display = "none";
    document.getElementsByTagName("footer")[0].style.display = "none";
  }

  parse_input();

  document.getElementById("type_" + selectedSrcSystem.name).style.display = "inline-block";

  document.getElementById("output_field").style = null;
  if (fontNames[selectedDstSystem.name] !== "") {
    document.getElementById("output_field").style = "font-family: " + fontNames[selectedDstSystem.name] + ";";
  }

  input_field.style = null;
  if (fontNames[selectedSrcSystem.name] !== "") {
    input_field.style = "font-family: " + fontNames[selectedSrcSystem.name] + ";";
  }
  input_field.selectionEnd = input_field.selectionStart = input_field.value.length;
  input_field.focus();

}

function createExpertModeElements() {
  if (!expertMode) {
    return;
  }

  let newElement;

  // create some elements on input section
  let div = document.getElementById("input").getElementsByClassName("systemInfo")[0];

  // button for next source system
  newElement = document.createElement("button");
  newElement.type = "button";
  newElement.title = "next destination system";
  newElement.id = "nextSrcSystemButton";
  newElement.class = "systemToggler";
  newElement.role = "presentation";
  newElement.onclick = function () {
    changeSystem(this);
  };
  newElement.innerHTML = "▷";
  div.appendChild(newElement);

  // create some elements on output section
  div = document.getElementById("output").getElementsByClassName("systemInfo")[0];

  // button for next destination system
  newElement = document.createElement("button");
  newElement.type = "button";
  newElement.title = "next destination system";
  newElement.id = "nextDstSystemButton";
  newElement.class = "systemToggler";
  newElement.role = "presentation";
  newElement.onclick = function () {
    changeSystem(this);
  };
  newElement.innerHTML = "▷";
  div.appendChild(newElement);

  // debug checkbox
  newElement = document.createElement("input");
  newElement.type = "checkbox";
  newElement.title = "Debug";
  newElement.checked = debugMode;
  newElement.onchange = function () {
    debugMode = this.checked;
  };
  div.appendChild(newElement);

  // filter removeLongSrcParts checkbox
  newElement = document.createElement("input");
  newElement.type = "checkbox";
  newElement.title = "Remove long src parts";
  newElement.checked = removeLongSrcParts;
  newElement.onchange = function () {
    removeLongSrcParts = this.checked;
    parse_input();
  };
  div.appendChild(newElement);

  // filter removeDuplicateDstParts checkbox
  newElement = document.createElement("input");
  newElement.type = "checkbox";
  newElement.title = "Remove duplicate results";
  newElement.checked = removeDuplicateDstParts;
  newElement.onchange = function () {
    removeDuplicateDstParts = this.checked;
    parse_input();
  };
  div.appendChild(newElement);

  // filter removeSmallerDstParts checkbox
  newElement = document.createElement("input");
  newElement.type = "checkbox";
  newElement.title = "Remove same results that are smaller";
  newElement.checked = removeSmallerDstParts;
  newElement.onchange = function () {
    removeSmallerDstParts = this.checked;
    parse_input();
  };
  div.appendChild(newElement);

}

/**
 *
 * check for relevant parameters passed by URL
 */
function parseUrlParameters() {

  const numberRegExp = /^[0-9]*$/;
  const inputRegExp = /[^()?&=;.]$/;

  let srcSys = getUrlParameter(window.location, "srcSys");
  if (srcSys == null || srcSys === "" || !numberRegExp.test(srcSys) || srcSys < 0 || srcSys > amountOfSystems - 1) {
    srcSys = defaultSrcSystem;
  }
  setSystemById(selectedSrcSystem, Number(srcSys));

  let dstSys = getUrlParameter(window.location, "dstSys");
  if (dstSys == null || dstSys === "" || !numberRegExp.test(dstSys) || dstSys < 0 || dstSys > amountOfSystems - 1) {
    dstSys = defaultDstSystem;
  }
  setSystemById(selectedDstSystem, Number(dstSys));

  let d = getUrlParameter(window.location, "debug");
  if (numberRegExp.test(d) && d === "1") {
    debugMode = true;
  }

  d = getUrlParameter(window.location, "expert");
  if (numberRegExp.test(d) && d === "1") {
    expertMode = true;
  }

  d = getUrlParameter(window.location, "outputOnly");
  if (numberRegExp.test(d) && d === "1") {
    outputOnly = true;
  }

  let inp = getUrlParameter(window.location, "input");
  if (selectedSrcSystem.id === defaultSrcSystem && (inp == null || inp === "")) {
    inp = defaultInput[Math.floor(Math.random() * defaultInput.length)];
  }
  if (inputRegExp.test(inp)) {
    input_field.value = inp;
  }

}

/**
 *
 * @param {Location} url
 * @param {String} parameter
 * @returns {String}
 */
function getUrlParameter(url, parameter) {

  // check parameters
  if (url === null || typeof url !== "object" || !(url instanceof Location) ||
    parameter === null || typeof parameter !== "string") {
    if (debugMode) {
      console.log("Invalid parameters!");
    }
    return null;
  }

  parameter = String(parameter).replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  let regex = new RegExp('[\\?|&]' + parameter.toLowerCase() + '=([^&#]*)');
  let results = regex.exec('?' + String(url).toLowerCase().split('?')[1]);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * dynamically create picker div for currently selected src system based on defined char/picker table
 */
function fillCharCollection() {

  let j, k;

  let collectionDiv = document.getElementById("type_" + selectedSrcSystem.name);

  if (collectionDiv === null) {
    let charCollectionDiv = document.getElementById("charCollections");
    collectionDiv = document.createElement('div');
    collectionDiv.className = "char_collection";
    collectionDiv.setAttribute("id", "type_" + selectedSrcSystem.name);
    collectionDiv.style = null;
    if (fontNames[selectedSrcSystem.name] !== "") {
      collectionDiv.style = "font-family: " + fontNames[selectedSrcSystem.name] + ";";
    }
    for (j = 0; j < picker[selectedSrcSystem.name].length; j++) {
      if (Array.isArray(picker[selectedSrcSystem.name][j])) {
        for (k = 0; k < picker[selectedSrcSystem.name][j].length; k++) {
          collectionDiv.innerHTML = collectionDiv.innerHTML + "<button type=\"button\" role=\"presentation\" onclick=\"addChar()\">" + picker[selectedSrcSystem.name][j][k] + "</button>";
        }
        collectionDiv.innerHTML = collectionDiv.innerHTML + "<br>";
      } else {
        collectionDiv.innerHTML = collectionDiv.innerHTML + "<button type=\"button\" role=\"presentation\" onclick=\"addChar()\">" + picker[selectedSrcSystem.name][j] + "</button>";
      }
    }
    charCollectionDiv.appendChild(collectionDiv);
  }
}

/**
 * dynamically fill drop-down menus and variation checkboxes
 * with system infos
 */
function fillSystemSelectors() {
  let i;

  let srcSelector = document.getElementById("srcSelector");
  let dstSelector = document.getElementById("dstSelector");
  let newSOption, newDOption;

  for (i = 0; i < baseSystemNames.length; i++) {
    // <option>IPAKiel</option>
    newSOption = document.createElement('option');
    newSOption.innerHTML = baseSystemNames[i];
    newDOption = newSOption.cloneNode(true);
    srcSelector.appendChild(newSOption);
    dstSelector.appendChild(newDOption);
  }

  let srcCheckboxes = document.getElementById("srcCheckboxes");
  let dstCheckboxes = document.getElementById("dstCheckboxes");
  let newSCheckbox, newDCheckbox;
  for (i = 0; i < variationNames.length; i++) {
    // <input id="srcVariation0" title="Schwa-Tilgung" type="checkbox">
    newSCheckbox = document.createElement('input');
    newSCheckbox.id = "srcVariation" + i;
    newSCheckbox.title = variationNames[i];
    newSCheckbox.type = "checkbox";
    newSCheckbox.onchange = function () {
      changeSystem(this);
    };

    newDCheckbox = newSCheckbox.cloneNode(true);
    newDCheckbox.id = "dstVariation" + i;
    newDCheckbox.onchange = function () {
      changeSystem(this);
    };

    srcCheckboxes.appendChild(newSCheckbox);
    dstCheckboxes.appendChild(newDCheckbox);
  }

  setSystemSelectors();
}

/**
 *
 * set system selectors and checkboxes based on
 * selected system
 *
 */
function setSystemSelectors() {

  let i;

  let srcSelector = document.getElementById("srcSelector");
  if (typeof srcSelector !== 'undefined') {
    srcSelector.value = selectedSrcSystem.baseName;
  }
  let dstSelector = document.getElementById("dstSelector");
  if (typeof dstSelector !== 'undefined') {
    dstSelector.value = selectedDstSystem.baseName;
  }

  let srcCheckboxes = document.getElementById("srcCheckboxes").getElementsByTagName("input");
  if (typeof srcCheckboxes !== 'undefined') {
    for (i = 0; i < srcCheckboxes.length; i++) {
      srcCheckboxes[i].disabled = !variationPossibilities[selectedSrcSystem.baseName][variationNames[i]];
      if (selectedSrcSystem.variations !== null) {
        srcCheckboxes[i].checked = selectedSrcSystem.variations[variationNames[i]] === "1";
      } else {
        srcCheckboxes[i].checked = false;
      }
    }
  }
  let dstCheckboxes = document.getElementById("dstCheckboxes").getElementsByTagName("INPUT");
  if (typeof dstCheckboxes !== 'undefined') {
    for (i = 0; i < dstCheckboxes.length; i++) {
      dstCheckboxes[i].disabled = !variationPossibilities[selectedDstSystem.baseName][variationNames[i]];
      if (selectedDstSystem.variations !== null) {
        dstCheckboxes[i].checked = selectedDstSystem.variations[variationNames[i]] === "1";
      } else {
        dstCheckboxes[i].checked = false;
      }
    }
  }

}

/**
 *
 * Build system name by querying corresponding html elements
 *
 * @param {String} sys
 * @returns {String}
 */
function getSystemNameFromSelectors(sys) {

  // check parameters
  if (sys === null || typeof sys !== "string" ||
    (sys !== "dst" && sys !== "src")) {
    if (debugMode) {
      console.log("Invalid parameters!");
    }
    return null;
  }

  let result;

  let baseNameSelector = document.getElementById(sys + "Selector");
  if (typeof baseNameSelector !== 'undefined') {
    result = baseNameSelector.value;
  } else {
    return null;
  }

  let checkboxes = document.getElementById(sys + "Checkboxes").getElementsByTagName("input");
  if (typeof checkboxes !== 'undefined') {
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = result + "1";
      } else {
        result = result + "0";
      }
    }
  }
  return result;
}

/**
 *
 * function that will be called on changes by html elements that
 * are used for system specification
 *
 * determines and calls appropriate functions to change the system
 * according to those infos
 *
 * @param {type} obj
 */
function changeSystem(obj) {

  let sys = "";
  let newName = "";

  // check parameters
  if (obj === null || typeof obj !== "object" || !(obj instanceof HTMLElement)) {
    if (debugMode) {
      console.log("Invalid parameters!");
    }
    return null;
  }

  if (obj.id === "srcSelector" || obj.id === "nextSrcSystemButton" || obj.id.substr(0, 12) === "srcVariation") {
    sys = "src";
  }
  if (obj.id === "dstSelector" || obj.id === "nextDstSystemButton" || obj.id.substr(0, 12) === "dstVariation") {
    sys = "dst";
  }

  if (obj.id === "nextDstSystemButton" || obj.id === "nextSrcSystemButton") {
    switch (sys) {
      case "dst":
        incrSystemId(selectedDstSystem);
        setSystemSelectors();
        document.getElementById("output_field").style = null;
        if (fontNames[selectedDstSystem.name] !== "") {
          document.getElementById("output_field").style = "font-family: " + fontNames[selectedDstSystem.name] + ";";
        }
        break;
      case "src":
        document.getElementById("type_" + selectedSrcSystem.name).style.display = "none";
        incrSystemId(selectedSrcSystem);
        fillCharCollection();
        document.getElementById("type_" + selectedSrcSystem.name).style.display = "inline-block";
        setSystemSelectors();
        input_field.style = null;
        if (fontNames[selectedSrcSystem.name] !== "") {
          input_field.style = "font-family: " + fontNames[selectedSrcSystem.name] + ";";
        }
        input_field.value = "";
        break;
      default:
    }
  } else {
    switch (sys) {
      case "dst":
        newName = getSystemNameFromSelectors("dst");
        setSystemByName(selectedDstSystem, newName);
        setSystemSelectors();
        document.getElementById("output_field").style = null;
        if (fontNames[selectedDstSystem.name] !== "") {
          document.getElementById("output_field").style = "font-family: " + fontNames[selectedDstSystem.name] + ";";
        }
        break;
      case "src":
        newName = getSystemNameFromSelectors("src");
        document.getElementById("type_" + selectedSrcSystem.name).style.display = "none";
        setSystemByName(selectedSrcSystem, newName);
        fillCharCollection();
        document.getElementById("type_" + selectedSrcSystem.name).style.display = "inline-block";
        setSystemSelectors();
        input_field.style = null;
        if (fontNames[selectedSrcSystem.name] !== "") {
          input_field.style = "font-family: " + fontNames[selectedSrcSystem.name] + ";";
        }
        input_field.value = "";
        break;
      default:
    }
  }

  if (debugMode) {
    console.log("src system: ");
    console.log(selectedSrcSystem);
    console.log("dst system: ");
    console.log(selectedDstSystem);
  }

  parse_input();
}

/**
 * insert character of pressed button into input field
 */
function addChar() {

  // check parameters
  if (event.target === null || typeof event.target !== "object" || !(event.target instanceof HTMLElement)) {
    if (debugMode) {
      console.log("Invalid parameters!");
    }
    return;
  }
  const char = event.target.innerHTML;

  const value = input_field.value;

  const start = input_field.selectionStart;
  const end = input_field.selectionEnd;

  input_field.value = value.slice(0, start) + char + value.slice(end);

  input_field.selectionStart = input_field.selectionEnd = start + char.length;

  input_field.focus();

  parse_input();

}


/**
 *
 * get input from input field, call parse function and present output
 *
 */
function parse_input() {
  if (debugMode) {
    console.log("parse_input() called");
  }

  let input = "";
  let showLengthWarning = false;

  if (input_field.value.length > input_limit) {
    input = input_field.value.substring(0, input_limit);
    showLengthWarning = true;
  } else {
    input = input_field.value;
  }

  if (input.length === 0) {
    document.getElementById("output_field").innerHTML = "N/A";
  } else {
    parseInput(input);

    if (translatedParts.length === 0) {
      document.getElementById("output_field").innerHTML = "<div class=\"warn\">No translations found!<br>Input might be invalid!</div>"
    } else {

      let x;
      let y;

      let out = "";

      if (showLengthWarning) {
        out = "<div class=\"warn\">At the moment the converter can only translate the first " + input_limit + " characters!<br>You might want to split your input manually ...</div>"
      }

      for (x = 0; x < translatedParts.length; x++) {
        if (translatedParts[x].length > 0 && translatedParts[x][0] !== "") {
          out = out + "<span class=\"translationLine\">";
          for (y = 0; y < translatedParts[x].length; y++) {
            out = out + "<span class=\"translationPart\">" + translatedParts[x][y] + "</span>";
          }
          out = out + "</span><br>";
        }
      }
      document.getElementById("output_field").innerHTML = out;
    }
  }
}

