var JSComponents = JSComponents || {};

JSComponents.Compass = function() {
  //private members
  var rotateListeners_;
  var south_, north_, east_, west_;
  var arrow_;
  var rotateTransformation_;
  //private members for zoom toolbar
  var zoomIn_, zoomReset_, zoomOut_;
  var zoomListeners_;
  
  //private CROT
  var __construct = function() {
    rotateListeners_ = new Array();
	zoomListeners_ = new Array();
    document.addEventListener("DOMContentLoaded", onDocumentLoaded,false);  
   }();
   
   //public function
   this.rotate = function(deg) {
    // Rotate the disc of the compass.
      if(arrow_!==undefined) {
		//deg = deg%360;
		//if(deg<0) deg += 360;
		rotateInternal(deg,false);
      }
   };
   
   this.addRotateEventListener = function(callback) {
      rotateListeners_.push(callback);
   };
   
   this.removeRotateEventListener = function(callback) {
      var ind = rotateListeners_.indexOf(callback);
      if(ind > -1) {
        rotateListeners_.splice(ind,1);
      }
   };
   
   this.addZoomEventListeners = function(callback) {
		zoomListeners_.push(callback);
   };
   this.removeZoomEventListeners = function(callback) {
      var ind = zoomListeners_.indexOf(callback);
      if(ind > -1) {
        zoomListeners_.splice(ind,1);
      }
   };
   //private methods
   
	function onDocumentLoaded(event) {
		
		var compassNode = document.getElementById('compassId');
		compassNode.addEventListener("load", function() {

			var svgDoc = compassNode.contentDocument;
			south_ = svgDoc.getElementById('south');
			north_ = svgDoc.getElementById('north');
			east_ = svgDoc.getElementById('east');
			west_ = svgDoc.getElementById('west');
			arrow_ = svgDoc.getElementById('arrow');
			rotateTransformation_ = svgDoc.getElementById('rotateTransformation');
			//add click events
			south_.addEventListener('click', onLetterClicked, false);
			north_.addEventListener('click', onLetterClicked, false);
			east_.addEventListener('click', onLetterClicked, false);
			west_.addEventListener('click', onLetterClicked, false);

		},false);

		var zoomNode = document.getElementById('zoomId');
		zoomNode.addEventListener("load", function() {

			var svgDoc = zoomNode.contentDocument;
			zoomIn_ = svgDoc.getElementById('svg-pan-zoom-zoom-in');
			zoomReset_ = svgDoc.getElementById('svg-pan-zoom-reset-pan-zoom');
			zoomOut_ = svgDoc.getElementById('svg-pan-zoom-zoom-out');
			//add click events
			zoomIn_.addEventListener('click', onZoomInClick, false);
			zoomReset_.addEventListener('click', onZoomResetClick, false);
			zoomOut_.addEventListener('click', onZoomOutClick, false);

		}, false);
	  
    };

	function onZoomInClick(event) {
		fireZoomEvent('zoomIn');
	};
	function onZoomResetClick(event) {
		fireZoomEvent('zoomReset');
	};
	function onZoomOutClick(event) {
		fireZoomEvent('zoomOut');
	};
	
    function onLetterClicked (event) {
      var dir = event.target.id;
	  var clickedDegree = 0;
      switch(dir) {
        case 'north':
          //rotateInternal(0,true);
		  clickedDegree=0;
        break;
        case 'east':
          //rotateInternal(90,true);
		  clickedDegree=90;
        break;
        case 'south':
          //rotateInternal(180,true);
		  clickedDegree=180;
        break;
        case 'west':
          //rotateInternal(270,true);
		  clickedDegree=270;
        break;
      };
	  //current compass degree
	  var curDeg = getCurrentDegree();
	  //current compass degree in range [0,359.99]
	  var curAbsDegree = curDeg%360;
	  if(curAbsDegree<0) curAbsDegree+=360;
	  //find how much to move the compass
	  var dif = Math.abs(curAbsDegree-clickedDegree);
	  //find whether it is plus/minuc. i.e. back/fwd
	  if(curAbsDegree>clickedDegree) dif = -1*dif;
	  var newDeg = curDeg + dif;
	  //console.log('Cur='+curDeg+'\t\tNew='+newDeg+'\t\tClicked='+clickedDegree);
	  fireRotateEvent(newDeg);
    };
    function rotateInternal(deg,fireEvent) {
		//Hack: This rotate API is called from panoramic:render, i.e. all the time
		//We give the main window focus back since there is a bug when focus comes to svg element the window loose its focus
		//so there will be no key events.
		window.focus();
		//End of Hack
		
		var curDeg = getCurrentDegree();
		//if almost no change, do nothing.
		if(Math.abs(deg-curDeg) < 0.1) {
			return;
		}
		rotateTransformation_.setAttribute('from',''+curDeg+' 442 442');
		rotateTransformation_.setAttribute('to',''+deg+' 442 442');
		
		rotateTransformation_.beginElement();
		if(fireEvent) {
			fireRotateEvent(deg);
		}
    };
	function getCurrentDegree() {
		//get current deg (first num) from transform which it's value is: rotate(<num> <num> <num>)
		var curDeg = rotateTransformation_.getAttribute('to').split(' ')[0];
		try { 
			curDeg=parseFloat(curDeg); 
			if(isNaN(curDeg)) {curDeg=0;} //case first time, the curDeg is empty string.
		} catch(err){
			curDeg=0;
		}
		return curDeg;
	};
	function fireRotateEvent(deg) {
      rotateListeners_.forEach (function(listener) {
            listener(deg);
      });
    };
	function fireZoomEvent(type) {
		zoomListeners_.forEach (function(listener) {
            listener(type);
      });
	};
};

compass = new JSComponents.Compass();