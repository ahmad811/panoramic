THREE.DragControls = function(mouseControls,camera, domElement) {

    //members
    var raycaster_ = new THREE.Raycaster();
    var mouse_ = new THREE.Vector3(),
        offset_ = new THREE.Vector3(),
        intersection_ = new THREE.Vector3();
    var plane_ = new THREE.Plane();
    var intersected_, selected_;
    var isActive_ = true; //whether the DnD control active
    var objects_ = [];
    
    //initialization
    initEvents();

    //public methods
    this.activate = function() {
        isActive_ = true;
    }
    this.deactivate = function() {
        isActive_ = false;
    }
    this.addObject = function(obj) {
        objects_.push(obj);
    }
    this.removeObject = function(object) {
        var ind = objects_.indexOf(object);
        if (ind > -1) {
            objects_.splice(ind, 1);
        }
    }
    this.clearObjects = function() {
        objects_ = new Array();
    }
    this.dispose = function() {
        clearObjects();
        removeEvents();
    }
    
    //private methods
    function initEvents() {
        domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        domElement.addEventListener('mouseup', onDocumentMouseUp, false);
        domElement.addEventListener('dblclick', onDocumentDoubleClick, false);
    }
    function removeEvents() {
        domElement.removeEventListener('mousemove', onDocumentMouseMove);
        domElement.removeEventListener('mousedown', onDocumentMouseDown);
        domElement.removeEventListener('mouseup', onDocumentMouseUp);
        domElement.removeEventListener('dblclick', onDocumentDoubleClick);
    }
    function getObjects() {
        return objects_;
    }
    
    function onDocumentDoubleClick(event) {
        if(!isActive_) return;
        
       console.log('Double click at (' + event.clientX + ',' + event.clientY + ')');
    }
    function onDocumentMouseMove(event) {

        if(!isActive_) return;
        
        event.preventDefault();

        mouse_.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse_.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster_.setFromCamera( mouse_, camera );
        if ( selected_ ) {
            if ( raycaster_.ray.intersectPlane( plane_, intersection_ ) ) {
                selected_.position.copy( intersection_.sub( offset_ ) );
            }
            return;
        }

        var intersects = raycaster_.intersectObjects( getObjects(), false/*true*/ );
        if ( intersects.length > 0 ) {
            if ( intersected_ != intersects[ 0 ].object ) {

                if ( intersected_ ) {
                    intersected_.material.color.setHex( intersected_.currentHex );
                }
                intersected_ = intersects[ 0 ].object;
                intersected_.currentHex = intersected_.material.color.getHex();
                plane_.setFromNormalAndCoplanarPoint(camera.getWorldDirection( plane_.normal ),intersected_.position );
            }
            domElement.style.cursor = 'pointer';

        } else {
            if ( intersected_ ) {
                intersected_.material.color.setHex( intersected_.currentHex );
            }
            intersected_ = null;
            domElement.style.cursor = 'auto';
        }
    }

    function onDocumentMouseDown(event) {

        if(!isActive_) return;
        
        event.preventDefault();
        raycaster_.setFromCamera( mouse_, camera);
        var intersects = raycaster_.intersectObjects( getObjects(),false/* true*/ );

        if ( intersects.length > 0 ) {
            if(mouseControls!==undefined) mouseControls.enableMouseEvents(false);
            selected_ = intersects[ 0 ].object;

            if ( raycaster_.ray.intersectPlane( plane_, intersection_ ) ) {
                offset_.copy( intersection_ ).sub( selected_.position );
            }
            domElement.style.cursor = 'move';
        }
    }

    function onDocumentMouseUp(event) {
        event.preventDefault();
		
        if(mouseControls!==undefined) {
			mouseControls.enableMouseEvents(true);
		}
        if ( intersected_ ) {
            selected_ = null;
        }
        domElement.style.cursor = 'auto';
    }
}