document.addEventListener('DOMContentLoaded', function() {

    const cont1 = document.getElementById('cont1');
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    let spheres = [];
    const maxSpeed = 0.3;
    let resizeTimeout;
    let fadeOutInterval;
    let fadeInInterval;

    let mouse = {
        x: null,
        y: null,
        radius: 100
    };

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    function Sphere(x, y, radius, speedX, speedY, opacity = 0) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.opacity = opacity;

        this.update = function () {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.speedX = -this.speedX;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.speedY = -this.speedY;
            }

            this.speedX = Math.min(Math.max(this.speedX, -maxSpeed), maxSpeed);
            this.speedY = Math.min(Math.max(this.speedY, -maxSpeed), maxSpeed);
        };

        this.draw = function () {
            ctx.globalAlpha = this.opacity;
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        };
    }

    function connectSpheres() {
        for (let i = 0; i < spheres.length; i++) {
            for (let j = i + 1; j < spheres.length; j++) {
                let dx = spheres[i].x - spheres[j].x;
                let dy = spheres[i].y - spheres[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let xpos = (spheres[i].x + spheres[j].x) / 2;
                let ypos = (spheres[i].y + spheres[j].y) / 2;
                let mouseDistance = Math.sqrt((xpos - mouse.x) * (xpos - mouse.x) + (ypos - mouse.y) *  (ypos - mouse.y));
                let maxDistance = 300;

                let maxMouseDistance = 400;
                if (mouseDistance < maxMouseDistance) {
                    maxDistance = maxDistance * (1 + Math.pow((1 - mouseDistance / maxMouseDistance), 5) * 0.7);
                }

                if (distance < maxDistance) {
                    let opacity = Math.min(1 - distance / maxDistance, spheres[i].opacity, spheres[j].opacity);
                    ctx.strokeStyle = 'rgba(0, 0, 0, ' + opacity + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(spheres[i].x, spheres[i].y);
                    ctx.lineTo(spheres[j].x, spheres[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        spheres = [];
        const numSpheres = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 200);
        for (let i = 0; i < numSpheres; i++) {
            let radius = Math.random() * 10 + 2;
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let speedX = Math.random() * maxSpeed * 2 - maxSpeed;
            let speedY = Math.random() * maxSpeed * 2 - maxSpeed;
            spheres.push(new Sphere(x, y, radius, speedX, speedY, 0));
        }
    }

    function removeAllSpheresWithFade(callback) {
        clearInterval(fadeOutInterval);
        fadeOutInterval = setInterval(function () {
            let allFaded = true;
            for (let i = 0; i < spheres.length - 1; i++) {
                spheres[i].opacity -= 0.04;
                if (spheres[i].opacity > 0) {
                    allFaded = false;
                }
            }
            if (spheres[spheres.length - 1].opacity != 0) {
                spheres[spheres.length - 1].opacity -= 0.04;
            }
            if (allFaded) {
                clearInterval(fadeOutInterval);
                spheres = [];
                callback();
            }
        }, 10);
    }


    function showNewSpheres() {
        clearInterval(fadeInInterval);
        fadeInInterval = setInterval(function () {
            let allVisible = true;
            for (let i = 0; i < spheres.length - 1; i++) {
                spheres[i].opacity += 0.04;
                if (spheres[i].opacity < 1) {
                    allVisible = false;
                }
            }
            if (allVisible) {
                clearInterval(fadeInInterval);
            }
        }, 10);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        connectSpheres();

        for (let i = 0; i < spheres.length; i++) {
            spheres[i].update();
            spheres[i].draw();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        clearInterval(fadeOutInterval);
        clearInterval(fadeInInterval);

        resizeTimeout = setTimeout(function () {
            canvas.width = window.innerWidth;
            canvas.height = document.documentElement.scrollHeight;

            removeAllSpheresWithFade(function () {
                init();
                showNewSpheres();
            });

        }, 200);
    });

    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;

    init();
    showNewSpheres();
    animate();
});
