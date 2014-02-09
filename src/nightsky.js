/*
* Night Sky - An HTML5 based Night Sky Viewer
* Copyright (c) 2014 Matthew Petroff
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

document.getElementById('getLocation').addEventListener('mousedown', getLocation, false);
document.getElementById('enterLocation').addEventListener('mousedown', enterLocation, false);
document.getElementById('manualLocation').addEventListener('mousedown', manualLocation, false);

function getLink() {
    alert(window.location.href.split('#')[0] + '#lat=' + lat + '&lng=' + lng + '&alt=' + altitude
    + '&azm=' + azimuth + '&fov=' + hfov + '&tim=' + date.getTime());
}

function enterLocation() {
    document.getElementById('locationBtns').style.display = 'none';
    document.getElementById('locationFields').style.display = 'block';
}

function fullScreenChange() {
if(!(document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen
  || document.msFullscreenElement)) {
    var page = document.getElementById('container');
    if (page.requestFullscreen) {
        page.requestFullscreen();
    } else if (page.mozRequestFullScreen) {
        page.mozRequestFullScreen();
    } else if (page.msRequestFullscreen) {
        page.msRequestFullscreen();
    } else {
        page.webkitRequestFullScreen();
    }
} else {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}
}

var azimuth = Math.PI, altitude = 0.3, hfov = 0.9;
var lat = 41, lng = -73;

function getLocation() {
    navigator.geolocation.getCurrentPosition(setPosition);
}

function setPosition(position) {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    init();
}

function manualLocation() {
    lat = parseFloat(document.getElementById('latitude').value);
    lon = parseFloat(document.getElementById('longitude').value);
    init();
}

var canvas = new Object();
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var svgContainer = d3.select("#container").append("svg")
                                    .attr("width", canvas.width)
                                    .attr("height", canvas.height);
var paths, points, clips, selects;


function onDocumentResize(event) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    svgContainer.attr("width", canvas.width)
                .attr("height", canvas.height);
    requestAnimationFrame(animate);
}

function init() {
    document.addEventListener('keydown', onDocumentKeyPress, false);
    window.addEventListener('resize', onDocumentResize, false);

    document.getElementById('fullscreenBtn').addEventListener('mousedown', fullScreenChange, false);
    document.getElementById('linkBtn').addEventListener('mousedown', getLink, false);
    document.addEventListener('keydown', onDocumentKeyPress, false);
    document.addEventListener('keyup', onDocumentKeyUp, false);
    window.addEventListener('blur', clearKeys, false);
    document.getElementById('locationDialog').style.display = 'none';
    requestAnimationFrame(animate);
}

var keysDown = new Array(10);

function onDocumentKeyPress(event) {
    // Override default action
    event.preventDefault();
    
    // Record key pressed
    var keynumber = event.keycode;
    if(event.which) {
        keynumber = event.which;
    }
    
    changeKey(keynumber, true);
}

function clearKeys() {
    for(i = 0; i < 10; i++) {
        keysDown[i] = false;
    }
}

function onDocumentKeyUp(event) {
    // Override default action
    event.preventDefault();
    
    // Record key released
    var keynumber = event.keycode;
    if(event.which) {
        keynumber = event.which;
    }
    
    // Change key
    changeKey(keynumber, false);
}

function changeKey(keynumber, value) {
    var keyChanged = false;
    switch(keynumber) {
        // If minus key is released
        case 109: case 189: case 17:
            if(keysDown[0] != value) { keyChanged = true; }
            keysDown[0] = value; break;
        
        // If plus key is released
        case 107: case 187: case 16:
            if(keysDown[1] != value) { keyChanged = true; }
            keysDown[1] = value; break;
        
        // If up arrow is released
        case 38:
            if(keysDown[2] != value) { keyChanged = true; }
            keysDown[2] = value; break;
        
        // If "w" is released
        case 87:
            if(keysDown[6] != value) { keyChanged = true; }
            keysDown[6] = value; break;
        
        // If down arrow is released
        case 40:
            if(keysDown[3] != value) { keyChanged = true; }
            keysDown[3] = value; break;
        
        // If "s" is released
        case 83:
            if(keysDown[7] != value) { keyChanged = true; }
            keysDown[7] = value; break;
        
        // If left arrow is released
        case 37:
            if(keysDown[4] != value) { keyChanged = true; }
            keysDown[4] = value; break;
        
        // If "a" is released
        case 65:
            if(keysDown[8] != value) { keyChanged = true; }
            keysDown[8] = value; break;
        
        // If right arrow is released
        case 39:
            if(keysDown[5] != value) { keyChanged = true; }
            keysDown[5] = value; break;
        
        // If "d" is released
        case 68:
            if(keysDown[9] != value) { keyChanged = true; }
            keysDown[9] = value;
    }
    
    if(keyChanged && value) {
        prevTime = Date.now();
        requestAnimationFrame(animate);
    }
}

function keyRepeat() {
    var newTime = Date.now();
    var diff = (newTime - prevTime) / 1000;
    
    // If minus key is down
    if(keysDown[0]) {
        hfov += diff;
    }
    
    // If plus key is down
    if(keysDown[1]) {
        hfov -= diff;
    }
    
    // If up arrow or "w" is down
    if(keysDown[2] || keysDown[6]) {
        // Pan up
        altitude += diff;
    }
    
    // If down arrow or "s" is down
    if(keysDown[3] || keysDown[7]) {
        // Pan down
        altitude -= diff;
    }
    
    // If left arrow or "a" is down
    if(keysDown[4] || keysDown[8]) {
        // Pan left
        azimuth += diff;
    }
    
    // If right arrow or "d" is down
    if(keysDown[5] || keysDown[9]) {
        // Pan right
        azimuth -= diff;
    }
    
    prevTime = newTime;
}

function animate() {
    render();
    
    if(keysDown[0] || keysDown[1] || keysDown[2] || keysDown[3]
      || keysDown[4] || keysDown[5] || keysDown[6] || keysDown[7]
      || keysDown[8] || keysDown[9]) {
        keyRepeat();
        requestAnimationFrame(animate);
    }
}







// Get JSON configuration file
var request = new XMLHttpRequest();
request.open('GET', '750.json', false);
request.send();
var stars = JSON.parse(request.responseText).stars;

// Process URL parameters
window.location.hash.split('&').forEach(function(frag) {
    var option = frag.split('=')[0];
    var value = frag.split('=')[1];
    switch(option) {
        case 'lat':
            lat = parseFloat(value); break;
        case 'lng':
            lng = parseFloat(value); break;
        case 'alt':
            altitude = parseFloat(value); break;
        case 'azm':
            azimuth = parseFloat(value); break;
        case 'fov':
            hfov = parseFloat(value); break;
        case 'tim':
            date = new Date(parseInt(value)); break;
        default:
            break;
    }
});
if(window.location.hash != '') {
    init();
}

function render() {
    // Keep in bounds
    if(altitude > 1.5) {
        altitude = 1.5;
    } else if(altitude < 0) {
        altitude = 0;
    }
    if(hfov > 1.2) {
        hfov = 1.2;
    } else if(hfov < 0.6) {
        hfov = 0.6;
    }
    
    // Calculate current star sky positions
    var currentStars = [];
    stars.forEach(function(star) {
        currentStars.push(StarCalc.getStarPosition(date, lat, lng, star));
    });
    
    // Calculate current star screen positions
    var screenStars = [];
    currentStars.forEach(function(star) {
        var z = Math.sin(star.altitude) * Math.sin(altitude)
            + Math.cos(star.altitude) * Math.cos(star.azimuth + azimuth)
            * Math.cos(altitude);
        if((((star.azimuth <= (Math.PI / 2) && star.azimuth > -(Math.PI / 2) && z >= 0)) ||
          (((star.azimuth > (Math.PI / 2) || star.azimuth <= -(Math.PI / 2)) && z >= 0)))
          && star.altitude > 0) {
            var s = new Object();
            s.y = -canvas.height / Math.tan(hfov / 2) *
                (Math.sin(star.altitude) * Math.cos(altitude)
                - Math.cos(star.altitude) * Math.cos(star.azimuth + azimuth)
                * Math.sin(altitude)) / z / 2 + canvas.height / 2;
            s.x = canvas.width - (-canvas.height / Math.tan(hfov / 2) *
                Math.sin(star.azimuth + azimuth) * Math.cos(star.altitude) / z
                / 2 + canvas.width / 2);
            s.vmag = star.vmag;
            s.name = star.name;
            s.pname = star.pname;
            s.dist = star.dist;
            if (s.x > 0 && s.x < canvas.width && s.y > 0 && s.y < canvas.height) {
                screenStars.push(s);
            }
        }
    });
    
    // Clear selection
    d3.select("#starName").text('');
    d3.select("#magnitude").text('');
    d3.select("#distance").text('');
    
    var positions = [];
    screenStars.forEach(function(star) {
        positions.push([star.x, star.y]);
    });
    
    if(clips) {
        clips.remove();
        points.remove();
        paths.remove();
        selects.remove();
    }
    
    clips = svgContainer.append("svg:g").attr("id", "point-clips");
    points = svgContainer.append("svg:g").attr("id", "points");
    paths = svgContainer.append("svg:g").attr("id", "point-paths");
    selects = svgContainer.append("svg:g").attr("id", "selects");
    
    clips.selectAll("clipPath")
        .data(positions)
      .enter().append("svg:clipPath")
        .attr("id", function(d, i) { return "clip-"+i;})
      .append("svg:circle")
        .attr('cx', function(d) { return d[0]; })
        .attr('cy', function(d) { return d[1]; })
        .attr('r', 10);
    
    paths.selectAll("path")
        .data(d3.geom.voronoi(positions))
      .enter().append("svg:path")
        .attr("d", function(d) { return "M" + d.join(",") + "Z"; })
        .attr("id", function(d,i) { 
          return "path-"+i; })
        .attr("clip-path", function(d,i) { return "url(#clip-"+i+")"; })
        .style('fill-opacity', 0);
    
    paths.selectAll("path")
      .on("mouseover", function(d, i) {
        selects.selectAll("path").attr('display', 'none');
        svgContainer.select('path#select-'+i)
          .attr("display", "inline");
        var name = '';
        if(points.select('circle#point-'+i).datum().pname != '') {
            name = points.select('circle#point-'+i).datum().pname + ' ('
                + points.select('circle#point-'+i).datum().name + ')';
        } else {
            name = points.select('circle#point-'+i).datum().name;
        }
        d3.select('#starName').text(name);
        d3.select('#magnitude').text("Magnitiude: " + points.select('circle#point-'+i).datum().vmag);
        d3.select('#distance').text('Distance: ' + points.select('circle#point-'+i).datum().dist + ' ly');
      })
    
    points.selectAll("circle")
        .data(screenStars)
      .enter().append("svg:circle")
        .attr("id", function(d, i) { 
          return "point-"+i; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("r", function (d) { return Math.pow(1.5, -d.vmag) * 2.5; })
        .attr('stroke', '#fff')
        .attr("stroke-width", 0)
        .style('fill', '#fff');
    
    selects.selectAll("path")
        .data(screenStars)
      .enter().append("svg:path")
        .attr("d", function(d) { return "M 9 0 L 9 1.0625 C 4.8416284 1.529919 1.529919 4.8416284 1.0625 9 L 0 9 L 0 11 L 1.0625 11 C 1.529919 15.158372 4.8416284 18.470081 9 18.9375 L 9 20 L 11 20 L 11 18.9375 C 15.158372 18.470081 18.470081 15.158372 18.9375 11 L 20 11 L 20 9 L 18.9375 9 C 18.470081 4.8416284 15.158372 1.529919 11 1.0625 L 11 0 L 9 0 z M 9 3.09375 L 9 4 L 11 4 L 11 3.09375 C 14.061847 3.5338656 16.466134 5.9381525 16.90625 9 L 16 9 L 16 11 L 16.90625 11 C 16.466134 14.061847 14.061847 16.466134 11 16.90625 L 11 16 L 9 16 L 9 16.90625 C 5.9381525 16.466134 3.5338656 14.061847 3.09375 11 L 4 11 L 4 9 L 3.09375 9 C 3.5338656 5.9381525 5.9381525 3.5338656 9 3.09375 z"; })
        .attr("id", function(d,i) { 
          return "select-"+i; })
        .attr("transform", function(d) { return "translate(" + (d.x - 10) + "," + (d.y - 10) + ")"; })
        .attr('display', 'none')
        .style('fill', '#fff');
    
    
    
    // Draw horizon
    var horizonAltitude = canvas.height / Math.tan(hfov / 2)
        * Math.tan(altitude) * .75 + canvas.height / 2;
    var horizonWidth = canvas.width / Math.sin(hfov / 2) * 2;
    paths.append("svg:path")
         .attr("d", function(d) { return "M" + (canvas.width-horizonWidth)/2 + "," + canvas.height/2 + " C" + canvas.width/2 + "," + horizonAltitude + " " + canvas.width/2 + "," + horizonAltitude + " " + (canvas.width+horizonWidth)/2 + "," + canvas.height/2 + " V" + canvas.height + " H0 Z"; })
         .style('fill', '#0b1c0b');
    
    
    // Draw navigation
    document.getElementById('arrow').style.transform = "rotate(" + (azimuth + Math.PI) + "rad)";
    document.getElementById('arrow').style.webkitTransform = "rotate(" + (azimuth + Math.PI) + "rad)";
    
    
    // Calculate moon illumination parameters
    var moonIllum = SunCalc.getMoonIllumination(date);
    
    var moon = document.getElementById("moon");
    // Not a new moon
    if (0.02 < moonIllum.fraction) {
        var amount, crescent;
        
        // Construct moon SVG arc
        if (0.5 > moonIllum.fraction) {
            crescent = "1";
            amount = String(100 - 200 * moonIllum.fraction);
        } else {
            crescent = "0";
            amount = String(200 * moonIllum.fraction - 100);
        }
        var path = "M100,0 a100,100 0 1,0 0,200 a" + amount + ",100 0 1," + crescent + "0,-200 z";
        document.getElementById("phase").setAttribute("d",path);
        
        // Rotate angle of moon's bright limb
        var transformO, transformI;
        var angle = moonIllum.angle / Math.PI * 180;
        transformO = "rotate(" + angle + ",100,100)";
        transformI = "rotate(" + -angle + ",100,100)";
        document.getElementById("angleO").setAttribute("transform", transformO);
        document.getElementById("angleI").setAttribute("transform", transformI);
        
        var moonPos = SunCalc.getMoonPosition(date, lat, lng);
        var z = Math.sin(moonPos.altitude) * Math.sin(altitude)
            + Math.cos(moonPos.altitude) * Math.cos(moonPos.azimuth + azimuth)
            * Math.cos(altitude);
        if((((moonPos.azimuth <= (Math.PI / 2) && moonPos.azimuth > -(Math.PI / 2) && z >= 0)) ||
          (((moonPos.azimuth > (Math.PI / 2) || moonPos.azimuth <= -(Math.PI / 2)) && z >= 0)))
          && moonPos.altitude > 0) {
            moon.style.width = 40 / hfov + 'px';
            moon.style.height = moon.style.width;
            moon.style.top = -canvas.height / Math.tan(hfov / 2) *
                (Math.sin(moonPos.altitude) * Math.cos(altitude)
                - Math.cos(moonPos.altitude) * Math.cos(moonPos.azimuth + azimuth)
                * Math.sin(altitude)) / z /
                2 + canvas.height / 2 + "px";
            moon.style.left = canvas.width - (-canvas.height / Math.tan(hfov / 2) *
                Math.sin(moonPos.azimuth + azimuth) * Math.cos(moonPos.altitude) / z / 2
                + canvas.width / 2) + "px";
            moon.style.display = 'block';
        } else {
            moon.style.display = 'none';
        }
    } else {
        moon.style.display = 'none';
    }
}
