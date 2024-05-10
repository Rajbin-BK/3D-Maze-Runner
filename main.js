import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls(camera, renderer.domElement);


//adding the floor in the game
const loader = new THREE.TextureLoader();
const floorTexture = loader.load('/Pictures/floor.jpg', function(texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);  // Adjust this value based on the size of your tiles and texture
});

const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture
});

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const plane = new THREE.Mesh(planeGeometry, floorMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
scene.add(plane);

//array to store the boundry of the wall
const wallBoundaries = [];

// Maze layout (1 = wall, 0 = passage)
// Outer boundary walls are included, and inner zeros mark passages
const mazeLayout = [
  
  [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1]
  
];

const unitSize = 1; 
const width = 1;

// Function to create walls with two different textures
function createMaze(mazeLayout) {
  const wallHeight = 1;
  
  // Load textures outside of the loop to avoid reloading them for every wall
  const texture1 = new THREE.TextureLoader().load("/Pictures/wall3.jpg");
  const texture2 = new THREE.TextureLoader().load("/Pictures/wall2.jpg");
  
  mazeLayout.forEach((row, i) => {
    row.forEach((cell, j) => {
      if(cell === 1) { // Wall
        const geometry = new THREE.BoxGeometry(unitSize, wallHeight, width);
        
        // Decide on the texture based on column index
        const material = new THREE.MeshBasicMaterial({ map: i % 2 === 0 ? texture1 : texture2 });
        
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(j * unitSize - (mazeLayout[0].length * unitSize) / 2, wallHeight / 2, i * unitSize - (mazeLayout.length * unitSize) / 2);
        scene.add(wall);

        // 
        const wallBox = new THREE.Box3().setFromObject(wall);
        wallBoundaries.push(wallBox);
      }
    });
  });
}


// Create the maze
createMaze(mazeLayout);

//making the sphere that will act like the 1st person view
// Create a sphere
const sphereGeometry = new THREE.SphereGeometry(0.01, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Create a spotlight that emits yellow light
const spotlight = new THREE.SpotLight(0xffaa33); // 0xffff00 is the color white
spotlight.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
spotlight.target = sphere; // Make the spotlight always point to the sphere

// Optional: Customize the spotlight's properties
spotlight.angle = Math.PI ; // the light cone angle
spotlight.distance = 50; // Maximum distance of light emission
spotlight.intensity = 3; // the brightness of the light

scene.add(spotlight);

//the maze layout row and the target cell index
const targetRow = 17; // 17-based index for the last row
const targetCellIndex = 7; // 0-based index for the 8th position in the row (first 0)

// Calculate sphere's position
const sphereX = targetCellIndex * unitSize - (mazeLayout[0].length * unitSize) / 2 + unitSize / 2; // Center of the cell
const sphereZ = targetRow * unitSize - (mazeLayout.length * unitSize) / 2 + unitSize / 2; // Center of the cell

// Set the sphere's position
sphere.position.set(sphereX, 0.6, sphereZ); 
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let rotateLeft = false;
let rotateRight = false;
let rotateUp = false;
let rotateDown = false;

const rotationSpeed = 0.05; // Speed of rotation

document.addEventListener('keydown', function(event) {
  switch (event.key) {
      case 'ArrowUp': moveForward = true; break;
      case 'ArrowDown': moveBackward = true; break;
      case 'ArrowLeft': moveLeft = true; break;
      case 'ArrowRight': moveRight = true; break;
      case 'a': rotateLeft = true; break;
      case 'd': rotateRight = true; break;
      case 'w': rotateUp = true; break;
      case 's': rotateDown = true; break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.key) {
      case 'ArrowUp': moveForward = false; break;
      case 'ArrowDown': moveBackward = false; break;
      case 'ArrowLeft': moveLeft = false; break;
      case 'ArrowRight': moveRight = false; break;
      case 'a': rotateLeft = false; break;
      case 'd': rotateRight = false; break;
      case 'w': rotateUp = false; break;
      case 's': rotateDown = false; break;
  }
});


const mltloaders = new MTLLoader();
mltloaders.load
(/* resource URL */'/model/Stone.mtl',
	//for the material
	function(materials)
	{
		materials.preload();
		const loaders = new OBJLoader();
		loaders.setMaterials(materials);
		// load a resource
		loaders.load
    (/* resource URL */'/model/Stone.obj', 
		/*called when resource is loaded*/
		function ( object ) 
    {
			object.position.set(-2.35,0, 3.3)	//setting the position
			object.scale.set(0.1, 0.1, 0.1); //  Scale the object
			scene.add( object );

      // Compute and store the bounding box
      const StoneBox = new THREE.Box3().setFromObject(object);
      wallBoundaries.push(StoneBox);

      // Create a point light
			 const pointLight = new THREE.PointLight(0xff0000,3, 100);
			 pointLight.position.set(-2.35,2, 3.3); // Position the light above the object
			 //object.add(pointLight);
		},
   );
	}
)

const mltloader2 = new MTLLoader();
mltloader2.load
(/* resource URL */'/model/Heart_v1_L3.mtl',
	//for the material
	function(materials)
	{
		materials.preload();
		const loaders = new OBJLoader();
		loaders.setMaterials(materials);
		// load a resource
		loaders.load
    (/* resource URL */'/model/Heart.obj', 
		/*called when resource is loaded*/
		function ( object ) 
    {
			object.position.set(-1,0, -9)	//setting the position
			object.scale.set(0.05, 0.05, 0.05); //  Scale the object
			scene.add( object );

      // Create a point light
			 const pointLight = new THREE.PointLight(0xff0000,3, 100);
			 pointLight.position.set(-1.5,3, 5); // Position the light above the object
       object.rotation.x = -Math.PI / 2;
			 object.add(pointLight);
		},
   );
	}
)

const mltloader1 = new MTLLoader();
mltloader1.load
(/* resource URL */'/model/skeleton2.mtl',
	//for the material
	function(materials)
	{
		materials.preload();
		const loader1 = new OBJLoader();
		loader1.setMaterials(materials);
		// load a resource
		loader1.load
    (/* resource URL */'/model/skeleton2.obj', 
		/*called when resource is loaded*/
		function ( object1 ) 
    {
			object1.position.set(3,0,1.5)	//setting the position
			object1.scale.set(0.2, 0.2, 0.2); //  Scale the object
			
			scene.add( object1 );

      // Compute and store the bounding box
      const CactusBox = new THREE.Box3().setFromObject(object1);
      wallBoundaries.push(CactusBox);

    // Create a point light
    const pointLight = new THREE.PointLight(0xff0000, 10, 100);
    pointLight.position.set(3.73,2,1.5); // Position the light above the object
    //object1.add(pointLight);
		},
   );
	}
)


const mltloaderL = new MTLLoader();
mltloaderL.load
(/* resource URL */'/model/fern_leaves.mtl',
	//for the material
	function(materials)
	{
		materials.preload();
		const loader1 = new OBJLoader();
		loader1.setMaterials(materials);
		// load a resource
		loader1.load
    (/* resource URL */'/model/fern_leaves.obj', 
		/*called when resource is loaded*/
		function ( object1 ) 
    {
      object1.position.set(-6.6,0,-7.5)	//setting the position
			object1.scale.set(1.2, 1.2, 1.2); //  Scale the object
			
			scene.add( object1 );

      // Compute and store the bounding box
      const Box = new THREE.Box3().setFromObject(object1);
      wallBoundaries.push(Box);

		},
   );
	}
)


const tloader = new GLTFLoader();

function addTorch(position, scale) {
    tloader.load('/model/torch1.glb', function (gltf) {
        const torch = gltf.scene;
        torch.position.set(position.x, position.y, position.z);
        torch.scale.set(scale, scale, scale);
        scene.add(torch);

        // Create a glowing sphere
        const sphereGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xffaa33,
            emissive: 0xffaa33,
            emissiveIntensity: 1,
            shininess: 100
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(position.x, position.y + 0.18, position.z + 0.009);
        scene.add(sphere);

        // Point light placement
        const pointLight = new THREE.PointLight(0xffaa33, 4, 10);
        pointLight.position.set(position.x, position.y - 0.4, position.z + 0.009);
        scene.add(pointLight);

        // Optional: Add lens flare or glow effect here

        // No need to call animate() here if it's already being called in your main loop
    });
}

// Example usage:
addTorch(new THREE.Vector3(0, 0.7, 5.1), 0.25);
addTorch(new THREE.Vector3(-1, 0.7, 1.2), 0.25);
addTorch(new THREE.Vector3(3.5, 0.7, -4.7), 0.25);
addTorch(new THREE.Vector3(-2, 0.7, -4.7), 0.25);
addTorch(new THREE.Vector3(-5.5, 0.7, -4.7), 0.25);
addTorch(new THREE.Vector3(3.5, 0.7, -7.9), 0.25);
addTorch(new THREE.Vector3(2.5, 0.7, 1.1), 0.25);
addTorch(new THREE.Vector3(-4.5, 0.7, 1.1), 0.25);

const buloader = new GLTFLoader();
buloader.load(
  '/model/bush.glb', 
  function (gltf) { 
    const object2 = gltf.scene;
    object2.position.set(3, 0, 6.5);
    object2.scale.set(0.5,0.5,0.5);
    scene.add(object2);
  }
);

//ambient lighting
const light = new THREE.AmbientLight( 0x404040 , 0.1); // soft white light
scene.add( light );


// lighting effect 

var keylight = new THREE.DirectionalLight(new THREE.Color ('hsl (30, 100% , 75%)'), 1.0)
keylight.position.set(-20 , 0 , 20);

var fillLight = new THREE.DirectionalLight(new THREE.Color ('hsl (240 , 100% , 75%)'), 0.75)
fillLight.position.set(20 , 0 , 200);

var backLight = new THREE.DirectionalLight(new THREE.Color ('hsl (30, 100% , 75%)'), 1.0)
backLight.position.set(20 , 0 , -20);

scene.add(keylight);
scene.add(fillLight);
scene.add(backLight);



const cameraOffset = new THREE.Vector3(0.002,0, 0.1 ); // X, Y, Z offset from the sphere


function animate() {
  requestAnimationFrame(animate);

   // Flicker effect
   const flickerIntensity = 0.5 + Math.random() * 0.5;
   spotlight.intensity = 5.5 * flickerIntensity;
   sphereMaterial.emissiveIntensity = 0.7 * flickerIntensity;

    // Calculate forward vector based on sphere rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(sphere.quaternion);
    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(sphere.quaternion);

    // Movement speed factor
    const delta = 0.05;

    // Update rotation based on input
    if (rotateLeft) sphere.rotation.y += rotationSpeed;
    if (rotateRight) sphere.rotation.y -= rotationSpeed;
    if (rotateUp) sphere.rotation.x += rotationSpeed;
    if (rotateDown) sphere.rotation.x -= rotationSpeed;

    // Potential new position after movement
    const potentialPosition = sphere.position.clone();

    if (moveForward) potentialPosition.add(forward.multiplyScalar(delta));
    if (moveBackward) potentialPosition.add(forward.multiplyScalar(-delta));
    if (moveLeft) potentialPosition.add(sideways.multiplyScalar(-delta));
    if (moveRight) potentialPosition.add(sideways.multiplyScalar(delta));

    forward.multiplyScalar(1/delta); // Reset scaling for next frame
    sideways.multiplyScalar(1/delta);

    // Check for collisions
    let collision = false;
    const sphereBounding = new THREE.Sphere(potentialPosition, 0.01);
    for (const wallBox of wallBoundaries) {
        if (wallBox.intersectsSphere(sphereBounding)) {
            collision = true;
            break;
        }
    }

    // Update position if no collision
    if (!collision) {
        sphere.position.copy(potentialPosition);
        spotlight.position.set(sphere.position.x, sphere.position.y + 0.1, sphere.position.z); // Slightly above the sphere 
    }

    // Camera rotation
    if (rotateLeft) camera.rotation.y += rotationSpeed;
    if (rotateRight) camera.rotation.y -= rotationSpeed;
    if (rotateUp) camera.rotation.x += rotationSpeed;
    if (rotateDown) camera.rotation.x -= rotationSpeed;

     
      camera.position.x = sphere.position.x + cameraOffset.x;
      camera.position.y = sphere.position.y + cameraOffset.y;
      camera.position.z = sphere.position.z + cameraOffset.z;

      // Follow sphere rotation
      camera.rotation.copy(sphere.rotation);
  

    renderer.render(scene, camera);
}

animate();

