import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import character from "./assets/character.gltf";
import "./style.css";

let mixer;
let idleAction, idle2Action;

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

init();

const planeGeometry = new THREE.PlaneGeometry(15, 15); // Ajusta el tamaño según sea necesario
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee }); // Elige el color que prefieras
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rota el plano para que esté horizontal
plane.receiveShadow = true; // Importante para que reciba sombras
scene.add(plane);

function init() {
  loadReder();
  addRendererToDom();
  loadAmbientLight();
  laodDirectionalLight();
  loadCamera();
  loadAssets();
  loadAnimationLoop();
}

function loadReder() {
  renderer.setClearColor(0xeeeeee, 10.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function addRendererToDom() {
  document.body.appendChild(renderer.domElement);
}

function loadAmbientLight() {
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);
}

function laodDirectionalLight() {
  const light = new THREE.DirectionalLight(0xffffff, 8, 10);
  light.position.set(100, 100, 0);
  light.castShadow = true;
  scene.add(light);
}

function loadCamera() {
  const orbit = new OrbitControls(camera, renderer.domElement);
  camera.position.set(9, 15, 15);
  orbit.minDistance = 10;
  orbit.maxDistance = 20;
  orbit.update();
}

function loadGridHelper() {
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
}

function loadAssets() {
  const assetLoader = new GLTFLoader();
  assetLoader.load(
    character,
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      mixer.stopAllAction();
      const clips = gltf.animations;

      const idle = THREE.AnimationClip.findByName(clips, "02_Taunt");
      idleAction = mixer.clipAction(idle);
      idleAction.play();
      idleAction.setLoop(THREE.LoopRepeat);

      const idle2 = THREE.AnimationClip.findByName(clips, "03_Victory_Pose");
      idle2Action = mixer.clipAction(idle2);
      idle2Action.setLoop(THREE.LoopRepeat);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

let idleDuration = 5.5; // Duración de la animación idle en segundos
let lastSwitch = 0; // Tiempo desde la última vez que se cambió la animación
let currentAnimation = "02_Taunt"; // Animación actual

function animate() {
  if (mixer) mixer.update(clock.getDelta());

  if (idleAction && idle2Action) {
    if (clock.getElapsedTime() - lastSwitch > idleDuration) {
      if (currentAnimation === "02_Taunt") {
        currentAnimation = "03_Victory_Pose";
        idleAction.crossFadeTo(idle2Action, 1, true);
        idle2Action.reset().play();
      } else if (currentAnimation === "03_Victory_Pose") {
        currentAnimation = "02_Taunt";
        idle2Action.crossFadeTo(idleAction, 1, true);
        idleAction.reset().play();
      }
      lastSwitch = clock.getElapsedTime();
    }
  }
  renderer.shadowMap.enabled = true;
  renderer.render(scene, camera);
}

function loadAnimationLoop() {
  renderer.setAnimationLoop(animate);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("orientationchange", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
