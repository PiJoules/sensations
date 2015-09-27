var touchmovezone;
var touchmovectx;
var lastPt = {x: -1, y: -1};

window.addEventListener("resize", function(){
    touchmovezone.width = window.innerWidth;
    touchmovezone.height = window.innerHeight;
});

var timeout;
var playing = false;
var revealTimeout;
function handleMovement(){
    clearTimeout(timeout);
    timeout = setTimeout(function(){
        // Stopped moving
        $("#test").text("Feel me");
        $("#song")[0].pause();
        $("#song")[0].currentTime = 0;
        $("html").css("background-image", "");
        alpha = 1;
        $("body").css("background-color", "rgba(255,255,255," + alpha + ")");
        clearTimeout(revealTimeout);
        playing = false;
    }, 100);

    // Did move
    if (!playing){
        $("#song")[0].play();
        playing = true;
        $("#test").text("");
        $("html").css("background-image", "url(background.gif)");
        revealTimeout = setInterval(reveal, 300);
    }
}

var alpha = 1;
function reveal(){
    alpha -= 0.01;
    if (alpha < 0) alpha = 0;
    $("body").css("background-color", "rgba(255,255,255," + alpha + ")");
    console.log(alpha);
}

function initTouchMoveCanvas() {
    touchmovezone = document.getElementById("touchmovezone");
    touchmovezone.style.display = 'block';

    touchmovezone.width = window.innerWidth;
    touchmovezone.height = window.innerHeight;

    touchmovezone.addEventListener("touchmove", drawtouchmove, false);

    touchmovezone.addEventListener("mousedown", function() {
        touchmovezone.addEventListener("mousemove", drawmousemove, false);
    }, false);
    touchmovectx = touchmovezone.getContext("2d");
}

function getOffset(obj) {
    var offsetLeft = 0;
    var offsetTop = 0;
    do {
        if (!isNaN(obj.offsetLeft)) {
            offsetLeft += obj.offsetLeft;
        }
        if (!isNaN(obj.offsetTop)) {
            offsetTop += obj.offsetTop;
        }
    } while (obj = obj.offsetParent);
    return {
        left: offsetLeft,
        top: offsetTop
    };
}

function drawtouchmove(e) {
    e.preventDefault();
    var offset = getOffset(touchmovezone);
    if (lastPt != null) {
        var x = e.touches[0].pageX - offset.left;
        var y = e.touches[0].pageY - offset.top;
    }
    lastPt = {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
    };
    eyeball(canvas, getMousePos(canvas, e));
    eyeball(canvas2, getMousePos(canvas2, e));


    handleMovement();
}


function drawmousemove(e) {
    e.preventDefault();
    var offset = getOffset(touchmovezone);
    if (lastPt != null) {
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
    }
    lastPt = {
        x: e.pageX,
        y: e.pageY
    };
    eyeball(canvas, getMousePos(canvas, e));
    eyeball(canvas2, getMousePos(canvas2, e));
}


initTouchMoveCanvas();

var canvas = document.getElementById('myCanvas');
var canvas2 = document.getElementById('myCanvas2');

touchmovezone.addEventListener('mousemove', function(eventhandle) {
    eyeball(canvas, getMousePos(canvas, eventhandle));
    eyeball(canvas2, getMousePos(canvas2, eventhandle));
    handleMovement();
}, false);

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();

    var X = 0;
    var Y = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        X = e.pageX;
        Y = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        X = e.clientX + document.body.scrollLeft;
        Y = e.clientY + document.body.scrollTop;
    }
    X -= (rect.left + rect.width / 2);
    Y -= (rect.top + rect.height / 2);
    var XYs = Math.abs(X) + Math.abs(Y);
    var Xr = (XYs == 0) ? 0 : X / (XYs);
    var Yr = (XYs == 0) ? 0 : Y / (XYs);

    var Zm = Math.pow(Math.pow(rect.width, 2) + Math.pow(rect.height, 2), 0.5);

    var eyelimit = Zm * 2 / Math.PI
    var Z = Zm * 12 / 100 * Math.atan(Math.pow(Math.pow(X, 2) + Math.pow(Y, 2), 0.5) / eyelimit);

    return {
        x: (rect.left + rect.width / 2) + 0.7 * Math.pow(Math.pow(Z, 2) * Math.abs(Xr), 0.5) * ((Xr < 0) ? -1 : 1),
        y: (rect.top + rect.height / 2) + 0.7 * Math.pow(Math.pow(Z, 2) * Math.abs(Yr), 0.5) * ((Yr < 0) ? -1 : 1),
        x2: (rect.left + rect.width / 2) + Math.pow(Math.pow(Z, 2) * Math.abs(Xr), 0.5) * ((Xr < 0) ? -1 : 1),
        y2: (rect.top + rect.height / 2) + Math.pow(Math.pow(Z, 2) * Math.abs(Yr), 0.5) * ((Yr < 0) ? -1 : 1)
    };
}

function eyeball(canvas, coord) {
    var rect = canvas.getBoundingClientRect();
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient
    var grd = context.createRadialGradient(coord.x - rect.left, coord.y - rect.top, 40,coord.x2 - rect.left, coord.y2 - rect.top, 15);

    grd.addColorStop(0.95, "black");
    grd.addColorStop(0.94, "white");

    // Fill with gradient
    context.fillStyle = grd;
    context.beginPath();
    context.arc(50, 50, 25, 0, 2 * Math.PI);
    context.fill();
}