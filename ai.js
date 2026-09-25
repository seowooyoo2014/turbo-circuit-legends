import { clamp, wrapAngle, dist2 } from "./physics.js?v=20260722f1weekend";

export class AIController {
  constructor(racer, difficulty = "Normal") {
    this.racer = racer;
    this.aggression = { Easy: .35, Normal: .55, Hard: .75, Expert: .95 }[difficulty] ?? .55;
    this.reaction = { Easy: .55, Normal: .75, Hard: .95, Expert: 1.1 }[difficulty] ?? .75;
    this.itemTimer = 1 + Math.random() * 2;
    this.driftBias = Math.random() * .4;
  }

  update(track, racers, itemManager, dt) {
    const r = this.racer;
    const info = track.nearestInfo(r.physics.position.x, r.physics.position.z);
    const look = track.points[(info.index + 9 + Math.floor(this.aggression * 7)) % track.points.length];
    const avoid = this.avoidVector(racers);
    const targetX = look.x + avoid.x;
    const targetZ = look.z + avoid.z;
    const desired = Math.atan2(targetX - r.physics.position.x, targetZ - r.physics.position.z);
    const angle = wrapAngle(desired - r.physics.yaw);
    const inkPenalty = r.ink > 0 ? .55 : 1;
    const steer = clamp(angle * 2.3 * this.reaction * inkPenalty, -1, 1);
    const sharp = Math.abs(angle) > .32;
    const input = {
      throttle: 1,
      brake: sharp && r.physics.speed > 34 ? .28 : 0,
      steer,
      drift: sharp && r.physics.speed > 15 && Math.random() < .88 + this.driftBias
    };
    this.itemTimer -= dt;
    if ((r.item || r.trailingItem) && r.roulette <= 0 && this.itemTimer <= 0 && itemManager.shouldUseItem(r, racers)) {
      itemManager.useItem(r, racers);
      this.itemTimer = 1.1 + Math.random() * (2.4 - this.aggression);
    }
    return input;
  }

  avoidVector(racers) {
    const out = { x: 0, z: 0 };
    for (const other of racers) {
      if (other === this.racer || other.eliminated) continue;
      const d = dist2(this.racer.physics.position, other.physics.position);
      if (d > .1 && d < 50) {
        out.x += (this.racer.physics.position.x - other.physics.position.x) / d * 30;
        out.z += (this.racer.physics.position.z - other.physics.position.z) / d * 30;
      }
    }
    return out;
  }
}

export function makeAI(racers, difficulty) {
  return racers.slice(1).map(r => new AIController(r, difficulty));
}
