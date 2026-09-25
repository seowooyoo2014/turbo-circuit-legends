import * as THREE from "./assets/vendor/three.module.js";
import { Track, TRACKS, buildTrackScene } from "./track.js?v=20260722f1weekend";
import { createRacers, rankRacers } from "./player.js?v=20260722f1weekend";
import { makeAI } from "./ai.js?v=20260722f1weekend";
import { ItemManager } from "./items.js?v=20260722f1weekend";
import { AudioSystem } from "./audio.js?v=20260722f1weekend";
import { UI } from "./ui.js?v=20260722f1weekend";
import { lerp } from "./physics.js?v=20260722f1weekend";
import { STORY_CHAPTERS, chapterById, describeGoal, loadStorySave, storeStorySave } from "./story.js?v=20260722f1weekend";
import { AssetManager } from "./assets.js?v=20260722f1weekend";
import { EffectsSystem } from "./effects.js?v=20260722f1weekend";

class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, .1, 900);
    this.clock = new THREE.Clock();
    this.ui = new UI();
    this.audio = new AudioSystem();
    this.assets = new AssetManager(THREE);
    this.effects = new EffectsSystem(THREE, this.scene);
    this.keys = new Map();
    this.mode = "item";
    this.state = "home";
    this.racers = [];
    this.rankings = [];
    this.ai = [];
    this.track = null;
    this.player = null;
    this.itemManager = null;
    this.elapsed = 0;
    this.frameWindow = [];
    this.grandPrix = { active: false, index: 0, points: new Map(), courses: TRACKS.slice(0, 4) };
    this.storySave = loadStorySave();
    this.currentStoryChapter = null;
    this.storyRadioIndex = 0;
    this.storyLastResult = null;
    this.storyTiming = null;
    this.storyFormulaToken = null;
    this.storyWeekend = null;
    this.cinematic = null;
    this.cinematicGroup = null;
    this.survivalTimer = 25;
    this.cameraShake = 0;
    this.cameraDrift = 0;
    this.impactCooldown = 0;
    this.itemPressed = false;
    this.lastFrame = 0;
    this.options = this.ui.readOptions();
    this.installEvents();
    this.ui.bind({
      start: (mode, options) => this.start(mode, options),
      startStory: chapterId => this.startStoryChapter(chapterId),
      selectStory: chapterId => this.selectStoryChapter(chapterId),
      nextStory: () => this.nextStoryChapter(),
      retryStory: () => this.retryStoryChapter(),
      racingMenu: () => this.toRacingMenu(),
      storyMenu: () => this.toStoryMenu(),
      openWorld: () => this.openWorld(),
      home: () => this.toHome(),
      resume: () => this.resume(),
      nextRace: () => this.nextGrandPrixRace(),
      volume: value => this.audio.setVolume(value)
    });
    this.resize();
    this.animate();
  }

  installEvents() {
    addEventListener("resize", () => this.resize());
    addEventListener("keydown", e => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (e.code === "Escape") this.togglePause();
      if (e.code === "KeyR" && this.player && this.track) this.player.physics.respawn(this.track.nearestSpawn(this.player.physics.position));
      this.keys.set(e.code, true);
    });
    addEventListener("keyup", e => this.keys.set(e.code, false));
    this.canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); this.ui.flash("WebGL 컨텍스트 복구 중"); });
  }

  start(mode, options) {
    this.audio.ensure();
    this.mode = mode;
    this.options = options;
    this.grandPrix.active = mode === "grandprix";
    if (mode === "grandprix") {
      this.grandPrix.index = 0;
      this.grandPrix.points = new Map();
      this.loadCourse(this.grandPrix.courses[0], mode, this.options);
    } else {
      const course = TRACKS.find(t => t.id === this.options.trackId) || TRACKS[0];
      this.loadCourse(course, mode, this.options);
    }
    this.state = "countdown";
    this.countdown = 3.2;
    this.ui.show("game");
    this.ui.flash(mode === "story" ? this.currentStoryChapter.title : "3", mode === "story" ? 1 : .7);
  }

  loadCourse(course, mode, options) {
    this.disposeScene();
    const laps = mode === "survival" ? 99 : options.laps;
    this.track = new Track(course, laps, mode);
    this.scene = new THREE.Scene();
    this.effects = new EffectsSystem(THREE, this.scene);
    buildTrackScene(THREE, this.scene, this.track);
    this.addLights();
    const count = mode === "survival" ? 12 : 10;
    this.racers = createRacers(THREE, this.scene, this.track, count, options.difficulty, options.garage);
    this.player = this.racers[0];
    if (mode === "speed") {
      this.racers = [this.player, ...this.racers.slice(1, 8)];
      this.racers.forEach(r => r.physics.tuning.maxSpeed += r.isPlayer ? 8 : 5);
    }
    this.ai = makeAI(this.racers, options.difficulty);
    this.itemManager = new ItemManager(THREE, this.scene, this.audio, this.track);
    this.prepareStoryRace(mode);
    this.effects.buildArenaCrowd(this.track, mode === "story" ? this.currentStoryChapter : null);
    this.applyStoryFormulaModels(mode);
    this.rankings = rankRacers(this.racers);
    this.elapsed = 0;
    this.survivalTimer = 25;
    this.camera.position.set(0, 12, -18);
    this.resize();
  }

  addLights() {
    const arena = this.track?.course?.arena;
    const hemi = new THREE.HemisphereLight(arena ? 0xe9f7ff : 0xffffff, arena ? 0x202b34 : 0x27333c, arena ? .9 : 1.2);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(arena ? 0xf7fbff : 0xffffff, arena ? 2.7 : 2.3);
    sun.position.set(arena ? 22 : 40, arena ? 86 : 90, arena ? -48 : 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(arena ? 2048 : 1024, arena ? 2048 : 1024);
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    this.scene.add(sun);
    if (!arena) return;
    const rim = new THREE.DirectionalLight(0x8ed9ff, 1.15);
    rim.position.set(-62, 34, 78);
    this.scene.add(rim);
    const warm = new THREE.PointLight(0xffd48a, 1.2, 120);
    const s = this.track.startLine();
    warm.position.set(s.x - s.nx * (this.track.width + 18), s.y + 10, s.z);
    this.scene.add(warm);
    for (let i = 0; i < 4; i++) {
      const strip = new THREE.PointLight(i % 2 ? 0xc7f3ff : 0xffe2a6, .9, 85);
      strip.position.set(s.x + s.tx * (i * 30 - 25), s.y + 13, s.z + s.tz * (i * 30 - 25));
      this.scene.add(strip);
    }
  }

  disposeScene() {
    if (!this.scene) return;
    this.effects?.dispose?.();
    this.scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose?.();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
        else obj.material.dispose?.();
      }
    });
  }

  resize() {
    const scale = this.options?.resolution || .9;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2) * scale);
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  togglePause() {
    if (["home", "menu", "story", "cinematic", "results"].includes(this.state)) return;
    if (this.state === "pause") this.resume();
    else {
      this.state = "pause";
      this.ui.show("pause");
    }
  }

  resume() {
    if (!this.track) return;
    this.state = "race";
    this.ui.show("game");
  }

  toHome() {
    this.state = "home";
    this.keys.clear();
    this.itemPressed = false;
    this.audio.quietEngine();
    this.ui.show("home");
  }

  toRacingMenu() {
    this.state = "menu";
    this.keys.clear();
    this.ui.show("menu");
  }

  toStoryMenu() {
    this.state = "story";
    this.keys.clear();
    this.ui.renderStoryChapters(this.storySave, id => this.selectStoryChapter(id));
    this.ui.show("story");
  }

  openWorld() {
    location.href = "./racing-world.html?from=hub";
  }

  selectStoryChapter(chapterId) {
    const part = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterPart || 1 : 1;
    const session = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterSession || 1 : 1;
    this.currentStoryChapter = chapterById(chapterId, part, session);
  }

  startStoryChapter(chapterId) {
    const part = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterPart || 1 : 1;
    const session = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterSession || 1 : 1;
    const chapter = chapterById(chapterId, part, session);
    if (chapter.id > (this.storySave.unlockedChapter || 1)) {
      this.ui.flash("아직 잠긴 챕터입니다.", 1.1);
      return;
    }
    this.currentStoryChapter = chapter;
    this.storyRadioIndex = 0;
    this.storyTiming = null;
    const options = {
      ...this.ui.readOptions(),
      laps: chapter.laps,
      difficulty: chapter.difficulty,
      trackId: chapter.trackId,
      garage: { ...this.ui.readOptions().garage, formulaFallback: true }
    };
    const course = TRACKS.find(t => t.id === chapter.trackId) || TRACKS[0];
    this.mode = "story";
    this.options = options;
    this.loadCourse(course, "story", options);
    this.startCinematic(storyIntroCutscene(chapter), () => this.beginStoryRace(chapter), "레이스 시작");
  }

  beginStoryRace(chapter) {
    this.clearCinematicSet();
    this.applyGridFromQualifying();
    this.racers.forEach(racer => {
      racer.mesh.visible = !racer.eliminated;
      racer.physics.respawn(this.track.startGrid(racer.storyGridSlot ?? racer.slot));
      racer.syncMesh();
    });
    this.state = "countdown";
    this.countdown = 3.2;
    this.elapsed = 0;
    this.storyTiming = createStoryTiming(this.currentStoryChapter, this.track);
    this.ui.show("game");
    this.ui.flash(`${chapter.sessionLabel || "세션"} · ${chapter.title}`, 1);
  }

  async startCinematic(sequence, onComplete, finalLabel = "계속") {
    this.state = "cinematic";
    this.keys.clear();
    this.itemPressed = false;
    this.audio.quietEngine();
    this.cinematic = { frame: null, index: 0, clock: 0 };
    const videoData = normalizeVideoCutscene(sequence);
    const playableVideo = await firstAvailableAsset(videoData?.video, videoData?.fallbackVideo);
    if (videoData && playableVideo) {
      this.clearCinematicSet();
      this.ui.showVideoCutscene({ ...videoData, video: playableVideo }, () => {
        this.cinematic = null;
        onComplete?.();
      }, finalLabel, () => this.startCinematic(videoData.fallbackSequence || [], onComplete, finalLabel));
      return;
    }
    this.buildCinematicSet();
    const fallback = videoData?.fallbackSequence || sequence;
    this.ui.showCutscene(fallback, onComplete, finalLabel, (frame, index) => this.setCinematicFrame(frame, index));
  }

  setCinematicFrame(frame, index) {
    if (!this.cinematic) this.cinematic = { frame: null, index: 0, clock: 0 };
    this.cinematic.frame = frame;
    this.cinematic.index = index;
    this.cinematic.clock = 0;
    this.arrangeCinematicActors(frame);
    this.applyCinematicCamera(frame, 1);
  }

  buildCinematicSet() {
    this.clearCinematicSet();
    if (!this.scene || !this.track) return;
    const group = new THREE.Group();
    this.assets.tagFallback(group, "arenaGarage");
    const s = this.track.startLine();
    const physical = (color, opts = {}) => new THREE.MeshPhysicalMaterial({
      color,
      roughness: opts.roughness ?? .45,
      metalness: opts.metalness ?? .08,
      clearcoat: opts.clearcoat ?? .15,
      clearcoatRoughness: opts.clearcoatRoughness ?? .35,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0
    });
    const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: opts.roughness ?? .58, metalness: opts.metalness ?? .12, emissive: opts.emissive ?? 0x000000, emissiveIntensity: opts.emissiveIntensity ?? 0 });
    const dark = physical(0x101820, { roughness: .5, metalness: .18 });
    const glass = physical(0x72c9f2, { roughness: .18, metalness: .04, clearcoat: .65, emissive: 0x10384a, emissiveIntensity: .25 });
    const gold = physical(0xf6c647, { roughness: .34, metalness: .22, clearcoat: .55, emissive: 0x4b3300, emissiveIntensity: .18 });
    const rubber = mat(0x090b0d, { roughness: .92 });
    const led = mat(0xeaf8ff, { roughness: .18, emissive: 0xc5f3ff, emissiveIntensity: .95 });
    const garage = new THREE.Group();
    garage.name = "cinematic-garage";
    for (let i = 0; i < 4; i++) {
      const x = s.x + s.tx * (12 + i * 10.5) - s.nx * (this.track.width + 14);
      const z = s.z + s.tz * (12 + i * 10.5) - s.nz * (this.track.width + 14);
      const y = this.track.heightAt(x, z);
      const bay = new THREE.Mesh(new THREE.BoxGeometry(8.8, 6.2, .45), dark);
      bay.position.set(x, y + 3.1, z);
      bay.rotation.y = s.yaw + Math.PI / 2;
      const door = new THREE.Mesh(new THREE.BoxGeometry(7.7, 3.9, .25), mat(i % 2 ? 0x1b2730 : 0x25313a, { roughness: .62, metalness: .16 }));
      door.position.set(x + s.nx * 1.2, y + 2.6, z + s.nz * 1.2);
      door.rotation.y = bay.rotation.y;
      const monitor = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.35, .22), glass);
      monitor.position.set(x + s.nx * 1.5, y + 4.2, z + s.nz * 1.5);
      monitor.rotation.y = bay.rotation.y;
      const light = new THREE.Mesh(new THREE.BoxGeometry(6.2, .18, .35), led);
      light.position.set(x, y + 6.35, z);
      light.rotation.y = bay.rotation.y;
      const gantry = new THREE.Mesh(new THREE.BoxGeometry(.22, 6.1, .22), mat(0xb8c5cc, { roughness: .35, metalness: .55 }));
      gantry.position.set(x - s.tx * 4.3, y + 3.05, z - s.tz * 4.3);
      garage.add(bay, door, monitor, light, gantry);
      const lamp = new THREE.PointLight(0xbfeeff, .55, 24);
      lamp.position.set(x, y + 5.8, z);
      garage.add(lamp);
    }
    const pitWall = new THREE.Group();
    pitWall.name = "cinematic-pit-wall";
    for (let i = 0; i < 6; i++) {
      const x = s.x + s.tx * (14 + i * 6.5) - s.nx * (this.track.width + 4.4);
      const z = s.z + s.tz * (14 + i * 6.5) - s.nz * (this.track.width + 4.4);
      const y = this.track.heightAt(x, z);
      const consoleBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.05, 1.15), dark);
      consoleBase.position.set(x, y + .7, z);
      consoleBase.rotation.y = s.yaw;
      const screen = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.75, .18), glass);
      screen.position.set(x - s.nx * .72, y + 2.05, z - s.nz * .72);
      screen.rotation.y = s.yaw + Math.PI / 2;
      pitWall.add(consoleBase, screen);
    }
    const gridSet = new THREE.Group();
    gridSet.name = "cinematic-grid-light-rig";
    for (let i = 0; i < 5; i++) {
      const x = s.x - s.tx * (8 + i * 8);
      const z = s.z - s.tz * (8 + i * 8);
      const gantry = new THREE.Mesh(new THREE.BoxGeometry(this.track.width * 2 + 10, .28, .38), led);
      gantry.position.set(x, this.track.heightAt(x, z) + 7.3, z);
      gantry.rotation.y = s.yaw + Math.PI / 2;
      gridSet.add(gantry);
    }
    const podium = new THREE.Group();
    podium.name = "cinematic-podium";
    for (let i = 0; i < 3; i++) {
      const h = [1.8, 2.5, 1.35][i];
      const step = new THREE.Mesh(new THREE.BoxGeometry(4, h, 3), i === 1 ? gold : dark);
      step.position.set(s.x - s.tx * 18 + s.nx * (i - 1) * 4.5, this.track.heightAt(s.x, s.z) + h / 2, s.z - s.tz * 18 + s.nz * (i - 1) * 4.5);
      step.rotation.y = s.yaw;
      podium.add(step);
    }
    const visor = new THREE.Mesh(new THREE.TorusGeometry(3.2, .18, 10, 42, Math.PI), rubber);
    visor.name = "cinematic-visor";
    visor.position.set(s.x - s.tx * 1.8 - s.nx * 1.2, s.y + 2.6, s.z - s.tz * 1.8 - s.nz * 1.2);
    visor.rotation.set(Math.PI / 2, 0, s.yaw);
    group.add(garage, pitWall, gridSet, podium, visor);
    this.scene.add(group);
    this.cinematicGroup = group;
  }

  clearCinematicSet() {
    if (!this.cinematicGroup) return;
    this.scene.remove(this.cinematicGroup);
    this.cinematicGroup.traverse(obj => {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
      else obj.material?.dispose?.();
    });
    this.cinematicGroup = null;
  }

  arrangeCinematicActors(frame = {}) {
    if (!this.track || !this.racers.length) return;
    const s = this.track.startLine();
    const scene = frame.scene || frame.set || "grid";
    this.racers.slice(0, 5).forEach((racer, i) => {
      let x = s.x - s.tx * (10 + i * 5.2) + s.nx * ((i % 2 ? 1 : -1) * 3.5);
      let z = s.z - s.tz * (10 + i * 5.2) + s.nz * ((i % 2 ? 1 : -1) * 3.5);
      if (scene === "garage" || scene === "pit" || scene === "pressRoom") {
        x = s.x + s.tx * (20 + i * 4.2) - s.nx * (this.track.width + 7 + (i % 2) * 2);
        z = s.z + s.tz * (20 + i * 4.2) - s.nz * (this.track.width + 7 + (i % 2) * 2);
      }
      if (scene === "podium") {
        x = s.x - s.tx * 21 + s.nx * (i - 1) * 4.4;
        z = s.z - s.tz * 21 + s.nz * (i - 1) * 4.4;
      }
      racer.physics.position.x = x;
      racer.physics.position.z = z;
      racer.physics.position.y = this.track.heightAt(x, z);
      racer.physics.yaw = s.yaw + (scene === "podium" ? Math.PI : 0);
      racer.physics.velocity.x = 0;
      racer.physics.velocity.y = 0;
      racer.physics.velocity.z = 0;
      racer.syncMesh();
      racer.mesh.visible = i < (scene === "teamRadio" ? 2 : 5);
    });
  }

  updateCinematic(dt) {
    if (!this.cinematic || !this.track) return;
    this.cinematic.clock += dt;
    const frame = this.cinematic.frame || {};
    const strength = frame.motion === "push" ? 2.1 : frame.motion === "pan" ? 1.3 : frame.motion === "handheld" ? 2.6 : .85;
    this.applyCinematicCamera(frame, 1 - Math.pow(.02, dt * strength));
    const s = this.track.startLine();
    if (frame.motion === "roll" || frame.scene === "grid") {
      this.racers.slice(0, 5).forEach((racer, i) => {
        const bob = Math.sin(this.cinematic.clock * 4 + i) * .018;
        racer.mesh.position.y = racer.physics.position.y + bob;
        racer.mesh.rotation.y = racer.physics.yaw + Math.sin(this.cinematic.clock * 1.7 + i) * .025;
      });
    }
    if (frame.scene === "teamRadio" && this.racers[0]) {
      this.racers[0].mesh.rotation.y = s.yaw + Math.sin(this.cinematic.clock * 1.2) * .08;
    }
  }

  applyCinematicCamera(frame = {}, blend = 1) {
    if (!this.track) return;
    const target = cinematicCameraPose(this.track, frame, this.cinematic?.clock || 0);
    const desired = new THREE.Vector3(target.pos.x, target.pos.y, target.pos.z);
    const look = new THREE.Vector3(target.look.x, target.look.y, target.look.z);
    this.camera.position.lerp(desired, blend);
    this.camera.lookAt(look);
    this.camera.fov = lerp(this.camera.fov, target.fov || 54, blend);
    this.camera.updateProjectionMatrix();
  }

  nextStoryChapter() {
    const result = this.storyLastResult;
    const nextId = result?.nextChapter || result?.chapterId || Math.min(STORY_CHAPTERS.length, (this.currentStoryChapter?.id || 1) + 1);
    const nextPart = result?.nextPart || this.storySave.chapterPart || 1;
    const nextSession = result?.nextSession || this.storySave.chapterSession || 1;
    this.currentStoryChapter = chapterById(nextId, nextPart, nextSession);
    this.ui.selectedStoryId = nextId;
    this.toStoryMenu();
  }

  retryStoryChapter() {
    this.startStoryChapter(this.currentStoryChapter?.id || this.storySave.unlockedChapter || 1);
  }

  prepareStoryRace(mode) {
    if (mode !== "story" || !this.currentStoryChapter) return;
    this.track.itemBoxes = [];
    if (this.currentStoryChapter.weather === "wet") this.track.storyWet = true;
    this.racers.forEach(racer => {
      racer.item = null;
      racer.itemCharges = 0;
      racer.itemTimer = 0;
      racer.roulette = 0;
      racer.rouletteItems = [];
      racer.trailingItem = null;
      racer.cooldown = 0;
      racer.storyF1 = createStoryF1State(this.currentStoryChapter, racer);
    });
    if (this.currentStoryChapter.rivalName && this.racers[1]) this.racers[1].name = this.currentStoryChapter.rivalName;
    if (this.currentStoryChapter.id === 3 && this.racers[2]) this.racers[2].name = "린";
    if (this.currentStoryChapter.id === 5) {
      if (this.racers[1]) this.racers[1].name = "린";
      this.scene.fog.near = 45;
      this.scene.fog.far = 430;
    }
    this.storyWeekend = {
      sessionId: this.currentStoryChapter.sessionId || "race",
      sessionLabel: this.currentStoryChapter.sessionLabel || "결승",
      drsEnabled: this.currentStoryChapter.sessionType === "Race",
      pitRequired: this.currentStoryChapter.sessionType === "Race" && (this.currentStoryChapter.laps || 0) >= 2,
      incidentPlayed: false
    };
  }

  async applyStoryFormulaModels(mode) {
    if (mode !== "story") return;
    const token = Symbol("story-formula-load");
    this.storyFormulaToken = token;
    const jobs = this.racers.slice(0, 4).map(async racer => {
      const slot = storyFormulaModelSlot(racer) || (racer.isPlayer ? "heroFormula" : racer.slot % 2 ? "cpuFormulaA" : "cpuFormulaB");
      const model = await this.assets.loadModel(slot);
      if (!model || this.storyFormulaToken !== token || !this.racers.includes(racer)) return;
      installRacerAssetModel(racer, model, racer.isPlayer ? 1.16 : 1.08);
    });
    await Promise.all(jobs);
  }

  nextGrandPrixRace() {
    if (!this.grandPrix.active) return this.toHome();
    this.grandPrix.index++;
    if (this.grandPrix.index >= this.grandPrix.courses.length) {
      this.ui.showResults({ ...this, rankings: this.grandPrixStandings() }, "그랑프리 최종 결과");
      this.grandPrix.active = false;
      return;
    }
    this.loadCourse(this.grandPrix.courses[this.grandPrix.index], "grandprix", this.options);
    this.state = "countdown";
    this.countdown = 3.2;
    this.ui.show("game");
    this.ui.flash(`Race ${this.grandPrix.index + 1}`, 1);
  }

  grandPrixStandings() {
    return this.racers.map(r => ({ ...r, progress: this.grandPrix.points.get(r.name) || 0 })).sort((a, b) => b.progress - a.progress);
  }

  readInput() {
    return {
      throttle: this.keys.get("ArrowUp") || this.keys.get("KeyW") ? 1 : this.keys.get("ArrowDown") || this.keys.get("KeyS") ? -1 : 0,
      brake: this.keys.get("ArrowDown") || this.keys.get("KeyS") ? 1 : 0,
      steer: (this.keys.get("ArrowLeft") || this.keys.get("KeyA") ? -1 : 0) + (this.keys.get("ArrowRight") || this.keys.get("KeyD") ? 1 : 0),
      drift: this.keys.get("ShiftLeft") || this.keys.get("ShiftRight")
    };
  }

  update(dt) {
    if (this.state === "cinematic") {
      this.updateCinematic(dt);
      this.updateFps(dt);
      return;
    }
    if (!this.track || ["home", "menu", "story", "cinematic", "pause"].includes(this.state)) return;
    if (this.state === "countdown") {
      this.countdown -= dt;
      const n = Math.ceil(this.countdown);
      if (n > 0 && Math.abs(this.countdown - n) < dt) this.ui.flash(String(n), .65);
      if (this.countdown <= 0) {
        this.state = "race";
        this.ui.flash("GO!", .9);
      }
      dt = Math.min(dt, .016);
    } else {
      this.elapsed += dt;
    }
    this.updateStoryRadio();

    const rankingsBefore = rankRacers(this.racers);
    const playerInput = this.state === "race" ? this.readInput() : { throttle: 0, brake: 0, steer: 0, drift: false };
    const playerInfo = this.player.update(this.track, playerInput, dt, this.elapsed);
    this.effects.updateDriftSmoke(this.player, playerInfo, this.track, dt);
    for (const controller of this.ai) {
      const input = this.state === "race" ? controller.update(this.track, this.racers, this.itemManager, dt) : { throttle: 0, brake: 0, steer: 0, drift: false };
      const info = controller.racer.update(this.track, input, dt, this.elapsed);
      this.effects.updateDriftSmoke(controller.racer, info, this.track, dt);
    }
    this.handlePlayerImpact(dt);

    this.rankings = rankRacers(this.racers);
    this.updateStoryTiming();
    this.updateStoryF1Systems(dt);
    if (this.mode !== "speed" && this.mode !== "story" && this.state === "race") {
      for (const racer of this.racers) {
        const rank = rankingsBefore.indexOf(racer) + 1;
        this.itemManager.checkItemBoxes(racer, rank, this.racers.length);
      }
      const itemDown = this.keys.get("Space");
      if (itemDown && !this.itemPressed) this.itemManager.useItem(this.player, this.racers);
      this.itemPressed = itemDown;
    }
    this.itemManager.update(this.racers, dt);
    this.effects.update(dt);

    if (this.mode === "survival" && this.state === "race") this.updateSurvival(dt);
    if (this.racers.filter(r => !r.finished && !r.eliminated).length === 0 || this.player.finished || this.player.eliminated) this.finishRace();

    this.audio.updateEngine(this.player.physics.speed, this.player.physics.boostTime > 0);
    this.updateWorldMood(dt);
    this.ui.update(this, dt);
    this.updateCamera(dt);
    this.updateFps(dt);
  }

  updateSurvival(dt) {
    this.survivalTimer -= dt;
    if (this.survivalTimer <= 0) {
      const alive = this.rankings.filter(r => !r.eliminated && !r.finished);
      const last = alive[alive.length - 1];
      if (last) {
        last.eliminated = true;
        last.mesh.visible = false;
        this.ui.flash(`${last.name} 탈락`, 1.2);
      }
      this.survivalTimer = Math.max(10, 25 - this.elapsed * .018);
      if (alive.length <= 2) this.finishRace();
    }
  }

  handlePlayerImpact(dt) {
    this.impactCooldown = Math.max(0, this.impactCooldown - dt);
    const impact = this.player.lastImpact;
    if (!impact || this.impactCooldown > 0) return;
    const sound = {
      blast: "bomb",
      spin: "collision",
      slow: "lightning",
      shrink: "lightning",
      ink: "ink",
      stun: "collision",
      obstacle: "thunk",
      wall: "thunk"
    }[impact.type] || "thunk";
    this.audio.play(sound);
    this.cameraShake = Math.max(this.cameraShake, .45 + impact.strength * .55);
    const label = { blast: "폭발!", spin: "스핀!", slow: "감속!", shrink: "축소!", ink: "먹물!", obstacle: "쿵!" }[impact.type] || "충돌!";
    this.ui.flash(label, .45);
    this.impactCooldown = .35;
    this.player.lastImpact = null;
  }

  finishRace() {
    if (["results", "cinematic"].includes(this.state)) return;
    this.rankings = rankRacers(this.racers);
    if (this.mode === "story") {
      const result = this.evaluateStoryResult();
      this.storyLastResult = result;
      this.applyStoryResult(result);
      const sequence = result.success
        ? storyOutroCutscene(this.currentStoryChapter, true)
        : storyOutroCutscene(this.currentStoryChapter, false);
      this.startCinematic(sequence, () => {
        this.clearCinematicSet();
        this.racers.forEach(racer => { racer.mesh.visible = !racer.eliminated; });
        this.state = "results";
        this.ui.showStoryResults(this, result);
      }, "결과 보기");
      return;
    }
    this.state = "results";
    if (this.mode === "grandprix") this.applyGrandPrixPoints();
    if (this.mode === "speed") this.saveGhost();
    this.ui.showResults(this, this.mode === "grandprix" ? `그랑프리 ${this.grandPrix.index + 1} 경기 결과` : "레이스 결과");
  }

  applyGrandPrixPoints() {
    const points = [15, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    this.rankings.forEach((r, i) => this.grandPrix.points.set(r.name, (this.grandPrix.points.get(r.name) || 0) + (points[i] || 0)));
  }

  saveGhost() {
    const key = `speed-${this.track.course.id}`;
    const best = Number(localStorage.getItem(key) || Infinity);
    if (this.player.finishTime && this.player.finishTime < best) {
      localStorage.setItem(key, this.player.finishTime);
      this.ui.storeSave({ best: { ...this.ui.save.best, [key]: this.player.finishTime } });
    }
  }

  updateStoryRadio() {
    if (this.mode !== "story" || this.state !== "race" || !this.currentStoryChapter) return;
    const lines = this.currentStoryChapter.midRaceDrama || this.currentStoryChapter.radioLines || [];
    const line = lines[this.storyRadioIndex];
    if (!line || this.elapsed < line.at) return;
    if (!this.storyRadioConditionMet(line)) {
      if (this.elapsed > line.at + 8) this.storyRadioIndex++;
      return;
    }
    this.ui.flash(`${line.speaker}: ${line.text}`, 2.7);
    this.storyRadioIndex++;
  }

  storyRadioConditionMet(line) {
    if (!line.condition || line.condition === "time") return true;
    const rank = this.rankings.indexOf(this.player) + 1;
    if (line.condition === "rankAtMost") return rank > 0 && rank <= line.rank;
    if (line.condition === "rivalNear") {
      const rival = this.racers.find(r => r.name === line.rival);
      return rival ? Math.abs((rival.raceDistance || 0) - (this.player.raceDistance || 0)) < (line.distance || 1.5) * 28 : false;
    }
    if (line.condition === "sectorSlow") {
      const timing = this.storyTiming;
      const sector = Math.max(0, (line.sector || 1) - 1);
      const time = timing?.sectorTimes?.[sector];
      const target = timing?.sectorTargets?.[sector];
      return Number.isFinite(time) && Number.isFinite(target) && time > target;
    }
    return true;
  }

  updateStoryF1Systems(dt) {
    if (this.mode !== "story" || this.state !== "race" || !this.currentStoryChapter || !this.player || !this.track?.course?.arena) return;
    for (const racer of this.racers) {
      const state = racer.storyF1;
      if (!state) continue;
      const wearRate = (racer.physics.speed / 48) * (racer.physics.drift.active ? 1.8 : 1) * (this.currentStoryChapter.weather === "wet" ? 1.25 : 1);
      state.tireWear = Math.min(100, state.tireWear + wearRate * dt * 1.8);
      state.drs = Math.max(0, state.drs - dt);
      const wearPenalty = Math.max(0, state.tireWear - 45) * .045;
      racer.physics.tuning.maxSpeed = Math.max(30, state.baseMaxSpeed - wearPenalty);
      racer.physics.tuning.grip = Math.max(6.5, state.baseGrip - Math.max(0, state.tireWear - 35) * .035);
      if (this.storyWeekend?.drsEnabled && this.isInDrsZone(racer) && this.hasDrsTarget(racer)) {
        racer.physics.addBoost(.12, .34);
        state.drs = .35;
      }
    }

    const playerState = this.player.storyF1;
    if (!playerState) return;
    const sample = this.track.sample(this.player.physics.position.x, this.player.physics.position.z);
    if (sample.surface === "offroad" && this.player.physics.speed > 15) {
      playerState.trackLimitTime += dt;
      if (playerState.trackLimitTime > 1.2) {
        playerState.penalty += 3;
        playerState.trackLimitTime = 0;
        this.ui.flash(`트랙 리밋 +3초 · 총 ${playerState.penalty}s`, 1.2);
      }
    } else {
      playerState.trackLimitTime = Math.max(0, playerState.trackLimitTime - dt * 2);
    }

    if (this.storyWeekend?.pitRequired && !playerState.pitComplete && this.isInPitWindow(this.player)) {
      if (this.player.physics.speed < 14) {
        playerState.pitTimer += dt;
        this.ui.flash(`피트스톱 ${Math.ceil(Math.max(0, 2.4 - playerState.pitTimer))}`, .25);
        this.player.physics.velocity.x *= .86;
        this.player.physics.velocity.z *= .86;
        if (playerState.pitTimer >= 2.4) {
          playerState.pitComplete = true;
          playerState.pitStops++;
          playerState.tireWear = Math.max(0, playerState.tireWear * .18);
          this.ui.flash("타이어 교체 완료", 1.1);
        }
      } else {
        playerState.pitTimer = Math.max(0, playerState.pitTimer - dt);
      }
    }

    if (this.currentStoryChapter.incidentVideo && !this.storyWeekend.incidentPlayed && this.elapsed > Math.max(18, (this.currentStoryChapter.laps || 1) * 12)) {
      this.storyWeekend.incidentPlayed = true;
      this.triggerStoryIncidentCutscene();
    }
  }

  triggerStoryIncidentCutscene() {
    if (this.mode !== "story" || !this.currentStoryChapter) return;
    const resumeState = this.state === "countdown" ? "countdown" : "race";
    this.startCinematic(storyIncidentCutscene(this.currentStoryChapter), () => {
      this.clearCinematicSet();
      this.racers.forEach(racer => { racer.mesh.visible = !racer.eliminated; });
      this.state = resumeState;
      this.ui.show("game");
      this.ui.flash("레이스 재개", .8);
    }, "레이스 계속");
  }

  isInDrsZone(racer) {
    const total = this.track.totalLength || 1;
    const d = ((racer.lapDistance || 0) % total + total) % total;
    return (this.track.drsZones || []).some(zone => d >= zone.start && d <= zone.end);
  }

  hasDrsTarget(racer) {
    const ahead = this.rankings.find(other => other !== racer && !other.finished && !other.eliminated && (other.raceDistance || 0) > (racer.raceDistance || 0));
    return ahead ? (ahead.raceDistance - racer.raceDistance) < 55 : false;
  }

  isInPitWindow(racer) {
    if (!this.track.pitLane) return false;
    const d = racer.lapDistance || 0;
    const p = this.track.pitLane;
    return d >= p.start || d <= p.end;
  }

  applyGridFromQualifying() {
    if (!this.currentStoryChapter || this.currentStoryChapter.sessionType !== "Race") return;
    const rank = this.storySave.qualifyingResults?.[storyQualifyingKey(this.currentStoryChapter)];
    if (!rank) return;
    this.racers.forEach((racer, index) => { racer.storyGridSlot = index; });
    this.player.storyGridSlot = Math.max(0, Math.min(this.racers.length - 1, Number(rank) - 1));
    const used = new Set([this.player.storyGridSlot]);
    let slot = 0;
    for (const racer of this.racers.slice(1)) {
      while (used.has(slot)) slot++;
      racer.storyGridSlot = slot;
      used.add(slot);
    }
  }

  updateStoryTiming() {
    if (this.mode !== "story" || this.state !== "race" || !this.storyTiming || !this.player || !this.track?.totalLength) return;
    const timing = this.storyTiming;
    const totalLength = this.track.totalLength || 1;
    const sectorLength = totalLength / 3;
    const lapDistance = Math.max(0, Math.min(totalLength - .001, this.player.lapDistance || 0));
    const sector = Math.min(2, Math.floor(lapDistance / sectorLength));

    if (sector > timing.currentSector) {
      timing.sectorTimes[timing.currentSector] = this.elapsed - timing.sectorStart;
      timing.lastSectorTime = timing.sectorTimes[timing.currentSector];
      timing.sectorStart = this.elapsed;
      timing.currentSector = sector;
      this.ui.flash(`Sector ${sector}: ${formatRaceTime(timing.lastSectorTime)}`, .8);
    }

    if (this.player.completedLaps > timing.completedLaps) {
      timing.sectorTimes[2] = this.elapsed - timing.sectorStart;
      timing.lastLapTime = this.elapsed - timing.lapStart;
      timing.bestLap = timing.bestLap ? Math.min(timing.bestLap, timing.lastLapTime) : timing.lastLapTime;
      timing.deltaToTarget = timing.bestLap - (timing.targetLapTime || timing.bestLap);
      timing.completedLaps = this.player.completedLaps;
      timing.lapStart = this.elapsed;
      timing.sectorStart = this.elapsed;
      timing.currentSector = 0;
      timing.sectorTimes = [null, null, null];
      this.ui.flash(`Lap: ${formatRaceTime(timing.lastLapTime)} ${formatDelta(timing.deltaToTarget)}`, 1.1);
    }

    timing.currentLapTime = this.elapsed - timing.lapStart;
    timing.currentSectorNumber = sector + 1;
    timing.progress = lapDistance / totalLength;
  }

  evaluateStoryResult() {
    const chapter = this.currentStoryChapter;
    const rank = this.rankings.indexOf(this.player) + 1;
    let success = false;
    let detail = `${rank}위`;
    if (chapter.goal.type === "rankAtMost") success = rank > 0 && rank <= chapter.goal.rank;
    if (chapter.goal.type === "lapTimeAtMost") {
      const time = this.storyTiming?.bestLap || this.storyTiming?.lastLapTime || this.elapsed;
      success = Boolean(this.player.finished) && time <= chapter.goal.time;
      detail = `${formatRaceTime(time)} / 목표 ${formatRaceTime(chapter.goal.time)}`;
    }
    if (chapter.goal.type === "beatRival") {
      const rival = this.rankings.find(r => r.name === chapter.goal.rival);
      const rivalRank = rival ? this.rankings.indexOf(rival) + 1 : Infinity;
      success = rank > 0 && rank < rivalRank;
      detail = rival ? `${rank}위, ${chapter.goal.rival} ${rivalRank}위` : `${rank}위, 라이벌 미출전`;
    }
    if (chapter.goal.type === "finishRace") success = Boolean(this.player.finished);
    const f1State = this.player.storyF1;
    if (chapter.sessionType === "Race" && this.storyWeekend?.pitRequired && f1State && !f1State.pitComplete) {
      success = false;
      detail += ", 피트스톱 미완료";
    }
    if (f1State?.penalty > 0) detail += `, 페널티 ${f1State.penalty}s`;
    const stats = this.storyTiming || {};
    const timingText = stats.bestLap
      ? ` · 베스트 랩 ${formatRaceTime(stats.bestLap)} · 목표 대비 ${formatDelta((stats.bestLap || 0) - (chapter.targetLapTime || stats.bestLap || 0))}`
      : "";
    return {
      chapterId: chapter.id,
      success,
      rank,
      detail,
      timing: {
        bestLap: stats.bestLap || null,
        lastLap: stats.lastLapTime || null,
        sectorTimes: stats.sectorTimes || [],
        deltaToTarget: stats.deltaToTarget || null
      },
      partIndex: chapter.partIndex || 1,
      partId: chapter.partId || "A",
      sessionIndex: chapter.sessionIndex || 1,
      sessionId: chapter.sessionId || "race",
      nextSession: success && (chapter.sessionIndex || 1) < (chapter.sessions?.length || 1) ? (chapter.sessionIndex || 1) + 1 : null,
      nextPart: success && (chapter.sessionIndex || 1) >= (chapter.sessions?.length || 1) && (chapter.partIndex || 1) < (chapter.parts?.length || 1) ? (chapter.partIndex || 1) + 1 : null,
      nextChapter: success && (chapter.sessionIndex || 1) >= (chapter.sessions?.length || 1) && (chapter.partIndex || 1) >= (chapter.parts?.length || 1) && chapter.id < STORY_CHAPTERS.length ? chapter.id + 1 : null,
      f1: this.player.storyF1 ? {
        tireWear: Math.round(this.player.storyF1.tireWear),
        pitStops: this.player.storyF1.pitStops,
        penalty: this.player.storyF1.penalty,
        pitComplete: this.player.storyF1.pitComplete
      } : null,
      message: `${success ? chapter.successText : chapter.failText} 목표: ${describeGoal(chapter.goal)} · 결과: ${detail}${timingText}`
    };
  }

  applyStoryResult(result) {
    const cleared = new Set(this.storySave.cleared || []);
    const clearedParts = new Set(this.storySave.clearedParts || []);
    const clearedSessions = new Set(this.storySave.clearedSessions || []);
    const qualifyingResults = { ...(this.storySave.qualifyingResults || {}) };
    if (result.success) clearedSessions.add(`${result.chapterId}${result.partId || "A"}${result.sessionId || "race"}`);
    if (result.success && result.sessionId === "qualifying") qualifyingResults[storyQualifyingKey(this.currentStoryChapter)] = result.rank;
    if (result.success && !result.nextSession) clearedParts.add(`${result.chapterId}${result.partId || "A"}`);
    if (result.success && !result.nextSession && !result.nextPart) cleared.add(result.chapterId);
    const nextUnlocked = result.success && !result.nextSession && !result.nextPart
      ? Math.max(this.storySave.unlockedChapter || 1, result.chapterId + 1)
      : this.storySave.unlockedChapter || 1;
    this.storySave = {
      ...this.storySave,
      cleared: [...cleared].sort((a, b) => a - b),
      clearedParts: [...clearedParts].sort(),
      clearedSessions: [...clearedSessions].sort(),
      qualifyingResults,
      chapterPart: result.success ? (result.nextPart || result.partIndex || 1) : (result.partIndex || this.storySave.chapterPart || 1),
      chapterSession: result.success ? (result.nextSession || 1) : (result.sessionIndex || this.storySave.chapterSession || 1),
      unlockedChapter: nextUnlocked,
      lastResult: result,
      seasonComplete: result.success && !result.nextSession && !result.nextPart && result.chapterId >= STORY_CHAPTERS.length ? true : this.storySave.seasonComplete
    };
    this.storySave.unlockedChapter = Math.min(this.storySave.unlockedChapter, STORY_CHAPTERS.length);
    storeStorySave(this.storySave);
    if (this.storySave.seasonComplete) {
      this.ui.storeSave({ achievements: { ...this.ui.save.achievements, storySeasonClear: true } });
    }
  }

  updateCamera(dt) {
    const p = this.player.physics.position;
    const yaw = this.player.physics.yaw;
    const driftRoll = this.player.physics.drift.active ? this.player.physics.drift.dir * .16 : 0;
    this.cameraDrift = lerp(this.cameraDrift, driftRoll, dt * 5);
    this.cameraShake = Math.max(this.cameraShake, this.player.effects.cameraShake || 0);
    this.player.effects.cameraShake = 0;
    const boost = this.player.physics.boostTime > 0;
    const fov = boost ? 78 : 68;
    this.camera.fov = lerp(this.camera.fov, fov, dt * 4);
    this.camera.updateProjectionMatrix();
    const dist = boost ? 18 : 15;
    const height = this.player.physics.onGround ? 7 : 8.5;
    const shake = this.cameraShake > 0 ? this.cameraShake * .9 : 0;
    this.cameraShake = Math.max(0, this.cameraShake - dt * 1.9);
    const desired = new THREE.Vector3(
      p.x - Math.sin(yaw + this.cameraDrift) * dist + (Math.random() - .5) * shake,
      p.y + height + (Math.random() - .5) * shake,
      p.z - Math.cos(yaw + this.cameraDrift) * dist + (Math.random() - .5) * shake
    );
    this.camera.position.lerp(desired, 1 - Math.pow(.001, dt));
    this.camera.lookAt(p.x, p.y + 2.4, p.z);
  }

  updateWorldMood(dt) {
    const zone = this.player.lastTerrain?.zone;
    if (!zone) return;
    this.scene.background.lerp(new THREE.Color(zone.sky), dt * 1.6);
    this.scene.fog.color.lerp(new THREE.Color(zone.sky), dt * 1.6);
  }

  updateFps(dt) {
    this.frameWindow.push(1 / Math.max(dt, .0001));
    if (this.frameWindow.length > 40) this.frameWindow.shift();
    const avg = this.frameWindow.reduce((a, b) => a + b, 0) / this.frameWindow.length;
    this.ui.fps(avg);
  }

  animate(time = 0) {
    requestAnimationFrame(t => this.animate(t));
    const cap = this.options?.fpsCap || 60;
    if (time - this.lastFrame < 1000 / cap - 1) return;
    this.lastFrame = time;
    const dt = Math.min(this.clock.getDelta(), .033);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }
}

function cinematicCameraPose(track, frame = {}, time = 0) {
  const s = track.startLine();
  const scene = frame.camera || frame.scene || frame.set || "grid";
  const baseY = s.y + 1.2;
  const drift = Math.sin(time * .55) * 2.2;
  const point = (forward, side, up) => ({
    x: s.x + s.tx * forward + s.nx * side,
    y: baseY + up,
    z: s.z + s.tz * forward + s.nz * side
  });
  const look = (forward, side, up) => ({
    x: s.x + s.tx * forward + s.nx * side,
    y: baseY + up,
    z: s.z + s.tz * forward + s.nz * side
  });
  const shake = frame.motion === "handheld" ? .16 : frame.motion === "push" ? .055 : .025;
  const jitter = {
    x: Math.sin(time * 7.1) * shake + Math.sin(time * 2.6) * shake * .6,
    y: Math.cos(time * 5.3) * shake * .45,
    z: Math.sin(time * 6.4 + 1.2) * shake
  };
  const push = frame.motion === "push" ? Math.min(time / Math.max(frame.duration || 4, 1), 1) * 5.5 : 0;
  const pan = frame.motion === "pan" ? Math.sin(time * .55) * 4.4 : 0;
  const poses = {
    garage: {
      pos: point(26 + drift + push, -track.width - 19 + pan * .15, 5.8),
      look: look(22 + push * .45, -track.width - 6, 2.2),
      fov: 46
    },
    pit: {
      pos: point(48 + drift + pan, -track.width - 27, 8.2),
      look: look(32 + pan * .4, -track.width - 4, 2.4),
      fov: 45
    },
    grid: {
      pos: point(-29 + drift + push, 7.5, frame.motion === "low" ? 1.35 : 2.8),
      look: look(6 + push * .45, 0, 1.15),
      fov: frame.motion === "low" ? 36 : 42
    },
    teamRadio: {
      pos: point(-7 + Math.sin(time) * 1.2, -5, 2.15),
      look: look(-2, 0, 1.25),
      fov: 31
    },
    podium: {
      pos: point(-34 + drift, 16, 7.4),
      look: look(-20, 0, 2.4),
      fov: 42
    },
    pressRoom: {
      pos: point(18 + drift, -track.width - 22, 4.8),
      look: look(24, -track.width - 8, 2.3),
      fov: 40
    }
  };
  const pose = poses[scene] || poses.grid;
  return {
    pos: { x: pose.pos.x + jitter.x, y: pose.pos.y + jitter.y, z: pose.pos.z + jitter.z },
    look: pose.look,
    fov: pose.fov
  };
}

function createStoryTiming(chapter, track) {
  return {
    targetLapTime: chapter?.targetLapTime || null,
    sectorTargets: chapter?.sectorTargets || [null, null, null],
    brakeHint: chapter?.brakeHint || "브레이킹 포인트를 늦추지 말고 출구 속도를 유지",
    completedLaps: 0,
    lapStart: 0,
    sectorStart: 0,
    currentSector: 0,
    currentSectorNumber: 1,
    currentLapTime: 0,
    lastLapTime: null,
    bestLap: null,
    deltaToTarget: null,
    lastSectorTime: null,
    sectorTimes: [null, null, null],
    progress: track?.totalLength ? 0 : 0
  };
}

function createStoryF1State(chapter, racer) {
  const compound = chapter?.tireRule === "intermediate" ? "INTER" : chapter?.tireRule === "soft-medium" ? (racer.slot % 2 ? "MED" : "SOFT") : "MED";
  return {
    compound,
    tireWear: compound === "SOFT" ? 8 : 3,
    pitStops: 0,
    pitTimer: 0,
    pitComplete: chapter?.sessionType !== "Race",
    penalty: 0,
    drs: 0,
    trackLimitTime: 0,
    baseMaxSpeed: racer.physics.tuning.maxSpeed,
    baseGrip: racer.physics.tuning.grip
  };
}

function storyQualifyingKey(chapter) {
  return `${chapter.id}${chapter.partId || "A"}`;
}

function storyFormulaModelSlot(racer) {
  const team = racer.mesh?.userData?.team;
  return {
    "Aster Works": "formulaAsterWorks",
    "Vela Storm": "formulaVelaStorm",
    "Crimson Apex": "formulaCrimsonApex",
    "Neon Harbor": "formulaNeonHarbor",
    "Aurora Vector": "formulaAuroraVector"
  }[team] || null;
}

function storyIntroCutscene(chapter) {
  return {
    video: chapter.introVideo,
    fallbackVideo: mp4Backup(chapter.introVideo),
    poster: chapter.introPoster,
    title: `${chapter.title} · Part ${chapter.partLabel || chapter.partId || "A"}`,
    speaker: "아스터 레이싱",
    text: chapter.incident?.summary || chapter.briefing?.join(" ") || "레이스가 시작됩니다.",
    fallbackSequence: chapter.fallbackSequence || chapter.introCutscene
  };
}

function storyOutroCutscene(chapter, success) {
  const video = success ? chapter.outroVideo : chapter.failVideo;
  return {
    video,
    fallbackVideo: mp4Backup(video),
    poster: success ? chapter.outroPoster : chapter.failPoster,
    title: success ? "결과 컷신" : "재도전 컷신",
    speaker: success ? "서윤" : "아스터 피트월",
    text: success ? chapter.successText : chapter.failText,
    fallbackSequence: success
      ? (chapter.outroFallbackSequence || chapter.successCutscene)
      : (chapter.failFallbackSequence || chapter.failCutscene)
  };
}

function storyIncidentCutscene(chapter) {
  return {
    video: chapter.incidentVideo,
    fallbackVideo: mp4Backup(chapter.incidentVideo),
    title: `${chapter.title} · 사건`,
    speaker: "아스터 피트월",
    text: chapter.incident?.summary || "트랙 위 접촉 사고로 팀 라디오가 한순간 얼어붙습니다.",
    fallbackSequence: chapter.incidentCutscene || [
      {
        scene: "grid",
        title: "접촉 순간",
        speaker: chapter.rivalName || "하진",
        text: "라인이 겹쳤어. 피하지 않은 건 너도 마찬가지야.",
        camera: "grid",
        motion: "handheld"
      },
      {
        scene: "pit",
        title: "피트월 리플레이",
        speaker: "서윤",
        text: "리플레이 확인 중입니다. 지금은 차를 살리고 다음 브레이킹 존에 집중하세요.",
        camera: "pit",
        motion: "pan"
      },
      {
        scene: "teamRadio",
        title: "무전 침묵",
        speaker: "민 대표",
        text: "두 차 모두 잃을 수는 없습니다. 감정은 피트로 가져오고, 트랙에서는 결과로 말하세요.",
        camera: "teamRadio",
        motion: "push"
      }
    ]
  };
}

function normalizeVideoCutscene(sequence) {
  if (!sequence || Array.isArray(sequence)) return null;
  if (!sequence.video && !sequence.fallbackVideo && !sequence.poster && !sequence.fallbackSequence) return null;
  return sequence;
}

async function firstAvailableAsset(...urls) {
  for (const url of urls) {
    if (await assetAvailable(url)) return url;
  }
  return null;
}

function mp4Backup(url) {
  return typeof url === "string" && url.endsWith(".webm") ? `${url.slice(0, -5)}.mp4` : null;
}

async function assetAvailable(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

function installRacerAssetModel(racer, model, scale = 1) {
  const flame = racer.mesh.userData.flame;
  const sparks = racer.mesh.userData.sparks;
  for (const child of racer.mesh.children) {
    if (child !== flame && child !== sparks) child.visible = false;
  }
  model.name = "story-formula-glb";
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.setScalar(scale);
  model.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  racer.mesh.add(model);
  racer.mesh.userData.assetModel = model;
}

function formatRaceTime(value) {
  if (!Number.isFinite(value)) return "--.--";
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  return minutes > 0 ? `${minutes}:${seconds.toFixed(2).padStart(5, "0")}` : `${seconds.toFixed(2)}s`;
}

function formatDelta(value) {
  if (!Number.isFinite(value)) return "--";
  const sign = value <= 0 ? "-" : "+";
  return `${sign}${Math.abs(value).toFixed(2)}s`;
}

new Game();
