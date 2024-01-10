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

const fov = 45;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

init();

const width = 15;
const height = 15;
const planeGeometry = new THREE.PlaneGeometry(width, height);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
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

function loadAssets() {
  const assetLoader = new GLTFLoader();
  assetLoader.load(
    character,
    function (gltf) {
      const model = gltf.scene;
      scene.add(model);

      mixer = new THREE.AnimationMixer(model);
      const clips = gltf.animations;

      const idle = THREE.AnimationClip.findByName(clips, "01_Idle");
      idleAction = mixer.clipAction(idle);
      idleAction.play();
      idleAction.setLoop(THREE.LoopRepeat);

      populateAnimationDropdown(clips);

      document
        .getElementById("animationSelect")
        .addEventListener("change", function (e) {
          playSelectedAnimation(e.target.value, clips);
        });

      mixer.addEventListener("finished", function (e) {
        console.log(e, "finished");
        idle2Action.crossFadeTo(idleAction, 1, true);
        idleAction.reset().play();
        idleAction.setLoop(THREE.LoopRepeat);
      });
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function animate() {
  if (mixer) mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}

function loadAnimationLoop() {
  renderer.setAnimationLoop(animate);
}

function populateAnimationDropdown(clips) {
  const select = document.getElementById("animationSelect");
  clips.forEach((clip) => {
    const option = document.createElement("option");
    option.value = clip.name;
    option.innerText = clip.name;
    select.appendChild(option);
  });
}

function playSelectedAnimation(animationName, clips) {
  console.log(animationName);
  const clip = clips.find((c) => c.name === animationName);
  idle2Action = mixer.clipAction(clip);
  if (idle2Action) {
    mixer.stopAllAction();
    idleAction.crossFadeTo(idle2Action, 1, true);
    idle2Action.reset().play();
    idle2Action.setLoop(THREE.LoopOnce);
    idle2Action.clampWhenFinished = true;
  }

  renderer.shadowMap.enabled = true;
  renderer.render(scene, camera);
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
