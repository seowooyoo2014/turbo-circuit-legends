import { VehiclePhysics, clamp, dist2 } from "./physics.js?v=20260722f1weekend";

export const DRIVER_PRESETS = [
  { name: "루나", height: 1.02, bodyScale: .92, skinColor: 0xffd1a4, hairColor: 0x2d1b2f, outfitColor: 0xff5f7d, helmet: false, accessory: "scarf", build: "light" },
  { name: "카이", height: 1.12, bodyScale: 1.04, skinColor: 0xe9b78e, hairColor: 0x20232d, outfitColor: 0x48b7ff, helmet: true, accessory: "visor", build: "balanced" },
  { name: "노바", height: .96, bodyScale: .86, skinColor: 0xf1c5a6, hairColor: 0xbd78ff, outfitColor: 0x58e6bf, helmet: false, accessory: "antenna", build: "small" },
  { name: "솔", height: 1.22, bodyScale: 1.18, skinColor: 0xb87852, hairColor: 0xf5d547, outfitColor: 0xf5a442, helmet: true, accessory: "pads", build: "heavy" },
  { name: "미카", height: 1.05, bodyScale: .98, skinColor: 0xd9a27f, hairColor: 0xffffff, outfitColor: 0x7f8bff, helmet: false, accessory: "cape", build: "balanced" },
  { name: "제드", height: 1.18, bodyScale: 1.12, skinColor: 0xc58a6a, hairColor: 0x111820, outfitColor: 0xff6f4a, helmet: true, accessory: "visor", build: "broad" },
  { name: "아라", height: .98, bodyScale: .9, skinColor: 0xffc6a8, hairColor: 0x9ee36d, outfitColor: 0xffffff, helmet: false, accessory: "scarf", build: "light" },
  { name: "렌", height: 1.28, bodyScale: 1.24, skinColor: 0x8f5a3d, hairColor: 0x33251f, outfitColor: 0xd0d0d0, helmet: false, accessory: "pads", build: "heavy" },
  { name: "비오", height: 1.06, bodyScale: 1, skinColor: 0xe6bc93, hairColor: 0x203c6b, outfitColor: 0x36c8ff, helmet: true, accessory: "antenna", build: "balanced" },
  { name: "오르", height: 1.16, bodyScale: 1.06, skinColor: 0xb98a6a, hairColor: 0x181818, outfitColor: 0x6eff83, helmet: false, accessory: "cape", build: "broad" },
  { name: "이온", height: .94, bodyScale: .84, skinColor: 0xf2cab2, hairColor: 0xff8d3a, outfitColor: 0xbd78ff, helmet: true, accessory: "visor", build: "small" },
  { name: "타로", height: 1.2, bodyScale: 1.16, skinColor: 0xc89972, hairColor: 0x5c3b26, outfitColor: 0xffd34d, helmet: false, accessory: "pads", build: "heavy" },
  { name: "토르크", height: 1.34, bodyScale: 1.34, skinColor: 0x6d9b5c, hairColor: 0x3b2a1e, outfitColor: 0x6a9f45, helmet: false, accessory: "shell", build: "heavy" },
  { name: "루미", height: .9, bodyScale: .78, skinColor: 0xf5c49c, hairColor: 0x4a2b1c, outfitColor: 0xe64242, helmet: true, accessory: "visor", build: "small" },
  { name: "셀레나", height: 1.3, bodyScale: 1.04, skinColor: 0xf2d0b4, hairColor: 0xf7f0b8, outfitColor: 0x6f7cff, helmet: false, accessory: "crown", build: "tall" },
  { name: "로제", height: 1.12, bodyScale: .98, skinColor: 0xf3c5a7, hairColor: 0xffcf70, outfitColor: 0xff8fc7, helmet: false, accessory: "dressPanel", build: "royal" },
  { name: "요리", height: 1.02, bodyScale: .96, skinColor: 0x8ddb65, hairColor: 0x2f6c35, outfitColor: 0xffffff, helmet: false, accessory: "snoutTail", build: "mascot" }
];

export const KART_PRESETS = [
  { name: "스프린트", color: 0xf25346, length: 3.25, width: 2.15, height: .72, nose: "wedge", wheel: .42, spoiler: "wing", tuning: { accel: 2, maxSpeed: 1, handling: 1.04, drift: 1.04, miniTurbo: 1.05, boost: 1.04, weight: .94 } },
  { name: "컴팩트", color: 0x48b7ff, length: 2.85, width: 2.0, height: .82, nose: "round", wheel: .38, spoiler: "none", tuning: { accel: 4, grip: 1.5, handling: 1.1, drift: 1.12, miniTurbo: 1.08, offroad: 1.08, weight: .86 } },
  { name: "볼트", color: 0xf5d547, length: 3.55, width: 2.25, height: .66, nose: "needle", wheel: .44, spoiler: "fin", tuning: { maxSpeed: 4, grip: -.8, handling: .94, drift: .96, miniTurbo: 1, boost: 1.12, weight: 1 } },
  { name: "헤비", color: 0x75dd6b, length: 3.65, width: 2.45, height: .9, nose: "block", wheel: .5, spoiler: "wing", tuning: { maxSpeed: 2, grip: 2, accel: -1, handling: .9, drift: .92, miniTurbo: .95, offroad: 1.18, weight: 1.22 } },
  { name: "로드스터", color: 0xbd78ff, length: 3.35, width: 2.1, height: .7, nose: "round", wheel: .46, spoiler: "fin", tuning: { maxSpeed: 3, accel: 1, handling: 1.02, drift: 1.18, miniTurbo: 1.14, boost: 1.08, weight: .98 } }
];

export const FORMULA_LIVERIES = [
  { team: "Aster Works", primary: 0xe9eef2, secondary: 0xf6c647, accent: 0x111820, number: 27 },
  { team: "Vela Storm", primary: 0x1d3557, secondary: 0x4cc9f0, accent: 0xf1faee, number: 11 },
  { team: "Crimson Apex", primary: 0xb21f2d, secondary: 0xffb703, accent: 0x111111, number: 5 },
  { team: "Neon Harbor", primary: 0x00b4d8, secondary: 0x90f1ef, accent: 0x03045e, number: 44 },
  { team: "Aurora Vector", primary: 0x6930c3, secondary: 0x80ffdb, accent: 0xf8f9fa, number: 88 }
];

export const FORMULA_AERO_PRESETS = [
  { nose: "needle", frontWing: 3.15, rearWing: 2.35, sidepod: .54, wheelBase: 1 },
  { nose: "wide", frontWing: 3.35, rearWing: 2.58, sidepod: .68, wheelBase: 1.04 },
  { nose: "low", frontWing: 2.9, rearWing: 2.25, sidepod: .48, wheelBase: .98 }
];

export class Racer {
  constructor(THREE, name, slot, track, isPlayer = false, tuning = {}, visual = {}) {
    this.THREE = THREE;
    this.name = name;
    this.slot = slot;
    this.isPlayer = isPlayer;
    this.driver = visual.driver || DRIVER_PRESETS[slot % DRIVER_PRESETS.length];
    this.kart = visual.kart || KART_PRESETS[slot % KART_PRESETS.length];
    this.physics = new VehiclePhysics(tuning);
    this.physics.respawn(track.startGrid(slot));
    this.mesh = createRacerMesh(THREE, this.driver, this.kart, visual.tire, visual.glider, slot, Boolean(visual.formulaFallback), visual.livery, visual.aero);
    this.mesh.position.set(this.physics.position.x, this.physics.position.y, this.physics.position.z);
    this.nextCheckpoint = 1;
    this.checkpointPassed = 0;
    this.lastNearestIndex = 0;
    this.trackProgress = 0;
    this.lapProgress = 0;
    this.completedLaps = 0;
    this.lapDistance = 0;
    this.raceDistance = 0;
    this.wrongWayFrames = 0;
    this.lap = 1;
    this.finished = false;
    this.finishTime = 0;
    this.item = null;
    this.itemCharges = 0;
    this.itemTimer = 0;
    this.rouletteItems = [];
    this.trailingItem = null;
    this.roulette = 0;
    this.cooldown = 0;
    this.shield = 0;
    this.recentHit = 0;
    this.eliminated = false;
    this.progress = 0;
    this.lastTerrain = null;
    this.lastImpact = null;
    this.effects = { smoke: 0, spark: 0, cameraShake: 0 };
  }

  update(track, input, dt, elapsed) {
    if (this.finished || this.eliminated) return null;
    const beforeBoost = this.physics.boostTime;
    const info = this.physics.update(input, track, dt);
    this.lastTerrain = info.terrain;
    this.lastImpact = info.impact;
    if (info.impact) this.effects.cameraShake = Math.max(this.effects.cameraShake, .24 + info.impact.strength * .45);
    else if (info.wallHit) this.effects.cameraShake = .28;
    if (!this.physics.onGround) this.effects.cameraShake = Math.max(this.effects.cameraShake, .05);
    if (beforeBoost <= 0 && this.physics.boostTime > 0) this.effects.spark = .5;
    this.syncMesh();
    this.advanceProgress(track, elapsed, dt);
    if (this.roulette > 0) {
      this.roulette = Math.max(0, this.roulette - dt);
      if (this.roulette === 0 && this.item && this.itemCharges <= 0) this.itemCharges = 1;
    }
    if (this.cooldown > 0) this.cooldown -= dt;
    if (this.itemTimer > 0) {
      this.itemTimer = Math.max(0, this.itemTimer - dt);
      if (this.itemTimer === 0 && this.item === "goldMushroom") {
        this.item = null;
        this.itemCharges = 0;
      }
    }
    this.shield = Math.max(0, this.shield - dt);
    this.recentHit = Math.max(0, this.recentHit - dt);
    if (this.physics.shrinkTime > 0) this.effects.cameraShake = Math.max(this.effects.cameraShake, .02);
    return info;
  }

  syncMesh() {
    const p = this.physics.position;
    this.mesh.position.set(p.x, p.y, p.z);
    this.mesh.rotation.set(this.physics.pitch, this.physics.yaw, this.physics.roll);
    const targetScale = this.physics.shrinkTime > 0 ? .68 : 1;
    const squash = this.physics.recovery > 0 ? 1 - Math.min(.08, this.physics.recovery * .16) : 1;
    this.mesh.scale.set(targetScale * (1 + (1 - squash) * .5), targetScale * squash, targetScale * (1 + (1 - squash) * .35));
    this.mesh.rotation.z += this.physics.drift.active ? -this.physics.drift.dir * .08 : 0;
    const flame = this.mesh.userData.flame;
    flame.visible = this.physics.boostTime > 0;
    if (flame.visible) {
      const c = this.physics.drift.charge === 3 ? 0xbd74ff : this.physics.drift.charge === 2 ? 0xff9f2f : 0x36c8ff;
      flame.material.emissive.setHex(c);
      flame.scale.setScalar(1 + Math.random() * .35);
    }
    const sparks = this.mesh.userData.sparks;
    sparks.visible = this.physics.drift.active;
    if (sparks.visible) {
      const sparkColor = this.physics.drift.charge === 3 ? 0xbd74ff : this.physics.drift.charge === 2 ? 0xff9f2f : 0x36c8ff;
      for (const child of sparks.children) {
        if (child.material?.color) child.material.color.setHex(sparkColor);
      }
      sparks.rotation.y += .18;
    }
    const shield = this.mesh.userData.shield;
    if (shield) {
      shield.visible = this.shield > 0;
      shield.rotation.y += .035;
      shield.material.opacity = .18 + Math.sin(performance.now() * .009) * .06;
    }
  }

  advanceProgress(track, elapsed, dt) {
    const total = track.checkpoints.length;
    const totalLength = track.totalLength || 1;
    const sample = track.progressDistanceAt(this.physics.position.x, this.physics.position.z, this.lapDistance);
    this.lastNearestIndex = sample.index;
    const checkpointResult = this.passCheckpointIfValid(track, elapsed, sample);

    let candidate = checkpointResult === "lap" ? sample.rawDistance : sample.distance;
    if (candidate >= totalLength) candidate = totalLength - .001;
    if (candidate < 0) candidate = 0;

    const next = track.checkpoints[this.nextCheckpoint % total] || track.checkpoints[0];
    const nextDistance = this.nextCheckpoint === 0 ? totalLength : next.distance ?? totalLength;
    const checkpointGate = Math.min(totalLength - .001, nextDistance + (next.radius || 20) * .55);
    candidate = Math.min(candidate, checkpointGate);

    const delta = candidate - this.lapDistance;
    if (delta >= -4) {
      this.lapDistance = Math.max(this.lapDistance, candidate);
      this.wrongWayFrames = 0;
    } else {
      this.wrongWayFrames++;
      if (this.wrongWayFrames > 30) {
        this.lapDistance = Math.max(0, this.lapDistance - Math.min(10 * dt, Math.abs(delta) * .08));
      }
    }

    this.lapProgress = this.lapDistance / totalLength * total;
    this.trackProgress = this.completedLaps * totalLength + this.lapDistance;
    this.raceDistance = this.trackProgress;
    this.progress = elapsed < 2 && this.completedLaps === 0 && this.checkpointPassed === 0
      ? -this.slot * .001
      : this.raceDistance;
  }

  passCheckpointIfValid(track, elapsed, sample) {
    const total = track.checkpoints.length;
    if (!total) return "none";
    const cpIndex = this.nextCheckpoint % total;
    const cp = track.checkpoints[cpIndex];
    if (!cp || dist2(this.physics.position, cp) >= cp.radius * cp.radius) return "none";

    if (cpIndex === 0) {
      if (this.checkpointPassed !== total - 1) return "none";
      this.completedLaps++;
      this.lap = this.completedLaps + 1;
      this.checkpointPassed = 0;
      this.nextCheckpoint = total > 1 ? 1 : 0;
      this.lapDistance = clamp(sample.rawDistance, 0, Math.min(20, track.totalLength * .08));
      if (this.completedLaps >= track.laps && track.mode !== "survival") {
        this.finished = true;
        this.finishTime = elapsed;
        this.progress = Number.POSITIVE_INFINITY;
      }
      return "lap";
    }

    if (cpIndex === this.checkpointPassed + 1) {
      this.checkpointPassed = cpIndex;
      this.nextCheckpoint = (cpIndex + 1) % total;
      this.lapDistance = Math.max(this.lapDistance, cp.distance || this.lapDistance);
      return "checkpoint";
    }
    return "none";
  }

  giveItem(item, def = null, candidates = []) {
    this.item = item;
    this.itemCharges = def?.charges || 1;
    this.itemTimer = 0;
    this.rouletteItems = candidates;
    this.roulette = 3;
  }

  hit(type) {
    if (this.physics.invincible > 0) return false;
    if (this.shield > 0 && type !== "ink") {
      this.shield = Math.max(0, this.shield - 1.2);
      this.lastImpact = { type: "shield", strength: .45 };
      this.effects.spark = .55;
      return false;
    }
    const effects = {
      spin: () => { this.physics.stun = 1.25; this.physics.velocity.x *= -.25; this.physics.velocity.z *= -.25; },
      blast: () => { this.physics.stun = 1.7; this.physics.velocity.y = 12; },
      slow: () => { this.physics.stun = .9; this.physics.velocity.x *= .35; this.physics.velocity.z *= .35; },
      ink: () => { this.ink = 5; },
      shrink: () => { this.physics.shrinkTime = Math.max(this.physics.shrinkTime, 6); this.physics.stun = Math.max(this.physics.stun, .35); },
      stun: () => { this.physics.stun = Math.max(this.physics.stun, .85); }
    };
    (effects[type] || effects.spin)();
    this.recentHit = 5;
    this.physics.invincible = Math.max(this.physics.invincible, .9);
    this.lastImpact = { type, strength: type === "blast" ? 1 : .75 };
    return true;
  }
}

export function createRacers(THREE, scene, track, count, difficulty, garage = {}) {
  const difficultyTune = { Easy: -5, Normal: 0, Hard: 4, Expert: 8 }[difficulty] ?? 0;
  const tireTune = garage?.tire === "오프로드" ? { grip: 12, offroad: 1.22, maxSpeed: 41.4 } : garage?.tire === "스피드" ? { maxSpeed: 45, grip: 8.8, boost: 1.08 } : { grip: 10.6, handling: 1.04 };
  const racers = [];
  for (let i = 0; i < count; i++) {
    const driver = i === 0 ? driverByName(garage.character) : DRIVER_PRESETS[(i + 3) % DRIVER_PRESETS.length];
    const kart = i === 0 ? kartByName(garage.kart) : KART_PRESETS[(i + 1) % KART_PRESETS.length];
    const kartTune = kart.tuning || {};
    const driverTune = driverTuneFor(driver);
    const playerTune = i === 0
      ? mergeTune({ ...tireTune, maxSpeed: (tireTune.maxSpeed || 42) + (kartTune.maxSpeed || 0), accel: 38 + (kartTune.accel || 0), grip: (tireTune.grip || 10) + (kartTune.grip || 0) }, kartTune, driverTune)
      : mergeTune({ maxSpeed: 38 + difficultyTune + (kartTune.maxSpeed || 0) + Math.random() * 3, accel: 34 + difficultyTune * .7 + (kartTune.accel || 0), grip: 9.2 + (kartTune.grip || 0) }, kartTune, driverTune);
    const visual = { driver, kart, tire: i === 0 ? garage.tire : cpuTire(i), glider: i === 0 ? garage.glider : cpuGlider(i), formulaFallback: Boolean(garage?.formulaFallback), livery: FORMULA_LIVERIES[i % FORMULA_LIVERIES.length], aero: FORMULA_AERO_PRESETS[i % FORMULA_AERO_PRESETS.length] };
    const racer = new Racer(THREE, i === 0 ? driver.name : driver.name, i, track, i === 0, playerTune, visual);
    racers.push(racer);
    scene.add(racer.mesh);
  }
  return racers;
}

export function rankRacers(racers) {
  return [...racers].sort((a, b) => {
    if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
    if (a.finished !== b.finished) return a.finished ? -1 : 1;
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    const delta = (b.progress ?? b.raceDistance) - (a.progress ?? a.raceDistance);
    return Math.abs(delta) > .001 ? delta : a.slot - b.slot;
  });
}

function driverByName(name) {
  return DRIVER_PRESETS.find(d => d.name === name) || DRIVER_PRESETS[0];
}

function kartByName(name) {
  return KART_PRESETS.find(k => k.name === name) || KART_PRESETS[0];
}

function mergeTune(base, ...parts) {
  const tune = { ...base };
  for (const part of parts) {
    for (const [key, value] of Object.entries(part || {})) {
      if (["handling", "drift", "miniTurbo", "offroad", "boost", "weight"].includes(key)) tune[key] = (tune[key] || 1) * value;
    }
  }
  return tune;
}

function driverTuneFor(driver) {
  const map = {
    small: { handling: 1.08, miniTurbo: 1.08, weight: .86 },
    light: { handling: 1.06, drift: 1.05, weight: .9 },
    balanced: { handling: 1.02, drift: 1.02, weight: 1 },
    broad: { offroad: 1.08, weight: 1.08 },
    heavy: { offroad: 1.12, weight: 1.16, handling: .95 },
    tall: { boost: 1.04, handling: .98, weight: 1.05 },
    royal: { miniTurbo: 1.1, drift: 1.06, weight: .96 },
    mascot: { offroad: 1.16, handling: 1.03, weight: 1.02 }
  };
  return map[driver?.build] || map.balanced;
}

function cpuTire(i) {
  return ["그립", "스피드", "오프로드"][i % 3];
}

function cpuGlider(i) {
  return ["윙", "코멧", "스텔라"][i % 3];
}

function material(THREE, color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? .45, metalness: opts.metalness ?? .12, emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0 });
}

function createRacerMesh(THREE, driver, kart, tireName = "그립", gliderName = "윙", slot = 0, formulaFallback = false, livery = FORMULA_LIVERIES[slot % FORMULA_LIVERIES.length], aero = FORMULA_AERO_PRESETS[slot % FORMULA_AERO_PRESETS.length]) {
  if (formulaFallback) return createFormulaFallbackMesh(THREE, driver, kart, tireName, slot, livery, aero);
  const group = new THREE.Group();
  const accent = slot === 0 ? kart.color : tintKart(kart.color, slot);
  const bodyMat = material(THREE, accent, { roughness: .36, metalness: .2 });
  const dark = material(THREE, 0x111820, { roughness: .68, metalness: .08 });
  const chrome = material(THREE, 0xdbe8f0, { roughness: .22, metalness: .58 });
  const outfit = material(THREE, driver.outfitColor, { roughness: .5 });
  const skin = material(THREE, driver.skinColor, { roughness: .58 });
  const hair = material(THREE, driver.hairColor, { roughness: .62 });

  const w = kart.width * (driver.build === "heavy" ? 1.08 : 1);
  const l = kart.length;
  const h = kart.height;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), bodyMat);
  body.position.y = .62;
  body.castShadow = true;
  group.add(body);

  const noseDepth = kart.nose === "needle" ? 1.85 : kart.nose === "block" ? 1.25 : 1.45;
  const noseWidth = kart.nose === "needle" ? w * .5 : w * .72;
  const nose = new THREE.Mesh(kart.nose === "wedge" ? new THREE.ConeGeometry(noseWidth * .5, noseDepth, 4) : new THREE.BoxGeometry(noseWidth, h * .7, noseDepth), bodyMat);
  nose.position.set(0, .78, l * .38);
  nose.rotation.y = kart.nose === "wedge" ? Math.PI / 4 : 0;
  nose.rotation.x = kart.nose === "wedge" ? Math.PI / 2 : 0;
  nose.castShadow = true;
  group.add(nose);

  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(w * .54, .64, l * .28), dark);
  cockpit.position.set(0, 1.08, -l * .1);
  group.add(cockpit);

  addDriver(THREE, group, driver, { skin, hair, outfit, dark }, l);
  addWheels(THREE, group, tireName, kart, dark, chrome);
  addSpoilerAndGlider(THREE, group, kart, gliderName, bodyMat, chrome);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(w * 1.08, .22, .2), chrome);
  bumper.position.set(0, .62, l * .55);
  group.add(bumper);
  const rearLight = new THREE.Mesh(new THREE.BoxGeometry(w * .46, .13, .08), material(THREE, 0xff4b4b, { emissive: 0xff2a2a, emissiveIntensity: .5 }));
  rearLight.position.set(0, .8, -l * .56);
  group.add(rearLight);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(.34, 1.4, 18), material(THREE, 0xffc247, { emissive: 0xff7a00, emissiveIntensity: .9 }));
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, .52, -l * .72);
  flame.visible = false;
  group.add(flame);

  const sparks = new THREE.Group();
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0x36c8ff });
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .6), sparkMat.clone());
    s.position.set((Math.random() - .5) * w * 1.3, .2, -1 + Math.random() * 1.8);
    s.rotation.y = Math.random() * Math.PI;
    sparks.add(s);
  }
  sparks.visible = false;
  group.add(sparks);
  const shield = new THREE.Mesh(
    new THREE.SphereGeometry(2.05, 24, 14),
    new THREE.MeshBasicMaterial({ color: 0x8df0ff, transparent: true, opacity: .2, depthWrite: false })
  );
  shield.visible = false;
  group.add(shield);
  group.userData = { flame, sparks, shield };
  return group;
}

function addDriver(THREE, group, driver, mats, kartLength) {
  const scale = driver.bodyScale;
  const y = 1.15;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.72 * scale, .82 * driver.height, .42 * scale), mats.outfit);
  torso.position.set(0, y + .45 * driver.height, -kartLength * .12);
  torso.castShadow = true;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.34 * scale, 16, 12), mats.skin);
  head.position.set(0, y + 1.08 * driver.height, -kartLength * .12);
  head.castShadow = true;
  group.add(head);
  if (driver.helmet) {
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(.39 * scale, 16, 10, 0, Math.PI * 2, 0, Math.PI * .62), mats.outfit);
    helmet.position.copy(head.position);
    helmet.position.y += .08;
    group.add(helmet);
  } else {
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.38 * scale, 14, 8, 0, Math.PI * 2, 0, Math.PI * .55), mats.hair);
    hair.position.copy(head.position);
    hair.position.y += .1;
    group.add(hair);
  }
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.16 * scale, .58 * driver.height, .16 * scale), mats.outfit);
    arm.position.set(side * .48 * scale, y + .54 * driver.height, -kartLength * .03);
    arm.rotation.z = side * .26;
    group.add(arm);
    const glove = new THREE.Mesh(new THREE.SphereGeometry(.13 * scale, 8, 6), mats.dark);
    glove.position.set(side * .58 * scale, y + .22 * driver.height, kartLength * .18);
    group.add(glove);
  }
  addAccessory(THREE, group, driver, mats, head.position, scale);
}

function addAccessory(THREE, group, driver, mats, headPos, scale) {
  if (driver.accessory === "scarf") {
    const scarf = new THREE.Mesh(new THREE.BoxGeometry(.74 * scale, .12 * scale, .16 * scale), mats.outfit);
    scarf.position.set(0, headPos.y - .42 * scale, headPos.z + .06);
    group.add(scarf);
  } else if (driver.accessory === "visor") {
    const visor = new THREE.Mesh(new THREE.BoxGeometry(.5 * scale, .09 * scale, .08 * scale), material(THREE, 0x9fefff, { emissive: 0x46cfff, emissiveIntensity: .5 }));
    visor.position.set(0, headPos.y + .02, headPos.z + .32 * scale);
    group.add(visor);
  } else if (driver.accessory === "antenna") {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .58 * scale, 6), mats.dark);
    mast.position.set(0, headPos.y + .45 * scale, headPos.z);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.09 * scale, 8, 6), material(THREE, 0xfff15f, { emissive: 0xffd34d, emissiveIntensity: .8 }));
    orb.position.set(0, headPos.y + .78 * scale, headPos.z);
    group.add(mast, orb);
  } else if (driver.accessory === "cape") {
    const cape = new THREE.Mesh(new THREE.BoxGeometry(.85 * scale, .9 * scale, .08), material(THREE, 0x28334d, { roughness: .8 }));
    cape.position.set(0, headPos.y - .65 * scale, headPos.z - .42 * scale);
    cape.rotation.x = -.2;
    group.add(cape);
  } else if (driver.accessory === "pads") {
    for (const side of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(.22 * scale, .18 * scale, .32 * scale), mats.dark);
      pad.position.set(side * .48 * scale, headPos.y - .55 * scale, headPos.z + .06);
      group.add(pad);
    }
  } else if (driver.accessory === "shell") {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(.72 * scale, 14, 10, 0, Math.PI * 2, 0, Math.PI * .72), material(THREE, 0x2f6b3b, { roughness: .72 }));
    shell.position.set(0, headPos.y - .78 * scale, headPos.z - .5 * scale);
    shell.rotation.x = -.45;
    group.add(shell);
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(.13 * scale, .48 * scale, 8), material(THREE, 0xf3e2b8, { roughness: .5 }));
      horn.position.set(side * .3 * scale, headPos.y + .32 * scale, headPos.z + .12 * scale);
      horn.rotation.z = -side * .65;
      group.add(horn);
    }
  } else if (driver.accessory === "crown") {
    const crownMat = material(THREE, 0xffd34d, { emissive: 0x6d4300, emissiveIntensity: .35, metalness: .28 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.34 * scale, .34 * scale, .16 * scale, 8), crownMat);
    band.position.set(0, headPos.y + .44 * scale, headPos.z);
    group.add(band);
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(.08 * scale, .28 * scale, 5), crownMat);
      const a = i / 5 * Math.PI * 2;
      spike.position.set(Math.cos(a) * .27 * scale, headPos.y + .64 * scale, headPos.z + Math.sin(a) * .27 * scale);
      group.add(spike);
    }
  } else if (driver.accessory === "dressPanel") {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(.96 * scale, .78 * scale, .08), mats.outfit);
    panel.position.set(0, headPos.y - .92 * scale, headPos.z - .34 * scale);
    panel.rotation.x = -.12;
    group.add(panel);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.12 * scale), material(THREE, 0x9fefff, { emissive: 0x46cfff, emissiveIntensity: .6 }));
    gem.position.set(0, headPos.y - .45 * scale, headPos.z + .25 * scale);
    group.add(gem);
  } else if (driver.accessory === "snoutTail") {
    const snout = new THREE.Mesh(new THREE.BoxGeometry(.36 * scale, .2 * scale, .42 * scale), mats.skin);
    snout.position.set(0, headPos.y - .03 * scale, headPos.z + .38 * scale);
    group.add(snout);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.18 * scale, .92 * scale, 10), mats.skin);
    tail.position.set(0, headPos.y - 1.25 * scale, headPos.z - .72 * scale);
    tail.rotation.x = -1.15;
    group.add(tail);
  }
}

function addWheels(THREE, group, tireName, kart, dark, chrome) {
  const tireScale = tireName === "오프로드" ? 1.18 : tireName === "스피드" ? .92 : 1;
  const radius = kart.wheel * tireScale;
  const wheelMat = tireName === "스피드" ? material(THREE, 0x151820, { roughness: .42, metalness: .2 }) : dark;
  for (const x of [-kart.width * .58, kart.width * .58]) for (const z of [-kart.length * .34, kart.length * .34]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .36, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, .4, z);
    wheel.castShadow = true;
    group.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * .45, radius * .45, .39, 12), chrome);
    hub.rotation.z = Math.PI / 2;
    hub.position.copy(wheel.position);
    group.add(hub);
  }
}

function addSpoilerAndGlider(THREE, group, kart, gliderName, bodyMat, chrome) {
  if (kart.spoiler !== "none") {
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(kart.width * .88, .12, .42), bodyMat);
    spoiler.position.set(0, 1.26, -kart.length * .54);
    group.add(spoiler);
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.1, .45, .1), chrome);
      post.position.set(side * kart.width * .34, 1.03, -kart.length * .52);
      group.add(post);
    }
  }
  const gliderColor = gliderName === "코멧" ? 0x84e8ff : gliderName === "스텔라" ? 0xbd78ff : 0xfff1a8;
  const glider = new THREE.Mesh(new THREE.BoxGeometry(kart.width * .9, .06, .72), material(THREE, gliderColor, { emissive: gliderColor, emissiveIntensity: .18 }));
  glider.position.set(0, 1.62, -kart.length * .42);
  glider.rotation.x = -.16;
  group.add(glider);
}

function createFormulaFallbackMesh(THREE, driver, kart, tireName = "그립", slot = 0, livery = FORMULA_LIVERIES[slot % FORMULA_LIVERIES.length], aero = FORMULA_AERO_PRESETS[slot % FORMULA_AERO_PRESETS.length]) {
  const group = new THREE.Group();
  const accent = livery.primary;
  const teamStripe = livery.secondary;
  const bodyMat = material(THREE, accent, { roughness: .32, metalness: .22 });
  const stripeMat = material(THREE, teamStripe, { roughness: .28, metalness: .18, emissive: slot === 0 ? 0x3d2b00 : 0x001d2a, emissiveIntensity: .12 });
  const dark = material(THREE, livery.accent || 0x080b0f, { roughness: .78, metalness: .08 });
  const carbon = material(THREE, 0x101820, { roughness: .55, metalness: .28 });
  const chrome = material(THREE, 0xdbe8f0, { roughness: .24, metalness: .62 });
  const outfit = material(THREE, driver.outfitColor, { roughness: .48 });
  const skin = material(THREE, driver.skinColor, { roughness: .58 });
  const hair = material(THREE, driver.hairColor, { roughness: .62 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15 * (aero.sidepod > .6 ? 1.06 : 1), .55, 4.2 * aero.wheelBase), bodyMat);
  body.position.y = .58;
  body.castShadow = true;
  group.add(body);

  const noseRadius = aero.nose === "wide" ? .44 : aero.nose === "low" ? .28 : .34;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(noseRadius, aero.nose === "wide" ? 2.45 : 2.7, 4), bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.rotation.y = Math.PI / 4;
  nose.position.set(0, .58, 2.75);
  nose.scale.x = .72;
  nose.castShadow = true;
  group.add(nose);

  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(.82, .42, .86), dark);
  cockpit.position.set(0, 1.02, -.28);
  cockpit.castShadow = true;
  group.add(cockpit);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.18, .06, 3.9), stripeMat);
  stripe.position.set(0, .9, .55);
  group.add(stripe);

  const sidepodGeo = new THREE.BoxGeometry(aero.sidepod, .42, 1.36);
  for (const side of [-1, 1]) {
    const pod = new THREE.Mesh(sidepodGeo, bodyMat);
    pod.position.set(side * .86, .55, -.35);
    pod.castShadow = true;
    group.add(pod);
    const intake = new THREE.Mesh(new THREE.BoxGeometry(.08, .2, .64), dark);
    intake.position.set(side * .58, .72, .1);
    group.add(intake);
  }

  const frontWing = new THREE.Mesh(new THREE.BoxGeometry(aero.frontWing, .12, .52), carbon);
  frontWing.position.set(0, .35, 3.25);
  frontWing.castShadow = true;
  group.add(frontWing);
  const frontFlap = new THREE.Mesh(new THREE.BoxGeometry(aero.frontWing * .85, .08, .25), stripeMat);
  frontFlap.position.set(0, .48, 3.48);
  group.add(frontFlap);

  const rearPost = new THREE.Mesh(new THREE.BoxGeometry(.18, .9, .16), carbon);
  rearPost.position.set(0, 1.05, -2.08);
  group.add(rearPost);
  const rearWing = new THREE.Mesh(new THREE.BoxGeometry(aero.rearWing, .16, .48), carbon);
  rearWing.position.set(0, 1.62, -2.22);
  rearWing.castShadow = true;
  group.add(rearWing);
  const drsStripe = new THREE.Mesh(new THREE.BoxGeometry(aero.rearWing * .84, .07, .16), stripeMat);
  drsStripe.position.set(0, 1.75, -2.34);
  group.add(drsStripe);
  const numberPlate = new THREE.Mesh(new THREE.BoxGeometry(.54, .05, .38), stripeMat);
  numberPlate.position.set(0, .94, 1.24);
  group.add(numberPlate);
  const numberBar = new THREE.Mesh(new THREE.BoxGeometry(.06 * String(livery.number).length, .065, .3), dark);
  numberBar.position.set(0, 1.0, 1.24);
  group.add(numberBar);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(.48, .035, 8, 22, Math.PI * 1.2), chrome);
  halo.position.set(0, 1.34, -.2);
  halo.rotation.set(Math.PI / 2, 0, Math.PI * .9);
  group.add(halo);
  const haloPost = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, .62, 8), chrome);
  haloPost.position.set(0, 1.15, .28);
  group.add(haloPost);

  addFormulaDriver(THREE, group, driver, { skin, hair, outfit, dark }, -.28);
  addFormulaWheels(THREE, group, tireName, dark, chrome);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(.28, 1.25, 18), material(THREE, 0xffc247, { emissive: 0xff7a00, emissiveIntensity: .9 }));
  flame.rotation.x = -Math.PI / 2;
  flame.position.set(0, .43, -2.55);
  flame.visible = false;
  group.add(flame);

  const sparks = new THREE.Group();
  const sparkMat = new THREE.MeshBasicMaterial({ color: 0x36c8ff });
  for (let i = 0; i < 10; i++) {
    const spark = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .58), sparkMat.clone());
    spark.position.set((Math.random() - .5) * 2.5, .18, -1.2 + Math.random() * 1.8);
    spark.rotation.y = Math.random() * Math.PI;
    sparks.add(spark);
  }
  sparks.visible = false;
  group.add(sparks);
  group.userData = { flame, sparks, formulaFallback: true, team: livery.team, number: livery.number };
  return group;
}

function addFormulaDriver(THREE, group, driver, mats, z) {
  const scale = driver.bodyScale * .86;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(.5 * scale, .48 * driver.height, .36 * scale), mats.outfit);
  torso.position.set(0, 1.18, z);
  group.add(torso);
  const helmetMat = driver.helmet ? mats.outfit : mats.hair;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.29 * scale, 16, 12), helmetMat);
  head.position.set(0, 1.58, z + .05);
  head.castShadow = true;
  group.add(head);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.42 * scale, .08 * scale, .08 * scale), material(THREE, 0x9fefff, { emissive: 0x46cfff, emissiveIntensity: .5 }));
  visor.position.set(0, 1.58, z + .31);
  group.add(visor);
}

function addFormulaWheels(THREE, group, tireName, dark, chrome) {
  const tireScale = tireName === "스피드" ? .96 : tireName === "오프로드" ? 1.04 : 1;
  const radius = .48 * tireScale;
  const rearRadius = .54 * tireScale;
  for (const side of [-1, 1]) {
    for (const spec of [{ z: 1.85, r: radius, w: .42 }, { z: -1.62, r: rearRadius, w: .5 }]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(spec.r, spec.r, spec.w, 24), dark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 1.34, .45, spec.z);
      wheel.castShadow = true;
      group.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(spec.r * .42, spec.r * .42, spec.w + .04, 16), chrome);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(wheel.position);
      group.add(hub);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(.9, .07, .08), chrome);
      arm.position.set(side * .68, .6, spec.z);
      arm.rotation.z = side * .08;
      group.add(arm);
    }
  }
}

function tintKart(color, slot) {
  const r = ((color >> 16) & 255) / 255;
  const g = ((color >> 8) & 255) / 255;
  const b = (color & 255) / 255;
  const shift = .18 + (slot % 5) * .08;
  return ((clamp(Math.floor((r + shift) * 255), 0, 255) << 16)
    | (clamp(Math.floor((g + shift * .6) * 255), 0, 255) << 8)
    | clamp(Math.floor((b + shift * .35) * 255), 0, 255));
}
