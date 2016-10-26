/**
* How to use:
* material = new THREE.zzzShader();
* mesh = new THREE.Mesh( sphere, material );
* scene.add( mesh );
* ...
* material.from.value = THREE.ImageUtils.loadTexture('...png');
* ...
* material.to.value = THREE.ImageUtils.loadTexture('...png');
* ...
* render() {
* ...
*   if(material.uniforms.progress.value < Math.PI/2) {
*      material.uniforms.progress.value +=0.01;
*   }
* }
*/


THREE.PixelizeShader = function() {

    //private property
    var material = {};
    //private CTOR
    var __construct = function() { 
        material = new THREE.ShaderMaterial({
            uniforms : {
                from : {
                    type : "t",
                    value : null
                },
                to : {
                    type : "t",
                    value : null
                },
                progress : {
                    type : "f",
                    value : 0.0
                }
            },
            vertexShader : [
                "precision highp float;",
                "precision highp int;",
                "varying vec3 vNormal;",
                "varying vec2 vUv;",

                "void main() {",
                    "vUv = uv ;",
                    "vNormal = normal;",
                    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                "}"
            ].join("\n"),
            fragmentShader : [
                "uniform sampler2D from, to;",
                "uniform float progress;",
                "float rand(vec2 co){",
                "  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
                "}",
                "void main() {",
                "  vec2 resolution = vec2(1680.0,1050.0);",
                "  float revProgress = (1.0 - progress);",
                "  float distFromEdges = min(progress, revProgress);",
                "  float squareSize = (50.0 * distFromEdges) + 1.0;",
                "  vec2 p = (floor((gl_FragCoord.xy + squareSize * 0.5) / squareSize) * squareSize) / resolution.xy;",
                "  vec4 fromColor = texture2D(from, p);",
                "  vec4 toColor = texture2D(to, p);",
                "  gl_FragColor = mix(fromColor, toColor, progress);",
                "}"
            ].join("\n")

      });
    }();
    /**
     * set progress of texture replacement
     */
    this.setProgress = function(p) {
        material.uniforms.progress.value = p;
    };
    /**
     * get the progress value
     */
    this.getProgress = function() {
        return material.uniforms.progress.value;
    };
    /**
     * Update/Set the from texture
     */
    this.setFromTexture = function(from) {
        material.uniforms.from.value = from;
    };
    /**
     * Update/Set the to texture
     */
    this.setToTexture = function(to) {
        material.uniforms.to.value = to;
    };
    /**
     * Get the THREE.Material of this object
     */
    this.getMaterial = function(p) {
        return material;
    };
 };

THREE.RippleCrossFadeShader = function() {
     
     //private property
     var material = {};
     //private CTOR
     var __construct = function() { 
         material = new THREE.ShaderMaterial({
         uniforms : {
             from : {
                 type : "t",
                 value : null
             },
             to : {
                 type : "t",
                 value : null
             },
             speed : {
                 type : "f",
                 value : 2.0
             },
             frequency : {
                 type : "f",
                 value : 25.0
             },
             amplitude : {
                 type : "f",
                 value : 10.0
             },
             progress : {
                 type : "f",
                 value : 0.0
             }
         },
         vertexShader : [

             "precision highp float;",
             "precision highp int;",
             "varying vec3 vNormal;",
             "varying vec2 vUv;",

             "void main() {",
                 "vUv = uv;",
                 "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
             "}"

         ].join("\n"),
         fragmentShader : [

             "precision highp float;",
             "precision highp int;",
             "varying vec2 vUv;",

             "uniform sampler2D from;",
             "uniform sampler2D to;",
             "uniform float speed;",
             "uniform float frequency;",
             "uniform float amplitude;",
             "uniform float progress;",
             "void main() {",               
                 "vec2 ripple = vec2(",
                 "sin(  (length( vUv - 0.5 ) * frequency ) + ( progress * speed ) ), cos( ( length( vUv - 0.5 ) * frequency ) + ( progress * speed ) ) ) ",
                 "* ( amplitude / 1000.0 );",
                 "float percent = sin( progress );",
                 "gl_FragColor = mix(texture2D( from, vUv + ripple * percent ),texture2D( to, vUv + ripple * ( 1.0 - percent ) ),percent);",
             "}" 
          ].join("\n")
         })
     }();
     
     /**
      * set progress of texture replacement
      */
     this.setProgress = function(p) {
         material.uniforms.progress.value = p;
     };
     /**
      * get the progress value
      */
     this.getProgress = function() {
         return material.uniforms.progress.value;
     };
     /**
      * Update/Set the from texture
      */
     this.setFromTexture = function(from) {
         material.uniforms.from.value = from;
     };
     /**
      * Update/Set the to texture
      */
     this.setToTexture = function(to) {
         material.uniforms.to.value = to;
     };
     /**
      * Get the THREE.Material of this object
      */
     this.getMaterial = function(p) {
         return material;
     };
}
 
THREE.DispersionBlurShader = function() {
     
     //private property
     var material = {};
     //private CTOR
     var __construct = function() { 
     material = new THREE.ShaderMaterial({
         uniforms : {
             from : {
                 type : "t",
                 value : null
             },
             to : {
                 type : "t",
                 value : null
             },
             progress : {
                 type : "f",
                 value : 0.0
             }
         },
         vertexShader : [
             "precision highp float;",
             "precision highp int;",
             "varying vec3 vNormal;",
             "varying vec2 vUv;",

             "void main() {",
                "vec2 uvScale = vec2(1.0,1.0);",
                 "vUv = uv * uvScale;",
                 "vNormal = normal;",
                 "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
             "}"
         ].join("\n"),
         fragmentShader : [
             "uniform sampler2D from;",
             "uniform sampler2D to;",
             "uniform float progress;",
             "const float size = 0.09;",
             "#define QUALITY 32",
             "const float GOLDEN_ANGLE = 2.399963229728653;",
             "vec4 blur(sampler2D t, vec2 c, float radius) {",
             "  vec4 sum = vec4(0.0);",
             "float q = float(QUALITY);",
             "  for (int i=0; i<QUALITY; ++i) {",
             "    float fi = float(i);",
             "    float a = fi * GOLDEN_ANGLE;",
             "    float r = sqrt(fi / q) * radius;",
             "    vec2 p = c + r * vec2(cos(a), sin(a));",
             "    sum += texture2D(t, p);",
             "  }",
             "  return sum / q;",
             "}",
             "void main()",
             "{",
             "  vec2 resolution = vec2(1680.0,1050.0);",
             "  vec2 p = gl_FragCoord.xy / resolution.xy;",
             "  float inv = 1.-progress;",
             "  gl_FragColor = inv*blur(from, p, progress*size) + progress*blur(to, p, inv*size);",
             "}"
         ].join("\n")
     })
     }();
     
     /**
      * set progress of texture replacement
      */
     this.setProgress = function(p) {
         material.uniforms.progress.value = p;
     };
     /**
      * get the progress value
      */
     this.getProgress = function() {
         return material.uniforms.progress.value;
     };
     /**
      * Update/Set the from texture
      */
     this.setFromTexture = function(from) {
         material.uniforms.from.value = from;
     };
     /**
      * Update/Set the to texture
      */
     this.setToTexture = function(to) {
         material.uniforms.to.value = to;
     };
     /**
      * Get the THREE.Material of this object
      */
     this.getMaterial = function(p) {
         return material;
     };
}
 
THREE.CrossZoomShader = function() {
    
    //private property
    var material = {};
    //private CTOR
    var __construct = function() { 
    material = new THREE.ShaderMaterial({

        uniforms : {
            from : {
                type : "t",
                value : null
            },
            to : {
                type : "t",
                value : null
            },
            strength : {
                type : "f",
                value : 0.35
            },
            progress : {
                type : "f",
                value : 0.0
            }
        },
        vertexShader : [
            "varying vec2 vUv;",
    
            "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),
        fragmentShader : [
            "uniform sampler2D from, to;",
            "uniform float progress;",
            "uniform float strength;",
            "const float PI = 3.141592653589793;",
            "float Linear_ease(in float begin, in float change, in float duration, in float tm) {",
            "    return change * tm / duration + begin;",
            "}",
            "float Exponential_easeInOut(in float begin, in float change, in float duration, in float tm) {",
            "    if (tm == 0.0)",
            "        return begin;",
            "    else if (tm == duration)",
            "        return begin + change;",
            "    tm = tm / (duration / 2.0);",
            "    if (tm < 1.0)",
            "        return change / 2.0 * pow(2.0, 10.0 * (tm - 1.0)) + begin;",
            "    return change / 2.0 * (-pow(2.0, -10.0 * (tm - 1.0)) + 2.0) + begin;",
            "}",
            "float Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float tm) {",
            "    return -change / 2.0 * (cos(PI * tm / duration) - 1.0) + begin;",
            "}",
            "float random(in vec3 scale, in float seed) {",
            "    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);",
            "}",
            "vec3 crossFade(in vec2 uv, in float dissolve) {",
            "    return mix(texture2D(from, uv).rgb, texture2D(to, uv).rgb, dissolve);",
            "}",
            "void main() {",
            "   vec2 resolution = vec2(1680.0,1050.0);",
            "    vec2 texCoord = gl_FragCoord.xy / resolution.xy;",
            "    vec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);",
            "    float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);",
            "    float strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);",
            "    vec3 color = vec3(0.0);",
            "    float total = 0.0;",
            "    vec2 toCenter = center - texCoord;",
            "    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);",
            "    for (float t = 0.0; t <= 40.0; t++) {",
            "        float percent = (t + offset) / 40.0;",
            "        float weight = 4.0 * (percent - percent * percent);",
            "        color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;",
            "        total += weight;",
            "    }",
            "    gl_FragColor = vec4(color / total, 1.0);",
            "}",
        ].join("\n")
    })
    }();
    
    /**
     * set progress of texture replacement
     */
    this.setProgress = function(p) {
        material.uniforms.progress.value = p;
    };
    /**
     * get the progress value
     */
    this.getProgress = function() {
        return material.uniforms.progress.value;
    };
    /**
     * Update/Set the from texture
     */
    this.setFromTexture = function(from) {
        material.uniforms.from.value = from;
    };
    /**
     * Update/Set the to texture
     */
    this.setToTexture = function(to) {
        material.uniforms.to.value = to;
    };
    /**
     * Get the THREE.Material of this object
     */
    this.getMaterial = function(p) {
        return material;
    };
}

THREE.ZoomBlurShader = function() {
    
    //private property
    var material = {};
    //private CTOR
    var __construct = function() { 
        material = new THREE.ShaderMaterial({

        uniforms : {
            from : {
                type : "t",
                value : null
            },
            to : {
                type : "t",
                value : null
            },
            strength : {
                type : "f",
                value : 0.35
            },
            progress : {
                type : "f",
                value : 0.0
            }
        },
        vertexShader : [
            "varying vec2 vUv;",

            "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),
        fragmentShader : [
            "uniform sampler2D from,to;",
            "uniform float progress;",
            "varying vec2 vUv;",
            "uniform float strength;",
            "float random(vec3 scale,float seed){return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}",
            "void main(){",
            "   vec2 center = vec2(1.0,1.0);",
            "    vec2 resolution = vec2(1680.0,1050.0);",
            "   vec4 color=vec4(0.0);",
            "   float total=0.0;",
            "   vec2 toCenter=center-vUv*resolution;",
            "   float offset=random(vec3(12.9898,78.233,151.7182),0.0);",
            "   for(float t=0.0;t<=40.0;t++){",
            "       float percent=(t+offset)/40.0;",
            "       float weight=4.0*(percent-percent*percent);",
            "       vec4 sample=mix(texture2D(from,vUv+toCenter*percent*strength/resolution),texture2D(to,vUv+toCenter*percent*strength/resolution),progress); //texture2D(from,vUv+toCenter*percent*strength/resolution);",
            "       sample.rgb*=sample.a;",
            "       color+=sample*weight;",
            "       total+=weight;",
            "   }",
            "   gl_FragColor=color/total;",
            "   gl_FragColor.rgb/=gl_FragColor.a+0.00001;",
            "}"
        ].join("\n")
        })
    }();

    /**
     * set progress of texture replacement
     */
    this.setProgress = function(p) {
        material.uniforms.progress.value = p;
    };
    /**
     * get the progress value
     */
    this.getProgress = function() {
        return material.uniforms.progress.value;
    };
    /**
     * Update/Set the from texture
     */
    this.setFromTexture = function(from) {
        material.uniforms.from.value = from;
    };
    /**
     * Update/Set the to texture
     */
    this.setToTexture = function(to) {
        material.uniforms.to.value = to;
    };
    /**
     * Get the THREE.Material of this object
     */
    this.getMaterial = function(p) {
        return material;
    };
}

THREE.FadeInFadeOutShader = function() {
    
    //private property
    var material = {};
    //private CTOR
    var __construct = function() { 
    material = new THREE.ShaderMaterial({

        uniforms : {
            from : {
                type : "t",
                value : null
            },
            to : {
                type : "t",
                value : null
            },
            progress : {
                type : "f",
                value : 0.0
            }
        },
        vertexShader : [
            "varying vec2 vUv;",
            "void main() {",
                "vUv = uv;",
                "gl_Position =   projectionMatrix *modelViewMatrix *vec4(position,1.0);",
             "}"
        ].join("\n"),
        fragmentShader : [
            "uniform sampler2D from, to;",
            "uniform float progress;",
            "varying vec2 vUv;",
            "void main() {",
                "gl_FragColor = mix(texture2D( from, vUv ),texture2D( to, vUv ),sin(progress) );",
            "}"
        ].join("\n")
    })
    }();
    
    /**
     * set progress of texture replacement
     */
    this.setProgress = function(p) {
        material.uniforms.progress.value = p;
    };
    /**
     * get the progress value
     */
    this.getProgress = function() {
        return material.uniforms.progress.value;
    };
    /**
     * Update/Set the from texture
     */
    this.setFromTexture = function(from) {
        material.uniforms.from.value = from;
    };
    /**
     * Update/Set the to texture
     */
    this.setToTexture = function(to) {
        material.uniforms.to.value = to;
    };
    /**
     * Get the THREE.Material of this object
     */
    this.getMaterial = function(p) {
        return material;
    };
};

/**
 * Mix two texture using shader
 *
 */
 
THREE.ShaderMixers = function(renderer, scene, camera) {
    var scene_;
	var shouldUpdateMe_;
	var mesh_;
	var sphere_;
	var completeCallback_;
	//private CTOR
    var __construct = function() { 
		scene_ = new THREE.Scene();
		shouldUpdateMe_ = false;
		// creation of a big sphere geometry
		sphere_ = new THREE.SphereGeometry(800, 150, 60);
		sphere_.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
		
		mesh_ = new THREE.Mesh( sphere_, new THREE.FadeInFadeOutShader().getMaterial());
	}();
	
	this.setShader = function(shader) {
		if(shader && shader.getMaterial()) {
			mesh_.material  = shader.getMaterial();
		}
		else {
			console.error('Expected Shader with getMaterial API');
		}
	}
	/**
	 * Mix between the textures
	 * oldText - old texture
	 * newText - new texture
	 * onDone - optional - to be called when the switch of texture is done and we render the newText only
	 *
	 */
	this.switchTextures = function(oldText, newText, onDone) {
		mesh_.material.uniforms.progress.value = 0;
		mesh_.material.uniforms.from.value = oldText;
		mesh_.material.uniforms.to.value = newText;
		mesh_.material.needsUpdate = true;
		scene_.add(mesh_);
		//if wanted to have callback when the mix texture is done
		completeCallback_ = onDone;
		//this param means that the renderer should render this scene_
		//and not the one we got in the CTOR from pano.
		//FIXME - this should be fixed in more elegant way
		shouldUpdateMe_ = true;
	};
	
	this.render = function() {
		renderer.clear();
		//In case the shader didn't finish
		if(shouldUpdateMe_) {
			if(mesh_.material.uniforms.progress.value < Math.PI/2) {
				mesh_.material.uniforms.progress.value += 0.02;
			}
			else {
				onComplete();
			}
			renderer.render(scene_, camera);
		}
		renderer.clearDepth();
		//
		if(!shouldUpdateMe_) {
			renderer.render(scene, camera);
		}
	};
	
	function onComplete() {
		shouldUpdateMe_ = false;
		scene_.remove(mesh_);
		mesh_.material.uniforms.progress.value = 0;
		mesh_.material.uniforms.from.value = null;
		mesh_.material.uniforms.to.value = null;
		mesh_.material.needsUpdate = false;
		
		if(completeCallback_!==undefined) {
			completeCallback_();
			completeCallback_ = undefined;
		}
	};
};