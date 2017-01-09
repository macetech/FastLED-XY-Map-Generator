function clearTest() {
  var myNode = document.getElementById('test');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
  num = 0;
}

var num_leds = 0;
var xdim = 0;
var ydim = 0;
var pixelarray = [];
var serpentine = 0;
var reverse = 0;


function serpentineLayout(event) {
  if (event.checked) {
    serpentine = 1;
  } else {
    serpentine = 0;
  }

  renumberLEDs();
  drawArrows();
  printMap();

}

function reverseLayout(event) {
  if (event.checked) {
    reverse = 1;
  } else {
    reverse = 0;
  }

  renumberLEDs();
  drawArrows();
  printMap();
}


function buildArray(num_leds) {
  serpentine = (document.getElementById("serpentineCHK")).checked;
  reverse = (document.getElementById("reverseCHK")).checked;

  for (i = 0; i < num_leds; i++) {
    pixelarray[i] = [];
    pixelarray[i][0] = "E";
    pixelarray[i][1] = "R";
    pixelarray[i][2] = 0;
  }

  pixelarray.join("\",\"");
}

function buildGrid(numBoxes) {
  gridHTML = "";
  container = document.getElementById('ledgrid');
  clearContents(container);
  xdim = Number(document.getElementById('xdim').value);
  ydim = Number(document.getElementById('ydim').value);

  num_leds = xdim * ydim; // set the max number pixels
  buildArray(num_leds);
  idnum = 0;
  gridHTML += '<div class="ledarray">';
  for (j = 0; j < ydim; j++) {
    gridHTML += '<div class="ledrow">';
    for (i = 0; i < xdim; i++) {
      gridHTML += '<div class="ledpixel" id="pixel' + idnum + '"';
      gridHTML += 'onclick="clearButton(this);">';
      gridHTML +='<div class="ledtext" id="pixeltext' + idnum + '">' + pixelarray[idnum][2] + '</div>';
      gridHTML += '</div>';
      idnum++;
    }
    gridHTML += "</div>";
  }
  gridHTML += '</div>';

  container.innerHTML = gridHTML;

  renumberLEDs();
  drawArrows();
  printMap();
}

function clearArrows(element) {
  // remove left arrows
  childnodes = element.getElementsByClassName("triangle-left");
  while(childnodes[0]) {
    element.removeChild(childnodes[0]);
  }

  // remove right arrows
  childnodes = element.getElementsByClassName("triangle-right");
  while(childnodes[0]) {
    element.removeChild(childnodes[0]);
  }
}


function clearButton(event) {
  eventindex = parseInt((event.id).replace(/[^0-9\.]/g, ''), 10);
  if (pixelarray[eventindex][0] == "E") {
    event.className = "disabledPixel";
    pixelarray[eventindex][0] = "D";
    clearArrows(event);
  } else if (pixelarray[eventindex][0] == "D") {
    event.className = "ledpixel";
    pixelarray[eventindex][0] = "E";
    drawArrows();
  }

  renumberLEDs();
  printMap();
}

function clearContents(element) {
  element.innerHTML = "";
}

function drawArrows() {
  for (i = 0; i < num_leds; i++) {
    pixelID = "pixel" + i;
    if (pixelarray[i][0] == "E") {
      pixelElement = document.getElementById(pixelID);
      clearArrows(pixelElement);

      // add a new div to the document
      arrownode = document.createElement("div");

      // apply the correct style to the new div

      if (pixelarray[i][1] == "R") {
        arrownode.className = "triangle-right";
      } else if (pixelarray[i][1] == "L") {
        arrownode.className = "triangle-left";
      }
      pixelElement.appendChild(arrownode);
    }
  }
}

function countActiveLEDs() {
  var activeCount = 0;
  for (i = 0; i < num_leds; i++) {
    if (pixelarray[i][0] == "E") activeCount++;
  }
  return activeCount;
}

function renumberLEDs() {
  var activeLEDs = 0;
  var inactiveLEDs = countActiveLEDs();
  for (y = 0; y < ydim; y++) {
    for (x = 0; x < xdim; x++) {
      var ledpos = 0;

      if ((((y % 2) == 0) || (serpentine==0)) ^ (reverse == 0)) {
        ledpos = y*xdim+xdim-1-x;
        pixelarray[ledpos][1] = "L";
      } else {
        ledpos = y*xdim+x;
        pixelarray[ledpos][1] = "R";

      }
      if (pixelarray[ledpos][0] == "E") {
          pixelarray[ledpos][2] = activeLEDs;
          activeLEDs++;
      } else if (pixelarray[ledpos][0] == "D" ) {
          pixelarray[ledpos][2] = inactiveLEDs;
          inactiveLEDs++;
      }



      pixelID = "pixeltext" + ledpos;
      pixelElement = document.getElementById(pixelID);
      pixelElement.innerHTML = "" + pixelarray[ledpos][2].toString();
    }
  }
}

function pad(pad, str, padLeft) {
  if (typeof str === 'undefined')
    return pad;
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

function printMap() {
  mapDiv = document.getElementById("result");

  mapHTML = "";
  ledindex = 0;
  mapHTML += '<PRE>';

  mapHTML += '// Params for width and height<BR>';
  mapHTML += 'const uint8_t kMatrixWidth = ' + xdim + ';<BR>';
  mapHTML += 'const uint8_t kMatrixHeight = ' + ydim + ';<BR><BR>';
  mapHTML += '#define NUM_LEDS (kMatrixWidth * kMatrixHeight)<BR>';
  mapHTML += 'CRGB leds[ NUM_LEDS ];<BR>';
  mapHTML += '#define LAST_VISIBLE_LED ' + (countActiveLEDs()-1) + '<BR>';

  if (num_leds <= 256) {
    mapHTML += 'uint8_t XY (uint8_t x, uint8_t y) {<BR>';
  } else {
    mapHTML += 'uint16_t XY (uint16_t x, uint16_t y) {<BR>';
  }
  mapHTML += '  // any out of bounds address maps to the first hidden pixel<BR>'
  mapHTML += '  if ( (x >= kMatrixWidth) || (y >= kMatrixHeight) ) {<BR>';
  mapHTML += '    return (LAST_VISIBLE_LED + 1);<BR>';
  mapHTML += '  }<BR><BR>';

  if (num_leds <= 256) {
    mapHTML += '  const uint8_t XYTable[] = ';
  } else {
    mapHTML += '  const uint16_t XYTable[] = ';
  }
  mapHTML += '{<BR>';
  for (y = 0; y < ydim; y++) {
    mapHTML += '  ';
    for (x = 0; x < xdim; x++) {
      mapHTML += pad('    ', pixelarray[ledindex][2], true);
      ledindex++;
      if (ledindex < num_leds) mapHTML += ",";
    }
    mapHTML += "<BR>";
  }
  mapHTML += '  };<BR><BR>';
  if (num_leds <= 256) {
    mapHTML += '  uint8_t i = (y * kMatrixWidth) + x;<BR>  uint8_t j = XYTable[i];<BR>  return j;<BR>';
  } else {
    mapHTML += '  uint16_t i = (y * kMatrixWidth) + x;<BR>  uint16_t j = XYTable[i];<BR>  return j;<BR>';
  }

  mapHTML += '}</PRE>';

  mapDiv.innerHTML = mapHTML;
}

window.onload = buildGrid;
