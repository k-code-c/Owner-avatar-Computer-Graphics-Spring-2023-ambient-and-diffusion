
const vertexShaderSrc = `#version 300 es
// define the vertex attributes
in vec4 a_position;

// define the uniform variables to be used in the vertex shader
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

// define information for lighting
uniform vec3 u_lightDirection;
uniform vec3 u_lightColor;
uniform vec3 u_ambientLight;

// define the varying variables to be used in the fragment shader
out vec4 v_color;

void main() {
	// multiply the position by the model, view, and projection matrices
	gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * a_position;

	// calculate the normal of the vertex
	vec3 normal = normalize(vec3(u_modelMatrix * a_position));

	// calculate the diffuse lighting
	float diffuse = max(dot(normal, u_lightDirection), 0.0);

	// calculate the color of the vertex
	v_color = vec4(u_ambientLight + u_lightColor * diffuse, 1.0);
}
`;

const fragmentShaderSrc = `#version 300 es
precision mediump float;

// work with the vertex shader to calculate the color of the vertex
in vec4 v_color;

// define the output color
out vec4 outColor;

void main() {
	// set the output color to the color calculated in the vertex shader
	outColor = v_color;
}

`;


let canvas; // the canvas element
let gl; // the WebGL context

let a_positionLocation; // location of the a_position attribute

let u_modelMatrixLocation; // the location of the u_modelMatrix uniform 
let u_viewMatrixLocation; // the location of the u_viewMatrix uniform 
let u_projectionMatrixLocation; // the location of the u_projectionMatrix uniform 

let modelMatrix = glMatrix.mat4.create(); // the model matrix for the cube
let viewMatrix = glMatrix.mat4.create(); // the view matrix 
let projectionMatrix = glMatrix.mat4.create(); // the projection matrix

const DEFAULT_POSITION = [0, 0, 0]; // default position for every object

const X_AXIS = [1, 0, 0]; // vector notation for the x-axis
const Y_AXIS = [0, 1, 0]; // vector notation for the y-axis
const Z_AXIS = [0, 0, 1]; // vector notation for the z-axis

const DEFAULT_CAMERA_POSITION = [0, 0, -7]; // the default position of the camera
const DEFAULT_CAMERA_TARGET = [0, 0, 0]; // the default target of the camera
let camera_pos =  [0, 0, -7]; // the current position of the camera
let camera_target = DEFAULT_CAMERA_TARGET; // the current target of the camera

const DEFAULT_ANGLE = 0; // the default angle for every object
let offset = 0; // the offset for the cube's position

const CANVAS_COLOR = [0.0, 0.11, 0.5, 1.0]; //color for the background of the canvas


let u_lightDirectionLocation; // the location of the u_lightDirection uniform
let u_lightColorLocation; // the location of the u_lightColor uniform
let u_ambientLightLocation; // the location of the u_ambientLight uniform

let lightDirection = [0, 1, 0]; // the initial direction of the light in the scene

let leftRightAngle = 0.0; // for camera rotation parallel to the x-z plane
let upDownAngle = 0.0; // for camera rotation parallel to the y-z plane

let floor = []; // the floor of the scene

// WebGL context 
function initWebGL() {    

// canvas element and webgl context
canvas = document.getElementById("canvas");
gl = canvas.getContext("webgl2");

// declare shaders
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// load shaders
gl.shaderSource(vertexShader, vertexShaderSrc);
gl.shaderSource(fragmentShader, fragmentShaderSrc);

// compile shaders
gl.compileShader(vertexShader);
gl.compileShader(fragmentShader);

// create program
let program = gl.createProgram();

// attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// link program
gl.linkProgram(program);

// validate program
gl.validateProgram(program);

// use program
gl.useProgram(program);

// for 3D objects 
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CCW);




// locations of the attributes/uniforms
a_positionLocation = gl.getAttribLocation(program, "a_position");
a_colorLocation = gl.getAttribLocation(program, "a_color");

u_modelMatrixLocation = gl.getUniformLocation(program, "u_modelMatrix");
u_viewMatrixLocation = gl.getUniformLocation(program, "u_viewMatrix");
u_projectionMatrixLocation = gl.getUniformLocation(program, "u_projectionMatrix");


// initialize the view and projection matrices 
glMatrix.mat4.lookAt(viewMatrix, camera_pos, camera_target, Y_AXIS);
glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

// locations of the matrices
gl.uniformMatrix4fv(u_viewMatrixLocation, false, viewMatrix);
gl.uniformMatrix4fv(u_projectionMatrixLocation, false, projectionMatrix);


// location of light uniforms
u_lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
u_lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
u_ambientLightLocation = gl.getUniformLocation(program, "u_ambientLight");

// lighting uniforms 
gl.uniform3fv(u_lightColorLocation, [1.0, 2.0, 1.0]);
gl.uniform3fv(u_ambientLightLocation, [0.2, 0.2, 0.2]);
gl.uniform3fv(u_lightDirectionLocation, lightDirection)


 
setInterval(draw, 1000/60);
}


function draw() {

// set the color of the background to dark blue
gl.clearColor(CANVAS_COLOR[1], CANVAS_COLOR[1], CANVAS_COLOR[2], CANVAS_COLOR[3]);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
// create the shapes and assign data
// cube
let cubeData = cube(0.8);
let cubeAngle = DEFAULT_ANGLE + offset;
//let orbitRadius = 3; 
let cubeCenter = [ 0, 5, 0];
let cubeRotationAxis = [0, 5, 0];
let myCube = new ShapeBuffer(cubeData, cubeAngle, cubeRotationAxis, cubeCenter);

// torus
let torusData = uvTorus(0.5, 0.2, 20, 20);
let torusAngle = DEFAULT_ANGLE + offset;
let torusRotationAxis = [0, 1, 0];
let torusCenter = [0, 1, 0];
let torus = new ShapeBuffer(torusData, torusAngle, torusRotationAxis, torusCenter);

// floor
let floorData = cube(10);
floor = new ShapeBuffer(floorData, DEFAULT_ANGLE, Y_AXIS, [camera_pos[0], camera_pos[1]-6, camera_pos[2]], [0, 0, 0]);

// render shapes
renderShape(myCube);
renderShape(torus);
renderShape(floor);

// move the camera
moveCamera();


offset += 1;
if (offset === 62800) {offset = 0;}
}



function renderShape(shape) {
// create the model matrix for the shape
modelMatrix = glMatrix.mat4.create();

// create, bind, and set the data for the shape's VBO
let vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, shape.data.vertexPositions, gl.STATIC_DRAW); // TORUS

//index buffer
let indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, shape.data.indices, gl.STATIC_DRAW); // TORUS

// enable and set the data for VBO
gl.enableVertexAttribArray(a_positionLocation);
gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);

// translate and rotate the shape 
glMatrix.mat4.rotate(modelMatrix, modelMatrix, glMatrix.glMatrix.toRadian(shape.rotationAngle), shape.rotationAxis);

glMatrix.mat4.translate(modelMatrix, modelMatrix, shape.center);

gl.uniformMatrix4fv(u_modelMatrixLocation, false, modelMatrix);

// draw the shape
gl.drawElements(gl.TRIANGLES, shape.data.indices.length, gl.UNSIGNED_SHORT, 0);
}




function moveCamera() {
// event listeners

function update_camera() {
	glMatrix.mat4.lookAt(viewMatrix, camera_pos, camera_target, [0, 1, 0]);
	gl.uniformMatrix4fv(u_viewMatrixLocation, false, viewMatrix);
}

function update_FB_position(negator) {
	camera_pos[0] += (0.001 * Math.sin(leftRightAngle * 0.0001)) * negator;
	camera_target[0] += 0.001 * Math.sin(leftRightAngle * 0.0001) * negator;
	camera_pos[2] += 0.001 * Math.cos(leftRightAngle * 0.0001) * negator;
	camera_target[2] += 0.001 * Math.cos(leftRightAngle * 0.0001) * negator;
	glMatrix.mat4.translate(viewMatrix, viewMatrix, [camera_pos[0], camera_pos[1], camera_pos[2]]);
}

function update_LR_position(negator) {
	camera_pos[2] += (0.001 * Math.sin(leftRightAngle * 0.0001)) * negator;
	camera_target[2] += 0.001 * Math.sin(leftRightAngle * 0.0001) * negator;
	camera_pos[0] += 0.001 * Math.cos(leftRightAngle * 0.0001) * -negator;
	camera_target[0] += 0.001 * Math.cos(leftRightAngle * 0.0001) * -negator;
	glMatrix.mat4.translate(viewMatrix, viewMatrix, [camera_pos[0], camera_pos[1], camera_pos[2]]);
}

function update_UD_rotation() {
	camera_target[1] = Math.sin(upDownAngle * 0.0001) * 16 * Math.PI;
}

function update_LR_rotation() {
	camera_target[0] = Math.sin(leftRightAngle * 0.0001) * (Math.abs(camera_pos[0]) + 1) * Math.PI;
	camera_target[2] = Math.cos(leftRightAngle * 0.0001) * (Math.abs(camera_pos[2]) + 1) * Math.PI;
}

// w key for moving forward
document.addEventListener("keydown", function(event) {
	if (event.key === "w") {
		update_FB_position(1);
		update_camera();
	}
});

// s key for moving backward
document.addEventListener("keydown", function(event) {
	if (event.key === "s") {
		update_FB_position(-1);
		update_camera();
	}
});

// a key for moving left
document.addEventListener("keydown", function(event) {
	if (event.key === "a") {
		update_LR_position(-1);
		glMatrix.mat4.translate(viewMatrix, viewMatrix, [camera_pos[0], camera_pos[1], camera_pos[2]]);
		update_camera();
	}
});

// d key for moving right
document.addEventListener("keydown", function(event) {
	if (event.key === "d") {
		update_LR_position(1);
		update_camera();
	}
});

// i key for looking up
document.addEventListener("keydown", function(event) {
	if (event.key === "i") {
		upDownAngle += 1;
		update_UD_rotation();
		update_camera();
	}
});

// k key for looking down
document.addEventListener("keydown", function(event) {
	if (event.key === "k") {
		upDownAngle -= 1;
		update_UD_rotation();
		update_camera();
	}
});

// j key for looking left
document.addEventListener("keydown", function(event) {
	if (event.key === "j") {
		leftRightAngle += 1;
		update_LR_rotation();
		update_camera();
	}
});

// l key for looking right
document.addEventListener("keydown", function(event) {
	if (event.key === "l") {
		leftRightAngle -= 1;
		update_LR_rotation();
		update_camera();
	}
});
}