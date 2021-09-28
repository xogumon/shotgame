let pageX, pageY, appleTransition, inAction = false, gaming = true, scoreGame = 0;
pageY = window.innerHeight;
pageX = window.innerWidth;
const score = document.querySelector(".score");
const player = document.querySelector(".player");
const laser = document.querySelector(".laser");
const apple = document.querySelector(".apple");

function shot(position) {
    if (inAction || !gaming) return;
    inAction = true;
    player.style.top = `${((pageY - player.offsetHeight) / 100) * position}px`;
    laser.classList.add("transition");
    laser.style.transitionDuration = "1s";
    laser.style.left = `${pageX}px`;
    laser.ontransitionend = () => {
        laser.classList.remove("transition");
        laser.style.transitionDuration = "0ms";
        setTimeout(() => {
            laser.style.left = "0px";
            inAction = false;
        }, 1000);
    };
}

function spawnEnemy() {
    if (!gaming) gaming = true;
    apple.classList.add("transition");
    apple.classList.remove("hide");
    apple.style.top = `${Math.random() * (pageY - apple.offsetHeight) | 0}px`;
    apple.style.right = `${Math.random() * (pageX / 4) | 0}px`;
    appleTransition = setTimeout(() => spawnEnemy(), 2000);
}

(function collisionDetection() {
    let obj1 = laser.getBoundingClientRect();
    let obj2 = apple.getBoundingClientRect();
    if (obj1.left < obj2.left + obj2.width && obj1.left + obj1.width > obj2.left &&
        obj1.top < obj2.top + obj2.height && obj1.top + obj1.height > obj2.top) {
        if (!gaming) return;
        scoreGame++;
        score.innerText = scoreGame;
        apple.style.top = `${obj2.top}px`;
        apple.style.left = `${obj2.left}px`;
        explode(obj2.left + (obj2.width / 2), obj2.top + (obj2.height / 2));
        clearTimeout(appleTransition);
        apple.classList.add("hide");
        apple.classList.remove("transition");
        setTimeout(() => spawnEnemy(), 10000);
        gaming = false;
    }
    setTimeout(() => collisionDetection(), 2);
})();
spawnEnemy();

// explosion from https://codepen.io/alek/pen/EyyLgp
// click event listener
$('body').on('click', function (e) {
    const posY = (e.pageY / (pageY / 100));
    shot(posY);
})

// explosion construction
function explode(x, y) {
    let particles = 15,
        // explosion container and its reference to be able to delete it on animation end
        explosion = $('<div class="explosion"></div>');

    // put the explosion container into the body to be able to get it's size
    $('body').append(explosion);

    // position the container to be centered on click
    explosion.css('left', x - explosion.width() / 2);
    explosion.css('top', y - explosion.height() / 2);

    for (let i = 0; i < particles; i++) {
        // positioning x,y of the particle on the circle (little randomized radius)
        let x = (explosion.width() / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
            y = (explosion.height() / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
            color = rand(0, 255) + ', ' + rand(0, 255) + ', ' + rand(0, 255), // randomize the color rgb
            // particle element creation (could be anything other than div)
            elm = $('<div class="particle" style="' +
                'background-color: rgb(' + color + ') ;' +
                'top: ' + y + 'px; ' +
                'left: ' + x + 'px"></div>');

        if (i == 0) { // no need to add the listener on all generated elements
            // css3 animation end detection
            elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
                explosion.remove(); // remove this explosion container when animation ended
            });
        }
        explosion.append(elm);
    }
}

// get random number between min and max value
function rand(min, max) {
    return Math.floor(Math.random() * (max + 1)) + min;
}