// globals
HA = {
	bg: null,
	drawing: null,
	lastMove: null,
	drawElm: null,
	drawCtx: null,
	flickerTimer: null,
	virgin: true,
	settings: {
		candle: true,
		flicker: true
	}
};


// setup functions
function resize() {
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	var size = ((w < h) ? w : h );
	if(w > h) {
		document.getElementById("buttons").className = "stack";
	} else {
		document.getElementById("buttons").className = "";
		if(w < 480) {
			document.getElementById("buttons").className = "center";
		}
	}
	var canvas = [
		"template", "bg", "flicker", "draw", "scratch", "saveSquare"
	];
	var canv = null;
	var draw = null;
	var temp = null;
	var i;
	var ctx = null;

	// resize our various canvases
	for(i = 0; i < canvas.length; i++) {
		canv = document.getElementById(canvas[i]);
		ctx = canv.getContext("2d");

		// backup
		temp = document.createElement("canvas");
		ctx = temp.getContext("2d");
		temp.width = size;
		temp.height = size;
		ctx.drawImage(canv,
					  0, 0, canv.width, canv.height,
					  0, 0, temp.width, temp.height);

		/* snarl. this shit doesn't work.
		   why can't mobile canvas pixels just be pixels?
		var scaleFactor = backingScale(ctx);
		if(scaleFactor > 1) {
			size = size* scaleFactor;
			canv.style.scale = 1 / scaleFactor;
		}
		*/

		// resize and reposition
		canv.width = size;
		canv.height = size;
		canv.style.marginLeft = "-" + (size/2) + "px";
		canv.style.marginTop = "-" + (size/2) + "px";

		// restore
		ctx = canv.getContext("2d");
		ctx.drawImage(temp,
					  0, 0, temp.width, temp.height,
					  0, 0, canv.width, canv.height);
		ctx.lineWidth = 2;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
	}

//	setBackground(HA.bg);
}
function reset() {
	var img = document.getElementById("pumpkin" + HA.bg);
	var bg = document.getElementById("bg");
	var ctx = bg.getContext("2d");
	bg.width = bg.width;
	ctx.drawImage(img, 0, 0, bg.width, bg.height);
}
function setBackground(which) {
	HA.bg = which;
	reset();
}
function clear() {
	if(HA.flickerTimer) {
		clearTimeout(HA.flickerTimer);
		HA.flickerTimer = null;
	}
	var canvas = [
		"template", "bg", "flicker", "draw", "scratch", "saveSquare"
	];
	var canv = null;
	for(i = 0; i < canvas.length; i++) {
		canv = document.getElementById(canvas[i]);
		canv.width = canv.width;
	}
	resize();
	reset();
	HA.virgin = true;
}

// drawing functions
function mouseDown(e) {
	var touches = e.changedTouches;
	if(e.changedTouches && e.changedTouches.length) {
		e = e.changedTouches[0];
	}

	HA.drawing = true;
	//setUndoPoint();

	HA.drawCtx.beginPath();
	HA.drawCtx.moveTo(e.clientX - HA.drawElm.offsetLeft,
					  e.clientY - HA.drawElm.offsetTop);

	mouseMove(e);
}
function mouseMove(e) {
	var touches = e.changedTouches;
	var now = new Date();

	if(e.changedTouches && e.changedTouches.length) {
		e.preventDefault();
		e = e.changedTouches[0];
	}

	if(now - HA.lastMove < 30) {  // throttle move events
		return;
	}
	if(!HA.drawing) {
		return;
	}
	HA.virgin = false;
	HA.drawCtx.lineTo(e.clientX - HA.drawElm.offsetLeft,
					e.clientY - HA.drawElm.offsetTop);
	HA.drawCtx.stroke();
	HA.lastMove = now;
}
function mouseUp(e) {
	HA.drawing = false;
	mouseMove(e);

	HA.drawCtx.fill();
	HA.drawCtx.closePath();
	HA.drawCtx.stroke();
}


// work functions
function animateFlicker() {
	var flicker = document.getElementById("flicker");

	if(HA.flickerTimer) {
		clearTimeout(HA.flickerTimer);
		HA.flickerTimer = null;
	}
	if(!HA.settings.flicker) {
		return;
	}

	if(flicker.className === "fade out") {
		flicker.className = "fade ";
	} else {
		flicker.className = "fade out";
	}
	HA.flickerTimer = setTimeout(animateFlicker, (Math.random() * 1000));
}
function carve(fromTemplate) {
	var face = document.getElementById("draw");
	var faceCtx = face.getContext("2d");
	var template = document.getElementById("template");
	var templateCtx = template.getContext("2d");
	var mask = document.getElementById("mask" + HA.bg);
	var glow = document.getElementById("glow");
	var dest = document.getElementById("bg");
	var destCtx = dest.getContext("2d");
	var img = document.getElementById("pumpkin" + HA.bg);
	var scratch = document.getElementById("scratch");
	var scratchCtx = scratch.getContext("2d");
	var flesh = document.getElementById("flesh");
	var flick = document.getElementById("flick");
	var flicker = document.getElementById("flicker");
	var flickerCtx = flicker.getContext("2d");
	var size = face.width;
	var ratio = size / 768;

	if(fromTemplate) {
		// copy face shapes from template
		face.width = face.width;
		faceCtx.globalCompositeOperation = "source-over";
		faceCtx.drawImage(template, 0, 0);
	} else {
		// save face shapes to template
		template.width = template.width;
		templateCtx.globalCompositeOperation = "source-over";
		templateCtx.drawImage(face, 0, 0);
	}

	// chop off out-of-bounds
	faceCtx.globalCompositeOperation = "destination-out";
	faceCtx.globalAlpha = 1;
	faceCtx.drawImage(mask,
					  0, 0, mask.width, mask.height,
					  0, 0, size, size);

	/*
	// soften edges
	scratch.width = scratch.width;
	scratchCtx.drawImage(face,
						 0, 0, face.width, face.height,
						 0, 0, face.width * 0.333, face.height * 0.333);
	faceCtx.globalCompositeOperation = "source-over";
	faceCtx.drawImage(scratch,
					  0, 0, face.width * 0.333, face.height * 0.333,
					  0, 0, face.width, face.height);
	scratch.width = scratch.width;
	*/

	// save a "mask" of the front of the pumpkin (saved in face)
	dest.width = dest.width;
	faceCtx.globalCompositeOperation = "source-out";
	faceCtx.drawImage(img,
					  0, 0, img.width, img.height,
					  0, 0, size, size);

	// draw glowing background (to dest)
	destCtx.drawImage(glow, 0, 0, glow.width, glow.height,
					  0, 0, size, size);

	// draw brighter glowing background to flicker
	// copy what we have so far to flicker, and brighten it
	flicker.width = flicker.width;
	flickerCtx.globalAlpha = 1;
	flickerCtx.drawImage(glow, 0, 0, glow.width, glow.height,
						 0, 0, size, size);
	flickerCtx.globalAlpha = 0.3;
	flickerCtx.drawImage(flick,
						 0, 0, 16, 16, 0, 0, size, size);
	flickerCtx.globalAlpha = 1;
	flickerCtx.globalCompositeOperation = "source-over";

	// draw candle at 434, 460
	if(HA.settings.candle) {
		var cand1 = document.getElementById("candle1");
		var cand2 = document.getElementById("candle2");
		destCtx.globalCompositeOperation = "source-over";
		destCtx.drawImage(cand1, 306 * ratio, 460 * ratio,
						  cand1.width * ratio, cand1.height * ratio);
		flickerCtx.drawImage(cand2, 306 * ratio, 460 * ratio,
							 cand2.width * ratio, cand2.height * ratio);
	}

	// build pumpkin by layer and draw it shrunk, inner to outer (to dest)
	var i;
	var darken = 0.4;
	//flickerCtx.globalAlpha = 0.3;  // glow brighter inside, weird with candle

	for(i = 56 * ratio; i > 0; i -= (4 * ratio)) {
		try {
			// mix a color for the layer
			scratchCtx.globalCompositeOperation = "source-over";
			scratchCtx.globalAlpha = 1;
			scratchCtx.drawImage(glow, 0, 0, glow.width, glow.height,
								 0, 0, size, size);     // bright glow...
			scratchCtx.globalAlpha = 0.3;
			scratchCtx.drawImage(flick,                 // light...
								 0, 0, 16, 16, 0, 0, size, size);
			scratchCtx.globalAlpha = darken;
			scratchCtx.drawImage(flesh,                 // darken with flesh
								 0, 0, 256, 256, -8, 0, size + 16, size);
			// 0, 0, 256, 256, 0, 0, size, size);
			darken += 0.02;                             // ...more each time
			// cut out the face
			scratchCtx.globalCompositeOperation = "destination-in";
			scratchCtx.globalAlpha = 1;
			scratchCtx.drawImage(face, 0, 0);

			// draw layer
			//this.$.blat.setContent("here i="+i+" size="+size+" ratio="+ratio);
			destCtx.drawImage(scratch, 0, 0, size, size,
							  i, i, size - (i * 2), size - (i * 2));
			//this.$.blat.setContent("there i="+i+" size="+size+" ratio="+ratio);
			// also draw to flicker
			flickerCtx.drawImage(scratch, 0, 0, size, size,
								 i, i, size - (i * 2), size - (i * 2));
			//flickerCtx.globalAlpha = 0.2; // ...brighter inside, yes.  :^)
		} catch(err) {
			//this.$.blat.setContent(err.message);
			//this.$.blat.setContent("size:"+size+" i:"+i+" size-(i*2):"+(size-(i*2)));
			//this.$.blat.setContent(size - (i*2));
		}
	}

	// reapply "mask" (to dest and flicker)
	destCtx.globalAlpha = 1;
	destCtx.globalCompositeOperation = "source-over";
	destCtx.drawImage(face, 0, 0);

	// one more brighten pass for flicker
	flickerCtx.globalAlpha = 0.1;
	flickerCtx.drawImage(flick,
						 0, 0, 16, 16, 0, 0, size, size);
	// then mask
	flickerCtx.globalAlpha = 1;
	flickerCtx.drawImage(face, 0, 0);

	face.width = face.width;
	HA.virgin = true;
	animateFlicker();
}


// event setup
window.addEventListener("load", function () { //document, "DOMContentLoaded"
	var status = document.getElementById("loading");

	status.className = "hidden";
	status.innerHTML = "Working...";
	document.getElementById("content").className = "";

	setBackground(1);
	clear();
	window.addEventListener("resize", resize);

	// canvas events
	HA.drawElm = document.getElementById("draw");
	HA.drawCtx = HA.drawElm.getContext("2d");
	HA.drawElm.addEventListener("mousedown", mouseDown);
	HA.drawElm.addEventListener("mousemove", mouseMove);
	HA.drawElm.addEventListener("mouseup", mouseUp);
	HA.drawElm.addEventListener("mouseout", mouseUp);
	HA.drawElm.addEventListener("touchstart", mouseDown);
	HA.drawElm.addEventListener("touchmove", mouseMove);
	HA.drawElm.addEventListener("touchend", mouseUp);
	HA.drawElm.addEventListener("touchcancel", mouseUp);
	HA.drawElm.addEventListener("touchleave", mouseUp);

	// button events
	document.getElementById("carve").addEventListener("click", function() {
		if(HA.virgin) {
			alert("Draw a face, then hit \"Carve\"!");
			return;
		}
		status.className = "";
		setTimeout(function() {
			carve();
			status.className = "hidden";
		}, 20);
	});
	document.getElementById("allclear").addEventListener("click", function() {
		clear();
	});
	document.getElementById("switch").addEventListener("click", function() {
		status.className = "";
		setTimeout(function() {
			HA.bg++;
			if(HA.bg > 4) {
				HA.bg = 1;
			}
			carve(true);
			status.className = "hidden";
		}, 20);
	});
});

// hacks for dumb modern mobile browsers
document.addEventListener("touchstart", function(){}, true);
function backingScale(context) {
	if('devicePixelRatio' in window) {
		if (window.devicePixelRatio > 1) {
			return window.devicePixelRatio;
		}
	}
	return 1;
}
/*
var can = document.getElementById("myCanvas");
var ctx = can.getContext("2d");
var scaleFactor = backingScale(ctx);
if(scaleFactor > 1) {
	can.width = can.width * scaleFactor;
	can.height = can.height * scaleFactor;
    // update the context for the new canvas scale
	var ctx = can.getContext("2d");
}
*/