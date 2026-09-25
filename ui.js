import { TRACKS } from "./track.js?v=20260722f1weekend";
import { itemDef } from "./items.js?v=20260722f1weekend";
import { STORY_CHAPTERS, chapterById, describeGoal, loadStorySave } from "./story.js?v=20260722f1weekend";

export class UI {
  constructor() {
    this.el = {
      home: document.getElementById("home"),
      menu: document.getElementById("menu"),
      story: document.getElementById("story"),
      cinematic: document.getElementById("cinematic"),
      hud: document.getElementById("hud"),
      pause: document.getElementById("pause"),
      results: document.getElementById("results"),
      lap: document.getElementById("lapText"),
      mode: document.getElementById("modeText"),
      rank: document.getElementById("rankText"),
      fps: document.getElementById("fpsText"),
      speed: document.getElementById("speedText"),
      item: document.getElementById("itemText"),
      slot: document.querySelector(".item-slot"),
      boost: document.getElementById("boostMeter"),
      notice: document.getElementById("notice"),
      ink: document.getElementById("ink"),
      mini: document.getElementById("minimap"),
      resultList: document.getElementById("resultList"),
      resultTitle: document.getElementById("resultTitle"),
      resultStory: document.getElementById("resultStory"),
      nextRace: document.getElementById("nextRaceBtn"),
      storyProgress: document.getElementById("storyProgress"),
      storyChapterList: document.getElementById("storyChapterList"),
      storyBriefTag: document.getElementById("storyBriefTag"),
      storyBriefTitle: document.getElementById("storyBriefTitle"),
      storyBriefText: document.getElementById("storyBriefText"),
      storyBriefTrack: document.getElementById("storyBriefTrack"),
      storyBriefGoal: document.getElementById("storyBriefGoal"),
      storyBriefLaps: document.getElementById("storyBriefLaps"),
      storyHud: document.getElementById("storyHud"),
      storyHudTitle: document.getElementById("storyHudTitle"),
      storyHudGoal: document.getElementById("storyHudGoal"),
      storyNext: document.getElementById("storyNextBtn"),
      storyRetry: document.getElementById("storyRetryBtn"),
      storyResultActions: document.querySelector(".result-actions"),
      cinematicFrame: document.getElementById("cinematicFrame"),
      cinematicVideo: document.getElementById("cinematicVideo"),
      cinematicKicker: document.getElementById("cinematicKicker"),
      cinematicTitle: document.getElementById("cinematicTitle"),
      cinematicSpeaker: document.getElementById("cinematicSpeaker"),
      cinematicText: document.getElementById("cinematicText"),
      cinematicProgress: document.getElementById("cinematicProgress"),
      cinematicNext: document.getElementById("cinematicNextBtn"),
      cinematicSkip: document.getElementById("cinematicSkipBtn")
    };
    this.noticeTimer = 0;
    this.cutscene = null;
    this.save = this.loadSave();
    this.storySave = loadStorySave();
    this.selectedStoryId = this.storySave.unlockedChapter || 1;
    const trackSelect = document.getElementById("trackSelect");
    TRACKS.forEach(t => trackSelect.append(new Option(t.name, t.id)));
    document.getElementById("volume").value = this.save.settings.volume;
  }

  bind(handlers) {
    document.getElementById("racingModeBtn").addEventListener("click", handlers.racingMenu);
    document.getElementById("storyModeBtn").addEventListener("click", handlers.storyMenu);
    document.getElementById("openWorldBtn").addEventListener("click", handlers.openWorld);
    document.getElementById("racingHomeBtn").addEventListener("click", handlers.home);
    document.getElementById("storyHomeBtn").addEventListener("click", handlers.home);
    document.getElementById("storyStartBtn").addEventListener("click", () => handlers.startStory(this.selectedStoryId));
    document.querySelectorAll("[data-start]").forEach(btn => btn.addEventListener("click", () => handlers.start(btn.dataset.start, this.readOptions())));
    document.getElementById("resumeBtn").addEventListener("click", handlers.resume);
    document.getElementById("menuBtn").addEventListener("click", handlers.home);
    document.getElementById("backMenuBtn").addEventListener("click", handlers.home);
    document.getElementById("nextRaceBtn").addEventListener("click", handlers.nextRace);
    document.getElementById("storyNextBtn").addEventListener("click", () => handlers.nextStory());
    document.getElementById("storyRetryBtn").addEventListener("click", () => handlers.retryStory());
    this.el.cinematicNext.addEventListener("click", () => this.advanceCutscene());
    this.el.cinematicSkip.addEventListener("click", () => this.finishCutscene());
    document.getElementById("volume").addEventListener("input", e => handlers.volume(Number(e.target.value) / 100));
    this.renderStoryChapters(this.storySave, handlers.selectStory);
  }

  readOptions() {
    return {
      laps: Number(document.getElementById("lapSelect").value),
      difficulty: document.getElementById("difficulty").value,
      trackId: document.getElementById("trackSelect").value,
      quality: document.getElementById("quality").value,
      fpsCap: Number(document.getElementById("fpsCap").value),
      resolution: Number(document.getElementById("resolution").value) / 100,
      garage: {
        character: document.getElementById("characterSelect").value,
        kart: document.getElementById("kartSelect").value,
        tire: document.getElementById("tireSelect").value,
        glider: document.getElementById("gliderSelect").value
      }
    };
  }

  show(name) {
    for (const k of ["home", "menu", "story", "cinematic", "pause", "results"]) this.el[k].classList.remove("active");
    this.el.hud.classList.toggle("active", name === "game");
    if (this.el[name]) this.el[name].classList.add("active");
  }

  showCutscene(sequence, onComplete, finalLabel = "계속", onFrame = null) {
    this.stopCutsceneVideo();
    const frames = Array.isArray(sequence) && sequence.length
      ? sequence
      : [{ scene: "garage", title: "장면", speaker: "아스터", text: "레이스가 곧 시작됩니다." }];
    this.cutscene = { frames, index: 0, onComplete, finalLabel, onFrame };
    this.renderCutscene();
    this.show("cinematic");
  }

  showVideoCutscene(cutscene, onComplete, finalLabel = "계속", onFallback = null) {
    this.cutscene = {
      frames: [{ scene: "video", title: cutscene.title || "시네마틱", speaker: cutscene.speaker || "아스터", text: cutscene.text || "" }],
      index: 0,
      onComplete,
      finalLabel,
      onFrame: null,
      video: true
    };
    const video = this.el.cinematicVideo;
    video.src = cutscene.video;
    video.poster = cutscene.poster || "";
    video.currentTime = 0;
    video.muted = false;
    video.controls = false;
    video.onended = () => this.finishCutscene();
    video.onerror = () => {
      this.stopCutsceneVideo();
      this.cutscene = null;
      onFallback?.();
    };
    this.el.cinematicFrame.className = "cinematic-frame video";
    this.el.cinematicKicker.textContent = "영상 컷신";
    this.el.cinematicTitle.textContent = cutscene.title || "아스터 그랑프리 아레나";
    this.el.cinematicSpeaker.textContent = cutscene.speaker || "무전";
    this.el.cinematicText.textContent = cutscene.text || "";
    this.el.cinematicProgress.textContent = "VIDEO";
    this.el.cinematicNext.textContent = finalLabel;
    this.show("cinematic");
    video.classList.add("active");
    video.play().catch(() => {});
  }

  advanceCutscene() {
    if (!this.cutscene) return;
    if (this.cutscene.index >= this.cutscene.frames.length - 1) {
      this.finishCutscene();
      return;
    }
    this.cutscene.index++;
    this.renderCutscene();
  }

  finishCutscene() {
    if (!this.cutscene) return;
    const complete = this.cutscene.onComplete;
    this.cutscene = null;
    this.stopCutsceneVideo();
    complete?.();
  }

  renderCutscene() {
    const cutscene = this.cutscene;
    if (!cutscene) return;
    const frame = cutscene.frames[cutscene.index];
    const scene = frame.scene || "garage";
    this.el.cinematicFrame.className = `cinematic-frame ${scene}`;
    this.el.cinematicKicker.textContent = sceneLabel(scene);
    this.el.cinematicTitle.textContent = frame.title || "아스터 그랑프리 아레나";
    this.el.cinematicSpeaker.textContent = frame.speaker || "무전";
    this.el.cinematicText.textContent = frame.text || "";
    this.el.cinematicProgress.textContent = `${cutscene.index + 1} / ${cutscene.frames.length}`;
    this.el.cinematicNext.textContent = cutscene.index >= cutscene.frames.length - 1 ? cutscene.finalLabel : "다음";
    cutscene.onFrame?.(frame, cutscene.index);
  }

  stopCutsceneVideo() {
    const video = this.el.cinematicVideo;
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.classList.remove("active");
    video.onended = null;
    video.onerror = null;
  }

  renderStoryChapters(save = this.storySave, onSelect = null) {
    this.storySave = save;
    const unlocked = save.unlockedChapter || 1;
    this.selectedStoryId = Math.min(Math.max(1, this.selectedStoryId || unlocked), unlocked);
    const currentPart = save.chapterPart || 1;
    const currentSession = save.chapterSession || 1;
    this.el.storyProgress.textContent = save.seasonComplete
      ? "시즌 클리어 완료"
      : `해금된 챕터 ${unlocked} / ${STORY_CHAPTERS.length} · Part ${currentPart === 2 ? "B" : "A"} · 세션 ${currentSession}/3`;
    this.el.storyChapterList.innerHTML = "";
    STORY_CHAPTERS.forEach(chapter => {
      const part = chapter.id === unlocked ? currentPart : 1;
      const session = chapter.id === unlocked ? currentSession : 1;
      const activeChapter = chapterById(chapter.id, part, session);
      const cleared = save.cleared?.includes(chapter.id);
      const locked = chapter.id > unlocked;
      const btn = document.createElement("button");
      btn.className = `story-chapter-card${chapter.id === this.selectedStoryId ? " selected" : ""}${locked ? " locked" : ""}`;
      btn.disabled = locked;
      btn.innerHTML = `<span class="story-state">${locked ? "잠김" : cleared ? "완료" : `${activeChapter.partLabel || activeChapter.partId} · ${activeChapter.sessionLabel || "세션"}`}</span><strong>${chapter.id}. ${chapter.title}</strong><small>${describeGoal(activeChapter.goal)}</small>`;
      btn.addEventListener("click", () => {
        if (locked) return;
        this.selectedStoryId = chapter.id;
        this.renderStoryChapters(save, onSelect);
        onSelect?.(chapter.id);
      });
      this.el.storyChapterList.append(btn);
    });
    this.showStoryBriefing(this.selectedStoryId);
  }

  showStoryBriefing(chapterId) {
    const part = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterPart || 1 : 1;
    const session = Number(chapterId) === (this.storySave.unlockedChapter || 1) ? this.storySave.chapterSession || 1 : 1;
    const chapter = chapterById(chapterId, part, session);
    const track = TRACKS.find(t => t.id === chapter.trackId);
    this.el.storyBriefTag.textContent = `${chapter.tag} · ${chapter.sessionLabel || "세션"}`;
    this.el.storyBriefTitle.textContent = `${chapter.id}. ${chapter.title}`;
    this.el.storyBriefText.textContent = chapter.briefing.join(" ");
    this.el.storyBriefTrack.textContent = `코스: ${track?.name || chapter.trackId}`;
    this.el.storyBriefGoal.textContent = `목표: ${describeGoal(chapter.goal)}`;
    this.el.storyBriefLaps.textContent = `랩: ${chapter.laps}`;
  }

  flash(text, seconds = 1.4) {
    this.el.notice.textContent = text;
    this.el.notice.classList.add("show");
    this.noticeTimer = seconds;
  }

  update(game, dt) {
    const player = game.player;
    if (!player) return;
    this.noticeTimer -= dt;
    if (this.noticeTimer <= 0) this.el.notice.classList.remove("show");
    const item = itemDef(player.item);
    const roulette = player.rouletteItems?.length
      ? itemDef(player.rouletteItems[Math.floor(performance.now() / 115) % player.rouletteItems.length])
      : null;
    const charges = player.itemCharges > 1 ? ` x${player.itemCharges}` : "";
    const timer = player.itemTimer > 0 ? ` ${Math.ceil(player.itemTimer)}s` : "";
    const trail = player.trailingItem ? `방어 ${player.trailingItem.item.icon}` : "";
    const storyMode = game.mode === "story";
    this.el.item.textContent = storyMode ? "NO ITEMS" : player.roulette > 0 ? `${roulette?.icon || "??"} 룰렛` : trail || (item ? `${item.icon} ${item.name}${charges}${timer}` : "-");
    this.el.slot.classList.toggle("rolling", !storyMode && player.roulette > 0);
    this.el.slot.classList.toggle("armed", !storyMode && Boolean(player.trailingItem));
    this.el.slot.classList.toggle("charged", !storyMode && (player.itemCharges || 0) > 1);
    this.el.slot.classList.toggle("story-no-items", storyMode);
    this.el.speed.textContent = Math.round(player.physics.speed * 3.6);
    this.el.lap.textContent = `${Math.min(player.lap, game.track.laps)} / ${game.track.laps}`;
    this.el.mode.textContent = storyMode ? "STORY" : game.mode.toUpperCase();
    this.el.storyHud.classList.toggle("active", storyMode && Boolean(game.currentStoryChapter));
    if (game.currentStoryChapter) {
      const timing = game.storyTiming;
      const f1 = player.storyF1;
      const f1Text = storyMode && f1
        ? ` · ${f1.compound} ${Math.round(f1.tireWear)}% · DRS ${f1.drs > 0 ? "ON" : "OFF"} · PIT ${f1.pitComplete ? "OK" : "REQ"} · PEN ${f1.penalty}s`
        : "";
      this.el.storyHudTitle.textContent = game.currentStoryChapter.title;
      this.el.storyHudGoal.textContent = storyMode && timing
        ? `${game.currentStoryChapter.sessionLabel || "세션"} · ${describeGoal(game.currentStoryChapter.goal)} · S${timing.currentSectorNumber || 1} ${formatUiTime(timing.currentLapTime)} · ${timing.bestLap ? `델타 ${formatUiDelta(timing.bestLap - timing.targetLapTime)}` : `타깃 ${formatUiTime(timing.targetLapTime)}`} · ${timing.brakeHint}${f1Text}`
        : describeGoal(game.currentStoryChapter.goal);
    }
    this.el.rank.textContent = ordinal(game.rankings.indexOf(player) + 1);
    this.el.boost.style.width = `${Math.min(100, player.physics.boostTime * 38 + player.physics.drift.time * 18)}%`;
    this.el.ink.classList.toggle("active", (player.ink || 0) > 0);
    if (player.ink) player.ink -= dt;
    this.drawMinimap(game);
  }

  fps(value) {
    this.el.fps.textContent = `${Math.round(value)} FPS`;
  }

  drawMinimap(game) {
    const c = this.el.mini;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = 4;
    for (let i = 0; i < game.track.points.length; i++) {
      const p = game.track.points[i];
      const n = game.track.points[(i + 1) % game.track.points.length];
      const zone = game.track.zoneAt(i);
      ctx.strokeStyle = `#${zone.color.toString(16).padStart(6, "0")}`;
      ctx.beginPath();
      ctx.moveTo(p.x * .46 + 80, p.z * .46 + 80);
      ctx.lineTo(n.x * .46 + 80, n.z * .46 + 80);
      ctx.stroke();
    }
    for (const r of game.racers) {
      if (r.eliminated) continue;
      ctx.fillStyle = r.isPlayer ? "#ffe15b" : "#ff6c6c";
      ctx.beginPath();
      ctx.arc(r.physics.position.x * .46 + 80, r.physics.position.z * .46 + 80, r.isPlayer ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  showResults(game, title = "결과", message = "") {
    this.el.resultTitle.textContent = title;
    this.el.resultStory.textContent = message;
    this.el.resultStory.style.display = message ? "block" : "none";
    this.el.storyResultActions.classList.remove("active");
    this.el.storyNext.style.display = "none";
    this.el.storyRetry.style.display = "none";
    this.el.resultList.innerHTML = "";
    game.rankings.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "result-row";
      row.innerHTML = `<strong>${ordinal(i + 1)} ${r.name}</strong><span>${r.finished ? r.finishTime.toFixed(1) + "s" : r.eliminated ? "탈락" : "진행 중"}</span>`;
      this.el.resultList.append(row);
    });
    this.el.nextRace.style.display = game.mode === "grandprix" ? "block" : "none";
    this.show("results");
  }

  showStoryResults(game, result) {
    const f1Text = result.f1 ? ` · 타이어 ${result.f1.tireWear}% · 피트 ${result.f1.pitStops}회 · 페널티 ${result.f1.penalty}s` : "";
    this.showResults(game, `${game.currentStoryChapter.title} 결과`, `${result.message}${f1Text}`);
    this.el.storyResultActions.classList.toggle("active", !result.success || Boolean(result.nextChapter || result.nextPart || result.nextSession));
    this.el.storyNext.style.display = result.success && (result.nextChapter || result.nextPart || result.nextSession) ? "block" : "none";
    this.el.storyNext.textContent = result.nextSession ? "다음 세션" : result.nextPart ? "다음 파트" : "다음 챕터";
    this.el.storyRetry.style.display = result.success ? "none" : "block";
    this.el.nextRace.style.display = "none";
  }

  loadSave() {
    const base = { coins: 0, best: {}, achievements: {}, unlocks: {}, settings: { volume: 65 } };
    try { return { ...base, ...JSON.parse(localStorage.getItem("turbo-circuit-save") || "{}") }; }
    catch { return base; }
  }

  storeSave(data = this.save) {
    this.save = { ...this.save, ...data };
    localStorage.setItem("turbo-circuit-save", JSON.stringify(this.save));
  }
}

function ordinal(n) {
  return n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;
}

function sceneLabel(scene) {
  return {
    garage: "차고 컷신",
    pit: "피트월",
    grid: "스타팅 그리드",
    teamRadio: "팀 라디오",
    podium: "포디움",
    pressRoom: "프레스룸"
  }[scene] || "컷신";
}

function formatUiTime(value) {
  if (!Number.isFinite(value)) return "--.--";
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  return minutes > 0 ? `${minutes}:${seconds.toFixed(2).padStart(5, "0")}` : `${seconds.toFixed(2)}s`;
}

function formatUiDelta(value) {
  if (!Number.isFinite(value)) return "--";
  const sign = value <= 0 ? "-" : "+";
  return `${sign}${Math.abs(value).toFixed(2)}s`;
}
