;(function() {
var util, base, animate, hammer, core, components_scrollbar, components_controller, simulate_scroll, origin_scroll, _xscroll_, xscroll_master, _events_, _easing_, _timer_, _boundry_;
util = function (exports) {
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
  var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
  var RE_DASH = /-([a-z])/gi;
  function upperCase() {
    return arguments[1].toUpperCase();
  }
  function Empty() {
  }
  function createObject(proto, constructor) {
    var newProto;
    if (Object.create) {
      newProto = Object.create(proto);
    } else {
      Empty.prototype = proto;
      newProto = new Empty();
    }
    newProto.constructor = constructor;
    return newProto;
  }
  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  var guid = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };
  var Util = {
    // Is a given variable an object?
    isObject: function (obj) {
      return obj === Object(obj);
    },
    isArray: Array.isArray || function (obj) {
      return toString.call(obj) == '[object Array]';
    },
    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    isEmpty: function (obj) {
      if (obj == null)
        return true;
      if (this.isArray(obj) || this.isString(obj))
        return obj.length === 0;
      for (var key in obj)
        if (this.has(obj, key))
          return false;
      return true;
    },
    mix: function (to, from, deep) {
      for (var i in from) {
        to[i] = from[i];
      }
      return to;
    },
    extend: function (r, s, px, sx) {
      if (!s || !r) {
        return r;
      }
      var sp = s.prototype, rp;
      // add prototype chain
      rp = createObject(sp, r);
      r.prototype = this.mix(rp, r.prototype);
      r.superclass = createObject(sp, s);
      // add prototype overrides
      if (px) {
        this.mix(rp, px);
      }
      // add object overrides
      if (sx) {
        this.mix(r, sx);
      }
      return r;
    },
    /**
     * test whether a string start with a specified substring
     * @param {String} str the whole string
     * @param {String} prefix a specified substring
     * @return {Boolean} whether str start with prefix
     * @member util
     */
    startsWith: function (str, prefix) {
      return str.lastIndexOf(prefix, 0) === 0;
    },
    /**
     * test whether a string end with a specified substring
     * @param {String} str the whole string
     * @param {String} suffix a specified substring
     * @return {Boolean} whether str end with suffix
     * @member util
     */
    endsWith: function (str, suffix) {
      var ind = str.length - suffix.length;
      return ind >= 0 && str.indexOf(suffix, ind) === ind;
    },
    /**
     * Removes the whitespace from the beginning and end of a string.
     * @method
     * @member util
     */
    trim: trim ? function (str) {
      return str == null ? EMPTY : trim.call(str);
    } : function (str) {
      return str == null ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
    },
    /**
     * Substitutes keywords in a string using an object/array.
     * Removes undef keywords and ignores escaped keywords.
     * @param {String} str template string
     * @param {Object} o json data
     * @member util
     * @param {RegExp} [regexp] to match a piece of template string
     */
    substitute: function (str, o, regexp) {
      if (typeof str !== 'string' || !o) {
        return str;
      }
      return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
        if (match.charAt(0) === '\\') {
          return match.slice(1);
        }
        return o[name] === undefined ? EMPTY : o[name];
      });
    },
    /*
        vendors
        @example webkit|moz|ms|O 
    	*/
    vendor: function () {
      var el = document.createElement('div').style;
      var vendors = [
          't',
          'webkitT',
          'MozT',
          'msT',
          'OT'
        ], transform, i = 0, l = vendors.length;
      for (; i < l; i++) {
        transform = vendors[i] + 'ransform';
        if (transform in el)
          return vendors[i].substr(0, vendors[i].length - 1);
      }
      return false;
    }(),
    /**
     *  attrs with vendor
     *  @return { String }
     **/
    prefixStyle: function (style) {
      if (this.vendor === false)
        return false;
      if (this.vendor === '')
        return style;
      return this.vendor + style.charAt(0).toUpperCase() + style.substr(1);
    },
    hasClass: function (el, className) {
      return el && el.className && className && el.className.indexOf(className) != -1;
    },
    addClass: function (el, className) {
      if (el && className && !this.hasClass(el, className)) {
        el.className += ' ' + className;
      }
    },
    removeClass: function (el, className) {
      if (el && el.className && className) {
        el.className = el.className.replace(className, '');
      }
    },
    getOffsetTop: function (e) {
      var offset = e.offsetTop;
      if (e.offsetParent != null)
        offset += this.getOffsetTop(e.offsetParent);
      return offset;
    },
    getOffsetLeft: function (e) {
      var offset = e.offsetLeft;
      if (e.offsetParent != null)
        offset += this.getOffsetLeft(e.offsetParent);
      return offset;
    },
    findParentEl: function (el, selector, rootNode) {
      var rs = null;
      rootNode = rootNode || document.body;
      if (!el || !selector)
        return;
      if (el.className.match(selector.replace(/\.|#/g, ''))) {
        return el;
      }
      while (!rs) {
        rs = el.parentNode;
        if (el == rootNode)
          break;
        if (rs) {
          return rs;
          break;
        } else {
          el = el.parentNode;
        }
      }
      return null;
    },
    guid: guid,
    isAndroid: function () {
      return /Android /.test(window.navigator.appVersion);
    },
    isBadAndroid: function () {
      return /Android /.test(window.navigator.appVersion) && !/Chrome\/\d/.test(window.navigator.appVersion);
    },
    px2Num: function (px) {
      return Number(px.replace(/px/, ''));
    }
  };
  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  var names = [
    'Arguments',
    'Function',
    'String',
    'Number',
    'Date',
    'RegExp'
  ];
  for (var i = 0; i < names.length; i++) {
    Util['is' + names[i]] = function (obj) {
      return toString.call(obj) == '[object ' + names[i] + ']';
    };
  }
  if (typeof module == 'object' && module.exports) {
    exports = Util;
  } else {
    return Util;
  }
  return exports;
}({});
_events_ = function (exports) {
  var Util = util;
  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  var _once = function (func) {
    var ran = false, memo;
    return function () {
      if (ran)
        return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };
  /**
   * @discription events
   * @mixin
   */
  var Events = {
    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function (name, callback, context) {
      if (!eventsApi(this, 'on', name, [
          callback,
          context
        ]) || !callback)
        return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({
        callback: callback,
        context: context,
        ctx: context || this
      });
      return this;
    },
    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function (name, callback, context) {
      if (!eventsApi(this, 'once', name, [
          callback,
          context
        ]) || !callback)
        return this;
      var self = this;
      var once = _once(function () {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },
    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function (name, callback, context) {
      if (!this._events || !eventsApi(this, 'off', name, [
          callback,
          context
        ]))
        return this;
      // Remove all callbacks for all events.
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      var names = name ? [name] : Object.keys(this._events);
      for (var i = 0, length = names.length; i < length; i++) {
        name = names[i];
        // Bail out if there are no events stored.
        var events = this._events[name];
        if (!events)
          continue;
        // Remove all callbacks for this event.
        if (!callback && !context) {
          delete this._events[name];
          continue;
        }
        // Find any remaining events.
        var remaining = [];
        for (var j = 0, k = events.length; j < k; j++) {
          var event = events[j];
          if (callback && callback !== event.callback && callback !== event.callback._callback || context && context !== event.context) {
            remaining.push(event);
          }
        }
        // Replace events if there are any remaining.  Otherwise, clean up.
        if (remaining.length) {
          this._events[name] = remaining;
        } else {
          delete this._events[name];
        }
      }
      return this;
    },
    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function (name) {
      if (!this._events)
        return this;
      var args = Array.prototype.slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args))
        return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events)
        triggerEvents(events, args);
      if (allEvents)
        triggerEvents(allEvents, arguments);
      return this;
    },
    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    listenTo: function (obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = Util.guid('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object')
        callback = this;
      obj.on(name, callback, this);
      return this;
    },
    listenToOnce: function (obj, name, callback) {
      if (typeof name === 'object') {
        for (var event in name)
          this.listenToOnce(obj, event, name[event]);
        return this;
      }
      var cb = _once(function () {
        this.stopListening(obj, name, cb);
        callback.apply(this, arguments);
      });
      cb._callback = callback;
      return this.listenTo(obj, name, cb);
    },
    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function (obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo)
        return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object')
        callback = this;
      if (obj)
        (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || Util.isEmpty(obj._events))
          delete this._listeningTo[id];
      }
      return this;
    }
  };
  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;
  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function (obj, action, name, rest) {
    if (!name)
      return true;
    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [
          key,
          name[key]
        ].concat(rest));
      }
      return false;
    }
    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, length = names.length; i < length; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }
    return true;
  };
  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  var triggerEvents = function (events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
    case 0:
      while (++i < l)
        (ev = events[i]).callback.call(ev.ctx);
      return;
    case 1:
      while (++i < l)
        (ev = events[i]).callback.call(ev.ctx, a1);
      return;
    case 2:
      while (++i < l)
        (ev = events[i]).callback.call(ev.ctx, a1, a2);
      return;
    case 3:
      while (++i < l)
        (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
      return;
    default:
      while (++i < l)
        (ev = events[i]).callback.apply(ev.ctx, args);
      return;
    }
  };
  // Aliases for backwards compatibility.
  Events.bind = Events.on;
  Events.unbind = Events.off;
  if (typeof module == 'object' && module.exports) {
    exports = Events;
  } else {
    return Events;
  }
  return exports;
}({});
base = function (exports) {
  var Util = util;
  var Events = _events_;
  /** 
  @constructor 
  @mixes Events
  */
  var Base = function () {
  };
  Util.mix(Base.prototype, Events);
  Util.mix(Base.prototype, {
    /**
     * @memberof Base
     * @param  {object} plugin plug a plugin
     */
    plug: function (plugin) {
      var self = this;
      if (!plugin || !plugin.pluginId)
        return;
      if (!self.__plugins) {
        self.__plugins = [];
      }
      plugin.pluginInitializer(self);
      self.__plugins.push(plugin);
    },
    /**
     * @memberof Base
     * @param  {object|string} plugin unplug a plugin by pluginId or plugin instance
     */
    unplug: function (plugin) {
      var self = this;
      if (!plugin)
        return;
      var _plugin = typeof plugin == 'string' ? self.getPlugin(plugin) : plugin;
      _plugin.pluginDestructor(self);
      for (var i in self.__plugins) {
        if (self.__plugins[i] == _plugin) {
          return self.__plugins.splice(i, 1);
        }
      }
    },
    /**
     * @memberof Base
     * @param  {object|string} plugin get plugin by pluginId
     */
    getPlugin: function (pluginId) {
      var self = this;
      var plugins = [];
      for (var i in self.__plugins) {
        if (self.__plugins[i] && self.__plugins[i].pluginId == pluginId) {
          plugins.push(self.__plugins[i]);
        }
      }
      return plugins.length > 1 ? plugins : plugins[0] || null;
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = Base;
  } else {
    return Base;
  }
  return exports;
}({});
_easing_ = function (exports) {
  //easing
  var Easing = {
    'linear': [
      0,
      0,
      1,
      1
    ],
    'ease': [
      0.25,
      0.1,
      0.25,
      1
    ],
    'ease-out': [
      0,
      0,
      0.58,
      1
    ],
    'ease-in-out': [
      0.42,
      0,
      0.58,
      1
    ],
    'quadratic': [
      0.33,
      0.66,
      0.66,
      1
    ],
    'circular': [
      0.1,
      0.57,
      0.1,
      1
    ],
    'bounce': [
      0.71,
      1.35,
      0.47,
      1.41
    ],
    format: function (easing) {
      if (!easing)
        return;
      if (typeof easing === 'string' && this[easing]) {
        return this[easing] instanceof Array ? [
          ' cubic-bezier(',
          this[easing],
          ') '
        ].join('') : this[easing];
      }
      if (easing instanceof Array) {
        return [
          ' cubic-bezier(',
          easing,
          ') '
        ].join('');
      }
      return easing;
    }
  };
  if (typeof module == 'object' && module.exports) {
    exports = Easing;
  } else {
    return Easing;
  }
  return exports;
}({});
_timer_ = function (exports) {
  var Util = util;
  var Base = base;
  var Easing = _easing_;
  var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
  var vendors = [
    'webkit',
    'moz',
    'ms',
    'o'
  ];
  var cancelRAF = window.cancelAnimationFrame;
  for (var i = 0; i < vendors.length; i++) {
    if (window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame']) {
      cancelRAF = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame'];
    }
  }
  cancelRAF = cancelRAF || window.clearTimeout;
  function Bezier(x1, y1, x2, y2, epsilon) {
    var curveX = function (t) {
      var v = 1 - t;
      return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
    };
    var curveY = function (t) {
      var v = 1 - t;
      return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
    };
    var derivativeCurveX = function (t) {
      var v = 1 - t;
      return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (-t * t * t + 2 * v * t) * x2;
    };
    return function (t) {
      var x = t, t0, t1, t2, x2, d2, i;
      // First try a few iterations of Newton's method -- normally very fast.
      for (t2 = x, i = 0; i < 8; i++) {
        x2 = curveX(t2) - x;
        if (Math.abs(x2) < epsilon)
          return curveY(t2);
        d2 = derivativeCurveX(t2);
        if (Math.abs(d2) < 0.000001)
          break;
        t2 = t2 - x2 / d2;
      }
      t0 = 0, t1 = 1, t2 = x;
      if (t2 < t0)
        return curveY(t0);
      if (t2 > t1)
        return curveY(t1);
      // Fallback to the bisection method for reliability.
      while (t0 < t1) {
        x2 = curveX(t2);
        if (Math.abs(x2 - x) < epsilon)
          return curveY(t2);
        if (x > x2)
          t0 = t2;
        else
          t1 = t2;
        t2 = (t1 - t0) * 0.5 + t0;
      }
      // Failure
      return curveY(t2);
    };
  }
  function Timer(cfg) {
    var self = this;
    self.cfg = Util.mix({ easing: 'linear' }, cfg);
  }
  Timer.MIN_DURATION = 1;
  Util.extend(Timer, Base, {
    reset: function (cfg) {
      var self = this;
      Util.mix(self.cfg, cfg);
      self.isfinished = false;
      self.percent = 0;
      delete self._stop;
    },
    run: function () {
      var self = this;
      var duration = self.cfg.duration;
      if (duration <= Timer.MIN_DURATION) {
        self.isfinished = true;
        self.trigger('run', { percent: 1 });
        self.trigger('end', { percent: 1 });
      }
      if (self.isfinished)
        return;
      self._hasFinishedPercent = self._stop && self._stop.percent || 0;
      delete self._stop;
      self.start = Date.now();
      self.percent = 0;
      // epsilon determines the precision of the solved values
      var epsilon = 1000 / 60 / duration / 4;
      var b = Easing[self.cfg.easing];
      self.easingFn = Bezier(b[0], b[1], b[2], b[3], epsilon);
      self._run();
    },
    _run: function () {
      var self = this;
      cancelRAF(self._raf);
      self._raf = RAF(function () {
        self.now = Date.now();
        self.duration = self.now - self.start >= self.cfg.duration ? self.cfg.duration : self.now - self.start;
        self.progress = self.easingFn(self.duration / self.cfg.duration);
        self.percent = self.duration / self.cfg.duration + self._hasFinishedPercent;
        if (self.percent >= 1 || self._stop) {
          self.percent = self._stop && self._stop.percent ? self._stop.percent : 1;
          self.duration = self._stop && self._stop.duration ? self._stop.duration : self.duration;
          var param = { percent: self.percent };
          // self.trigger("run", param);
          self.trigger('stop', param);
          if (self.percent >= 1) {
            self.isfinished = true;
            self.trigger('end', { percent: 1 });
          }
          return;
        }
        self.trigger('run', { percent: self.progress });
        self._run();
      });
    },
    stop: function () {
      var self = this;
      self._stop = {
        percent: self.percent,
        now: self.now
      };
      cancelRAF(self._raf);
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = Timer;
  } else {
    return Timer;
  }
  return exports;
}({});
animate = function (exports) {
  var Util = util;
  var Timer = _timer_;
  var Easing = _easing_;
  var Base = base;
  //transform
  var vendorTransform = Util.prefixStyle('transform');
  //transition webkitTransition MozTransition OTransition msTtransition
  var vendorTransition = Util.prefixStyle('transition');
  var vendorTransitionDuration = Util.prefixStyle('transitionDuration');
  var vendorTransformOrigin = Util.prefixStyle('transformOrigin');
  var vendorTransitionEnd = Util.vendor ? Util.prefixStyle('transitionEnd') : 'transitionend';
  var vendorTransformStr = Util.vendor ? [
    '-',
    Util.vendor,
    '-transform'
  ].join('') : 'transform';
  var translateTpl = 'translateX({translateX}px) translateY({translateY}px) translateZ(0)';
  //limit attrs
  var animAttrs = {
    'transform': true,
    'opacity': true,
    'scrollTop': true,
    'scrollLeft': true
  };
  function myParse(v) {
    return Math.round(parseFloat(v) * 100000) / 100000;
  }
  function defaultDecompose() {
    return {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      skewY: 0,
      scaleX: 1,
      scaleY: 1
    };
  }
  function toMatrixArray(matrix) {
    matrix = matrix.split(/,/);
    matrix = Array.prototype.map.call(matrix, function (v) {
      return myParse(v);
    });
    return matrix;
  }
  function decomposeMatrix(matrix) {
    matrix = toMatrixArray(matrix);
    var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
    // Make sure matrix is not singular
    if (A * D - B * C) {
      scaleX = Math.sqrt(A * A + B * B);
      skew = (A * C + B * D) / (A * D - C * B);
      scaleY = (A * D - B * C) / scaleX;
      // step (6)
      if (A * D < B * C) {
        skew = -skew;
        scaleX = -scaleX;
      }
    } else {
      // In this case the elem shouldn't be rendered, hence scale == 0
      scaleX = scaleY = skew = 0;
    }
    // The recomposition order is very important
    // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
    return {
      translateX: myParse(matrix[4]),
      translateY: myParse(matrix[5]),
      rotate: myParse(Math.atan2(B, A) * 180 / Math.PI),
      skewX: myParse(Math.atan(skew) * 180 / Math.PI),
      skewY: 0,
      scaleX: myParse(scaleX),
      scaleY: myParse(scaleY)
    };
  }
  function getTransformInfo(transform) {
    transform = transform.split(')');
    var trim = Util.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
    // Loop through the transform properties, parse and multiply them
    while (++i < l) {
      split = transform[i].split('(');
      prop = trim(split[0]);
      val = split[1];
      switch (prop) {
      case 'translateX':
      case 'translateY':
      case 'scaleX':
      case 'scaleY':
        ret[prop] = myParse(val);
        break;
      case 'translate':
      case 'translate3d':
        val = val.split(',');
        ret.translateX = myParse(val[0]);
        ret.translateY = myParse(val[1] || 0);
        break;
      case 'scale':
        val = val.split(',');
        ret.scaleX = myParse(val[0]);
        ret.scaleY = myParse(val[1] || val[0]);
        break;
      case 'matrix':
        return decomposeMatrix(val);
      }
    }
    return ret;
  }
  /**
  * animate function
  * @constructor
  * @param {HTMLElement} el element to animate
  * @param {object} config config for animate
  * @extends {Base}
  */
  function Animate(el, cfg) {
    if (!el || !cfg || !cfg.css)
      return;
    var self = this;
    self.cfg = cfg;
    self.el = el;
    var duration = cfg.duration || 0, easing = cfg.easing || 'ease', delay = cfg.delay || 0;
    //trigger run
    if (cfg.run) {
      //frame animate
      self.timer = self.timer || new Timer({
        duration: Math.round(duration),
        easing: easing
      });
      self.timer.on('run', cfg.run);
    }
    self._bindEvt();
    return self;
  }
  function computeTransform(prevTransform, destTransform) {
    var transform = getTransformInfo(prevTransform);
    var dest = getTransformInfo(destTransform);
    var trans = {};
    for (var i in dest) {
      trans[i] = {
        prevVal: transform[i],
        newVal: dest[i]
      };
    }
    return trans;
  }
  //for scroll only
  function setStyle(el, styleName, prevVal, newVal, percent) {
    prevVal = isNaN(Number(prevVal)) ? 0 : Number(prevVal);
    var curVal = (newVal - prevVal) * percent + prevVal;
    css(el, styleName, curVal);
  }
  function css(el, styleName, val) {
    switch (styleName) {
    case 'scrollTop':
    case 'scrollLeft':
      el[styleName] = val;
      break;
    case 'transform':
      el.style[vendorTransform] = val;
    case 'opacity':
      el.style[styleName] = val;
      break;
    }
  }
  Util.extend(Animate, Base, {
    /**
     * to start the animation
     * @memberof Animate
     * @return {Animate}
     */
    run: function () {
      var self = this;
      var cfg = self.cfg, el = self.el, duration = cfg.duration || 0, easing = cfg.easing || 'ease', delay = cfg.delay || 0;
      self.__isTransitionEnd = false;
      clearTimeout(self.__itv);
      self.timer && self.timer.run();
      if (duration <= Timer.MIN_DURATION) {
        for (var i in cfg.css) {
          css(el, i, cfg.css[i]);
        }
        self.stop();
        return;
      }
      if (cfg.useTransition) {
        //transition
        el.style[vendorTransition] = Util.substitute('all {duration}ms {easing} {delay}ms', {
          duration: Math.round(duration),
          easing: Easing.format(easing),
          delay: delay
        });
        for (var i in cfg.css) {
          //set css
          css(el, i, cfg.css[i]);
        }
        self.__itv = setTimeout(function () {
          if (!self.__isTransitionEnd) {
            self.__isTransitionEnd = true;
            self.trigger('transitionend');
          }
        }, Number(duration) + 60);
      } else {
        var computeStyle = window.getComputedStyle(el);
        //transform
        if (cfg.css.transform) {
          var transmap = self.transmap = computeTransform(computeStyle[vendorTransform], cfg.css.transform);
          self.timer && self.timer.off('run', self.__handlers.transRun);
          self.timer && self.timer.on('run', self.__handlers.transRun, self);
        }
      }
      return self;
    },
    _transitionEndHandler: function (e) {
      var self = this;
      self.stop();
      self.__handlers.stop.call(self);
    },
    __handlers: {
      transRun: function (e) {
        var self = this;
        var transmap = self.transmap;
        var el = self.el;
        var newTrans = {};
        for (var i in transmap) {
          newTrans[i] = (transmap[i].newVal - transmap[i].prevVal) * e.percent + transmap[i].prevVal;
        }
        var ret = Util.substitute(translateTpl + ' ' + 'scale({scaleX},{scaleY})', newTrans);
        el.style[vendorTransform] = ret;
      },
      stop: function (e) {
        var self = this;
        var cfg = self.cfg;
        cfg.end && cfg.end({ percent: 1 });
      }
    },
    _bindEvt: function () {
      var self = this;
      var cfg = self.cfg;
      self.el.addEventListener(vendorTransitionEnd, function (e) {
        self.__isTransitionEnd = true;
        if (e.target !== e.currentTarget)
          return;
        self.trigger('transitionend', e);
      });
      self.on('transitionend', self._transitionEndHandler, self);
      var cssRun = function (e) {
        for (var i in cfg.css) {
          if (!/transform/.test(i)) {
            setStyle(el, i, computeStyle[i], cfg.css[i], e.percent);
          }
        }
      };
      self.timer && self.timer.on('run', cssRun);
      self.timer && self.timer.on('stop', self.__handlers.stop, self);
    },
    /**
     * to stop the animation
     * @memberof Animate
     * @return {Animate}
     */
    stop: function () {
      var self = this;
      if (self.cfg.useTransition && self.cfg.duration > Timer.MIN_DURATION) {
        var computeStyle = window.getComputedStyle(this.el);
        for (var i in self.cfg.css) {
          if (animAttrs[i]) {
            var value = /transform/.test(i) ? computeStyle[vendorTransform] : computeStyle[i];
            css(self.el, i, Util.substitute(translateTpl + ' ' + 'scale({scaleX},{scaleY})', getTransformInfo(value)));
          }
        }
        self.el.style[vendorTransition] = 'none';
      }
      self.timer && self.timer.stop() && self.timer.reset();
      return self;
    },
    /**
     * to reset the animation to a new state
     * @memberof Animate
     * @param {object} cfg cfg for new animation
     * @return {Animate}
     */
    reset: function (cfg) {
      var self = this;
      Util.mix(self.cfg, cfg);
      this.timer && self.timer.reset({
        duration: Math.round(self.cfg.duration),
        easing: self.cfg.easing
      });
      return self;
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = Animate;
  } else {
    return Animate;
  }
  return exports;
}({});
_boundry_ = function (exports) {
  var Util = util;
  function Boundry(cfg) {
    this.cfg = Util.mix({
      width: 0,
      height: 0
    }, cfg);
    this.init();
  }
  Util.mix(Boundry.prototype, {
    init: function () {
      var self = this;
      self._xtop = 0;
      self._xright = 0;
      self._xleft = 0;
      self._xbottom = 0;
      self.refresh({
        width: self.cfg.width,
        height: self.cfg.height
      });
    },
    reset: function () {
      this.resetTop();
      this.resetLeft();
      this.resetBottom();
      this.resetRight();
      return this;
    },
    resetTop: function () {
      this._xtop = 0;
      this.refresh();
      return this;
    },
    resetLeft: function () {
      this._xleft = 0;
      this.refresh();
      return this;
    },
    resetBottom: function () {
      this._xbottom = 0;
      this.refresh();
      return this;
    },
    resetRight: function () {
      this._xright = 0;
      this.refresh();
      return this;
    },
    expandTop: function (top) {
      this._xtop = top;
      this.refresh();
      return this;
    },
    expandLeft: function (left) {
      this._xleft = left;
      this.refresh();
      return this;
    },
    expandRight: function (right) {
      this._xright = right;
      this.refresh();
      return this;
    },
    expandBottom: function (bottom) {
      this._xbottom = bottom;
      this.refresh();
      return this;
    },
    refresh: function (cfg) {
      Util.mix(this.cfg, cfg);
      this.top = this._xtop;
      this.left = this._xleft;
      this.bottom = (cfg && cfg.height || this.cfg.height || 0) - this._xbottom;
      this.right = (cfg && cfg.width || this.cfg.width || 0) - this._xright;
      return this;
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = Boundry;
  } else {
    return Boundry;
  }
  return exports;
}({});
hammer = function (exports) {
  /*! Hammer.JS - v2.0.4 - 2014-09-28
   * http://hammerjs.github.io/
   *
   * Copyright (c) 2014 Jorik Tangelder;
   * Licensed under the MIT license */
  (function (window, document, exportName, undefined) {
    
    var VENDOR_PREFIXES = [
      '',
      'webkit',
      'moz',
      'MS',
      'ms',
      'o'
    ];
    var TEST_ELEMENT = document.createElement('div');
    var TYPE_FUNCTION = 'function';
    var round = Math.round;
    var abs = Math.abs;
    var now = Date.now;
    /**
     * set a timeout with a given scope
     * @param {Function} fn
     * @param {Number} timeout
     * @param {Object} context
     * @returns {number}
     */
    function setTimeoutContext(fn, timeout, context) {
      return setTimeout(bindFn(fn, context), timeout);
    }
    /**
     * if the argument is an array, we want to execute the fn on each entry
     * if it aint an array we don't want to do a thing.
     * this is used by all the methods that accept a single and array argument.
     * @param {*|Array} arg
     * @param {String} fn
     * @param {Object} [context]
     * @returns {Boolean}
     */
    function invokeArrayArg(arg, fn, context) {
      if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
      }
      return false;
    }
    /**
     * walk objects and arrays
     * @param {Object} obj
     * @param {Function} iterator
     * @param {Object} context
     */
    function each(obj, iterator, context) {
      var i;
      if (!obj) {
        return;
      }
      if (obj.forEach) {
        obj.forEach(iterator, context);
      } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
          iterator.call(context, obj[i], i, obj);
          i++;
        }
      } else {
        for (i in obj) {
          obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
      }
    }
    /**
     * extend object.
     * means that properties in dest will be overwritten by the ones in src.
     * @param {Object} dest
     * @param {Object} src
     * @param {Boolean} [merge]
     * @returns {Object} dest
     */
    function extend(dest, src, merge) {
      var keys = Object.keys(src);
      var i = 0;
      while (i < keys.length) {
        if (!merge || merge && dest[keys[i]] === undefined) {
          dest[keys[i]] = src[keys[i]];
        }
        i++;
      }
      return dest;
    }
    /**
     * merge the values from src in the dest.
     * means that properties that exist in dest will not be overwritten by src
     * @param {Object} dest
     * @param {Object} src
     * @returns {Object} dest
     */
    function merge(dest, src) {
      return extend(dest, src, true);
    }
    /**
     * simple class inheritance
     * @param {Function} child
     * @param {Function} base
     * @param {Object} [properties]
     */
    function inherit(child, base, properties) {
      var baseP = base.prototype, childP;
      childP = child.prototype = Object.create(baseP);
      childP.constructor = child;
      childP._super = baseP;
      if (properties) {
        extend(childP, properties);
      }
    }
    /**
     * simple function bind
     * @param {Function} fn
     * @param {Object} context
     * @returns {Function}
     */
    function bindFn(fn, context) {
      return function boundFn() {
        return fn.apply(context, arguments);
      };
    }
    /**
     * let a boolean value also be a function that must return a boolean
     * this first item in args will be used as the context
     * @param {Boolean|Function} val
     * @param {Array} [args]
     * @returns {Boolean}
     */
    function boolOrFn(val, args) {
      if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
      }
      return val;
    }
    /**
     * use the val2 when val1 is undefined
     * @param {*} val1
     * @param {*} val2
     * @returns {*}
     */
    function ifUndefined(val1, val2) {
      return val1 === undefined ? val2 : val1;
    }
    /**
     * addEventListener with multiple events at once
     * @param {EventTarget} target
     * @param {String} types
     * @param {Function} handler
     */
    function addEventListeners(target, types, handler) {
      each(splitStr(types), function (type) {
        target.addEventListener(type, handler, false);
      });
    }
    /**
     * removeEventListener with multiple events at once
     * @param {EventTarget} target
     * @param {String} types
     * @param {Function} handler
     */
    function removeEventListeners(target, types, handler) {
      each(splitStr(types), function (type) {
        target.removeEventListener(type, handler, false);
      });
    }
    /**
     * find if a node is in the given parent
     * @method hasParent
     * @param {HTMLElement} node
     * @param {HTMLElement} parent
     * @return {Boolean} found
     */
    function hasParent(node, parent) {
      while (node) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    }
    /**
     * small indexOf wrapper
     * @param {String} str
     * @param {String} find
     * @returns {Boolean} found
     */
    function inStr(str, find) {
      return str.indexOf(find) > -1;
    }
    /**
     * split string on whitespace
     * @param {String} str
     * @returns {Array} words
     */
    function splitStr(str) {
      return str.trim().split(/\s+/g);
    }
    /**
     * find if a array contains the object using indexOf or a simple polyFill
     * @param {Array} src
     * @param {String} find
     * @param {String} [findByKey]
     * @return {Boolean|Number} false when not found, or the index
     */
    function inArray(src, find, findByKey) {
      if (src.indexOf && !findByKey) {
        return src.indexOf(find);
      } else {
        var i = 0;
        while (i < src.length) {
          if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
            return i;
          }
          i++;
        }
        return -1;
      }
    }
    /**
     * convert array-like objects to real arrays
     * @param {Object} obj
     * @returns {Array}
     */
    function toArray(obj) {
      return Array.prototype.slice.call(obj, 0);
    }
    /**
     * unique array with objects based on a key (like 'id') or just by the array's value
     * @param {Array} src [{id:1},{id:2},{id:1}]
     * @param {String} [key]
     * @param {Boolean} [sort=False]
     * @returns {Array} [{id:1},{id:2}]
     */
    function uniqueArray(src, key, sort) {
      var results = [];
      var values = [];
      var i = 0;
      while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
          results.push(src[i]);
        }
        values[i] = val;
        i++;
      }
      if (sort) {
        if (!key) {
          results = results.sort();
        } else {
          results = results.sort(function sortUniqueArray(a, b) {
            return a[key] > b[key];
          });
        }
      }
      return results;
    }
    /**
     * get the prefixed property
     * @param {Object} obj
     * @param {String} property
     * @returns {String|Undefined} prefixed
     */
    function prefixed(obj, property) {
      var prefix, prop;
      var camelProp = property[0].toUpperCase() + property.slice(1);
      var i = 0;
      while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = prefix ? prefix + camelProp : property;
        if (prop in obj) {
          return prop;
        }
        i++;
      }
      return undefined;
    }
    /**
     * get a unique id
     * @returns {number} uniqueId
     */
    var _uniqueId = 1;
    function uniqueId() {
      return _uniqueId++;
    }
    /**
     * get the window object of an element
     * @param {HTMLElement} element
     * @returns {DocumentView|Window}
     */
    function getWindowForElement(element) {
      var doc = element.ownerDocument;
      return doc.defaultView || doc.parentWindow;
    }
    var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
    var SUPPORT_TOUCH = 'ontouchstart' in window;
    var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
    var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
    var INPUT_TYPE_TOUCH = 'touch';
    var INPUT_TYPE_PEN = 'pen';
    var INPUT_TYPE_MOUSE = 'mouse';
    var INPUT_TYPE_KINECT = 'kinect';
    var COMPUTE_INTERVAL = 25;
    var INPUT_START = 1;
    var INPUT_MOVE = 2;
    var INPUT_END = 4;
    var INPUT_CANCEL = 8;
    var DIRECTION_NONE = 1;
    var DIRECTION_LEFT = 2;
    var DIRECTION_RIGHT = 4;
    var DIRECTION_UP = 8;
    var DIRECTION_DOWN = 16;
    var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
    var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
    var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
    var PROPS_XY = [
      'x',
      'y'
    ];
    var PROPS_CLIENT_XY = [
      'clientX',
      'clientY'
    ];
    /**
     * create new input type manager
     * @param {Manager} manager
     * @param {Function} callback
     * @returns {Input}
     * @constructor
     */
    function Input(manager, callback) {
      var self = this;
      this.manager = manager;
      this.callback = callback;
      this.element = manager.element;
      this.target = manager.options.inputTarget;
      // smaller wrapper around the handler, for the scope and the enabled state of the manager,
      // so when disabled the input events are completely bypassed.
      this.domHandler = function (ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
          self.handler(ev);
        }
      };
      this.init();
    }
    Input.prototype = {
      /**
       * should handle the inputEvent data and trigger the callback
       * @virtual
       */
      handler: function () {
      },
      /**
       * bind the events
       */
      init: function () {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
      },
      /**
       * unbind the events
       */
      destroy: function () {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
      }
    };
    /**
     * create new input type manager
     * called by the Manager constructor
     * @param {Hammer} manager
     * @returns {Input}
     */
    function createInputInstance(manager) {
      var Type;
      var inputClass = manager.options.inputClass;
      if (inputClass) {
        Type = inputClass;
      } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
      } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
      } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
      } else {
        Type = TouchMouseInput;
      }
      return new Type(manager, inputHandler);
    }
    /**
     * handle input events
     * @param {Manager} manager
     * @param {String} eventType
     * @param {Object} input
     */
    function inputHandler(manager, eventType, input) {
      var pointersLen = input.pointers.length;
      var changedPointersLen = input.changedPointers.length;
      var isFirst = eventType & INPUT_START && pointersLen - changedPointersLen === 0;
      var isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen === 0;
      input.isFirst = !!isFirst;
      input.isFinal = !!isFinal;
      if (isFirst) {
        manager.session = {};
      }
      // source event is the normalized value of the domEvents
      // like 'touchstart, mouseup, pointerdown'
      input.eventType = eventType;
      // compute scale, rotation etc
      computeInputData(manager, input);
      // emit secret event
      manager.emit('hammer.input', input);
      manager.recognize(input);
      manager.session.prevInput = input;
    }
    /**
     * extend the data with some usable properties like scale, rotate, velocity etc
     * @param {Object} manager
     * @param {Object} input
     */
    function computeInputData(manager, input) {
      var session = manager.session;
      var pointers = input.pointers;
      var pointersLength = pointers.length;
      // store the first input to calculate the distance and direction
      if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
      }
      // to compute scale and rotation we need to store the multiple touches
      if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
      } else if (pointersLength === 1) {
        session.firstMultiple = false;
      }
      var firstInput = session.firstInput;
      var firstMultiple = session.firstMultiple;
      var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
      var center = input.center = getCenter(pointers);
      input.timeStamp = now();
      input.deltaTime = input.timeStamp - firstInput.timeStamp;
      input.angle = getAngle(offsetCenter, center);
      input.distance = getDistance(offsetCenter, center);
      computeDeltaXY(session, input);
      input.offsetDirection = getDirection(input.deltaX, input.deltaY);
      input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
      input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
      computeIntervalInputData(session, input);
      // find the correct target
      var target = manager.element;
      if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
      }
      input.target = target;
    }
    function computeDeltaXY(session, input) {
      var center = input.center;
      var offset = session.offsetDelta || {};
      var prevDelta = session.prevDelta || {};
      var prevInput = session.prevInput || {};
      if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
          x: prevInput.deltaX || 0,
          y: prevInput.deltaY || 0
        };
        offset = session.offsetDelta = {
          x: center.x,
          y: center.y
        };
      }
      input.deltaX = prevDelta.x + (center.x - offset.x);
      input.deltaY = prevDelta.y + (center.y - offset.y);
    }
    /**
     * velocity is calculated every x ms
     * @param {Object} session
     * @param {Object} input
     */
    function computeIntervalInputData(session, input) {
      var last = session.lastInterval || input, deltaTime = input.timeStamp - last.timeStamp, velocity, velocityX, velocityY, direction;
      if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = last.deltaX - input.deltaX;
        var deltaY = last.deltaY - input.deltaY;
        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);
        session.lastInterval = input;
      } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
      }
      input.velocity = velocity;
      input.velocityX = velocityX;
      input.velocityY = velocityY;
      input.direction = direction;
    }
    /**
     * create a simple clone from the input used for storage of firstInput and firstMultiple
     * @param {Object} input
     * @returns {Object} clonedInputData
     */
    function simpleCloneInputData(input) {
      // make a simple copy of the pointers because we will get a reference if we don't
      // we only need clientXY for the calculations
      var pointers = [];
      var i = 0;
      while (i < input.pointers.length) {
        pointers[i] = {
          clientX: round(input.pointers[i].clientX),
          clientY: round(input.pointers[i].clientY)
        };
        i++;
      }
      return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
      };
    }
    /**
     * get the center of all the pointers
     * @param {Array} pointers
     * @return {Object} center contains `x` and `y` properties
     */
    function getCenter(pointers) {
      var pointersLength = pointers.length;
      // no need to loop when only one touch
      if (pointersLength === 1) {
        return {
          x: round(pointers[0].clientX),
          y: round(pointers[0].clientY)
        };
      }
      var x = 0, y = 0, i = 0;
      while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
      }
      return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
      };
    }
    /**
     * calculate the velocity between two points. unit is in px per ms.
     * @param {Number} deltaTime
     * @param {Number} x
     * @param {Number} y
     * @return {Object} velocity `x` and `y`
     */
    function getVelocity(deltaTime, x, y) {
      return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
      };
    }
    /**
     * get the direction between two points
     * @param {Number} x
     * @param {Number} y
     * @return {Number} direction
     */
    function getDirection(x, y) {
      if (x === y) {
        return DIRECTION_NONE;
      }
      if (abs(x) >= abs(y)) {
        return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }
    /**
     * calculate the absolute distance between two points
     * @param {Object} p1 {x, y}
     * @param {Object} p2 {x, y}
     * @param {Array} [props] containing x and y keys
     * @return {Number} distance
     */
    function getDistance(p1, p2, props) {
      if (!props) {
        props = PROPS_XY;
      }
      var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
      return Math.sqrt(x * x + y * y);
    }
    /**
     * calculate the angle between two coordinates
     * @param {Object} p1
     * @param {Object} p2
     * @param {Array} [props] containing x and y keys
     * @return {Number} angle
     */
    function getAngle(p1, p2, props) {
      if (!props) {
        props = PROPS_XY;
      }
      var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
      return Math.atan2(y, x) * 180 / Math.PI;
    }
    /**
     * calculate the rotation degrees between two pointersets
     * @param {Array} start array of pointers
     * @param {Array} end array of pointers
     * @return {Number} rotation
     */
    function getRotation(start, end) {
      return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
    }
    /**
     * calculate the scale factor between two pointersets
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @param {Array} start array of pointers
     * @param {Array} end array of pointers
     * @return {Number} scale
     */
    function getScale(start, end) {
      return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
    }
    var MOUSE_INPUT_MAP = {
      mousedown: INPUT_START,
      mousemove: INPUT_MOVE,
      mouseup: INPUT_END
    };
    var MOUSE_ELEMENT_EVENTS = 'mousedown';
    var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';
    /**
     * Mouse events input
     * @constructor
     * @extends Input
     */
    function MouseInput() {
      this.evEl = MOUSE_ELEMENT_EVENTS;
      this.evWin = MOUSE_WINDOW_EVENTS;
      this.allow = true;
      // used by Input.TouchMouse to disable mouse events
      this.pressed = false;
      // mousedown state
      Input.apply(this, arguments);
    }
    inherit(MouseInput, Input, {
      /**
       * handle mouse events
       * @param {Object} ev
       */
      handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];
        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
          this.pressed = true;
        }
        if (eventType & INPUT_MOVE && ev.which !== 1) {
          eventType = INPUT_END;
        }
        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
          return;
        }
        if (eventType & INPUT_END) {
          this.pressed = false;
        }
        this.callback(this.manager, eventType, {
          pointers: [ev],
          changedPointers: [ev],
          pointerType: INPUT_TYPE_MOUSE,
          srcEvent: ev
        });
      }
    });
    var POINTER_INPUT_MAP = {
      pointerdown: INPUT_START,
      pointermove: INPUT_MOVE,
      pointerup: INPUT_END,
      pointercancel: INPUT_CANCEL,
      pointerout: INPUT_CANCEL
    };
    // in IE10 the pointer types is defined as an enum
    var IE10_POINTER_TYPE_ENUM = {
      2: INPUT_TYPE_TOUCH,
      3: INPUT_TYPE_PEN,
      4: INPUT_TYPE_MOUSE,
      5: INPUT_TYPE_KINECT
    };
    var POINTER_ELEMENT_EVENTS = 'pointerdown';
    var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
    // IE10 has prefixed support, and case-sensitive
    if (window.MSPointerEvent) {
      POINTER_ELEMENT_EVENTS = 'MSPointerDown';
      POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
    }
    /**
     * Pointer events input
     * @constructor
     * @extends Input
     */
    function PointerEventInput() {
      this.evEl = POINTER_ELEMENT_EVENTS;
      this.evWin = POINTER_WINDOW_EVENTS;
      Input.apply(this, arguments);
      this.store = this.manager.session.pointerEvents = [];
    }
    inherit(PointerEventInput, Input, {
      /**
       * handle mouse events
       * @param {Object} ev
       */
      handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;
        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
        var isTouch = pointerType == INPUT_TYPE_TOUCH;
        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');
        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
          if (storeIndex < 0) {
            store.push(ev);
            storeIndex = store.length - 1;
          }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
          removePointer = true;
        }
        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
          return;
        }
        // update the event in the store
        store[storeIndex] = ev;
        this.callback(this.manager, eventType, {
          pointers: store,
          changedPointers: [ev],
          pointerType: pointerType,
          srcEvent: ev
        });
        if (removePointer) {
          // remove from the store
          store.splice(storeIndex, 1);
        }
      }
    });
    var SINGLE_TOUCH_INPUT_MAP = {
      touchstart: INPUT_START,
      touchmove: INPUT_MOVE,
      touchend: INPUT_END,
      touchcancel: INPUT_CANCEL
    };
    var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
    var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';
    /**
     * Touch events input
     * @constructor
     * @extends Input
     */
    function SingleTouchInput() {
      this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
      this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
      this.started = false;
      Input.apply(this, arguments);
    }
    inherit(SingleTouchInput, Input, {
      handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];
        // should we handle the touch events?
        if (type === INPUT_START) {
          this.started = true;
        }
        if (!this.started) {
          return;
        }
        var touches = normalizeSingleTouches.call(this, ev, type);
        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
          this.started = false;
        }
        this.callback(this.manager, type, {
          pointers: touches[0],
          changedPointers: touches[1],
          pointerType: INPUT_TYPE_TOUCH,
          srcEvent: ev
        });
      }
    });
    /**
     * @this {TouchInput}
     * @param {Object} ev
     * @param {Number} type flag
     * @returns {undefined|Array} [all, changed]
     */
    function normalizeSingleTouches(ev, type) {
      var all = toArray(ev.touches);
      var changed = toArray(ev.changedTouches);
      if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
      }
      return [
        all,
        changed
      ];
    }
    var TOUCH_INPUT_MAP = {
      touchstart: INPUT_START,
      touchmove: INPUT_MOVE,
      touchend: INPUT_END,
      touchcancel: INPUT_CANCEL
    };
    var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';
    /**
     * Multi-user touch events input
     * @constructor
     * @extends Input
     */
    function TouchInput() {
      this.evTarget = TOUCH_TARGET_EVENTS;
      this.targetIds = {};
      Input.apply(this, arguments);
    }
    inherit(TouchInput, Input, {
      handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
          return;
        }
        this.callback(this.manager, type, {
          pointers: touches[0],
          changedPointers: touches[1],
          pointerType: INPUT_TYPE_TOUCH,
          srcEvent: ev
        });
      }
    });
    /**
     * @this {TouchInput}
     * @param {Object} ev
     * @param {Number} type flag
     * @returns {undefined|Array} [all, changed]
     */
    function getTouches(ev, type) {
      var allTouches = toArray(ev.touches);
      var targetIds = this.targetIds;
      // when there is only one touch, the process can be simplified
      if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [
          allTouches,
          allTouches
        ];
      }
      var i, targetTouches, changedTouches = toArray(ev.changedTouches), changedTargetTouches = [], target = this.target;
      // get target touches from touches
      targetTouches = allTouches.filter(function (touch) {
        return hasParent(touch.target, target);
      });
      // collect touches
      if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
          targetIds[targetTouches[i].identifier] = true;
          i++;
        }
      }
      // filter changed touches to only contain touches that exist in the collected target ids
      i = 0;
      while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
          changedTargetTouches.push(changedTouches[i]);
        }
        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
          delete targetIds[changedTouches[i].identifier];
        }
        i++;
      }
      if (!changedTargetTouches.length) {
        return;
      }
      return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
      ];
    }
    /**
     * Combined touch and mouse input
     *
     * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
     * This because touch devices also emit mouse events while doing a touch.
     *
     * @constructor
     * @extends Input
     */
    function TouchMouseInput() {
      Input.apply(this, arguments);
      var handler = bindFn(this.handler, this);
      this.touch = new TouchInput(this.manager, handler);
      this.mouse = new MouseInput(this.manager, handler);
    }
    inherit(TouchMouseInput, Input, {
      /**
       * handle mouse and touch events
       * @param {Hammer} manager
       * @param {String} inputEvent
       * @param {Object} inputData
       */
      handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH, isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
          this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
          return;
        }
        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
          this.mouse.allow = true;
        }
        this.callback(manager, inputEvent, inputData);
      },
      /**
       * remove the event listeners
       */
      destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
      }
    });
    var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
    var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;
    // magical touchAction value
    var TOUCH_ACTION_COMPUTE = 'compute';
    var TOUCH_ACTION_AUTO = 'auto';
    var TOUCH_ACTION_MANIPULATION = 'manipulation';
    // not implemented
    var TOUCH_ACTION_NONE = 'none';
    var TOUCH_ACTION_PAN_X = 'pan-x';
    var TOUCH_ACTION_PAN_Y = 'pan-y';
    /**
     * Touch Action
     * sets the touchAction property or uses the js alternative
     * @param {Manager} manager
     * @param {String} value
     * @constructor
     */
    function TouchAction(manager, value) {
      this.manager = manager;
      this.set(value);
    }
    TouchAction.prototype = {
      /**
       * set the touchAction value on the element or enable the polyfill
       * @param {String} value
       */
      set: function (value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
          value = this.compute();
        }
        if (NATIVE_TOUCH_ACTION) {
          this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
      },
      /**
       * just re-set the touchAction value
       */
      update: function () {
        this.set(this.manager.options.touchAction);
      },
      /**
       * compute the value for the touchAction property based on the recognizer's settings
       * @returns {String} value
       */
      compute: function () {
        var actions = [];
        each(this.manager.recognizers, function (recognizer) {
          if (boolOrFn(recognizer.options.enable, [recognizer])) {
            actions = actions.concat(recognizer.getTouchAction());
          }
        });
        return cleanTouchActions(actions.join(' '));
      },
      /**
       * this method is called on each input cycle and provides the preventing of the browser behavior
       * @param {Object} input
       */
      preventDefaults: function (input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
          return;
        }
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;
        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
          srcEvent.preventDefault();
          return;
        }
        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
        if (hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL) {
          return this.preventSrc(srcEvent);
        }
      },
      /**
       * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
       * @param {Object} srcEvent
       */
      preventSrc: function (srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
      }
    };
    /**
     * when the touchActions are collected they are not a valid value, so we need to clean things up. *
     * @param {String} actions
     * @returns {*}
     */
    function cleanTouchActions(actions) {
      // none
      if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
      }
      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
      // pan-x and pan-y can be combined
      if (hasPanX && hasPanY) {
        return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
      }
      // pan-x OR pan-y
      if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
      }
      // manipulation
      if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
      }
      return TOUCH_ACTION_AUTO;
    }
    /**
     * Recognizer flow explained; *
     * All recognizers have the initial state of POSSIBLE when a input session starts.
     * The definition of a input session is from the first input until the last input, with all it's movement in it. *
     * Example session for mouse-input: mousedown -> mousemove -> mouseup
     *
     * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
     * which determines with state it should be.
     *
     * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
     * POSSIBLE to give it another change on the next cycle.
     *
     *               Possible
     *                  |
     *            +-----+---------------+
     *            |                     |
     *      +-----+-----+               |
     *      |           |               |
     *   Failed      Cancelled          |
     *                          +-------+------+
     *                          |              |
     *                      Recognized       Began
     *                                         |
     *                                      Changed
     *                                         |
     *                                  Ended/Recognized
     */
    var STATE_POSSIBLE = 1;
    var STATE_BEGAN = 2;
    var STATE_CHANGED = 4;
    var STATE_ENDED = 8;
    var STATE_RECOGNIZED = STATE_ENDED;
    var STATE_CANCELLED = 16;
    var STATE_FAILED = 32;
    /**
     * Recognizer
     * Every recognizer needs to extend from this class.
     * @constructor
     * @param {Object} options
     */
    function Recognizer(options) {
      this.id = uniqueId();
      this.manager = null;
      this.options = merge(options || {}, this.defaults);
      // default is enable true
      this.options.enable = ifUndefined(this.options.enable, true);
      this.state = STATE_POSSIBLE;
      this.simultaneous = {};
      this.requireFail = [];
    }
    Recognizer.prototype = {
      /**
       * @virtual
       * @type {Object}
       */
      defaults: {},
      /**
       * set options
       * @param {Object} options
       * @return {Recognizer}
       */
      set: function (options) {
        extend(this.options, options);
        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
      },
      /**
       * recognize simultaneous with an other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      recognizeWith: function (otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
          return this;
        }
        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
          simultaneous[otherRecognizer.id] = otherRecognizer;
          otherRecognizer.recognizeWith(this);
        }
        return this;
      },
      /**
       * drop the simultaneous link. it doesnt remove the link on the other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      dropRecognizeWith: function (otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
          return this;
        }
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
      },
      /**
       * recognizer can only run when an other is failing
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      requireFailure: function (otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
          return this;
        }
        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
          requireFail.push(otherRecognizer);
          otherRecognizer.requireFailure(this);
        }
        return this;
      },
      /**
       * drop the requireFailure link. it does not remove the link on the other recognizer.
       * @param {Recognizer} otherRecognizer
       * @returns {Recognizer} this
       */
      dropRequireFailure: function (otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
          return this;
        }
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
          this.requireFail.splice(index, 1);
        }
        return this;
      },
      /**
       * has require failures boolean
       * @returns {boolean}
       */
      hasRequireFailures: function () {
        return this.requireFail.length > 0;
      },
      /**
       * if the recognizer can recognize simultaneous with an other recognizer
       * @param {Recognizer} otherRecognizer
       * @returns {Boolean}
       */
      canRecognizeWith: function (otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
      },
      /**
       * You should use `tryEmit` instead of `emit` directly to check
       * that all the needed recognizers has failed before emitting.
       * @param {Object} input
       */
      emit: function (input) {
        var self = this;
        var state = this.state;
        function emit(withState) {
          self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
        }
        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
          emit(true);
        }
        emit();
        // simple 'eventName' events
        // panend and pancancel
        if (state >= STATE_ENDED) {
          emit(true);
        }
      },
      /**
       * Check that all the require failure recognizers has failed,
       * if true, it emits a gesture event,
       * otherwise, setup the state to FAILED.
       * @param {Object} input
       */
      tryEmit: function (input) {
        if (this.canEmit()) {
          return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
      },
      /**
       * can we emit?
       * @returns {boolean}
       */
      canEmit: function () {
        var i = 0;
        while (i < this.requireFail.length) {
          if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
            return false;
          }
          i++;
        }
        return true;
      },
      /**
       * update the recognizer
       * @param {Object} inputData
       */
      recognize: function (inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = extend({}, inputData);
        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [
            this,
            inputDataClone
          ])) {
          this.reset();
          this.state = STATE_FAILED;
          return;
        }
        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
          this.state = STATE_POSSIBLE;
        }
        this.state = this.process(inputDataClone);
        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
          this.tryEmit(inputDataClone);
        }
      },
      /**
       * return the state of the recognizer
       * the actual recognizing happens in this method
       * @virtual
       * @param {Object} inputData
       * @returns {Const} STATE
       */
      process: function (inputData) {
      },
      // jshint ignore:line
      /**
       * return the preferred touch-action
       * @virtual
       * @returns {Array}
       */
      getTouchAction: function () {
      },
      /**
       * called when the gesture isn't allowed to recognize
       * like when another is being recognized or it is disabled
       * @virtual
       */
      reset: function () {
      }
    };
    /**
     * get a usable string, used as event postfix
     * @param {Const} state
     * @returns {String} state
     */
    function stateStr(state) {
      if (state & STATE_CANCELLED) {
        return 'cancel';
      } else if (state & STATE_ENDED) {
        return 'end';
      } else if (state & STATE_CHANGED) {
        return 'move';
      } else if (state & STATE_BEGAN) {
        return 'start';
      }
      return '';
    }
    /**
     * direction cons to string
     * @param {Const} direction
     * @returns {String}
     */
    function directionStr(direction) {
      if (direction == DIRECTION_DOWN) {
        return 'down';
      } else if (direction == DIRECTION_UP) {
        return 'up';
      } else if (direction == DIRECTION_LEFT) {
        return 'left';
      } else if (direction == DIRECTION_RIGHT) {
        return 'right';
      }
      return '';
    }
    /**
     * get a recognizer by name if it is bound to a manager
     * @param {Recognizer|String} otherRecognizer
     * @param {Recognizer} recognizer
     * @returns {Recognizer}
     */
    function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
      var manager = recognizer.manager;
      if (manager) {
        return manager.get(otherRecognizer);
      }
      return otherRecognizer;
    }
    /**
     * This recognizer is just used as a base for the simple attribute recognizers.
     * @constructor
     * @extends Recognizer
     */
    function AttrRecognizer() {
      Recognizer.apply(this, arguments);
    }
    inherit(AttrRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof AttrRecognizer
       */
      defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
      },
      /**
       * Used to check if it the recognizer receives valid input, like input.distance > 10.
       * @memberof AttrRecognizer
       * @param {Object} input
       * @returns {Boolean} recognized
       */
      attrTest: function (input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
      },
      /**
       * Process the input and return the state for the recognizer
       * @memberof AttrRecognizer
       * @param {Object} input
       * @returns {*} State
       */
      process: function (input) {
        var state = this.state;
        var eventType = input.eventType;
        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);
        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
          return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
          if (eventType & INPUT_END) {
            return state | STATE_ENDED;
          } else if (!(state & STATE_BEGAN)) {
            return STATE_BEGAN;
          }
          return state | STATE_CHANGED;
        }
        return STATE_FAILED;
      }
    });
    /**
     * Pan
     * Recognized when the pointer is down and moved in the allowed direction.
     * @constructor
     * @extends AttrRecognizer
     */
    function PanRecognizer() {
      AttrRecognizer.apply(this, arguments);
      this.pX = null;
      this.pY = null;
    }
    inherit(PanRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof PanRecognizer
       */
      defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
      },
      getTouchAction: function () {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
          actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
          actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
      },
      directionTest: function (input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;
        // lock to axis?
        if (!(direction & options.direction)) {
          if (options.direction & DIRECTION_HORIZONTAL) {
            direction = x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
            hasMoved = x != this.pX;
            distance = Math.abs(input.deltaX);
          } else {
            direction = y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
            hasMoved = y != this.pY;
            distance = Math.abs(input.deltaY);
          }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
      },
      attrTest: function (input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
      },
      emit: function (input) {
        this.pX = input.deltaX;
        this.pY = input.deltaY;
        var direction = directionStr(input.direction);
        if (direction) {
          this.manager.emit(this.options.event + direction, input);
        }
        this._super.emit.call(this, input);
      },
      reset: function () {
      }
    });
    /**
     * Pinch
     * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
     * @constructor
     * @extends AttrRecognizer
     */
    function PinchRecognizer() {
      AttrRecognizer.apply(this, arguments);
    }
    inherit(PinchRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof PinchRecognizer
       */
      defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
      },
      getTouchAction: function () {
        return [TOUCH_ACTION_NONE];
      },
      attrTest: function (input) {
        return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
      },
      emit: function (input) {
        this._super.emit.call(this, input);
        if (input.scale !== 1) {
          var inOut = input.scale < 1 ? 'in' : 'out';
          this.manager.emit(this.options.event + inOut, input);
        }
      }
    });
    /**
     * Press
     * Recognized when the pointer is down for x ms without any movement.
     * @constructor
     * @extends Recognizer
     */
    function PressRecognizer() {
      Recognizer.apply(this, arguments);
      this._timer = null;
      this._input = null;
    }
    inherit(PressRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof PressRecognizer
       */
      defaults: {
        event: 'press',
        pointers: 1,
        time: 500,
        // minimal time of the pointer to be pressed
        threshold: 5
      },
      getTouchAction: function () {
        return [TOUCH_ACTION_AUTO];
      },
      process: function (input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;
        this._input = input;
        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) {
          this.reset();
        } else if (input.eventType & INPUT_START) {
          this.reset();
          this._timer = setTimeoutContext(function () {
            this.state = STATE_RECOGNIZED;
            this.tryEmit();
          }, options.time, this);
        } else if (input.eventType & INPUT_END) {
          return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
      },
      reset: function () {
        clearTimeout(this._timer);
      },
      emit: function (input) {
        if (this.state !== STATE_RECOGNIZED) {
          return;
        }
        if (input && input.eventType & INPUT_END) {
          this.manager.emit(this.options.event + 'up', input);
        } else {
          this._input.timeStamp = now();
          this.manager.emit(this.options.event, this._input);
        }
      }
    });
    /**
     * Rotate
     * Recognized when two or more pointer are moving in a circular motion.
     * @constructor
     * @extends AttrRecognizer
     */
    function RotateRecognizer() {
      AttrRecognizer.apply(this, arguments);
    }
    inherit(RotateRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof RotateRecognizer
       */
      defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
      },
      getTouchAction: function () {
        return [TOUCH_ACTION_NONE];
      },
      attrTest: function (input) {
        return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
      }
    });
    /**
     * Swipe
     * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
     * @constructor
     * @extends AttrRecognizer
     */
    function SwipeRecognizer() {
      AttrRecognizer.apply(this, arguments);
    }
    inherit(SwipeRecognizer, AttrRecognizer, {
      /**
       * @namespace
       * @memberof SwipeRecognizer
       */
      defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.65,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
      },
      getTouchAction: function () {
        return PanRecognizer.prototype.getTouchAction.call(this);
      },
      attrTest: function (input) {
        var direction = this.options.direction;
        var velocity;
        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
          velocity = input.velocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
          velocity = input.velocityX;
        } else if (direction & DIRECTION_VERTICAL) {
          velocity = input.velocityY;
        }
        return this._super.attrTest.call(this, input) && direction & input.direction && input.distance > this.options.threshold && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
      },
      emit: function (input) {
        var direction = directionStr(input.direction);
        if (direction) {
          this.manager.emit(this.options.event + direction, input);
        }
        this.manager.emit(this.options.event, input);
      }
    });
    /**
     * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
     * between the given interval and position. The delay option can be used to recognize multi-taps without firing
     * a single tap.
     *
     * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
     * multi-taps being recognized.
     * @constructor
     * @extends Recognizer
     */
    function TapRecognizer() {
      Recognizer.apply(this, arguments);
      // previous time and center,
      // used for tap counting
      this.pTime = false;
      this.pCenter = false;
      this._timer = null;
      this._input = null;
      this.count = 0;
    }
    inherit(TapRecognizer, Recognizer, {
      /**
       * @namespace
       * @memberof PinchRecognizer
       */
      defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300,
        // max time between the multi-tap taps
        time: 250,
        // max time of the pointer to be down (like finger on the screen)
        threshold: 2,
        // a minimal movement is ok, but keep it low
        posThreshold: 10
      },
      getTouchAction: function () {
        return [TOUCH_ACTION_MANIPULATION];
      },
      process: function (input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;
        this.reset();
        if (input.eventType & INPUT_START && this.count === 0) {
          return this.failTimeout();
        }
        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
          if (input.eventType != INPUT_END) {
            return this.failTimeout();
          }
          var validInterval = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
          var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
          this.pTime = input.timeStamp;
          this.pCenter = input.center;
          if (!validMultiTap || !validInterval) {
            this.count = 1;
          } else {
            this.count += 1;
          }
          this._input = input;
          // if tap count matches we have recognized it,
          // else it has began recognizing...
          var tapCount = this.count % options.taps;
          if (tapCount === 0) {
            // no failing requirements, immediately trigger the tap event
            // or wait as long as the multitap interval to trigger
            if (!this.hasRequireFailures()) {
              return STATE_RECOGNIZED;
            } else {
              this._timer = setTimeoutContext(function () {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
              }, options.interval, this);
              return STATE_BEGAN;
            }
          }
        }
        return STATE_FAILED;
      },
      failTimeout: function () {
        this._timer = setTimeoutContext(function () {
          this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
      },
      reset: function () {
        clearTimeout(this._timer);
      },
      emit: function () {
        if (this.state == STATE_RECOGNIZED) {
          this._input.tapCount = this.count;
          this.manager.emit(this.options.event, this._input);
        }
      }
    });
    /**
     * Simple way to create an manager with a default set of recognizers.
     * @param {HTMLElement} element
     * @param {Object} [options]
     * @constructor
     */
    function Hammer(element, options) {
      options = options || {};
      options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
      return new Manager(element, options);
    }
    /**
     * @const {string}
     */
    Hammer.VERSION = '2.0.4';
    /**
     * default settings
     * @namespace
     */
    Hammer.defaults = {
      /**
       * set if DOM events are being triggered.
       * But this is slower and unused by simple implementations, so disabled by default.
       * @type {Boolean}
       * @default false
       */
      domEvents: false,
      /**
       * The value for the touchAction property/fallback.
       * When set to `compute` it will magically set the correct value based on the added recognizers.
       * @type {String}
       * @default compute
       */
      touchAction: TOUCH_ACTION_COMPUTE,
      /**
       * @type {Boolean}
       * @default true
       */
      enable: true,
      /**
       * EXPERIMENTAL FEATURE -- can be removed/changed
       * Change the parent input target element.
       * If Null, then it is being set the to main element.
       * @type {Null|EventTarget}
       * @default null
       */
      inputTarget: null,
      /**
       * force an input class
       * @type {Null|Function}
       * @default null
       */
      inputClass: null,
      /**
       * Default recognizer setup when calling `Hammer()`
       * When creating a new Manager these will be skipped.
       * @type {Array}
       */
      preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [
          RotateRecognizer,
          { enable: false }
        ],
        [
          PinchRecognizer,
          { enable: false },
          ['rotate']
        ],
        [
          SwipeRecognizer,
          { direction: DIRECTION_HORIZONTAL }
        ],
        [
          PanRecognizer,
          { direction: DIRECTION_HORIZONTAL },
          ['swipe']
        ],
        [TapRecognizer],
        [
          TapRecognizer,
          {
            event: 'doubletap',
            taps: 2
          },
          ['tap']
        ],
        [PressRecognizer]
      ],
      /**
       * Some CSS properties can be used to improve the working of Hammer.
       * Add them to this method and they will be set when creating a new Manager.
       * @namespace
       */
      cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',
        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',
        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',
        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',
        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',
        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
      }
    };
    var STOP = 1;
    var FORCED_STOP = 2;
    /**
     * Manager
     * @param {HTMLElement} element
     * @param {Object} [options]
     * @constructor
     */
    function Manager(element, options) {
      options = options || {};
      this.options = merge(options, Hammer.defaults);
      this.options.inputTarget = this.options.inputTarget || element;
      this.handlers = {};
      this.session = {};
      this.recognizers = [];
      this.element = element;
      this.input = createInputInstance(this);
      this.touchAction = new TouchAction(this, this.options.touchAction);
      toggleCssProps(this, true);
      each(options.recognizers, function (item) {
        var recognizer = this.add(new item[0](item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
      }, this);
    }
    Manager.prototype = {
      /**
       * set options
       * @param {Object} options
       * @returns {Manager}
       */
      set: function (options) {
        extend(this.options, options);
        // Options that need a little more setup
        if (options.touchAction) {
          this.touchAction.update();
        }
        if (options.inputTarget) {
          // Clean up existing event listeners and reinitialize
          this.input.destroy();
          this.input.target = options.inputTarget;
          this.input.init();
        }
        return this;
      },
      /**
       * stop recognizing for this session.
       * This session will be discarded, when a new [input]start event is fired.
       * When forced, the recognizer cycle is stopped immediately.
       * @param {Boolean} [force]
       */
      stop: function (force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
      },
      /**
       * run the recognizers!
       * called by the inputHandler function on every movement of the pointers (touches)
       * it walks through all the recognizers and tries to detect the gesture that is being made
       * @param {Object} inputData
       */
      recognize: function (inputData) {
        var session = this.session;
        if (session.stopped) {
          return;
        }
        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);
        var recognizer;
        var recognizers = this.recognizers;
        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;
        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
          curRecognizer = session.curRecognizer = null;
        }
        var i = 0;
        while (i < recognizers.length) {
          recognizer = recognizers[i];
          // find out if we are allowed try to recognize the input for this one.
          // 1.   allow if the session is NOT forced stopped (see the .stop() method)
          // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
          //      that is being recognized.
          // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
          //      this can be setup with the `recognizeWith()` method on the recognizer.
          if (session.stopped !== FORCED_STOP && // 1
            (!curRecognizer || recognizer == curRecognizer || // 2
            recognizer.canRecognizeWith(curRecognizer))) {
            // 3
            recognizer.recognize(inputData);
          } else {
            recognizer.reset();
          }
          // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
          // current active recognizer. but only if we don't already have an active recognizer
          if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
            curRecognizer = session.curRecognizer = recognizer;
          }
          i++;
        }
      },
      /**
       * get a recognizer by its event name.
       * @param {Recognizer|String} recognizer
       * @returns {Recognizer|Null}
       */
      get: function (recognizer) {
        if (recognizer instanceof Recognizer) {
          return recognizer;
        }
        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
          if (recognizers[i].options.event == recognizer) {
            return recognizers[i];
          }
        }
        return null;
      },
      /**
       * add a recognizer to the manager
       * existing recognizers with the same event name will be removed
       * @param {Recognizer} recognizer
       * @returns {Recognizer|Manager}
       */
      add: function (recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
          return this;
        }
        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
          this.remove(existing);
        }
        this.recognizers.push(recognizer);
        recognizer.manager = this;
        this.touchAction.update();
        return recognizer;
      },
      /**
       * remove a recognizer by name or instance
       * @param {Recognizer|String} recognizer
       * @returns {Manager}
       */
      remove: function (recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
          return this;
        }
        var recognizers = this.recognizers;
        recognizer = this.get(recognizer);
        recognizers.splice(inArray(recognizers, recognizer), 1);
        this.touchAction.update();
        return this;
      },
      /**
       * bind event
       * @param {String} events
       * @param {Function} handler
       * @returns {EventEmitter} this
       */
      on: function (events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function (event) {
          handlers[event] = handlers[event] || [];
          handlers[event].push(handler);
        });
        return this;
      },
      /**
       * unbind event, leave emit blank to remove all handlers
       * @param {String} events
       * @param {Function} [handler]
       * @returns {EventEmitter} this
       */
      off: function (events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function (event) {
          if (!handler) {
            delete handlers[event];
          } else {
            handlers[event].splice(inArray(handlers[event], handler), 1);
          }
        });
        return this;
      },
      /**
       * emit event to the listeners
       * @param {String} event
       * @param {Object} data
       */
      emit: function (event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
          triggerDomEvent(event, data);
        }
        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
          return;
        }
        data.type = event;
        data.preventDefault = function () {
          data.srcEvent.preventDefault();
        };
        var i = 0;
        while (i < handlers.length) {
          handlers[i](data);
          i++;
        }
      },
      /**
       * destroy the manager and unbinds all events
       * it doesn't unbind dom events, that is the user own responsibility
       */
      destroy: function () {
        this.element && toggleCssProps(this, false);
        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
      }
    };
    /**
     * add/remove the css properties as defined in manager.options.cssProps
     * @param {Manager} manager
     * @param {Boolean} add
     */
    function toggleCssProps(manager, add) {
      var element = manager.element;
      each(manager.options.cssProps, function (value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
      });
    }
    /**
     * trigger dom event
     * @param {String} event
     * @param {Object} data
     */
    function triggerDomEvent(event, data) {
      var gestureEvent = document.createEvent('Event');
      gestureEvent.initEvent(event, true, true);
      gestureEvent.gesture = data;
      data.target.dispatchEvent(gestureEvent);
    }
    extend(Hammer, {
      INPUT_START: INPUT_START,
      INPUT_MOVE: INPUT_MOVE,
      INPUT_END: INPUT_END,
      INPUT_CANCEL: INPUT_CANCEL,
      STATE_POSSIBLE: STATE_POSSIBLE,
      STATE_BEGAN: STATE_BEGAN,
      STATE_CHANGED: STATE_CHANGED,
      STATE_ENDED: STATE_ENDED,
      STATE_RECOGNIZED: STATE_RECOGNIZED,
      STATE_CANCELLED: STATE_CANCELLED,
      STATE_FAILED: STATE_FAILED,
      DIRECTION_NONE: DIRECTION_NONE,
      DIRECTION_LEFT: DIRECTION_LEFT,
      DIRECTION_RIGHT: DIRECTION_RIGHT,
      DIRECTION_UP: DIRECTION_UP,
      DIRECTION_DOWN: DIRECTION_DOWN,
      DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
      DIRECTION_VERTICAL: DIRECTION_VERTICAL,
      DIRECTION_ALL: DIRECTION_ALL,
      Manager: Manager,
      Input: Input,
      TouchAction: TouchAction,
      TouchInput: TouchInput,
      MouseInput: MouseInput,
      PointerEventInput: PointerEventInput,
      TouchMouseInput: TouchMouseInput,
      SingleTouchInput: SingleTouchInput,
      Recognizer: Recognizer,
      AttrRecognizer: AttrRecognizer,
      Tap: TapRecognizer,
      Pan: PanRecognizer,
      Swipe: SwipeRecognizer,
      Pinch: PinchRecognizer,
      Rotate: RotateRecognizer,
      Press: PressRecognizer,
      on: addEventListeners,
      off: removeEventListeners,
      each: each,
      merge: merge,
      extend: extend,
      inherit: inherit,
      bindFn: bindFn,
      prefixed: prefixed
    });
    // if (typeof define == TYPE_FUNCTION && define.amd) {
    //     define(function() {
    //         return Hammer;
    //     });
    // } else if (typeof module != 'undefined' && module.exports) {
    //     module.exports = Hammer;
    // } else {
    window[exportName] = Hammer;
  }(window, document, 'Hammer'));
  return exports;
}({});
core = function (exports) {
  var Util = util, Base = base, Animate = animate, Boundry = _boundry_;
  hammer;
  // boundry checked bounce effect
  var BOUNDRY_CHECK_DURATION = 500;
  var BOUNDRY_CHECK_EASING = 'ease';
  var BOUNDRY_CHECK_ACCELERATION = 0.1;
  //transform
  var transform = Util.prefixStyle('transform');
  //transition webkitTransition MozTransition OTransition msTtransition
  var transition = Util.prefixStyle('transition');
  var transformStr = Util.vendor ? [
    '-',
    Util.vendor,
    '-transform'
  ].join('') : 'transform';
  /** 
   * @constructor
   * @param {object} cfg config for scroll
   * @param {number} cfg.SROLL_ACCELERATION  acceleration for scroll, min value make the scrolling smoothly
   * @param {number} cfg.BOUNDRY_CHECK_DURATION duration for boundry bounce
   * @param {number} cfg.BOUNDRY_CHECK_EASING easing for boundry bounce
   * @param {number} cfg.BOUNDRY_CHECK_ACCELERATION acceleration for boundry bounce
   * @param {boolean} cfg.lockX just like overflow-x:hidden
   * @param {boolean} cfg.lockY just like overflow-y:hidden
   * @param {boolean} cfg.scrollbarX config if the scrollbar-x is visible
   * @param {boolean} cfg.scrollbarY config if the scrollbar-y is visible
   * @param {boolean} cfg.useTransition config if use css3 transition or raf for scroll animation
   * @param {boolean} cfg.simulateScroll config if use animation or origin scroll
   * @param {string}  cfg.clsPrefix config the class prefix which default value is "xs-"
   * @extends XScroll
   * @example
   * var xscroll = new XScroll({
   *    renderTo:"#scroll",
   *    lockX:false,
   *    scrollbarX:true
   * });
   * xscroll.render();
   */
  function XScroll(cfg) {
    XScroll.superclass.constructor.call(this);
    this.userConfig = cfg;
    this.init();
  }
  XScroll.Util = Util;
  XScroll.Plugin = {};
  Util.extend(XScroll, Base, {
    /**
     * version
     * @memberof XScroll
     * @type {string}
     */
    version: '3.0.0',
    /**
     * init scroll
     * @memberof XScroll
     * @return {XScroll}
     */
    init: function () {
      var self = this;
      var defaultCfg = {
        preventDefault: true,
        //prevent touchstart 
        bounce: true,
        useTransition: true,
        gpuAcceleration: true,
        BOUNDRY_CHECK_EASING: BOUNDRY_CHECK_EASING,
        BOUNDRY_CHECK_DURATION: BOUNDRY_CHECK_DURATION,
        BOUNDRY_CHECK_ACCELERATION: BOUNDRY_CHECK_ACCELERATION,
        clsPrefix: 'xs-',
        simulateScroll: false
      };
      //generate guid
      self.guid = Util.guid();
      self.renderTo = self.userConfig.renderTo.nodeType ? self.userConfig.renderTo : document.querySelector(self.userConfig.renderTo);
      //timer for animtion
      self.__timers = {};
      //config attributes on element
      var elCfg = JSON.parse(self.renderTo.getAttribute('xs-cfg'));
      var userConfig = self.userConfig = Util.mix(Util.mix(defaultCfg, elCfg), self.userConfig);
      self.containerClsName = userConfig.clsPrefix + 'container';
      self.contentClsName = userConfig.clsPrefix + 'content';
      self.container = self.renderTo.querySelector('.' + self.containerClsName);
      self.content = self.renderTo.querySelector('.' + self.contentClsName);
      self.boundry = new Boundry();
      self.boundry.refresh();
      return self;
    },
    _initContainer: function () {
    },
    /**
     * @memberof XScroll
     * @return {XScroll}
     */
    enableGPUAcceleration: function () {
      this.userConfig.gpuAcceleration = true;
      return this;
    },
    /**
     * @memberof XScroll
     * @return {XScroll}
     */
    disableGPUAcceleration: function () {
      this.userConfig.gpuAcceleration = false;
      return this;
    },
    /**
     * get scroll offset
     * @memberof XScroll
     * @return {Object} {scrollTop:scrollTop,scrollLeft:scrollLeft}
     */
    getScrollPos: function () {
      var self = this;
      return {
        scrollLeft: self.getScrollLeft(),
        scrollTop: self.getScrollTop()
      };
    },
    /**
     * get scroll top value
     * @memberof XScroll
     * @return {number} scrollTop
     */
    getScrollTop: function () {
    },
    /**
     * get scroll left value
     * @memberof XScroll
     * @return {number} scrollLeft
     */
    getScrollLeft: function () {
    },
    /**
     * scroll absolute to the destination
     * @memberof XScroll
     * @param scrollLeft {number} scrollLeft
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollTo: function (scrollLeft, scrollTop, duration, easing, callback) {
      var self = this;
      var scrollLeft = undefined === scrollLeft || isNaN(scrollLeft) ? -self.getScrollLeft() : scrollLeft;
      var scrollTop = undefined === scrollTop || isNaN(scrollTop) ? -self.getScrollTop() : scrollTop;
      self.scrollLeft(scrollLeft, duration, easing, callback);
      self.scrollTop(scrollTop, duration, easing, callback);
    },
    /**
     * scroll relative to the destination
     * @memberof XScroll
     * @param scrollLeft {number} scrollLeft
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollBy: function (scrollLeft, scrollTop, duration, easing, callback) {
      this.scrollByX(scrollLeft, duration, easing, callback);
      this.scrollByY(scrollTop, duration, easing, callback);
    },
    /**
     * horizontal scroll relative to the destination
     * @memberof XScroll
     * @param scrollLeft {number} scrollLeft
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollLeftBy: function (scrollLeft, duration, easing, callback) {
      this.scrollLeft(Number(scrollLeft) + Number(this.getScrollLeft()), duration, easing, callback);
    },
    /**
     * vertical scroll relative to the destination
     * @memberof XScroll
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollTopBy: function (scrollTop, duration, easing, callback) {
      this.scrollTop(Number(scrollTop) + Number(this.getScrollTop()), duration, easing, callback);
    },
    /**
     * horizontal scroll absolute to the destination
     * @memberof XScroll
     * @param scrollLeft {number} scrollLeft
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollLeft: function (scrollLeft, duration, easing, callback) {
    },
    /**
     * vertical scroll absolute to the destination
     * @memberof XScroll
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollTop: function (scrollTop, duration, easing, callback) {
    },
    /**
     * reset the boundry size
     * @memberof XScroll
     * @return {XScroll}
     **/
    resetSize: function () {
      var self = this;
      var userConfig = self.userConfig;
      var renderToStyle = getComputedStyle(self.renderTo);
      var width = self.width = (userConfig.width || self.renderTo.offsetWidth) - Util.px2Num(renderToStyle['padding-left']) - Util.px2Num(renderToStyle['padding-right']);
      var height = self.height = (userConfig.height || self.renderTo.offsetHeight) - Util.px2Num(renderToStyle['padding-top']) - Util.px2Num(renderToStyle['padding-bottom']);
      var containerWidth = userConfig.containerWidth || self.content.offsetWidth;
      var containerHeight = userConfig.containerHeight || self.content.offsetHeight;
      self.containerWidth = containerWidth < self.width ? self.width : containerWidth;
      self.containerHeight = containerHeight < self.height ? self.height : containerHeight;
      self.boundry.refresh({
        width: self.width,
        height: self.height
      });
      return self;
    },
    /**
     * render scroll
     * @memberof XScroll
     * @return {XScroll}
     **/
    render: function () {
      var self = this;
      self.resetSize();
      self.trigger('afterrender');
      self._bindEvt();
      return self;
    },
    _triggerClick: function (e) {
      var target = e.target;
      if (!/(SELECT|INPUT|TEXTAREA)/i.test(target.tagName)) {
        var ev = document.createEvent('MouseEvents');
        ev.initMouseEvent('click', true, true, e.view, 1, target.screenX, target.screenY, target.clientX, target.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
        target.dispatchEvent(ev);
      }
    },
    /**
     * bounce to the boundry vertical and horizontal
     * @memberof XScroll
     * @return {XScroll}
     **/
    boundryCheck: function () {
      return this;
    },
    /**
     * bounce to the boundry horizontal
     * @memberof XScroll
     * @return {XScroll}
     **/
    boundryCheckX: function () {
      return this;
    },
    /**
     * bounce to the boundry vertical
     * @memberof XScroll
     * @return {XScroll}
     **/
    boundryCheckY: function () {
      return this;
    },
    _bindEvt: function () {
      var self = this;
      if (self.___isEvtBind)
        return;
      self.___isEvtBind = true;
      var mc = self.mc = new Hammer.Manager(self.renderTo);
      var tap = new Hammer.Tap();
      var pan = new Hammer.Pan();
      mc.add([
        tap,
        pan
      ]);
      //trigger all events 
      self.mc.on('panstart pan panend pinchstart pinch pinchend', function (e) {
        self.trigger(e.type, e);
      });
      self.mc.on('tap', function (e) {
        if (e.tapCount == 1) {
          e.type = 'tap';
          self.trigger(e.type, e);
        } else if (e.tapCount == 2) {
          e.type = 'doubletap';
          self.trigger('doubletap', e);
        }
      });
      return self;
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = XScroll;
  } else {
    return XScroll;
  }
  return exports;
}({});
components_scrollbar = function (exports) {
  var Util = util;
  var Animate = animate;
  var MIN_SCROLLBAR_SIZE = 60;
  var BAR_MIN_SIZE = 8;
  var transform = Util.prefixStyle('transform');
  var transformStr = Util.vendor ? [
    '-',
    Util.vendor,
    '-transform'
  ].join('') : 'transform';
  var transition = Util.prefixStyle('transition');
  var borderRadius = Util.prefixStyle('borderRadius');
  var transitionDuration = Util.prefixStyle('transitionDuration');
  var ScrollBar = function (cfg) {
    this.userConfig = cfg;
    this.init(cfg.xscroll);
  };
  Util.mix(ScrollBar.prototype, {
    init: function (xscroll) {
      var self = this;
      self.xscroll = xscroll;
      self.type = self.userConfig.type;
      self.isY = self.type == 'y' ? true : false;
      self.scrollTopOrLeft = self.isY ? 'scrollTop' : 'scrollLeft';
      var boundry = self.xscroll.boundry;
      self.containerSize = self.isY ? self.xscroll.containerHeight + boundry._xtop + boundry._xbottom : self.xscroll.containerWidth + boundry._xright + boundry._xleft;
      self.indicateSize = self.isY ? self.xscroll.height : self.xscroll.width;
      self.pos = self.isY ? xscroll.getScrollTop() : xscroll.getScrollLeft();
      self.render();
      self._bindEvt();
    },
    destroy: function () {
      var self = this;
      self.scrollbar && self.scrollbar.remove();
      // self.xscroll.off("scaleanimate", self._update, self);
      self.xscroll.off('scrollend', self._update, self);
      self.xscroll.off('scrollanimate', self._update, self);
      !self.xscroll.userConfig.useTransition && self.xscroll.off('scroll', self._update, self);
      delete self;
    },
    render: function () {
      var self = this;
      if (self.__isRender)
        return;
      self.__isRender = true;
      var xscroll = self.xscroll;
      var translateZ = xscroll.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      var transform = translateZ ? transformStr + ':' + translateZ + ';' : '';
      var commonCss = 'opacity:0;position:absolute;z-index:999;overflow:hidden;-webkit-border-radius:3px;-moz-border-radius:3px;-o-border-radius:3px;' + transform;
      var css = self.isY ? 'width: 3px;bottom:5px;top:5px;right:3px;' + commonCss : 'height:3px;left:5px;right:5px;bottom:3px;' + commonCss;
      self.scrollbar = document.createElement('div');
      self.scrollbar.style.cssText = css;
      xscroll.renderTo.appendChild(self.scrollbar);
      var size = self.isY ? 'width:100%;' : 'height:100%;';
      self.indicate = document.createElement('div');
      self.indicate.style.cssText = size + 'position:absolute;background:rgba(0,0,0,0.3);-webkit-border-radius:3px;-moz-border-radius:3px;-o-border-radius:3px;';
      self.scrollbar.appendChild(self.indicate);
      self._update();
      self.hide(0);
    },
    _update: function (pos, duration, easing) {
      var self = this;
      var pos = undefined === pos ? self.isY ? self.xscroll.getScrollTop() : self.xscroll.getScrollLeft() : pos;
      var barInfo = self.computeScrollBar(pos);
      var size = self.isY ? 'height' : 'width';
      self.indicate.style[size] = Math.round(barInfo.size) + 'px';
      if (duration && easing) {
        self.scrollTo(barInfo.pos, duration, easing);
      } else {
        self.moveTo(barInfo.pos);
      }
    },
    //compute the position and size of the scrollbar
    computeScrollBar: function (pos) {
      var self = this;
      var type = self.isY ? 'y' : 'x';
      var pos = Math.round(pos);
      var spacing = 10;
      var boundry = self.xscroll.boundry;
      self.containerSize = self.isY ? self.xscroll.containerHeight + boundry._xtop + boundry._xbottom : self.xscroll.containerWidth + boundry._xright + boundry._xleft;
      //viewport size
      self.size = self.isY ? self.xscroll.height : self.xscroll.width;
      self.indicateSize = self.isY ? self.xscroll.height - spacing : self.xscroll.width - spacing;
      //scrollbar size
      var indicateSize = self.indicateSize;
      var containerSize = self.containerSize;
      //pos bottom/right
      var posout = containerSize - self.size;
      var ratio = pos / containerSize;
      var barpos = indicateSize * ratio;
      var barSize = Math.round(indicateSize * self.size / containerSize);
      var _barpos = barpos * (indicateSize - MIN_SCROLLBAR_SIZE + barSize) / indicateSize;
      if (barSize < MIN_SCROLLBAR_SIZE) {
        barSize = MIN_SCROLLBAR_SIZE;
        barpos = _barpos;
      }
      if (barpos < 0) {
        barpos = Math.abs(pos) * barSize / MIN_SCROLLBAR_SIZE > barSize - BAR_MIN_SIZE ? BAR_MIN_SIZE - barSize : pos * barSize / MIN_SCROLLBAR_SIZE;
      } else if (barpos + barSize > indicateSize && pos - posout > 0) {
        var _pos = pos - containerSize + indicateSize + spacing;
        if (_pos * barSize / MIN_SCROLLBAR_SIZE > barSize - BAR_MIN_SIZE) {
          barpos = indicateSize + spacing - BAR_MIN_SIZE;
        } else {
          barpos = indicateSize + spacing - barSize + _pos * barSize / MIN_SCROLLBAR_SIZE;
        }
      }
      self.barpos = Math.round(barpos);
      return result = {
        size: Math.round(barSize),
        pos: self.barpos
      };
    },
    scrollTo: function (pos, duration, easing) {
      var self = this;
      var translateZ = self.xscroll.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      var config = {
        css: { transform: self.isY ? 'translateY(' + pos + 'px)' + translateZ : 'translateX(' + pos + 'px)' + translateZ },
        duration: duration,
        easing: easing,
        useTransition: self.xscroll.userConfig.useTransition
      };
      self.__timer = self.__timer || new Animate(self.indicate, config);
      //run
      self.__timer.stop();
      self.__timer.reset(config);
      self.__timer.run();
    },
    moveTo: function (pos) {
      var self = this;
      self.show();
      var translateZ = self.xscroll.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      self.isY ? self.indicate.style[transform] = 'translateY(' + pos + 'px) ' + translateZ : self.indicate.style[transform] = 'translateX(' + pos + 'px) ' + translateZ;
      self.indicate.style[transition] = '';
    },
    _bindEvt: function () {
      var self = this;
      if (self.__isEvtBind)
        return;
      self.__isEvtBind = true;
      var type = self.isY ? 'y' : 'x';
      var isBoundryOut = function (type) {
        return type == 'x' ? self.xscroll.isBoundryOutLeft() || self.xscroll.isBoundryOutRight() : self.xscroll.isBoundryOutTop() || self.xscroll.isBoundryOutBottom();
      };
      if (self.xscroll.userConfig.useTransition) {
        self.xscroll.on('pan', function (e) {
          self._update(e[self.scrollTopOrLeft]);
        });
        self.xscroll.on('scrollanimate', function (e) {
          if (!e.zoomType || e.zoomType != type)
            return;
          self._update(e[self.scrollTopOrLeft], e.duration, e.easing);
        });
      } else {
        self.xscroll.on('scroll', function (e) {
          self._update(e[self.scrollTopOrLeft]);
        });
      }
      self.xscroll.on('panend', function (e) {
        if (Math.abs(e.velocity) == 0 && !isBoundryOut(type)) {
          self.hide();
        }
      });
      self.xscroll.on('scrollend', function (e) {
        if (!isBoundryOut()) {
          self._update(e[self.scrollTopOrLeft]);
          self.hide();
        }
      });
    },
    reset: function () {
      var self = this;
      self.pos = 0;
      self._update();
    },
    hide: function (duration, easing, delay) {
      var self = this;
      var duration = duration >= 0 ? duration : 300;
      var easing = easing || 'ease-out';
      var delay = delay >= 0 ? delay : 100;
      self.scrollbar.style.opacity = 0;
      self.scrollbar.style[transition] = [
        'opacity ',
        duration,
        'ms ',
        ' ease-out ',
        delay,
        'ms'
      ].join('');
    },
    show: function () {
      var self = this;
      self.scrollbar.style.opacity = 1;
      self.scrollbar.style[transition] = '';
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = ScrollBar;
  } else {
    return ScrollBar;
  }
  return exports;
}({});
components_controller = function (exports) {
  /*
  	wrapped scroll controller
  */
  var Util = util, Base = base;
  var Controller = function (cfg) {
    Controller.superclass.constructor.call(this, cfg);
    this.userConfig = Util.mix({}, cfg);
    this.init();
  };
  Util.extend(Controller, Base, {
    init: function () {
      var self = this;
      self.xscroll = self.userConfig.xscroll;
    },
    add: function (scroll, cfg) {
      var self = this;
      cfg = Util.extend({
        captureBounce: false,
        stopPropagation: true
      }, cfg);
      if (!self.__scrolls) {
        self.__scrolls = {};
      }
      if (scroll.guid && !self.__scrolls[scroll.guid]) {
        scroll.parentscroll = self.xscroll;
        self._bind(scroll);
        return self.__scrolls[scroll.guid] = scroll;
      }
      return;
    },
    remove: function (scroll) {
      var self = this;
      if (!scroll || !scroll.guid)
        return;
      var subscroll = self.__scrolls[scroll.guid];
      if (subscroll) {
        delete subscroll.parentscroll;
        self._unbind(scroll);
        delete subscroll;
      }
    },
    get: function (guid) {
      if (guid) {
        return this.__scrolls[guid];
      }
      return this.__scrolls;
    },
    _unbind: function (sub) {
    },
    _bind: function (sub) {
      var self = this, xscroll = self.xscroll;
      xscroll.renderTo.addEventListener('touchstart', function () {
        xscroll._resetLockConfig();
      });
      sub.renderTo.addEventListener('touchstart', function () {
        sub._resetLockConfig();
      });
      sub.mc.on('panstart', function (e) {
        //vertical scroll enabled
        if (!sub.userConfig.lockY && !xscroll.userConfig.lockY) {
          //outside of boundry
          if (sub.isBoundryOut()) {
            xscroll.userConfig.lockY = true;
            return;
          }
          if (e.direction == 16 && sub.getBoundryOutTop() >= 0) {
            sub.userConfig.lockY = true;
          } else if (e.direction == 8 && sub.getBoundryOutTop() >= 0) {
            xscroll.userConfig.lockY = true;
          }
          if (e.direction == 8 && sub.getBoundryOutBottom() >= 0) {
            sub.userConfig.lockY = true;
          } else if (e.direction == 16 && sub.getBoundryOutBottom() >= 0) {
            xscroll.userConfig.lockY = true;
          }
          if (sub.getBoundryOutTop() < 0 && sub.getBoundryOutBottom() < 0) {
            xscroll.userConfig.lockY = true;
          }
        }
        //horizontal scroll enabled
        if (!sub.userConfig.lockX && !xscroll.userConfig.lockX) {
          if (sub.isBoundryOut()) {
            xscroll.userConfig.lockX = true;
            return;
          }
          if (e.direction == 4 && sub.getBoundryOutLeft() >= 0) {
            sub.userConfig.lockX = true;
          } else if (e.direction == 2 && sub.getBoundryOutLeft() >= 0) {
            xscroll.userConfig.lockX = true;
          }
          if (e.direction == 2 && sub.getBoundryOutRight() >= 0) {
            sub.userConfig.lockX = true;
          } else if (e.direction == 4 && sub.getBoundryOutRight() >= 0) {
            xscroll.userConfig.lockX = true;
          }
          if (sub.getBoundryOutLeft() < 0 && sub.getBoundryOutRight() < 0) {
            xscroll.userConfig.lockX = true;
          }
        }
        if (!sub.userConfig.lockX && xscroll.userConfig.lockX) {
          //pan x
          if (e.direction == 2 || e.direction == 4) {
            xscroll.userConfig.lockY = true;
          } else {
            sub.userConfig.lockX = true;
          }
        }
        if (!sub.userConfig.lockY && xscroll.userConfig.lockY) {
          //pan y
          if (e.direction == 8 || e.direction == 16) {
            xscroll.userConfig.lockX = true;
          } else {
            sub.userConfig.lockY = true;
          }
        }
      });
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = Controller;
  } else {
    return Controller;
  }
  return exports;
}({});
simulate_scroll = function (exports) {
  var Util = util, Base = base, Core = core, Animate = animate, ScrollBar = components_scrollbar, Controller = components_controller;
  //reduced boundry pan distance
  var PAN_RATE = 1 - 0.618;
  //constant for scrolling acceleration
  var SROLL_ACCELERATION = 0.0005;
  //constant for outside of boundry acceleration
  var BOUNDRY_ACCELERATION = 0.03;
  //transform-origin
  var transformOrigin = Util.prefixStyle('transformOrigin');
  //transform
  var transform = Util.prefixStyle('transform');
  /** 
   * @constructor
   * @param {object} cfg config for scroll
   * @param {number} cfg.SROLL_ACCELERATION  acceleration for scroll, min value make the scrolling smoothly
   * @param {number} cfg.BOUNDRY_CHECK_DURATION duration for boundry bounce
   * @param {number} cfg.BOUNDRY_CHECK_EASING easing for boundry bounce
   * @param {number} cfg.BOUNDRY_CHECK_ACCELERATION acceleration for boundry bounce
   * @param {boolean} cfg.lockX just like overflow-x:hidden
   * @param {boolean} cfg.lockY just like overflow-y:hidden
   * @param {boolean} cfg.scrollbarX config if the scrollbar-x is visible
   * @param {boolean} cfg.scrollbarY config if the scrollbar-y is visible
   * @param {boolean} cfg.useTransition config if use css3 transition or raf for scroll animation
   * @param {string}  cfg.clsPrefix config the class prefix which default value is "xs-"
   * @extends XScroll
   * @example
   * var xscroll = new SimuScroll({
   *    renderTo:"#scroll",
   *    lockX:false,
   *    scrollbarX:true
   * });
   * xscroll.render();
   */
  function SimuScroll(cfg) {
    SimuScroll.superclass.constructor.call(this, cfg);
  }
  Util.extend(SimuScroll, Core, {
    /** 
     * @memberof SimuScroll
     * @override
     */
    init: function () {
      var self = this;
      SimuScroll.superclass.init.call(this);
      self.SROLL_ACCELERATION = self.userConfig.SROLL_ACCELERATION || SROLL_ACCELERATION;
      self.BOUNDRY_ACCELERATION = self.userConfig.BOUNDRY_ACCELERATION || BOUNDRY_ACCELERATION;
      self._initContainer();
      self.resetSize();
      //set overflow behaviors
      self._setOverflowBehavior();
      self.defaltConfig = {
        lockY: self.userConfig.lockY,
        lockX: self.userConfig.lockX
      };
      self.boundryCheckEnabled = true;
      return self;
    },
    /**
     * set overflow behavior
     * @return {boolean} [description]
     */
    _setOverflowBehavior: function () {
      var self = this;
      var renderTo = self.renderTo;
      var computeStyle = getComputedStyle(renderTo);
      self.userConfig.lockX = undefined === self.userConfig.lockX ? computeStyle['overflow-x'] == 'hidden' || self.width == self.containerWidth ? true : false : self.userConfig.lockX;
      self.userConfig.lockY = undefined === self.userConfig.lockY ? computeStyle['overflow-y'] == 'hidden' || self.height == self.containerHeight ? true : false : self.userConfig.lockY;
      self.userConfig.scrollbarX = undefined === self.userConfig.scrollbarX ? self.userConfig.lockX ? false : true : self.userConfig.scrollbarX;
      self.userConfig.scrollbarY = undefined === self.userConfig.scrollbarY ? self.userConfig.lockY ? false : true : self.userConfig.scrollbarY;
      return self;
    },
    /**
     * reset lockX or lockY config to the default value
     */
    _resetLockConfig: function () {
      var self = this;
      self.userConfig.lockX = self.defaltConfig.lockX;
      self.userConfig.lockY = self.defaltConfig.lockY;
      return self;
    },
    /**
     * init container
     * @override
     * @return {SimuScroll}
     */
    _initContainer: function () {
      var self = this;
      SimuScroll.superclass._initContainer.call(self);
      if (self.__isContainerInited)
        return;
      self.container.style[transformOrigin] = '0 0';
      self.content.style[transformOrigin] = '0 0';
      self.translate(0, 0);
      self.__isContainerInited = true;
      return self;
    },
    /**
     * get scroll top value
     * @memberof SimuScroll
     * @return {number} scrollTop
     */
    getScrollTop: function () {
      var transY = window.getComputedStyle(this.container)[transform].match(/[-\d\.*\d*]+/g);
      return transY ? Math.round(transY[5]) === 0 ? 0 : -Math.round(transY[5]) : 0;
    },
    /**
     * get scroll left value
     * @memberof SimuScroll
     * @return {number} scrollLeft
     */
    getScrollLeft: function () {
      var transX = window.getComputedStyle(this.content)[transform].match(/[-\d\.*\d*]+/g);
      return transX ? Math.round(transX[4]) === 0 ? 0 : -Math.round(transX[4]) : 0;
    },
    /**
     * horizontal scroll absolute to the destination
     * @memberof SimuScroll
     * @param scrollLeft {number} scrollLeft
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollLeft: function (x, duration, easing, callback) {
      if (this.userConfig.lockX)
        return;
      var translateZ = this.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      this.x = undefined === x || isNaN(x) || 0 === x ? 0 : -Math.round(x);
      this._animate('x', 'translateX(' + this.x + 'px) scale(' + this.scale + ')' + translateZ, duration, easing, callback);
      return this;
    },
    /**
     * vertical scroll absolute to the destination
     * @memberof SimuScroll
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollTop: function (y, duration, easing, callback) {
      if (this.userConfig.lockY)
        return;
      var translateZ = this.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      this.y = undefined === y || isNaN(y) || 0 === y ? 0 : -Math.round(y);
      this._animate('y', 'translateY(' + this.y + 'px) ' + translateZ, duration, easing, callback);
      return this;
    },
    /**
     * translate the scroller to a new destination includes x , y , scale
     * @memberof SimuScroll
     * @param x {number} x
     * @param y {number} y
     * @param scale {number} scale
     **/
    translate: function (x, y, scale) {
      var translateZ = this.userConfig.gpuAcceleration ? ' translateZ(0) ' : '';
      this.x = x || this.x || 0;
      this.y = y || this.y || 0;
      this.scale = scale || this.scale || 1;
      this.content.style[transform] = 'translate(' + this.x + 'px,0px) scale(' + this.scale + ') ' + translateZ;
      this.container.style[transform] = 'translate(0px,' + this.y + 'px) ' + translateZ;
      return this;
    },
    _animate: function (type, transform, duration, easing, callback) {
      var self = this;
      var duration = duration || 0;
      var easing = easing || 'quadratic';
      var el = type == 'y' ? self.container : self.content;
      var config = {
        css: { transform: transform },
        duration: duration,
        easing: easing,
        run: function (e) {
          /**
           * @event {@link SimuScroll#"scroll"}
           */
          self.trigger('scroll', {
            scrollTop: self.getScrollTop(),
            scrollLeft: self.getScrollLeft(),
            type: 'scroll'
          });
        },
        useTransition: self.userConfig.useTransition,
        end: function (e) {
          callback && callback();
          if ((self['_bounce' + type] === 0 || self['_bounce' + type] === undefined) && easing != 'linear') {
            self['isScrolling' + type.toUpperCase()] = false;
            self.trigger('scrollend', {
              type: 'scrollend',
              scrollTop: self.getScrollTop(),
              scrollLeft: self.getScrollLeft(),
              zoomType: type,
              duration: duration,
              easing: easing
            });
          }
        }
      };
      var timer = self.__timers[type] = self.__timers[type] || new Animate(el, config);
      timer.stop();
      timer.reset(config);
      timer.run();
      self.trigger('scrollanimate', {
        type: 'scrollanimate',
        scrollTop: -self.y,
        scrollLeft: -self.x,
        duration: duration,
        easing: easing,
        zoomType: type
      });
      return this;
    },
    _ontap: function (e) {
      var self = this;
      e.preventDefault();
      e.srcEvent.stopPropagation();
      self.boundryCheck();
      self._triggerClick(e);
    },
    _bindEvt: function () {
      SimuScroll.superclass._bindEvt.call(this);
      var self = this;
      if (self.__isEvtBind)
        return;
      self.__isEvtBind = true;
      var pinch = new Hammer.Pinch();
      self.mc.add(pinch);
      var renderTo = self.renderTo;
      renderTo.addEventListener('touchstart', function (e) {
        if (self.userConfig.preventDefault) {
          e.preventDefault();
        }
        self.stop();
      }, false);
      self.on('tap', self._ontap, self);
      self.on('panstart', self._onpanstart, self);
      self.on('pan', self._onpan, self);
      self.on('panend', self._onpanend, self);
      //window resize
      window.addEventListener('resize', function (e) {
        setTimeout(function () {
          self.resetSize();
          self.boundryCheck(0);
          self.render();
        }, 100);
      }, self);
      return this;
    },
    _onpanstart: function (e) {
      var self = this;
      var scrollLeft = self.getScrollLeft();
      var scrollTop = self.getScrollTop();
      self.stop();
      self.translate(-scrollLeft, -scrollTop);
      var threshold = self.mc.get('pan').options.threshold;
      self.thresholdY = e.direction == '8' ? threshold : e.direction == '16' ? -threshold : 0;
      self.thresholdX = e.direction == '2' ? threshold : e.direction == '4' ? -threshold : 0;
      return self;
    },
    _onpan: function (e) {
      var self = this;
      var boundry = self.boundry;
      var scrollTop = self.__topstart || (self.__topstart = -self.getScrollTop());
      var scrollLeft = self.__leftstart || (self.__leftstart = -self.getScrollLeft());
      var y = self.userConfig.lockY ? Number(scrollTop) : Number(scrollTop) + (e.deltaY + self.thresholdY);
      var x = self.userConfig.lockX ? Number(scrollLeft) : Number(scrollLeft) + (e.deltaX + self.thresholdX);
      var containerWidth = self.containerWidth;
      var containerHeight = self.containerHeight;
      //over top
      y = y > boundry.top ? (y - boundry.top) * PAN_RATE + boundry.top : y;
      //over bottom
      y = y < boundry.bottom - containerHeight ? y + (boundry.bottom - containerHeight - y) * PAN_RATE : y;
      //over left
      x = x > boundry.left ? (x - boundry.left) * PAN_RATE + boundry.left : x;
      //over right
      x = x < boundry.right - containerWidth ? x + (boundry.right - containerWidth - x) * PAN_RATE : x;
      //move to x,y
      self.translate(x, y);
      //pan trigger the opposite direction
      self.directionX = e.type == 'panleft' ? 'right' : e.type == 'panright' ? 'left' : '';
      self.directionY = e.type == 'panup' ? 'down' : e.type == 'pandown' ? 'up' : '';
      self.trigger('scroll', {
        scrollTop: -y,
        scrollLeft: -x,
        triggerType: 'pan',
        type: 'scroll'
      });
      return self;
    },
    _onpanend: function (e) {
      var self = this;
      var userConfig = self.userConfig;
      var transX = self.computeScroll('x', e.velocityX);
      var transY = self.computeScroll('y', e.velocityY);
      var scrollLeft = transX ? transX.pos : 0;
      var scrollTop = transY ? transY.pos : 0;
      var duration;
      if (transX && transY && transX.status == 'inside' && transY.status == 'inside' && transX.duration && transY.duration) {
        //ensure the same duration
        duration = Math.max(transX.duration, transY.duration);
      }
      transX && self.scrollLeft(scrollLeft, duration || transX.duration, transX.easing, function (e) {
        self.boundryCheckX();
      });
      transY && self.scrollTop(scrollTop, duration || transY.duration, transY.easing, function (e) {
        self.boundryCheckY();
      });
      //judge the direction
      self.directionX = e.velocityX < 0 ? 'left' : 'right';
      self.directionY = e.velocityY < 0 ? 'up' : 'down';
      //clear start
      self.__topstart = null;
      self.__leftstart = null;
      return self;
    },
    /**
     * judge the scroller is out of boundry horizontally and vertically
     * @memberof SimuScroll
     * @return {boolean} isBoundryOut
     **/
    isBoundryOut: function () {
      return this.isBoundryOutLeft() || this.isBoundryOutRight() || this.isBoundryOutTop() || this.isBoundryOutBottom();
    },
    /**
     * judge if the scroller is outsideof left
     * @memberof SimuScroll
     * @return {boolean} isBoundryOut
     **/
    isBoundryOutLeft: function () {
      return this.getBoundryOutLeft() > 0 ? true : false;
    },
    /**
     * judge if the scroller is outsideof right
     * @memberof SimuScroll
     * @return {boolean} isBoundryOut
     **/
    isBoundryOutRight: function () {
      return this.getBoundryOutRight() > 0 ? true : false;
    },
    /**
     * judge if the scroller is outsideof top
     * @memberof SimuScroll
     * @return {boolean} isBoundryOut
     **/
    isBoundryOutTop: function () {
      return this.getBoundryOutTop() > 0 ? true : false;
    },
    /**
     * judge if the scroller is outsideof bottom
     * @memberof SimuScroll
     * @return {boolean} isBoundryOut
     **/
    isBoundryOutBottom: function () {
      return this.getBoundryOutBottom() > 0 ? true : false;
    },
    /**
     * get the offset value outsideof top
     * @memberof SimuScroll
     * @return {number} offset
     **/
    getBoundryOutTop: function () {
      return this.boundry.top - this.getScrollTop();
    },
    /**
     * get the offset value outsideof left
     * @memberof SimuScroll
     * @return {number} offset
     **/
    getBoundryOutLeft: function () {
      return this.boundry.left - this.getScrollLeft();
    },
    /**
     * get the offset value outsideof bottom
     * @memberof SimuScroll
     * @return {number} offset
     **/
    getBoundryOutBottom: function () {
      return this.boundry.bottom - this.containerHeight + this.getScrollTop();
    },
    /**
     * get the offset value outsideof right
     * @memberof SimuScroll
     * @return {number} offset
     **/
    getBoundryOutRight: function () {
      return this.boundry.right - this.containerWidth + this.getScrollLeft();
    },
    /**
     * compute scroll transition by zoomType and velocity
     * @memberof SimuScroll
     * @param {string} zoomType zoomType of scrolling
     * @param {number} velocity velocity after panend
     * @example
     * var info = xscroll.computeScroll("x",2);
     * // return {pos:90,easing:"easing",status:"inside",duration:500}
     * @return {Object}
     **/
    computeScroll: function (type, v) {
      var self = this;
      var userConfig = self.userConfig;
      var pos = type == 'x' ? self.getScrollLeft() : self.getScrollTop();
      var boundry = self.boundry;
      var boundryStart = type == 'x' ? boundry.left : boundry.top;
      var boundryEnd = type == 'x' ? boundry.right : boundry.bottom;
      var innerSize = type == 'x' ? self.containerWidth : self.containerHeight;
      var maxSpeed = userConfig.maxSpeed || 2;
      var size = boundryEnd - boundryStart;
      var transition = {};
      var status = 'inside';
      if (type == 'x' && (self.isBoundryOutLeft() || self.isBoundryOutRight())) {
        self.boundryCheckX();
        return;
      } else if (type == 'y' && (self.isBoundryOutTop() || self.isBoundryOutBottom())) {
        self.boundryCheckY();
        return;
      }
      if (type == 'x' && self.userConfig.lockX)
        return;
      if (type == 'y' && self.userConfig.lockY)
        return;
      v = v > maxSpeed ? maxSpeed : v < -maxSpeed ? -maxSpeed : v;
      var a = self.SROLL_ACCELERATION * (v / (Math.abs(v) || 1));
      var a2 = self.BOUNDRY_ACCELERATION;
      var t = isNaN(v / a) ? 0 : v / a;
      var s = Number(pos) + t * v / 2;
      //over top boundry check bounce
      if (s < boundryStart) {
        var _s = boundryStart - pos;
        var _t = (Math.sqrt(-2 * a * _s + v * v) + v) / a;
        var v0 = v - a * _t;
        var _t2 = Math.abs(v0 / a2);
        var s2 = v0 / 2 * _t2;
        t = _t + _t2;
        s = boundryStart + s2;
        status = 'outside';
      } else if (s > innerSize - boundryEnd) {
        var _s = boundryEnd - innerSize + pos;
        var _t = (Math.sqrt(-2 * a * _s + v * v) - v) / a;
        var v0 = v - a * _t;
        var _t2 = Math.abs(v0 / a2);
        var s2 = v0 / 2 * _t2;
        t = _t + _t2;
        s = innerSize - boundryEnd + s2;
        status = 'outside';
      }
      transition.pos = s;
      transition.duration = t;
      transition.easing = Math.abs(v) > 2 ? 'circular' : 'quadratic';
      transition.status = status;
      self['isScrolling' + type.toUpperCase()] = true;
      return transition;
    },
    /**
     * bounce to the boundry horizontal
     * @memberof SimuScroll
     * @return {SimuScroll}
     **/
    boundryCheckX: function (duration, easing, callback) {
      var self = this;
      if (typeof arguments[0] == 'function') {
        callback = arguments[0];
        duration = self.userConfig.BOUNDRY_CHECK_DURATION;
        easing = self.userConfig.BOUNDRY_CHECK_EASING;
      } else {
        duration = duration === 0 ? 0 : self.userConfig.BOUNDRY_CHECK_DURATION, easing = easing || self.userConfig.BOUNDRY_CHECK_EASING;
      }
      if (!self.boundryCheckEnabled || self.userConfig.lockX)
        return;
      var pos = self.getScrollLeft();
      var containerWidth = self.containerWidth;
      var boundry = self.boundry;
      if (pos < boundry.left) {
        self.scrollLeft(-boundry.left, duration, easing, callback);
      } else if (pos > containerWidth - boundry.right) {
        self.scrollLeft(containerWidth - boundry.right, duration, easing, callback);
      }
      return self;
    },
    /**
     * bounce to the boundry vertical
     * @memberof SimuScroll
     * @return {SimuScroll}
     **/
    boundryCheckY: function (duration, easing, callback) {
      var self = this;
      if (typeof arguments[0] == 'function') {
        callback = arguments[0];
        duration = self.userConfig.BOUNDRY_CHECK_DURATION;
        easing = self.userConfig.BOUNDRY_CHECK_EASING;
      } else {
        duration = duration === 0 ? 0 : self.userConfig.BOUNDRY_CHECK_DURATION, easing = easing || self.userConfig.BOUNDRY_CHECK_EASING;
      }
      if (!self.boundryCheckEnabled || self.userConfig.lockY)
        return;
      var pos = self.getScrollTop();
      var containerHeight = self.containerHeight;
      var boundry = self.boundry;
      if (pos < boundry.top) {
        self.scrollTop(-boundry.top, duration, easing, callback);
      } else if (pos > containerHeight - boundry.bottom) {
        self.scrollTop(containerHeight - boundry.bottom, duration, easing, callback);
      }
      return self;
    },
    /**
     * bounce to the boundry vertical and horizontal
     * @memberof SimuScroll
     * @return {SimuScroll}
     **/
    boundryCheck: function (duration, easing, callback) {
      this.boundryCheckX(duration, easing, callback);
      this.boundryCheckY(duration, easing, callback);
      return this;
    },
    /**
     * stop scrolling immediatelly
     * @memberof SimuScroll
     * @return {SimuScroll}
     **/
    stop: function () {
      var self = this;
      self.__timers.x && self.__timers.x.stop();
      self.__timers.y && self.__timers.y.stop();
      if (self.isScrollingX || self.isScrollingY) {
        var scrollTop = self.getScrollTop(), scrollLeft = self.getScrollLeft();
        self.trigger('scrollend', {
          scrollTop: scrollTop,
          scrollLeft: scrollLeft
        });
        self.trigger('stop', {
          scrollTop: scrollTop,
          scrollLeft: scrollLeft
        });
        self.isScrollingX = false;
        self.isScrollingY = false;
        //disable click
        self._isClickDisabled = true;
      } else {
        self._isClickDisabled = false;
      }
      return self;
    },
    /**
     * render scroll
     * @memberof SimuScroll
     * @return {SimuScroll}
     **/
    render: function () {
      var self = this;
      SimuScroll.superclass.render.call(this);
      //fixed for scrollbars
      if (getComputedStyle(self.renderTo).position == 'static') {
        self.renderTo.style.position = 'relative';
      }
      self.renderTo.style.overflow = 'hidden';
      self.initScrollBars();
      self.initController();
      //update touch-action 
      self.initTouchAction();
      return self;
    },
    /**
     * init touch action
     * @memberof SimuScroll
     * @return {SimuScroll}
     */
    initTouchAction: function () {
      var self = this;
      var touchAction = 'none';
      if (!self.userConfig.lockX && self.userConfig.lockY) {
        touchAction = 'pan-y';
      } else if (!self.userConfig.lockY && self.userConfig.lockX) {
        touchAction = 'pan-x';
      } else if (self.userConfig.lockX && self.userConfig.lockY) {
        touchAction = 'auto';
      }
      self.mc.set({ touchAction: touchAction });
      return self;
    },
    /**
     * init scrollbars
     * @memberof SimuScroll
     * @return {SimuScroll}
     */
    initScrollBars: function () {
      var self = this;
      if (self.userConfig.scrollbarX) {
        self.scrollbarX = self.scrollbarX || new ScrollBar({
          xscroll: self,
          type: 'x'
        });
        self.scrollbarX._update();
        self.scrollbarX.hide();
      }
      if (self.userConfig.scrollbarY) {
        self.scrollbarY = self.scrollbarY || new ScrollBar({
          xscroll: self,
          type: 'y'
        });
        self.scrollbarY._update();
        self.scrollbarY.hide();
      }
      return self;
    },
    /**
     * init controller for multi-scrollers
     * @memberof SimuScroll
     * @return {SimuScroll}
     */
    initController: function () {
      var self = this;
      self.controller = self.controller || new Controller({ xscroll: self });
      return self;
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = SimuScroll;
  } else {
    return SimuScroll;
  }
  return exports;
}({});
origin_scroll = function (exports) {
  var Util = util, Base = base, Core = core, Animate = animate;
  var transformOrigin = Util.prefixStyle('transformOrigin');
  /** 
   * @constructor
   * @param {object} cfg config for scroll
   * @extends XScroll
   * @example
   * var xscroll = new OriginScroll({
   *    renderTo:"#scroll"
   * });
   * xscroll.render();
   */
  function OriginScroll(cfg) {
    OriginScroll.superclass.constructor.call(this, cfg);
  }
  Util.extend(OriginScroll, Core, {
    init: function () {
      var self = this;
      OriginScroll.superclass.init.call(this);
      self._initContainer();
      self.resetSize();
    },
    _initContainer: function () {
      var self = this;
      if (self.__isContainerInited)
        return;
      var renderTo = self.renderTo;
      var container = self.container = self.renderTo.querySelector('.' + self.containerClsName);
      var content = self.content = self.renderTo.querySelector('.' + self.contentClsName);
      self.__isContainerInited = true;
      return self;
    },
    /**
     * get scroll top value
     * @memberof OriginScroll
     * @return {number} scrollTop
     */
    getScrollTop: function () {
      return this.renderTo.scrollTop;
    },
    /**
     * get scroll left value
     * @memberof OriginScroll
     * @return {number} scrollLeft
     */
    getScrollLeft: function () {
      return this.renderTo.scrollLeft;
    },
    /**
     * vertical scroll absolute to the destination
     * @memberof SimuScroll
     * @param scrollTop {number} scrollTop
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollTop: function (y, duration, easing, callback) {
      var self = this;
      var y = Math.round(y);
      if (self.userConfig.lockY)
        return;
      var duration = duration || 0;
      var easing = easing || 'quadratic';
      var config = {
        css: { scrollTop: y },
        duration: duration,
        easing: easing,
        run: function (e) {
          //trigger scroll event
          self.trigger('scroll', {
            scrollTop: self.getScrollTop(),
            scrollLeft: self.getScrollLeft()
          });
        },
        useTransition: false,
        //scrollTop 
        end: callback
      };
      self.__timers.y = self.__timers.y || new Animate(self.renderTo, config);
      //run
      self.__timers.y.stop();
      self.__timers.y.reset(config);
      self.__timers.y.run();
    },
    /**
     * horizontal scroll absolute to the destination
     * @memberof SimuScroll
     * @param scrollLeft {number} scrollLeft
     * @param duration {number} duration for animte
     * @param easing {string} easing functio for animate : ease-in | ease-in-out | ease | bezier(n,n,n,n)
     **/
    scrollLeft: function (x, duration, easing, callback) {
      var self = this;
      var x = Math.round(x);
      if (self.userConfig.lockX)
        return;
      var duration = duration || 0;
      var easing = easing || 'quadratic';
      var config = {
        css: { scrollLeft: x },
        duration: duration,
        easing: easing,
        run: function (e) {
          //trigger scroll event
          self.trigger('scroll', {
            scrollTop: self.getScrollTop(),
            scrollLeft: self.getScrollLeft()
          });
        },
        useTransition: false,
        //scrollTop 
        end: callback
      };
      self.__timers.x = self.__timers.x || new Animate(self.renderTo, config);
      //run
      self.__timers.x.stop();
      self.__timers.x.reset(config);
      self.__timers.x.run();
    },
    _bindEvt: function () {
      OriginScroll.superclass._bindEvt.call(this);
      var self = this;
      if (self.__isEvtBind)
        return;
      self.__isEvtBind = true;
      self.renderTo.addEventListener('scroll', function (e) {
        self.trigger('scroll', {
          type: 'scroll',
          scrollTop: self.getScrollTop(),
          scrollLeft: self.getScrollLeft()
        });
      }, false);
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = OriginScroll;
  } else {
    return OriginScroll;
  }
  return exports;
}({});
_xscroll_ = function (exports) {
  var Util = util, SimuScroll = simulate_scroll, OriginScroll = origin_scroll;
  var XScroll = function (cfg) {
    var _ = cfg && cfg.useOriginScroll ? OriginScroll : SimuScroll;
    return new _(cfg);
  };
  /**
  * util
  * @namespace Util
  * @type {Object}
  */
  XScroll.Util = Util;
  /**
  * plugins
  * @namespace Plugins
  * @type {Object}
  */
  XScroll.Plugins = {};
  if (typeof module == 'object' && module.exports) {
    exports = XScroll;
  } else {
    return window.XScroll = XScroll;
  }
  return exports;
}({});
xscroll_master = function (exports) {
  var Util = util, Base = base, XScroll = _xscroll_;
  /** 
  * A master for multi-scrollers. 
  * @constructor
  * @param {object} cfg - config for master.
  * @extends Base
  */
  var XScrollMaster = function (cfg) {
    XScrollMaster.superclass.constructor.call(this, cfg);
    this.init(cfg);
  };
  Util.extend(XScrollMaster, Base, {
    /**
     * init the master
     * @param {object} cfg config for master
     * @param {string} selector xscroll root elements,it will be set to xscroll.renderTo
     * @return {[type]}
     */
    init: function (cfg) {
      var self = this;
      self.userConfig = Util.mix({ selector: '.xscroll' }, cfg);
    },
    /**
     * find xscroll instance
     * @param {string} id element id for xscroll instance
     * @return {XScroll} xscroll instance
     */
    get: function (id) {
      var self = this;
      if (!id)
        return;
      for (var i = 0, l = self.__xscrolls.length; i < l; i++) {
        if (self.__xscrolls[i].renderTo.id === id) {
          return self.__xscrolls[i];
        }
      }
      return;
    },
    getAll: function () {
      return this.__xscrolls;
    },
    getElPos: function () {
      var self = this;
      var elpos = [];
      var els = document.querySelectorAll(self.userConfig.selector);
      for (var i = 0; i < els.length; i++) {
        var content = els[i].querySelector('.xs-content');
        elpos.push({
          el: els[i],
          containerWidth: content.offsetWidth,
          containerHeight: content.offsetHeight,
          width: els[i].offsetWidth,
          height: els[i].offsetHeight
        });
      }
      console.log(elpos[0]);
      return elpos;
    },
    render: function () {
      var self = this;
      var findByEl = function (el, xscrolls) {
        if (!el || !xscrolls)
          return;
        for (var i = 0, l = xscrolls.length; i < l; i++) {
          if (xscrolls[i].renderTo === el) {
            return xscrolls[i];
          }
        }
      };
      var els = document.querySelectorAll(self.userConfig.selector);
      var elpos = self.getElPos();
      self.__xscrolls = [];
      for (var i = 0; i < els.length; i++) {
        self.__xscrolls.push(new XScroll({
          renderTo: els[i],
          containerWidth: elpos[i].containerWidth,
          containerHeight: elpos[i].containerHeight,
          width: elpos[i].width,
          height: elpos[i].height
        }).render());
      }
      for (var i = 0, l = self.__xscrolls.length; i < l; i++) {
        var innerEls = self.__xscrolls[i].renderTo.querySelectorAll(self.userConfig.selector);
        for (var j = 0; j < innerEls.length; j++) {
          var xscroll = findByEl(innerEls[j], self.__xscrolls);
          if (xscroll && self.__xscrolls[i].controller) {
            self.__xscrolls[i].controller.add(xscroll);
          }
        }
      }
      self._bindEvt();
    },
    _bindEvt: function () {
      var self = this;
      //window resize
      window.addEventListener('resize', function (e) {
        setTimeout(function () {
          var elpos = self.getElPos();
          for (var i = 0, l = self.__xscrolls.length; i < l; i++) {
            var xscroll = self.__xscrolls[i];
            xscroll.userConfig.containerWidth = elpos[i].containerWidth;
            xscroll.userConfig.containerHeight = elpos[i].containerHeight;
            xscroll.userConfig.width = elpos[i].width;
            xscroll.userConfig.height = elpos[i].height;
            xscroll.boundry.refresh({
              width: xscroll.userConfig.width,
              height: xscroll.userConfig.height
            });
            xscroll.boundryCheck(0);
            xscroll.render();
            console.log(elpos[i].containerHeight, xscroll.userConfig.containerHeight);
          }
        }, 0);
      }, self);
    }
  });
  if (typeof module == 'object' && module.exports) {
    exports = XScrollMaster;
  } else {
    return window.XScrollMaster = XScrollMaster;
  }
  return exports;
}({});
}());