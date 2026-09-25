export const MODEL_SLOTS = {
  arenaGarage: "./assets/models/arena_garage.glb",
  arenaGrid: "./assets/models/arena_grid.glb",
  pitWall: "./assets/models/pit_wall.glb",
  heroKart: "./assets/models/hero_kart.glb",
  heroFormula: "./assets/models/hero_formula.glb",
  cpuFormulaA: "./assets/models/cpu_formula_a.glb",
  cpuFormulaB: "./assets/models/cpu_formula_b.glb",
  formulaAsterWorks: "./assets/models/formula_aster_works.glb",
  formulaVelaStorm: "./assets/models/formula_vela_storm.glb",
  formulaCrimsonApex: "./assets/models/formula_crimson_apex.glb",
  formulaNeonHarbor: "./assets/models/formula_neon_harbor.glb",
  formulaAuroraVector: "./assets/models/formula_aurora_vector.glb",
  driverRookie: "./assets/models/driver_rookie.glb"
};

export class AssetManager {
  constructor(THREE) {
    this.THREE = THREE;
    this.cache = new Map();
    this.loaderPromise = null;
  }

  async getLoader() {
    if (!this.loaderPromise) {
      this.loaderPromise = import("./assets/vendor/GLTFLoader.js")
        .then(module => new module.GLTFLoader())
        .catch(() => null);
    }
    return this.loaderPromise;
  }

  async loadModel(slot) {
    const url = MODEL_SLOTS[slot];
    if (!url) return null;
    if (this.cache.has(slot)) return this.cache.get(slot).clone(true);
    if (!(await this.modelAvailable(url))) return null;
    const loader = await this.getLoader();
    if (!loader) return null;
    try {
      const gltf = await loader.loadAsync(url);
      const model = gltf.scene;
      model.traverse(obj => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      this.cache.set(slot, model);
      return model.clone(true);
    } catch {
      return null;
    }
  }

  async modelAvailable(url) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  tagFallback(group, slot) {
    group.userData.modelSlot = slot;
    group.userData.usesProceduralFallback = true;
    return group;
  }
}
