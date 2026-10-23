(function () {
  "use strict";
  const M = window.BottleFlipModel;
  const $ = id => document.getElementById(id);
  const fields = ["target", "shape", "capDiameter", "fill", "clearance", "releaseAngle", "speed", "direction", "spin", "spreadTime"];
  const defaults = { target: "upright", shape: "cylinder", capDiameter: 2.8, fill: 30,
                     clearance: 52, releaseAngle: 110, speed: 2.8, direction: 67,
                     spin: 2.1, spreadTime: 18 };
  const invertedPreset = { ...defaults, target: "inverted", releaseAngle: 0, spin: 1.5 };
  const outputs = {
    capDiameter: v => `${Number(v).toFixed(1)} cm`, fill: v => `${v}%`,
    clearance: v => `${v} cm`, releaseAngle: v => `${v}°`,
    speed: v => `${Number(v).toFixed(1)} m/s`, direction: v => `${v}°`,
    spin: v => `${Number(v).toFixed(1)} 转/秒`, spreadTime: v => `${v / 100} s`,
  };
  let current, comparisons, time = 0, playing = true, lastFrame = 0, pending = false;

  function readParams() {
    return {
      target: $("target").value,
      shape: $("shape").value,
      capDiameter: Number($("capDiameter").value) / 100,
      fill: Number($("fill").value) / 100,
      clearance: Number($("clearance").value) / 100,
      releaseAngle: Number($("releaseAngle").value),
      speed: Number($("speed").value),
      direction: Number($("direction").value),
      spin: Number($("spin").value),
      spreadTime: Number($("spreadTime").value) / 100,
    };
  }

  function updateLabels() {
    for (const field of fields) if (outputs[field]) $(field + "Value").textContent = outputs[field]($(field).value);
    $("shapeDescription").textContent = M.SHAPES[$("shape").value].description;
  }

  function recompute() {
    pending = false;
    updateLabels();
    const params = readParams();
    current = M.simulate(params);
    comparisons = Object.keys(M.SHAPES).map(key => M.simulate({ ...params, shape: key }, { fast: true }));
    time = 0;
    $("timeScrub").value = "0";
    updateResults();
    drawAll();
  }

  function scheduleRecompute() {
    if (!pending) { pending = true; requestAnimationFrame(recompute); }
  }

  function pct(v) { return `${Math.round(v * 100)}%`; }
  function one(v) { return Number(v).toFixed(1); }
  function updateResults() {
    const c = current.contact;
    if (!c) return;
    const inverted = current.params.target === "inverted";
    const tilt = inverted ? c.invertedTilt : c.uprightTilt;
    const tip = inverted ? current.capTipAngle : current.staticTipAngle;
    $("tiltLabel").textContent = inverted ? "偏离倒立" : "偏离正立";
    $("contactKind").textContent = c.kind;
    $("impactTilt").textContent = `${one(tilt)}°`;
    $("flightTime").textContent = `${c.t.toFixed(2)} s`;
    $("spinRatio").textContent = Math.abs(current.initial.omega) < 1e-7 ? "初始未自转" : pct(c.omega / current.initial.omega);
    let reading;
    if (inverted && c.kind === "瓶盖先碰地" && tilt < tip) reading = `瓶盖先碰地，偏角 ${one(tilt)}° 小于理想静态抗倾角 ${one(tip)}°。这只是落地前的有利条件；触地时仍有 ${one(Math.abs(c.omega))} rad/s 自转，且以 ${one(Math.abs(c.verticalSpeed))} m/s 下落，反弹可能让它倒下。`;
    else if (inverted && c.kind === "瓶盖先碰地") reading = `瓶盖先碰地，但 ${one(tilt)}° 的偏角已超过理想静态抗倾角 ${one(tip)}°；可试着调自转、出手角度或加宽平整瓶盖。`;
    else if (inverted) reading = "目标是瓶盖倒立，但这次先碰地的是其他部位。试着调初始角度、自转或滞空时间，让瓶盖在合适的时刻朝下。";
    else if (c.kind === "瓶底先碰地" && tilt < 15) reading = "瓶底几乎竖直地先碰到地面：这是有利的首次触地姿态。是否能站住，还取决于瓶内水流和碰撞后的反弹。";
    else if (c.kind === "瓶底先碰地") reading = "瓶底先着地，但瓶身仍有明显倾角；触地冲击后可能翻倒，模型没有继续追踪。";
    else reading = "目标是瓶底正立，但这次先碰地的是其他部位。改变出手角度、自转或滞空时间，可观察触地点如何移动。";
    $("interpretation").textContent = reading;
    $("tipNote").textContent = inverted ?
      "* 倒立的理想静态抗倾角 = arctan(瓶盖半径 / 静止后质心离瓶盖的高度)。假设水静止在瓶盖一端、瓶盖平整；不能预测碰撞后的站稳。" :
      "* 正立的理想静态抗倾角 = arctan(瓶底半径 / 静止时质心高度)。只用于比较几何稳定性，不能预测碰撞后的站稳。";
    const body = $("shapeRows");
    body.replaceChildren();
    for (const result of comparisons) {
      const row = document.createElement("tr");
      if (result.params.shape === current.params.shape) row.className = "current";
      const rc = result.contact;
      const cells = [result.geometry.label, rc ? rc.kind : "未触地", rc ? `${one(inverted ? rc.invertedTilt : rc.uprightTilt)}°` : "—",
        rc && Math.abs(result.initial.omega) > 1e-7 ? pct(rc.omega / result.initial.omega) : "—",
        `${one(inverted ? result.capTipAngle : result.staticTipAngle)}°`];
      cells.forEach((value, i) => {
        const td = document.createElement("td");
        if (i === 1 && rc) {
          const tag = document.createElement("span");
          tag.className = "tag " + (rc.kind.includes("瓶侧") || rc.kind.includes("瓶肩") ? "side" : rc.kind.includes("瓶盖") ? "cap" : "");
          tag.textContent = value; td.append(tag);
        } else td.textContent = value;
        if (i === 2 || i === 3 || i === 4) td.classList.add("num");
        row.append(td);
      });
      body.append(row);
    }
  }

  function canvasContext(canvas) {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(box.width * dpr));
    const height = Math.max(1, Math.round(box.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: box.width, h: box.height };
  }

  function interpolate(trajectory, t) {
    if (t <= 0) return trajectory[0];
    if (t >= trajectory[trajectory.length - 1].t) return trajectory[trajectory.length - 1];
    let low = 0, high = trajectory.length - 1;
    while (high - low > 1) { const mid = (low + high) >> 1; if (trajectory[mid].t < t) low = mid; else high = mid; }
    const a = trajectory[low], b = trajectory[high], p = (t - a.t) / (b.t - a.t);
    const item = { t };
    for (const key of ["x", "y", "angle", "omega", "inertia", "com", "spread", "gap"]) item[key] = a[key] + (b[key] - a[key]) * p;
    return item;
  }

  function drawBottle(ctx, result, pose, point, scale, alpha = 1) {
    const geo = result.geometry;
    const toPx = (x, z) => { const p = M.transformPoint(x, z, pose.com, pose.angle, pose.x, pose.y); return point(p.x, p.y); };
    ctx.save(); ctx.globalAlpha = alpha;
    // Each strip shows how much of an axial slice is occupied in the surrogate water model.
    const prepared = result.prepared;
    const widthFactor = 0.90;
    for (let i = 0; i < geo.slices.length; i += 2) {
      const s = geo.slices[i];
      const occupancy = (1 - pose.spread) * prepared.initialOccupancy[i] + pose.spread * prepared.fill;
      if (occupancy < .005) continue;
      const r = s.r * widthFactor;
      const z0 = Math.max(0, s.z - M.H / geo.slices.length), z1 = Math.min(M.H, s.z + M.H / geo.slices.length);
      const a = toPx(-r, z0), b = toPx(r, z0), c = toPx(r, z1), d = toPx(-r, z1);
      ctx.beginPath(); ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();
      ctx.fillStyle = `rgba(70,165,210,${Math.min(.56, .12 + occupancy * .44)})`; ctx.fill();
    }
    ctx.beginPath();
    for (let i = 0; i < geo.outline.length; i++) { const q = geo.outline[i], p = toPx(q.r, q.z); i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y); }
    for (let i = geo.outline.length - 1; i >= 0; i--) { const q = geo.outline[i], p = toPx(-q.r, q.z); ctx.lineTo(p.x,p.y); }
    ctx.closePath();ctx.fillStyle="rgba(255,255,255,.32)";ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle="#204b58";ctx.stroke();
    const baseA=toPx(-geo.baseRadius,0), baseB=toPx(geo.baseRadius,0);
    ctx.beginPath();ctx.moveTo(baseA.x,baseA.y);ctx.lineTo(baseB.x,baseB.y);ctx.strokeStyle="#ec8959";ctx.lineWidth=3.2;ctx.stroke();
    const capA=toPx(-geo.topRadius,M.H), capB=toPx(geo.topRadius,M.H);
    ctx.beginPath();ctx.moveTo(capA.x,capA.y);ctx.lineTo(capB.x,capB.y);ctx.strokeStyle="#8d69a9";ctx.lineWidth=3.2;ctx.stroke();
    const com=point(pose.x,pose.y);ctx.beginPath();ctx.arc(com.x,com.y,3.8,0,2*Math.PI);ctx.fillStyle="#ea8152";ctx.fill();
    ctx.restore();
  }

  function drawScene() {
    if (!current) return;
    const {ctx,w,h} = canvasContext($("scene"));
    ctx.clearRect(0,0,w,h);
    const c = current.contact || current.trajectory[current.trajectory.length - 1];
    const xmin = -.27, xmax = Math.max(.38,c.x + .30), ymax = Math.max(.72,current.apexY + .14);
    const scale = Math.min((w - 70) / (xmax - xmin), (h - 76) / ymax);
    const left = 35 - xmin * scale, ground = h - 39;
    const point = (x,y) => ({x:left+x*scale,y:ground-y*scale});
    ctx.strokeStyle="#c9d9d8";ctx.lineWidth=1;ctx.setLineDash([4,5]);
    for(let y=0.25;y<ymax;y+=0.25){const yy=point(0,y).y;ctx.beginPath();ctx.moveTo(30,yy);ctx.lineTo(w-24,yy);ctx.stroke();ctx.fillStyle="#9aabb3";ctx.font="11px system-ui";ctx.fillText(`${Math.round(y*100)} cm`,38,yy-6)}
    ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(20,ground);ctx.lineTo(w-20,ground);ctx.strokeStyle="#536e70";ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle="#7d939b";ctx.font="12px system-ui";ctx.fillText("地面",w-62,ground+20);
    ctx.beginPath();current.trajectory.forEach((item,i)=>{const p=point(item.x,item.y);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.setLineDash([5,6]);ctx.strokeStyle="#4d93b6";ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
    const impact=point(c.x,c.y);ctx.beginPath();ctx.arc(impact.x,impact.y,5,0,2*Math.PI);ctx.fillStyle="#ed9468";ctx.fill();
    const ghosts=[.08,.32,.58,.82].map(p=>interpolate(current.trajectory,c.t*p));
    ghosts.forEach(p=>drawBottle(ctx,current,p,point,scale,.16));
    const pose=interpolate(current.trajectory,time);drawBottle(ctx,current,pose,point,scale,1);
    const marker=point(pose.x,pose.y);ctx.font="12px system-ui";ctx.fillStyle="#33586b";ctx.fillText(`${time.toFixed(2)} s`,Math.min(marker.x+14,w-58),Math.max(22,marker.y-13));
  }

  function drawChart() {
    if (!current) return;
    const {ctx,w,h}=canvasContext($("chart"));ctx.clearRect(0,0,w,h);
    const data=current.trajectory, maxT=data[data.length-1].t;
    const i0=current.initial.inertia, omega0=current.initial.omega;
    const maxI=Math.max(...data.map(d=>d.inertia/i0));const ymax=Math.max(1.2,Math.ceil(maxI*2)/2);
    const L=42,R=w-15,T=15,B=h-30;
    const px=t=>L+(R-L)*t/maxT, py=v=>B-(B-T)*v/ymax;
    ctx.strokeStyle="#e5ebed";ctx.lineWidth=1;ctx.font="11px system-ui";
    for(let v=0;v<=ymax+.001;v+=.5){const y=py(v);ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();ctx.fillStyle="#8799a2";ctx.fillText(`${v.toFixed(1)}×`,4,y+4)}
    for(let k=0;k<=4;k++){const x=px(maxT*k/4);ctx.fillStyle="#8799a2";ctx.fillText(`${(maxT*k/4).toFixed(1)}s`,x-10,h-9)}
    const trace=(fn,color)=>{ctx.beginPath();data.forEach((d,i)=>{const x=px(d.t),y=py(fn(d));i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=2.7;ctx.stroke()};
    trace(d=>d.inertia/i0,"#087f75");trace(d=>Math.abs(omega0)<1e-7?0:Math.abs(d.omega/omega0),"#ec8959");
    ctx.beginPath();const x=px(time);ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.strokeStyle="#85949c";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  }

  function drawAll(){if(!current)return;$("timeLabel").textContent=`${time.toFixed(2)} s`;drawScene();drawChart()}
  function tick(stamp){
    if(lastFrame && playing && current && current.contact){
      const total=current.contact.t;
      const duration=Math.max(1.8,total*3);
      time+=(stamp-lastFrame)/1000 * total/duration;
      if(time>total) time%=total;
      $("timeScrub").value=String(Math.round(time/total*1000));
      drawAll();
    }
    lastFrame=stamp;requestAnimationFrame(tick);
  }
  fields.forEach(id=>$(id).addEventListener(id==="shape"||id==="target"?"change":"input",scheduleRecompute));
  function setPreset(preset){for(const [key,value] of Object.entries(preset))$(key).value=value;playing=true;$("playButton").textContent="暂停动画";recompute()}
  $("uprightPreset").addEventListener("click",()=>setPreset(defaults));
  $("invertedPreset").addEventListener("click",()=>setPreset(invertedPreset));
  $("playButton").addEventListener("click",()=>{playing=!playing;$("playButton").textContent=playing?"暂停动画":"播放动画"});
  $("timeScrub").addEventListener("input",()=>{if(!current?.contact)return;playing=false;$("playButton").textContent="播放动画";time=Number($("timeScrub").value)/1000*current.contact.t;drawAll()});
  window.addEventListener("resize",drawAll);
  recompute();requestAnimationFrame(tick);
})();
