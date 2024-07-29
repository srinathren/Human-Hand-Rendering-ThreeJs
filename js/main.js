import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { VRButton } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/webxr/VRButton.js";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let object;
let controls;
let userTexture;
let currentMaterial;
let currentOpacity = 1;

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const textures = [
  textureLoader.load("models/dino/textures/Skull_baseColor.jpeg"),
  textureLoader.load("assets/dino_text.jpg"),
  textureLoader.load("assets/hand1.jpg"),
  textureLoader.load("assets/dino_text2.jpg"),
];

loader.load(
  `models/hand/Hand.gltf`,
  function (gltf) {
    object = gltf.scene;
    applyTexture(3);
    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error(error);
  }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Enable WebXR
document.getElementById("container3D").appendChild(renderer.domElement);
document.getElementById("vr-button").appendChild(VRButton.createButton(renderer)); // Add VR button
camera.position.z = 6;

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

function applyTexture(textureIndex) {
  if (object) {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (textureIndex < textures.length) {
          currentMaterial = new THREE.MeshStandardMaterial({
            map: textures[textureIndex],
            transparent: true,
            opacity: currentOpacity,
          });
        } else if (userTexture) {
          currentMaterial = new THREE.MeshStandardMaterial({
            map: userTexture,
            transparent: true,
            opacity: currentOpacity,
          });
        }
        child.material = currentMaterial;
      }
    });
  }
}

document.getElementById("texture1Btn").addEventListener("click", () => applyTexture(0));
document.getElementById("texture2Btn").addEventListener("click", () => applyTexture(1));
document.getElementById("texture3Btn").addEventListener("click", () => applyTexture(2));
document.getElementById("default").addEventListener("click", () => applyTexture(3));

document.getElementById("uploadTexture").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type === "image/jpeg") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        userTexture = new THREE.Texture(image);
        userTexture.needsUpdate = true;
        applyTexture();
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});
