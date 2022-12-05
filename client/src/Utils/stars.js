export function renderStars() {
        //based on an Example by @curran
    function detectMob() {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        
        return toMatch.some((toMatchItem) => {
            return navigator.userAgent.match(toMatchItem);
        });
    }
    const isMobile = detectMob()
    window.requestAnimationFrame = (function(){return  window.requestAnimationFrame})();
    var canvas = document.getElementById("space");
    var c = canvas.getContext("2d");

    var numStars = 5000;
    var radius = '0.'+Math.floor(Math.random() * 9) + 1  ;
    var focalLength = canvas.width *2;
    var warp = 0;
    var centerX, centerY;

    var stars = [], star;
    var i;

    var animate = true;

    initializeStars();

    function executeFrame(){

    if(animate)
        requestAnimationFrame(executeFrame);
        moveStars();
        drawStars();
    }

    function initializeStars(){
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;

        stars = [];
        for(i = 0; i < numStars; i++){
            star = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * canvas.width,
                o: '0.'+Math.floor(Math.random() * 99) + 1
            };
            stars.push(star);
        }
    }

    function moveStars(){
        for(i = 0; i < numStars; i++){
            star = stars[i];
            star.z = star.z - (isMobile ? 0.2 : 0.75);
            
            if(star.z <= 0){
                star.z = canvas.width;
            }
        }
    }

    function drawStars(){
        var pixelX, pixelY, pixelRadius;

        // Resize to the screen
        if(canvas.width != window.innerWidth || canvas.width != window.innerWidth){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initializeStars();
        }
        if(warp==0){
            c.shadowBlur = 10;
            c.shadowColor = "white";
            c.fillStyle = "rgba(0,10,20,1)";
            c.fillRect(0,0, canvas.width, canvas.height);
        }
            c.fillStyle = "rgba(209, 255, 255, "+radius+")";
            for(i = 0; i < numStars; i++){
            star = stars[i];
            
            pixelX = (star.x - centerX) * (focalLength / star.z);
            pixelX += centerX;
            pixelY = (star.y - centerY) * (focalLength / star.z);
            pixelY += centerY;
            pixelRadius = 1 * (focalLength / star.z);
            
            // c.arc(pixelX, pixelY, pixelRadius, 0, Math.PI * 2)
            c.fillRect(pixelX, pixelY, pixelRadius, pixelRadius);
            c.fillStyle = "rgba(209, 255, 255, "+star.o+")";
        //c.fill();
        }
    }

    // document.getElementById('warp').addEventListener("click",function(e){
    //  window.warp = window.warp==1 ? 0 : 1;
    // window.c.clearRect(0, 0, window.canvas.width, window.canvas.height);
    // executeFrame();
    // });

    executeFrame();

  }