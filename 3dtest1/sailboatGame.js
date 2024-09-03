import * as THREE from "three";


let scene, camera, renderer;
let boat, planet;
let boatSpeed = 0;
const maxSpeed = 3;
const minSpeed = 0;
const planetRadius = 50;
const cameraDistance=15;
const cameraHeight=5;

let boatDirection = new THREE.Vector3(1, 0, 0); // Initial direction along the x-axis
let boatPosition = new THREE.Vector3(planetRadius, 10, 10); // Initial position on the x-axis

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

    // Initial position of the boat
    boat.position.copy(boatPosition);

    // Add camera to the boat with an offset
    // camera.position.set(0, 0, 0);
    boat.add(camera);
    camera.lookAt(boat.position);
    camera.rotation.z=-Math.PI/2 -0.5;

    // Event listeners for controls
    document.getElementById('raiseSails').addEventListener('click', () => {
        if (boatSpeed < maxSpeed) boatSpeed += 0.005;
        console.log('Raise sails:', boatSpeed); // Debugging
    });

    document.getElementById('lowerSails').addEventListener('click', () => {
        if (boatSpeed > minSpeed) boatSpeed -= 0.005;
        console.log('Lower sails:', boatSpeed); // Debugging
    });

    document.getElementById('turnLeft').addEventListener('click', () => {
        rotateBoatDirection(Math.PI / 64); // Rotate left
        console.log('Turn left:', boatDirection); // Debugging
    });

    document.getElementById('turnRight').addEventListener('click', () => {
        rotateBoatDirection(-Math.PI / 64); // Rotate right
        console.log('Turn right:', boatDirection); // Debugging
    });

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function rotateBoatDirection(angle) {
    // Rotate the boat direction around the axis perpendicular to the boat's current direction and the sphere's center
    const up = boatPosition.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromAxisAngle(up, angle);
    boatDirection.applyQuaternion(quaternion);

    // Ensure direction is normalized
    boatDirection.normalize();
}

function updateBoatPosition() {
    // Move the boat along its direction
    const movement = boatDirection.clone().multiplyScalar(boatSpeed);
    boatPosition.add(movement);

    // Re-normalize to keep the boat on the sphere's surface
    boatPosition.normalize().multiplyScalar(planetRadius);
    boat.position.copy(boatPosition);

    // Recalculate the boat's direction to be tangent to the sphere
    const up = boatPosition.clone().normalize(); // This is the "up" direction from the planet's center
    boatDirection = boatDirection.clone().sub(up.multiplyScalar(boatDirection.dot(up)));
    boatDirection.normalize();

    // Orient the boat to face forward
    const lookAtPosition = boatPosition.clone().add(boatDirection);
    boat.lookAt(lookAtPosition);

    updateCameraPosition();

    // Debugging information
    console.log('Boat Position:', boatPosition);
    console.log('Boat Direction:', boatDirection);
    console.log('Boat Speed:', boatSpeed);
}

function updateCameraPosition() {
    // Calculate camera offset relative to the boat
    const cameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
    cameraOffset.applyQuaternion(boat.quaternion);
    camera.position.copy(boat.position).add(cameraOffset);

    // Ensure the camera is always the same distance from the center of the sphere
    const distanceToCenter = camera.position.length();
    if (distanceToCenter !== cameraDistance) {
        camera.position.normalize().multiplyScalar(cameraDistance);
    }

    camera.lookAt(boat.position);
}

function animate() {
    requestAnimationFrame(animate);

    // Update the boat's position based on its direction and speed
    updateBoatPosition();

    renderer.render(scene, camera);
}
