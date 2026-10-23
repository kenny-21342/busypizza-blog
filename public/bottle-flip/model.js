/* A deliberately minimal, inspectable model of a bottle flip.
 * Geometry and water are represented by axial slices. Air drag, fluid jets,
 * three-dimensional wobble, and impact settling are outside this model.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BottleFlipModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const H = 0.23;                 // m
  const CAPACITY = 0.0005;       // m^3 (500 mL)
  const BOTTLE_MASS = 0.025;     // kg
  const WATER_DENSITY = 1000;    // kg / m^3
  const G = 9.81;                // m / s^2
  const N = 72;
  const DT = 1 / 300;

  const SHAPES = {
    cylinder: {
      label: "直筒瓶",
      description: "侧壁近乎笔直，作为比较基准。",
      rawRadius: () => 1,
    },
    shoulder: {
      label: "收肩瓶",
      description: "上半部向瓶口收窄；底部宽度与瓶身接近。",
      rawRadius: u => u < 0.72 ? 1 : 1 - 0.48 * (u - 0.72) / 0.28,
    },
    wideBase: {
      label: "宽底瓶",
      description: "底部更宽，但总容量仍与其他瓶形相同。",
      rawRadius: u => u < 0.22 ? 1.28 - 0.22 * u / 0.22 : 1.06 - 0.13 * (u - 0.22) / 0.78,
    },
    hourglass: {
      label: "细腰瓶",
      description: "中段收窄；水的真实流动可能受瓶颈影响。",
      rawRadius: u => 1.05 - 0.32 * Math.exp(-Math.pow((u - 0.5) / 0.19, 2)),
    },
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rad = d => d * Math.PI / 180;
  const deg = r => r * 180 / Math.PI;

  function geometry(shapeKey, capDiameter = 0.028) {
    const shape = SHAPES[shapeKey] || SHAPES.cylinder;
    const capRadius = clamp(capDiameter, 0.015, 0.05) / 2;
    const dz = H / N;
    // A common neck closes each profile at the specified flat cap. Solve the
    // body scale analytically so all profiles still hold exactly 500 mL.
    const blend = u => {
      const v = clamp((u - 0.82) / 0.18, 0, 1);
      return v * v * (3 - 2 * v);
    };
    let A = 0, B = 0, C = 0;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const b = blend(u);
      const a = (1 - b) * shape.rawRadius(u), c = b * capRadius;
      A += Math.PI * a * a * dz;
      B += 2 * Math.PI * a * c * dz;
      C += Math.PI * c * c * dz;
    }
    const scale = (2 * (CAPACITY - C)) / (B + Math.sqrt(B * B + 4 * A * (CAPACITY - C)));
    const radiusAt = u => {
      const b = blend(u);
      return (1 - b) * shape.rawRadius(u) * scale + b * capRadius;
    };
    const slices = [];
    let volumeSum = 0;
    let sideWeightSum = 0;
    for (let i = 0; i < N; i++) {
      const z = (i + 0.5) * dz;
      const r = radiusAt(z / H);
      const volume = Math.PI * r * r * dz;
      const prev = radiusAt(clamp((i - 0.5) / N, 0, 1));
      const next = radiusAt(clamp((i + 1.5) / N, 0, 1));
      const slant = Math.hypot(dz, (next - prev) / 2);
      const sideWeight = 2 * Math.PI * r * slant;
      slices.push({ z, r, volume, sideWeight });
      volumeSum += volume;
      sideWeightSum += sideWeight;
    }
    const baseRadius = radiusAt(0);
    const topRadius = capRadius;
    const outline = [];
    for (let i = 0; i <= 48; i++) {
      const z = H * i / 48;
      outline.push({ z, r: radiusAt(i / 48) });
    }
    return { key: shapeKey, label: shape.label, description: shape.description,
             slices, volumeSum, sideWeightSum, baseRadius, topRadius, outline,
             capDiameter: 2 * capRadius };
  }

  function addMoments(target, mass, z, radialSecondMoment) {
    target.m += mass;
    target.s1 += mass * z;
    target.s2 += mass * z * z;
    target.radial += mass * radialSecondMoment;
  }

  function emptyMoments() { return { m: 0, s1: 0, s2: 0, radial: 0 }; }

  function prepare(shapeKey, fillFraction, capDiameter = 0.028) {
    const geo = geometry(shapeKey, capDiameter);
    const fill = clamp(fillFraction, 0, 1);
    const bottle = emptyMoments();
    for (const s of geo.slices) {
      const m = BOTTLE_MASS * 0.86 * s.sideWeight / geo.sideWeightSum;
      addMoments(bottle, m, s.z, s.r * s.r / 2);
    }
    addMoments(bottle, BOTTLE_MASS * 0.09, 0, geo.baseRadius ** 2 / 4);
    addMoments(bottle, BOTTLE_MASS * 0.05, H, geo.topRadius ** 2 / 4);

    const waterStart = emptyMoments();
    const waterSpread = emptyMoments();
    const waterAtCap = emptyMoments();
    const initialOccupancy = [];
    let volumeRemaining = fill * geo.volumeSum;
    for (const s of geo.slices) {
      const initialVolume = Math.min(s.volume, Math.max(0, volumeRemaining));
      volumeRemaining -= initialVolume;
      initialOccupancy.push(initialVolume / s.volume);
      addMoments(waterStart, WATER_DENSITY * initialVolume, s.z, s.r * s.r / 4);
      addMoments(waterSpread, WATER_DENSITY * fill * s.volume, s.z, s.r * s.r / 4);
    }
    volumeRemaining = fill * geo.volumeSum;
    for (let i = geo.slices.length - 1; i >= 0; i--) {
      const s = geo.slices[i];
      const volume = Math.min(s.volume, Math.max(0, volumeRemaining));
      volumeRemaining -= volume;
      addMoments(waterAtCap, WATER_DENSITY * volume, s.z, s.r * s.r / 4);
    }
    return { geo, fill, bottle, waterStart, waterSpread, waterAtCap, initialOccupancy };
  }

  function spreadFraction(time, tau) {
    if (time <= 0) return 0;
    return 0.94 * (1 - Math.exp(-Math.pow(time / Math.max(0.03, tau), 1.5)));
  }

  function state(prepared, time, tau) {
    const a = spreadFraction(time, tau);
    const b = prepared.bottle;
    const w0 = prepared.waterStart;
    const w1 = prepared.waterSpread;
    const m = b.m + w0.m;
    const s1 = b.s1 + (1 - a) * w0.s1 + a * w1.s1;
    const s2 = b.s2 + (1 - a) * w0.s2 + a * w1.s2;
    const radial = b.radial + (1 - a) * w0.radial + a * w1.radial;
    const com = s1 / m;
    const inertia = Math.max(1e-8, s2 - s1 * s1 / m + radial);
    return { com, inertia, spread: a, mass: m };
  }

  function support(geo, angle, com) {
    const co = Math.cos(angle);
    const si = Math.abs(Math.sin(angle));
    let min = Infinity;
    let contactZ = 0;
    for (const vertex of geo.outline) {
      const y = (vertex.z - com) * co - vertex.r * si;
      if (y < min) { min = y; contactZ = vertex.z; }
    }
    return { distance: -min, contactZ };
  }

  function transformPoint(xBody, zBody, com, angle, xWorld, yWorld) {
    const dy = zBody - com;
    const co = Math.cos(angle), si = Math.sin(angle);
    return { x: xWorld + xBody * co + dy * si,
             y: yWorld - xBody * si + dy * co };
  }

  function normalizeParams(input) {
    return {
      target: input.target === "inverted" ? "inverted" : "upright",
      shape: SHAPES[input.shape] ? input.shape : "cylinder",
      capDiameter: clamp(Number(input.capDiameter ?? 0.028), 0.015, 0.05),
      fill: clamp(Number(input.fill ?? 0.30), 0, 1),
      clearance: clamp(Number(input.clearance ?? 0.52), 0.05, 2),
      releaseAngle: clamp(Number(input.releaseAngle ?? 110), -180, 180),
      speed: clamp(Number(input.speed ?? 2.8), 0, 6),
      direction: clamp(Number(input.direction ?? 67), -80, 89),
      spin: clamp(Number(input.spin ?? 2.1), -5, 5),
      spreadTime: clamp(Number(input.spreadTime ?? 0.18), 0.04, 1.2),
    };
  }

  function simulate(input, options = {}) {
    const params = normalizeParams(input);
    const prepared = prepare(params.shape, params.fill, params.capDiameter);
    const atStart = state(prepared, 0, params.spreadTime);
    const angle0 = rad(params.releaseAngle);
    const spin0 = 2 * Math.PI * params.spin;
    const angularMomentum = atStart.inertia * spin0;
    const vy = params.speed * Math.sin(rad(params.direction));
    const vx = params.speed * Math.cos(rad(params.direction));
    const initialSupport = support(prepared.geo, angle0, atStart.com);
    const y0 = params.clearance + initialSupport.distance;
    const sampleStride = options.fast ? 14 : 3;
    const trajectory = [];
    let t = 0, angle = angle0, prevGap = params.clearance;
    let contact = null;
    let step = 0;
    const maxTime = 2.4;
    while (t <= maxTime) {
      const current = state(prepared, t, params.spreadTime);
      const omega = angularMomentum / current.inertia;
      const x = vx * t;
      const y = y0 + vy * t - 0.5 * G * t * t;
      const touching = support(prepared.geo, angle, current.com);
      const gap = y - touching.distance;
      if (step % sampleStride === 0 || (t > 0 && gap <= 0)) {
        trajectory.push({ t, x, y, angle, omega, inertia: current.inertia,
                          com: current.com, spread: current.spread, gap });
      }
      if (t > 0 && gap <= 0) {
        const last = trajectory.length > 1 ? trajectory[trajectory.length - 2] : null;
        // The time step is below 4 ms; the recorded state is sufficient for display.
        const wrapped = ((deg(angle) % 360) + 360) % 360;
        const uprightTilt = Math.min(wrapped, 360 - wrapped);
        const invertedTilt = Math.abs(wrapped - 180);
        const kind = touching.contactZ < H * 0.07 ? "瓶底先碰地" :
                     touching.contactZ >= H - 1e-9 ? "瓶盖先碰地" :
                     touching.contactZ > H * 0.75 ? "瓶肩先碰地" : "瓶侧先碰地";
        contact = { t, x, y, angle, omega, inertia: current.inertia,
                    com: current.com, spread: current.spread, gap,
                    uprightTilt, invertedTilt, kind, contactZ: touching.contactZ,
                    verticalSpeed: vy - G * t, horizontalSpeed: vx,
                    previousGap: last ? last.gap : prevGap };
        break;
      }
      prevGap = gap;
      const nextState = state(prepared, t + DT, params.spreadTime);
      const nextOmega = angularMomentum / nextState.inertia;
      angle += 0.5 * (omega + nextOmega) * DT;
      t += DT;
      step++;
    }
    const uprightCom = atStart.com;
    const staticTipAngle = deg(Math.atan2(prepared.geo.baseRadius, uprightCom));
    const invertedCom = (prepared.bottle.s1 + prepared.waterAtCap.s1) /
                        (prepared.bottle.m + prepared.waterAtCap.m);
    const capTipAngle = deg(Math.atan2(prepared.geo.topRadius, H - invertedCom));
    return { params, geometry: prepared.geo, prepared, trajectory, contact,
             initial: { x: 0, y: y0, angle: angle0, com: atStart.com,
                        inertia: atStart.inertia, omega: spin0 },
             staticTipAngle, capTipAngle, apexY: y0 + Math.max(0, vy) ** 2 / (2 * G),
             angularMomentum };
  }

  return { H, CAPACITY, BOTTLE_MASS, G, SHAPES, geometry, prepare, state,
           spreadFraction, support, transformPoint, normalizeParams, simulate };
});
