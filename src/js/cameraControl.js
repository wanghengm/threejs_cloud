import * as THREE from '/build/three.module.js';
export default class CameraControl {
    constructor(camera, height) {
        this.centerX = 0;
        this.centerY = 0;
        this.centerZ = 0;
        this.targetCenterX = 0;
        this.targetCenterY = 0;
        this.targetCenterZ = 0;
        this.rotationY = 0;
        this.rotationX = -Math.PI / 2;
        this.rotationZ = -Math.PI;
        this.targetX = 0;
        this.targetZ = 0;
        this.viewingHeight = this.minZoom;
        this.targetHeight = height;
        this.maxZoom = 900;
        this.minZoom = 0;
        this.locked = false;
        this.globeMode = false;
        this.rotationSpeed = 8;
        this.loading = true;
        this.centerSpeed = 60;
        this.camera = camera;
    }
    reset() {
        this.targetX = Math.PI / 2 + 0.0001;
        this.targetZ = -Math.PI / 2;
        this.targetHeight = 450;
        this.centerX = 0;
        this.centerY = 0;
        this.centerZ = 0;
    }
    setTarget(x, y) {
        this.rotationSpeed = 1.5;
        this.targetZ -= x / Math.pow(this.maxZoom - this.viewingHeight + 200, 1.1);
        this.targetX += y / Math.pow(this.maxZoom - this.viewingHeight + 200, 1.1);
    }
    zoom(fov) {
        this.viewingHeight -= fov * Math.log(this.viewingHeight);
        if (this.viewingHeight < this.minZoom) {
            this.viewingHeight = this.minZoom;
        }
        if (this.viewingHeight > this.maxZoom) {
            this.viewingHeight = this.maxZoom;
        }
        this.targetHeight = this.viewingHeight;
    }
    lockRotation(lock) {
        this.locked = lock;
        this.globeMode = false;
    }
    isLocked() {
        return this.locked;
    }
    globe() {
        this.globeMode = true;
    }
    rotate(rotx, roty) {
        this.rotationSpeed = 6;
        this.targetX = roty;
        this.targetZ = rotx;
    }
    pan(x, y) {
        this.targetX = roty;
        this.targetZ = rotx;
    }
    setZoom(zoom) {
        this.targetHeight = zoom;
    }
    zoomIn(zoom) {
        this.targetHeight -= zoom;
    }
    setHeight(height) {
        this.viewingHeight = height;
    }
    getZoom() {
        return this.viewingHeight;
    }
    center(x, y, z) {
        this.targetCenterX = x;
        this.targetCenterY = y;
        this.targetCenterZ = z;
    }
    getCenter() {
        return { x: this.targetCenterX, y: this.targetCenterY, z: this.targetCenterZ };
    }
    autoRotate() {
        this.targetZ -= 0.003;
    }
    loaded() {
        this.loading = false;
        this.rotate(-Math.PI / 2, Math.PI);
        this.setZoom(120);
    }
    focusCenter() {
        this.rotationSpeed = 30;
        this.targetZ = -Math.PI - Math.atan2(this.targetCenterY, this.targetCenterX);
    }
    update() {
        if (this.loading === true) this.autoRotate();
        const error = 0.0001;

        if (Math.abs(this.rotationX - this.targetX) > error) this.rotationX += (this.targetX - this.rotationX) / this.rotationSpeed;
        else this.rotationX = this.targetX;

        if (Math.abs(this.rotationZ - this.targetZ) > error) this.rotationZ += (this.targetZ - this.rotationZ) / this.rotationSpeed;
        else this.rotationZ = this.targetZ;

        if (Math.abs(this.viewingHeight - this.targetHeight) > error) this.viewingHeight += (this.targetHeight - this.viewingHeight) / 30;
        else this.viewingHeight = this.targetHeight;

        if (Math.abs(this.centerX - this.targetCenterX) > error) this.centerX += (this.targetCenterX - this.centerX) / this.centerSpeed;
        else this.centerX = this.targetCenterX;

        if (Math.abs(this.centerZ - this.targetCenterZ) > error) this.centerZ += (this.targetCenterZ - this.centerZ) / this.centerSpeed;
        else this.centerZ = this.targetCenterZ;

        if (Math.abs(this.centerY - this.targetCenterY) > error) this.centerY += (this.targetCenterY - this.centerY) / this.centerSpeed;
        else this.centerY = this.targetCenterY;

        let offset = 1;
        if (this.globeMode) offset = 1.5;

        if (this.rotationX >= Math.PI * offset) this.rotationX = Math.PI * offset;
        if (this.rotationX <= 1.7) this.rotationX = 1.7;

        this.camera.position.x = this.centerX + this.viewingHeight * Math.sin(-this.rotationX + Math.PI / 2) * Math.cos(-this.rotationZ);
        this.camera.position.y = this.centerY + this.viewingHeight * Math.sin(-this.rotationX + Math.PI / 2) * Math.sin(-this.rotationZ);
        this.camera.position.z = this.centerZ + this.viewingHeight * Math.cos(-this.rotationX + Math.PI / 2);

        this.camera.up = new THREE.Vector3(0, 0, 1);
        this.camera.lookAt(new THREE.Vector3(this.centerX, this.centerY, this.centerZ));
    }
}
let isClicking = false;
let isDragging = false;
let cameraControls = null;
const mouseCoord = { x: 0, y: 0 };
let moveY = 0;
let moveX = 0;
CameraControl.prototype.init = function (p, renderer) {
    cameraControls = p;
    renderer.domElement.addEventListener('mousemove', mouseMove);
    renderer.domElement.addEventListener('mousedown', mouseDown);
    renderer.domElement.addEventListener('mouseup', function () {
        isClicking = false;
        isDragging = false;
    });
    renderer.domElement.addEventListener('mousewheel', mousewheel, false);
    renderer.domElement.addEventListener('onmousewheel', mousewheel, false);
    renderer.domElement.addEventListener('DOMMouseScroll', mousewheel, false);
};
function mouseDown(e) {
    mouseCoord.x = e.clientX || e.pageX;
    mouseCoord.y = e.clientY || e.pageY;
    isClicking = true;
    cameraControls.lockRotation(true);
    cameraControls.setTarget(mouseCoord.x - moveX, mouseCoord.y - moveY);
}
function mousewheel(event) {
    var fov;
    if (event.wheelDeltaY) fov = event.wheelDeltaY * 0.005;
    else fov = -event.detail / 10;
    cameraControls.zoom(fov);
}
function mouseMove(e) {
    moveY = e.clientY || e.pageY;
    moveX = e.clientX || e.pageX;
    e.preventDefault();
    isDragging = isClicking;
    if (isDragging) {
        cameraControls.lockRotation(true);
        cameraControls.setTarget(mouseCoord.x - moveX, mouseCoord.y - moveY);
        mouseCoord.x = moveX;
        mouseCoord.y = moveY;
    }
}
