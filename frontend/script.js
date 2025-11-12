// Mobile Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// 3D Globe
const globeCanvas = document.getElementById('globe-canvas');
if (globeCanvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, globeCanvas.clientWidth / globeCanvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: globeCanvas, alpha: true, antialias: true });
    renderer.setSize(globeCanvas.clientWidth, globeCanvas.clientHeight);
    
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff88, 
        wireframe: true 
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.x += 0.005;
        globe.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = globeCanvas.clientWidth / globeCanvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(globeCanvas.clientWidth, globeCanvas.clientHeight);
    });
}
