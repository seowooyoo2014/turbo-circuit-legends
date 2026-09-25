import { clamp, dist2 } from "./physics.js?v=20260722f1weekend";

const ZONES = [
  { id: "desert", name: "사막", color: 0xd99d54, ground: 0xb98246, sky: 0x90d6e7 },
  { id: "meadow", name: "초원", color: 0x61a65b, ground: 0x386840, sky: 0xb8ecff },
  { id: "city", name: "도시", color: 0x596578, ground: 0x303846, sky: 0x7e95e5 },
  { id: "snow", name: "눈", color: 0xd9eff7, ground: 0xf2fbff, sky: 0xc8eaff },
  { id: "volcano", name: "화산", color: 0x4b3834, ground: 0x6d1b14, sky: 0xff946b },
  { id: "space", name: "우주", color: 0x2e336c, ground: 0x141735, sky: 0x09091a },
  { id: "rainbow", name: "프리즘", color: 0xffcc50, ground: 0x7356d8, sky: 0x8bddff },
  { id: "arena", name: "아레나", color: 0x566171, ground: 0x26313a, sky: 0xa9c7df },
  { id: "harbor", name: "하버", color: 0x405f7e, ground: 0x1e313f, sky: 0x26415f },
  { id: "highland", name: "하이랜드", color: 0x687066, ground: 0x38443a, sky: 0x92b8d8 },
  { id: "rainline", name: "레인라인", color: 0x435060, ground: 0x202830, sky: 0x637186 },
  { id: "aurora", name: "오로라", color: 0x6f6bd9, ground: 0x1b203f, sky: 0x121a34 }
];

export const TRACKS = [
  { id: "tour", name: "월드 투어", theme: "tour", zones: ZONES, color: 0xd99d54, sky: 0x9bdff2 },
  { id: "desert", name: "사막 협곡", theme: "desert", color: 0xd99d54, sky: 0x90d6e7 },
  { id: "meadow", name: "초원 숲길", theme: "meadow", color: 0x61a65b, sky: 0xb8ecff },
  { id: "volcano", name: "화산 루프", theme: "volcano", color: 0x3a3030, sky: 0xff946b },
  { id: "snow", name: "눈꽃 산맥", theme: "snow", color: 0xd9eff7, sky: 0xc8eaff },
  { id: "city", name: "네온 도시", theme: "city", color: 0x485267, sky: 0x677bd9 },
  { id: "space", name: "우주 정거장", theme: "space", color: 0x2e336c, sky: 0x09091a },
  { id: "rainbow", name: "프리즘 판타지", theme: "rainbow", color: 0xffcc50, sky: 0x8bddff },
  { id: "arena", name: "Aster Arena GP", theme: "arena", color: 0x566171, sky: 0xa9c7df, arena: true },
  { id: "harbor_gp", name: "Harbor Night GP", theme: "harbor", color: 0x405f7e, sky: 0x26415f, arena: true },
  { id: "highland_gp", name: "Highland Switchback GP", theme: "highland", color: 0x687066, sky: 0x92b8d8, arena: true },
  { id: "rainline_gp", name: "Rainline Technical GP", theme: "rainline", color: 0x435060, sky: 0x637186, arena: true },
  { id: "aurora_gp", name: "Aurora Final GP", theme: "aurora", color: 0x6f6bd9, sky: 0x121a34, arena: true }
];

const path = [
  [0, 0], [38, 40], [82, 52], [124, 16], [126, -42], [78, -86],
  [12, -74], [-42, -108], [-96, -66], [-114, 4], [-64, 54], [-14, 70]
].map(([x, z]) => ({ x, z }));

const arenaPath = [
  [-126, -48], [-48, -88], [86, -88], [148, -44], [142, 30], [92, 74],
  [26, 58], [-18, 18], [-78, 76], [-146, 42]
].map(([x, z]) => ({ x, z }));

const STORY_GP_PATHS = {
  harbor_gp: [
    [-176, -72], [-104, -118], [52, -118], [178, -70], [188, 10], [130, 66],
    [42, 72], [-18, 18], [-70, 94], [-158, 66], [-196, 4]
  ],
  highland_gp: [
    [-160, -82], [-74, -136], [58, -122], [124, -52], [78, 12], [154, 72],
    [68, 128], [-16, 74], [-74, 116], [-152, 52], [-116, -18]
  ],
  rainline_gp: [
    [-152, -70], [-42, -112], [72, -102], [148, -62], [108, -8], [172, 46],
    [88, 100], [24, 58], [-34, 112], [-116, 84], [-182, 16]
  ],
  aurora_gp: [
    [-188, -86], [-82, -146], [84, -142], [184, -80], [124, -22], [194, 48],
    [102, 126], [8, 72], [-68, 132], [-172, 82], [-128, -12]
  ]
};
for (const key of Object.keys(STORY_GP_PATHS)) {
  STORY_GP_PATHS[key] = STORY_GP_PATHS[key].map(([x, z]) => ({ x, z }));
}

function catmull(t, p0, p1, p2, p3) {
  const v0 = (p2 - p0) * .5;
  const v1 = (p3 - p1) * .5;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

function hexToRgb(hex) {
  return { r: ((hex >> 16) & 255) / 255, g: ((hex >> 8) & 255) / 255, b: (hex & 255) / 255 };
}

function themedZone(theme) {
  return ZONES.find(z => z.id === theme) || ZONES[0];
}

export class Track {
  constructor(course = TRACKS[0], laps = 3, mode = "item") {
    this.course = course;
    this.laps = laps;
    this.mode = mode;
    this.width = course.arena ? 22 : mode === "speed" ? 15 : 18;
    this.points = [];
    this.checkpoints = [];
    this.itemBoxes = [];
    this.boostPads = [];
    this.jumpPads = [];
    this.obstacles = [];
    this.sceneObjects = [];
    this.pointDistances = [];
    this.totalLength = 0;
    const controlPath = STORY_GP_PATHS[course.id] || (course.arena ? arenaPath : path);
    const samples = course.arena ? 24 : 14;
    for (let i = 0; i < controlPath.length; i++) {
      const p0 = controlPath[(i - 1 + controlPath.length) % controlPath.length];
      const p1 = controlPath[i];
      const p2 = controlPath[(i + 1) % controlPath.length];
      const p3 = controlPath[(i + 2) % controlPath.length];
      for (let s = 0; s < samples; s++) {
        const t = s / samples;
        const x = catmull(t, p0.x, p1.x, p2.x, p3.x);
        const z = catmull(t, p0.z, p1.z, p2.z, p3.z);
        this.points.push({ x, z });
      }
    }
    this.buildDistanceTable();
    this.points.forEach((p, i) => {
      const checkpointStep = course.arena ? 18 : 20;
      if (i % checkpointStep === 0) this.checkpoints.push({ ...p, radius: course.arena ? 30 : 25, trackIndex: i, distance: this.distanceAtIndex(i) });
      if (!course.arena && i % 25 === 10) this.itemBoxes.push({ ...p, y: this.heightAt(p.x, p.z) + 1.2, active: true, timer: 0 });
      if (!course.arena && i % 34 === 4) this.boostPads.push({ ...p, radius: 9, power: 1 + (i % 3) * .25 });
      if (!course.arena && i % 45 === 18) this.jumpPads.push({ ...p, radius: 10, power: 1 });
    });
    this.sectorSplits = [this.totalLength / 3, this.totalLength * 2 / 3];
    this.drsZones = course.arena ? [
      { start: this.totalLength * .08, end: this.totalLength * .28 },
      { start: this.totalLength * .58, end: this.totalLength * .75 }
    ] : [];
    this.pitLane = course.arena ? {
      start: this.totalLength * .88,
      end: this.totalLength * .06,
      stop: this.totalLength * .96,
      radius: 10
    } : null;
    this.brakeMarkers = course.arena ? [this.totalLength * .14, this.totalLength * .34, this.totalLength * .52, this.totalLength * .78] : [];
  }

  buildDistanceTable() {
    this.pointDistances = [0];
    let distance = 0;
    for (let i = 1; i < this.points.length; i++) {
      const a = this.points[i - 1];
      const b = this.points[i];
      distance += Math.hypot(b.x - a.x, b.z - a.z);
      this.pointDistances[i] = distance;
    }
    const first = this.points[0];
    const last = this.points[this.points.length - 1];
    this.totalLength = distance + Math.hypot(first.x - last.x, first.z - last.z);
  }

  distanceAtIndex(index = 0) {
    if (!this.pointDistances.length || !this.totalLength) return 0;
    const wrapped = ((Math.floor(index) % this.points.length) + this.points.length) % this.points.length;
    return this.pointDistances[wrapped] || 0;
  }

  progressDistanceAt(x, z, lastDistance = 0) {
    const info = this.nearestInfo(x, z);
    const segmentLength = Math.hypot(info.n.x - info.p.x, info.n.z - info.p.z) || 1;
    const along = clamp((x - info.p.x) * info.tx + (z - info.p.z) * info.tz, 0, segmentLength);
    let rawDistance = this.distanceAtIndex(info.index) + along;
    if (rawDistance >= this.totalLength) rawDistance -= this.totalLength;
    let distance = rawDistance;
    if (this.totalLength > 0) {
      while (distance - lastDistance > this.totalLength * .5) distance -= this.totalLength;
      while (distance - lastDistance < -this.totalLength * .5) distance += this.totalLength;
    }
    return { ...info, rawDistance, distance, segmentLength };
  }

  zoneAt(index = 0) {
    if (this.course.theme !== "tour") return themedZone(this.course.theme);
    const zones = this.course.zones || ZONES;
    return zones[Math.floor(clamp(index / this.points.length, 0, .999) * zones.length)];
  }

  zoneAtPosition(x, z) {
    return this.zoneAt(this.nearestInfo(x, z).index);
  }

  heightAt(x, z) {
    const info = this.points.length ? this.nearestInfo(x, z) : { index: 0 };
    const zone = this.zoneAt(info.index);
    if (this.course.arena) {
      return Math.sin(x * .014) * .08 + Math.cos(z * .016) * .06;
    }
    const base = Math.sin(x * .045) * 1.6 + Math.cos(z * .035) * 1.1;
    const wave = zone.id === "space" ? Math.sin((x + z) * .03) * 2 : 0;
    const volcanic = zone.id === "volcano" ? Math.sin(x * .08 + z * .025) * 1.2 : 0;
    return base + wave + volcanic;
  }

  nearestInfo(x, z) {
    let best = 0;
    let d = Infinity;
    for (let i = 0; i < this.points.length; i++) {
      const dd = dist2({ x, z }, this.points[i]);
      if (dd < d) { d = dd; best = i; }
    }
    const p = this.points[best];
    const n = this.points[(best + 1) % this.points.length];
    const dx = n.x - p.x;
    const dz = n.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = dz / len;
    const nz = -dx / len;
    const lateral = (x - p.x) * nx + (z - p.z) * nz;
    return { index: best, p, n, lateral, distance: Math.sqrt(d), nx, nz, tx: dx / len, tz: dz / len };
  }

  sample(x, z) {
    const info = this.nearestInfo(x, z);
    const zone = this.zoneAt(info.index);
    const height = this.heightAt(x, z);
    const absLat = Math.abs(info.lateral);
    let surface = absLat > this.width ? "offroad" : "road";
    if (zone.id === "snow" && absLat < this.width) surface = "ice";
    if (this.storyWet && this.course.arena && absLat < this.width) surface = "ice";
    if (zone.id === "space" && absLat < this.width) surface = "lowgrav";
    const boost = this.boostPads.find(p => dist2(p, { x, z }) < p.radius * p.radius)?.power || 0;
    const jump = this.jumpPads.find(p => dist2(p, { x, z }) < p.radius * p.radius)?.power || 0;
    return { ...info, zone, height, slope: Math.sin(info.index * .12), surface, boost, jump };
  }

  resolveWalls(position) {
    const info = this.nearestInfo(position.x, position.z);
    const limit = this.width + 8;
    if (Math.abs(info.lateral) <= limit) return { hit: false };
    const sign = Math.sign(info.lateral);
    position.x -= info.nx * (Math.abs(info.lateral) - limit) * sign;
    position.z -= info.nz * (Math.abs(info.lateral) - limit) * sign;
    return { hit: true, nx: -info.nx * sign, nz: -info.nz * sign };
  }

  resolveObstacles(position, radius = 1.4) {
    for (const obstacle of this.obstacles) {
      const dx = position.x - obstacle.x;
      const dz = position.z - obstacle.z;
      const min = radius + obstacle.radius;
      const dSq = dx * dx + dz * dz;
      if (dSq > 0.0001 && dSq < min * min) {
        const d = Math.sqrt(dSq);
        const nx = dx / d;
        const nz = dz / d;
        const push = min - d;
        position.x += nx * push;
        position.z += nz * push;
        return { hit: true, nx, nz, strength: obstacle.stop ?? .75, bounce: obstacle.bounce ?? .15, obstacle };
      }
    }
    return { hit: false };
  }

  startLine() {
    const p = this.points[0];
    const n = this.points[1];
    const dx = n.x - p.x;
    const dz = n.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const tx = dx / len;
    const tz = dz / len;
    const nx = dz / len;
    const nz = -dx / len;
    return {
      x: p.x,
      y: this.heightAt(p.x, p.z),
      z: p.z,
      tx,
      tz,
      nx,
      nz,
      yaw: Math.atan2(tx, tz),
      width: this.width
    };
  }

  nearestSpawn(pos) {
    const info = this.nearestInfo(pos.x, pos.z);
    const p = this.points[info.index];
    return { x: p.x, y: this.heightAt(p.x, p.z), z: p.z, yaw: Math.atan2(info.tx, info.tz) };
  }

  startGrid(slot = 0) {
    const p = this.points[0];
    const n = this.points[1];
    const dx = n.x - p.x;
    const dz = n.z - p.z;
    const len = Math.hypot(dx, dz) || 1;
    const tx = dx / len;
    const tz = dz / len;
    const nx = dz / len;
    const nz = -dx / len;
    const yaw = Math.atan2(tx, tz);
    const row = Math.floor(slot / 3);
    const col = slot % 3 - 1;
    const x = p.x + nx * col * 4 - tx * row * 5;
    const z = p.z + nz * col * 4 - tz * row * 5;
    return { x, y: this.heightAt(x, z), z, yaw };
  }

  updateItems(dt) {
    for (const box of this.itemBoxes) {
      if (!box.active) {
        box.timer -= dt;
        if (box.timer <= 0) box.active = true;
      }
    }
  }
}

export function buildTrackScene(THREE, scene, track) {
  scene.background = new THREE.Color(track.course.sky);
  scene.fog = new THREE.Fog(track.course.sky, 130, 460);

  const arena = track.course.arena;
  const ground = new THREE.Mesh(createTerrainGeometry(THREE, track), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: arena ? .92 : 1, flatShading: !arena }));
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: arena ? .62 : .78,
    metalness: track.course.theme === "space" ? .18 : .02,
    side: THREE.DoubleSide
  });
  const road = new THREE.Mesh(createRoadRibbonGeometry(THREE, track), roadMat);
  road.receiveShadow = true;
  scene.add(road);

  if (arena) {
    addArenaRunoff(THREE, scene, track);
    addArenaSurfaceDetails(THREE, scene, track);
  }
  addCurbsAndRails(THREE, scene, track);
  addStartFinishGate(THREE, scene, track);
  addItemBoxes(THREE, scene, track);
  addBoostAndJumpPads(THREE, scene, track);
  addZoneDecor(THREE, scene, track);
}

function addStartFinishGate(THREE, scene, track) {
  const s = track.startLine();
  const group = new THREE.Group();
  group.rotation.y = s.yaw;
  const black = new THREE.MeshStandardMaterial({ color: 0x101216, roughness: .55 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f5ee, roughness: .5 });
  const red = new THREE.MeshStandardMaterial({ color: 0xd34848, roughness: .52 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xdbe8f0, metalness: .35, roughness: .28 });
  const sign = new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0x7a4500, emissiveIntensity: .3, roughness: .38 });

  const gateWidth = track.width * 2 + 9;
  const gateHeight = 12.5;
  const gateX = s.x + s.tx * 14;
  const gateZ = s.z + s.tz * 14;
  for (const side of [-1, 1]) {
    const px = gateX + s.nx * side * (track.width + 4.2);
    const pz = gateZ + s.nz * side * (track.width + 4.2);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.7, .85, gateHeight, 10), side < 0 ? red : metal);
    pillar.position.set(px, track.heightAt(px, pz) + gateHeight / 2, pz);
    pillar.castShadow = true;
    scene.add(pillar);
    if (!track.course.arena) track.obstacles.push({ x: px, z: pz, radius: 1.25, bounce: .25, stop: .8, kind: "gate" });
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(gateWidth, .82, .7), sign);
  beam.position.set(gateX, track.heightAt(gateX, gateZ) + gateHeight, gateZ);
  beam.rotation.y = s.yaw + Math.PI / 2;
  beam.castShadow = true;
  scene.add(beam);

  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const col = Math.floor(i / 2);
    const tile = new THREE.Mesh(new THREE.BoxGeometry(2.1, .08, 2.1), (col + i) % 2 ? black : white);
    tile.position.set(s.x + s.nx * (side * (col + .5) * 2.1), s.y + .34, s.z);
    tile.rotation.y = s.yaw + Math.PI / 2;
    tile.receiveShadow = true;
    scene.add(tile);
  }

  for (let i = -4; i <= 4; i++) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.6, .06, 1.6), (i + 4) % 2 ? black : white);
    plate.position.set(s.x + s.nx * i * 1.8, s.y + .42, s.z - s.tz * 1.8);
    plate.rotation.y = s.yaw + Math.PI / 2;
    scene.add(plate);
  }
}

function createTerrainGeometry(THREE, track) {
  const size = 560;
  const seg = 72;
  const positions = [];
  const colors = [];
  const indices = [];
  for (let iz = 0; iz <= seg; iz++) {
    const z = -size / 2 + size * iz / seg;
    for (let ix = 0; ix <= seg; ix++) {
      const x = -size / 2 + size * ix / seg;
      const info = track.nearestInfo(x, z);
      const arena = track.course.arena;
      const roadBlend = clamp((track.width + 14 - Math.abs(info.lateral)) / 18, 0, 1) * (arena ? .32 : .55);
      const y = track.heightAt(x, z) - roadBlend - (arena ? .18 : .12);
      const zone = track.zoneAt(info.index);
      const rgb = hexToRgb(zone.ground);
      const shade = arena ? .72 + Math.sin(x * .018 + z * .013) * .035 : .82 + Math.sin(x * .02 + z * .03) * .08;
      positions.push(x, y, z);
      colors.push(rgb.r * shade, rgb.g * shade, rgb.b * shade);
    }
  }
  for (let iz = 0; iz < seg; iz++) {
    for (let ix = 0; ix < seg; ix++) {
      const a = iz * (seg + 1) + ix;
      indices.push(a, a + 1, a + seg + 1, a + 1, a + seg + 2, a + seg + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createRoadRibbonGeometry(THREE, track) {
  const positions = [];
  const colors = [];
  const indices = [];
  const laneOffsets = track.course.arena
    ? [-track.width, -track.width * .5, 0, track.width * .5, track.width]
    : [-track.width, -track.width * .35, track.width * .35, track.width];
  for (let i = 0; i < track.points.length; i++) {
    const info = track.nearestInfo(track.points[i].x, track.points[i].z);
    const zone = track.zoneAt(i);
    const rgb = hexToRgb(zone.color);
    for (const offset of laneOffsets) {
      const x = info.p.x + info.nx * offset;
      const z = info.p.z + info.nz * offset;
      positions.push(x, track.heightAt(x, z) + .18, z);
      const arena = track.course.arena;
      const edgeShade = Math.abs(offset) === track.width ? (arena ? .56 : .72) : 1;
      const centerLine = arena && Math.abs(offset) < .001 ? 1.12 : 1;
      colors.push(rgb.r * edgeShade * centerLine, rgb.g * edgeShade * centerLine, rgb.b * edgeShade * centerLine);
    }
  }
  const row = laneOffsets.length;
  for (let i = 0; i < track.points.length; i++) {
    const next = (i + 1) % track.points.length;
    for (let c = 0; c < row - 1; c++) {
      const a = i * row + c;
      const b = i * row + c + 1;
      const c0 = next * row + c;
      const d = next * row + c + 1;
      indices.push(a, b, c0, b, d, c0);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function addArenaRunoff(THREE, scene, track) {
  const makeStrip = (side, inner, outer, color) => {
    const positions = [];
    const indices = [];
    for (let i = 0; i < track.points.length; i++) {
      const info = track.nearestInfo(track.points[i].x, track.points[i].z);
      for (const offset of [inner, outer]) {
        const signed = side * offset;
        const x = info.p.x + info.nx * signed;
        const z = info.p.z + info.nz * signed;
        positions.push(x, track.heightAt(x, z) + .12, z);
      }
    }
    for (let i = 0; i < track.points.length; i++) {
      const n = (i + 1) % track.points.length;
      const a = i * 2;
      const b = i * 2 + 1;
      const c = n * 2;
      const d = n * 2 + 1;
      indices.push(a, b, c, b, d, c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: .86, side: THREE.DoubleSide }));
    mesh.receiveShadow = true;
    scene.add(mesh);
  };
  makeStrip(-1, track.width + 1.6, track.width + 11, 0x38424b);
  makeStrip(1, track.width + 1.6, track.width + 11, 0x46515a);
  makeStrip(-1, track.width + 11.3, track.width + 18, 0x28313a);
  makeStrip(1, track.width + 11.3, track.width + 18, 0x303b44);
}

function addArenaSurfaceDetails(THREE, scene, track) {
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xe9edf0, roughness: .7 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: .96, transparent: true, opacity: .42 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x3ba2d9, roughness: .74 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd44848, roughness: .74 });
  for (let i = 0; i < track.points.length; i += 4) {
    const a = track.points[i];
    const b = track.points[(i + 1) % track.points.length];
    const info = track.nearestInfo(a.x, a.z);
    const yaw = Math.atan2(info.tx, info.tz);
    const len = Math.hypot(b.x - a.x, b.z - a.z) + 1.8;
    if (i % 12 === 0) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(.38, .045, len * 1.8), lineMat);
      dash.position.set(a.x, track.heightAt(a.x, a.z) + .42, a.z);
      dash.rotation.y = yaw;
      scene.add(dash);
    }
    if (i % 16 === 0) {
      for (const side of [-1, 1]) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(.32, .035, len * 2.3), rubberMat);
        mark.position.set(a.x + info.nx * side * 3.1, track.heightAt(a.x, a.z) + .43, a.z + info.nz * side * 3.1);
        mark.rotation.y = yaw + Math.sin(i) * .04;
        scene.add(mark);
      }
    }
    if (i % 10 === 0) {
      for (const side of [-1, 1]) {
        const runoffStripe = new THREE.Mesh(new THREE.BoxGeometry(1.3, .05, len * 1.8), side < 0 ? blueMat : redMat);
        runoffStripe.position.set(a.x + info.nx * side * (track.width + 5.8), track.heightAt(a.x, a.z) + .28, a.z + info.nz * side * (track.width + 5.8));
        runoffStripe.rotation.y = yaw;
        scene.add(runoffStripe);
      }
    }
  }
}

function addCurbsAndRails(THREE, scene, track) {
  const arena = track.course.arena;
  const curbMats = {
    left: new THREE.MeshStandardMaterial({ color: 0xf6f3e8, roughness: arena ? .45 : .55 }),
    right: new THREE.MeshStandardMaterial({ color: 0xd34848, roughness: arena ? .45 : .55 }),
    rail: new THREE.MeshStandardMaterial({ color: arena ? 0x111821 : 0x172028, metalness: arena ? .28 : 0, roughness: arena ? .38 : .65 })
  };
  for (let i = 0; i < track.points.length; i += arena ? 2 : 3) {
    const a = track.points[i];
    const b = track.points[(i + 1) % track.points.length];
    const info = track.nearestInfo(a.x, a.z);
    const len = Math.hypot(b.x - a.x, b.z - a.z) + 1.8;
    const yaw = Math.atan2(info.tx, info.tz);
    for (const side of [-1, 1]) {
      const x = a.x + info.nx * side * (track.width + .7);
      const z = a.z + info.nz * side * (track.width + .7);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(arena ? 1.5 : 1.1, arena ? .24 : .3, len), side < 0 ? curbMats.left : curbMats.right);
      curb.position.set(x, track.heightAt(x, z) + .35, z);
      curb.rotation.y = yaw;
      curb.castShadow = true;
      curb.receiveShadow = true;
      scene.add(curb);
      if (i % (arena ? 4 : 12) === 0) {
        const rx = a.x + info.nx * side * (track.width + 5);
        const rz = a.z + info.nz * side * (track.width + 5);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(arena ? .62 : .5, arena ? 1.35 : 1.15, len * (arena ? 2.5 : 2.2)), curbMats.rail);
        rail.position.set(rx, track.heightAt(rx, rz) + .85, rz);
        rail.rotation.y = yaw;
        rail.castShadow = true;
        scene.add(rail);
      }
    }
  }
}

function addItemBoxes(THREE, scene, track) {
  const boxGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x6fe7ff, emissive: 0x124b66, metalness: .2, roughness: .25, transparent: true, opacity: .9 });
  for (const box of track.itemBoxes) {
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.position.set(box.x, box.y, box.z);
    mesh.castShadow = true;
    box.mesh = mesh;
    scene.add(mesh);
  }
}

function addBoostAndJumpPads(THREE, scene, track) {
  const boostMat = new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0xf08300, emissiveIntensity: .5, roughness: .35 });
  for (const pad of track.boostPads) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(8, .18, 5), boostMat);
    const info = track.sample(pad.x, pad.z);
    mesh.position.set(pad.x, track.heightAt(pad.x, pad.z) + .34, pad.z);
    mesh.rotation.y = Math.atan2(info.tx, info.tz);
    scene.add(mesh);
  }

  const jumpMat = new THREE.MeshStandardMaterial({ color: 0x6eff83, emissive: 0x115c28, emissiveIntensity: .45 });
  for (const pad of track.jumpPads) {
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(9, .6, 8), jumpMat);
    const info = track.sample(pad.x, pad.z);
    ramp.position.set(pad.x, track.heightAt(pad.x, pad.z) + .55, pad.z);
    ramp.rotation.set(-.22, Math.atan2(info.tx, info.tz), 0);
    scene.add(ramp);
  }
}

function addZoneDecor(THREE, scene, track) {
  if (track.course.arena) {
    addArenaDecor(THREE, scene, track);
    return;
  }
  for (let i = 0; i < 92; i++) {
    const p = track.points[(i * 5) % track.points.length];
    const info = track.sample(p.x, p.z);
    const side = i % 2 ? 1 : -1;
    const distance = track.width + 20 + (i % 7) * 3;
    const x = p.x + info.nx * side * distance;
    const z = p.z + info.nz * side * distance;
    const y = track.heightAt(x, z);
    const zone = track.zoneAt(info.index);
    const mesh = makeZoneDecor(THREE, zone, i);
    mesh.position.set(x, y, z);
    mesh.rotation.y = Math.atan2(info.tx, info.tz) + (side > 0 ? .35 : -.35);
    mesh.castShadow = true;
    scene.add(mesh);
    if (["desert", "city", "snow", "volcano", "space"].includes(zone.id)) {
      track.obstacles.push({ x, z, radius: zone.id === "city" ? 3.8 : 2.4 + (i % 3) * .25, bounce: .2, stop: .75, kind: zone.id });
    }
  }
}

function makeZoneDecor(THREE, zone, i) {
  const group = new THREE.Group();
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: .75, metalness: zone.id === "space" || zone.id === "city" ? .18 : 0 });
  const glow = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .65, roughness: .35 });
  if (zone.id === "desert") {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 + i % 3, 0), mat(0x9a6842));
    rock.position.y = 2;
    group.add(rock);
  } else if (zone.id === "meadow") {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.45, .7, 5, 6), mat(0x755335));
    trunk.position.y = 2.5;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.4 + i % 2, 6, 7), mat(0x234f36));
    crown.position.y = 7;
    group.add(trunk, crown);
  } else if (zone.id === "city") {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4 + i % 4, 10 + i % 6, 4 + (i + 1) % 3), mat(0x3e4857));
    tower.position.y = tower.geometry.parameters.height / 2;
    const sign = new THREE.Mesh(new THREE.BoxGeometry(3, .6, .18), glow(0x84e8ff));
    sign.position.set(0, tower.geometry.parameters.height * .72, 2.1);
    group.add(tower, sign);
  } else if (zone.id === "snow") {
    const ice = new THREE.Mesh(new THREE.ConeGeometry(1.7 + i % 3, 7 + i % 4, 5), mat(0xdff8ff));
    ice.position.y = 3.5;
    group.add(ice);
  } else if (zone.id === "volcano") {
    const basalt = new THREE.Mesh(new THREE.ConeGeometry(2.3, 7, 6), mat(0x2a2424));
    basalt.position.y = 3.4;
    const lava = new THREE.Mesh(new THREE.BoxGeometry(2.6, .25, .55), glow(0xff5724));
    lava.position.y = 6.7;
    group.add(basalt, lava);
  } else if (zone.id === "space") {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(5, .18, 7), glow(0x7da8ff));
    panel.position.y = 2.5;
    panel.rotation.x = .5;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.18, .22, 5, 6), mat(0xdbe8f0));
    mast.position.y = 2.5;
    group.add(mast, panel);
  } else {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3, .28, 8, 24), glow(0xffcc50));
    arch.position.y = 4;
    arch.rotation.x = Math.PI / 2;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), glow(0xbd78ff));
    gem.position.y = 4;
    group.add(arch, gem);
  }
  return group;
}

function addArenaDecor(THREE, scene, track) {
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x20262d, roughness: .72 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb7c0c5, roughness: .62 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x111820, metalness: .12, roughness: .58 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x6aa7c9, roughness: .18, metalness: .05, clearcoat: .7, clearcoatRoughness: .22, emissive: 0x0e3448, emissiveIntensity: .2 });
  const banner = new THREE.MeshStandardMaterial({ color: 0xf6c647, emissive: 0x5c4100, emissiveIntensity: .28, roughness: .42 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xf7fbff, emissive: 0xd9f3ff, emissiveIntensity: 1.05, roughness: .18 });

  const s = track.startLine();
  const pitSide = -1;
  for (let i = 0; i < 5; i++) {
    const baseX = s.x + s.tx * (28 + i * 24) + s.nx * pitSide * (track.width + 24);
    const baseZ = s.z + s.tz * (28 + i * 24) + s.nz * pitSide * (track.width + 24);
    const building = new THREE.Mesh(new THREE.BoxGeometry(22, 10 + (i % 2) * 2, 14), concrete);
    building.position.set(baseX, track.heightAt(baseX, baseZ) + building.geometry.parameters.height / 2, baseZ);
    building.rotation.y = s.yaw;
    building.castShadow = true;
    scene.add(building);
    const windowBand = new THREE.Mesh(new THREE.BoxGeometry(18, 2.2, .25), glass);
    windowBand.position.set(baseX + s.nx * pitSide * -6.7, building.position.y + 1.6, baseZ + s.nz * pitSide * -6.7);
    windowBand.rotation.y = s.yaw;
    scene.add(windowBand);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(23, .45, 4.2), dark);
    canopy.position.set(baseX + s.nx * pitSide * -8.3, building.position.y + building.geometry.parameters.height / 2 + .55, baseZ + s.nz * pitSide * -8.3);
    canopy.rotation.y = s.yaw;
    canopy.castShadow = true;
    scene.add(canopy);
    for (let bay = -1; bay <= 1; bay++) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, .18), i % 2 ? dark : asphalt);
      door.position.set(baseX + s.tx * bay * 6 + s.nx * pitSide * -7.15, track.heightAt(baseX, baseZ) + 2, baseZ + s.tz * bay * 6 + s.nz * pitSide * -7.15);
      door.rotation.y = s.yaw;
      scene.add(door);
    }
  }

  for (let i = 0; i < track.points.length; i += 5) {
    const p = track.points[i];
    const info = track.sample(p.x, p.z);
    const yaw = Math.atan2(info.tx, info.tz);
    for (const side of [-1, 1]) {
      const x = p.x + info.nx * side * (track.width + 8);
      const z = p.z + info.nz * side * (track.width + 8);
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(.8, 1.45, 7.8), i % 20 === 0 ? banner : dark);
      barrier.position.set(x, track.heightAt(x, z) + .78, z);
      barrier.rotation.y = yaw;
      barrier.castShadow = true;
      scene.add(barrier);
    }
  }

  for (let i = 0; i < 7; i++) {
    const p = track.points[(i * 20 + 16) % track.points.length];
    const info = track.sample(p.x, p.z);
    const side = i % 2 ? 1 : -1;
    const x = p.x + info.nx * side * (track.width + 34);
    const z = p.z + info.nz * side * (track.width + 34);
    const stand = new THREE.Group();
    for (let step = 0; step < 5; step++) {
      const row = new THREE.Mesh(new THREE.BoxGeometry(32, 1.15, 7), step % 2 ? concrete : dark);
      row.position.set(0, step * 1.45 + .6, step * 3.4);
      stand.add(row);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(34, .5, 8.5), dark);
    roof.position.set(0, 8.2, 8.8);
    stand.add(roof);
    stand.position.set(x, track.heightAt(x, z), z);
    stand.rotation.y = Math.atan2(info.tx, info.tz) + (side > 0 ? Math.PI : 0);
    scene.add(stand);
  }

  for (let i = 0; i < 8; i++) {
    const p = track.points[(i * 19 + 6) % track.points.length];
    const info = track.sample(p.x, p.z);
    const side = i % 2 ? 1 : -1;
    const x = p.x + info.nx * side * (track.width + 18);
    const z = p.z + info.nz * side * (track.width + 18);
    const tower = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.24, .34, 15, 8), concrete);
    mast.position.y = 7.5;
    const lamps = new THREE.Mesh(new THREE.BoxGeometry(5.4, .7, 1), lightMat);
    lamps.position.y = 15.2;
    tower.add(mast, lamps);
    tower.position.set(x, track.heightAt(x, z), z);
    tower.rotation.y = Math.atan2(info.tx, info.tz);
    scene.add(tower);
  }

  for (let row = 0; row < 6; row++) {
    for (const side of [-1, 1]) {
      const gx = s.x - s.tx * (10 + row * 8) + s.nx * side * 4.5;
      const gz = s.z - s.tz * (10 + row * 8) + s.nz * side * 4.5;
      const grid = new THREE.Mesh(new THREE.BoxGeometry(6.2, .05, 1.1), asphalt);
      grid.position.set(gx, track.heightAt(gx, gz) + .44, gz);
      grid.rotation.y = s.yaw + Math.PI / 2;
      scene.add(grid);
    }
  }
  const pitLane = new THREE.Mesh(new THREE.BoxGeometry(92, .06, 3.8), asphalt);
  pitLane.position.set(s.x + s.tx * 45 - s.nx * (track.width + 9.5), s.y + .33, s.z + s.tz * 45 - s.nz * (track.width + 9.5));
  pitLane.rotation.y = s.yaw + Math.PI / 2;
  scene.add(pitLane);
}
