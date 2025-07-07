import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls, currentModel, meshParts = [];

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
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  animate();
}

function loadGLB(data) {
  const loader = new GLTFLoader();
  loader.parse(data, '', function (gltf) {
    clearModel();
    currentModel = gltf.scene;
    scene.add(currentModel);

    meshParts = [];
    currentModel.traverse(obj => {
      if (obj.isMesh) {
        meshParts.push(obj);
        obj.material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
      }
    });

    console.log("Mesh parts found:", meshParts.length);

    const box = new THREE.Box3().setFromObject(currentModel);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    currentModel.position.sub(center);
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

window.setColor = function(index, color) {
  if (meshParts[index]) {
    meshParts[index].material.color.set(color);
  } else {
    console.warn("Part", index, "not found.");
  }
};

window.setAll = function(color) {
  meshParts.forEach(mesh => {
    mesh.material.color.set(color);
  });
};
!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Viewer</title>
  <style>
    body { margin: 0; overflow: hidden; }
    #upload {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 10;
      background: white;
      padding: 10px;
      border-radius: 5px;
      font-family: sans-serif;
    }
  </style>
</head>
<body>
  <input type="file" id="upload" accept=".glb,.gltf" />
  <script type="module" src="viewer.js"></script>
</body>
</html>
