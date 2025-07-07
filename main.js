import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/RGBELoader.js';

let scene, camera, renderer, controls, currentModel;

init();

document.getElementById('upload').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.glb')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      loadGLB(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // HDRI LIGHTING 🌅
  new RGBELoader()
    .setPath('./') // <-- env.hdr should be here
    .load('env.hdr', function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    });

  animate();
}

function loadGLB(data) {
  const loader = new GLTFLoader();
  loader.parse(data, '', function (gltf) {
    clearModel();
    currentModel = gltf.scene;
    scene.add(currentModel);

    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    controls.reset();
    currentModel.position.sub(center); // Center it
    camera.position.set(0, 1, size * 1.5);
    controls.target.set(0, 0, 0);
    controls.update();
  });
}

function clearModel() {
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.changeColor = function (partName, colorHex) {
  if (!currentModel) return;
  const part = currentModel.getObjectByName(partName);
  if (part && part.material) {
    part.material.color.set(colorHex);
  } else {
    console.warn(`Part "${partName}" not found.`);
  }
}

