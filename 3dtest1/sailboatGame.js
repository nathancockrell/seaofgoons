import * as THREE from "three";

let scene, camera, renderer;
let boat, planet;
let boatSpeed = 0, boatDirection = 0;
const maxSpeed = 0.02;
const minSpeed = 0;
const planetRadius = 50;
let theta = Math.PI / 2; // Longitude angle (from 0 to 2*PI)
let phi = Math.PI / 2;   // Latitude angle (from 0 to PI)

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create the water planet
    const geometry = new THREE.SphereGeometry(planetRadius, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x1E90FF, wireframe: true });
    planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    // Create the sailboat
    const boatGeometry = new THREE.BoxGeometry(1, 0.5, 3);
    const boatMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    boat = new THREE.Mesh(boatGeometry, boatMaterial);
    scene.add(boat);

    // Initial position of the boat using spherical coordinates
    boat.position.set(
        planetRadius * Math.sin(phi) * Math.cos(theta),
        planetRadius * Math.cos(phi),
        planetRadius * Math.sin(phi) * Math.sin(theta)
    );
    boat.lookAt(planet.position);

    // Add camera to the boat with an offset
    camera.position.set(0, 5, 10);
    boat.add(camera);
    camera.lookAt(boat.position);

    // Event listeners for controls
    document.getElementById('raiseSails').addEventListener('click', () => {
        if (boatSpeed < maxSpeed) boatSpeed += 0.005;
    });

    document.getElementById('lowerSails').addEventListener('click', () => {
        if (boatSpeed > minSpeed) boatSpeed -= 0.005;
    });

    document.getElementById('turnLeft').addEventListener('click', () => {
        boatDirection += 0.05; // Adjust this value for smoother turning
    });

    document.getElementById('turnRight').addEventListener('click', () => {
        boatDirection -= 0.05; // Adjust this value for smoother turning
    });

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const camera = boat.children[0];
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update the boat's position in spherical coordinates
    theta += boatDirection * boatSpeed;
    phi = Math.max(0.01, Math.min(Math.PI - 0.01, phi - boatSpeed));

    boat.position.set(
        planetRadius * Math.sin(phi) * Math.cos(theta),
        planetRadius * Math.cos(phi),
        planetRadius * Math.sin(phi) * Math.sin(theta)
    );

    // Reorient the boat to face the direction of movement
    boat.lookAt(new THREE.Vector3(
        planetRadius * Math.sin(phi - boatSpeed) * Math.cos(theta),
        planetRadius * Math.cos(phi - boatSpeed),
        planetRadius * Math.sin(phi - boatSpeed) * Math.sin(theta)
    ));

    renderer.render(scene, camera);
}
