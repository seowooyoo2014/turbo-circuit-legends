import { clamp, dist2, wrapAngle } from "./physics.js?v=20260722f1weekend";
import { rankRacers } from "./player.js?v=20260722f1weekend";

export const ITEM_DEFS = [
  { id: "banana", name: "스핀 콘", icon: "SC", model: "cone", color: 0xffdf4f, cooldown: .35, charges: 1, defensive: true, canTrail: true, rarity: "common", weightByRank: [8, 5, 2], targetMode: "rear" },
  { id: "green", name: "직선 펄스", icon: "GP", model: "sphere", color: 0x37dd6f, cooldown: .55, charges: 1, defensive: false, canTrail: false, rarity: "common", weightByRank: [6, 5, 2], targetMode: "straight" },
  { id: "red", name: "추적 펄스", icon: "HP", model: "sphere", color: 0xff4d4d, cooldown: .75, charges: 1, defensive: false, canTrail: false, rarity: "rare", weightByRank: [2, 8, 6], targetMode: "nearestAhead" },
  { id: "blue", name: "오비탈 브레이커", icon: "OB", model: "sphere", color: 0x4ba6ff, cooldown: 1.35, charges: 1, defensive: false, canTrail: false, rarity: "epic", weightByRank: [0, 1, 4], targetMode: "leader", globalCooldown: 18 },
  { id: "bomb", name: "코어 폭탄", icon: "CB", model: "bomb", color: 0x20232d, cooldown: .95, charges: 1, defensive: true, canTrail: true, rarity: "rare", weightByRank: [2, 5, 3], targetMode: "rear" },
  { id: "mushroom", name: "터보 캡슐", icon: "TC", model: "mushroom", color: 0xff4c4c, cooldown: .35, charges: 1, defensive: false, canTrail: false, rarity: "common", weightByRank: [2, 6, 8], targetMode: "self" },
  { id: "goldMushroom", name: "오버드라이브", icon: "OD", model: "mushroom", color: 0xffc928, cooldown: .22, charges: 6, duration: 6, defensive: false, canTrail: false, rarity: "epic", weightByRank: [0, 1, 5], targetMode: "self", globalCooldown: 12 },
  { id: "star", name: "프리즘 코어", icon: "PC", model: "star", color: 0xfff15f, cooldown: 1, charges: 1, defensive: false, canTrail: false, rarity: "epic", weightByRank: [0, 1, 4], targetMode: "self", globalCooldown: 14 },
  { id: "lightning", name: "그리드 쇼크", icon: "GS", model: "bolt", color: 0xaee9ff, cooldown: 1.5, charges: 1, defensive: false, canTrail: false, rarity: "epic", weightByRank: [0, 1, 3], targetMode: "all", globalCooldown: 18 },
  { id: "ink", name: "블라인드 잼", icon: "BJ", model: "blob", color: 0x08090b, cooldown: 1.1, charges: 1, defensive: false, canTrail: false, rarity: "rare", weightByRank: [1, 4, 5], targetMode: "ahead" },
  { id: "boomerang", name: "리턴 링", icon: "RR", model: "ring", color: 0xff9f42, cooldown: .55, charges: 3, defensive: false, canTrail: false, rarity: "rare", weightByRank: [2, 5, 4], targetMode: "boomerang" },
  { id: "fireball", name: "플레어 버스트", icon: "FB", model: "sphere", color: 0xff5f26, cooldown: .32, charges: 3, defensive: false, canTrail: false, rarity: "common", weightByRank: [3, 5, 3], targetMode: "straight" },
  { id: "coin", name: "에너지 코인", icon: "EC", model: "coin", color: 0xffd84a, cooldown: .2, charges: 1, defensive: false, canTrail: false, rarity: "common", weightByRank: [7, 3, 1], targetMode: "self" },
  { id: "horn", name: "소닉 노바", icon: "SN", model: "horn", color: 0x8df0ff, cooldown: 1.1, charges: 1, defensive: true, canTrail: false, rarity: "rare", weightByRank: [3, 3, 2], targetMode: "radius" },
  { id: "feather", name: "에어 리프트", icon: "AL", model: "feather", color: 0xeef8ff, cooldown: .5, charges: 1, defensive: false, canTrail: false, rarity: "rare", weightByRank: [1, 3, 4], targetMode: "self" },
  { id: "pulseMine", name: "펄스 마인", icon: "PM", model: "mine", color: 0x79f2ff, cooldown: .7, charges: 1, defensive: true, canTrail: false, rarity: "rare", weightByRank: [2, 5, 4], targetMode: "rear" },
  { id: "aegis", name: "이지스 필드", icon: "AF", model: "shield", color: 0x8df0ff, cooldown: .5, charges: 1, defensive: true, canTrail: false, rarity: "rare", weightByRank: [4, 4, 3], targetMode: "self" },
  { id: "orbitDrone", name: "오비트 드론", icon: "OD", model: "drone", color: 0xc887ff, cooldown: 1.05, charges: 1, defensive: false, canTrail: false, rarity: "rare", weightByRank: [1, 4, 5], targetMode: "nearestAhead" },
  { id: "oilSlick", name: "슬립 젤", icon: "SG", model: "slick", color: 0x15191f, cooldown: .65, charges: 1, defensive: true, canTrail: false, rarity: "common", weightByRank: [5, 5, 2], targetMode: "rear" }
];

const DEF_BY_ID = Object.fromEntries(ITEM_DEFS.map(item => [item.id, item]));

export function itemDef(id) {
  return DEF_BY_ID[id] || null;
}

export class ItemManager {
  constructor(THREE, scene, audio, track) {
    this.THREE = THREE;
    this.scene = scene;
    this.audio = audio;
    this.track = track;
    this.projectiles = [];
    this.hazards = [];
    this.effects = [];
    this.combatEvents = [];
    this.globalCooldowns = new Map();
  }

  pushEvent(type, payload = {}) {
    const event = { type, time: performance.now(), ...payload };
    this.combatEvents.push(event);
    if (this.combatEvents.length > 12) this.combatEvents.shift();
    return event;
  }

  consumeEvents() {
    const events = this.combatEvents;
    this.combatEvents = [];
    return events;
  }

  randomItem(rank, total, racer = null, racers = [], mode = "item") {
    const tier = rank <= Math.max(1, total * .28) ? 0 : rank <= Math.max(2, total * .65) ? 1 : 2;
    const leader = rankRacers(racers).find(r => !r.eliminated);
    const gap = racer && leader && racer !== leader ? Math.max(0, (leader.raceDistance || 0) - (racer.raceDistance || 0)) : 0;
    const candidates = ITEM_DEFS.flatMap(item => {
      if (item.globalCooldown && (this.globalCooldowns.get(item.id) || 0) > 0) return [];
      let weight = item.weightByRank[tier] || 0;
      if (racer?.recentHit > 0 && item.defensive) weight += 2;
      if (gap > 140 && ["mushroom", "goldMushroom", "star", "lightning", "orbitDrone"].includes(item.id)) weight += 2;
      if (rank === 1 && ["blue", "lightning", "goldMushroom", "orbitDrone"].includes(item.id)) weight = 0;
      if (mode === "grandprix" && item.rarity === "epic") weight = Math.max(0, weight - 1);
      return Array.from({ length: weight }, () => item.id);
    });
    return candidates[Math.floor(Math.random() * candidates.length)] || "coin";
  }

  rouletteCandidates(rank, total, racer = null, racers = [], mode = "item") {
    return Array.from({ length: 8 }, () => this.randomItem(rank, total, racer, racers, mode));
  }

  checkItemBoxes(racer, rank, total, racers = [], mode = "item") {
    if (racer.item || racer.roulette > 0) return;
    for (const box of this.track.itemBoxes) {
      if (box.active && dist2(racer.physics.position, box) < 18) {
        box.active = false;
        box.timer = 5;
        if (box.mesh) box.mesh.visible = false;
        const candidates = this.rouletteCandidates(rank, total, racer, racers, mode);
        const id = candidates[candidates.length - 1];
        racer.giveItem(id, DEF_BY_ID[id], candidates);
        this.pushEvent("pickup", { racer, item: DEF_BY_ID[id] });
        this.audio.play("item");
        break;
      }
    }
  }

  shouldUseItem(racer, racers) {
    if (racer.trailingItem) return this.nearThreat(racer) || this.rankOf(racer, racers) > racers.length * .55;
    const item = DEF_BY_ID[racer.item];
    if (!item || racer.roulette > 0 || racer.cooldown > 0) return false;
    const rank = this.rankOf(racer, racers);
    if (this.nearThreat(racer) && ["horn", "aegis"].includes(item.id)) return true;
    if (item.defensive && rank <= Math.max(2, racers.length * .35)) return false;
    if (["red", "blue", "ink", "orbitDrone"].includes(item.id)) return this.hasTargetAhead(racer, racers);
    if (["mushroom", "goldMushroom", "star", "feather", "aegis"].includes(item.id)) return rank > 2 || racer.physics.speed < 25 || this.nearThreat(racer);
    return rank > racers.length * .35 || Math.random() < .35;
  }

  useItem(racer, racers) {
    if (racer.trailingItem) {
      this.deployTrailing(racer);
      this.audio.play("banana");
      this.pushEvent("deploy", { racer, item: DEF_BY_ID.banana });
      return;
    }
    if (!racer.item || racer.cooldown > 0 || racer.roulette > 0) return;
    const item = DEF_BY_ID[racer.item];
    if (!item) return;
    if ((racer.itemCharges || 0) <= 0) return;
    racer.cooldown = item.cooldown;
    if (item.canTrail) {
      this.createTrailing(racer, item);
      this.consumeCharge(racer);
      this.audio.play(item.id);
      this.pushEvent("arm", { racer, item });
      return;
    }
    const actions = {
      green: () => this.fireProjectile(racer, item, "straight", "spin", racers),
      red: () => this.fireProjectile(racer, item, "nearestAhead", "spin", racers),
      blue: () => this.fireProjectile(racer, item, "leader", "blast", racers),
      mushroom: () => racer.physics.addBoost(1.15, 1.3, "item", 2),
      goldMushroom: () => { racer.physics.addBoost(.95, 1.35, "item", 2); racer.itemTimer = Math.max(racer.itemTimer, item.duration); },
      star: () => { racer.physics.invincible = 7; racer.physics.addBoost(7, .75, "item", 3); },
      lightning: () => racers.forEach(r => { if (r !== racer && r.physics.invincible <= 0) r.hit("shrink"); }),
      ink: () => racers.forEach(r => { if (r !== racer && r.progress >= racer.progress && r.physics.invincible <= 0) r.hit("ink"); }),
      boomerang: () => this.fireProjectile(racer, item, "boomerang", "spin", racers),
      fireball: () => this.fireProjectile(racer, item, "straight", "blast", racers),
      coin: () => { racer.physics.coins = clamp(racer.physics.coins + 2, 0, 10); racer.physics.addBoost(.32, .45, "coin", 1); },
      horn: () => this.shockwave(racer, racers),
      feather: () => racer.physics.jump(24),
      pulseMine: () => this.dropHazard(racer, "blast", item, 1.35, { armedDelay: .45, pulse: true }),
      aegis: () => { racer.shield = Math.max(racer.shield || 0, 6); },
      orbitDrone: () => this.fireProjectile(racer, item, "nearestAhead", "stun", racers),
      oilSlick: () => this.dropHazard(racer, "slow", item, 1.55, { slick: true })
    };
    actions[item.id]?.();
    if (item.globalCooldown) this.globalCooldowns.set(item.id, item.globalCooldown);
    this.consumeCharge(racer);
    this.audio.play(item.id);
    this.pushEvent("use", { racer, item });
  }

  consumeCharge(racer) {
    racer.itemCharges = Math.max(0, (racer.itemCharges || 1) - 1);
    const item = DEF_BY_ID[racer.item];
    if (racer.itemCharges <= 0) {
      if (item?.duration && racer.itemTimer > 0) return;
      racer.item = null;
      racer.itemTimer = 0;
    }
  }

  createTrailing(racer, item) {
    const mesh = this.makeItemMesh(item);
    this.scene.add(mesh);
    racer.trailingItem = { item, mesh, radius: item.id === "bomb" ? 5.8 : 2.5, life: item.id === "bomb" ? 16 : 22 };
    this.updateTrailingMesh(racer);
  }

  deployTrailing(racer) {
    const trailing = racer.trailingItem;
    if (!trailing) return;
    racer.trailingItem = null;
    this.hazards.push({
      mesh: trailing.mesh,
      hitType: trailing.item.id === "bomb" ? "blast" : "spin",
      owner: racer,
      life: trailing.item.id === "bomb" ? 14 : 20,
      radius: trailing.radius,
      explosive: trailing.item.id === "bomb"
    });
  }

  dropHazard(racer, hitType, item, scale = 1, extra = {}) {
    const yaw = racer.physics.yaw;
    const mesh = this.makeItemMesh(item);
    mesh.position.set(racer.physics.position.x - Math.sin(yaw) * 3, racer.physics.position.y + .2, racer.physics.position.z - Math.cos(yaw) * 3);
    mesh.scale.setScalar(scale);
    this.scene.add(mesh);
    this.hazards.push({ mesh, hitType, owner: racer, life: 20, radius: 2.3 * scale, explosive: hitType === "blast", armedDelay: 0, ...extra });
  }

  fireProjectile(racer, item, mode, hitType, racers = []) {
    const mesh = this.makeItemMesh(item);
    mesh.position.copy(racer.mesh.position);
    mesh.position.y += 1;
    this.scene.add(mesh);
    const target = this.pickTarget(racer, racers, mode);
    const speed = mode === "leader" ? 74 : mode === "nearestAhead" ? 62 : 58;
    this.projectiles.push({
      mesh,
      owner: racer,
      item,
      mode,
      target,
      hitType,
      yaw: racer.physics.yaw,
      speed,
      life: mode === "boomerang" ? 2.4 : mode === "leader" ? 8 : 5.5,
      age: 0,
      bounces: mode === "straight" ? 2 : 0,
      radius: mode === "leader" ? 4.4 : 2.7,
      warningTime: mode === "leader" ? 1.2 : mode === "nearestAhead" ? .55 : 0,
      counterable: true
    });
  }

  pickTarget(racer, racers, mode) {
    const active = rankRacers(racers).filter(r => r !== racer && !r.eliminated);
    if (mode === "leader") return active[0] || null;
    if (mode === "nearestAhead") {
      return active.filter(r => r.progress >= racer.progress)
        .sort((a, b) => dist2(a.physics.position, racer.physics.position) - dist2(b.physics.position, racer.physics.position))[0] || null;
    }
    return null;
  }

  shockwave(racer, racers) {
    this.spawnRing(racer.physics.position, 0x9df8ff, 28);
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (dist2(p.mesh.position, racer.physics.position) < 900) this.removeProjectile(i, p.item.color);
    }
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (dist2(h.mesh.position, racer.physics.position) < 625) this.removeHazard(i);
    }
    for (const r of racers) {
      if (r !== racer && dist2(r.physics.position, racer.physics.position) < 625) r.hit("blast");
    }
  }

  update(racers, dt) {
    this.track.updateItems(dt);
    for (const [id, time] of this.globalCooldowns) this.globalCooldowns.set(id, Math.max(0, time - dt));
    for (const box of this.track.itemBoxes) {
      if (box.mesh) {
        box.mesh.visible = box.active;
        box.mesh.rotation.y += dt * 2.7;
        box.mesh.position.y = box.y + Math.sin(performance.now() * .003 + box.x) * .25;
      }
    }
    for (const racer of racers) {
      if (racer.trailingItem) {
        racer.trailingItem.life -= dt;
        if (racer.trailingItem.life <= 0 || racer.eliminated) this.deployTrailing(racer);
        else this.updateTrailingMesh(racer);
      }
      if (racer.physics.invincible > 0) this.starContact(racer, racers);
    }
    this.updateProjectiles(racers, dt);
    this.updateHazards(racers, dt);
    this.updateEffects(dt);
  }

  updateTrailingMesh(racer) {
    const yaw = racer.physics.yaw;
    const t = racer.trailingItem;
    if (!t) return;
    t.mesh.position.set(
      racer.physics.position.x - Math.sin(yaw) * 3.6,
      racer.physics.position.y + .45,
      racer.physics.position.z - Math.cos(yaw) * 3.6
    );
    t.mesh.rotation.y += .08;
  }

  updateProjectiles(racers, dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      p.life -= dt;
      if (p.target && !p.target.eliminated) {
        const dx = p.target.physics.position.x - p.mesh.position.x;
        const dz = p.target.physics.position.z - p.mesh.position.z;
        const desired = Math.atan2(dx, dz);
        const turn = p.mode === "leader" ? 4.5 : 3.4;
        p.yaw += wrapAngle(desired - p.yaw) * dt * turn;
      }
      if (p.mode === "boomerang" && p.age > 1.05) {
        const dx = p.owner.physics.position.x - p.mesh.position.x;
        const dz = p.owner.physics.position.z - p.mesh.position.z;
        p.yaw = Math.atan2(dx, dz);
      }
      p.mesh.position.x += Math.sin(p.yaw) * p.speed * dt;
      p.mesh.position.z += Math.cos(p.yaw) * p.speed * dt;
      p.mesh.position.y = this.track.heightAt(p.mesh.position.x, p.mesh.position.z) + 1.2 + (p.mode === "leader" ? 2.6 : 0);
      p.mesh.rotation.y += dt * 8;
      let gone = p.life <= 0;
      const terrain = this.track.sample(p.mesh.position.x, p.mesh.position.z);
      if (p.mode === "straight" && Math.abs(terrain.lateral) > this.track.width + 4 && p.bounces > 0) {
        p.yaw += Math.PI * (.78 + Math.random() * .18);
        p.bounces--;
      } else if (Math.abs(terrain.lateral) > this.track.width + 12) {
        gone = true;
      }
      if (!gone && this.absorbWithDefense(p, racers)) gone = true;
      if (!gone) gone = this.hitProjectileTarget(p, racers);
      if (gone) this.removeProjectile(i, p.item.color);
    }
  }

  absorbWithDefense(projectile, racers) {
    for (const r of racers) {
      const trailing = r.trailingItem;
      if (!trailing || r === projectile.owner || r.eliminated) continue;
      if (dist2(trailing.mesh.position, projectile.mesh.position) < 16) {
        this.spawnRing(trailing.mesh.position, trailing.item.color);
        this.scene.remove(trailing.mesh);
        r.trailingItem = null;
        this.pushEvent("block", { racer: r, item: trailing.item });
        return true;
      }
    }
    return false;
  }

  hitProjectileTarget(p, racers) {
    for (const r of racers) {
      if (r === p.owner || r.eliminated) continue;
      if (dist2(r.physics.position, p.mesh.position) < p.radius * p.radius) {
        if (p.mode === "leader") {
          this.areaBlast(p.mesh.position, racers, p.owner, 13, "blast");
        } else {
          const hit = r.hit(p.hitType);
          this.pushEvent(hit ? "hit" : "block", { racer: r, attacker: p.owner, item: p.item, hitType: p.hitType });
        }
        this.spawnRing(p.mesh.position, p.item.color);
        return true;
      }
    }
    return false;
  }

  updateHazards(racers, dt) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.life -= dt;
      h.armedDelay = Math.max(0, (h.armedDelay || 0) - dt);
      h.mesh.rotation.y += dt;
      if (h.pulse) h.mesh.scale.setScalar(1.15 + Math.sin(performance.now() * .012) * .1);
      if (h.slick) h.mesh.material.opacity = .52 + Math.sin(performance.now() * .006) * .08;
      let gone = h.life <= 0;
      for (const r of racers) {
        if (h.armedDelay > 0) continue;
        if (r !== h.owner && !r.eliminated && dist2(r.physics.position, h.mesh.position) < h.radius * h.radius) {
          if (h.explosive) this.areaBlast(h.mesh.position, racers, h.owner, 11, h.hitType);
          else {
            const hit = r.hit(h.hitType);
            this.pushEvent(hit ? "hit" : "block", { racer: r, attacker: h.owner, item: h.item, hitType: h.hitType });
          }
          this.spawnRing(h.mesh.position, 0xff7d45);
          gone = true;
        }
      }
      if (gone) this.removeHazard(i);
    }
  }

  updateEffects(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= dt;
      e.mesh.scale.addScalar(dt * e.grow);
      e.mesh.material.opacity = Math.max(0, e.life);
      if (e.life <= 0) {
        this.scene.remove(e.mesh);
        this.effects.splice(i, 1);
      }
    }
  }

  areaBlast(position, racers, owner, radius, hitType) {
    for (const r of racers) {
      if (r === owner || r.eliminated) continue;
      if (dist2(r.physics.position, position) < radius * radius) {
        const hit = r.hit(hitType);
        this.pushEvent(hit ? "hit" : "block", { racer: r, attacker: owner, hitType });
      }
    }
  }

  starContact(racer, racers) {
    for (const other of racers) {
      if (other === racer || other.eliminated || other.physics.invincible > 0) continue;
      if (dist2(other.physics.position, racer.physics.position) < 14) other.hit("spin");
    }
  }

  removeProjectile(index, color) {
    const p = this.projectiles[index];
    if (!p) return;
    this.spawnRing(p.mesh.position, color, 16);
    this.scene.remove(p.mesh);
    this.projectiles.splice(index, 1);
  }

  removeHazard(index) {
    const h = this.hazards[index];
    if (!h) return;
    this.scene.remove(h.mesh);
    this.hazards.splice(index, 1);
  }

  rankOf(racer, racers) {
    return rankRacers(racers).indexOf(racer) + 1;
  }

  hasTargetAhead(racer, racers) {
    return racers.some(r => r !== racer && !r.eliminated && r.progress >= racer.progress);
  }

  nearThreat(racer) {
    return this.projectiles.some(p => p.owner !== racer && dist2(p.mesh.position, racer.physics.position) < 625);
  }

  makeItemMesh(item) {
    const T = this.THREE;
    const mat = new T.MeshStandardMaterial({ color: item.color, emissive: item.color, emissiveIntensity: .18, roughness: .4, metalness: .12, transparent: item.model === "slick", opacity: item.model === "slick" ? .55 : 1 });
    const shapes = {
      cone: () => new T.ConeGeometry(.8, 1.8, 18),
      sphere: () => new T.SphereGeometry(.75, 18, 14),
      bomb: () => new T.SphereGeometry(.9, 18, 14),
      mushroom: () => new T.SphereGeometry(.85, 16, 10),
      star: () => new T.TetrahedronGeometry(1),
      bolt: () => new T.ConeGeometry(.65, 2.2, 5),
      blob: () => new T.SphereGeometry(.9, 10, 8),
      ring: () => new T.TorusGeometry(.75, .18, 8, 20),
      coin: () => new T.CylinderGeometry(.85, .85, .18, 24),
      horn: () => new T.ConeGeometry(.75, 1.6, 18),
      feather: () => new T.BoxGeometry(.35, 1.35, .08),
      mine: () => new T.CylinderGeometry(.95, .95, .34, 20),
      shield: () => new T.IcosahedronGeometry(.95, 1),
      drone: () => new T.OctahedronGeometry(.9),
      slick: () => new T.CylinderGeometry(1.2, 1.8, .08, 28)
    };
    const mesh = new T.Mesh((shapes[item.model] || shapes.sphere)(), mat);
    mesh.castShadow = true;
    return mesh;
  }

  spawnRing(position, color, grow = 18) {
    const T = this.THREE;
    const mesh = new T.Mesh(new T.TorusGeometry(1, .08, 8, 32), new T.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
    mesh.position.set(position.x, position.y + 1, position.z);
    mesh.rotation.x = Math.PI / 2;
    this.scene.add(mesh);
    this.effects.push({ mesh, life: .85, grow });
  }
}
