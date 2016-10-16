/**
 * How to use makeTextSprite:
 *  textSprite= makeTextSprite( " World! ", { fontSize: 32, fontFace: "Arial", borderColor: {r:0, g:0, b:255, a:1.0} } );
 *  parameters are:
 *      fontFace - string , default isArial
 *      fontSize - int , default is 18
 *      fontWeight - string such as 'normal' , 'bold' , 'italic' or mix. default is 'normal'
 *      textColor - {r: [0-255],g : [0-255],b : [0-255] ,a : [0-1]} , default is { r:0, g:0, b:0, a:1.0 }
 *      textScale - int for scaling the text's width and height. default is 1
 *      position - Vector3 , default is (0,0,0)
 */

THREE.SpriteUtils = function() {
    
    var __construct = function() {
    }();
    
    this.createTextSprite = function( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        
        var fontface = parameters.hasOwnProperty("fontFace") ? parameters["fontFace"] : "Arial";
        
        var fontsize = parameters.hasOwnProperty("fontSize") ? parameters["fontSize"] : 18;

        var fontWeight = parameters.hasOwnProperty("fontWeight") ? parameters["fontWeight"] : "normal";
        
        var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };
        
        var textWidthScale = parameters.hasOwnProperty("textWidthScale") ? parameters["textWidthScale"] : 1;
        var textHeightScale = parameters.hasOwnProperty("textHeightScale") ? parameters["textHeightScale"] : 1;
        
        var position = parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3();
        //create the canvas
        var canvas  = document.createElement( 'canvas' );
        
        //create the texture from the 2d context
        var context = canvas.getContext( '2d' );
        context.font = fontWeight + " " + fontsize + "px " + fontface;
        //dont remove
        context.font = fontWeight + " " + fontsize + "px " + fontface;
        var textSize    = context.measureText(message);
        
        canvas.width = textSize.width * 1.05;
        canvas.height = fontsize * 1.2;
        
        // dont remove draw the text at loc (x,y) relative to the canvas
        context.font = fontWeight + " " + fontsize + "px " + fontface;
        // text color
        if(textColor.a === undefined) {
            textColor.a=1.0;
        }
        context.fillStyle = "rgba(" + textColor.r + "," + textColor.g + "," + textColor.b + "," + textColor.a + ")";
        //draw text aligned left and almost bottom
        context.fillText(message, 0, canvas.height * 0.8);
        
//        context.fillStyle = "red";
//        context.strokeRect(0,0,canvas.width,canvas.height);
        // make the texture as .needsUpdate
        var texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter ;
        texture.needsUpdate    = true;
        
        var spriteMaterial = new THREE.SpriteMaterial( 
                { map: texture, useScreenCoordinates: true } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set( textWidthScale, textHeightScale, 1 );
        sprite.position.copy(position);
        
        return sprite;
    }
    
    /**
     * create an Image object as sprite
     * parameters is a struct of:
     *  imageUrl : string , default is null
     *  imageWidth : int , default is 15
     *  imageHeight : int , default is 10
     *  position : THREE.Vector3 , default is (0,0,0)
     *  callback: the sprite
     */
    
    this.createImageSprite = function(parameters, callback) {
       
        if (parameters === undefined) parameters = {};
        var imageUrl = parameters["imageUrl"];
        var imageWidth = parameters.hasOwnProperty("imageWidth") ? parameters["imageWidth"] : 15;
        var imageHeight = parameters.hasOwnProperty("imageHeight") ? parameters["imageHeight"] : 10;
        var position = parameters.hasOwnProperty("position") ? parameters["position"] : new THREE.Vector3();
        
        var texture = THREE.ImageUtils.loadTexture(imageUrl, {}, function(texture) {
                texture.minFilter = THREE.NearestFilter ;
                var material = new THREE.SpriteMaterial({
                    map: texture,
                    useScreenCoordinates: true
                });
                var sprite = new THREE.Sprite(material);
                sprite.position.copy(position);
                sprite.scale.set(imageWidth, imageHeight, 1.0);
                //?? should we parameterize it?
                sprite.material.opacity = 0.7;
                
                callback(sprite);
        });
    }

}