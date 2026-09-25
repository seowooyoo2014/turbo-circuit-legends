export class EffectsSystem {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "race-effects";
    this.scene.add(this.group);
    this.smokePool = [];
    this.markPool = [];
    this.crowdGroup = null;
    this.time = 0;
    this.buildSmokePool();
    this.buildTireMarkPool();
  }

  dispose() {
    this.group?.traverse(obj => {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
      else obj.material?.dispose?.();
    });
    this.scene?.remove(this.group);
    this.group = null;
  }

  buildSmokePool() {
    const texture = makeSmokeTexture(this.THREE);
    for (let i = 0; i < 96; i++) {
      const material = new this.THREE.SpriteMaterial({
        map: texture,
        color: 0xcfd5d9,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const sprite = new this.THREE.Sprite(material);
      sprite.visible = false;
      sprite.userData.life = 0;
      sprite.userData.maxLife = 1;
      sprite.userData.vx = 0;
      sprite.userData.vy = 0;
      sprite.userData.vz = 0;
      this.group.add(sprite);
      this.smokePool.push(sprite);
    }
  }

  buildTireMarkPool() {
    const geo = new this.THREE.PlaneGeometry(.34, 2.2);
    for (let i = 0; i < 120; i++) {
      const material = new this.THREE.MeshBasicMaterial({
        color: 0x050607,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: this.THREE.DoubleSide
      });
      const mark = new this.THREE.Mesh(geo, material);
      mark.visible = false;
      mark.rotation.x = -Math.PI / 2;
      mark.userData.life = 0;
      mark.userData.maxLife = 6;
      this.group.add(mark);
      this.markPool.push(mark);
    }
  }

  buildArenaCrowd(track, chapter = null) {
    if (this.crowdGroup) {
      this.group.remove(this.crowdGroup);
      this.crowdGroup.traverse(obj => {
        obj.geometry?.dispose?.();
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
        else obj.material?.dispose?.();
      });
    }
    this.crowdGroup = null;
    if (!track.course.arena) return;

    const density = chapter?.id === 5 ? 1 : chapter?.id === 1 ? .42 : .72;
    const count = Math.floor(760 * density);
    const geo = new this.THREE.BoxGeometry(.38, .72, .24);
    const mat = new this.THREE.MeshStandardMaterial({ roughness: .74, metalness: .02 });
    const mesh = new this.THREE.InstancedMesh(geo, mat, count);
    mesh.name = "arena-crowd";
    mesh.instanceMatrix.setUsage(this.THREE.DynamicDrawUsage);
    const dummy = new this.THREE.Object3D();
    const colors = [0xf4d35e, 0xee6c4d, 0x3d5a80, 0x98c1d9, 0xe0fbfc, 0x8ac926, 0xff99c8, 0x2b2d42];
    for (let i = 0; i < count; i++) {
      const p = track.points[(i * 11 + 17) % track.points.length];
      const info = track.nearestInfo(p.x, p.z);
      const side = i % 2 ? 1 : -1;
      const row = Math.floor((i / 2) % 7);
      const offset = side * (track.width + 28 + row * 4.2 + Math.random() * 2.4);
      const along = (Math.random() - .5) * 8;
      const x = info.p.x + info.nx * offset + info.tx * along;
      const z = info.p.z + info.nz * offset + info.tz * along;
      const y = track.heightAt(x, z) + 3.2 + row * .9;
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, Math.atan2(info.tx, info.tz) + Math.PI / 2, 0);
      const scale = .75 + Math.random() * .45;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new this.THREE.Color(colors[i % colors.length]));
    }
    mesh.frustumCulled = true;

    const lightGeo = new this.THREE.BoxGeometry(5.5, .14, .22);
    const lightMat = new this.THREE.MeshStandardMaterial({ color: 0xdff7ff, emissive: 0x73d8ff, emissiveIntensity: chapter?.id === 5 ? 1.35 : .65 });
    const lights = new this.THREE.InstancedMesh(lightGeo, lightMat, 48);
    for (let i = 0; i < 48; i++) {
      const p = track.points[(i * 5 + 3) % track.points.length];
      const info = track.nearestInfo(p.x, p.z);
      const side = i % 2 ? 1 : -1;
      const x = p.x + info.nx * side * (track.width + 38);
      const z = p.z + info.nz * side * (track.width + 38);
      dummy.position.set(x, track.heightAt(x, z) + 8 + (i % 4) * .7, z);
      dummy.rotation.set(0, Math.atan2(info.tx, info.tz) + Math.PI / 2, 0);
      dummy.scale.setScalar(.9 + (i % 3) * .2);
      dummy.updateMatrix();
      lights.setMatrixAt(i, dummy.matrix);
    }
    lights.userData.baseIntensity = lightMat.emissiveIntensity;

    const group = new this.THREE.Group();
    group.name = "arena-crowd-group";
    group.add(mesh, lights);
    this.group.add(group);
    this.crowdGroup = group;
  }

  updateDriftSmoke(racer, info, track, dt) {
    if (!racer || !info || !track || !info.groundedStable) return;
    const physics = racer.physics;
    const intensity = info.driftIntensity || 0;
    if (intensity < .08 || physics.speed < 10) return;

    racer.effects.smoke = (racer.effects.smoke || 0) + dt * (12 + intensity * 32);
    const emitCount = Math.min(4, Math.floor(racer.effects.smoke));
    if (emitCount <= 0) return;
    racer.effects.smoke -= emitCount;

    const color = driftColor(physics.drift.charge);
    const forward = { x: Math.sin(physics.yaw), z: Math.cos(physics.yaw) };
    const right = { x: Math.cos(physics.yaw), z: -Math.sin(physics.yaw) };
    for (let i = 0; i < emitCount; i++) {
      const side = i % 2 ? 1 : -1;
      const x = physics.position.x - forward.x * 1.35 + right.x * side * 1.05;
      const z = physics.position.z - forward.z * 1.35 + right.z * side * 1.05;
      const y = track.heightAt(x, z) + .42;
      this.emitSmoke(x, y, z, color, right.x * side * .7 - forward.x * .4, .95, right.z * side * .7 - forward.z * .4, intensity);
      if (i < 2) this.emitTireMark(x, y, z, physics.yaw, intensity);
    }
  }

  emitSmoke(x, y, z, color, vx, vy, vz, intensity) {
    const sprite = this.smokePool.find(p => !p.visible) || this.smokePool[0];
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(.7 + intensity * .9);
    sprite.material.color.setHex(color);
    sprite.material.opacity = .32 + intensity * .26;
    sprite.visible = true;
    sprite.userData.life = .55 + intensity * .45;
    sprite.userData.maxLife = sprite.userData.life;
    sprite.userData.vx = vx + (Math.random() - .5) * .9;
    sprite.userData.vy = vy + Math.random() * .5;
    sprite.userData.vz = vz + (Math.random() - .5) * .9;
  }

  emitTireMark(x, y, z, yaw, intensity) {
    const mark = this.markPool.find(m => !m.visible) || this.markPool[0];
    mark.position.set(x, y + .025, z);
    mark.rotation.set(-Math.PI / 2, 0, -yaw);
    mark.scale.set(.7 + intensity * .5, 1.4 + intensity, 1);
    mark.material.opacity = .16 + intensity * .16;
    mark.visible = true;
    mark.userData.life = 5.5;
    mark.userData.maxLife = 5.5;
  }

  update(dt) {
    this.time += dt;
    for (const sprite of this.smokePool) {
      if (!sprite.visible) continue;
      sprite.userData.life -= dt;
      if (sprite.userData.life <= 0) {
        sprite.visible = false;
        continue;
      }
      sprite.position.x += sprite.userData.vx * dt;
      sprite.position.y += sprite.userData.vy * dt;
      sprite.position.z += sprite.userData.vz * dt;
      const t = sprite.userData.life / sprite.userData.maxLife;
      sprite.material.opacity = .52 * t;
      sprite.scale.multiplyScalar(1 + dt * .55);
    }
    for (const mark of this.markPool) {
      if (!mark.visible) continue;
      mark.userData.life -= dt;
      if (mark.userData.life <= 0) {
        mark.visible = false;
        continue;
      }
      mark.material.opacity = .24 * (mark.userData.life / mark.userData.maxLife);
    }
    const lights = this.crowdGroup?.children?.find(child => child.name !== "arena-crowd");
    if (lights?.material?.emissiveIntensity !== undefined) {
      const base = lights.userData.baseIntensity || .7;
      lights.material.emissiveIntensity = base + Math.sin(this.time * 3.4) * .12;
    }
  }
}

function driftColor(charge) {
  if (charge >= 3) return 0xbd74ff;
  if (charge === 2) return 0xff9f2f;
  if (charge === 1) return 0x55bfff;
  return 0xcfd5d9;
}

function makeSmokeTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(48, 48, 3, 48, 48, 46);
  g.addColorStop(0, "rgba(255,255,255,.9)");
  g.addColorStop(.42, "rgba(215,223,228,.55)");
  g.addColorStop(1, "rgba(180,190,196,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
