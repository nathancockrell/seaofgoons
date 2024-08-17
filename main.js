import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { MathUtils } from "three";

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Sphere (Earth)
const sphereGeometry = new THREE.SphereGeometry(5, 64, 64);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: false });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Function to convert latitude and longitude to a position on the sphere's surface
function latLongToVector3(lat, lon, radius) {
    const phi = MathUtils.degToRad(90 - lat); // Convert latitude to polar angle
    const theta = MathUtils.degToRad(lon); // Convert longitude to azimuthal angle

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Small sphere (marker)
function createMarker(lat, lon) {
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Small sphere with radius 0.1
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    const position = latLongToVector3(lat, lon, 6); // Use the big sphere's radius (5)
    marker.position.copy(position);

    scene.add(marker);
}

// Example: Place marker at New York City coordinates (40.7128° N, 74.0060° W)
createMarker(0, 90);
createMarker(350, 90);

// Latitude lines
function createLatitudeLines() {
    const latitudes = [];
    for (let i = -80; i <= 80; i += 20) {
        const latGeometry = new THREE.CircleGeometry(5 * Math.cos(MathUtils.degToRad(i)), 64);
        const latMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        const points = [];
        const position = latGeometry.getAttribute('position');
        for (let j = 0; j < position.count; j++) {
            points.push(new THREE.Vector3().fromBufferAttribute(position, j));
        }

        const latitude = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), latMaterial);
        latitude.rotation.x = MathUtils.degToRad(90 - i);
        latitudes.push(latitude);
        scene.add(latitude);
    }
}

// Longitude lines
function createLongitudeLines() {
    const longitudes = [];
    for (let i = 0; i < 360; i += 20) {
        const points = [];
        for (let j = -90; j <= 90; j += 5) {
            const phi = MathUtils.degToRad(j);
            const theta = MathUtils.degToRad(i);
            points.push(new THREE.Vector3(
                5 * Math.cos(phi) * Math.sin(theta),
                5 * Math.sin(phi),
                5 * Math.cos(phi) * Math.cos(theta)
            ));
        }
        const longGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const longMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const longitude = new THREE.Line(longGeometry, longMaterial);
        longitudes.push(longitude);
        scene.add(longitude);
    }
}

createLatitudeLines();
createLongitudeLines();

// Camera position
camera.position.z = 10;

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
