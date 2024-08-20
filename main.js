import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { FirstPersonControls } from "jsm/controls/FirstPersonControls.js"
import { FlyControls } from "jsm/controls/FlyControls.js"
import { MathUtils } from "three";

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

const boat = {
    x:50,
    y:50,
    subjectiveDirection:0,
    direction:0,
    yspeed:.1,
    xspeed:.1,
    turnSpeed:1,
    keys: { up:false, down:false, left:false, right:false }
}

// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Small sphere with radius 0.1
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
let marker = new THREE.Mesh(markerGeometry, markerMaterial);

function updateBoat(){

    if(boat.keys.left)boat.subjectiveDirection-=boat.turnSpeed;
    if(boat.keys.right)boat.subjectiveDirection+=boat.turnSpeed;
    boat.direction = roseDirection(boat.subjectiveDirection, boat.x, boat.y)
    boat.x += ((Math.cos(MathUtils.degToRad(boat.direction+90+boat.subjectiveDirection)) *Math.abs(1/Math.cos(MathUtils.degToRad(boat.y)))* boat.xspeed));
    boat.y += (Math.sin(MathUtils.degToRad(boat.direction+90+boat.subjectiveDirection)) * boat.yspeed);
    console.log(Math.sin(MathUtils.degToRad(boat.direction+90)))
    console.log(boat.y)
    boat.y%=180;
    if(boat.y>=90 || boat.y<=-90){
        boat.x+=180;
        boat.direction+=180
        boat.y-=boat.y-90
    };
    boat.x = boat.x%360;
    boat.direction= boat.direction%360;
    boat.subjectiveDirection=boat.subjectiveDirection%360;
    console.log("BOATDIRECTION: " +boat.direction)
    // console.log("X and Y: " + boat.x + ", " + boat.y)
}
function drawBoat() {
    scene.remove(marker)
    marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.add(camera)
    const position = latLongToVector3(boat.x, boat.y, 5); // Use the big sphere's radius (5)
    marker.position.copy(position)
    const position2 = latLongToVector3(boat.x, boat.y, 3);
    // console.log("Position: " + position.x + ", " + position.y + ", " + position.z)
    console.log("boatx=" + boat.x + " boaty=" + boat.y)
    // camera.position.copy(position2)
    scene.add(marker);
    camera.lookAt(position);
    
}
function calculateBearing(lon, lat) {
    // Since we're working with the globe, assume that North is aligned with the Prime Meridian (longitude = 0)
    const latNorth = 90; // Latitude for the North Pole
    const lonNorth = 0;  // Longitude for the North Pole
    
    lat = toRadians(lat);
    lon = toRadians(lon);
    
    const latNorthRad = toRadians(latNorth);
    const lonNorthRad = toRadians(lonNorth);

    const deltaLon = lonNorthRad - lon;

    const y = Math.sin(deltaLon) * Math.cos(latNorthRad);
    const x = Math.cos(lat) * Math.sin(latNorthRad) -
              Math.sin(lat) * Math.cos(latNorthRad) * Math.cos(deltaLon);

    let bearing = toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
}
function roseDirection(subjectiveDirection, lon, lat) {
    // Calculate the bearing relative to the planet's North Pole
    const planetBearing = calculateBearing(lon, lat);
    // Add the subjective direction (offset) to the planet bearing
    let finalBearing = (planetBearing + subjectiveDirection) % 360;
    // Normalize the bearing to ensure it's between 0 and 360 degrees
    if (finalBearing < 0) {
        finalBearing += 360;
    }
    // Convert the bearing to a compass direction
    // return getCompassDirection(finalBearing);
    return finalBearing;
}
function getCompassDirection(bearing) {
    if (bearing >= 337.5 || bearing < 22.5) {
        return 'N';
    } else if (bearing >= 22.5 && bearing < 67.5) {
        return 'NE';
    } else if (bearing >= 67.5 && bearing < 112.5) {
        return 'E';
    } else if (bearing >= 112.5 && bearing < 157.5) {
        return 'SE';
    } else if (bearing >= 157.5 && bearing < 202.5) {
        return 'S';
    } else if (bearing >= 202.5 && bearing < 247.5) {
        return 'SW';
    } else if (bearing >= 247.5 && bearing < 292.5) {
        return 'W';
    } else {
        return 'NW';
    }
}

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.add(camera)
camera.position.z = 1;
camera.position.x = 1;
camera.position.y = 6;

// Orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// First Person Controls
// const controls = new FirstPersonControls(camera, renderer.domElement);
// controls.movementSpeed = 10; // Movement speed
// controls.lookSpeed = 0.01;    // Looking speed
// controls.lookVertical = true; // Allow vertical looking

// Fly Controls
// const controls = new FlyControls(camera, renderer.domElement);
// controls.movementSpeed = 0.1;
// controls.rollSpeed = Math.PI / 24;
// controls.autoForward = true;
// controls.dragToLook = false;

// Sphere (Earth)
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
const crustGeometry = new THREE.SphereGeometry(4.9, 64, 64);
const crustMaterial = new THREE.MeshBasicMaterial({ color: 0x00bb00, wireframe: false });
const crust = new THREE.Mesh(crustGeometry, crustMaterial);
scene.add(crust);
const northGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(0,10,0)
]);
const northMaterial = new THREE.LineBasicMaterial({color:0xFFFF00});
const north = new THREE.Line(northGeometry, northMaterial);
scene.add(north);
const southGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(0,-10,0)
]);
const southMaterial = new THREE.LineBasicMaterial({color:0x00FFFF});
const south = new THREE.Line(southGeometry, southMaterial);
scene.add(south);
// Function to convert latitude and longitude to a position on the sphere's surface
function latLongToVector3(lon, lat, radius) {
    const phi = MathUtils.degToRad(90 - lat); // Convert latitude to polar angle
    const theta = MathUtils.degToRad(lon); // Convert longitude to azimuthal angle

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Small sphere (marker)
function createMarker(lon, lat) {
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32); // Small sphere with radius 0.1
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    const position = latLongToVector3(lat, lon, 6); // Use the big sphere's radius (5)
    marker.position.copy(position);

    scene.add(marker);
}

// Example: Place marker at New York City coordinates (40.7128° N, 74.0060° W)
createMarker(230, 80);

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

const keyStates = {};

document.addEventListener('keydown', (event) => {
    if (keyStates[event.key]) return;
    keyStates[event.key] = true;

    switch (event.key) {
        case 'a': boat.keys.left = true; break;
        case 'd': boat.keys.right = true; break;
        case 'w': boat.keys.up = true; break;
        case 's': boat.keys.down = true; break;
    }
    
    // camera.position.x += 1;
    // camera.position.y+=1;
    // camera.rotation.y+=1;
    // camera.position.z-=1;
    // camera.rotateOnAxis
    // console.log(camera.position)
    ;
});
document.addEventListener('keyup', (event) => {
    keyStates[event.key] = false;

    switch (event.key) {
        case 'a': boat.keys.left = false; break;
        case 'd': boat.keys.right = false; break;
        case 'w': boat.keys.up = false; break;
        case 's': boat.keys.down = false; break;
    }
});
// Render loop
function animate() {
    requestAnimationFrame(animate);
    updateBoat();
    drawBoat();
    // camera.rotation.z = -MathUtils.degToRad(boat.direction) + .59;
    // controls.update(0.1);
    renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
