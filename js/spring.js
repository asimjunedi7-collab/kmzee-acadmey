/*
 * Tiny spring engine (no dependencies).
 *
 * Springs are described the way Apple describes them: a damping ratio
 * (1 = critically damped, no overshoot; <1 bounces) and a response in
 * seconds (how quickly it gets there). They always start from the live
 * on-screen value and can be interrupted or redirected at any moment,
 * inheriting the current velocity.
 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KM = (window.KM = window.KM || {});

  KM.reduced = function () { return rmq.matches; };
  KM.onReducedChange = function (fn) {
    if (rmq.addEventListener) rmq.addEventListener('change', fn);
    else if (rmq.addListener) rmq.addListener(fn);
  };

  var active = new Set();
  var raf = 0;
  var last = 0;

  function tick(now) {
    // Clamp dt so a backgrounded tab doesn't explode the integrator.
    var dt = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    active.forEach(function (s) { s._step(dt); });
    raf = active.size ? requestAnimationFrame(tick) : 0;
  }

  function wake(s) {
    active.add(s);
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  function Spring(value, opts) {
    opts = opts || {};
    this.value = value || 0;
    this.velocity = 0;
    this.target = this.value;
    this.response = opts.response != null ? opts.response : 0.4;
    this.damping = opts.damping != null ? opts.damping : 1;
    this.precision = opts.precision != null ? opts.precision : 0.01;
    this.onUpdate = opts.onUpdate || null;
    this.onRest = opts.onRest || null;
  }

  /** Animate toward `target`, optionally handing off a release velocity (units/s). */
  Spring.prototype.to = function (target, o) {
    o = o || {};
    if (o.response != null) this.response = o.response;
    if (o.damping != null) this.damping = o.damping;
    this.target = target;
    if (rmq.matches && !o.keepMotion) { this.snap(target); return this; }
    if (o.velocity != null) this.velocity = o.velocity;
    wake(this);
    return this;
  };

  /** Jump to a value with no animation (used for 1:1 tracking during drags). */
  Spring.prototype.snap = function (v) {
    this.value = this.target = v;
    this.velocity = 0;
    active.delete(this);
    if (this.onUpdate) this.onUpdate(v);
    return this;
  };

  /** Freeze at the live value — interrupts a running animation without a jump. */
  Spring.prototype.stop = function () {
    this.target = this.value;
    this.velocity = 0;
    active.delete(this);
    return this;
  };

  Spring.prototype._step = function (dt) {
    var w = TAU / this.response;          // natural frequency
    var k = w * w;                        // stiffness
    var c = 2 * this.damping * w;         // damping coefficient
    var n = Math.max(1, Math.ceil(dt / (1 / 240)));
    var h = dt / n;
    for (var i = 0; i < n; i++) {
      var a = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.value - this.target) < this.precision &&
        Math.abs(this.velocity) < this.precision * 10) {
      this.value = this.target;
      this.velocity = 0;
      active.delete(this);
      if (this.onUpdate) this.onUpdate(this.value);
      if (this.onRest) this.onRest(this.value);
    } else if (this.onUpdate) {
      this.onUpdate(this.value);
    }
  };

  KM.spring = function (value, opts) { return new Spring(value, opts); };

  KM.clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  /** Progressive resistance past a boundary (Apple's rubber-band curve). */
  KM.rubber = function (over, dim, c) {
    c = c == null ? 0.55 : c;
    if (over <= 0) return 0;
    return (1 - 1 / ((over * c) / dim + 1)) * dim;
  };

  /** Where a flick at `v` px/s would come to rest (distance travelled). */
  KM.project = function (v, rate) {
    rate = rate == null ? 0.998 : rate;
    return (v / 1000) * rate / (1 - rate);
  };

  /** Rolling velocity estimate over the last ~100ms of pointer samples. */
  KM.velocityTracker = function () {
    var s = [];
    return {
      reset: function () { s.length = 0; },
      add: function (x, y, t) {
        s.push({ x: x, y: y, t: t });
        while (s.length > 1 && t - s[0].t > 100) s.shift();
      },
      get: function () {
        if (s.length < 2) return { x: 0, y: 0 };
        var a = s[0], b = s[s.length - 1];
        var dt = (b.t - a.t) / 1000;
        if (dt <= 0) return { x: 0, y: 0 };
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
      }
    };
  };
})();
