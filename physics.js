export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
export const wrapAngle = a => Math.atan2(Math.sin(a), Math.cos(a));
export const dist2 = (a, b) => {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
};

export class VehiclePhysics {
  constructor(tuning = {}) {
    this.position = { x: 0, y: 2, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.speed = 0;
    this.onGround = true;
    this.suspensionCompression = 0;
    this.groundedStable = true;
    this.drift = { active: false, state: "idle", time: 0, dir: 0, charge: 0, release: 0, hop: 0, cooldown: 0 };
    this.boostTime = 0;
    this.boostState = { source: "none", time: 0, duration: 0, power: 1, handling: 1, visualTier: 0 };
    this.invincible = 0;
    this.stun = 0;
    this.shrinkTime = 0;
    this.coins = 0;
    this.recovery = 0;
    this.tuning = {
      accel: 38,
      brake: 45,
      maxSpeed: 42,
      reverse: 13,
      grip: 10,
      turn: 2.55,
      airControl: .45,
      mass: 1,
      handling: 1,
      drift: 1,
      miniTurbo: 1,
      offroad: 1,
      boost: 1,
      weight: 1,
      ...tuning
    };
  }

  addBoost(duration, strength = 1, source = "boost", visualTier = 1) {
    const time = duration * strength;
    this.boostTime = Math.max(this.boostTime, time);
    if (time >= this.boostState.time || this.boostState.time <= 0) {
      this.boostState = {
        source,
        time,
        duration: time,
        power: clamp(strength * (this.tuning.boost || 1), .25, 2.4),
        handling: source === "miniTurbo" ? 1.08 : source === "pad" ? .96 : 1,
        visualTier
      };
    }
  }

  jump(power = 15) {
    if (this.onGround) {
      this.velocity.y = Math.max(this.velocity.y, power);
      this.onGround = false;
      this.addBoost(.35, .55, "jump", 1);
    }
  }

  respawn(point) {
    this.position.x = point.x;
    this.position.y = point.y + 2;
    this.position.z = point.z;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
    this.yaw = point.yaw;
    this.speed = 0;
    this.stun = 0;
    this.recovery = 0;
    this.drift = { active: false, state: "idle", time: 0, dir: 0, charge: 0, release: 0, hop: 0, cooldown: 0 };
  }

  update(input, track, dt) {
    const wasGrounded = this.onGround;
    const terrain = track.sample(this.position.x, this.position.z);
    const gravity = terrain.surface === "lowgrav" ? -23 : -34;
    const forward = { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
    const right = { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
    const fwdSpeed = this.velocity.x * forward.x + this.velocity.z * forward.z;
    const sideSpeed = this.velocity.x * right.x + this.velocity.z * right.z;
    const slip = Math.abs(sideSpeed);
    const boostFactor = this.boostTime > 0 ? 1.18 + this.boostState.power * .2 : 1;
    const starFactor = this.invincible > 0 ? 1.18 : 1;
    const surface = surfaceProfile(terrain.surface, this.tuning);
    const offroad = terrain.surface === "offroad" ? (this.invincible > 0 ? .94 : surface.speed) : 1;
    const shrinkFactor = this.shrinkTime > 0 ? .72 : 1;
    const maxSpeed = this.tuning.maxSpeed * boostFactor * starFactor * offroad * shrinkFactor + this.coins * .22;
    const control = this.onGround ? 1 : this.tuning.airControl;
    const events = [];

    if (this.stun > 0) {
      this.stun -= dt;
      input = { throttle: 0, brake: 0, steer: 0, drift: false };
    }
    this.recovery = Math.max(0, this.recovery - dt);
    this.drift.cooldown = Math.max(0, this.drift.cooldown - dt);
    this.drift.release = Math.max(0, this.drift.release - dt);
    this.drift.hop = Math.max(0, this.drift.hop - dt);

    const throttleAccel = input.throttle > 0 ? this.tuning.accel * shrinkFactor : 0;
    const brakeAccel = input.brake > 0 ? this.tuning.brake : 0;
    let targetFwd = fwdSpeed;
    const accelCurve = 1 - clamp(Math.max(0, fwdSpeed) / Math.max(1, maxSpeed), 0, .92) * .42;
    targetFwd += throttleAccel * input.throttle * accelCurve * dt;
    targetFwd -= brakeAccel * input.brake * Math.sign(Math.max(.1, fwdSpeed)) * dt;
    if (input.throttle < 0) targetFwd -= this.tuning.brake * dt;
    targetFwd = clamp(targetFwd, -this.tuning.reverse, maxSpeed);

    const driftStart = input.drift && Math.abs(fwdSpeed) > 12 && Math.abs(input.steer) > .15 && this.onGround && this.drift.cooldown <= 0;
    if (driftStart && !this.drift.active) {
      this.drift.active = true;
      this.drift.state = "entering";
      this.drift.dir = Math.sign(input.steer);
      this.drift.time = 0;
      this.drift.hop = .16;
      this.velocity.y = Math.max(this.velocity.y, 3.6);
      events.push({ type: "driftStart", strength: .45 });
    }
    if (!input.drift && this.drift.active) {
      const charge = this.drift.charge;
      this.drift.active = false;
      this.drift.state = "releasing";
      this.drift.time = 0;
      this.drift.charge = 0;
      this.drift.release = .22;
      this.drift.cooldown = .16;
      if (charge > 0) {
        this.addBoost([.55, 1.05, 1.65][charge - 1] * (this.tuning.miniTurbo || 1), 1, "miniTurbo", charge);
        events.push({ type: "miniTurbo", tier: charge, strength: charge / 3 });
      }
    }
    if (this.drift.active) {
      this.drift.time += dt;
      this.drift.state = this.drift.hop > 0 ? "entering" : "holding";
      const turboTune = this.tuning.miniTurbo || 1;
      this.drift.charge = this.drift.time > 2.6 / turboTune ? 3 : this.drift.time > 1.55 / turboTune ? 2 : this.drift.time > .75 / turboTune ? 1 : 0;
    }
    if (!this.drift.active && this.drift.release <= 0) this.drift.state = this.drift.cooldown > 0 ? "cooldown" : "idle";

    const steer = clamp(input.steer, -1, 1);
    const counterSteer = this.drift.active && Math.sign(steer || this.drift.dir) !== this.drift.dir ? .74 : 1;
    const turnBoost = this.drift.active ? 1.32 + .22 * (this.tuning.drift || 1) : 1;
    const recoveryPenalty = this.recovery > 0 ? .72 : 1;
    this.yaw += steer * this.tuning.turn * (this.tuning.handling || 1) * surface.turn * this.boostState.handling * control * turnBoost * counterSteer * recoveryPenalty * clamp(Math.abs(fwdSpeed) / 18, .25, 1.25) * dt;

    const grip = (this.drift.active ? this.tuning.grip * .28 / (this.tuning.drift || 1) : this.tuning.grip) * surface.grip;
    const driftSlip = this.drift.active ? this.drift.dir * surface.slip * (7.4 + (this.tuning.drift || 1) * 1.6) : 0;
    const newSide = lerp(sideSpeed, this.drift.active ? sideSpeed * .73 + driftSlip : 0, grip * dt);
    const friction = this.onGround ? surface.drag : .998;
    targetFwd *= friction;

    this.velocity.x = forward.x * targetFwd + right.x * newSide;
    this.velocity.z = forward.z * targetFwd + right.z * newSide;
    this.velocity.y += gravity * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;

    const next = track.sample(this.position.x, this.position.z);
    const rideHeight = .62;
    const targetGroundY = next.height + rideHeight;
    const groundError = targetGroundY - this.position.y;
    this.groundedStable = false;
    if (this.position.y <= targetGroundY + .34 && this.velocity.y <= 4.5) {
      const falling = !wasGrounded && this.velocity.y < -12;
      const snap = this.onGround ? 18 : 10;
      this.position.y = lerp(this.position.y, targetGroundY, dt * snap);
      if (Math.abs(this.position.y - targetGroundY) < .035) this.position.y = targetGroundY;
      this.velocity.y = this.velocity.y < 0 ? 0 : this.velocity.y * .18;
      this.onGround = true;
      this.groundedStable = Math.abs(this.position.y - targetGroundY) < .09;
      this.suspensionCompression = clamp(.5 + groundError * 1.7 - this.velocity.y * .02, 0, 1);
      if (falling) {
        this.addBoost(.28, .7, "landing", 1);
        this.recovery = .18;
        events.push({ type: "landing", strength: clamp(Math.abs(this.velocity.y) / 26, .2, 1) });
      }
    } else {
      this.onGround = false;
      this.suspensionCompression = lerp(this.suspensionCompression, 0, dt * 5);
    }

    let impact = null;
    const wall = track.resolveWalls(this.position);
    if (wall.hit && this.invincible <= 0) {
      const dot = this.velocity.x * wall.nx + this.velocity.z * wall.nz;
      if (dot < 0) {
        this.velocity.x -= dot * 1.55 * wall.nx;
        this.velocity.z -= dot * 1.55 * wall.nz;
        this.velocity.x *= .52;
        this.velocity.z *= .52;
        this.stun = Math.max(this.stun, .16);
        this.recovery = Math.max(this.recovery, .2);
        impact = { type: "wall", strength: Math.min(1, Math.abs(dot) / 32) };
        events.push({ type: "impact", impact });
      }
    }

    const obstacle = track.resolveObstacles(this.position, 1.45);
    if (obstacle.hit && this.invincible <= 0) {
      const into = this.velocity.x * obstacle.nx + this.velocity.z * obstacle.nz;
      const speed = Math.hypot(this.velocity.x, this.velocity.z);
      if (into < 3 || speed > 8) {
        this.velocity.x = obstacle.nx * Math.max(2, speed * obstacle.bounce);
        this.velocity.z = obstacle.nz * Math.max(2, speed * obstacle.bounce);
        this.velocity.y = Math.max(this.velocity.y, 2.2);
        this.stun = Math.max(this.stun, .45 + obstacle.strength * .45);
        this.recovery = Math.max(this.recovery, .35);
        impact = { type: "obstacle", strength: Math.min(1, speed / 38), obstacle: obstacle.obstacle };
        events.push({ type: "impact", impact });
      }
    }

    if (this.position.y < -18) this.respawn(track.nearestSpawn(this.position));
    if (next.boost) this.addBoost(.9, next.boost, "pad", 2);
    if (next.jump) this.jump(18 + next.jump * 5);

    this.boostTime = Math.max(0, this.boostTime - dt);
    this.boostState.time = Math.max(0, this.boostState.time - dt);
    if (this.boostState.time <= 0) this.boostState = { source: "none", time: 0, duration: 0, power: 1, handling: 1, visualTier: 0 };
    this.invincible = Math.max(0, this.invincible - dt);
    this.shrinkTime = Math.max(0, this.shrinkTime - dt);
    this.speed = Math.hypot(this.velocity.x, this.velocity.z);
    const driftIntensity = this.drift.active
      ? clamp((slip / 13) + Math.abs(input.steer) * .28 + this.drift.time * .1, .12, 1)
      : clamp(slip / 22, 0, .65);
    const surfaceSmoothing = track.course?.id === "arena" ? .45 : 1;
    this.roll = lerp(this.roll, (-steer * .2 - newSide * .01) * surfaceSmoothing, dt * (track.course?.id === "arena" ? 5.5 : 7));
    this.pitch = lerp(this.pitch, this.onGround ? next.slope * .13 * surfaceSmoothing : -.06, dt * (track.course?.id === "arena" ? 4 : 5));
    return { wallHit: wall.hit, terrain: next, impact, slip, groundedStable: this.groundedStable, suspensionCompression: this.suspensionCompression, driftIntensity, boost: this.boostState, driftState: this.drift.state, events };
  }
}

function surfaceProfile(surface, tuning = {}) {
  const offroadTune = tuning.offroad || 1;
  const profiles = {
    road: { speed: 1, grip: 1, drag: .982, turn: 1, slip: 1 },
    offroad: { speed: clamp(.62 + offroadTune * .08, .62, .9), grip: clamp(.72 + offroadTune * .05, .72, .92), drag: .968, turn: .88, slip: 1.15 },
    ice: { speed: .94, grip: .48, drag: .993, turn: .78, slip: 1.55 },
    lowgrav: { speed: 1.04, grip: .72, drag: .989, turn: .88, slip: 1.25 }
  };
  return profiles[surface] || profiles.road;
}
