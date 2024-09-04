import * as THREE from "three";


let scene, camera, renderer;
let boat, planet, island, figurehead;
let boatSpeed = 0;
const maxSpeed = .1;
const minSpeed = 0;
const planetRadius = 50;
// const cameraDistance=15;
const cameraHeight=40;

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

    // draw poles
    const northGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,60,0)
    ]);
    const northMaterial = new THREE.LineBasicMaterial({color:0xFFFF00});
    const north = new THREE.Line(northGeometry, northMaterial);
    scene.add(north);
    const southGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),
        new THREE.Vector3(0,-60,0)
    ]);
    const southMaterial = new THREE.LineBasicMaterial({color:0x00FFFF});
    const south = new THREE.Line(southGeometry, southMaterial);
    scene.add(south);

    // Create the water planet
    const geometry = new THREE.SphereGeometry(planetRadius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x1E90FF, wireframe: false });
    planet = new THREE.Mesh(geometry, material);
    scene.add(planet);

    // Create island
    const islandGeometry = new THREE.SphereGeometry(10, 32, 32);
    const islandMaterial = new THREE.MeshLambertMaterial({ color:0xffffff })
    island = new THREE.Mesh(islandGeometry, islandMaterial);
    scene.add(island);
    island.position.set(45,0,0);

    // lighting
    const al = new THREE.AmbientLight(0xff55ff, 0.3)
    scene.add(al)

    const dl = new THREE.DirectionalLight(0xffffff, 2);
    dl.position.set(0,0,50);
    scene.add(dl)

    // Create the sailboat
    const boatGeometry = new THREE.SphereGeometry(.1,16,16);
    const boatMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    boat = new THREE.Mesh(boatGeometry, boatMaterial);
    scene.add(boat);

    // Initial position of the boat
    boat.position.copy(boatPosition);

    // make figurehead
    const fGeometry = new THREE.BoxGeometry(1,3,5);
    const fMaterial = new THREE.MeshLambertMaterial({ color:0x55ff55 })
    figurehead = new THREE.Mesh(fGeometry, fMaterial)
    boat.add(figurehead);
    figurehead.position.set(0,0,1.2)
    // Add camera to the boat with an offset
    // camera.position.set(0, 0, 0);
    scene.add(camera);
    camera.lookAt(boat.position);
    camera.rotation.z=-Math.PI/2 -0.5;

    // Event listeners for controls
    document.getElementById('raiseSails').addEventListener('click', () => {
        if (boatSpeed > minSpeed) boatSpeed -= 0.01;
    });

    document.getElementById('lowerSails').addEventListener('click', () => {
        if (boatSpeed < maxSpeed) boatSpeed += 0.01;
    });

    document.getElementById('turnLeft').addEventListener('click', () => {
        rotateBoatDirection(Math.PI / 64); // Rotate left
    });

    document.getElementById('turnRight').addEventListener('click', () => {
        rotateBoatDirection(-Math.PI / 64); // Rotate right
    });

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function vector3ToLatLong(vector) {
    const x = vector.x;
    const y = vector.y;
    const z = vector.z;

    const radius = Math.sqrt(x * x + y * y + z * z); // Calculate the radius
    const lat = Math.asin(z / radius) * THREE.MathUtils.RAD2DEG; // Latitude in degrees
    const lon = Math.atan2(y, x) * THREE.MathUtils.RAD2DEG; // Longitude in degrees

    return { lat: lat, lon: lon };
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

    const latLon = vector3ToLatLong(boat.position);
    console.log("lat and lon ", latLon);

    // Recalculate the boat's direction to be tangent to the sphere
    const up = boatPosition.clone().normalize(); // This is the "up" direction from the planet's center
    boatDirection = boatDirection.clone().sub(up.multiplyScalar(boatDirection.dot(up)));
    boatDirection.normalize();

    // Orient the boat to face forward
    const lookAtPosition = boatPosition.clone().add(boatDirection);
    boat.lookAt(lookAtPosition);

    // boat.remove(camera);
    updateCameraPosition();
    // boat.add(camera);

    // Debugging information
    console.log('Boat Position:', boatPosition);
    console.log('Boat Direction:', boatDirection);
    console.log('Boat Speed:', boatSpeed);
}

function updateCameraPosition() {
    // Calculate the direction from the center of the sphere to the boat (normalized)
    const directionFromCenter = boatPosition.clone().normalize();

    // console.log(directionFromCenter.multiplyScalar(10));

    // Set the camera's local position 10 units away along the direction from the center
    const cameraOffset = directionFromCenter.multiplyScalar(69);
    camera.position.copy(cameraOffset);

    // Make sure the camera looks at the boat's local position
    camera.lookAt(boat.position);
}


function animate() {
    requestAnimationFrame(animate);

    // Update the boat's position based on its direction and speed
    updateBoatPosition();

    renderer.render(scene, camera);
}
