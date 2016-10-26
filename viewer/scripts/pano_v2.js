/*
   The panorama viewer.
     Ahmad: See http://www.emanueleferonato.com/2014/12/10/html5-webgl-360-degrees-panorama-viewer-with-three-js/
 */
var IntoSite = {
    version : "1.0.0"
};

IntoSite.Defaults =
{
	//camera
	cameraFov : 65,
	zoomStep : 6,
	cameraMinFov : 15,
	cameraMaxFov : 85,
	maxLatitude : 85,
	minLatitude : -85,
	latitudeStep : 1.0,
	longitudeStep : 1.5
};
/**
 * Constructor
 * 
 * @Param: parentContainer type: Element
 * @Param: panoOptions type: PanoOptions
 */
IntoSite.PanoramaViewer = function(parentContainer, panoOptions) {
    if (parentContainer === undefined || panoOptions === undefined) {
        console.error("input parameters are not provided to Panaroma viewer!");
        return;
    }
	var self = this;
    this.parentElement = parentContainer;

    // create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.parentElement.offsetWidth,
            this.parentElement.offsetHeight);
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
//    this.renderer.autoClear = false;
    this.parentElement.appendChild(this.renderer.domElement);

    // create scene
    this.scene = new THREE.Scene();
	// adding a camera
    this.camera = new THREE.PerspectiveCamera(IntoSite.Defaults.cameraFov, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.z = 0;
    this.camera.updateProjectionMatrix();
    this.camera.target = new THREE.Vector3(0, 0, 0);

    ////
    // creation of a big sphere geometry
    this.sphere = new THREE.SphereGeometry(800, 150, 60);
    this.sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

    // creation of the sphere material
    this.sphereMaterial = new THREE.MeshBasicMaterial();
    // this.sphereMaterial.side = THREE.DoubleSide;
    // geometry + material = mesh (actual object)
    this.sphereMesh = new THREE.Mesh(this.sphere, this.sphereMaterial);
    // sphereMesh.isImmediateRenderObject=true;
    this.scene.add(this.sphereMesh);

    // a container group object which hold all of the links.
    this.neighbourLinksContainer = new THREE.Group();
    this.scene.add(this.neighbourLinksContainer);
    
    this.placeMartksContainer = new THREE.Group();
    this.scene.add(this.placeMartksContainer);
    // a container group object which holds the text (panoramic name)
    // for each link/arrow
    this.textOfNeighbourLinksContainer = new THREE.Group();
    this.scene.add(this.textOfNeighbourLinksContainer);

    // base color of the links/arrow
    this.baseColor = new THREE.Color(0xffffff);
    // highlighted Color of the links/arrows
    this.highlightedColor = new THREE.Color(0xccffff);
    // Location of this panoramic in the outer world.
    // This location is used in order to calculate the arrow direction relative
    // to the other panoramic direction.
    // It is also used in order to calculate which of the other panoramics are
    // close to this one.
    this.myLoc = new THREE.Vector3();

    this.enableMouseEvent=true;
    
    // setup the mouse/key listeners!
	var _onMouseMove = bind(this, this.onMouseMove);
    var _onMouseDown = bind(this, this.onMouseDown);
	var _resizeHandler = bind(this, this.onWindowResize);
	var domElement = this.renderer.domElement;
    domElement.addEventListener('mousemove', _onMouseMove, false);
    domElement.addEventListener('mousedown', _onMouseDown, false);
	window.addEventListener('resize', _resizeHandler, false);
  
	this.controls = new THREE.PerspectiveControls(this.camera, this.renderer.domElement);
	
    function bind(scope, fn) {
        return function() {
            fn.apply(scope, arguments);
        };
    };

    //To be used for mixing two shaders when switching pano
	this.shaderMixer = new THREE.ShaderMixers(this.renderer, this.scene, this.camera);
    //we pass this to the DragControls as MouseControl interface
    this.dndMgr = new THREE.DragControls(this, this.camera, this.renderer.domElement);
    
	this.initializeCompass();
	
	this.progress = new JSComponents.ProgressBar(document.getElementById('pano-canvas'));
	
	//var _render = bind(this, this.render);
    function startAnimationLoop() {
        requestAnimationFrame(startAnimationLoop);
        self.render();
    };
    // load the panorama!
    this.load(panoOptions);
    startAnimationLoop();
};

IntoSite.PanoramaViewer.prototype.constructor = IntoSite.PanoramaViewer;

/**
 * Enable or Disable mouse events of the pano.
 * This will be disabled for example when DnD sprites...
 */
IntoSite.PanoramaViewer.prototype.enableMouseEvents = function(b) {
    this.enableMouseEvent = b;
	this.controls.isActive = b;
}
/*
 * Loads the given pano options into the viewer
 */
IntoSite.PanoramaViewer.prototype.load = function(panoOptions, callback) {

    if (typeof this.textureLoader === 'undefined') {
        this.textureLoader = new THREE.TextureLoader();
    }
    this.panoImageURL = panoOptions.options.imageURL === undefined ? null
            : panoOptions.options.imageURL;
    //Loading new image - so re-set the myLoc
	//This to be used later when deciding the rotation of the link arrows
    this.myLoc.set(panoOptions.options.x, panoOptions.options.y,
            panoOptions.options.z);
    var self = this;

    // first clear up any links in current panorama
    this.clearLinks();
	//Don't allow DnD while loading new pano.
    this.dndMgr.clearObjects();
	self.dndMgr.deactivate();
    // Now, load the image/panoramic
    THREE.ImageUtils.loadTexture(this.panoImageURL, undefined,
            function(texture) {       
				
				//Following code is to mix two textures
				// If not first time
				if(self.sphereMaterial.map!==undefined && self.sphereMaterial.map!==null) {
					self.shaderMixer.switchTextures(self.sphereMaterial.map, texture, function() {
						self.dndMgr.activate();
						self.progress.hideProgress();
					});
				}
				//else 
				{
					self.sphereMaterial.map = texture;
					self.sphereMaterial.needsUpdate = true;
						
					self.controls.reset();
				   
					if (callback !== undefined) {
						callback();
					}
				}
            });

};

/**
 * Add me as rotate & zoom listener to the compass.
 * This will allow pano viewer to rotate/zoom the pano when user
 * clicks the compass objects.
 */
IntoSite.PanoramaViewer.prototype.initializeCompass = function() {
	var self = this;
	compass.addRotateEventListener(function(deg) {
		self.controls.rotate(deg);
	});
	compass.addZoomEventListeners(function(type) {
		if(type==='zoomIn'){
			self.controls.zoomInOut(self.camera.fov-IntoSite.Defaults.zoomStep,true);
		}
		else if(type==='zoomOut') {
			self.controls.zoomInOut(self.camera.fov+IntoSite.Defaults.zoomStep,true);
		}
		else if(type==='zoomReset') {
			//reset w/o animatiom
			self.controls.zoomInOut(IntoSite.Defaults.cameraFov,true);
		}
	});
};
/**
 * Function to add neighbor links on this panorama w/o text. The input
 * parameter is a list of LinkObjets. Each LinkObject has PanoOptions,
 * selectionCallback, directionOfLink
 */
IntoSite.PanoramaViewer.prototype.setLinks = function(linksArray, callback) {
    var self = this;

    if (typeof linksArray !== 'undefined' && linksArray.constructor === Array) {
        // cache the link texture - create only once.
        if (this.linkTexture !== undefined) {
            setLinksInternal();
        } else {
            THREE.ImageUtils.loadTexture("viewer/images/linkRight.svg", {}, function(tex1) {
                // avoid warning in the console.
                tex1.minFilter = THREE.LinearFilter;
                self.linkTexture = tex1;
                setLinksInternal();
            }, function(event) {
                console.error("Failed to load link image !!");
            });
        }
        function setLinksInternal() {
            
            linksArray.forEach(
                    function(linkObject) {
                     // same geo class will be used for all links/arrows
                        var geoMetry = new THREE.PlaneBufferGeometry(0.20, 0.25);
                        // Material for the link, we need new material for each
                        // link/arrow
                        // since we want to color the highlighted one and not
                        // the others.
                        var material = new THREE.MeshBasicMaterial({
                            map : self.linkTexture,
                            transparent : true,
                            opacity : 0.85,
                            color: 0xffffff,
                        });
                        var linkMesh = new THREE.Mesh(geoMetry, material);
                        linkMesh.linkInfo = linkObject;

                        // Calculate the angle for the arrow
                        var otherLoc = new THREE.Vector3(linkObject.options.x,
                                linkObject.options.y, linkObject.options.z);
                        // var alpha = acos(self.myLoc, otherLoc);
                        var alpha = THREE.Math.atan2(self.myLoc, otherLoc);

                        linkMesh.rotation.x = -Math.PI / 2;
                        linkMesh.rotation.z = alpha;
                        // this is helpful when there are two arrows pointing to
                        // the same direction.
                        var dist = self.myLoc.distanceTo(otherLoc);
                        linkMesh.translateX(0.4 + dist / 1000.0);
                        // create and locate the text
                        var txt = new THREE.SpriteUtils().createTextSprite(linkObject.options.name,{textWidthScale: 0.3, textHeightScale:0.12, textColor: {r:250,g:250,b:250, a:1}});
                        txt.rotation.x = -Math.PI / 2;
                        txt.rotation.z = alpha;
                        txt.translateX(0.45 + dist / 1000.0);
                        txt.translateZ(0.1);
                        // Add arrow and it's text to the scene.
                        self.textOfNeighbourLinksContainer.add(txt);
                        self.neighbourLinksContainer.add(linkMesh);

                    }, this);

            if (callback !== undefined) {
                callback();
            }
        }

    } else {
        if (callback !== undefined) {
            callback();
        }
    }
}

// removes all the links from the panorama!
IntoSite.PanoramaViewer.prototype.clearLinks = function() {
	this.neighbourLinksContainer.children.length = 0;
    this.textOfNeighbourLinksContainer.children.length = 0;
    this.placeMartksContainer.children.length = 0;
}

IntoSite.PanoramaViewer.prototype.render = function() {

	//update the perspective controls
	this.controls.update();
    // position the links group in front of the camera!
    var fact = 2/500;
    this.neighbourLinksContainer.position.set(fact * this.camera.target.x, -1,
            fact * this.camera.target.z);
    this.textOfNeighbourLinksContainer.position.set(fact * this.camera.target.x, -1,
            fact * this.camera.target.z);
    //If there is shader on
    if(this.shaderMixer!==undefined) {
		this.shaderMixer.render();
	}
	else {
		this.renderer.render(this.scene, this.camera);
	}
	//update the compass
	compass.rotate(this.controls.longitude);
};

IntoSite.PanoramaViewer.prototype.getIntersectedObjects = function(mouseX,
        mouseY) {
    // first check if mouse is clicked on the link objects
    var rayCaster = new THREE.Raycaster();
    var mouseVector = new THREE.Vector2(
            (mouseX / this.parentElement.offsetWidth) * 2 - 1,
            -(mouseY / this.parentElement.offsetHeight) * 2 + 1);
    rayCaster.setFromCamera(mouseVector, this.camera);
    var intersects = rayCaster
            .intersectObjects(this.neighbourLinksContainer.children);
    return intersects;
}

IntoSite.PanoramaViewer.prototype.onMouseDown = function(event) {
	if(this.enableMouseEvent==false)return;
    event.preventDefault();
    event.stopPropagation();
    var self = this;
    var intersects = this.getIntersectedObjects(event.clientX, event.clientY);
    if (intersects.length > 0) {
        var linkObject = intersects[0].object.linkInfo;
        self.onPanoLinkClicked(event, intersects[0].object);
        return;
    }
};

IntoSite.PanoramaViewer.prototype.checkHighlight = function(mouseX, mouseY) {

    // first check if mouse is clicked on the link objects
    var intersects = this.getIntersectedObjects(mouseX,mouseY);
    var clearHighlight = false;
    // if there is one (or more) intersections
    if (intersects.length > 0) {
        intersectObj = intersects[0];
        if (intersectObj !== undefined) { // case if mouse is not currently
            // over an object
            if (this.INTERSECTED == null) {
                this.INTERSECTED = intersectObj;
                this.INTERSECTED.object.material.color = this.highlightedColor;
            } else { // if thse mouse is over an object
                this.INTERSECTED.object.material.color = this.baseColor;
                this.INTERSECTED.object.geometry.colorsNeedUpdate = true;
                this.INTERSECTED = intersectObj;
                this.INTERSECTED.object.material.color = this.highlightedColor;
            }
            // update mouseSphere coordinates and update colors
            // mouseSphereCoords =
            // [this.INTERSECTED.point.x,this.INTERSECTED.point.y,this.INTERSECTED.point.z];
            this.INTERSECTED.object.geometry.colorsNeedUpdate = true;

        } else {
            clearHighlight = true;
        }
    } else {
        clearHighlight = true;
    }
    if (clearHighlight) {
        // restore previous intersection object (if it exists) to its original
        // color
        if (this.INTERSECTED) {
            this.INTERSECTED.object.material.color = this.baseColor;
            this.INTERSECTED.object.geometry.colorsNeedUpdate = true;
        }
        // remove previous intersection object reference
        // by setting current intersection object to "nothing"

        this.INTERSECTED = null;
    }
};

IntoSite.PanoramaViewer.prototype.onMouseMove = function(event) {
    if(this.enableMouseEvent===false)return;
    
	this.checkHighlight(event.clientX, event.clientY);
};


IntoSite.PanoramaViewer.prototype.onWindowResize = function(event) {

    this.camera.aspect = this.parentElement.offsetWidth
            / this.parentElement.offsetHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.parentElement.offsetWidth,
            this.parentElement.offsetHeight);
}

// this method is called when a neighbouring panorama link is clicked by the
// user the parameter is the link object
IntoSite.PanoramaViewer.prototype.onPanoLinkClicked = function(event,
        linkObject) {
    var self = this;
    
    this.progress.showProgress(event.clientX, event.clientY);
	
    this.clearLinks();
	
	//switch with effect does not looks good with shaders, need PM to decide
	//switchWithEffect();
	
	//Wrapping the switchWithoutEffect by timeour in order to let the renderer an option to render the progress
	//Otherwise, sometimes there will be some delay to render the animated progress
	setTimeout(function() {
		switchWithoutEffect();
	},50);
	
	function switchWithoutEffect() {
		self.sphereMaterial.transparent = true;
		self.load(linkObject.linkInfo, function() {
			self.sphereMaterial.transparent = false;
			linkObject.linkInfo.selectionCallback(linkObject.linkInfo, self);
			
			createSampleSprite(self);
		});
	}
	
	function switchWithEffect() {
		//this is need here in order to have the fade effect
		self.sphereMaterial.transparent = true;
		var tw = TweenLite.fromTo(self.sphereMaterial, 1, { opacity : 1}, {opacity : 0.4});
		var f1 = self.camera.fov ;
		var tw2 = TweenLite.to(self.camera, 1.5, {fov: f1+35 , onUpdate : onUpdateTween});

		//W/o those timeouts, tweenlite will not work as expected.
		setTimeout(function() {

			self.load(linkObject.linkInfo, function() {

				setTimeout(function() {
					tw.reverse();
					tw2.reverse();
					//TweenLite.fromTo(self.sphereMaterial, 1, { opacity : 0.4}, {opacity : 1, onComplete:onCompleteTween});
					//TODO this should be part of the reverse API but i couldn't find such one
					//Need to think to use maybe other Tween objects such as TweenLine
					onCompleteTween();
					
					//TODO - To be deleted - this is a test code
					createSampleSprite(self);
					
				}, 500);
			});
		}, 500);

		function onUpdateTween() {
			self.camera.updateProjectionMatrix();
		}
		
		function onCompleteTween() {
			self.sphereMaterial.transparent = false;
			self.progress.hideProgress();
			linkObject.linkInfo.selectionCallback(linkObject.linkInfo, self);
		}
	}
}

function createSampleSprite (panoViewer) {
    var x = 2;
    var y = 0;//Math.random() * 600 - 600;
    var z = -10;
    var parameters = {
		imageUrl:'viewer/images/staff.png' , 
		textColor:{r:250,g:250,b:250}, 
		textWidthScale: 1.3, 
		textHeightScale:0.3, 
		imageHeight: 0.7 , 
		imageWidth: 0.7, 
		position: new THREE.Vector3(x,y,z)
	};
    var spriteUtils = new THREE.SpriteUtils();
    spriteUtils.createImageSprite(parameters, function(sprite) {
        
        var txt= spriteUtils.createTextSprite( " Hello World...I am Here! ",parameters );
        
        //This code will connect the txt to the image
        //they will be moved together, rotate/scaled
//        var x = txt.clone(); x.position.set(0,0,0);
//        x.scale.set(0.5,0.1,1);
//        sprite.add(x);
//        x.translateY(-0.7);
        
        //if txt is up the sprite 
//        txt.translateY(0.7);
        //else if txt is down
        txt.translateY(-0.5);
        
//        panoViewer.placeMartksContainer.add(sprite);
//        panoViewer.dndMgr.addObject(sprite);
        
        panoViewer.placeMartksContainer.add(sprite);
        panoViewer.placeMartksContainer.add(txt);
        panoViewer.dndMgr.addObject(sprite);
        
    });
}

/// Helper Methods
THREE.Math.atan2 = function (v1, v2) {
    // y always zero
    var nv1 = new THREE.Vector2(v1.x, v1.z);
    var nv2 = new THREE.Vector2(v2.x, v2.z);
    // new v2 = v2-v1
    nv2.sub(nv1);

    nv1.normalize();
    nv2.normalize();

    return (Math.atan2(nv2.y, nv2.x) - Math.atan2(nv1.y, nv1.x));
}

THREE.Math.acos = function (v1, v2) {

    return v1.angleTo(new THREE.Vector3().subVectors(v2, v1));
}