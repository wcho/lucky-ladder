var numPlayers = 6;
var leftMargin = 30;
var topMargin = 70;
var ladderHeight = 400;
var barLength = 50;
var barTerm = 15;
var numBars = numPlayers;
var colors = ["#993300", "#333300", "#003300", "#003366", "#000080", "#333399", "#333333", "#800000", "#FF6600", "#808000", "#008000", "#008080", "#0000FF", "#666699", "#808080", "#FF0000", "#FF9900", "#99CC00", "#339966", "#33CCCC", "#3366FF", "#800080", "#969696", "#FF00FF", "#FFCC00", "#FFFF00", "#00FF00", "#00FFFF", "#00CCFF", "#993366", "#C0C0C0", "#FF99CC", "#FFCC99", "#FFFF99", "#CCFFCC", "#CCFFFF", "#99CCFF", "#CC99FF"];
var name_samples = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

var ctx;
var players = [];
var names = [];


var Node = function (player, type, y, down_node, bar_node) {
	"use strict";
    this.player = player;
    this.type = type; // start 1, end 2, bar 3
    this.y = y;
    this.down_node = down_node;
    this.bar_node = bar_node;
};

var Player = function (name, nth) {
	"use strict";
    var x = leftMargin + nth * barLength;
    this.name = name;
    this.x = x;
    this.nth = nth;
    this.end_node = new Node(this, 2, topMargin + ladderHeight, null, null);
    this.start_node = new Node(this, 1, topMargin, this.end_node, null);
};

function shuffle(o) {
	"use strict";
	var j, x, i;
    for (i = o.length; i;) {
		j = parseInt(Math.random() * i, 10);
		i = i - 1;
		x = o[i];
		o[i] = o[j];
		o[j] = x;
	}
    return o;
}

var lastNode;
function findNodeAboveY(node, y) {
	"use strict";
    if (node.type === 2) {
		if (node.y <= y) {
			alert('y is lower than end node');
			return null;
		} else {
			return lastNode;
		}
	}

    if (node.y < y) {
		lastNode = node;
		return findNodeAboveY(node.down_node, y);
    } else if (node.y > y) {
		return lastNode;
    } else { // node.y == y
		alert('bar exists on same y');
		return null;
    }
}

function addBar(p1, p2, y) {
	"use strict";
	var p1a, p2a, p1n, p2n;
    lastNode = p1.start_node;
    p1a = findNodeAboveY(p1.start_node, y);
    lastNode = p2.start_node;
    p2a = findNodeAboveY(p2.start_node, y);
    p1n = new Node(p1, 3, y, p1a.down_node, null);
    p1a.down_node = p1n;
    p2n = new Node(p2, 3, y, p2a.down_node, p1n);
    p2a.down_node = p2n;
    p1n.bar_node = p2n;
}

function isEmptyY(node, y) {
	"use strict";
    if (node.type === 2) {
		return true;
	}
    if (node.y < y) {
		return isEmptyY(node.down_node, y);
    } else if (node.y > y) {
		return true;
    } else {
		return false;
    }
}

function addRandomBar() {
	"use strict";
	var leftN, p1, p2, y;
    leftN = Math.floor(Math.random() * (players.length - 1));
    p1 = players[leftN];
    p2 = players[leftN + 1];
    y = topMargin + (Math.floor(Math.random() * (ladderHeight / barTerm - 1)) + 1) * barTerm;
    console.info(p1.nth + ", " + p2.nth + ", " + y);
    if (isEmptyY(p1.start_node, y)) {
		if (isEmptyY(p2.start_node, y)) {
			addBar(p1, p2, y);
		} else {
			console.info(p2.nth + " dup");
		}
    } else {
		console.info(p1.nth + " dup");
    }
}

function addPlayer(player) {
	"use strict";
    players.push(player);
}

function addNewPlayer(n) {
	"use strict";
    var newPlayer = new Player(name_samples[n], n);
    console.info("add player " + n);
    addPlayer(newPlayer);
}

function makeNPlayers(n) {
	"use strict";
	var i;
    players = [];
    for (i = 0; i < n; i = i + 1) {
		addNewPlayer(i);
    }
}

function makeAllRandomBars() {
	"use strict";
	var i;
    for (i = 0; i < numBars; i = i + 1) {
		addRandomBar();
    }
}



function drawLine(from_x, from_y, to_x, to_y) {
	"use strict";
    ctx.moveTo(from_x, from_y);
    ctx.lineTo(to_x, to_y);
}

function drawBar(node) {
	"use strict";
	var other_node;
    if (node.type !== 3) {
		alert('not a bar node');
		return;
    }
    other_node = node.bar_node;
    ctx.beginPath();
    drawLine(node.player.x, node.y, other_node.player.x, other_node.y);
    ctx.stroke();
}

function drawBars(node) {
	"use strict";
	var my_p, other_p;
    my_p = node.player;
    if (node.type === 2) {
		return;
    }
    if (node.type === 3) {
		other_p = node.bar_node.player;
		if (other_p.nth > my_p.nth) {
			drawBar(node);
		}
    }
    drawBars(node.down_node);
}

function drawPole(player) {
	"use strict";
    ctx.beginPath();
    drawLine(player.x, player.start_node.y,
	     player.x, player.end_node.y);
    ctx.stroke();
}

function drawPoles() {
	"use strict";
    players.forEach(function (p) {
		drawPole(p);
    });
}

function drawEveryBars() {
	"use strict";
	players.forEach(function (p) {
		drawBars(p.start_node);
    });
}

function drawLadder() {
	"use strict";
    drawPoles();
    drawEveryBars();
}

function draw() {
	"use strict";
    var canvas;
	canvas = document.getElementById("canvas");
    console.info('start draw');
    makeNPlayers(numPlayers);
    drawLadder();
}


function drawNames() {
	"use strict";
	var nl, name;
    nl = document.getElementById('names_layer');
    nl.style.top = topMargin - 20;
    nl.style.left = 0;
    //nl.style.border = "1px solid black";
    nl.width = 100;
    nl.height = 100;
    nl.style.zIndex = 100;

	names.forEach(function (name) {
		console.info(name);
		nl.removeChild(name);
    });
    names = [];

	players.forEach(function (p) {
		name = document.createElement('input');
		name.setAttribute('type', "text");
		name.setAttribute('maxlength', 5);
		console.info(name);
		// name.style.top = p.start_node.y - 15;
		// name.style.left = p.x - 20;
		name.style.border = "0px solid black";
		name.style.textAlign = "center";
		name.width = 20;
		name.height = 20;
		name.value = p.name;
		name.size = 6;
		names.push(name);
		nl.appendChild(name);
    });
}

function mouseMove(e) {
	"use strict";
    console.info(e);
}
function mouseDown(e) {
	"use strict";
    console.info(e);
}

function init() {
	"use strict";
	var canvas;
    shuffle(colors);
	canvas = document.getElementById("canvas");
    if (!canvas.getContext) {
		alert('Canvas unsupported');
		return;
    }
    ctx = canvas.getContext("2d");
    canvas.onmousemove = mouseMove;
    canvas.onmousedown = mouseDown;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.left = 0;
    canvas.style.top = 0;

    makeNPlayers(numPlayers);
    drawPoles();
    drawNames();
}


var anipx = 10;
var from_node;
var to_node;
var curx;
var cury;

function r() {
	"use strict";
}

function runPlayer(player, color) {
	"use strict";
	var node, next, bn;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    node = player.start_node;
    bn = false;
    ctx.beginPath();
    while (node.type !== 2) {
		if (node.type === 1) { // start node
			next = node.down_node;
		} else { // bar node
			if (bn === true) { // came here through bar. go down.
				bn = false;
				next = node.down_node;
			} else { // came here downward. go through bar.
				bn = true;
				next = node.bar_node;
			}
		}
		drawLine(node.player.x, node.y, next.player.x, next.y);
		node = next;
    }
    ctx.stroke();
    console.info(player.name + "->" + node.player.name);
}

function run() {
	"use strict";
	var i;
    ctx.save();
    ctx.globalAlpha = 0.9;
    for (i = 0; i < players.length; i = i + 1) {
		runPlayer(players[i], colors[i]);
    }
    ctx.restore();
}


function clearCanvas() {
	"use strict";
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function addPlayerPressed() {
	"use strict";
    numPlayers = numPlayers + 1;
    numBars = numPlayers * 8;
    makeNPlayers(numPlayers);
    clearCanvas();
    drawPoles();
    drawNames();
}

function removePlayerPressed() {
	"use strict";
    numPlayers = numPlayers - 1;
    numBars = numPlayers * 8;
    makeNPlayers(numPlayers);
    clearCanvas();
    drawPoles();
    drawNames();
}
function drawBarsPressed() {
	"use strict";
    makeAllRandomBars();
    drawEveryBars();
}
