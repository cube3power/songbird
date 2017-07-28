(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	'use strict';

	// Primary namespace for Junco library.
	exports.Junco = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @fileOverview Junco library name space and common utilities.
	 */

	'use strict';

	/**
	 * @class Junco main namespace.
	 */
	var Junco = {};

	// Internal dependencies.
	var Listener = __webpack_require__(2);
	var Source = __webpack_require__(6);

	/**
	 * Create {@link Listener Listener} to listen to
	 * sources in a configurable environment.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Number} options.ambisonicOrder
	 * Desired ambisonic order.
	 * @param {Map} options.dimensions
	 * Dimensions map which should conform to the layout of
	 * {@link Room.DefaultDimensions Room.DefaultDimensions}
	 * @param {Map} options.materials
	 * Materials map which should conform to the layout of
	 * {@link Room.DefaultMaterials Room.DefaultMaterials}
	 * @param {Number} options.speedOfSound
	 * (in meters / second).
	 */
	Junco.createListener = function (context, options) {
	  return new Listener(context, options);
	}

	/**
	 * Create {@link Source Source} to spatialize an audio buffer.
	 * @param {Listener} listener Associated Listener.
	 * @param {Object} options
	 * @param {Number} options.minDistance Min. distance (in meters).
	 * @param {Number} options.maxDistance Max. distance (in meters).
	 * @param {Number} options.gain Gain (linear).
	 * @param {Float32Array} options.position Position [x,y,z] (in meters).
	 * @param {Float32Array} options.velocity Velocity [x,y,z] (in meters).
	 * @param {Float32Array} options.orientation Orientation [x,y,z] (in meters).
	 */
	Junco.createSource = function(listener, options) {
	  return new Source(listener, options);
	}

	module.exports = Junco;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Listener model to spatialize sources in an environment.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var Reflections = __webpack_require__(10);
	var Reverb = __webpack_require__(12);
	var Room = __webpack_require__(14);
	var Globals = __webpack_require__(5);

	/**
	 * @class Listener
	 * @description Listener model to spatialize sources in an environment.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Number} options.ambisonicOrder
	 * Desired ambisonic order.
	 * @param {Map} options.dimensions
	 * Dimensions map which should conform to the layout of
	 * {@link Room.DefaultDimensions Room.DefaultDimensions}
	 * @param {Map} options.materials
	 * Materials map which should conform to the layout of
	 * {@link Room.DefaultMaterials Room.DefaultMaterials}
	 * @param {Number} options.speedOfSound
	 * (in meters / second).
	 */
	function Listener (context, options) {
	  // Public variables.
	  /**
	   * Listener's speed of sound (in meters/second).
	   * @member {Number} speedOfSound
	   * @memberof Listener
	   */
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof Reverb
	   */
	  /**
	   * Outuput to .connect() object from.
	   * @member {AudioNode} output
	   * @memberof Listener
	   */

	  //TODO(bitllama): Add "outside-the-room" effect.

	  // Assign defaults for undefined options.
	  if (options == undefined) {
	    options = new Object();
	  }
	  if (options.ambisonicOrder == undefined) {
	    options.ambisonicOrder = Globals.DefaultAmbisonicOrder;
	  }
	  if (options.speedOfSound == undefined) {
	    options.speedOfSound = Globals.DefaultSpeedOfSound;
	  }
	  this.speedOfSound = Globals.DefaultSpeedOfSound;

	  // Stored in order to access when constructing sources.
	  this._context = context;
	  this._ambisonicOrder = options.ambisonicOrder;
	  this._position = new Float32Array(3);

	  // Create nodes.
	  this._reflections = new Reflections(context, options);
	  this._reverb = new Reverb(context);
	  this.output = context.createGain();

	  // Connect nodes.
	  this._reflections.output.connect(this.output);
	  this._reverb.output.connect(this.output);

	  // Assign initial conditions.
	  this.setPosition(0, 0, 0);
	  this.setVelocity(0, 0, 0);
	  this.setRoomProperties(options.dimensions, options.materials);
	}

	/**
	 * Set the listener's position (in meters).
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Listener.prototype.setPosition = function(x, y, z) {
	  this._position = [x, y, z];
	  this._reflections.speedOfSound = this.speedOfSound;
	  this._reflections.setListenerPosition(x, y, z);
	}

	/**
	 * Set the listener's velocity (in meters/second).
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Listener.prototype.setVelocity = function(x, y, z) {
	  //TODO(bitllama): Doppler!
	}

	/**
	 * Set the dimensions and material properties
	 * for the room associated with the listener.
	 * @param {Map} dimensions
	 * Dimensions map which should conform to the layout of
	 * {@link Room.DefaultDimensions Room.DefaultDimensions}
	 * @param {Map} materials
	 * Materials map which should conform to the layout of
	 * {@link Room.DefaultMaterials Room.DefaultMaterials}
	 */
	Listener.prototype.setRoomProperties = function(dimensions, materials) {
	  // Update reverb.
	  var coefficients = Room.getCoefficientsFromMaterials(materials);
	  var RT60Secs =
	    Room.computeRT60Secs(dimensions, coefficients, this.speedOfSound);
	  this._reverb.setRT60s(RT60Secs);

	  // Update reflections.
	  this._reflections.speedOfSound = this.speedOfSound;
	  this._reflections.setRoomProperties(dimensions, coefficients);
	}

	module.exports = Listener;

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Junco library common utilities.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	/**
	 * Junco library logging function.
	 * @type {Function}
	 * @param {any} Message to be printed out.
	 */
	exports.log = function () {
	  window.console.log.apply(window.console, [
	    '%c[Junco]%c '
	      + Array.prototype.slice.call(arguments).join(' ') + ' %c(@'
	      + performance.now().toFixed(2) + 'ms)',
	    'background: #BBDEFB; color: #FF5722; font-weight: 700',
	    'font-weight: 400',
	    'color: #AAA'
	  ]);
	};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	/**
	 * @license
	 * Copyright 2017 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Mathematical constants and default values for submodules.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	/**
	 * @class Globals
	 * @description Mathematical constants and default values for submodules.
	 */
	var Globals = {};

	// Math constants.
	Globals.TwoPi = 6.28318530717959;
	Globals.TwentyFourLog10 = 55.2620422318571;
	Globals.TwentyFourLog10Div343 = 0.161113825748855;
	Globals.Log1000 = 6.90775527898214;
	Globals.Log2Div2 = 0.346573590279973;
	Globals.PiByOneEighty = 0.017453292519943;
	Globals.OneEightyByPi = 57.295779513082323;

	// Numerical constants.
	Globals.EpsilonFloat = 1e-6;

	/** Rolloff models (e.g. 'logarithmic', 'linear', or 'none'). */
	Globals.RolloffModels = ['logarithmic', 'linear', 'none'];
	/** Default rolloff model ('logarithmic'). */
	Globals.DefaultRolloffModel = 'logarithmic';
	Globals.DefaultMinDistance = 1;
	Globals.DefaultMaxDistance = 1000;
	Globals.DefaultGainLinear = 1;
	Globals.DefaultPosition = [0, 0, 0];
	Globals.DefaultOrientation = [0, 0, -1];

	// Listener defaults.
	Globals.DefaultAmbisonicOrder = 3;
	Globals.DefaultSpeedOfSound = 343;

	// Reverb constants and defaults.
	/**
	 * Center frequencies of the multiband reverberation engine.
	 * Nine bands are computed by: 31.25 * 2^(0:8).
	 * @member {Array}
	 */
	Globals.ReverbBands = [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000];
	/** The number of center frequencies supported.
	 * @member {Number}
	 */
	Globals.NumReverbBands = Globals.ReverbBands.length;
	/** The default bandwidth of the center frequencies. */
	Globals.ReverbBandwidth = 1;
	/** The default multiplier applied when computing tail lengths. */
	Globals.ReverbDurationMultiplier = 1;
	Globals.DefaultReverbPreDelayMs = 1.5;
	Globals.DefaultReverbTailOnsetMs = 3.8;
	Globals.DefaultReverbGain = 0.008;
	Globals.DefaultReverbMaxDurationSecs = 3;

	// Reflections constants and defaults.
	Globals.ReflectionsMaxDuration = 1;
	Globals.DefaultReflectionsCutoffFrequency = 6400; // -12dB cutoff.
	Globals.DefaultReflectionsStartingBand = 4;
	Globals.DefaultReflectionsNumAveragingBands = 3;

	module.exports = Globals;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Source model to spatialize an audio buffer.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var Attenuation = __webpack_require__(13);
	var AmbisonicEncoder = __webpack_require__(8);
	var Globals = __webpack_require__(5);

	/**
	 * @class Source
	 * @description Source model to spatialize an audio buffer.
	 * @param {Listener} listener Associated Listener.
	 * @param {Object} options
	 * @param {Number} options.minDistance Min. distance (in meters).
	 * @param {Number} options.maxDistance Max. distance (in meters).
	 * @param {Number} options.gain Gain (linear).
	 * @param {Float32Array} options.position Position [x,y,z] (in meters).
	 * @param {Float32Array} options.velocity Velocity [x,y,z] (in meters).
	 * @param {Float32Array} options.orientation Orientation [x,y,z] (in meters).
	 */
	function Source (listener, options) {
	  // Public variables.
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof Source
	   */

	  // Assign defaults for undefined options.
	  if (options == undefined) {
	    options = new Object();
	  }
	  if (options.gain == undefined) {
	    options.gain = Globals.DefaultGainLinear;
	  }
	  if (options.position == undefined) {
	    options.position = Globals.DefaultPosition;
	  }
	  if (options.velocity == undefined) {
	    options.velocity = Globals.DefaultVelocity;
	  }
	  if (options.orientation == undefined) {
	    options.orientation = Globals.DefaultOrientation;
	  }

	  this._listener = listener;
	  this._position = new Float32Array(3);
	  this._velocity = new Float32Array(3);
	  this._orientation = new Float32Array(3);

	  // Create nodes.
	  var context = listener._context;
	  this.input = context.createGain();
	  this._attenuation =
	    new Attenuation(context, options);
	  this._encoder =
	    new AmbisonicEncoder(context, listener._ambisonicOrder);

	  // Connect nodes.
	  this.input.connect(this._attenuation.input);
	  this.input.connect(listener._reverb.input);
	  this._attenuation.output.connect(this._encoder.input);
	  this._attenuation.output.connect(listener._reflections.input);
	  this._encoder.output.connect(listener.output);

	  // Assign initial conditions.
	  this.setPosition(options.position);
	  this.setVelocity(options.velocity);
	  this.setOrientation(options.orientation);
	  this.input.gain.value = options.gain;
	}

	/**
	 * Set source's position (in meters).
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Source.prototype.setPosition = function(x, y, z) {
	  var dx = new Float32Array(3);

	  // Assign new position.
	  this._position[0] = x;
	  this._position[1] = y;
	  this._position[2] = z;

	  // Compute distance to listener.
	  for (var i = 0; i < 3; i++) {
	    dx[i] = this._position[i] - this._listener._position[i];
	  }
	  var distance = Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]);

	  // Normalize direction vector.
	  dx[0] /= distance;
	  dx[1] /= distance;
	  dx[2] /= distance;

	  // Compuete angle of direction vector.
	  var azimuth = Math.atan2(-dx[0], dx[2]) * Globals.OneEightyByPi;
	  var elevation = Math.atan2(dx[1],
	    Math.sqrt(dx[0] * dx[0] + dx[2] * dx[2])) * Globals.OneEightyByPi;

	  // Set distance/direction values.
	  this._attenuation.setDistance(distance);
	  this._encoder.setDirection(azimuth, elevation);
	}

	/**
	 * Set source's angle relative to the listener's position.
	 * @param {Number} azimuth (in degrees).
	 * @param {Number} elevation (in degrees).
	 * @param {Number} distance (in meters).
	 */
	Source.prototype.setAngleFromListener = function(azimuth, elevation, distance) {
	  var phi = azimuth * Globals.PiByOneEighty;
	  var theta = elevation * Globals.PiByOneEighty;

	  // Polar -> Cartesian.
	  var x = Math.cos(phi) * Math.cos(theta);
	  var y = Math.sin(theta);
	  var z = Math.sin(phi) * Math.cos(theta);

	  // Assign new position based on relationship to listener.
	  this._position[0] = this._listener._position[0] + x;
	  this._position[1] = this._listener._position[1] + y;
	  this._position[2] = this._listener._position[2] + z;

	  // Set distance/direction values.
	  this._attenuation.setDistance(distance);
	  this._encoder.setDirection(azimuth, elevation);
	}

	/**
	 * Set source's forward orientation.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Source.prototype.setOrientation = function(x, y, z) {
	  //TODO(bitllama) Make directivity thing here.
	}

	/**
	 * Set source's velocity (in meters/second).
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Source.prototype.setVelocity = function(x, y, z) {
	  //TODO(bitllama) Make velocity/doppler thing here.
	}

	module.exports = Source;

/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Spatially encodes input using spherical harmonics.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var AmbisonicEncoderTable = __webpack_require__(9);
	var AmbisonicEncoderTableMaxOrder = AmbisonicEncoderTable[0][0].length / 2;
	var Utils = __webpack_require__(4);

	/**
	 * @class AmbisonicEncoder
	 * @description Spatially encodes input using spherical harmonics.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Number} ambisonicOrder
	 * Desired ambisonic Order.
	 */
	function AmbisonicEncoder (context, ambisonicOrder) {
	  // Public variables.
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof AmbisonicEncoder
	   */
	  /**
	   * Outuput to .connect() object from.
	   * @member {AudioNode} output
	   * @memberof AmbisonicEncoder
	   */
	  this._ambisonicOrder = ambisonicOrder;
	  if (this._ambisonicOrder > AmbisonicEncoderTableMaxOrder) {
	    Utils.log('Junco (Error):\nUnable to render ambisonic order',
	      ambisonic_order, '(Max order is', AmbisonicEncoderTableMaxOrder,
	      ')\nUsing max order instead.');
	    this._ambisonicOrder = AmbisonicEncoderTableMaxOrder;
	  }

	  var num_channels = (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);
	  this._merger = context.createChannelMerger(num_channels);
	  this._masterGain = context.createGain();
	  this._channelGain = new Array(num_channels);
	  for (var i = 0; i < num_channels; i++) {
	    this._channelGain[i] = context.createGain();
	    this._masterGain.connect(this._channelGain[i]);
	    this._channelGain[i].connect(this._merger, 0, i);
	  }

	  // Input/Output proxy.
	  this.input = this._masterGain;
	  this.output = this._merger;
	}

	/**
	 * Set the direction of the encoded source signal.
	 * @param {Number} azimuth Azimuth (in degrees).
	 * @param {Number} elevation Elevation (in degrees).
	 */
	AmbisonicEncoder.prototype.setDirection = function(azimuth, elevation) {
	  // Format input direction to nearest indices.
	  if (isNaN(azimuth)) {
	    azimuth = 0;
	  }
	  if (isNaN(elevation)) {
	    elevation = 0;
	  }

	  azimuth = Math.round(azimuth % 360);
	  if (azimuth < 0) {
	    azimuth += 360;
	  }
	  elevation = Math.round(elevation) + 90;

	  // Assign gains to each output.
	  for (var i = 1; i <= this._ambisonicOrder; i++) {
	    for (var j = -i; j <= i; j++) {
	      var acnChannel = (i * i) + i + j;
	      var elevationIndex = i * (i + 1) / 2 + Math.abs(j) - 1;
	      var val = AmbisonicEncoderTable[1][elevation][elevationIndex];
	      if (j != 0) {
	        var azimuthIndex = AmbisonicEncoderTableMaxOrder + j - 1;
	        if (j < 0) {
	          azimuthIndex = AmbisonicEncoderTableMaxOrder + j;
	        }
	        val *= AmbisonicEncoderTable[0][azimuth][azimuthIndex];
	      }
	      this._channelGain[acnChannel].gain.value = val;
	    }
	  }
	}

	module.exports = AmbisonicEncoder;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2017 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @fileOverview Pre-computed lookup tables of spherical harmonics.
	 */

	'use strict';

	/**
	 * Pre-computed Spherical Harmonics Coefficients.
	 *
	 * This function generates an efficient lookup table of SH coefficients. It
	 * exploits the way SHs are generated (i.e. Ylm = Nlm * Plm * Em). Since Nlm
	 * & Plm coefficients only depend on theta, and Em only depends on phi, we
	 * can separate the equation along these lines. Em does not depend on
	 * degree, so we only need to compute (2 * l) per azimuth Em total and
	 * Nlm * Plm is symmetrical across indexes, so only positive indexes are
	 * computed (l * (l + 1) / 2) per elevation.
	 * @type {Float32Array}
	 */
	var AmbisonicEncoderTable =
	[
	  [
	    [
	      0,
	      0,
	      0,
	      0,
	      0,
	      1,
	      1,
	      1,
	      1,
	      1
	    ],
	    [
	      0.0871557444,
	      0.0697564706,
	      0.0523359552,
	      0.0348994955,
	      0.0174524058,
	      0.99984771,
	      0.999390841,
	      0.99862951,
	      0.997564077,
	      0.99619472
	    ],
	    [
	      0.173648179,
	      0.139173105,
	      0.104528464,
	      0.0697564706,
	      0.0348994955,
	      0.999390841,
	      0.997564077,
	      0.994521916,
	      0.990268052,
	      0.98480773
	    ],
	    [
	      0.258819044,
	      0.207911685,
	      0.156434461,
	      0.104528464,
	      0.0523359552,
	      0.99862951,
	      0.994521916,
	      0.987688363,
	      0.978147626,
	      0.965925813
	    ],
	    [
	      0.342020154,
	      0.275637358,
	      0.207911685,
	      0.139173105,
	      0.0697564706,
	      0.997564077,
	      0.990268052,
	      0.978147626,
	      0.96126169,
	      0.939692616
	    ],
	    [
	      0.42261827,
	      0.342020154,
	      0.258819044,
	      0.173648179,
	      0.0871557444,
	      0.99619472,
	      0.98480773,
	      0.965925813,
	      0.939692616,
	      0.906307817
	    ],
	    [
	      0.5,
	      0.406736642,
	      0.309017,
	      0.207911685,
	      0.104528464,
	      0.994521916,
	      0.978147626,
	      0.95105654,
	      0.91354543,
	      0.866025388
	    ],
	    [
	      0.57357645,
	      0.469471574,
	      0.35836795,
	      0.241921902,
	      0.121869341,
	      0.992546141,
	      0.970295727,
	      0.933580399,
	      0.882947564,
	      0.819152057
	    ],
	    [
	      0.642787635,
	      0.529919267,
	      0.406736642,
	      0.275637358,
	      0.139173105,
	      0.990268052,
	      0.96126169,
	      0.91354543,
	      0.848048091,
	      0.766044438
	    ],
	    [
	      0.707106769,
	      0.587785244,
	      0.453990489,
	      0.309017,
	      0.156434461,
	      0.987688363,
	      0.95105654,
	      0.891006529,
	      0.809017,
	      0.707106769
	    ],
	    [
	      0.766044438,
	      0.642787635,
	      0.5,
	      0.342020154,
	      0.173648179,
	      0.98480773,
	      0.939692616,
	      0.866025388,
	      0.766044438,
	      0.642787635
	    ],
	    [
	      0.819152057,
	      0.694658399,
	      0.544639051,
	      0.37460658,
	      0.190809,
	      0.981627166,
	      0.927183867,
	      0.838670552,
	      0.719339788,
	      0.57357645
	    ],
	    [
	      0.866025388,
	      0.74314481,
	      0.587785244,
	      0.406736642,
	      0.207911685,
	      0.978147626,
	      0.91354543,
	      0.809017,
	      0.669130623,
	      0.5
	    ],
	    [
	      0.906307817,
	      0.788010776,
	      0.629320383,
	      0.438371152,
	      0.224951059,
	      0.974370062,
	      0.898794055,
	      0.777146,
	      0.615661502,
	      0.42261827
	    ],
	    [
	      0.939692616,
	      0.829037547,
	      0.669130623,
	      0.469471574,
	      0.241921902,
	      0.970295727,
	      0.882947564,
	      0.74314481,
	      0.559192896,
	      0.342020154
	    ],
	    [
	      0.965925813,
	      0.866025388,
	      0.707106769,
	      0.5,
	      0.258819044,
	      0.965925813,
	      0.866025388,
	      0.707106769,
	      0.5,
	      0.258819044
	    ],
	    [
	      0.98480773,
	      0.898794055,
	      0.74314481,
	      0.529919267,
	      0.275637358,
	      0.96126169,
	      0.848048091,
	      0.669130623,
	      0.438371152,
	      0.173648179
	    ],
	    [
	      0.99619472,
	      0.927183867,
	      0.777146,
	      0.559192896,
	      0.29237169,
	      0.956304729,
	      0.829037547,
	      0.629320383,
	      0.37460658,
	      0.0871557444
	    ],
	    [
	      1,
	      0.95105654,
	      0.809017,
	      0.587785244,
	      0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244,
	      0.309017,
	      6.12323426e-17
	    ],
	    [
	      0.99619472,
	      0.970295727,
	      0.838670552,
	      0.615661502,
	      0.325568169,
	      0.945518553,
	      0.788010776,
	      0.544639051,
	      0.241921902,
	      -0.0871557444
	    ],
	    [
	      0.98480773,
	      0.98480773,
	      0.866025388,
	      0.642787635,
	      0.342020154,
	      0.939692616,
	      0.766044438,
	      0.5,
	      0.173648179,
	      -0.173648179
	    ],
	    [
	      0.965925813,
	      0.994521916,
	      0.891006529,
	      0.669130623,
	      0.35836795,
	      0.933580399,
	      0.74314481,
	      0.453990489,
	      0.104528464,
	      -0.258819044
	    ],
	    [
	      0.939692616,
	      0.999390841,
	      0.91354543,
	      0.694658399,
	      0.37460658,
	      0.927183867,
	      0.719339788,
	      0.406736642,
	      0.0348994955,
	      -0.342020154
	    ],
	    [
	      0.906307817,
	      0.999390841,
	      0.933580399,
	      0.719339788,
	      0.390731126,
	      0.920504868,
	      0.694658399,
	      0.35836795,
	      -0.0348994955,
	      -0.42261827
	    ],
	    [
	      0.866025388,
	      0.994521916,
	      0.95105654,
	      0.74314481,
	      0.406736642,
	      0.91354543,
	      0.669130623,
	      0.309017,
	      -0.104528464,
	      -0.5
	    ],
	    [
	      0.819152057,
	      0.98480773,
	      0.965925813,
	      0.766044438,
	      0.42261827,
	      0.906307817,
	      0.642787635,
	      0.258819044,
	      -0.173648179,
	      -0.57357645
	    ],
	    [
	      0.766044438,
	      0.970295727,
	      0.978147626,
	      0.788010776,
	      0.438371152,
	      0.898794055,
	      0.615661502,
	      0.207911685,
	      -0.241921902,
	      -0.642787635
	    ],
	    [
	      0.707106769,
	      0.95105654,
	      0.987688363,
	      0.809017,
	      0.453990489,
	      0.891006529,
	      0.587785244,
	      0.156434461,
	      -0.309017,
	      -0.707106769
	    ],
	    [
	      0.642787635,
	      0.927183867,
	      0.994521916,
	      0.829037547,
	      0.469471574,
	      0.882947564,
	      0.559192896,
	      0.104528464,
	      -0.37460658,
	      -0.766044438
	    ],
	    [
	      0.57357645,
	      0.898794055,
	      0.99862951,
	      0.848048091,
	      0.484809607,
	      0.874619722,
	      0.529919267,
	      0.0523359552,
	      -0.438371152,
	      -0.819152057
	    ],
	    [
	      0.5,
	      0.866025388,
	      1,
	      0.866025388,
	      0.5,
	      0.866025388,
	      0.5,
	      6.12323426e-17,
	      -0.5,
	      -0.866025388
	    ],
	    [
	      0.42261827,
	      0.829037547,
	      0.99862951,
	      0.882947564,
	      0.515038073,
	      0.857167304,
	      0.469471574,
	      -0.0523359552,
	      -0.559192896,
	      -0.906307817
	    ],
	    [
	      0.342020154,
	      0.788010776,
	      0.994521916,
	      0.898794055,
	      0.529919267,
	      0.848048091,
	      0.438371152,
	      -0.104528464,
	      -0.615661502,
	      -0.939692616
	    ],
	    [
	      0.258819044,
	      0.74314481,
	      0.987688363,
	      0.91354543,
	      0.544639051,
	      0.838670552,
	      0.406736642,
	      -0.156434461,
	      -0.669130623,
	      -0.965925813
	    ],
	    [
	      0.173648179,
	      0.694658399,
	      0.978147626,
	      0.927183867,
	      0.559192896,
	      0.829037547,
	      0.37460658,
	      -0.207911685,
	      -0.719339788,
	      -0.98480773
	    ],
	    [
	      0.0871557444,
	      0.642787635,
	      0.965925813,
	      0.939692616,
	      0.57357645,
	      0.819152057,
	      0.342020154,
	      -0.258819044,
	      -0.766044438,
	      -0.99619472
	    ],
	    [
	      1.22464685e-16,
	      0.587785244,
	      0.95105654,
	      0.95105654,
	      0.587785244,
	      0.809017,
	      0.309017,
	      -0.309017,
	      -0.809017,
	      -1
	    ],
	    [
	      -0.0871557444,
	      0.529919267,
	      0.933580399,
	      0.96126169,
	      0.601815045,
	      0.798635483,
	      0.275637358,
	      -0.35836795,
	      -0.848048091,
	      -0.99619472
	    ],
	    [
	      -0.173648179,
	      0.469471574,
	      0.91354543,
	      0.970295727,
	      0.615661502,
	      0.788010776,
	      0.241921902,
	      -0.406736642,
	      -0.882947564,
	      -0.98480773
	    ],
	    [
	      -0.258819044,
	      0.406736642,
	      0.891006529,
	      0.978147626,
	      0.629320383,
	      0.777146,
	      0.207911685,
	      -0.453990489,
	      -0.91354543,
	      -0.965925813
	    ],
	    [
	      -0.342020154,
	      0.342020154,
	      0.866025388,
	      0.98480773,
	      0.642787635,
	      0.766044438,
	      0.173648179,
	      -0.5,
	      -0.939692616,
	      -0.939692616
	    ],
	    [
	      -0.42261827,
	      0.275637358,
	      0.838670552,
	      0.990268052,
	      0.656059,
	      0.754709601,
	      0.139173105,
	      -0.544639051,
	      -0.96126169,
	      -0.906307817
	    ],
	    [
	      -0.5,
	      0.207911685,
	      0.809017,
	      0.994521916,
	      0.669130623,
	      0.74314481,
	      0.104528464,
	      -0.587785244,
	      -0.978147626,
	      -0.866025388
	    ],
	    [
	      -0.57357645,
	      0.139173105,
	      0.777146,
	      0.997564077,
	      0.681998372,
	      0.7313537,
	      0.0697564706,
	      -0.629320383,
	      -0.990268052,
	      -0.819152057
	    ],
	    [
	      -0.642787635,
	      0.0697564706,
	      0.74314481,
	      0.999390841,
	      0.694658399,
	      0.719339788,
	      0.0348994955,
	      -0.669130623,
	      -0.997564077,
	      -0.766044438
	    ],
	    [
	      -0.707106769,
	      1.22464685e-16,
	      0.707106769,
	      1,
	      0.707106769,
	      0.707106769,
	      6.12323426e-17,
	      -0.707106769,
	      -1,
	      -0.707106769
	    ],
	    [
	      -0.766044438,
	      -0.0697564706,
	      0.669130623,
	      0.999390841,
	      0.719339788,
	      0.694658399,
	      -0.0348994955,
	      -0.74314481,
	      -0.997564077,
	      -0.642787635
	    ],
	    [
	      -0.819152057,
	      -0.139173105,
	      0.629320383,
	      0.997564077,
	      0.7313537,
	      0.681998372,
	      -0.0697564706,
	      -0.777146,
	      -0.990268052,
	      -0.57357645
	    ],
	    [
	      -0.866025388,
	      -0.207911685,
	      0.587785244,
	      0.994521916,
	      0.74314481,
	      0.669130623,
	      -0.104528464,
	      -0.809017,
	      -0.978147626,
	      -0.5
	    ],
	    [
	      -0.906307817,
	      -0.275637358,
	      0.544639051,
	      0.990268052,
	      0.754709601,
	      0.656059,
	      -0.139173105,
	      -0.838670552,
	      -0.96126169,
	      -0.42261827
	    ],
	    [
	      -0.939692616,
	      -0.342020154,
	      0.5,
	      0.98480773,
	      0.766044438,
	      0.642787635,
	      -0.173648179,
	      -0.866025388,
	      -0.939692616,
	      -0.342020154
	    ],
	    [
	      -0.965925813,
	      -0.406736642,
	      0.453990489,
	      0.978147626,
	      0.777146,
	      0.629320383,
	      -0.207911685,
	      -0.891006529,
	      -0.91354543,
	      -0.258819044
	    ],
	    [
	      -0.98480773,
	      -0.469471574,
	      0.406736642,
	      0.970295727,
	      0.788010776,
	      0.615661502,
	      -0.241921902,
	      -0.91354543,
	      -0.882947564,
	      -0.173648179
	    ],
	    [
	      -0.99619472,
	      -0.529919267,
	      0.35836795,
	      0.96126169,
	      0.798635483,
	      0.601815045,
	      -0.275637358,
	      -0.933580399,
	      -0.848048091,
	      -0.0871557444
	    ],
	    [
	      -1,
	      -0.587785244,
	      0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654,
	      -0.809017,
	      -1.83697015e-16
	    ],
	    [
	      -0.99619472,
	      -0.642787635,
	      0.258819044,
	      0.939692616,
	      0.819152057,
	      0.57357645,
	      -0.342020154,
	      -0.965925813,
	      -0.766044438,
	      0.0871557444
	    ],
	    [
	      -0.98480773,
	      -0.694658399,
	      0.207911685,
	      0.927183867,
	      0.829037547,
	      0.559192896,
	      -0.37460658,
	      -0.978147626,
	      -0.719339788,
	      0.173648179
	    ],
	    [
	      -0.965925813,
	      -0.74314481,
	      0.156434461,
	      0.91354543,
	      0.838670552,
	      0.544639051,
	      -0.406736642,
	      -0.987688363,
	      -0.669130623,
	      0.258819044
	    ],
	    [
	      -0.939692616,
	      -0.788010776,
	      0.104528464,
	      0.898794055,
	      0.848048091,
	      0.529919267,
	      -0.438371152,
	      -0.994521916,
	      -0.615661502,
	      0.342020154
	    ],
	    [
	      -0.906307817,
	      -0.829037547,
	      0.0523359552,
	      0.882947564,
	      0.857167304,
	      0.515038073,
	      -0.469471574,
	      -0.99862951,
	      -0.559192896,
	      0.42261827
	    ],
	    [
	      -0.866025388,
	      -0.866025388,
	      1.22464685e-16,
	      0.866025388,
	      0.866025388,
	      0.5,
	      -0.5,
	      -1,
	      -0.5,
	      0.5
	    ],
	    [
	      -0.819152057,
	      -0.898794055,
	      -0.0523359552,
	      0.848048091,
	      0.874619722,
	      0.484809607,
	      -0.529919267,
	      -0.99862951,
	      -0.438371152,
	      0.57357645
	    ],
	    [
	      -0.766044438,
	      -0.927183867,
	      -0.104528464,
	      0.829037547,
	      0.882947564,
	      0.469471574,
	      -0.559192896,
	      -0.994521916,
	      -0.37460658,
	      0.642787635
	    ],
	    [
	      -0.707106769,
	      -0.95105654,
	      -0.156434461,
	      0.809017,
	      0.891006529,
	      0.453990489,
	      -0.587785244,
	      -0.987688363,
	      -0.309017,
	      0.707106769
	    ],
	    [
	      -0.642787635,
	      -0.970295727,
	      -0.207911685,
	      0.788010776,
	      0.898794055,
	      0.438371152,
	      -0.615661502,
	      -0.978147626,
	      -0.241921902,
	      0.766044438
	    ],
	    [
	      -0.57357645,
	      -0.98480773,
	      -0.258819044,
	      0.766044438,
	      0.906307817,
	      0.42261827,
	      -0.642787635,
	      -0.965925813,
	      -0.173648179,
	      0.819152057
	    ],
	    [
	      -0.5,
	      -0.994521916,
	      -0.309017,
	      0.74314481,
	      0.91354543,
	      0.406736642,
	      -0.669130623,
	      -0.95105654,
	      -0.104528464,
	      0.866025388
	    ],
	    [
	      -0.42261827,
	      -0.999390841,
	      -0.35836795,
	      0.719339788,
	      0.920504868,
	      0.390731126,
	      -0.694658399,
	      -0.933580399,
	      -0.0348994955,
	      0.906307817
	    ],
	    [
	      -0.342020154,
	      -0.999390841,
	      -0.406736642,
	      0.694658399,
	      0.927183867,
	      0.37460658,
	      -0.719339788,
	      -0.91354543,
	      0.0348994955,
	      0.939692616
	    ],
	    [
	      -0.258819044,
	      -0.994521916,
	      -0.453990489,
	      0.669130623,
	      0.933580399,
	      0.35836795,
	      -0.74314481,
	      -0.891006529,
	      0.104528464,
	      0.965925813
	    ],
	    [
	      -0.173648179,
	      -0.98480773,
	      -0.5,
	      0.642787635,
	      0.939692616,
	      0.342020154,
	      -0.766044438,
	      -0.866025388,
	      0.173648179,
	      0.98480773
	    ],
	    [
	      -0.0871557444,
	      -0.970295727,
	      -0.544639051,
	      0.615661502,
	      0.945518553,
	      0.325568169,
	      -0.788010776,
	      -0.838670552,
	      0.241921902,
	      0.99619472
	    ],
	    [
	      -2.44929371e-16,
	      -0.95105654,
	      -0.587785244,
	      0.587785244,
	      0.95105654,
	      0.309017,
	      -0.809017,
	      -0.809017,
	      0.309017,
	      1
	    ],
	    [
	      0.0871557444,
	      -0.927183867,
	      -0.629320383,
	      0.559192896,
	      0.956304729,
	      0.29237169,
	      -0.829037547,
	      -0.777146,
	      0.37460658,
	      0.99619472
	    ],
	    [
	      0.173648179,
	      -0.898794055,
	      -0.669130623,
	      0.529919267,
	      0.96126169,
	      0.275637358,
	      -0.848048091,
	      -0.74314481,
	      0.438371152,
	      0.98480773
	    ],
	    [
	      0.258819044,
	      -0.866025388,
	      -0.707106769,
	      0.5,
	      0.965925813,
	      0.258819044,
	      -0.866025388,
	      -0.707106769,
	      0.5,
	      0.965925813
	    ],
	    [
	      0.342020154,
	      -0.829037547,
	      -0.74314481,
	      0.469471574,
	      0.970295727,
	      0.241921902,
	      -0.882947564,
	      -0.669130623,
	      0.559192896,
	      0.939692616
	    ],
	    [
	      0.42261827,
	      -0.788010776,
	      -0.777146,
	      0.438371152,
	      0.974370062,
	      0.224951059,
	      -0.898794055,
	      -0.629320383,
	      0.615661502,
	      0.906307817
	    ],
	    [
	      0.5,
	      -0.74314481,
	      -0.809017,
	      0.406736642,
	      0.978147626,
	      0.207911685,
	      -0.91354543,
	      -0.587785244,
	      0.669130623,
	      0.866025388
	    ],
	    [
	      0.57357645,
	      -0.694658399,
	      -0.838670552,
	      0.37460658,
	      0.981627166,
	      0.190809,
	      -0.927183867,
	      -0.544639051,
	      0.719339788,
	      0.819152057
	    ],
	    [
	      0.642787635,
	      -0.642787635,
	      -0.866025388,
	      0.342020154,
	      0.98480773,
	      0.173648179,
	      -0.939692616,
	      -0.5,
	      0.766044438,
	      0.766044438
	    ],
	    [
	      0.707106769,
	      -0.587785244,
	      -0.891006529,
	      0.309017,
	      0.987688363,
	      0.156434461,
	      -0.95105654,
	      -0.453990489,
	      0.809017,
	      0.707106769
	    ],
	    [
	      0.766044438,
	      -0.529919267,
	      -0.91354543,
	      0.275637358,
	      0.990268052,
	      0.139173105,
	      -0.96126169,
	      -0.406736642,
	      0.848048091,
	      0.642787635
	    ],
	    [
	      0.819152057,
	      -0.469471574,
	      -0.933580399,
	      0.241921902,
	      0.992546141,
	      0.121869341,
	      -0.970295727,
	      -0.35836795,
	      0.882947564,
	      0.57357645
	    ],
	    [
	      0.866025388,
	      -0.406736642,
	      -0.95105654,
	      0.207911685,
	      0.994521916,
	      0.104528464,
	      -0.978147626,
	      -0.309017,
	      0.91354543,
	      0.5
	    ],
	    [
	      0.906307817,
	      -0.342020154,
	      -0.965925813,
	      0.173648179,
	      0.99619472,
	      0.0871557444,
	      -0.98480773,
	      -0.258819044,
	      0.939692616,
	      0.42261827
	    ],
	    [
	      0.939692616,
	      -0.275637358,
	      -0.978147626,
	      0.139173105,
	      0.997564077,
	      0.0697564706,
	      -0.990268052,
	      -0.207911685,
	      0.96126169,
	      0.342020154
	    ],
	    [
	      0.965925813,
	      -0.207911685,
	      -0.987688363,
	      0.104528464,
	      0.99862951,
	      0.0523359552,
	      -0.994521916,
	      -0.156434461,
	      0.978147626,
	      0.258819044
	    ],
	    [
	      0.98480773,
	      -0.139173105,
	      -0.994521916,
	      0.0697564706,
	      0.999390841,
	      0.0348994955,
	      -0.997564077,
	      -0.104528464,
	      0.990268052,
	      0.173648179
	    ],
	    [
	      0.99619472,
	      -0.0697564706,
	      -0.99862951,
	      0.0348994955,
	      0.99984771,
	      0.0174524058,
	      -0.999390841,
	      -0.0523359552,
	      0.997564077,
	      0.0871557444
	    ],
	    [
	      1,
	      -2.44929371e-16,
	      -1,
	      1.22464685e-16,
	      1,
	      6.12323426e-17,
	      -1,
	      -1.83697015e-16,
	      1,
	      3.061617e-16
	    ],
	    [
	      0.99619472,
	      0.0697564706,
	      -0.99862951,
	      -0.0348994955,
	      0.99984771,
	      -0.0174524058,
	      -0.999390841,
	      0.0523359552,
	      0.997564077,
	      -0.0871557444
	    ],
	    [
	      0.98480773,
	      0.139173105,
	      -0.994521916,
	      -0.0697564706,
	      0.999390841,
	      -0.0348994955,
	      -0.997564077,
	      0.104528464,
	      0.990268052,
	      -0.173648179
	    ],
	    [
	      0.965925813,
	      0.207911685,
	      -0.987688363,
	      -0.104528464,
	      0.99862951,
	      -0.0523359552,
	      -0.994521916,
	      0.156434461,
	      0.978147626,
	      -0.258819044
	    ],
	    [
	      0.939692616,
	      0.275637358,
	      -0.978147626,
	      -0.139173105,
	      0.997564077,
	      -0.0697564706,
	      -0.990268052,
	      0.207911685,
	      0.96126169,
	      -0.342020154
	    ],
	    [
	      0.906307817,
	      0.342020154,
	      -0.965925813,
	      -0.173648179,
	      0.99619472,
	      -0.0871557444,
	      -0.98480773,
	      0.258819044,
	      0.939692616,
	      -0.42261827
	    ],
	    [
	      0.866025388,
	      0.406736642,
	      -0.95105654,
	      -0.207911685,
	      0.994521916,
	      -0.104528464,
	      -0.978147626,
	      0.309017,
	      0.91354543,
	      -0.5
	    ],
	    [
	      0.819152057,
	      0.469471574,
	      -0.933580399,
	      -0.241921902,
	      0.992546141,
	      -0.121869341,
	      -0.970295727,
	      0.35836795,
	      0.882947564,
	      -0.57357645
	    ],
	    [
	      0.766044438,
	      0.529919267,
	      -0.91354543,
	      -0.275637358,
	      0.990268052,
	      -0.139173105,
	      -0.96126169,
	      0.406736642,
	      0.848048091,
	      -0.642787635
	    ],
	    [
	      0.707106769,
	      0.587785244,
	      -0.891006529,
	      -0.309017,
	      0.987688363,
	      -0.156434461,
	      -0.95105654,
	      0.453990489,
	      0.809017,
	      -0.707106769
	    ],
	    [
	      0.642787635,
	      0.642787635,
	      -0.866025388,
	      -0.342020154,
	      0.98480773,
	      -0.173648179,
	      -0.939692616,
	      0.5,
	      0.766044438,
	      -0.766044438
	    ],
	    [
	      0.57357645,
	      0.694658399,
	      -0.838670552,
	      -0.37460658,
	      0.981627166,
	      -0.190809,
	      -0.927183867,
	      0.544639051,
	      0.719339788,
	      -0.819152057
	    ],
	    [
	      0.5,
	      0.74314481,
	      -0.809017,
	      -0.406736642,
	      0.978147626,
	      -0.207911685,
	      -0.91354543,
	      0.587785244,
	      0.669130623,
	      -0.866025388
	    ],
	    [
	      0.42261827,
	      0.788010776,
	      -0.777146,
	      -0.438371152,
	      0.974370062,
	      -0.224951059,
	      -0.898794055,
	      0.629320383,
	      0.615661502,
	      -0.906307817
	    ],
	    [
	      0.342020154,
	      0.829037547,
	      -0.74314481,
	      -0.469471574,
	      0.970295727,
	      -0.241921902,
	      -0.882947564,
	      0.669130623,
	      0.559192896,
	      -0.939692616
	    ],
	    [
	      0.258819044,
	      0.866025388,
	      -0.707106769,
	      -0.5,
	      0.965925813,
	      -0.258819044,
	      -0.866025388,
	      0.707106769,
	      0.5,
	      -0.965925813
	    ],
	    [
	      0.173648179,
	      0.898794055,
	      -0.669130623,
	      -0.529919267,
	      0.96126169,
	      -0.275637358,
	      -0.848048091,
	      0.74314481,
	      0.438371152,
	      -0.98480773
	    ],
	    [
	      0.0871557444,
	      0.927183867,
	      -0.629320383,
	      -0.559192896,
	      0.956304729,
	      -0.29237169,
	      -0.829037547,
	      0.777146,
	      0.37460658,
	      -0.99619472
	    ],
	    [
	      3.67394029e-16,
	      0.95105654,
	      -0.587785244,
	      -0.587785244,
	      0.95105654,
	      -0.309017,
	      -0.809017,
	      0.809017,
	      0.309017,
	      -1
	    ],
	    [
	      -0.0871557444,
	      0.970295727,
	      -0.544639051,
	      -0.615661502,
	      0.945518553,
	      -0.325568169,
	      -0.788010776,
	      0.838670552,
	      0.241921902,
	      -0.99619472
	    ],
	    [
	      -0.173648179,
	      0.98480773,
	      -0.5,
	      -0.642787635,
	      0.939692616,
	      -0.342020154,
	      -0.766044438,
	      0.866025388,
	      0.173648179,
	      -0.98480773
	    ],
	    [
	      -0.258819044,
	      0.994521916,
	      -0.453990489,
	      -0.669130623,
	      0.933580399,
	      -0.35836795,
	      -0.74314481,
	      0.891006529,
	      0.104528464,
	      -0.965925813
	    ],
	    [
	      -0.342020154,
	      0.999390841,
	      -0.406736642,
	      -0.694658399,
	      0.927183867,
	      -0.37460658,
	      -0.719339788,
	      0.91354543,
	      0.0348994955,
	      -0.939692616
	    ],
	    [
	      -0.42261827,
	      0.999390841,
	      -0.35836795,
	      -0.719339788,
	      0.920504868,
	      -0.390731126,
	      -0.694658399,
	      0.933580399,
	      -0.0348994955,
	      -0.906307817
	    ],
	    [
	      -0.5,
	      0.994521916,
	      -0.309017,
	      -0.74314481,
	      0.91354543,
	      -0.406736642,
	      -0.669130623,
	      0.95105654,
	      -0.104528464,
	      -0.866025388
	    ],
	    [
	      -0.57357645,
	      0.98480773,
	      -0.258819044,
	      -0.766044438,
	      0.906307817,
	      -0.42261827,
	      -0.642787635,
	      0.965925813,
	      -0.173648179,
	      -0.819152057
	    ],
	    [
	      -0.642787635,
	      0.970295727,
	      -0.207911685,
	      -0.788010776,
	      0.898794055,
	      -0.438371152,
	      -0.615661502,
	      0.978147626,
	      -0.241921902,
	      -0.766044438
	    ],
	    [
	      -0.707106769,
	      0.95105654,
	      -0.156434461,
	      -0.809017,
	      0.891006529,
	      -0.453990489,
	      -0.587785244,
	      0.987688363,
	      -0.309017,
	      -0.707106769
	    ],
	    [
	      -0.766044438,
	      0.927183867,
	      -0.104528464,
	      -0.829037547,
	      0.882947564,
	      -0.469471574,
	      -0.559192896,
	      0.994521916,
	      -0.37460658,
	      -0.642787635
	    ],
	    [
	      -0.819152057,
	      0.898794055,
	      -0.0523359552,
	      -0.848048091,
	      0.874619722,
	      -0.484809607,
	      -0.529919267,
	      0.99862951,
	      -0.438371152,
	      -0.57357645
	    ],
	    [
	      -0.866025388,
	      0.866025388,
	      -2.44929371e-16,
	      -0.866025388,
	      0.866025388,
	      -0.5,
	      -0.5,
	      1,
	      -0.5,
	      -0.5
	    ],
	    [
	      -0.906307817,
	      0.829037547,
	      0.0523359552,
	      -0.882947564,
	      0.857167304,
	      -0.515038073,
	      -0.469471574,
	      0.99862951,
	      -0.559192896,
	      -0.42261827
	    ],
	    [
	      -0.939692616,
	      0.788010776,
	      0.104528464,
	      -0.898794055,
	      0.848048091,
	      -0.529919267,
	      -0.438371152,
	      0.994521916,
	      -0.615661502,
	      -0.342020154
	    ],
	    [
	      -0.965925813,
	      0.74314481,
	      0.156434461,
	      -0.91354543,
	      0.838670552,
	      -0.544639051,
	      -0.406736642,
	      0.987688363,
	      -0.669130623,
	      -0.258819044
	    ],
	    [
	      -0.98480773,
	      0.694658399,
	      0.207911685,
	      -0.927183867,
	      0.829037547,
	      -0.559192896,
	      -0.37460658,
	      0.978147626,
	      -0.719339788,
	      -0.173648179
	    ],
	    [
	      -0.99619472,
	      0.642787635,
	      0.258819044,
	      -0.939692616,
	      0.819152057,
	      -0.57357645,
	      -0.342020154,
	      0.965925813,
	      -0.766044438,
	      -0.0871557444
	    ],
	    [
	      -1,
	      0.587785244,
	      0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654,
	      -0.809017,
	      -4.28626385e-16
	    ],
	    [
	      -0.99619472,
	      0.529919267,
	      0.35836795,
	      -0.96126169,
	      0.798635483,
	      -0.601815045,
	      -0.275637358,
	      0.933580399,
	      -0.848048091,
	      0.0871557444
	    ],
	    [
	      -0.98480773,
	      0.469471574,
	      0.406736642,
	      -0.970295727,
	      0.788010776,
	      -0.615661502,
	      -0.241921902,
	      0.91354543,
	      -0.882947564,
	      0.173648179
	    ],
	    [
	      -0.965925813,
	      0.406736642,
	      0.453990489,
	      -0.978147626,
	      0.777146,
	      -0.629320383,
	      -0.207911685,
	      0.891006529,
	      -0.91354543,
	      0.258819044
	    ],
	    [
	      -0.939692616,
	      0.342020154,
	      0.5,
	      -0.98480773,
	      0.766044438,
	      -0.642787635,
	      -0.173648179,
	      0.866025388,
	      -0.939692616,
	      0.342020154
	    ],
	    [
	      -0.906307817,
	      0.275637358,
	      0.544639051,
	      -0.990268052,
	      0.754709601,
	      -0.656059,
	      -0.139173105,
	      0.838670552,
	      -0.96126169,
	      0.42261827
	    ],
	    [
	      -0.866025388,
	      0.207911685,
	      0.587785244,
	      -0.994521916,
	      0.74314481,
	      -0.669130623,
	      -0.104528464,
	      0.809017,
	      -0.978147626,
	      0.5
	    ],
	    [
	      -0.819152057,
	      0.139173105,
	      0.629320383,
	      -0.997564077,
	      0.7313537,
	      -0.681998372,
	      -0.0697564706,
	      0.777146,
	      -0.990268052,
	      0.57357645
	    ],
	    [
	      -0.766044438,
	      0.0697564706,
	      0.669130623,
	      -0.999390841,
	      0.719339788,
	      -0.694658399,
	      -0.0348994955,
	      0.74314481,
	      -0.997564077,
	      0.642787635
	    ],
	    [
	      -0.707106769,
	      3.67394029e-16,
	      0.707106769,
	      -1,
	      0.707106769,
	      -0.707106769,
	      -1.83697015e-16,
	      0.707106769,
	      -1,
	      0.707106769
	    ],
	    [
	      -0.642787635,
	      -0.0697564706,
	      0.74314481,
	      -0.999390841,
	      0.694658399,
	      -0.719339788,
	      0.0348994955,
	      0.669130623,
	      -0.997564077,
	      0.766044438
	    ],
	    [
	      -0.57357645,
	      -0.139173105,
	      0.777146,
	      -0.997564077,
	      0.681998372,
	      -0.7313537,
	      0.0697564706,
	      0.629320383,
	      -0.990268052,
	      0.819152057
	    ],
	    [
	      -0.5,
	      -0.207911685,
	      0.809017,
	      -0.994521916,
	      0.669130623,
	      -0.74314481,
	      0.104528464,
	      0.587785244,
	      -0.978147626,
	      0.866025388
	    ],
	    [
	      -0.42261827,
	      -0.275637358,
	      0.838670552,
	      -0.990268052,
	      0.656059,
	      -0.754709601,
	      0.139173105,
	      0.544639051,
	      -0.96126169,
	      0.906307817
	    ],
	    [
	      -0.342020154,
	      -0.342020154,
	      0.866025388,
	      -0.98480773,
	      0.642787635,
	      -0.766044438,
	      0.173648179,
	      0.5,
	      -0.939692616,
	      0.939692616
	    ],
	    [
	      -0.258819044,
	      -0.406736642,
	      0.891006529,
	      -0.978147626,
	      0.629320383,
	      -0.777146,
	      0.207911685,
	      0.453990489,
	      -0.91354543,
	      0.965925813
	    ],
	    [
	      -0.173648179,
	      -0.469471574,
	      0.91354543,
	      -0.970295727,
	      0.615661502,
	      -0.788010776,
	      0.241921902,
	      0.406736642,
	      -0.882947564,
	      0.98480773
	    ],
	    [
	      -0.0871557444,
	      -0.529919267,
	      0.933580399,
	      -0.96126169,
	      0.601815045,
	      -0.798635483,
	      0.275637358,
	      0.35836795,
	      -0.848048091,
	      0.99619472
	    ],
	    [
	      -4.89858741e-16,
	      -0.587785244,
	      0.95105654,
	      -0.95105654,
	      0.587785244,
	      -0.809017,
	      0.309017,
	      0.309017,
	      -0.809017,
	      1
	    ],
	    [
	      0.0871557444,
	      -0.642787635,
	      0.965925813,
	      -0.939692616,
	      0.57357645,
	      -0.819152057,
	      0.342020154,
	      0.258819044,
	      -0.766044438,
	      0.99619472
	    ],
	    [
	      0.173648179,
	      -0.694658399,
	      0.978147626,
	      -0.927183867,
	      0.559192896,
	      -0.829037547,
	      0.37460658,
	      0.207911685,
	      -0.719339788,
	      0.98480773
	    ],
	    [
	      0.258819044,
	      -0.74314481,
	      0.987688363,
	      -0.91354543,
	      0.544639051,
	      -0.838670552,
	      0.406736642,
	      0.156434461,
	      -0.669130623,
	      0.965925813
	    ],
	    [
	      0.342020154,
	      -0.788010776,
	      0.994521916,
	      -0.898794055,
	      0.529919267,
	      -0.848048091,
	      0.438371152,
	      0.104528464,
	      -0.615661502,
	      0.939692616
	    ],
	    [
	      0.42261827,
	      -0.829037547,
	      0.99862951,
	      -0.882947564,
	      0.515038073,
	      -0.857167304,
	      0.469471574,
	      0.0523359552,
	      -0.559192896,
	      0.906307817
	    ],
	    [
	      0.5,
	      -0.866025388,
	      1,
	      -0.866025388,
	      0.5,
	      -0.866025388,
	      0.5,
	      3.061617e-16,
	      -0.5,
	      0.866025388
	    ],
	    [
	      0.57357645,
	      -0.898794055,
	      0.99862951,
	      -0.848048091,
	      0.484809607,
	      -0.874619722,
	      0.529919267,
	      -0.0523359552,
	      -0.438371152,
	      0.819152057
	    ],
	    [
	      0.642787635,
	      -0.927183867,
	      0.994521916,
	      -0.829037547,
	      0.469471574,
	      -0.882947564,
	      0.559192896,
	      -0.104528464,
	      -0.37460658,
	      0.766044438
	    ],
	    [
	      0.707106769,
	      -0.95105654,
	      0.987688363,
	      -0.809017,
	      0.453990489,
	      -0.891006529,
	      0.587785244,
	      -0.156434461,
	      -0.309017,
	      0.707106769
	    ],
	    [
	      0.766044438,
	      -0.970295727,
	      0.978147626,
	      -0.788010776,
	      0.438371152,
	      -0.898794055,
	      0.615661502,
	      -0.207911685,
	      -0.241921902,
	      0.642787635
	    ],
	    [
	      0.819152057,
	      -0.98480773,
	      0.965925813,
	      -0.766044438,
	      0.42261827,
	      -0.906307817,
	      0.642787635,
	      -0.258819044,
	      -0.173648179,
	      0.57357645
	    ],
	    [
	      0.866025388,
	      -0.994521916,
	      0.95105654,
	      -0.74314481,
	      0.406736642,
	      -0.91354543,
	      0.669130623,
	      -0.309017,
	      -0.104528464,
	      0.5
	    ],
	    [
	      0.906307817,
	      -0.999390841,
	      0.933580399,
	      -0.719339788,
	      0.390731126,
	      -0.920504868,
	      0.694658399,
	      -0.35836795,
	      -0.0348994955,
	      0.42261827
	    ],
	    [
	      0.939692616,
	      -0.999390841,
	      0.91354543,
	      -0.694658399,
	      0.37460658,
	      -0.927183867,
	      0.719339788,
	      -0.406736642,
	      0.0348994955,
	      0.342020154
	    ],
	    [
	      0.965925813,
	      -0.994521916,
	      0.891006529,
	      -0.669130623,
	      0.35836795,
	      -0.933580399,
	      0.74314481,
	      -0.453990489,
	      0.104528464,
	      0.258819044
	    ],
	    [
	      0.98480773,
	      -0.98480773,
	      0.866025388,
	      -0.642787635,
	      0.342020154,
	      -0.939692616,
	      0.766044438,
	      -0.5,
	      0.173648179,
	      0.173648179
	    ],
	    [
	      0.99619472,
	      -0.970295727,
	      0.838670552,
	      -0.615661502,
	      0.325568169,
	      -0.945518553,
	      0.788010776,
	      -0.544639051,
	      0.241921902,
	      0.0871557444
	    ],
	    [
	      1,
	      -0.95105654,
	      0.809017,
	      -0.587785244,
	      0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244,
	      0.309017,
	      5.5109107e-16
	    ],
	    [
	      0.99619472,
	      -0.927183867,
	      0.777146,
	      -0.559192896,
	      0.29237169,
	      -0.956304729,
	      0.829037547,
	      -0.629320383,
	      0.37460658,
	      -0.0871557444
	    ],
	    [
	      0.98480773,
	      -0.898794055,
	      0.74314481,
	      -0.529919267,
	      0.275637358,
	      -0.96126169,
	      0.848048091,
	      -0.669130623,
	      0.438371152,
	      -0.173648179
	    ],
	    [
	      0.965925813,
	      -0.866025388,
	      0.707106769,
	      -0.5,
	      0.258819044,
	      -0.965925813,
	      0.866025388,
	      -0.707106769,
	      0.5,
	      -0.258819044
	    ],
	    [
	      0.939692616,
	      -0.829037547,
	      0.669130623,
	      -0.469471574,
	      0.241921902,
	      -0.970295727,
	      0.882947564,
	      -0.74314481,
	      0.559192896,
	      -0.342020154
	    ],
	    [
	      0.906307817,
	      -0.788010776,
	      0.629320383,
	      -0.438371152,
	      0.224951059,
	      -0.974370062,
	      0.898794055,
	      -0.777146,
	      0.615661502,
	      -0.42261827
	    ],
	    [
	      0.866025388,
	      -0.74314481,
	      0.587785244,
	      -0.406736642,
	      0.207911685,
	      -0.978147626,
	      0.91354543,
	      -0.809017,
	      0.669130623,
	      -0.5
	    ],
	    [
	      0.819152057,
	      -0.694658399,
	      0.544639051,
	      -0.37460658,
	      0.190809,
	      -0.981627166,
	      0.927183867,
	      -0.838670552,
	      0.719339788,
	      -0.57357645
	    ],
	    [
	      0.766044438,
	      -0.642787635,
	      0.5,
	      -0.342020154,
	      0.173648179,
	      -0.98480773,
	      0.939692616,
	      -0.866025388,
	      0.766044438,
	      -0.642787635
	    ],
	    [
	      0.707106769,
	      -0.587785244,
	      0.453990489,
	      -0.309017,
	      0.156434461,
	      -0.987688363,
	      0.95105654,
	      -0.891006529,
	      0.809017,
	      -0.707106769
	    ],
	    [
	      0.642787635,
	      -0.529919267,
	      0.406736642,
	      -0.275637358,
	      0.139173105,
	      -0.990268052,
	      0.96126169,
	      -0.91354543,
	      0.848048091,
	      -0.766044438
	    ],
	    [
	      0.57357645,
	      -0.469471574,
	      0.35836795,
	      -0.241921902,
	      0.121869341,
	      -0.992546141,
	      0.970295727,
	      -0.933580399,
	      0.882947564,
	      -0.819152057
	    ],
	    [
	      0.5,
	      -0.406736642,
	      0.309017,
	      -0.207911685,
	      0.104528464,
	      -0.994521916,
	      0.978147626,
	      -0.95105654,
	      0.91354543,
	      -0.866025388
	    ],
	    [
	      0.42261827,
	      -0.342020154,
	      0.258819044,
	      -0.173648179,
	      0.0871557444,
	      -0.99619472,
	      0.98480773,
	      -0.965925813,
	      0.939692616,
	      -0.906307817
	    ],
	    [
	      0.342020154,
	      -0.275637358,
	      0.207911685,
	      -0.139173105,
	      0.0697564706,
	      -0.997564077,
	      0.990268052,
	      -0.978147626,
	      0.96126169,
	      -0.939692616
	    ],
	    [
	      0.258819044,
	      -0.207911685,
	      0.156434461,
	      -0.104528464,
	      0.0523359552,
	      -0.99862951,
	      0.994521916,
	      -0.987688363,
	      0.978147626,
	      -0.965925813
	    ],
	    [
	      0.173648179,
	      -0.139173105,
	      0.104528464,
	      -0.0697564706,
	      0.0348994955,
	      -0.999390841,
	      0.997564077,
	      -0.994521916,
	      0.990268052,
	      -0.98480773
	    ],
	    [
	      0.0871557444,
	      -0.0697564706,
	      0.0523359552,
	      -0.0348994955,
	      0.0174524058,
	      -0.99984771,
	      0.999390841,
	      -0.99862951,
	      0.997564077,
	      -0.99619472
	    ],
	    [
	      6.123234e-16,
	      -4.89858741e-16,
	      3.67394029e-16,
	      -2.44929371e-16,
	      1.22464685e-16,
	      -1,
	      1,
	      -1,
	      1,
	      -1
	    ],
	    [
	      -0.0871557444,
	      0.0697564706,
	      -0.0523359552,
	      0.0348994955,
	      -0.0174524058,
	      -0.99984771,
	      0.999390841,
	      -0.99862951,
	      0.997564077,
	      -0.99619472
	    ],
	    [
	      -0.173648179,
	      0.139173105,
	      -0.104528464,
	      0.0697564706,
	      -0.0348994955,
	      -0.999390841,
	      0.997564077,
	      -0.994521916,
	      0.990268052,
	      -0.98480773
	    ],
	    [
	      -0.258819044,
	      0.207911685,
	      -0.156434461,
	      0.104528464,
	      -0.0523359552,
	      -0.99862951,
	      0.994521916,
	      -0.987688363,
	      0.978147626,
	      -0.965925813
	    ],
	    [
	      -0.342020154,
	      0.275637358,
	      -0.207911685,
	      0.139173105,
	      -0.0697564706,
	      -0.997564077,
	      0.990268052,
	      -0.978147626,
	      0.96126169,
	      -0.939692616
	    ],
	    [
	      -0.42261827,
	      0.342020154,
	      -0.258819044,
	      0.173648179,
	      -0.0871557444,
	      -0.99619472,
	      0.98480773,
	      -0.965925813,
	      0.939692616,
	      -0.906307817
	    ],
	    [
	      -0.5,
	      0.406736642,
	      -0.309017,
	      0.207911685,
	      -0.104528464,
	      -0.994521916,
	      0.978147626,
	      -0.95105654,
	      0.91354543,
	      -0.866025388
	    ],
	    [
	      -0.57357645,
	      0.469471574,
	      -0.35836795,
	      0.241921902,
	      -0.121869341,
	      -0.992546141,
	      0.970295727,
	      -0.933580399,
	      0.882947564,
	      -0.819152057
	    ],
	    [
	      -0.642787635,
	      0.529919267,
	      -0.406736642,
	      0.275637358,
	      -0.139173105,
	      -0.990268052,
	      0.96126169,
	      -0.91354543,
	      0.848048091,
	      -0.766044438
	    ],
	    [
	      -0.707106769,
	      0.587785244,
	      -0.453990489,
	      0.309017,
	      -0.156434461,
	      -0.987688363,
	      0.95105654,
	      -0.891006529,
	      0.809017,
	      -0.707106769
	    ],
	    [
	      -0.766044438,
	      0.642787635,
	      -0.5,
	      0.342020154,
	      -0.173648179,
	      -0.98480773,
	      0.939692616,
	      -0.866025388,
	      0.766044438,
	      -0.642787635
	    ],
	    [
	      -0.819152057,
	      0.694658399,
	      -0.544639051,
	      0.37460658,
	      -0.190809,
	      -0.981627166,
	      0.927183867,
	      -0.838670552,
	      0.719339788,
	      -0.57357645
	    ],
	    [
	      -0.866025388,
	      0.74314481,
	      -0.587785244,
	      0.406736642,
	      -0.207911685,
	      -0.978147626,
	      0.91354543,
	      -0.809017,
	      0.669130623,
	      -0.5
	    ],
	    [
	      -0.906307817,
	      0.788010776,
	      -0.629320383,
	      0.438371152,
	      -0.224951059,
	      -0.974370062,
	      0.898794055,
	      -0.777146,
	      0.615661502,
	      -0.42261827
	    ],
	    [
	      -0.939692616,
	      0.829037547,
	      -0.669130623,
	      0.469471574,
	      -0.241921902,
	      -0.970295727,
	      0.882947564,
	      -0.74314481,
	      0.559192896,
	      -0.342020154
	    ],
	    [
	      -0.965925813,
	      0.866025388,
	      -0.707106769,
	      0.5,
	      -0.258819044,
	      -0.965925813,
	      0.866025388,
	      -0.707106769,
	      0.5,
	      -0.258819044
	    ],
	    [
	      -0.98480773,
	      0.898794055,
	      -0.74314481,
	      0.529919267,
	      -0.275637358,
	      -0.96126169,
	      0.848048091,
	      -0.669130623,
	      0.438371152,
	      -0.173648179
	    ],
	    [
	      -0.99619472,
	      0.927183867,
	      -0.777146,
	      0.559192896,
	      -0.29237169,
	      -0.956304729,
	      0.829037547,
	      -0.629320383,
	      0.37460658,
	      -0.0871557444
	    ],
	    [
	      -1,
	      0.95105654,
	      -0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244,
	      0.309017,
	      1.10280111e-15
	    ],
	    [
	      -0.99619472,
	      0.970295727,
	      -0.838670552,
	      0.615661502,
	      -0.325568169,
	      -0.945518553,
	      0.788010776,
	      -0.544639051,
	      0.241921902,
	      0.0871557444
	    ],
	    [
	      -0.98480773,
	      0.98480773,
	      -0.866025388,
	      0.642787635,
	      -0.342020154,
	      -0.939692616,
	      0.766044438,
	      -0.5,
	      0.173648179,
	      0.173648179
	    ],
	    [
	      -0.965925813,
	      0.994521916,
	      -0.891006529,
	      0.669130623,
	      -0.35836795,
	      -0.933580399,
	      0.74314481,
	      -0.453990489,
	      0.104528464,
	      0.258819044
	    ],
	    [
	      -0.939692616,
	      0.999390841,
	      -0.91354543,
	      0.694658399,
	      -0.37460658,
	      -0.927183867,
	      0.719339788,
	      -0.406736642,
	      0.0348994955,
	      0.342020154
	    ],
	    [
	      -0.906307817,
	      0.999390841,
	      -0.933580399,
	      0.719339788,
	      -0.390731126,
	      -0.920504868,
	      0.694658399,
	      -0.35836795,
	      -0.0348994955,
	      0.42261827
	    ],
	    [
	      -0.866025388,
	      0.994521916,
	      -0.95105654,
	      0.74314481,
	      -0.406736642,
	      -0.91354543,
	      0.669130623,
	      -0.309017,
	      -0.104528464,
	      0.5
	    ],
	    [
	      -0.819152057,
	      0.98480773,
	      -0.965925813,
	      0.766044438,
	      -0.42261827,
	      -0.906307817,
	      0.642787635,
	      -0.258819044,
	      -0.173648179,
	      0.57357645
	    ],
	    [
	      -0.766044438,
	      0.970295727,
	      -0.978147626,
	      0.788010776,
	      -0.438371152,
	      -0.898794055,
	      0.615661502,
	      -0.207911685,
	      -0.241921902,
	      0.642787635
	    ],
	    [
	      -0.707106769,
	      0.95105654,
	      -0.987688363,
	      0.809017,
	      -0.453990489,
	      -0.891006529,
	      0.587785244,
	      -0.156434461,
	      -0.309017,
	      0.707106769
	    ],
	    [
	      -0.642787635,
	      0.927183867,
	      -0.994521916,
	      0.829037547,
	      -0.469471574,
	      -0.882947564,
	      0.559192896,
	      -0.104528464,
	      -0.37460658,
	      0.766044438
	    ],
	    [
	      -0.57357645,
	      0.898794055,
	      -0.99862951,
	      0.848048091,
	      -0.484809607,
	      -0.874619722,
	      0.529919267,
	      -0.0523359552,
	      -0.438371152,
	      0.819152057
	    ],
	    [
	      -0.5,
	      0.866025388,
	      -1,
	      0.866025388,
	      -0.5,
	      -0.866025388,
	      0.5,
	      1.34773043e-15,
	      -0.5,
	      0.866025388
	    ],
	    [
	      -0.42261827,
	      0.829037547,
	      -0.99862951,
	      0.882947564,
	      -0.515038073,
	      -0.857167304,
	      0.469471574,
	      0.0523359552,
	      -0.559192896,
	      0.906307817
	    ],
	    [
	      -0.342020154,
	      0.788010776,
	      -0.994521916,
	      0.898794055,
	      -0.529919267,
	      -0.848048091,
	      0.438371152,
	      0.104528464,
	      -0.615661502,
	      0.939692616
	    ],
	    [
	      -0.258819044,
	      0.74314481,
	      -0.987688363,
	      0.91354543,
	      -0.544639051,
	      -0.838670552,
	      0.406736642,
	      0.156434461,
	      -0.669130623,
	      0.965925813
	    ],
	    [
	      -0.173648179,
	      0.694658399,
	      -0.978147626,
	      0.927183867,
	      -0.559192896,
	      -0.829037547,
	      0.37460658,
	      0.207911685,
	      -0.719339788,
	      0.98480773
	    ],
	    [
	      -0.0871557444,
	      0.642787635,
	      -0.965925813,
	      0.939692616,
	      -0.57357645,
	      -0.819152057,
	      0.342020154,
	      0.258819044,
	      -0.766044438,
	      0.99619472
	    ],
	    [
	      -7.34788059e-16,
	      0.587785244,
	      -0.95105654,
	      0.95105654,
	      -0.587785244,
	      -0.809017,
	      0.309017,
	      0.309017,
	      -0.809017,
	      1
	    ],
	    [
	      0.0871557444,
	      0.529919267,
	      -0.933580399,
	      0.96126169,
	      -0.601815045,
	      -0.798635483,
	      0.275637358,
	      0.35836795,
	      -0.848048091,
	      0.99619472
	    ],
	    [
	      0.173648179,
	      0.469471574,
	      -0.91354543,
	      0.970295727,
	      -0.615661502,
	      -0.788010776,
	      0.241921902,
	      0.406736642,
	      -0.882947564,
	      0.98480773
	    ],
	    [
	      0.258819044,
	      0.406736642,
	      -0.891006529,
	      0.978147626,
	      -0.629320383,
	      -0.777146,
	      0.207911685,
	      0.453990489,
	      -0.91354543,
	      0.965925813
	    ],
	    [
	      0.342020154,
	      0.342020154,
	      -0.866025388,
	      0.98480773,
	      -0.642787635,
	      -0.766044438,
	      0.173648179,
	      0.5,
	      -0.939692616,
	      0.939692616
	    ],
	    [
	      0.42261827,
	      0.275637358,
	      -0.838670552,
	      0.990268052,
	      -0.656059,
	      -0.754709601,
	      0.139173105,
	      0.544639051,
	      -0.96126169,
	      0.906307817
	    ],
	    [
	      0.5,
	      0.207911685,
	      -0.809017,
	      0.994521916,
	      -0.669130623,
	      -0.74314481,
	      0.104528464,
	      0.587785244,
	      -0.978147626,
	      0.866025388
	    ],
	    [
	      0.57357645,
	      0.139173105,
	      -0.777146,
	      0.997564077,
	      -0.681998372,
	      -0.7313537,
	      0.0697564706,
	      0.629320383,
	      -0.990268052,
	      0.819152057
	    ],
	    [
	      0.642787635,
	      0.0697564706,
	      -0.74314481,
	      0.999390841,
	      -0.694658399,
	      -0.719339788,
	      0.0348994955,
	      0.669130623,
	      -0.997564077,
	      0.766044438
	    ],
	    [
	      0.707106769,
	      6.123234e-16,
	      -0.707106769,
	      1,
	      -0.707106769,
	      -0.707106769,
	      3.061617e-16,
	      0.707106769,
	      -1,
	      0.707106769
	    ],
	    [
	      0.766044438,
	      -0.0697564706,
	      -0.669130623,
	      0.999390841,
	      -0.719339788,
	      -0.694658399,
	      -0.0348994955,
	      0.74314481,
	      -0.997564077,
	      0.642787635
	    ],
	    [
	      0.819152057,
	      -0.139173105,
	      -0.629320383,
	      0.997564077,
	      -0.7313537,
	      -0.681998372,
	      -0.0697564706,
	      0.777146,
	      -0.990268052,
	      0.57357645
	    ],
	    [
	      0.866025388,
	      -0.207911685,
	      -0.587785244,
	      0.994521916,
	      -0.74314481,
	      -0.669130623,
	      -0.104528464,
	      0.809017,
	      -0.978147626,
	      0.5
	    ],
	    [
	      0.906307817,
	      -0.275637358,
	      -0.544639051,
	      0.990268052,
	      -0.754709601,
	      -0.656059,
	      -0.139173105,
	      0.838670552,
	      -0.96126169,
	      0.42261827
	    ],
	    [
	      0.939692616,
	      -0.342020154,
	      -0.5,
	      0.98480773,
	      -0.766044438,
	      -0.642787635,
	      -0.173648179,
	      0.866025388,
	      -0.939692616,
	      0.342020154
	    ],
	    [
	      0.965925813,
	      -0.406736642,
	      -0.453990489,
	      0.978147626,
	      -0.777146,
	      -0.629320383,
	      -0.207911685,
	      0.891006529,
	      -0.91354543,
	      0.258819044
	    ],
	    [
	      0.98480773,
	      -0.469471574,
	      -0.406736642,
	      0.970295727,
	      -0.788010776,
	      -0.615661502,
	      -0.241921902,
	      0.91354543,
	      -0.882947564,
	      0.173648179
	    ],
	    [
	      0.99619472,
	      -0.529919267,
	      -0.35836795,
	      0.96126169,
	      -0.798635483,
	      -0.601815045,
	      -0.275637358,
	      0.933580399,
	      -0.848048091,
	      0.0871557444
	    ],
	    [
	      1,
	      -0.587785244,
	      -0.309017,
	      0.95105654,
	      -0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654,
	      -0.809017,
	      -9.80336451e-16
	    ],
	    [
	      0.99619472,
	      -0.642787635,
	      -0.258819044,
	      0.939692616,
	      -0.819152057,
	      -0.57357645,
	      -0.342020154,
	      0.965925813,
	      -0.766044438,
	      -0.0871557444
	    ],
	    [
	      0.98480773,
	      -0.694658399,
	      -0.207911685,
	      0.927183867,
	      -0.829037547,
	      -0.559192896,
	      -0.37460658,
	      0.978147626,
	      -0.719339788,
	      -0.173648179
	    ],
	    [
	      0.965925813,
	      -0.74314481,
	      -0.156434461,
	      0.91354543,
	      -0.838670552,
	      -0.544639051,
	      -0.406736642,
	      0.987688363,
	      -0.669130623,
	      -0.258819044
	    ],
	    [
	      0.939692616,
	      -0.788010776,
	      -0.104528464,
	      0.898794055,
	      -0.848048091,
	      -0.529919267,
	      -0.438371152,
	      0.994521916,
	      -0.615661502,
	      -0.342020154
	    ],
	    [
	      0.906307817,
	      -0.829037547,
	      -0.0523359552,
	      0.882947564,
	      -0.857167304,
	      -0.515038073,
	      -0.469471574,
	      0.99862951,
	      -0.559192896,
	      -0.42261827
	    ],
	    [
	      0.866025388,
	      -0.866025388,
	      -4.89858741e-16,
	      0.866025388,
	      -0.866025388,
	      -0.5,
	      -0.5,
	      1,
	      -0.5,
	      -0.5
	    ],
	    [
	      0.819152057,
	      -0.898794055,
	      0.0523359552,
	      0.848048091,
	      -0.874619722,
	      -0.484809607,
	      -0.529919267,
	      0.99862951,
	      -0.438371152,
	      -0.57357645
	    ],
	    [
	      0.766044438,
	      -0.927183867,
	      0.104528464,
	      0.829037547,
	      -0.882947564,
	      -0.469471574,
	      -0.559192896,
	      0.994521916,
	      -0.37460658,
	      -0.642787635
	    ],
	    [
	      0.707106769,
	      -0.95105654,
	      0.156434461,
	      0.809017,
	      -0.891006529,
	      -0.453990489,
	      -0.587785244,
	      0.987688363,
	      -0.309017,
	      -0.707106769
	    ],
	    [
	      0.642787635,
	      -0.970295727,
	      0.207911685,
	      0.788010776,
	      -0.898794055,
	      -0.438371152,
	      -0.615661502,
	      0.978147626,
	      -0.241921902,
	      -0.766044438
	    ],
	    [
	      0.57357645,
	      -0.98480773,
	      0.258819044,
	      0.766044438,
	      -0.906307817,
	      -0.42261827,
	      -0.642787635,
	      0.965925813,
	      -0.173648179,
	      -0.819152057
	    ],
	    [
	      0.5,
	      -0.994521916,
	      0.309017,
	      0.74314481,
	      -0.91354543,
	      -0.406736642,
	      -0.669130623,
	      0.95105654,
	      -0.104528464,
	      -0.866025388
	    ],
	    [
	      0.42261827,
	      -0.999390841,
	      0.35836795,
	      0.719339788,
	      -0.920504868,
	      -0.390731126,
	      -0.694658399,
	      0.933580399,
	      -0.0348994955,
	      -0.906307817
	    ],
	    [
	      0.342020154,
	      -0.999390841,
	      0.406736642,
	      0.694658399,
	      -0.927183867,
	      -0.37460658,
	      -0.719339788,
	      0.91354543,
	      0.0348994955,
	      -0.939692616
	    ],
	    [
	      0.258819044,
	      -0.994521916,
	      0.453990489,
	      0.669130623,
	      -0.933580399,
	      -0.35836795,
	      -0.74314481,
	      0.891006529,
	      0.104528464,
	      -0.965925813
	    ],
	    [
	      0.173648179,
	      -0.98480773,
	      0.5,
	      0.642787635,
	      -0.939692616,
	      -0.342020154,
	      -0.766044438,
	      0.866025388,
	      0.173648179,
	      -0.98480773
	    ],
	    [
	      0.0871557444,
	      -0.970295727,
	      0.544639051,
	      0.615661502,
	      -0.945518553,
	      -0.325568169,
	      -0.788010776,
	      0.838670552,
	      0.241921902,
	      -0.99619472
	    ],
	    [
	      8.5725277e-16,
	      -0.95105654,
	      0.587785244,
	      0.587785244,
	      -0.95105654,
	      -0.309017,
	      -0.809017,
	      0.809017,
	      0.309017,
	      -1
	    ],
	    [
	      -0.0871557444,
	      -0.927183867,
	      0.629320383,
	      0.559192896,
	      -0.956304729,
	      -0.29237169,
	      -0.829037547,
	      0.777146,
	      0.37460658,
	      -0.99619472
	    ],
	    [
	      -0.173648179,
	      -0.898794055,
	      0.669130623,
	      0.529919267,
	      -0.96126169,
	      -0.275637358,
	      -0.848048091,
	      0.74314481,
	      0.438371152,
	      -0.98480773
	    ],
	    [
	      -0.258819044,
	      -0.866025388,
	      0.707106769,
	      0.5,
	      -0.965925813,
	      -0.258819044,
	      -0.866025388,
	      0.707106769,
	      0.5,
	      -0.965925813
	    ],
	    [
	      -0.342020154,
	      -0.829037547,
	      0.74314481,
	      0.469471574,
	      -0.970295727,
	      -0.241921902,
	      -0.882947564,
	      0.669130623,
	      0.559192896,
	      -0.939692616
	    ],
	    [
	      -0.42261827,
	      -0.788010776,
	      0.777146,
	      0.438371152,
	      -0.974370062,
	      -0.224951059,
	      -0.898794055,
	      0.629320383,
	      0.615661502,
	      -0.906307817
	    ],
	    [
	      -0.5,
	      -0.74314481,
	      0.809017,
	      0.406736642,
	      -0.978147626,
	      -0.207911685,
	      -0.91354543,
	      0.587785244,
	      0.669130623,
	      -0.866025388
	    ],
	    [
	      -0.57357645,
	      -0.694658399,
	      0.838670552,
	      0.37460658,
	      -0.981627166,
	      -0.190809,
	      -0.927183867,
	      0.544639051,
	      0.719339788,
	      -0.819152057
	    ],
	    [
	      -0.642787635,
	      -0.642787635,
	      0.866025388,
	      0.342020154,
	      -0.98480773,
	      -0.173648179,
	      -0.939692616,
	      0.5,
	      0.766044438,
	      -0.766044438
	    ],
	    [
	      -0.707106769,
	      -0.587785244,
	      0.891006529,
	      0.309017,
	      -0.987688363,
	      -0.156434461,
	      -0.95105654,
	      0.453990489,
	      0.809017,
	      -0.707106769
	    ],
	    [
	      -0.766044438,
	      -0.529919267,
	      0.91354543,
	      0.275637358,
	      -0.990268052,
	      -0.139173105,
	      -0.96126169,
	      0.406736642,
	      0.848048091,
	      -0.642787635
	    ],
	    [
	      -0.819152057,
	      -0.469471574,
	      0.933580399,
	      0.241921902,
	      -0.992546141,
	      -0.121869341,
	      -0.970295727,
	      0.35836795,
	      0.882947564,
	      -0.57357645
	    ],
	    [
	      -0.866025388,
	      -0.406736642,
	      0.95105654,
	      0.207911685,
	      -0.994521916,
	      -0.104528464,
	      -0.978147626,
	      0.309017,
	      0.91354543,
	      -0.5
	    ],
	    [
	      -0.906307817,
	      -0.342020154,
	      0.965925813,
	      0.173648179,
	      -0.99619472,
	      -0.0871557444,
	      -0.98480773,
	      0.258819044,
	      0.939692616,
	      -0.42261827
	    ],
	    [
	      -0.939692616,
	      -0.275637358,
	      0.978147626,
	      0.139173105,
	      -0.997564077,
	      -0.0697564706,
	      -0.990268052,
	      0.207911685,
	      0.96126169,
	      -0.342020154
	    ],
	    [
	      -0.965925813,
	      -0.207911685,
	      0.987688363,
	      0.104528464,
	      -0.99862951,
	      -0.0523359552,
	      -0.994521916,
	      0.156434461,
	      0.978147626,
	      -0.258819044
	    ],
	    [
	      -0.98480773,
	      -0.139173105,
	      0.994521916,
	      0.0697564706,
	      -0.999390841,
	      -0.0348994955,
	      -0.997564077,
	      0.104528464,
	      0.990268052,
	      -0.173648179
	    ],
	    [
	      -0.99619472,
	      -0.0697564706,
	      0.99862951,
	      0.0348994955,
	      -0.99984771,
	      -0.0174524058,
	      -0.999390841,
	      0.0523359552,
	      0.997564077,
	      -0.0871557444
	    ],
	    [
	      -1,
	      -7.34788059e-16,
	      1,
	      3.67394029e-16,
	      -1,
	      -1.83697015e-16,
	      -1,
	      5.5109107e-16,
	      1,
	      -2.69484189e-15
	    ],
	    [
	      -0.99619472,
	      0.0697564706,
	      0.99862951,
	      -0.0348994955,
	      -0.99984771,
	      0.0174524058,
	      -0.999390841,
	      -0.0523359552,
	      0.997564077,
	      0.0871557444
	    ],
	    [
	      -0.98480773,
	      0.139173105,
	      0.994521916,
	      -0.0697564706,
	      -0.999390841,
	      0.0348994955,
	      -0.997564077,
	      -0.104528464,
	      0.990268052,
	      0.173648179
	    ],
	    [
	      -0.965925813,
	      0.207911685,
	      0.987688363,
	      -0.104528464,
	      -0.99862951,
	      0.0523359552,
	      -0.994521916,
	      -0.156434461,
	      0.978147626,
	      0.258819044
	    ],
	    [
	      -0.939692616,
	      0.275637358,
	      0.978147626,
	      -0.139173105,
	      -0.997564077,
	      0.0697564706,
	      -0.990268052,
	      -0.207911685,
	      0.96126169,
	      0.342020154
	    ],
	    [
	      -0.906307817,
	      0.342020154,
	      0.965925813,
	      -0.173648179,
	      -0.99619472,
	      0.0871557444,
	      -0.98480773,
	      -0.258819044,
	      0.939692616,
	      0.42261827
	    ],
	    [
	      -0.866025388,
	      0.406736642,
	      0.95105654,
	      -0.207911685,
	      -0.994521916,
	      0.104528464,
	      -0.978147626,
	      -0.309017,
	      0.91354543,
	      0.5
	    ],
	    [
	      -0.819152057,
	      0.469471574,
	      0.933580399,
	      -0.241921902,
	      -0.992546141,
	      0.121869341,
	      -0.970295727,
	      -0.35836795,
	      0.882947564,
	      0.57357645
	    ],
	    [
	      -0.766044438,
	      0.529919267,
	      0.91354543,
	      -0.275637358,
	      -0.990268052,
	      0.139173105,
	      -0.96126169,
	      -0.406736642,
	      0.848048091,
	      0.642787635
	    ],
	    [
	      -0.707106769,
	      0.587785244,
	      0.891006529,
	      -0.309017,
	      -0.987688363,
	      0.156434461,
	      -0.95105654,
	      -0.453990489,
	      0.809017,
	      0.707106769
	    ],
	    [
	      -0.642787635,
	      0.642787635,
	      0.866025388,
	      -0.342020154,
	      -0.98480773,
	      0.173648179,
	      -0.939692616,
	      -0.5,
	      0.766044438,
	      0.766044438
	    ],
	    [
	      -0.57357645,
	      0.694658399,
	      0.838670552,
	      -0.37460658,
	      -0.981627166,
	      0.190809,
	      -0.927183867,
	      -0.544639051,
	      0.719339788,
	      0.819152057
	    ],
	    [
	      -0.5,
	      0.74314481,
	      0.809017,
	      -0.406736642,
	      -0.978147626,
	      0.207911685,
	      -0.91354543,
	      -0.587785244,
	      0.669130623,
	      0.866025388
	    ],
	    [
	      -0.42261827,
	      0.788010776,
	      0.777146,
	      -0.438371152,
	      -0.974370062,
	      0.224951059,
	      -0.898794055,
	      -0.629320383,
	      0.615661502,
	      0.906307817
	    ],
	    [
	      -0.342020154,
	      0.829037547,
	      0.74314481,
	      -0.469471574,
	      -0.970295727,
	      0.241921902,
	      -0.882947564,
	      -0.669130623,
	      0.559192896,
	      0.939692616
	    ],
	    [
	      -0.258819044,
	      0.866025388,
	      0.707106769,
	      -0.5,
	      -0.965925813,
	      0.258819044,
	      -0.866025388,
	      -0.707106769,
	      0.5,
	      0.965925813
	    ],
	    [
	      -0.173648179,
	      0.898794055,
	      0.669130623,
	      -0.529919267,
	      -0.96126169,
	      0.275637358,
	      -0.848048091,
	      -0.74314481,
	      0.438371152,
	      0.98480773
	    ],
	    [
	      -0.0871557444,
	      0.927183867,
	      0.629320383,
	      -0.559192896,
	      -0.956304729,
	      0.29237169,
	      -0.829037547,
	      -0.777146,
	      0.37460658,
	      0.99619472
	    ],
	    [
	      -9.79717482e-16,
	      0.95105654,
	      0.587785244,
	      -0.587785244,
	      -0.95105654,
	      0.309017,
	      -0.809017,
	      -0.809017,
	      0.309017,
	      1
	    ],
	    [
	      0.0871557444,
	      0.970295727,
	      0.544639051,
	      -0.615661502,
	      -0.945518553,
	      0.325568169,
	      -0.788010776,
	      -0.838670552,
	      0.241921902,
	      0.99619472
	    ],
	    [
	      0.173648179,
	      0.98480773,
	      0.5,
	      -0.642787635,
	      -0.939692616,
	      0.342020154,
	      -0.766044438,
	      -0.866025388,
	      0.173648179,
	      0.98480773
	    ],
	    [
	      0.258819044,
	      0.994521916,
	      0.453990489,
	      -0.669130623,
	      -0.933580399,
	      0.35836795,
	      -0.74314481,
	      -0.891006529,
	      0.104528464,
	      0.965925813
	    ],
	    [
	      0.342020154,
	      0.999390841,
	      0.406736642,
	      -0.694658399,
	      -0.927183867,
	      0.37460658,
	      -0.719339788,
	      -0.91354543,
	      0.0348994955,
	      0.939692616
	    ],
	    [
	      0.42261827,
	      0.999390841,
	      0.35836795,
	      -0.719339788,
	      -0.920504868,
	      0.390731126,
	      -0.694658399,
	      -0.933580399,
	      -0.0348994955,
	      0.906307817
	    ],
	    [
	      0.5,
	      0.994521916,
	      0.309017,
	      -0.74314481,
	      -0.91354543,
	      0.406736642,
	      -0.669130623,
	      -0.95105654,
	      -0.104528464,
	      0.866025388
	    ],
	    [
	      0.57357645,
	      0.98480773,
	      0.258819044,
	      -0.766044438,
	      -0.906307817,
	      0.42261827,
	      -0.642787635,
	      -0.965925813,
	      -0.173648179,
	      0.819152057
	    ],
	    [
	      0.642787635,
	      0.970295727,
	      0.207911685,
	      -0.788010776,
	      -0.898794055,
	      0.438371152,
	      -0.615661502,
	      -0.978147626,
	      -0.241921902,
	      0.766044438
	    ],
	    [
	      0.707106769,
	      0.95105654,
	      0.156434461,
	      -0.809017,
	      -0.891006529,
	      0.453990489,
	      -0.587785244,
	      -0.987688363,
	      -0.309017,
	      0.707106769
	    ],
	    [
	      0.766044438,
	      0.927183867,
	      0.104528464,
	      -0.829037547,
	      -0.882947564,
	      0.469471574,
	      -0.559192896,
	      -0.994521916,
	      -0.37460658,
	      0.642787635
	    ],
	    [
	      0.819152057,
	      0.898794055,
	      0.0523359552,
	      -0.848048091,
	      -0.874619722,
	      0.484809607,
	      -0.529919267,
	      -0.99862951,
	      -0.438371152,
	      0.57357645
	    ],
	    [
	      0.866025388,
	      0.866025388,
	      6.123234e-16,
	      -0.866025388,
	      -0.866025388,
	      0.5,
	      -0.5,
	      -1,
	      -0.5,
	      0.5
	    ],
	    [
	      0.906307817,
	      0.829037547,
	      -0.0523359552,
	      -0.882947564,
	      -0.857167304,
	      0.515038073,
	      -0.469471574,
	      -0.99862951,
	      -0.559192896,
	      0.42261827
	    ],
	    [
	      0.939692616,
	      0.788010776,
	      -0.104528464,
	      -0.898794055,
	      -0.848048091,
	      0.529919267,
	      -0.438371152,
	      -0.994521916,
	      -0.615661502,
	      0.342020154
	    ],
	    [
	      0.965925813,
	      0.74314481,
	      -0.156434461,
	      -0.91354543,
	      -0.838670552,
	      0.544639051,
	      -0.406736642,
	      -0.987688363,
	      -0.669130623,
	      0.258819044
	    ],
	    [
	      0.98480773,
	      0.694658399,
	      -0.207911685,
	      -0.927183867,
	      -0.829037547,
	      0.559192896,
	      -0.37460658,
	      -0.978147626,
	      -0.719339788,
	      0.173648179
	    ],
	    [
	      0.99619472,
	      0.642787635,
	      -0.258819044,
	      -0.939692616,
	      -0.819152057,
	      0.57357645,
	      -0.342020154,
	      -0.965925813,
	      -0.766044438,
	      0.0871557444
	    ],
	    [
	      1,
	      0.587785244,
	      -0.309017,
	      -0.95105654,
	      -0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654,
	      -0.809017,
	      -7.35407081e-16
	    ],
	    [
	      0.99619472,
	      0.529919267,
	      -0.35836795,
	      -0.96126169,
	      -0.798635483,
	      0.601815045,
	      -0.275637358,
	      -0.933580399,
	      -0.848048091,
	      -0.0871557444
	    ],
	    [
	      0.98480773,
	      0.469471574,
	      -0.406736642,
	      -0.970295727,
	      -0.788010776,
	      0.615661502,
	      -0.241921902,
	      -0.91354543,
	      -0.882947564,
	      -0.173648179
	    ],
	    [
	      0.965925813,
	      0.406736642,
	      -0.453990489,
	      -0.978147626,
	      -0.777146,
	      0.629320383,
	      -0.207911685,
	      -0.891006529,
	      -0.91354543,
	      -0.258819044
	    ],
	    [
	      0.939692616,
	      0.342020154,
	      -0.5,
	      -0.98480773,
	      -0.766044438,
	      0.642787635,
	      -0.173648179,
	      -0.866025388,
	      -0.939692616,
	      -0.342020154
	    ],
	    [
	      0.906307817,
	      0.275637358,
	      -0.544639051,
	      -0.990268052,
	      -0.754709601,
	      0.656059,
	      -0.139173105,
	      -0.838670552,
	      -0.96126169,
	      -0.42261827
	    ],
	    [
	      0.866025388,
	      0.207911685,
	      -0.587785244,
	      -0.994521916,
	      -0.74314481,
	      0.669130623,
	      -0.104528464,
	      -0.809017,
	      -0.978147626,
	      -0.5
	    ],
	    [
	      0.819152057,
	      0.139173105,
	      -0.629320383,
	      -0.997564077,
	      -0.7313537,
	      0.681998372,
	      -0.0697564706,
	      -0.777146,
	      -0.990268052,
	      -0.57357645
	    ],
	    [
	      0.766044438,
	      0.0697564706,
	      -0.669130623,
	      -0.999390841,
	      -0.719339788,
	      0.694658399,
	      -0.0348994955,
	      -0.74314481,
	      -0.997564077,
	      -0.642787635
	    ],
	    [
	      0.707106769,
	      8.5725277e-16,
	      -0.707106769,
	      -1,
	      -0.707106769,
	      0.707106769,
	      -4.28626385e-16,
	      -0.707106769,
	      -1,
	      -0.707106769
	    ],
	    [
	      0.642787635,
	      -0.0697564706,
	      -0.74314481,
	      -0.999390841,
	      -0.694658399,
	      0.719339788,
	      0.0348994955,
	      -0.669130623,
	      -0.997564077,
	      -0.766044438
	    ],
	    [
	      0.57357645,
	      -0.139173105,
	      -0.777146,
	      -0.997564077,
	      -0.681998372,
	      0.7313537,
	      0.0697564706,
	      -0.629320383,
	      -0.990268052,
	      -0.819152057
	    ],
	    [
	      0.5,
	      -0.207911685,
	      -0.809017,
	      -0.994521916,
	      -0.669130623,
	      0.74314481,
	      0.104528464,
	      -0.587785244,
	      -0.978147626,
	      -0.866025388
	    ],
	    [
	      0.42261827,
	      -0.275637358,
	      -0.838670552,
	      -0.990268052,
	      -0.656059,
	      0.754709601,
	      0.139173105,
	      -0.544639051,
	      -0.96126169,
	      -0.906307817
	    ],
	    [
	      0.342020154,
	      -0.342020154,
	      -0.866025388,
	      -0.98480773,
	      -0.642787635,
	      0.766044438,
	      0.173648179,
	      -0.5,
	      -0.939692616,
	      -0.939692616
	    ],
	    [
	      0.258819044,
	      -0.406736642,
	      -0.891006529,
	      -0.978147626,
	      -0.629320383,
	      0.777146,
	      0.207911685,
	      -0.453990489,
	      -0.91354543,
	      -0.965925813
	    ],
	    [
	      0.173648179,
	      -0.469471574,
	      -0.91354543,
	      -0.970295727,
	      -0.615661502,
	      0.788010776,
	      0.241921902,
	      -0.406736642,
	      -0.882947564,
	      -0.98480773
	    ],
	    [
	      0.0871557444,
	      -0.529919267,
	      -0.933580399,
	      -0.96126169,
	      -0.601815045,
	      0.798635483,
	      0.275637358,
	      -0.35836795,
	      -0.848048091,
	      -0.99619472
	    ],
	    [
	      1.10218214e-15,
	      -0.587785244,
	      -0.95105654,
	      -0.95105654,
	      -0.587785244,
	      0.809017,
	      0.309017,
	      -0.309017,
	      -0.809017,
	      -1
	    ],
	    [
	      -0.0871557444,
	      -0.642787635,
	      -0.965925813,
	      -0.939692616,
	      -0.57357645,
	      0.819152057,
	      0.342020154,
	      -0.258819044,
	      -0.766044438,
	      -0.99619472
	    ],
	    [
	      -0.173648179,
	      -0.694658399,
	      -0.978147626,
	      -0.927183867,
	      -0.559192896,
	      0.829037547,
	      0.37460658,
	      -0.207911685,
	      -0.719339788,
	      -0.98480773
	    ],
	    [
	      -0.258819044,
	      -0.74314481,
	      -0.987688363,
	      -0.91354543,
	      -0.544639051,
	      0.838670552,
	      0.406736642,
	      -0.156434461,
	      -0.669130623,
	      -0.965925813
	    ],
	    [
	      -0.342020154,
	      -0.788010776,
	      -0.994521916,
	      -0.898794055,
	      -0.529919267,
	      0.848048091,
	      0.438371152,
	      -0.104528464,
	      -0.615661502,
	      -0.939692616
	    ],
	    [
	      -0.42261827,
	      -0.829037547,
	      -0.99862951,
	      -0.882947564,
	      -0.515038073,
	      0.857167304,
	      0.469471574,
	      -0.0523359552,
	      -0.559192896,
	      -0.906307817
	    ],
	    [
	      -0.5,
	      -0.866025388,
	      -1,
	      -0.866025388,
	      -0.5,
	      0.866025388,
	      0.5,
	      -2.44991257e-15,
	      -0.5,
	      -0.866025388
	    ],
	    [
	      -0.57357645,
	      -0.898794055,
	      -0.99862951,
	      -0.848048091,
	      -0.484809607,
	      0.874619722,
	      0.529919267,
	      0.0523359552,
	      -0.438371152,
	      -0.819152057
	    ],
	    [
	      -0.642787635,
	      -0.927183867,
	      -0.994521916,
	      -0.829037547,
	      -0.469471574,
	      0.882947564,
	      0.559192896,
	      0.104528464,
	      -0.37460658,
	      -0.766044438
	    ],
	    [
	      -0.707106769,
	      -0.95105654,
	      -0.987688363,
	      -0.809017,
	      -0.453990489,
	      0.891006529,
	      0.587785244,
	      0.156434461,
	      -0.309017,
	      -0.707106769
	    ],
	    [
	      -0.766044438,
	      -0.970295727,
	      -0.978147626,
	      -0.788010776,
	      -0.438371152,
	      0.898794055,
	      0.615661502,
	      0.207911685,
	      -0.241921902,
	      -0.642787635
	    ],
	    [
	      -0.819152057,
	      -0.98480773,
	      -0.965925813,
	      -0.766044438,
	      -0.42261827,
	      0.906307817,
	      0.642787635,
	      0.258819044,
	      -0.173648179,
	      -0.57357645
	    ],
	    [
	      -0.866025388,
	      -0.994521916,
	      -0.95105654,
	      -0.74314481,
	      -0.406736642,
	      0.91354543,
	      0.669130623,
	      0.309017,
	      -0.104528464,
	      -0.5
	    ],
	    [
	      -0.906307817,
	      -0.999390841,
	      -0.933580399,
	      -0.719339788,
	      -0.390731126,
	      0.920504868,
	      0.694658399,
	      0.35836795,
	      -0.0348994955,
	      -0.42261827
	    ],
	    [
	      -0.939692616,
	      -0.999390841,
	      -0.91354543,
	      -0.694658399,
	      -0.37460658,
	      0.927183867,
	      0.719339788,
	      0.406736642,
	      0.0348994955,
	      -0.342020154
	    ],
	    [
	      -0.965925813,
	      -0.994521916,
	      -0.891006529,
	      -0.669130623,
	      -0.35836795,
	      0.933580399,
	      0.74314481,
	      0.453990489,
	      0.104528464,
	      -0.258819044
	    ],
	    [
	      -0.98480773,
	      -0.98480773,
	      -0.866025388,
	      -0.642787635,
	      -0.342020154,
	      0.939692616,
	      0.766044438,
	      0.5,
	      0.173648179,
	      -0.173648179
	    ],
	    [
	      -0.99619472,
	      -0.970295727,
	      -0.838670552,
	      -0.615661502,
	      -0.325568169,
	      0.945518553,
	      0.788010776,
	      0.544639051,
	      0.241921902,
	      -0.0871557444
	    ],
	    [
	      -1,
	      -0.95105654,
	      -0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244,
	      0.309017,
	      -2.9397712e-15
	    ],
	    [
	      -0.99619472,
	      -0.927183867,
	      -0.777146,
	      -0.559192896,
	      -0.29237169,
	      0.956304729,
	      0.829037547,
	      0.629320383,
	      0.37460658,
	      0.0871557444
	    ],
	    [
	      -0.98480773,
	      -0.898794055,
	      -0.74314481,
	      -0.529919267,
	      -0.275637358,
	      0.96126169,
	      0.848048091,
	      0.669130623,
	      0.438371152,
	      0.173648179
	    ],
	    [
	      -0.965925813,
	      -0.866025388,
	      -0.707106769,
	      -0.5,
	      -0.258819044,
	      0.965925813,
	      0.866025388,
	      0.707106769,
	      0.5,
	      0.258819044
	    ],
	    [
	      -0.939692616,
	      -0.829037547,
	      -0.669130623,
	      -0.469471574,
	      -0.241921902,
	      0.970295727,
	      0.882947564,
	      0.74314481,
	      0.559192896,
	      0.342020154
	    ],
	    [
	      -0.906307817,
	      -0.788010776,
	      -0.629320383,
	      -0.438371152,
	      -0.224951059,
	      0.974370062,
	      0.898794055,
	      0.777146,
	      0.615661502,
	      0.42261827
	    ],
	    [
	      -0.866025388,
	      -0.74314481,
	      -0.587785244,
	      -0.406736642,
	      -0.207911685,
	      0.978147626,
	      0.91354543,
	      0.809017,
	      0.669130623,
	      0.5
	    ],
	    [
	      -0.819152057,
	      -0.694658399,
	      -0.544639051,
	      -0.37460658,
	      -0.190809,
	      0.981627166,
	      0.927183867,
	      0.838670552,
	      0.719339788,
	      0.57357645
	    ],
	    [
	      -0.766044438,
	      -0.642787635,
	      -0.5,
	      -0.342020154,
	      -0.173648179,
	      0.98480773,
	      0.939692616,
	      0.866025388,
	      0.766044438,
	      0.642787635
	    ],
	    [
	      -0.707106769,
	      -0.587785244,
	      -0.453990489,
	      -0.309017,
	      -0.156434461,
	      0.987688363,
	      0.95105654,
	      0.891006529,
	      0.809017,
	      0.707106769
	    ],
	    [
	      -0.642787635,
	      -0.529919267,
	      -0.406736642,
	      -0.275637358,
	      -0.139173105,
	      0.990268052,
	      0.96126169,
	      0.91354543,
	      0.848048091,
	      0.766044438
	    ],
	    [
	      -0.57357645,
	      -0.469471574,
	      -0.35836795,
	      -0.241921902,
	      -0.121869341,
	      0.992546141,
	      0.970295727,
	      0.933580399,
	      0.882947564,
	      0.819152057
	    ],
	    [
	      -0.5,
	      -0.406736642,
	      -0.309017,
	      -0.207911685,
	      -0.104528464,
	      0.994521916,
	      0.978147626,
	      0.95105654,
	      0.91354543,
	      0.866025388
	    ],
	    [
	      -0.42261827,
	      -0.342020154,
	      -0.258819044,
	      -0.173648179,
	      -0.0871557444,
	      0.99619472,
	      0.98480773,
	      0.965925813,
	      0.939692616,
	      0.906307817
	    ],
	    [
	      -0.342020154,
	      -0.275637358,
	      -0.207911685,
	      -0.139173105,
	      -0.0697564706,
	      0.997564077,
	      0.990268052,
	      0.978147626,
	      0.96126169,
	      0.939692616
	    ],
	    [
	      -0.258819044,
	      -0.207911685,
	      -0.156434461,
	      -0.104528464,
	      -0.0523359552,
	      0.99862951,
	      0.994521916,
	      0.987688363,
	      0.978147626,
	      0.965925813
	    ],
	    [
	      -0.173648179,
	      -0.139173105,
	      -0.104528464,
	      -0.0697564706,
	      -0.0348994955,
	      0.999390841,
	      0.997564077,
	      0.994521916,
	      0.990268052,
	      0.98480773
	    ],
	    [
	      -0.0871557444,
	      -0.0697564706,
	      -0.0523359552,
	      -0.0348994955,
	      -0.0174524058,
	      0.99984771,
	      0.999390841,
	      0.99862951,
	      0.997564077,
	      0.99619472
	    ]
	  ],
	  [
	    [
	      -1,
	      0,
	      1,
	      0,
	      0,
	      -1,
	      0,
	      0,
	      0,
	      1,
	      0,
	      0,
	      0,
	      0,
	      -1,
	      0,
	      0,
	      0,
	      0,
	      0
	    ],
	    [
	      -0.99984771,
	      0.0174524058,
	      0.99954313,
	      -0.0302238502,
	      0.000263779628,
	      -0.99908632,
	      0.0427332148,
	      -0.000589739357,
	      0.00000420248307,
	      0.998477459,
	      -0.0551515371,
	      0.00102125108,
	      -0.0000111170311,
	      6.86065036e-8,
	      -0.997716665,
	      0.067520842,
	      -0.0015595908,
	      0.0000222298295,
	      -2.05788169e-7,
	      1.1359047e-9
	    ],
	    [
	      -0.999390841,
	      0.0348994955,
	      0.998173058,
	      -0.0604108796,
	      0.00105479721,
	      -0.996347725,
	      0.0853558108,
	      -0.00235716137,
	      0.000033604505,
	      0.993916631,
	      -0.110059582,
	      0.00407940708,
	      -0.000088855,
	      0.00000109703558,
	      -0.99088186,
	      0.134589493,
	      -0.00622506905,
	      0.000177574679,
	      -0.00000328910164,
	      3.63212784e-8
	    ],
	    [
	      -0.99862951,
	      0.0523359552,
	      0.995891392,
	      -0.0905243,
	      0.00237208884,
	      -0.991791308,
	      0.12775746,
	      -0.00529688271,
	      0.000113328853,
	      0.986337543,
	      -0.164481804,
	      0.00915770326,
	      -0.000299429055,
	      0.00000554810504,
	      -0.979541421,
	      0.200757101,
	      -0.0139566557,
	      0.000597832084,
	      -0.000016621505,
	      2.75464799e-7
	    ],
	    [
	      -0.997564077,
	      0.0697564706,
	      0.992701054,
	      -0.120527439,
	      0.00421405,
	      -0.985428751,
	      0.169828475,
	      -0.00939994864,
	      0.000268345029,
	      0.975773752,
	      -0.218178153,
	      0.0162282921,
	      -0.000708244741,
	      0.0000175098376,
	      -0.963771284,
	      0.26558128,
	      -0.0246884,
	      0.00141217536,
	      -0.0000524015522,
	      0.00000115874502
	    ],
	    [
	      -0.99619472,
	      0.0871557444,
	      0.988605797,
	      -0.150383726,
	      0.00657843612,
	      -0.977276683,
	      0.211460009,
	      -0.014653855,
	      0.000523393159,
	      0.96227181,
	      -0.270912081,
	      0.0252523813,
	      -0.00137949863,
	      0.0000426705337,
	      -0.943676829,
	      0.328629553,
	      -0.038328696,
	      0.00274586887,
	      -0.000127524472,
	      0.00000352813618
	    ],
	    [
	      -0.994521916,
	      0.104528464,
	      0.98361069,
	      -0.18005681,
	      0.00946236681,
	      -0.967356,
	      0.252544463,
	      -0.0210425854,
	      0.000902908447,
	      0.945891321,
	      -0.322451502,
	      0.0361804329,
	      -0.00237578456,
	      0.0000882840613,
	      -0.919392467,
	      0.3894822,
	      -0.054761,
	      0.00471901428,
	      -0.000263401278,
	      0.00000875463684
	    ],
	    [
	      -0.992546141,
	      0.121869341,
	      0.97772181,
	      -0.209510505,
	      0.0128623275,
	      -0.955692589,
	      0.292975664,
	      -0.0285466593,
	      0.00143094664,
	      0.926704407,
	      -0.372570127,
	      0.0489524,
	      -0.00375770917,
	      0.000163125529,
	      -0.89108032,
	      0.447735608,
	      -0.0738447458,
	      0.00744534191,
	      -0.000485728844,
	      0.0000188598242
	    ],
	    [
	      -0.990268052,
	      0.139173105,
	      0.970946252,
	      -0.238708958,
	      0.0167741776,
	      -0.942316413,
	      0.33264932,
	      -0.0371431746,
	      0.00213111029,
	      0.904795587,
	      -0.421048343,
	      0.06349805,
	      -0.00558351539,
	      0.000277437561,
	      -0.858929157,
	      0.503005,
	      -0.095416449,
	      0.0110310512,
	      -0.000824212679,
	      0.0000366304121
	    ],
	    [
	      -0.987688363,
	      0.156434461,
	      0.96329236,
	      -0.26761657,
	      0.0211931504,
	      -0.927262187,
	      0.37146312,
	      -0.0468058847,
	      0.0030264766,
	      0.880261302,
	      -0.467674255,
	      0.0797372833,
	      -0.00790872145,
	      0.000442867487,
	      -0.823153198,
	      0.55492723,
	      -0.119290978,
	      0.0155737158,
	      -0.00131224515,
	      0.0000657245328
	    ],
	    [
	      -0.98480773,
	      0.173648179,
	      0.954769492,
	      -0.29619813,
	      0.0261138603,
	      -0.910568774,
	      0.409317106,
	      -0.0575052574,
	      0.00413952675,
	      0.853209496,
	      -0.51224488,
	      0.097580567,
	      -0.0107857706,
	      0.000672395749,
	      -0.783990145,
	      0.6031636,
	      -0.145263031,
	      0.0211612582,
	      -0.00198654155,
	      0.000110768546
	    ],
	    [
	      -0.981627166,
	      0.190809,
	      0.9453879,
	      -0.324418813,
	      0.0315303169,
	      -0.892279327,
	      0.446113944,
	      -0.0692085773,
	      0.00549207628,
	      0.8237589,
	      -0.55456686,
	      0.11692936,
	      -0.0142636979,
	      0.000980255776,
	      -0.7417,
	      0.647402,
	      -0.173108727,
	      0.027871009,
	      -0.00288673723,
	      0.00017744326
	    ],
	    [
	      -0.978147626,
	      0.207911685,
	      0.935159087,
	      -0.352244258,
	      0.0374359153,
	      -0.872441,
	      0.481759191,
	      -0.08188,
	      0.00710520707,
	      0.792038739,
	      -0.594457507,
	      0.137676626,
	      -0.0183878168,
	      0.00138184614,
	      -0.696562707,
	      0.687359333,
	      -0.202587366,
	      0.0357688442,
	      -0.00405494822,
	      0.000272558565
	    ],
	    [
	      -0.974370062,
	      0.224951059,
	      0.924095511,
	      -0.379640549,
	      0.043823462,
	      -0.851105,
	      0.516161561,
	      -0.0954807103,
	      0.00899920426,
	      0.758188,
	      -0.631745756,
	      0.159707367,
	      -0.0231994167,
	      0.00189363456,
	      -0.64887625,
	      0.722783685,
	      -0.233443365,
	      0.044908423,
	      -0.00553530222,
	      0.000404115446
	    ],
	    [
	      -0.970295727,
	      0.241921902,
	      0.912210703,
	      -0.406574309,
	      0.0506851785,
	      -0.828326404,
	      0.549233,
	      -0.10996896,
	      0.0111934906,
	      0.72235477,
	      -0.666272759,
	      0.182899177,
	      -0.0287354942,
	      0.00253305561,
	      -0.598954737,
	      0.753455698,
	      -0.265408158,
	      0.0553305373,
	      -0.00737343961,
	      0.00058135466
	    ],
	    [
	      -0.965925813,
	      0.258819044,
	      0.899519,
	      -0.433012694,
	      0.0580127,
	      -0.804163933,
	      0.580889285,
	      -0.125300229,
	      0.0137065668,
	      0.684695423,
	      -0.697892725,
	      0.207122892,
	      -0.0350284949,
	      0.00331840175,
	      -0.547125876,
	      0.77919066,
	      -0.298202485,
	      0.0670625493,
	      -0.0096159894,
	      0.00081479142
	    ],
	    [
	      -0.96126169,
	      0.275637358,
	      0.886036098,
	      -0.458923548,
	      0.0657971054,
	      -0.778679788,
	      0.61104995,
	      -0.141427353,
	      0.0165559556,
	      0.645374238,
	      -0.726473689,
	      0.23224321,
	      -0.0421060883,
	      0.00426870678,
	      -0.493728578,
	      0.799839199,
	      -0.331538409,
	      0.0801179484,
	      -0.0123100337,
	      0.00111623504
	    ],
	    [
	      -0.956304729,
	      0.29237169,
	      0.87177819,
	      -0.484275252,
	      0.0740289,
	      -0.751939535,
	      0.639638543,
	      -0.158300623,
	      0.0197581388,
	      0.604562223,
	      -0.751898,
	      0.258119404,
	      -0.0499909483,
	      0.00540362718,
	      -0.439110696,
	      0.815288842,
	      -0.365121692,
	      0.0944960266,
	      -0.0155025441,
	      0.00149879418
	    ],
	    [
	      -0.95105654,
	      0.309017,
	      0.856762767,
	      -0.509036958,
	      0.0826980695,
	      -0.724011958,
	      0.666583,
	      -0.175867945,
	      0.0233285148,
	      0.562436461,
	      -0.774062932,
	      0.28460595,
	      -0.0587005876,
	      0.00674331561,
	      -0.383626401,
	      0.825464487,
	      -0.398654133,
	      0.110181682,
	      -0.0192398224,
	      0.00197686534
	    ],
	    [
	      -0.945518553,
	      0.325568169,
	      0.841008067,
	      -0.533178449,
	      0.0917940363,
	      -0.694968879,
	      0.691815674,
	      -0.194074973,
	      0.0272813439,
	      0.519179404,
	      -0.792881131,
	      0.311553419,
	      -0.0682472,
	      0.00830829144,
	      -0.327633679,
	      0.830328882,
	      -0.43183586,
	      0.127145335,
	      -0.0235669315,
	      0.00256610778
	    ],
	    [
	      -0.939692616,
	      0.342020154,
	      0.824533343,
	      -0.556670427,
	      0.101305731,
	      -0.664884746,
	      0.715273559,
	      -0.212865278,
	      0.0316297,
	      0.474977732,
	      -0.808281064,
	      0.338809043,
	      -0.0786375329,
	      0.0101193069,
	      -0.271491736,
	      0.82988292,
	      -0.464367747,
	      0.145342931,
	      -0.0285271145,
	      0.00328339939
	    ],
	    [
	      -0.933580399,
	      0.35836795,
	      0.807358623,
	      -0.579484105,
	      0.111221552,
	      -0.633836746,
	      0.736898482,
	      -0.232180476,
	      0.0363854282,
	      0.430021763,
	      -0.820207298,
	      0.366217613,
	      -0.0898727924,
	      0.0121972151,
	      -0.215558439,
	      0.824165523,
	      -0.495953768,
	      0.164716139,
	      -0.0341612436,
	      0.00414678082
	    ],
	    [
	      -0.927183867,
	      0.37460658,
	      0.789504826,
	      -0.601591825,
	      0.12152943,
	      -0.601904333,
	      0.756637275,
	      -0.251960427,
	      0.0415591113,
	      0.384504348,
	      -0.828620732,
	      0.39362222,
	      -0.101948567,
	      0.0145628275,
	      -0.160187721,
	      0.813253164,
	      -0.526303351,
	      0.18519263,
	      -0.040507257,
	      0.00517538143
	    ],
	    [
	      -0.920504868,
	      0.390731126,
	      0.770993769,
	      -0.622966528,
	      0.132216811,
	      -0.569169283,
	      0.774441898,
	      -0.272143364,
	      0.0471600257,
	      0.338620067,
	      -0.833498836,
	      0.420865029,
	      -0.114854798,
	      0.0172367785,
	      -0.105727136,
	      0.797259331,
	      -0.55513376,
	      0.206686467,
	      -0.0475996137,
	      0.00638933061
	    ],
	    [
	      -0.91354543,
	      0.406736642,
	      0.751848,
	      -0.643582284,
	      0.143270656,
	      -0.535715163,
	      0.790269554,
	      -0.292666078,
	      0.0531961136,
	      0.292564303,
	      -0.834835649,
	      0.44778809,
	      -0.128575757,
	      0.0202393811,
	      -0.0525153,
	      0.776333511,
	      -0.582172155,
	      0.229098633,
	      -0.0554687865,
	      0.00780965388
	    ],
	    [
	      -0.906307817,
	      0.42261827,
	      0.732090712,
	      -0.663413942,
	      0.154677495,
	      -0.501627326,
	      0.80408287,
	      -0.313464135,
	      0.0596739501,
	      0.246532276,
	      -0.83264184,
	      0.474234223,
	      -0.143090084,
	      0.0235904958,
	      -0.000879568,
	      0.750660121,
	      -0.607158065,
	      0.252317607,
	      -0.064140752,
	      0.00945815817
	    ],
	    [
	      -0.898794055,
	      0.438371152,
	      0.711746097,
	      -0.68243736,
	      0.16642347,
	      -0.466992587,
	      0.8158499,
	      -0.334471971,
	      0.0665987208,
	      0.200718179,
	      -0.826944649,
	      0.500047624,
	      -0.158370793,
	      0.0273093823,
	      0.0488663204,
	      0.720456839,
	      -0.629845262,
	      0.276220232,
	      -0.0736365318,
	      0.0113573
	    ],
	    [
	      -0.891006529,
	      0.453990489,
	      0.690838933,
	      -0.700629294,
	      0.178494215,
	      -0.431898981,
	      0.825544238,
	      -0.355623156,
	      0.073974207,
	      0.155314222,
	      -0.817787707,
	      0.525074899,
	      -0.174385428,
	      0.0314145684,
	      0.0964244157,
	      0.685973167,
	      -0.650003791,
	      0.300672412,
	      -0.0839717537,
	      0.0135300411
	    ],
	    [
	      -0.882947564,
	      0.469471574,
	      0.669394672,
	      -0.71796757,
	      0.190875068,
	      -0.396435648,
	      0.833145082,
	      -0.376850545,
	      0.0818027481,
	      0.110509798,
	      -0.805230737,
	      0.549165547,
	      -0.191096097,
	      0.035923712,
	      0.141514659,
	      0.647488296,
	      -0.667421818,
	      0.325530231,
	      -0.0951562673,
	      0.0159996971
	    ],
	    [
	      -0.874619722,
	      0.484809607,
	      0.64743942,
	      -0.734431207,
	      0.203550935,
	      -0.360692352,
	      0.838637531,
	      -0.398086399,
	      0.0900852531,
	      0.0664905459,
	      -0.789349437,
	      0.572173119,
	      -0.208459631,
	      0.0408534706,
	      0.183876783,
	      0.60530889,
	      -0.681907594,
	      0.350640744,
	      -0.107193753,
	      0.0187897682
	    ],
	    [
	      -0.866025388,
	      0.5,
	      0.625,
	      -0.75,
	      0.216506347,
	      -0.324759513,
	      0.842012107,
	      -0.419262737,
	      0.0988211781,
	      0.0234375,
	      -0.770234823,
	      0.593955576,
	      -0.226427764,
	      0.046219375,
	      0.223272175,
	      0.559767127,
	      -0.693290591,
	      0.375843376,
	      -0.120081455,
	      0.021923773
	    ],
	    [
	      -0.857167304,
	      0.515038073,
	      0.602103651,
	      -0.764655054,
	      0.229725555,
	      -0.28872776,
	      0.843265295,
	      -0.440311372,
	      0.108008519,
	      -0.0184737556,
	      -0.747993112,
	      0.614376187,
	      -0.244947284,
	      0.0520356968,
	      0.259485394,
	      0.511217654,
	      -0.701423287,
	      0.400970876,
	      -0.133809894,
	      0.0254250597
	    ],
	    [
	      -0.848048091,
	      0.529919267,
	      0.578778386,
	      -0.778378487,
	      0.243192434,
	      -0.252687752,
	      0.84239924,
	      -0.461164147,
	      0.117643826,
	      -0.0590738878,
	      -0.722744823,
	      0.633304417,
	      -0.263960302,
	      0.0583153479,
	      0.292325705,
	      0.460035235,
	      -0.706182301,
	      0.425850779,
	      -0.148362651,
	      0.0293166153
	    ],
	    [
	      -0.838670552,
	      0.544639051,
	      0.555052459,
	      -0.79115355,
	      0.256890565,
	      -0.216729924,
	      0.839421868,
	      -0.481753141,
	      0.127722174,
	      -0.0982006,
	      -0.694624424,
	      0.650616169,
	      -0.283404499,
	      0.0650697425,
	      0.321628243,
	      0.406611711,
	      -0.707469344,
	      0.450306475,
	      -0.163716242,
	      0.0336208828
	    ],
	    [
	      -0.829037547,
	      0.559192896,
	      0.530954957,
	      -0.802964747,
	      0.270803303,
	      -0.180944279,
	      0.83434689,
	      -0.502010882,
	      0.138237208,
	      -0.135699391,
	      -0.663779497,
	      0.666194856,
	      -0.303213269,
	      0.0723087117,
	      0.34725523,
	      0.351353139,
	      -0.705212235,
	      0.474158853,
	      -0.179839924,
	      0.0383595526
	    ],
	    [
	      -0.819152057,
	      0.57357645,
	      0.506515086,
	      -0.813797653,
	      0.284913629,
	      -0.145420119,
	      0.827193558,
	      -0.521870494,
	      0.149181142,
	      -0.171424255,
	      -0.630370259,
	      0.67993176,
	      -0.323316187,
	      0.0800403953,
	      0.369096637,
	      0.294676661,
	      -0.699365437,
	      0.49722746,
	      -0.196695775,
	      0.0435533747
	    ],
	    [
	      -0.809017,
	      0.587785244,
	      0.481762737,
	      -0.823639095,
	      0.299204409,
	      -0.110245749,
	      0.817986846,
	      -0.541265905,
	      0.160544738,
	      -0.205238357,
	      -0.594568431,
	      0.691726744,
	      -0.343639225,
	      0.0882711485,
	      0.387070984,
	      0.237007394,
	      -0.68991071,
	      0.519332051,
	      -0.214238584,
	      0.0492219403
	    ],
	    [
	      -0.798635483,
	      0.601815045,
	      0.456728,
	      -0.832477033,
	      0.313658237,
	      -0.0755083486,
	      0.80675739,
	      -0.560131907,
	      0.172317386,
	      -0.237014621,
	      -0.556556761,
	      0.701488495,
	      -0.364105076,
	      0.0970054492,
	      0.40112561,
	      0.178775176,
	      -0.676857054,
	      0.540294051,
	      -0.232415989,
	      0.0553835034
	    ],
	    [
	      -0.788010776,
	      0.615661502,
	      0.431441426,
	      -0.840300739,
	      0.328257442,
	      -0.0412936322,
	      0.793541074,
	      -0.578404605,
	      0.184487075,
	      -0.266636372,
	      -0.516527653,
	      0.709135473,
	      -0.384633511,
	      0.106245846,
	      0.411237091,
	      0.120411336,
	      -0.660241187,
	      0.559937775,
	      -0.251168609,
	      0.0620547719
	    ],
	    [
	      -0.777146,
	      0.629320383,
	      0.405933768,
	      -0.847100675,
	      0.342984289,
	      -0.00768567342,
	      0.778379381,
	      -0.596021354,
	      0.197040468,
	      -0.293997765,
	      -0.474682748,
	      0.714596,
	      -0.405141771,
	      0.115992859,
	      0.417411059,
	      0.0623455457,
	      -0.640126824,
	      0.578092158,
	      -0.270430148,
	      0.0692507252
	    ],
	    [
	      -0.766044438,
	      0.642787635,
	      0.380236119,
	      -0.852868557,
	      0.357820839,
	      0.0252333339,
	      0.761319,
	      -0.612921119,
	      0.209962875,
	      -0.319004357,
	      -0.431231558,
	      0.717808664,
	      -0.425545,
	      0.126244947,
	      0.419682056,
	      0.00500250375,
	      -0.616604924,
	      0.594592,
	      -0.290127724,
	      0.0769844055
	    ],
	    [
	      -0.754709601,
	      0.656059,
	      0.354379833,
	      -0.857597291,
	      0.372748971,
	      0.0573833026,
	      0.742411554,
	      -0.629044473,
	      0.223238334,
	      -0.341573387,
	      -0.386390567,
	      0.71872288,
	      -0.445756465,
	      0.13699846,
	      0.418113053,
	      -0.0512011871,
	      -0.589792609,
	      0.609279215,
	      -0.310182154,
	      0.0852667838
	    ],
	    [
	      -0.74314481,
	      0.669130623,
	      0.32839635,
	      -0.861281216,
	      0.387750536,
	      0.0886864737,
	      0.721713901,
	      -0.64433378,
	      0.236849621,
	      -0.361634314,
	      -0.340382189,
	      0.717299,
	      -0.465688139,
	      0.148247585,
	      0.412794828,
	      -0.105860129,
	      -0.559832633,
	      0.622004569,
	      -0.330508262,
	      0.0941065326
	    ],
	    [
	      -0.7313537,
	      0.681998372,
	      0.302317351,
	      -0.863915801,
	      0.402807266,
	      0.119067609,
	      0.699287713,
	      -0.658733487,
	      0.250778317,
	      -0.379128963,
	      -0.293433666,
	      0.713508487,
	      -0.485251039,
	      0.159984291,
	      0.403845161,
	      -0.158583134,
	      -0.526892304,
	      0.63262856,
	      -0.351015329,
	      0.10350991
	    ],
	    [
	      -0.719339788,
	      0.694658399,
	      0.276174635,
	      -0.865497828,
	      0.417900771,
	      0.148454204,
	      0.675199151,
	      -0.672190368,
	      0.265004843,
	      -0.394011736,
	      -0.245775878,
	      0.707334399,
	      -0.504355729,
	      0.1721984,
	      0.391407639,
	      -0.208996147,
	      -0.49116233,
	      0.641022801,
	      -0.371607512,
	      0.113480605
	    ],
	    [
	      -0.707106769,
	      0.707106769,
	      0.25,
	      -0.866025388,
	      0.433012694,
	      0.176776692,
	      0.649519,
	      -0.684653223,
	      0.279508501,
	      -0.40625,
	      -0.197642356,
	      0.698771238,
	      -0.522912502,
	      0.1848775,
	      0.375650465,
	      -0.256744951,
	      -0.452855527,
	      0.647071242,
	      -0.392184377,
	      0.124019593
	    ],
	    [
	      -0.694658399,
	      0.719339788,
	      0.22382538,
	      -0.865497828,
	      0.448124617,
	      0.203968629,
	      0.622322381,
	      -0.696073472,
	      0.294267476,
	      -0.415823936,
	      -0.149268031,
	      0.687825,
	      -0.540832222,
	      0.198006928,
	      0.356765121,
	      -0.301497817,
	      -0.41220516,
	      0.650671065,
	      -0.412641525,
	      0.135125011
	    ],
	    [
	      -0.681998372,
	      0.7313537,
	      0.197682649,
	      -0.863915801,
	      0.463218153,
	      0.229966834,
	      0.593688309,
	      -0.706405222,
	      0.309259027,
	      -0.42272675,
	      -0.100888163,
	      0.674513459,
	      -0.558026433,
	      0.211569905,
	      0.334964633,
	      -0.34294793,
	      -0.369463414,
	      0.651733816,
	      -0.432870984,
	      0.146792069
	    ],
	    [
	      -0.669130623,
	      0.74314481,
	      0.17160365,
	      -0.861281216,
	      0.478274852,
	      0.254711658,
	      0.563699722,
	      -0.71560514,
	      0.324459404,
	      -0.426964611,
	      -0.0527371019,
	      0.65886575,
	      -0.574407756,
	      0.225547418,
	      0.310481846,
	      -0.380815536,
	      -0.324899465,
	      0.65018636,
	      -0.452762038,
	      0.159012988
	    ],
	    [
	      -0.656059,
	      0.754709601,
	      0.145620167,
	      -0.857597291,
	      0.493276417,
	      0.278146982,
	      0.532443225,
	      -0.723632872,
	      0.339844,
	      -0.428556591,
	      -0.00504725659,
	      0.640922725,
	      -0.589890659,
	      0.239918366,
	      0.283567578,
	      -0.414850116,
	      -0.278797477,
	      0.645971298,
	      -0.472201824,
	      0.171776831
	    ],
	    [
	      -0.642787635,
	      0.766044438,
	      0.119763866,
	      -0.852868557,
	      0.508204579,
	      0.300220519,
	      0.500008881,
	      -0.730451,
	      0.3553873,
	      -0.427534461,
	      0.0419521108,
	      0.620736361,
	      -0.604391634,
	      0.254659504,
	      0.254488528,
	      -0.444832,
	      -0.231454641,
	      0.6390481,
	      -0.491075933,
	      0.185069621
	    ],
	    [
	      -0.629320383,
	      0.777146,
	      0.0940662324,
	      -0.847100675,
	      0.523041129,
	      0.32088393,
	      0.466489762,
	      -0.736025095,
	      0.371063113,
	      -0.423942566,
	      0.0880359635,
	      0.598369777,
	      -0.617829442,
	      0.269745618,
	      0.223525122,
	      -0.470574051,
	      -0.183178872,
	      0.629393339,
	      -0.509269297,
	      0.198874116
	    ],
	    [
	      -0.615661502,
	      0.788010776,
	      0.0685585812,
	      -0.840300739,
	      0.537767947,
	      0.340092868,
	      0.431981891,
	      -0.74032414,
	      0.386844516,
	      -0.41783756,
	      0.132984594,
	      0.573897,
	      -0.630126059,
	      0.285149485,
	      0.190969393,
	      -0.491922885,
	      -0.134286612,
	      0.617001176,
	      -0.526666701,
	      0.213169962
	    ],
	    [
	      -0.601815045,
	      0.798635483,
	      0.0432719849,
	      -0.832477033,
	      0.552367151,
	      0.35780713,
	      0.396583915,
	      -0.743320107,
	      0.402703911,
	      -0.409288,
	      0.176584691,
	      0.547402501,
	      -0.641206503,
	      0.300842017,
	      0.157122463,
	      -0.50876,
	      -0.0851004198,
	      0.601883709,
	      -0.543153763,
	      0.227933615
	    ],
	    [
	      -0.587785244,
	      0.809017,
	      0.0182372537,
	      -0.823639095,
	      0.566821,
	      0.373990864,
	      0.360396802,
	      -0.744988561,
	      0.418613225,
	      -0.398374,
	      0.218630359,
	      0.518981,
	      -0.650999486,
	      0.316792309,
	      0.122292347,
	      -0.521002412,
	      -0.0359466225,
	      0.584071159,
	      -0.558617532,
	      0.243138373
	    ],
	    [
	      -0.57357645,
	      0.819152057,
	      -0.00651510758,
	      -0.813797653,
	      0.581111789,
	      0.388612479,
	      0.323523581,
	      -0.74530834,
	      0.434543818,
	      -0.385186851,
	      0.258924127,
	      0.488736719,
	      -0.659437895,
	      0.332967699,
	      0.0867913961,
	      -0.528603256,
	      0.0128471432,
	      0.563611865,
	      -0.572947264,
	      0.258754492
	    ],
	    [
	      -0.559192896,
	      0.829037547,
	      -0.0309549458,
	      -0.802964747,
	      0.595222116,
	      0.401644915,
	      0.286069185,
	      -0.744261742,
	      0.450466663,
	      -0.369828522,
	      0.297277898,
	      0.456783414,
	      -0.666458845,
	      0.349334031,
	      0.0509339347,
	      -0.531552,
	      0.0609543584,
	      0.540572166,
	      -0.586035311,
	      0.27474916
	    ],
	    [
	      -0.544639051,
	      0.838670552,
	      -0.0550524816,
	      -0.79115355,
	      0.609134853,
	      0.413065583,
	      0.248139873,
	      -0.741834819,
	      0.466352403,
	      -0.352411,
	      0.333513856,
	      0.423243493,
	      -0.672004223,
	      0.365855545,
	      0.0150337582,
	      -0.529874325,
	      0.108052082,
	      0.515036285,
	      -0.597777665,
	      0.291086674
	    ],
	    [
	      -0.529919267,
	      0.848048091,
	      -0.0787783638,
	      -0.778378487,
	      0.622832954,
	      0.42285645,
	      0.209843263,
	      -0.738016903,
	      0.482171416,
	      -0.333055854,
	      0.367465287,
	      0.38824749,
	      -0.676021,
	      0.382495195,
	      -0.0205982868,
	      -0.523631871,
	      0.153823346,
	      0.487105817,
	      -0.608074725,
	      0.307728499
	    ],
	    [
	      -0.515038073,
	      0.857167304,
	      -0.102103673,
	      -0.764655054,
	      0.636299849,
	      0.431004167,
	      0.171287775,
	      -0.732801199,
	      0.4978939,
	      -0.311893493,
	      0.398977429,
	      0.351933628,
	      -0.678461432,
	      0.399214596,
	      -0.0556567125,
	      -0.512921512,
	      0.197959587,
	      0.456899434,
	      -0.616832137,
	      0.324633449
	    ],
	    [
	      -0.5,
	      0.866025388,
	      -0.125,
	      -0.75,
	      0.649519,
	      0.4375,
	      0.132582515,
	      -0.726184368,
	      0.513489902,
	      -0.2890625,
	      0.427908242,
	      0.314447045,
	      -0.679283261,
	      0.415974349,
	      -0.08984375,
	      -0.497874498,
	      0.240162909,
	      0.424552053,
	      -0.623961568,
	      0.341757804
	    ],
	    [
	      -0.484809607,
	      0.874619722,
	      -0.14743945,
	      -0.734431207,
	      0.662474453,
	      0.442339838,
	      0.0938368812,
	      -0.718166888,
	      0.528929472,
	      -0.264709,
	      0.454128981,
	      0.275939256,
	      -0.678450286,
	      0.432734042,
	      -0.122871645,
	      -0.478655517,
	      0.280148357,
	      0.390214294,
	      -0.629380882,
	      0.359055489
	    ],
	    [
	      -0.469471574,
	      0.882947564,
	      -0.169394672,
	      -0.71796757,
	      0.675150335,
	      0.445524335,
	      0.0551602542,
	      -0.708752811,
	      0.544182777,
	      -0.238985762,
	      0.477524847,
	      0.236567229,
	      -0.675932169,
	      0.44945243,
	      -0.154464841,
	      -0.455460936,
	      0.317646116,
	      0.354051501,
	      -0.633015394,
	      0.376478285
	    ],
	    [
	      -0.453990489,
	      0.891006529,
	      -0.190838933,
	      -0.700629294,
	      0.687531173,
	      0.447058767,
	      0.0166617651,
	      -0.697949767,
	      0.559219956,
	      -0.212051556,
	      0.497995645,
	      0.19649294,
	      -0.671704769,
	      0.46608761,
	      -0.184362113,
	      -0.428517491,
	      0.352403462,
	      0.316242844,
	      -0.63479805,
	      0.393975943
	    ],
	    [
	      -0.438371152,
	      0.898794055,
	      -0.211746112,
	      -0.68243736,
	      0.699601948,
	      0.446953058,
	      -0.0215500612,
	      -0.6857692,
	      0.574011445,
	      -0.184070244,
	      0.51545608,
	      0.155882403,
	      -0.665750563,
	      0.482597172,
	      -0.212318495,
	      -0.39808017,
	      0.384186774,
	      0.276980251,
	      -0.63467,
	      0.41149658
	    ],
	    [
	      -0.42261827,
	      0.906307817,
	      -0.232090712,
	      -0.663413942,
	      0.711347878,
	      0.445221782,
	      -0.0593675859,
	      -0.672226,
	      0.588528037,
	      -0.155209973,
	      0.529836178,
	      0.114905022,
	      -0.658058405,
	      0.498938352,
	      -0.238107204,
	      -0.364430279,
	      0.412783265,
	      0.236467153,
	      -0.632581353,
	      0.428986728
	    ],
	    [
	      -0.406736642,
	      0.91354543,
	      -0.251847953,
	      -0.643582284,
	      0.722754776,
	      0.441884071,
	      -0.0966843441,
	      -0.657338798,
	      0.602740645,
	      -0.125642315,
	      0.541081905,
	      0.0737327188,
	      -0.648623705,
	      0.515068114,
	      -0.26152125,
	      -0.327873081,
	      0.438002616,
	      0.194917336,
	      -0.628491282,
	      0.446391702
	    ],
	    [
	      -0.390731126,
	      0.920504868,
	      -0.270993769,
	      -0.622966528,
	      0.733808577,
	      0.436963588,
	      -0.133395374,
	      -0.641129553,
	      0.616620898,
	      -0.0955414,
	      0.549154818,
	      0.0325391926,
	      -0.637448788,
	      0.530943573,
	      -0.282375067,
	      -0.28873542,
	      0.459678471,
	      0.152553529,
	      -0.622368515,
	      0.4636558
	    ],
	    [
	      -0.37460658,
	      0.927183867,
	      -0.289504856,
	      -0.601591825,
	      0.744496,
	      0.430488437,
	      -0.169397429,
	      -0.623623908,
	      0.630140781,
	      -0.0650830269,
	      0.554032922,
	      -0.00850094855,
	      -0.624542534,
	      0.546521783,
	      -0.300505787,
	      -0.247362956,
	      0.477669626,
	      0.109606,
	      -0.614192,
	      0.480722666
	    ],
	    [
	      -0.35836795,
	      0.933580399,
	      -0.307358623,
	      -0.579484105,
	      0.754803836,
	      0.422491103,
	      -0.204589352,
	      -0.604850829,
	      0.643272877,
	      -0.0344437547,
	      0.555710196,
	      -0.0492129587,
	      -0.60992074,
	      0.561760247,
	      -0.3157745,
	      -0.204117492,
	      0.491861343,
	      0.0663111061,
	      -0.60395056,
	      0.497535378
	    ],
	    [
	      -0.342020154,
	      0.939692616,
	      -0.324533343,
	      -0.556670427,
	      0.764719665,
	      0.413008332,
	      -0.238872305,
	      -0.584842563,
	      0.655990362,
	      -0.00380004128,
	      0.554196954,
	      -0.0894228071,
	      -0.593605816,
	      0.576616824,
	      -0.328067213,
	      -0.159374073,
	      0.502166,
	      0.0229097549,
	      -0.591643691,
	      0.514037
	    ],
	    [
	      -0.325568169,
	      0.945518553,
	      -0.341008067,
	      -0.533178449,
	      0.774231374,
	      0.402081043,
	      -0.27215004,
	      -0.563634634,
	      0.66826731,
	      0.0266726762,
	      0.549519598,
	      -0.128957972,
	      -0.575626969,
	      0.591050088,
	      -0.337295622,
	      -0.113517947,
	      0.508523881,
	      -0.0203541834,
	      -0.577281296,
	      0.53017056
	    ],
	    [
	      -0.309017,
	      0.95105654,
	      -0.356762737,
	      -0.509036958,
	      0.783327341,
	      0.389754236,
	      -0.304329157,
	      -0.541265905,
	      0.680078387,
	      0.0568008572,
	      0.54172039,
	      -0.167648286,
	      -0.556019962,
	      0.60501945,
	      -0.343397766,
	      -0.066941604,
	      0.510903835,
	      -0.0632354543,
	      -0.56088388,
	      0.545879662
	    ],
	    [
	      -0.29237169,
	      0.956304729,
	      -0.37177819,
	      -0.484275252,
	      0.791996479,
	      0.376076847,
	      -0.3353194,
	      -0.517778039,
	      0.691399336,
	      0.0864137411,
	      0.530857623,
	      -0.205326691,
	      -0.534827,
	      0.618485153,
	      -0.346338362,
	      -0.0200415589,
	      0.509303331,
	      -0.105489045,
	      -0.542482674,
	      0.56110853
	    ],
	    [
	      -0.275637358,
	      0.96126169,
	      -0.386036068,
	      -0.458923548,
	      0.800228298,
	      0.361101508,
	      -0.365033895,
	      -0.493215799,
	      0.702206612,
	      0.115344189,
	      0.517004728,
	      -0.241830081,
	      -0.512096763,
	      0.631408751,
	      -0.346108913,
	      0.0267847329,
	      0.503748655,
	      -0.14687179,
	      -0.522119522,
	      0.575802386
	    ],
	    [
	      -0.258819044,
	      0.965925813,
	      -0.399519056,
	      -0.433012694,
	      0.808012724,
	      0.344884604,
	      -0.393389285,
	      -0.46762684,
	      0.712477803,
	      0.143429562,
	      0.500250399,
	      -0.277,
	      -0.487884,
	      0.643752813,
	      -0.34272781,
	      0.0731420219,
	      0.494294673,
	      -0.187144,
	      -0.499846488,
	      0.589907885
	    ],
	    [
	      -0.241921902,
	      0.970295727,
	      -0.412210703,
	      -0.406574309,
	      0.815340221,
	      0.327485919,
	      -0.420306176,
	      -0.441061407,
	      0.722191513,
	      0.170512497,
	      0.480697811,
	      -0.310683519,
	      -0.462249607,
	      0.655481577,
	      -0.33624,
	      0.118640393,
	      0.481024653,
	      -0.22607109,
	      -0.475726068,
	      0.603373
	    ],
	    [
	      -0.224951059,
	      0.974370062,
	      -0.424095541,
	      -0.379640549,
	      0.822201967,
	      0.308968604,
	      -0.445709109,
	      -0.413572371,
	      0.731327355,
	      0.196441725,
	      0.458464354,
	      -0.342733771,
	      -0.435260117,
	      0.666560769,
	      -0.326716483,
	      0.162898347,
	      0.464049429,
	      -0.263425082,
	      -0.449830651,
	      0.616147876
	    ],
	    [
	      -0.207911685,
	      0.978147626,
	      -0.435159087,
	      -0.352244258,
	      0.828589499,
	      0.289398909,
	      -0.469526976,
	      -0.385215133,
	      0.739866197,
	      0.221072838,
	      0.433680743,
	      -0.373010814,
	      -0.406987548,
	      0.676957846,
	      -0.314253658,
	      0.205545768,
	      0.443506926,
	      -0.298986197,
	      -0.422242343,
	      0.628184557
	    ],
	    [
	      -0.190809,
	      0.981627166,
	      -0.4453879,
	      -0.324418813,
	      0.834495068,
	      0.268846035,
	      -0.491693079,
	      -0.356047243,
	      0.747790158,
	      0.244269,
	      0.406490564,
	      -0.401382178,
	      -0.377509266,
	      0.686642,
	      -0.298972517,
	      0.246226907,
	      0.419560939,
	      -0.332544327,
	      -0.393052399,
	      0.639437616
	    ],
	    [
	      -0.173648179,
	      0.98480773,
	      -0.454769462,
	      -0.29619813,
	      0.83991152,
	      0.24738194,
	      -0.51214534,
	      -0.326128513,
	      0.755082488,
	      0.265901625,
	      0.377049536,
	      -0.427723587,
	      -0.346907467,
	      0.695584476,
	      -0.281017542,
	      0.284603089,
	      0.392400086,
	      -0.363900453,
	      -0.362360924,
	      0.649864137
	    ],
	    [
	      -0.156434461,
	      0.987688363,
	      -0.46329239,
	      -0.26761657,
	      0.844832242,
	      0.225081131,
	      -0.530826509,
	      -0.295520723,
	      0.76172775,
	      0.285851,
	      0.345524579,
	      -0.451919466,
	      -0.315269,
	      0.703758657,
	      -0.260555416,
	      0.320355445,
	      0.36223641,
	      -0.392867953,
	      -0.33027631,
	      0.659424245
	    ],
	    [
	      -0.139173105,
	      0.990268052,
	      -0.470946282,
	      -0.238708958,
	      0.849251211,
	      0.202020496,
	      -0.547684371,
	      -0.264287412,
	      0.767712,
	      0.304007024,
	      0.312093109,
	      -0.473863572,
	      -0.282684922,
	      0.711140037,
	      -0.237773672,
	      0.353187382,
	      0.32930389,
	      -0.419273943,
	      -0.296914697,
	      0.668081045
	    ],
	    [
	      -0.121869341,
	      0.992546141,
	      -0.477721781,
	      -0.209510505,
	      0.853163064,
	      0.178278968,
	      -0.562671661,
	      -0.232493877,
	      0.773022532,
	      0.320269555,
	      0.276942104,
	      -0.493459404,
	      -0.249250263,
	      0.717706501,
	      -0.212879047,
	      0.382826924,
	      0.29385671,
	      -0.442960411,
	      -0.262399256,
	      0.675801039
	    ],
	    [
	      -0.104528464,
	      0.994521916,
	      -0.48361069,
	      -0.18005681,
	      0.856563032,
	      0.153937444,
	      -0.575746536,
	      -0.200206831,
	      0.777648,
	      0.33454904,
	      0.240267202,
	      -0.510620713,
	      -0.215063468,
	      0.723438203,
	      -0.186095774,
	      0.409028858,
	      0.256167382,
	      -0.463785231,
	      -0.226859644,
	      0.682554
	    ],
	    [
	      -0.0871557444,
	      0.99619472,
	      -0.488605827,
	      -0.150383726,
	      0.859446943,
	      0.129078493,
	      -0.586872399,
	      -0.167494327,
	      0.78157866,
	      0.346766979,
	      0.202271596,
	      -0.525271893,
	      -0.180226117,
	      0.728317797,
	      -0.157663718,
	      0.43157658,
	      0.216524854,
	      -0.481623262,
	      -0.190431237,
	      0.688313723
	    ],
	    [
	      -0.0697564706,
	      0.997564077,
	      -0.492701054,
	      -0.120527439,
	      0.86181134,
	      0.103786126,
	      -0.596018076,
	      -0.134425521,
	      0.784806132,
	      0.356856227,
	      0.163165152,
	      -0.53734839,
	      -0.144842461,
	      0.73233062,
	      -0.127836362,
	      0.450283945,
	      0.175232336,
	      -0.496367127,
	      -0.153254405,
	      0.693057477
	    ],
	    [
	      -0.0523359552,
	      0.99862951,
	      -0.495891422,
	      -0.0905243,
	      0.863653302,
	      0.0781455562,
	      -0.603158116,
	      -0.101070546,
	      0.787323534,
	      0.364761382,
	      0.123163298,
	      -0.546796918,
	      -0.109019056,
	      0.735464394,
	      -0.0968786925,
	      0.464996517,
	      0.132605106,
	      -0.507927895,
	      -0.115473703,
	      0.696766615
	    ],
	    [
	      -0.0348994955,
	      0.999390841,
	      -0.498173028,
	      -0.0604108796,
	      0.864970624,
	      0.0522429794,
	      -0.608272374,
	      -0.0675002709,
	      0.789125502,
	      0.370439082,
	      0.0824859142,
	      -0.553575873,
	      -0.0728642121,
	      0.737709641,
	      -0.0650650337,
	      0.475593,
	      0.0889681876,
	      -0.516235888,
	      -0.0772370845,
	      0.699426532
	    ],
	    [
	      -0.0174524058,
	      0.99984771,
	      -0.49954313,
	      -0.0302238502,
	      0.865761638,
	      0.0261653196,
	      -0.611346722,
	      -0.0337861441,
	      0.79020822,
	      0.373858213,
	      0.0413563,
	      -0.557655215,
	      -0.0364876501,
	      0.739059567,
	      -0.0326767601,
	      0.481986046,
	      0.0446540304,
	      -0.52124083,
	      -0.0386951044,
	      0.701026678
	    ],
	    [
	      0,
	      1,
	      -0.5,
	      0,
	      0.866025388,
	      0,
	      -0.612372458,
	      0,
	      0.790569425,
	      0.375,
	      0,
	      -0.559017,
	      0,
	      0.73951,
	      0,
	      0.484122932,
	      0,
	      -0.522912502,
	      0,
	      0.701560736
	    ],
	    [
	      0.0174524058,
	      0.99984771,
	      -0.49954313,
	      0.0302238502,
	      0.865761638,
	      -0.0261653196,
	      -0.611346722,
	      0.0337861441,
	      0.79020822,
	      0.373858213,
	      -0.0413563,
	      -0.557655215,
	      0.0364876501,
	      0.739059567,
	      0.0326767601,
	      0.481986046,
	      -0.0446540304,
	      -0.52124083,
	      0.0386951044,
	      0.701026678
	    ],
	    [
	      0.0348994955,
	      0.999390841,
	      -0.498173028,
	      0.0604108796,
	      0.864970624,
	      -0.0522429794,
	      -0.608272374,
	      0.0675002709,
	      0.789125502,
	      0.370439082,
	      -0.0824859142,
	      -0.553575873,
	      0.0728642121,
	      0.737709641,
	      0.0650650337,
	      0.475593,
	      -0.0889681876,
	      -0.516235888,
	      0.0772370845,
	      0.699426532
	    ],
	    [
	      0.0523359552,
	      0.99862951,
	      -0.495891422,
	      0.0905243,
	      0.863653302,
	      -0.0781455562,
	      -0.603158116,
	      0.101070546,
	      0.787323534,
	      0.364761382,
	      -0.123163298,
	      -0.546796918,
	      0.109019056,
	      0.735464394,
	      0.0968786925,
	      0.464996517,
	      -0.132605106,
	      -0.507927895,
	      0.115473703,
	      0.696766615
	    ],
	    [
	      0.0697564706,
	      0.997564077,
	      -0.492701054,
	      0.120527439,
	      0.86181134,
	      -0.103786126,
	      -0.596018076,
	      0.134425521,
	      0.784806132,
	      0.356856227,
	      -0.163165152,
	      -0.53734839,
	      0.144842461,
	      0.73233062,
	      0.127836362,
	      0.450283945,
	      -0.175232336,
	      -0.496367127,
	      0.153254405,
	      0.693057477
	    ],
	    [
	      0.0871557444,
	      0.99619472,
	      -0.488605827,
	      0.150383726,
	      0.859446943,
	      -0.129078493,
	      -0.586872399,
	      0.167494327,
	      0.78157866,
	      0.346766979,
	      -0.202271596,
	      -0.525271893,
	      0.180226117,
	      0.728317797,
	      0.157663718,
	      0.43157658,
	      -0.216524854,
	      -0.481623262,
	      0.190431237,
	      0.688313723
	    ],
	    [
	      0.104528464,
	      0.994521916,
	      -0.48361069,
	      0.18005681,
	      0.856563032,
	      -0.153937444,
	      -0.575746536,
	      0.200206831,
	      0.777648,
	      0.33454904,
	      -0.240267202,
	      -0.510620713,
	      0.215063468,
	      0.723438203,
	      0.186095774,
	      0.409028858,
	      -0.256167382,
	      -0.463785231,
	      0.226859644,
	      0.682554
	    ],
	    [
	      0.121869341,
	      0.992546141,
	      -0.477721781,
	      0.209510505,
	      0.853163064,
	      -0.178278968,
	      -0.562671661,
	      0.232493877,
	      0.773022532,
	      0.320269555,
	      -0.276942104,
	      -0.493459404,
	      0.249250263,
	      0.717706501,
	      0.212879047,
	      0.382826924,
	      -0.29385671,
	      -0.442960411,
	      0.262399256,
	      0.675801039
	    ],
	    [
	      0.139173105,
	      0.990268052,
	      -0.470946282,
	      0.238708958,
	      0.849251211,
	      -0.202020496,
	      -0.547684371,
	      0.264287412,
	      0.767712,
	      0.304007024,
	      -0.312093109,
	      -0.473863572,
	      0.282684922,
	      0.711140037,
	      0.237773672,
	      0.353187382,
	      -0.32930389,
	      -0.419273943,
	      0.296914697,
	      0.668081045
	    ],
	    [
	      0.156434461,
	      0.987688363,
	      -0.46329239,
	      0.26761657,
	      0.844832242,
	      -0.225081131,
	      -0.530826509,
	      0.295520723,
	      0.76172775,
	      0.285851,
	      -0.345524579,
	      -0.451919466,
	      0.315269,
	      0.703758657,
	      0.260555416,
	      0.320355445,
	      -0.36223641,
	      -0.392867953,
	      0.33027631,
	      0.659424245
	    ],
	    [
	      0.173648179,
	      0.98480773,
	      -0.454769462,
	      0.29619813,
	      0.83991152,
	      -0.24738194,
	      -0.51214534,
	      0.326128513,
	      0.755082488,
	      0.265901625,
	      -0.377049536,
	      -0.427723587,
	      0.346907467,
	      0.695584476,
	      0.281017542,
	      0.284603089,
	      -0.392400086,
	      -0.363900453,
	      0.362360924,
	      0.649864137
	    ],
	    [
	      0.190809,
	      0.981627166,
	      -0.4453879,
	      0.324418813,
	      0.834495068,
	      -0.268846035,
	      -0.491693079,
	      0.356047243,
	      0.747790158,
	      0.244269,
	      -0.406490564,
	      -0.401382178,
	      0.377509266,
	      0.686642,
	      0.298972517,
	      0.246226907,
	      -0.419560939,
	      -0.332544327,
	      0.393052399,
	      0.639437616
	    ],
	    [
	      0.207911685,
	      0.978147626,
	      -0.435159087,
	      0.352244258,
	      0.828589499,
	      -0.289398909,
	      -0.469526976,
	      0.385215133,
	      0.739866197,
	      0.221072838,
	      -0.433680743,
	      -0.373010814,
	      0.406987548,
	      0.676957846,
	      0.314253658,
	      0.205545768,
	      -0.443506926,
	      -0.298986197,
	      0.422242343,
	      0.628184557
	    ],
	    [
	      0.224951059,
	      0.974370062,
	      -0.424095541,
	      0.379640549,
	      0.822201967,
	      -0.308968604,
	      -0.445709109,
	      0.413572371,
	      0.731327355,
	      0.196441725,
	      -0.458464354,
	      -0.342733771,
	      0.435260117,
	      0.666560769,
	      0.326716483,
	      0.162898347,
	      -0.464049429,
	      -0.263425082,
	      0.449830651,
	      0.616147876
	    ],
	    [
	      0.241921902,
	      0.970295727,
	      -0.412210703,
	      0.406574309,
	      0.815340221,
	      -0.327485919,
	      -0.420306176,
	      0.441061407,
	      0.722191513,
	      0.170512497,
	      -0.480697811,
	      -0.310683519,
	      0.462249607,
	      0.655481577,
	      0.33624,
	      0.118640393,
	      -0.481024653,
	      -0.22607109,
	      0.475726068,
	      0.603373
	    ],
	    [
	      0.258819044,
	      0.965925813,
	      -0.399519056,
	      0.433012694,
	      0.808012724,
	      -0.344884604,
	      -0.393389285,
	      0.46762684,
	      0.712477803,
	      0.143429562,
	      -0.500250399,
	      -0.277,
	      0.487884,
	      0.643752813,
	      0.34272781,
	      0.0731420219,
	      -0.494294673,
	      -0.187144,
	      0.499846488,
	      0.589907885
	    ],
	    [
	      0.275637358,
	      0.96126169,
	      -0.386036068,
	      0.458923548,
	      0.800228298,
	      -0.361101508,
	      -0.365033895,
	      0.493215799,
	      0.702206612,
	      0.115344189,
	      -0.517004728,
	      -0.241830081,
	      0.512096763,
	      0.631408751,
	      0.346108913,
	      0.0267847329,
	      -0.503748655,
	      -0.14687179,
	      0.522119522,
	      0.575802386
	    ],
	    [
	      0.29237169,
	      0.956304729,
	      -0.37177819,
	      0.484275252,
	      0.791996479,
	      -0.376076847,
	      -0.3353194,
	      0.517778039,
	      0.691399336,
	      0.0864137411,
	      -0.530857623,
	      -0.205326691,
	      0.534827,
	      0.618485153,
	      0.346338362,
	      -0.0200415589,
	      -0.509303331,
	      -0.105489045,
	      0.542482674,
	      0.56110853
	    ],
	    [
	      0.309017,
	      0.95105654,
	      -0.356762737,
	      0.509036958,
	      0.783327341,
	      -0.389754236,
	      -0.304329157,
	      0.541265905,
	      0.680078387,
	      0.0568008572,
	      -0.54172039,
	      -0.167648286,
	      0.556019962,
	      0.60501945,
	      0.343397766,
	      -0.066941604,
	      -0.510903835,
	      -0.0632354543,
	      0.56088388,
	      0.545879662
	    ],
	    [
	      0.325568169,
	      0.945518553,
	      -0.341008067,
	      0.533178449,
	      0.774231374,
	      -0.402081043,
	      -0.27215004,
	      0.563634634,
	      0.66826731,
	      0.0266726762,
	      -0.549519598,
	      -0.128957972,
	      0.575626969,
	      0.591050088,
	      0.337295622,
	      -0.113517947,
	      -0.508523881,
	      -0.0203541834,
	      0.577281296,
	      0.53017056
	    ],
	    [
	      0.342020154,
	      0.939692616,
	      -0.324533343,
	      0.556670427,
	      0.764719665,
	      -0.413008332,
	      -0.238872305,
	      0.584842563,
	      0.655990362,
	      -0.00380004128,
	      -0.554196954,
	      -0.0894228071,
	      0.593605816,
	      0.576616824,
	      0.328067213,
	      -0.159374073,
	      -0.502166,
	      0.0229097549,
	      0.591643691,
	      0.514037
	    ],
	    [
	      0.35836795,
	      0.933580399,
	      -0.307358623,
	      0.579484105,
	      0.754803836,
	      -0.422491103,
	      -0.204589352,
	      0.604850829,
	      0.643272877,
	      -0.0344437547,
	      -0.555710196,
	      -0.0492129587,
	      0.60992074,
	      0.561760247,
	      0.3157745,
	      -0.204117492,
	      -0.491861343,
	      0.0663111061,
	      0.60395056,
	      0.497535378
	    ],
	    [
	      0.37460658,
	      0.927183867,
	      -0.289504856,
	      0.601591825,
	      0.744496,
	      -0.430488437,
	      -0.169397429,
	      0.623623908,
	      0.630140781,
	      -0.0650830269,
	      -0.554032922,
	      -0.00850094855,
	      0.624542534,
	      0.546521783,
	      0.300505787,
	      -0.247362956,
	      -0.477669626,
	      0.109606,
	      0.614192,
	      0.480722666
	    ],
	    [
	      0.390731126,
	      0.920504868,
	      -0.270993769,
	      0.622966528,
	      0.733808577,
	      -0.436963588,
	      -0.133395374,
	      0.641129553,
	      0.616620898,
	      -0.0955414,
	      -0.549154818,
	      0.0325391926,
	      0.637448788,
	      0.530943573,
	      0.282375067,
	      -0.28873542,
	      -0.459678471,
	      0.152553529,
	      0.622368515,
	      0.4636558
	    ],
	    [
	      0.406736642,
	      0.91354543,
	      -0.251847953,
	      0.643582284,
	      0.722754776,
	      -0.441884071,
	      -0.0966843441,
	      0.657338798,
	      0.602740645,
	      -0.125642315,
	      -0.541081905,
	      0.0737327188,
	      0.648623705,
	      0.515068114,
	      0.26152125,
	      -0.327873081,
	      -0.438002616,
	      0.194917336,
	      0.628491282,
	      0.446391702
	    ],
	    [
	      0.42261827,
	      0.906307817,
	      -0.232090712,
	      0.663413942,
	      0.711347878,
	      -0.445221782,
	      -0.0593675859,
	      0.672226,
	      0.588528037,
	      -0.155209973,
	      -0.529836178,
	      0.114905022,
	      0.658058405,
	      0.498938352,
	      0.238107204,
	      -0.364430279,
	      -0.412783265,
	      0.236467153,
	      0.632581353,
	      0.428986728
	    ],
	    [
	      0.438371152,
	      0.898794055,
	      -0.211746112,
	      0.68243736,
	      0.699601948,
	      -0.446953058,
	      -0.0215500612,
	      0.6857692,
	      0.574011445,
	      -0.184070244,
	      -0.51545608,
	      0.155882403,
	      0.665750563,
	      0.482597172,
	      0.212318495,
	      -0.39808017,
	      -0.384186774,
	      0.276980251,
	      0.63467,
	      0.41149658
	    ],
	    [
	      0.453990489,
	      0.891006529,
	      -0.190838933,
	      0.700629294,
	      0.687531173,
	      -0.447058767,
	      0.0166617651,
	      0.697949767,
	      0.559219956,
	      -0.212051556,
	      -0.497995645,
	      0.19649294,
	      0.671704769,
	      0.46608761,
	      0.184362113,
	      -0.428517491,
	      -0.352403462,
	      0.316242844,
	      0.63479805,
	      0.393975943
	    ],
	    [
	      0.469471574,
	      0.882947564,
	      -0.169394672,
	      0.71796757,
	      0.675150335,
	      -0.445524335,
	      0.0551602542,
	      0.708752811,
	      0.544182777,
	      -0.238985762,
	      -0.477524847,
	      0.236567229,
	      0.675932169,
	      0.44945243,
	      0.154464841,
	      -0.455460936,
	      -0.317646116,
	      0.354051501,
	      0.633015394,
	      0.376478285
	    ],
	    [
	      0.484809607,
	      0.874619722,
	      -0.14743945,
	      0.734431207,
	      0.662474453,
	      -0.442339838,
	      0.0938368812,
	      0.718166888,
	      0.528929472,
	      -0.264709,
	      -0.454128981,
	      0.275939256,
	      0.678450286,
	      0.432734042,
	      0.122871645,
	      -0.478655517,
	      -0.280148357,
	      0.390214294,
	      0.629380882,
	      0.359055489
	    ],
	    [
	      0.5,
	      0.866025388,
	      -0.125,
	      0.75,
	      0.649519,
	      -0.4375,
	      0.132582515,
	      0.726184368,
	      0.513489902,
	      -0.2890625,
	      -0.427908242,
	      0.314447045,
	      0.679283261,
	      0.415974349,
	      0.08984375,
	      -0.497874498,
	      -0.240162909,
	      0.424552053,
	      0.623961568,
	      0.341757804
	    ],
	    [
	      0.515038073,
	      0.857167304,
	      -0.102103673,
	      0.764655054,
	      0.636299849,
	      -0.431004167,
	      0.171287775,
	      0.732801199,
	      0.4978939,
	      -0.311893493,
	      -0.398977429,
	      0.351933628,
	      0.678461432,
	      0.399214596,
	      0.0556567125,
	      -0.512921512,
	      -0.197959587,
	      0.456899434,
	      0.616832137,
	      0.324633449
	    ],
	    [
	      0.529919267,
	      0.848048091,
	      -0.0787783638,
	      0.778378487,
	      0.622832954,
	      -0.42285645,
	      0.209843263,
	      0.738016903,
	      0.482171416,
	      -0.333055854,
	      -0.367465287,
	      0.38824749,
	      0.676021,
	      0.382495195,
	      0.0205982868,
	      -0.523631871,
	      -0.153823346,
	      0.487105817,
	      0.608074725,
	      0.307728499
	    ],
	    [
	      0.544639051,
	      0.838670552,
	      -0.0550524816,
	      0.79115355,
	      0.609134853,
	      -0.413065583,
	      0.248139873,
	      0.741834819,
	      0.466352403,
	      -0.352411,
	      -0.333513856,
	      0.423243493,
	      0.672004223,
	      0.365855545,
	      -0.0150337582,
	      -0.529874325,
	      -0.108052082,
	      0.515036285,
	      0.597777665,
	      0.291086674
	    ],
	    [
	      0.559192896,
	      0.829037547,
	      -0.0309549458,
	      0.802964747,
	      0.595222116,
	      -0.401644915,
	      0.286069185,
	      0.744261742,
	      0.450466663,
	      -0.369828522,
	      -0.297277898,
	      0.456783414,
	      0.666458845,
	      0.349334031,
	      -0.0509339347,
	      -0.531552,
	      -0.0609543584,
	      0.540572166,
	      0.586035311,
	      0.27474916
	    ],
	    [
	      0.57357645,
	      0.819152057,
	      -0.00651510758,
	      0.813797653,
	      0.581111789,
	      -0.388612479,
	      0.323523581,
	      0.74530834,
	      0.434543818,
	      -0.385186851,
	      -0.258924127,
	      0.488736719,
	      0.659437895,
	      0.332967699,
	      -0.0867913961,
	      -0.528603256,
	      -0.0128471432,
	      0.563611865,
	      0.572947264,
	      0.258754492
	    ],
	    [
	      0.587785244,
	      0.809017,
	      0.0182372537,
	      0.823639095,
	      0.566821,
	      -0.373990864,
	      0.360396802,
	      0.744988561,
	      0.418613225,
	      -0.398374,
	      -0.218630359,
	      0.518981,
	      0.650999486,
	      0.316792309,
	      -0.122292347,
	      -0.521002412,
	      0.0359466225,
	      0.584071159,
	      0.558617532,
	      0.243138373
	    ],
	    [
	      0.601815045,
	      0.798635483,
	      0.0432719849,
	      0.832477033,
	      0.552367151,
	      -0.35780713,
	      0.396583915,
	      0.743320107,
	      0.402703911,
	      -0.409288,
	      -0.176584691,
	      0.547402501,
	      0.641206503,
	      0.300842017,
	      -0.157122463,
	      -0.50876,
	      0.0851004198,
	      0.601883709,
	      0.543153763,
	      0.227933615
	    ],
	    [
	      0.615661502,
	      0.788010776,
	      0.0685585812,
	      0.840300739,
	      0.537767947,
	      -0.340092868,
	      0.431981891,
	      0.74032414,
	      0.386844516,
	      -0.41783756,
	      -0.132984594,
	      0.573897,
	      0.630126059,
	      0.285149485,
	      -0.190969393,
	      -0.491922885,
	      0.134286612,
	      0.617001176,
	      0.526666701,
	      0.213169962
	    ],
	    [
	      0.629320383,
	      0.777146,
	      0.0940662324,
	      0.847100675,
	      0.523041129,
	      -0.32088393,
	      0.466489762,
	      0.736025095,
	      0.371063113,
	      -0.423942566,
	      -0.0880359635,
	      0.598369777,
	      0.617829442,
	      0.269745618,
	      -0.223525122,
	      -0.470574051,
	      0.183178872,
	      0.629393339,
	      0.509269297,
	      0.198874116
	    ],
	    [
	      0.642787635,
	      0.766044438,
	      0.119763866,
	      0.852868557,
	      0.508204579,
	      -0.300220519,
	      0.500008881,
	      0.730451,
	      0.3553873,
	      -0.427534461,
	      -0.0419521108,
	      0.620736361,
	      0.604391634,
	      0.254659504,
	      -0.254488528,
	      -0.444832,
	      0.231454641,
	      0.6390481,
	      0.491075933,
	      0.185069621
	    ],
	    [
	      0.656059,
	      0.754709601,
	      0.145620167,
	      0.857597291,
	      0.493276417,
	      -0.278146982,
	      0.532443225,
	      0.723632872,
	      0.339844,
	      -0.428556591,
	      0.00504725659,
	      0.640922725,
	      0.589890659,
	      0.239918366,
	      -0.283567578,
	      -0.414850116,
	      0.278797477,
	      0.645971298,
	      0.472201824,
	      0.171776831
	    ],
	    [
	      0.669130623,
	      0.74314481,
	      0.17160365,
	      0.861281216,
	      0.478274852,
	      -0.254711658,
	      0.563699722,
	      0.71560514,
	      0.324459404,
	      -0.426964611,
	      0.0527371019,
	      0.65886575,
	      0.574407756,
	      0.225547418,
	      -0.310481846,
	      -0.380815536,
	      0.324899465,
	      0.65018636,
	      0.452762038,
	      0.159012988
	    ],
	    [
	      0.681998372,
	      0.7313537,
	      0.197682649,
	      0.863915801,
	      0.463218153,
	      -0.229966834,
	      0.593688309,
	      0.706405222,
	      0.309259027,
	      -0.42272675,
	      0.100888163,
	      0.674513459,
	      0.558026433,
	      0.211569905,
	      -0.334964633,
	      -0.34294793,
	      0.369463414,
	      0.651733816,
	      0.432870984,
	      0.146792069
	    ],
	    [
	      0.694658399,
	      0.719339788,
	      0.22382538,
	      0.865497828,
	      0.448124617,
	      -0.203968629,
	      0.622322381,
	      0.696073472,
	      0.294267476,
	      -0.415823936,
	      0.149268031,
	      0.687825,
	      0.540832222,
	      0.198006928,
	      -0.356765121,
	      -0.301497817,
	      0.41220516,
	      0.650671065,
	      0.412641525,
	      0.135125011
	    ],
	    [
	      0.707106769,
	      0.707106769,
	      0.25,
	      0.866025388,
	      0.433012694,
	      -0.176776692,
	      0.649519,
	      0.684653223,
	      0.279508501,
	      -0.40625,
	      0.197642356,
	      0.698771238,
	      0.522912502,
	      0.1848775,
	      -0.375650465,
	      -0.256744951,
	      0.452855527,
	      0.647071242,
	      0.392184377,
	      0.124019593
	    ],
	    [
	      0.719339788,
	      0.694658399,
	      0.276174635,
	      0.865497828,
	      0.417900771,
	      -0.148454204,
	      0.675199151,
	      0.672190368,
	      0.265004843,
	      -0.394011736,
	      0.245775878,
	      0.707334399,
	      0.504355729,
	      0.1721984,
	      -0.391407639,
	      -0.208996147,
	      0.49116233,
	      0.641022801,
	      0.371607512,
	      0.113480605
	    ],
	    [
	      0.7313537,
	      0.681998372,
	      0.302317351,
	      0.863915801,
	      0.402807266,
	      -0.119067609,
	      0.699287713,
	      0.658733487,
	      0.250778317,
	      -0.379128963,
	      0.293433666,
	      0.713508487,
	      0.485251039,
	      0.159984291,
	      -0.403845161,
	      -0.158583134,
	      0.526892304,
	      0.63262856,
	      0.351015329,
	      0.10350991
	    ],
	    [
	      0.74314481,
	      0.669130623,
	      0.32839635,
	      0.861281216,
	      0.387750536,
	      -0.0886864737,
	      0.721713901,
	      0.64433378,
	      0.236849621,
	      -0.361634314,
	      0.340382189,
	      0.717299,
	      0.465688139,
	      0.148247585,
	      -0.412794828,
	      -0.105860129,
	      0.559832633,
	      0.622004569,
	      0.330508262,
	      0.0941065326
	    ],
	    [
	      0.754709601,
	      0.656059,
	      0.354379833,
	      0.857597291,
	      0.372748971,
	      -0.0573833026,
	      0.742411554,
	      0.629044473,
	      0.223238334,
	      -0.341573387,
	      0.386390567,
	      0.71872288,
	      0.445756465,
	      0.13699846,
	      -0.418113053,
	      -0.0512011871,
	      0.589792609,
	      0.609279215,
	      0.310182154,
	      0.0852667838
	    ],
	    [
	      0.766044438,
	      0.642787635,
	      0.380236119,
	      0.852868557,
	      0.357820839,
	      -0.0252333339,
	      0.761319,
	      0.612921119,
	      0.209962875,
	      -0.319004357,
	      0.431231558,
	      0.717808664,
	      0.425545,
	      0.126244947,
	      -0.419682056,
	      0.00500250375,
	      0.616604924,
	      0.594592,
	      0.290127724,
	      0.0769844055
	    ],
	    [
	      0.777146,
	      0.629320383,
	      0.405933768,
	      0.847100675,
	      0.342984289,
	      0.00768567342,
	      0.778379381,
	      0.596021354,
	      0.197040468,
	      -0.293997765,
	      0.474682748,
	      0.714596,
	      0.405141771,
	      0.115992859,
	      -0.417411059,
	      0.0623455457,
	      0.640126824,
	      0.578092158,
	      0.270430148,
	      0.0692507252
	    ],
	    [
	      0.788010776,
	      0.615661502,
	      0.431441426,
	      0.840300739,
	      0.328257442,
	      0.0412936322,
	      0.793541074,
	      0.578404605,
	      0.184487075,
	      -0.266636372,
	      0.516527653,
	      0.709135473,
	      0.384633511,
	      0.106245846,
	      -0.411237091,
	      0.120411336,
	      0.660241187,
	      0.559937775,
	      0.251168609,
	      0.0620547719
	    ],
	    [
	      0.798635483,
	      0.601815045,
	      0.456728,
	      0.832477033,
	      0.313658237,
	      0.0755083486,
	      0.80675739,
	      0.560131907,
	      0.172317386,
	      -0.237014621,
	      0.556556761,
	      0.701488495,
	      0.364105076,
	      0.0970054492,
	      -0.40112561,
	      0.178775176,
	      0.676857054,
	      0.540294051,
	      0.232415989,
	      0.0553835034
	    ],
	    [
	      0.809017,
	      0.587785244,
	      0.481762737,
	      0.823639095,
	      0.299204409,
	      0.110245749,
	      0.817986846,
	      0.541265905,
	      0.160544738,
	      -0.205238357,
	      0.594568431,
	      0.691726744,
	      0.343639225,
	      0.0882711485,
	      -0.387070984,
	      0.237007394,
	      0.68991071,
	      0.519332051,
	      0.214238584,
	      0.0492219403
	    ],
	    [
	      0.819152057,
	      0.57357645,
	      0.506515086,
	      0.813797653,
	      0.284913629,
	      0.145420119,
	      0.827193558,
	      0.521870494,
	      0.149181142,
	      -0.171424255,
	      0.630370259,
	      0.67993176,
	      0.323316187,
	      0.0800403953,
	      -0.369096637,
	      0.294676661,
	      0.699365437,
	      0.49722746,
	      0.196695775,
	      0.0435533747
	    ],
	    [
	      0.829037547,
	      0.559192896,
	      0.530954957,
	      0.802964747,
	      0.270803303,
	      0.180944279,
	      0.83434689,
	      0.502010882,
	      0.138237208,
	      -0.135699391,
	      0.663779497,
	      0.666194856,
	      0.303213269,
	      0.0723087117,
	      -0.34725523,
	      0.351353139,
	      0.705212235,
	      0.474158853,
	      0.179839924,
	      0.0383595526
	    ],
	    [
	      0.838670552,
	      0.544639051,
	      0.555052459,
	      0.79115355,
	      0.256890565,
	      0.216729924,
	      0.839421868,
	      0.481753141,
	      0.127722174,
	      -0.0982006,
	      0.694624424,
	      0.650616169,
	      0.283404499,
	      0.0650697425,
	      -0.321628243,
	      0.406611711,
	      0.707469344,
	      0.450306475,
	      0.163716242,
	      0.0336208828
	    ],
	    [
	      0.848048091,
	      0.529919267,
	      0.578778386,
	      0.778378487,
	      0.243192434,
	      0.252687752,
	      0.84239924,
	      0.461164147,
	      0.117643826,
	      -0.0590738878,
	      0.722744823,
	      0.633304417,
	      0.263960302,
	      0.0583153479,
	      -0.292325705,
	      0.460035235,
	      0.706182301,
	      0.425850779,
	      0.148362651,
	      0.0293166153
	    ],
	    [
	      0.857167304,
	      0.515038073,
	      0.602103651,
	      0.764655054,
	      0.229725555,
	      0.28872776,
	      0.843265295,
	      0.440311372,
	      0.108008519,
	      -0.0184737556,
	      0.747993112,
	      0.614376187,
	      0.244947284,
	      0.0520356968,
	      -0.259485394,
	      0.511217654,
	      0.701423287,
	      0.400970876,
	      0.133809894,
	      0.0254250597
	    ],
	    [
	      0.866025388,
	      0.5,
	      0.625,
	      0.75,
	      0.216506347,
	      0.324759513,
	      0.842012107,
	      0.419262737,
	      0.0988211781,
	      0.0234375,
	      0.770234823,
	      0.593955576,
	      0.226427764,
	      0.046219375,
	      -0.223272175,
	      0.559767127,
	      0.693290591,
	      0.375843376,
	      0.120081455,
	      0.021923773
	    ],
	    [
	      0.874619722,
	      0.484809607,
	      0.64743942,
	      0.734431207,
	      0.203550935,
	      0.360692352,
	      0.838637531,
	      0.398086399,
	      0.0900852531,
	      0.0664905459,
	      0.789349437,
	      0.572173119,
	      0.208459631,
	      0.0408534706,
	      -0.183876783,
	      0.60530889,
	      0.681907594,
	      0.350640744,
	      0.107193753,
	      0.0187897682
	    ],
	    [
	      0.882947564,
	      0.469471574,
	      0.669394672,
	      0.71796757,
	      0.190875068,
	      0.396435648,
	      0.833145082,
	      0.376850545,
	      0.0818027481,
	      0.110509798,
	      0.805230737,
	      0.549165547,
	      0.191096097,
	      0.035923712,
	      -0.141514659,
	      0.647488296,
	      0.667421818,
	      0.325530231,
	      0.0951562673,
	      0.0159996971
	    ],
	    [
	      0.891006529,
	      0.453990489,
	      0.690838933,
	      0.700629294,
	      0.178494215,
	      0.431898981,
	      0.825544238,
	      0.355623156,
	      0.073974207,
	      0.155314222,
	      0.817787707,
	      0.525074899,
	      0.174385428,
	      0.0314145684,
	      -0.0964244157,
	      0.685973167,
	      0.650003791,
	      0.300672412,
	      0.0839717537,
	      0.0135300411
	    ],
	    [
	      0.898794055,
	      0.438371152,
	      0.711746097,
	      0.68243736,
	      0.16642347,
	      0.466992587,
	      0.8158499,
	      0.334471971,
	      0.0665987208,
	      0.200718179,
	      0.826944649,
	      0.500047624,
	      0.158370793,
	      0.0273093823,
	      -0.0488663204,
	      0.720456839,
	      0.629845262,
	      0.276220232,
	      0.0736365318,
	      0.0113573
	    ],
	    [
	      0.906307817,
	      0.42261827,
	      0.732090712,
	      0.663413942,
	      0.154677495,
	      0.501627326,
	      0.80408287,
	      0.313464135,
	      0.0596739501,
	      0.246532276,
	      0.83264184,
	      0.474234223,
	      0.143090084,
	      0.0235904958,
	      0.000879568,
	      0.750660121,
	      0.607158065,
	      0.252317607,
	      0.064140752,
	      0.00945815817
	    ],
	    [
	      0.91354543,
	      0.406736642,
	      0.751848,
	      0.643582284,
	      0.143270656,
	      0.535715163,
	      0.790269554,
	      0.292666078,
	      0.0531961136,
	      0.292564303,
	      0.834835649,
	      0.44778809,
	      0.128575757,
	      0.0202393811,
	      0.0525153,
	      0.776333511,
	      0.582172155,
	      0.229098633,
	      0.0554687865,
	      0.00780965388
	    ],
	    [
	      0.920504868,
	      0.390731126,
	      0.770993769,
	      0.622966528,
	      0.132216811,
	      0.569169283,
	      0.774441898,
	      0.272143364,
	      0.0471600257,
	      0.338620067,
	      0.833498836,
	      0.420865029,
	      0.114854798,
	      0.0172367785,
	      0.105727136,
	      0.797259331,
	      0.55513376,
	      0.206686467,
	      0.0475996137,
	      0.00638933061
	    ],
	    [
	      0.927183867,
	      0.37460658,
	      0.789504826,
	      0.601591825,
	      0.12152943,
	      0.601904333,
	      0.756637275,
	      0.251960427,
	      0.0415591113,
	      0.384504348,
	      0.828620732,
	      0.39362222,
	      0.101948567,
	      0.0145628275,
	      0.160187721,
	      0.813253164,
	      0.526303351,
	      0.18519263,
	      0.040507257,
	      0.00517538143
	    ],
	    [
	      0.933580399,
	      0.35836795,
	      0.807358623,
	      0.579484105,
	      0.111221552,
	      0.633836746,
	      0.736898482,
	      0.232180476,
	      0.0363854282,
	      0.430021763,
	      0.820207298,
	      0.366217613,
	      0.0898727924,
	      0.0121972151,
	      0.215558439,
	      0.824165523,
	      0.495953768,
	      0.164716139,
	      0.0341612436,
	      0.00414678082
	    ],
	    [
	      0.939692616,
	      0.342020154,
	      0.824533343,
	      0.556670427,
	      0.101305731,
	      0.664884746,
	      0.715273559,
	      0.212865278,
	      0.0316297,
	      0.474977732,
	      0.808281064,
	      0.338809043,
	      0.0786375329,
	      0.0101193069,
	      0.271491736,
	      0.82988292,
	      0.464367747,
	      0.145342931,
	      0.0285271145,
	      0.00328339939
	    ],
	    [
	      0.945518553,
	      0.325568169,
	      0.841008067,
	      0.533178449,
	      0.0917940363,
	      0.694968879,
	      0.691815674,
	      0.194074973,
	      0.0272813439,
	      0.519179404,
	      0.792881131,
	      0.311553419,
	      0.0682472,
	      0.00830829144,
	      0.327633679,
	      0.830328882,
	      0.43183586,
	      0.127145335,
	      0.0235669315,
	      0.00256610778
	    ],
	    [
	      0.95105654,
	      0.309017,
	      0.856762767,
	      0.509036958,
	      0.0826980695,
	      0.724011958,
	      0.666583,
	      0.175867945,
	      0.0233285148,
	      0.562436461,
	      0.774062932,
	      0.28460595,
	      0.0587005876,
	      0.00674331561,
	      0.383626401,
	      0.825464487,
	      0.398654133,
	      0.110181682,
	      0.0192398224,
	      0.00197686534
	    ],
	    [
	      0.956304729,
	      0.29237169,
	      0.87177819,
	      0.484275252,
	      0.0740289,
	      0.751939535,
	      0.639638543,
	      0.158300623,
	      0.0197581388,
	      0.604562223,
	      0.751898,
	      0.258119404,
	      0.0499909483,
	      0.00540362718,
	      0.439110696,
	      0.815288842,
	      0.365121692,
	      0.0944960266,
	      0.0155025441,
	      0.00149879418
	    ],
	    [
	      0.96126169,
	      0.275637358,
	      0.886036098,
	      0.458923548,
	      0.0657971054,
	      0.778679788,
	      0.61104995,
	      0.141427353,
	      0.0165559556,
	      0.645374238,
	      0.726473689,
	      0.23224321,
	      0.0421060883,
	      0.00426870678,
	      0.493728578,
	      0.799839199,
	      0.331538409,
	      0.0801179484,
	      0.0123100337,
	      0.00111623504
	    ],
	    [
	      0.965925813,
	      0.258819044,
	      0.899519,
	      0.433012694,
	      0.0580127,
	      0.804163933,
	      0.580889285,
	      0.125300229,
	      0.0137065668,
	      0.684695423,
	      0.697892725,
	      0.207122892,
	      0.0350284949,
	      0.00331840175,
	      0.547125876,
	      0.77919066,
	      0.298202485,
	      0.0670625493,
	      0.0096159894,
	      0.00081479142
	    ],
	    [
	      0.970295727,
	      0.241921902,
	      0.912210703,
	      0.406574309,
	      0.0506851785,
	      0.828326404,
	      0.549233,
	      0.10996896,
	      0.0111934906,
	      0.72235477,
	      0.666272759,
	      0.182899177,
	      0.0287354942,
	      0.00253305561,
	      0.598954737,
	      0.753455698,
	      0.265408158,
	      0.0553305373,
	      0.00737343961,
	      0.00058135466
	    ],
	    [
	      0.974370062,
	      0.224951059,
	      0.924095511,
	      0.379640549,
	      0.043823462,
	      0.851105,
	      0.516161561,
	      0.0954807103,
	      0.00899920426,
	      0.758188,
	      0.631745756,
	      0.159707367,
	      0.0231994167,
	      0.00189363456,
	      0.64887625,
	      0.722783685,
	      0.233443365,
	      0.044908423,
	      0.00553530222,
	      0.000404115446
	    ],
	    [
	      0.978147626,
	      0.207911685,
	      0.935159087,
	      0.352244258,
	      0.0374359153,
	      0.872441,
	      0.481759191,
	      0.08188,
	      0.00710520707,
	      0.792038739,
	      0.594457507,
	      0.137676626,
	      0.0183878168,
	      0.00138184614,
	      0.696562707,
	      0.687359333,
	      0.202587366,
	      0.0357688442,
	      0.00405494822,
	      0.000272558565
	    ],
	    [
	      0.981627166,
	      0.190809,
	      0.9453879,
	      0.324418813,
	      0.0315303169,
	      0.892279327,
	      0.446113944,
	      0.0692085773,
	      0.00549207628,
	      0.8237589,
	      0.55456686,
	      0.11692936,
	      0.0142636979,
	      0.000980255776,
	      0.7417,
	      0.647402,
	      0.173108727,
	      0.027871009,
	      0.00288673723,
	      0.00017744326
	    ],
	    [
	      0.98480773,
	      0.173648179,
	      0.954769492,
	      0.29619813,
	      0.0261138603,
	      0.910568774,
	      0.409317106,
	      0.0575052574,
	      0.00413952675,
	      0.853209496,
	      0.51224488,
	      0.097580567,
	      0.0107857706,
	      0.000672395749,
	      0.783990145,
	      0.6031636,
	      0.145263031,
	      0.0211612582,
	      0.00198654155,
	      0.000110768546
	    ],
	    [
	      0.987688363,
	      0.156434461,
	      0.96329236,
	      0.26761657,
	      0.0211931504,
	      0.927262187,
	      0.37146312,
	      0.0468058847,
	      0.0030264766,
	      0.880261302,
	      0.467674255,
	      0.0797372833,
	      0.00790872145,
	      0.000442867487,
	      0.823153198,
	      0.55492723,
	      0.119290978,
	      0.0155737158,
	      0.00131224515,
	      0.0000657245328
	    ],
	    [
	      0.990268052,
	      0.139173105,
	      0.970946252,
	      0.238708958,
	      0.0167741776,
	      0.942316413,
	      0.33264932,
	      0.0371431746,
	      0.00213111029,
	      0.904795587,
	      0.421048343,
	      0.06349805,
	      0.00558351539,
	      0.000277437561,
	      0.858929157,
	      0.503005,
	      0.095416449,
	      0.0110310512,
	      0.000824212679,
	      0.0000366304121
	    ],
	    [
	      0.992546141,
	      0.121869341,
	      0.97772181,
	      0.209510505,
	      0.0128623275,
	      0.955692589,
	      0.292975664,
	      0.0285466593,
	      0.00143094664,
	      0.926704407,
	      0.372570127,
	      0.0489524,
	      0.00375770917,
	      0.000163125529,
	      0.89108032,
	      0.447735608,
	      0.0738447458,
	      0.00744534191,
	      0.000485728844,
	      0.0000188598242
	    ],
	    [
	      0.994521916,
	      0.104528464,
	      0.98361069,
	      0.18005681,
	      0.00946236681,
	      0.967356,
	      0.252544463,
	      0.0210425854,
	      0.000902908447,
	      0.945891321,
	      0.322451502,
	      0.0361804329,
	      0.00237578456,
	      0.0000882840613,
	      0.919392467,
	      0.3894822,
	      0.054761,
	      0.00471901428,
	      0.000263401278,
	      0.00000875463684
	    ],
	    [
	      0.99619472,
	      0.0871557444,
	      0.988605797,
	      0.150383726,
	      0.00657843612,
	      0.977276683,
	      0.211460009,
	      0.014653855,
	      0.000523393159,
	      0.96227181,
	      0.270912081,
	      0.0252523813,
	      0.00137949863,
	      0.0000426705337,
	      0.943676829,
	      0.328629553,
	      0.038328696,
	      0.00274586887,
	      0.000127524472,
	      0.00000352813618
	    ],
	    [
	      0.997564077,
	      0.0697564706,
	      0.992701054,
	      0.120527439,
	      0.00421405,
	      0.985428751,
	      0.169828475,
	      0.00939994864,
	      0.000268345029,
	      0.975773752,
	      0.218178153,
	      0.0162282921,
	      0.000708244741,
	      0.0000175098376,
	      0.963771284,
	      0.26558128,
	      0.0246884,
	      0.00141217536,
	      0.0000524015522,
	      0.00000115874502
	    ],
	    [
	      0.99862951,
	      0.0523359552,
	      0.995891392,
	      0.0905243,
	      0.00237208884,
	      0.991791308,
	      0.12775746,
	      0.00529688271,
	      0.000113328853,
	      0.986337543,
	      0.164481804,
	      0.00915770326,
	      0.000299429055,
	      0.00000554810504,
	      0.979541421,
	      0.200757101,
	      0.0139566557,
	      0.000597832084,
	      0.000016621505,
	      2.75464799e-7
	    ],
	    [
	      0.999390841,
	      0.0348994955,
	      0.998173058,
	      0.0604108796,
	      0.00105479721,
	      0.996347725,
	      0.0853558108,
	      0.00235716137,
	      0.000033604505,
	      0.993916631,
	      0.110059582,
	      0.00407940708,
	      0.000088855,
	      0.00000109703558,
	      0.99088186,
	      0.134589493,
	      0.00622506905,
	      0.000177574679,
	      0.00000328910164,
	      3.63212784e-8
	    ],
	    [
	      0.99984771,
	      0.0174524058,
	      0.99954313,
	      0.0302238502,
	      0.000263779628,
	      0.99908632,
	      0.0427332148,
	      0.000589739357,
	      0.00000420248307,
	      0.998477459,
	      0.0551515371,
	      0.00102125108,
	      0.0000111170311,
	      6.86065036e-8,
	      0.997716665,
	      0.067520842,
	      0.0015595908,
	      0.0000222298295,
	      2.05788169e-7,
	      1.1359047e-9
	    ],
	    [
	      1,
	      0,
	      1,
	      0,
	      0,
	      1,
	      0,
	      0,
	      0,
	      1,
	      0,
	      0,
	      0,
	      0,
	      1,
	      0,
	      0,
	      0,
	      0,
	      0
	    ]
	  ]
	];

	module.exports = AmbisonicEncoderTable;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Ray-based room reflections model.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var AmbisonicEncoder = __webpack_require__(8);
	var Room = __webpack_require__(14);
	var Globals = __webpack_require__(5);

	/**
	 * @class Reflections
	 * @description Ray-based room reflections model.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder
	 * Desired ambisonic order.
	 * @param {Map} options.dimensions
	 * Room dimensions (in meters).
	 * @param {Map} options.coefficients
	 * Multiband absorption coeffs per wall.
	 * @param {Number} options.speedOfSound
	 * (in meters / second) [optional].
	 */
	function Reflections (context, options) {
	  // Public variables.
	  /**
	   * The room's speed of sound (in meters/second).
	   * @member {Number} speedOfSound
	   * @memberof Reflections
	   */
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof Reflections
	   */
	  /**
	   * Outuput to .connect() object from.
	   * @member {AudioNode} output
	   * @memberof Reflections
	   */

	  this._listenerPosition = new Float32Array(3);

	  var wallAzimuthElevation = {
	    'left' : [90, 0],
	    'right' : [-90, 0],
	    'front' : [0, 0],
	    'back' : [180, 0],
	    'ceiling' : [0, 90],
	    'floor' : [0, -90]
	  };

	  // Assign defaults for undefined options.
	  if (options == undefined) {
	    options = {};
	  }
	  if (options.ambisonicOrder == undefined) {
	    options.ambisonicOrder = Globals.DefaultAmbisonicOrder;
	  }
	  if (options.speedOfSound == undefined) {
	    options.speedOfSound = Globals.DefaultSpeedOfSound;
	  }
	  this.speedOfSound = options.speedOfSound;

	  // Create nodes.
	  this.input = context.createGain();
	  this.output = context.createGain();
	  this._lowpass = context.createBiquadFilter();
	  this._delays = new Array(Room.NumWalls);
	  this._gains = new Array(Room.NumWalls);
	  this._encoders = new Array(Room.NumWalls);

	  // For each wall, we connect a series of [delay] -> [gain] -> [encoder].
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    this._delays[key] = context.createDelay(Globals.ReflectionsMaxDuration);
	    this._gains[key] = context.createGain();
	    this._encoders[key] = new AmbisonicEncoder(context, options.ambisonicOrder);
	  }

	  // Initialize lowpass filter.
	  this._lowpass.type = 'lowpass';
	  this._lowpass.frequency.value = Globals.DefaultReflectionsCutoffFrequency;
	  this._lowpass.Q.value = 0;

	  // Initialize encoder directions, set delay times and gains to 0.
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    this._encoders[key].setDirection(wallAzimuthElevation[key][0],
	      wallAzimuthElevation[key][1]);
	    this._delays[key].delayTime.value = 0;
	    this._gains[key].gain.value = 0;
	  }

	  // Connect nodes.
	  this.input.connect(this._lowpass);
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    this._lowpass.connect(this._delays[key]);
	    this._delays[key].connect(this._gains[key]);
	    this._gains[key].connect(this._encoders[key].input);
	    this._encoders[key].output.connect(this.output);
	  }

	  // Initialize.
	  this.setRoomProperties(options.dimensions, options.coefficients);
	}

	/**
	 * Set the listener position within the shoebox model.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 */
	Reflections.prototype.setListenerPosition = function(x, y, z) {
	  //TODO(bitllama): Handle listeners exiting the room!

	  // Assign listener position.
	  this._listenerPosition = [x, y, z];

	  // Determine distances to each wall.
	  var distances = {
	    'left' : this._halfDimensions['width'] + x,
	    'right' : this._halfDimensions['width'] - x,
	    'front' : this._halfDimensions['depth'] + z,
	    'back' : this._halfDimensions['depth'] - z,
	    'floor' : this._halfDimensions['height'] + y,
	    'ceiling' : this._halfDimensions['height'] - y,
	  };

	  // Assign delay & attenuation values using distances.
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];

	    // Compute and assign delay (in secs).
	    var delayInSecs = distances[key] / this.speedOfSound;
	    this._delays[key].delayTime.value = delayInSecs;

	    // Compute and assign gain, uses logarithmic rolloff: "g = R / (d + 1)"
	    var attenuation = this._reflectionCoefficients[key] / (distances[key] + 1);
	    this._gains[key].gain.value = attenuation;
	  }
	}

	/**
	 * Set the room's properties which determines the characteristics of reflections.
	 * @param {Map} dimensions
	 * Dimensions map which should conform to the layout of
	 * {@link Room.DefaultDimensions Room.DefaultDimensions}
	 * @param {Map} coefficients
	 * Absorption coefficients map which should contain the keys
	 * {@link Room.WallTypes Room.WallTypes}, which each key containing nine (9)
	 * values coninciding with desired coefficients for each
	 * {@link Globals.ReverbBands frequency band}.
	 *
	 */
	Reflections.prototype.setRoomProperties = function(dimensions, coefficients) {
	  // Compute reflection coefficients.
	  this._reflectionCoefficients =
	    Room.computeReflectionCoefficients(coefficients);

	  // Sanitize dimensions and store half-dimensions.
	  dimensions = Room.sanitizeDimensions(dimensions);
	  this._halfDimensions = {};
	  this._halfDimensions['width'] = dimensions['width'] * 0.5;
	  this._halfDimensions['height'] = dimensions['height'] * 0.5;
	  this._halfDimensions['depth'] = dimensions['depth'] * 0.5;

	  // Update listener position with new room properties.
	  this.setListenerPosition(this._listenerPosition[0],
	    this._listenerPosition[1], this._listenerPosition[2]);
	}

	module.exports = Reflections;

/***/ }),
/* 11 */,
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Late reverberation filter for Ambisonic content.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var Globals = __webpack_require__(5);
	var Utils = __webpack_require__(4);

	/**
	 * @class Reverb
	 * @description Late reverberation filter for Ambisonic content.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Object} options
	 * @param {Array} options.RT60DurationSecs
	 * Multiband RT60 durations (in secs) for each
	 * {@link Globals.ReverbBands frequency band}.
	 * @param {Number} options.preDelayMs Pre-delay (in ms).
	 * @param {Number} options.gainLinear Output gain (linear).
	 */
	function Reverb (context, options) {
	  // Public variables.
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof Reverb
	   */
	  /**
	   * Outuput to .connect() object from.
	   * @member {AudioNode} output
	   * @memberof Reverb
	   */

	  this._context = context;

	  // Use defaults for undefined arguments
	  if (options == undefined) {
	    options = {};
	  }
	  if (options.RT60DurationSecs == undefined) {
	    options.RT60DurationSecs = new Float32Array(Globals.NumReverbBands);
	  }
	  if (options.preDelayMs == undefined) {
	    options.preDelayMs = Globals.DefaultReverbPreDelayMs;
	  }
	  if (options.gainLinear == undefined) {
	    options.gainLinear = Globals.DefaultReverbGain;
	  }

	  // Used for updating RT60s during runtime.
	  this._enabled = false;

	  // Compute pre-delay.
	  var delayInSecs = options.preDelayMs / 1000;

	  // Create nodes.
	  this.input = context.createGain();
	  this._predelay = context.createDelay(delayInSecs);
	  this._convolver = context.createConvolver();
	  this.output = context.createGain();

	  // Set reverb attenuation.
	  this.output.gain.value = options.gainLinear;

	  // Disable normalization.
	  this._convolver.normalize = false;

	  // Connect nodes.
	  this.input.connect(this._predelay);
	  this._predelay.connect(this._convolver);
	  this._convolver.connect(this.output);

	  // Compute IR using RT60 values.
	  this.setRT60s(options.RT60DurationSecs);
	}

	/**
	 * Re-compute a new impulse response by providing Multiband RT60 durations.
	 * @param {Array} RT60DurationSecs
	 * Multiband RT60 durations (in secs) for each
	 * {@link Globals.ReverbBands frequency band}.
	 */
	Reverb.prototype.setRT60s = function (RT60DurationSecs) {
	  if (RT60DurationSecs.length !== Globals.NumReverbBands) {
	    Utils.log("Warning: invalid number of RT60 values provided to reverb.");
	    return;
	  }

	  // Compute impulse response.
	  var RT60Samples = new Float32Array(Globals.NumReverbBands);
	  var sampleRate = this._context.sampleRate;

	  for (var i = 0; i < Math.min(RT60DurationSecs.length, RT60Samples.length); i++) {
	    // Clamp within suitable range.
	    RT60DurationSecs[i] = Math.max(0, Math.min(
	      Globals.DefaultReverbMaxDurationSecs, RT60DurationSecs[i]));

	      // Convert seconds to samples.
	    RT60Samples[i] =
	      Math.round(RT60DurationSecs[i] * sampleRate * Globals.ReverbDurationMultiplier);
	  };

	  // Determine max RT60 length in samples.
	  var RT60MaxLengthSamples = 0;
	  for (var i = 0; i < RT60Samples.length; i++) {
	    if (RT60Samples[i] > RT60MaxLengthSamples) {
	      RT60MaxLengthSamples = RT60Samples[i];
	    }
	  }

	  // Skip this step if there is no reverberation to compute.
	  if (RT60MaxLengthSamples < 1) {
	    RT60MaxLengthSamples = 1;
	  }

	  var buffer = this._context.createBuffer(1, RT60MaxLengthSamples, sampleRate);
	  var bufferData = buffer.getChannelData(0);

	  // Create noise signal (computed once, referenced in each band's routine).
	  var noiseSignal = new Float32Array(RT60MaxLengthSamples);
	  for (var i = 0; i < RT60MaxLengthSamples; i++) {
	    noiseSignal[i] = Math.random() * 2 - 1;
	  }

	  // Compute the decay rate per-band and filter the decaying noise signal.
	  for (var i = 0; i < Globals.NumReverbBands; i++) {
	  //for (var i = 0; i < 1; i++) {
	    // Compute decay rate.
	    var decayRate = -Globals.Log1000 / RT60Samples[i];

	    // Construct a standard bandpass filter:
	    // H(z) = (b0 * z^0 + b1 * z^-1 + b2 * z^-2) / (1 + a1 * z^-1 + a2 * z^-2)
	    var omega = Globals.TwoPi * Globals.ReverbBands[i] / sampleRate;
	    var sinOmega = Math.sin(omega);
	    var alpha = sinOmega * Math.sinh(Globals.Log2Div2 *
	      Globals.ReverbBandwidth * omega / sinOmega);
	    var a0CoeffReciprocal = 1 / (1 + alpha);
	    var b0Coeff = alpha * a0CoeffReciprocal;
	    var a1Coeff = -2 * Math.cos(omega) * a0CoeffReciprocal;
	    var a2Coeff = (1 - alpha) * a0CoeffReciprocal;

	    // We optimize since b2 = -b0, b1 = 0.
	    // Update equation for two-pole bandpass filter:
	    //   u[n] = x[n] - a1 * x[n-1] - a2 * x[n-2]
	    //   y[n] = b0 * (u[n] - u[n-2])
	    var um1 = 0;
	    var um2 = 0;
	    for (var j = 0; j < RT60Samples[i]; j++) {
	      // Exponentially-decaying white noise.
	      var x = noiseSignal[j] * Math.exp(decayRate * j);

	      // Filter signal with bandpass filter and add to output.
	      var u = x - a1Coeff * um1 - a2Coeff * um2;
	      bufferData[j] += b0Coeff * (u - um2);

	      // Update coefficients.
	      um2 = um1;
	      um1 = u;
	    }
	  }

	  // Create and apply half-Hann window.
	  var halfHannLength =
	    Math.round(Globals.DefaultReverbTailOnsetMs / 1000 * sampleRate);
	  for (var i = 0; i < Math.min(bufferData.length, halfHannLength); i++) {
	    var halfHann =
	      0.5 * (1 - Math.cos(Globals.TwoPi * i / (2 * halfHannLength - 1)));
	    bufferData[i] *= halfHann;
	  }
	  this._convolver.buffer = buffer;
	}

	module.exports = Reverb;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Distance attenuation filter.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var Globals = __webpack_require__(5);
	var Utils = __webpack_require__(4);

	/**
	 * @class Attenuation
	 * @description Distance attenuation filter.
	 * @param {AudioContext} context
	 * Associated {@link
	https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}.
	 * @param {Object} options
	 * @param {Number} options.minDistance Min. distance (in meters).
	 * @param {Number} options.maxDistance Max. distance (in meters).
	 * @param {string} options.rolloffModel
	 * Rolloff model to use, chosen from options in
	 * {@link Globals.RolloffModels Global.RolloffModels}.
	 */
	function Attenuation (context, options) {
	  // Public variables.
	  /**
	   * Minimum distance from the listener (in meters).
	   * @member {Number} minDistance
	   * @memberof Attenuation
	   */
	  /**
	   * Maximum distance from the listener (in meters).
	   * @member {Number} maxDistance
	   * @memberof Attenuation
	   */
	  /**
	   * Input to .connect() input AudioNodes to.
	   * @member {AudioNode} input
	   * @memberof Attenuation
	   */
	  /**
	   * Outuput to .connect() object from.
	   * @member {AudioNode} output
	   * @memberof Attenuation
	   */

	  // Use defaults for undefined arguments
	  if (options == undefined) {
	    options = new Object();
	  }
	  if (options.minDistance == undefined) {
	    options.minDistance = Globals.DefaultMinDistance;
	  }
	  if (options.maxDistance == undefined) {
	    options.maxDistance = Globals.DefaultMaxDistance;
	  }
	  if (options.rollofModel == undefined) {
	    options.rolloffModel = Globals.DefaultRolloffModel;
	  }

	  // Assign values.
	  this.minDistance = options.minDistance;
	  this.maxDistance = options.maxDistance;
	  this.setRolloffModel(options.rolloffModel);

	  // Create node.
	  this._gainNode = context.createGain();

	  // Initialize distance to max distance.
	  this.setDistance(options.maxDistance);

	  // Input/Output proxy.
	  this.input = this._gainNode;
	  this.output = this._gainNode;
	}

	/**
	 * Set distance from the listener.
	 * @param {Number} distance Distance (in meters).
	 */
	Attenuation.prototype.setDistance = function(distance) {
	  var gain = 1;
	  if (this._rolloffModel == 'logarithmic') {
	    if (distance > this.maxDistance) {
	      gain = 0;
	    } else if (distance > this.minDistance) {
	      var range = this.maxDistance - this.minDistance;
	      if (range > Globals.EpsilonFloat) {
	        // Compute the distance attenuation value by the logarithmic curve
	        // "1 / (d + 1)" with an offset of |minDistance|.
	        var relativeDistance = distance - this.minDistance;
	        var attenuation = 1 / (relativeDistance + 1);
	        var attenuationMax = 1 / (range + 1);
	        gain = (attenuation - attenuationMax) / (1 - attenuationMax);
	      }
	    }
	  } else if (this._rolloffModel == 'linear') {
	    if (distance > this.maxDistance) {
	      gain = 0;
	    } else if (distance > this.minDistance) {
	      var range = this.maxDistance - this.minDistance;
	      if (range > Globals.EpsilonFloat) {
	        gain = (this.maxDistance - distance) / range;
	      }
	    }
	  }
	  this._gainNode.gain.value = gain;
	}

	/**
	 * Set rolloff model.
	 * @param {string} rolloffModel
	 * Rolloff model to use, chosen from options in
	 * {@link Globals.RolloffModels Global.RolloffModels}.
	 */
	Attenuation.prototype.setRolloffModel = function (rolloffModel) {
	  var isValidModel = ~Globals.RolloffModels.indexOf(rolloffModel);
	  if (rolloffModel == undefined || !isValidModel) {
	    if (!isValidModel) {
	      Utils.log('Invalid rolloff model. Using default: \"' +
	        Globals.DefaultRolloffModel + '\".');
	    }
	    rolloffModel = Globals.DefaultRolloffModel;
	  }
	  this._rolloffModel = rolloffModel;
	}

	module.exports = Attenuation;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2017 Google Inc. All Rights Reserved.
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * @file Pre-defined wall materials and mathematical constants.
	 * @author Andrew Allen <bitllama@google.com>
	 */

	'use strict';

	// Internal dependencies.
	var Globals = __webpack_require__(5);
	var Utils = __webpack_require__(4);

	/**
	 * @class Room
	 */
	var Room = {};

	// Reverb/reflections constants.
	Room.MinVolume = 1e-4;
	Room.AirAbsorbtionCoefficients =
	  [0.0006, 0.0006, 0.0007, 0.0008, 0.0010, 0.0015, 0.0026, 0.0060, 0.0207];

	/** Wall types are 'left', 'right', 'front', 'back', 'ceiling', and 'floor'. */
	Room.WallTypes = ['left', 'right', 'front', 'back', 'ceiling', 'floor'];
	Room.NumWalls = Room.WallTypes.length;

	Room.DimensionTypes = ['width', 'height', 'depth'];
	Room.NumDimensions = Room.DimensionTypes.length;

	/**
	 * Default dimensions use scalars assigned to
	 * keys 'width', 'height', and 'depth'.
	 * @type {Map}
	 */
	Room.DefaultDimensions = {'width' : 0, 'height' : 0, 'depth' : 0};
	/**
	 * Default materials use strings from
	 * {@link Room.MaterialCoefficients Room.MaterialCoefficients}
	 * assigned to keys 'left', 'right', 'front', 'back', 'floor', and 'ceiling'.
	 * @type {Map}
	 */
	Room.DefaultMaterials = { 'left' : 'Transparent', 'right' : 'Transparent',
	  'front' : 'Transparent', 'back' : 'Transparent', 'floor' : 'Transparent',
	  'ceiling' : 'Transparent'}

	/**
	 * Pre-defined frequency-dependent absorption coefficients for listed materials.
	 * Currently supported materials are:
	 * 'Transparent',
	 * 'AcousticCeilingTiles',
	 * 'BrickBare',
	 * 'BrickPainted',
	 * 'ConcreteBlockCoarse',
	 * 'ConcreteBlockPainted',
	 * 'CurtainHeavy',
	 * 'FiberGlassInsulation',
	 * 'GlassThin',
	 * 'GlassThick',
	 * 'Grass',
	 * 'LinoleumOnConcrete',
	 * 'Marble',
	 * 'Metal',
	 * 'ParquetOnConcrete',
	 * 'PlasterSmooth',
	 * 'PlywoodPanel',
	 * 'PolishedConcreteOrTile',
	 * 'Sheetrock',
	 * 'WaterOrIceSurface',
	 * 'WoodCeiling',
	 * 'WoodPanel',
	 * 'Uniform'
	 * @type {Map}
	 */
	Room.MaterialCoefficients = {
	  'Transparent' :
	  [1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000],
	  'AcousticCeilingTiles' :
	  [0.672, 0.675, 0.700, 0.660, 0.720, 0.920, 0.880, 0.750, 1.000],
	  'BrickBare' :
	  [0.030, 0.030, 0.030, 0.030, 0.030, 0.040, 0.050, 0.070, 0.140],
	  'BrickPainted' :
	  [0.006, 0.007, 0.010, 0.010, 0.020, 0.020, 0.020, 0.030, 0.060],
	  'ConcreteBlockCoarse' :
	  [0.360, 0.360, 0.360, 0.440, 0.310, 0.290, 0.390, 0.250, 0.500],
	  'ConcreteBlockPainted' :
	  [0.092, 0.090, 0.100, 0.050, 0.060, 0.070, 0.090, 0.080, 0.160],
	  'CurtainHeavy' :
	  [0.073, 0.106, 0.140, 0.350, 0.550, 0.720, 0.700, 0.650, 1.000],
	  'FiberGlassInsulation' :
	  [0.193, 0.220, 0.220, 0.820, 0.990, 0.990, 0.990, 0.990, 1.000],
	  'GlassThin' :
	  [0.180, 0.169, 0.180, 0.060, 0.040, 0.030, 0.020, 0.020, 0.040],
	  'GlassThick' :
	  [0.350, 0.350, 0.350, 0.250, 0.180, 0.120, 0.070, 0.040, 0.080],
	  'Grass' :
	  [0.050, 0.050, 0.150, 0.250, 0.400, 0.550, 0.600, 0.600, 0.600],
	  'LinoleumOnConcrete' :
	  [0.020, 0.020, 0.020, 0.030, 0.030, 0.030, 0.030, 0.020, 0.040],
	  'Marble' :
	  [0.010, 0.010, 0.010, 0.010, 0.010, 0.010, 0.020, 0.020, 0.0400],
	  'Metal' :
	  [0.030, 0.035, 0.040, 0.040, 0.050, 0.050, 0.050, 0.070, 0.090],
	  'ParquetOnConcrete' :
	  [0.028, 0.030, 0.040, 0.040, 0.070, 0.060, 0.060, 0.070, 0.140],
	  'PlasterRough' :
	  [0.017, 0.018, 0.020, 0.030, 0.040, 0.050, 0.040, 0.030, 0.060],
	  'PlasterSmooth' :
	  [0.011, 0.012, 0.013, 0.015, 0.020, 0.030, 0.040, 0.050, 0.100],
	  'PlywoodPanel' :
	  [0.400, 0.340, 0.280, 0.220, 0.170, 0.090, 0.100, 0.110, 0.220],
	  'PolishedConcreteOrTile' :
	  [0.008, 0.008, 0.010, 0.010, 0.015, 0.020, 0.020, 0.020, 0.040],
	  'Sheetrock' :
	  [0.290, 0.279, 0.290, 0.100, 0.050, 0.040, 0.070, 0.090, 0.180],
	  'WaterOrIceSurface' :
	  [0.006, 0.006, 0.008, 0.008, 0.013, 0.015, 0.020, 0.025, 0.050],
	  'WoodCeiling' :
	  [0.150, 0.147, 0.150, 0.110, 0.100, 0.070, 0.060, 0.070, 0.140],
	  'WoodPanel' :
	  [0.280, 0.280, 0.280, 0.220, 0.170, 0.090, 0.100, 0.110, 0.220],
	  'Uniform' :
	  [0.500, 0.500, 0.500, 0.500, 0.500, 0.500, 0.500, 0.500, 0.500]
	}

	Room.getCoefficientsFromMaterials = function(materials) {
	  // Initialize coefficients to use default coefficients.
	  var coefficients = {};
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    var defaultMaterialForWall = Room.DefaultMaterials[key];
	    coefficients[key] = Room.MaterialCoefficients[defaultMaterialForWall];
	  }

	  // Sanitize materials.
	  if (materials == undefined) {
	    materials = Room.DefaultMaterials;
	  }

	  // Default to using 'Walls' for all walls if present (not ceiling/floor).
	  if ('walls' in materials) {
	    for (var i = 0; i < Room.NumWalls; i++) {
	      var key = Room.WallTypes[i];
	      if (key !== 'ceiling' && key !== 'floor') {
	        materials[key] = materials['walls'];
	      }
	    }
	  }

	  // Assign coefficients using provided materials.
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    if (key in materials) {
	      var defaultMaterialForWall = Room.DefaultMaterials[key];
	      if (materials[key] in Room.MaterialCoefficients) {
	        coefficients[key] = Room.MaterialCoefficients[materials[key]];
	      } else {
	        Utils.log('Material \"' + materials[key] + '\" on Wall \"' + key +
	          '\" not found. Using \"' + defaultMaterialForWall + '\".');
	      }
	    } else {
	      Utils.log('Wall \"' + key + '\" is not defined and will be ignored.');
	    }
	  }
	  return coefficients;
	}

	Room.sanitizeCoefficients = function(coefficients) {
	  if (coefficients == undefined) {
	    coefficients = {};
	  }
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    if (!(key in coefficients)) {
	      // If element is not present, use default coefficients.
	      var defaultMaterialForWall = Room.DefaultMaterials[key];
	      coefficients[key] = Room.MaterialCoefficients[defaultMaterialForWall];
	    }
	  }
	  return coefficients;
	}

	Room.sanitizeDimensions = function(dimensions) {
	  if (dimensions == undefined) {
	    dimensions = {};
	  }
	  for (var i = 0; i < Room.NumDimensions; i++) {
	    var key = Room.DimensionTypes[i];
	    if (!(key in dimensions)) {
	      dimensions[key] = Room.DefaultDimensions[key];
	    }
	  }
	  return dimensions;
	}

	Room.computeReflectionCoefficients = function(coefficients) {
	  var reflectionCoefficients = {'left' : 0, 'right' : 0, 'front' : 0,
	    'back' : 0, 'floor' : 0, 'ceiling' : 0};

	  // Sanitize inputs.
	  coefficients = Room.sanitizeCoefficients(coefficients);

	  // Compute average reflection coefficient per wall.
	  for (var i = 0; i < Room.NumWalls; i++) {
	    var key = Room.WallTypes[i];
	    for (var j = 0; j < Globals.DefaultReflectionsNumAveragingBands; j++) {
	      var bandIndex = j + Globals.DefaultReflectionsStartingBand;
	      reflectionCoefficients[key] += coefficients[key][bandIndex];
	    }
	    reflectionCoefficients[key] /= Globals.DefaultReflectionsNumAveragingBands;
	    reflectionCoefficients[key] = Math.sqrt(1 - reflectionCoefficients[key]);
	  }
	  return reflectionCoefficients;
	}

	Room.computeRT60Secs = function(dimensions, coefficients, speedOfSound) {
	  var RT60Secs = new Float32Array(Globals.NumReverbBands);

	  // Sanitize inputs.
	  dimensions = Room.sanitizeDimensions(dimensions);
	  coefficients = Room.sanitizeCoefficients(coefficients);
	  if (speedOfSound == undefined) {
	    speedOfSound = Globals.DefaultSpeedOfSound;
	  }

	  // Acoustic constant.
	  var k = Globals.TwentyFourLog10 / speedOfSound;

	  // Compute volume, skip if room is not present.
	  var volume = dimensions['width'] * dimensions['height'] * dimensions['depth'];
	  if (volume < Room.MinVolume) {
	    return RT60Secs;
	  }

	  // Room surface area.
	  var leftRightArea = dimensions['width'] * dimensions['height'];
	  var floorCeilingArea = dimensions['width'] * dimensions['depth'];
	  var frontBackArea = dimensions['depth'] * dimensions['height'];
	  var totalArea = 2 * (leftRightArea + floorCeilingArea + frontBackArea);
	  for (var i = 0; i < Globals.NumReverbBands; i++) {
	    // Effective absorptive area.
	    var absorbtionArea =
	      (coefficients['left'][i] + coefficients['right'][i]) *
	      leftRightArea +
	      (coefficients['floor'][i] + coefficients['ceiling'][i]) *
	      floorCeilingArea +
	      (coefficients['front'][i] + coefficients['back'][i]) *
	      frontBackArea;
	    var meanAbsorbtionArea = absorbtionArea / totalArea;

	    // Compute reverberation using one of two algorithms, depending on area.
	    //TODO(bitllama): Point to references for these equations.
	    if (meanAbsorbtionArea <= 0.5) {
	      // Sabine equation.
	      RT60Secs[i] = k * volume / (absorbtionArea + 4 *
	        Room.AirAbsorbtionCoefficients[i] * volume);
	    } else {
	      // Eyring equation.
	      RT60Secs[i] = k * volume / (-totalArea * Math.log(1 -
	        meanAbsorbtionArea) + 4 * Room.AirAbsorbtionCoefficients[i] * volume);
	    }
	  }
	  return RT60Secs;
	}

	module.exports = Room;


/***/ })
/******/ ])
});
;