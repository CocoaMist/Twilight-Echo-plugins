import * as THREE from "three";

/** Compare in GPU precision so settled double-precision springs do not upload
 * identical Float32 instance data every frame. */
export function writeMatrixIfChanged(
  target: Float32Array,
  offset: number,
  matrix: readonly number[],
): boolean {
  let changed = false;
  for (let i = 0; i < 16; i++) {
    const value = Math.fround(matrix[i]);
    if (target[offset + i] !== value) {
      target[offset + i] = value;
      changed = true;
    }
  }
  return changed;
}

/** Shadows depend on casters and lights, not on the viewing camera or AO/DOF.
 * Keep exact world transforms; animated casters invalidate on every change. */
export class ShadowCache {
  private states = new WeakMap<
    THREE.Object3D,
    { values: (number | string)[]; seen: number }
  >();
  private generation = 0;
  private count = -1;

  changed(scene: THREE.Scene): boolean {
    let dirty = false,
      count = 0;
    const generation = ++this.generation;
    scene.traverseVisible((object) => {
      const mesh = object as THREE.Mesh;
      const light = object as THREE.Light;
      if (!object.castShadow || (!mesh.isMesh && !light.isLight)) return;
      count++;
      object.updateWorldMatrix(true, false);
      let state = this.states.get(object);
      if (!state) {
        state = { values: [], seen: 0 };
        this.states.set(object, state);
      }
      if (state.seen !== generation - 1) dirty = true;
      state.seen = generation;
      let index = 0;
      const compare = (value: number | string) => {
        if (state.values[index] !== value) dirty = true;
        state.values[index++] = value;
      };
      object.matrixWorld.elements.forEach(compare);
      if (mesh.isMesh) {
        compare(mesh.geometry.id);
        const instance = mesh as THREE.InstancedMesh;
        compare(
          instance.isInstancedMesh ? instance.instanceMatrix.version : -1,
        );
        compare(instance.isInstancedMesh ? instance.count : 0);
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const material of materials) {
          compare(material.uuid);
          compare(material.version);
          compare(Number(material.visible));
          compare(material.opacity);
          compare(material.alphaTest);
        }
      } else {
        const directional = light as THREE.DirectionalLight;
        if (directional.target) {
          directional.target.updateWorldMatrix(true, false);
          directional.target.matrixWorld.elements.forEach(compare);
        }
      }
      if (state.values.length !== index) dirty = true;
      state.values.length = index;
    });
    if (count !== this.count) dirty = true;
    this.count = count;
    return dirty;
  }
}
