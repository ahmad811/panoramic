THREE.PerspectiveControls = function (camera, parentNode, renderer)
{
	//Private members
	var domElement_; //renderer domElement_
	var camera_; //main camera
	//true when mouse is down to indicate whether need to rotate the scene when move
	var isMouseDown_ = false;
	//mouse position
	var savedX_ = 0 , savedY_ = 0;
	//keys constants
	var keys_ = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 , PLUS: 107 , MINUS: 109 };
	//longitude/latitude
	var savedLongitude_ = 0, savedLatitude_ = 0;

	//API members
	this.isActive = true;
	this.longitude = 0;
	this.latitude = 0;
	//to be used in private functions
	var self = this;
	//private CTOR
	var __construct = function() {
		domElement_ = ( parentNode !== undefined ) ? parentNode : document;
		//
		camera_ = camera;
		camera_.target = new THREE.Vector3(0, 0, 0);
		//register to mouse/key events
		domElement_.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
		domElement_.addEventListener( 'mousedown', onMouseDown, false );
		domElement_.addEventListener( 'mousemove', onMouseMove, false );
		domElement_.addEventListener( 'mouseup', onMouseUp, false );
		domElement_.addEventListener( 'mousewheel', onMouseWheel, false );
		domElement_.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
		domElement_.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox
		/*
		domElement_.addEventListener( 'touchstart', touchstart, false );
		domElement_.addEventListener( 'touchend', touchend, false );
		domElement_.addEventListener( 'touchmove', touchmove, false );
		*/
		window.addEventListener( 'keydown', onKeyDown, false );
	}();
	
	this.dispose = function() {
		domElement_.removeEventListener( 'mousedown', onMouseDown, false );
		domElement_.removeEventListener( 'mousemove', onMouseMove, false );
		domElement_.removeEventListener( 'mouseup', onMouseUp, false );
		domElement_.removeEventListener( 'mousewheel', onMouseWheel, false );
		domElement_.removeEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
		domElement_.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox
		/*
		domElement_.removeEventListener( 'touchstart', touchstart, false );
		domElement_.removeEventListener( 'touchend', touchend, false );
		domElement_.removeEventListener( 'touchmove', touchmove, false );
		*/
		window.removeEventListener( 'keydown', onKeyDown, false );
	};
	this.rotate = function(deg) {
		//rotate the canvas with animation
		var dif = Math.abs(deg-this.longitude);
		var t = 0;
		if(dif<90) t= 0.5; //if less than 90 deg, then animate for half sec
		else if(dif<180) t=1; //if between 90-180 deg animate for one sec
		else t=1.5; //if more than 180 deg then animate for 1.5 sec
		TweenLite.to(this, t, {longitude: deg});
	};
	this.zoomInOut = function(fov, animate) {
		// keep fov in the range of 15 to 85
		var newFov = Math.min(Math.max(fov, IntoSite.Defaults.cameraMinFov), IntoSite.Defaults.cameraMaxFov);
		
		//update w/ animation
		if(animate) {
			TweenLite.to(camera_, 0.5, {fov: newFov, onUpdate: onTweenUpdate});
			function onTweenUpdate() {
				camera_.updateProjectionMatrix();
			}
		}
		//update w/o animate
		else {
			camera_.fov = newFov;
			camera_.updateProjectionMatrix();
		}
	};
	this.update = function() {
		// limiting latitude from -85 to 85 (cannot point to the sky or under your
		// feet)
		this.latitude = Math.max(IntoSite.Defaults.minLatitude, Math.min(IntoSite.Defaults.maxLatitude, this.latitude));
		var xDirection = Math.sin(THREE.Math.degToRad(90 - this.latitude))
				* Math.cos(THREE.Math.degToRad(this.longitude));
		var yDirection = Math.cos(THREE.Math.degToRad(90 - this.latitude));
		var zDirection = Math.sin(THREE.Math.degToRad(90 - this.latitude))
				* Math.sin(THREE.Math.degToRad(this.longitude));

		camera_.target.x = 500 * xDirection;
		camera_.target.y = 500 * yDirection
		camera_.target.z = 500 * zDirection;
		
		//
		camera_.lookAt(camera_.target);
	};
	this.reset = function() {
		this.latitude = 0;
		savedX_ = 0;
		savedY_ = 0;
		savedLongitude_ = 0;
		savedLatitude_ = 0;
		isMouseDown_ = false;
		this.update();
	};
	
	//private API

	function onMouseDown (event) {
		if(!self.isActive) {return;}
		
		event.preventDefault();
		event.stopPropagation();
		
		isMouseDown_ = true;

		savedX_ = event.clientX;
		savedY_ = event.clientY;

		savedLongitude_ = self.longitude;
		savedLatitude_ = self.latitude;
	};
	function onMouseMove (event) {
		if(!self.isActive) {return;}
		
		if (isMouseDown_) {
			self.longitude = (savedX_ - event.clientX) * 0.1 + savedLongitude_;
			self.latitude = (event.clientY - savedY_) * 0.1 + savedLatitude_;
		}
	};
	function onMouseWheel (event) {
		if(!self.isActive) {return;}
		// WebKit
		var newFov = camera_.fov;
		if (event.wheelDeltaY) {
			newFov -= event.wheelDeltaY * 0.05;
		// Opera / Explorer 9
		} else if (event.wheelDelta) {
			newFov -= event.wheelDelta * 0.05;
		// Firefox
		} else if (event.detail) {
			newFov += event.detail * 1.0;
		}
		self.zoomInOut(newFov, true);
	};
	function onKeyDown (event) {
		if(!self.isActive) {return;}
		// up arrow
		if (event.keyCode == keys_.UP) {
			self.latitude += IntoSite.Defaults.latitudeStep;
		}
		// down arrow
		else if (event.keyCode == keys_.BOTTOM) {
			self.latitude -= IntoSite.Defaults.latitudeStep;
		}
		// left arrow:
		else if (event.keyCode == keys_.LEFT) {
			self.longitude -= IntoSite.Defaults.longitudeStep;
		}
		// right arrow
		else if (event.keyCode == keys_.RIGHT) {
			self.longitude += IntoSite.Defaults.longitudeStep;
		}
		// + key for zoom
		else if(event.keyCode == keys_.PLUS) {
			self.zoomInOut(camera_.fov-IntoSite.Defaults.zoomStep, true);
		}
		// - key for zoom
		else if(event.keyCode == keys_.MINUS) {
			self.zoomInOut(camera_.fov+IntoSite.Defaults.zoomStep, true);
		}
	};
	function onMouseUp (event) {
		event.preventDefault();
		event.stopPropagation();
		isMouseDown_ = false;
	};
	
	//force update at start
	this.update();
};

THREE.PerspectiveControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PerspectiveControls.prototype.constructor = THREE.PerspectiveControls;