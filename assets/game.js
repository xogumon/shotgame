let pageX = $(window).width(),
    pageY = $(window).height(),
    enemy,
    enemyEl = $('<div class="enemy"></div>'),
    enemyTimeout,
    enemyRespawn = 4000,
    enemyMovement = 4000,
    score = $(".score"),
    player = $(".player"),
    playerMovement = 100,
    laser = $(".laser"),
    laserVelocity = 700,
    inAction = false,
    scoreGame = 0;

function laserShot(position = 50) {
    if (inAction) return;

    inAction = true;

    if (position < 0) position = 0;
    if (position > 100) position = 100;

    player.animate({
        top: `${((pageY - player.outerHeight(true)) / 100) * position}px`
    }, playerMovement, function () {
        laser.animate({
            left: `${pageX}px`
        }, laserVelocity, function () {
            laser.removeAttr("style");
            inAction = false;
        });
    });
}

function enemyShow() {
    let topPos = () => rand(0, pageY - enemy.outerHeight(true));
    enemy = enemyEl.clone();
    enemy.css("top", `${topPos()}px`);
    $('body').append(enemy);
    (function enemyAnimate() {
        enemy.animate({
            opacity: 1,
            top: `${topPos()}px`,
            right: `${rand(0, pageX / 4)}px`
        }, enemyMovement);
        enemyTimeout = setTimeout(() => enemyAnimate(), enemyMovement * 0.2);
    })();
}
enemyShow();

(function collisionDetection() {
    function collision($div1, $div2) {
        let x1 = $div1.offset().left;
        let y1 = $div1.offset().top;
        let h1 = $div1.outerHeight(true);
        let w1 = $div1.outerWidth(true);
        let b1 = y1 + h1;
        let r1 = x1 + w1;
        let x2 = $div2.offset().left;
        let y2 = $div2.offset().top;
        let h2 = $div2.outerHeight(true);
        let w2 = $div2.outerWidth(true);
        let b2 = y2 + h2;
        let r2 = x2 + w2;
        if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
        return true;
    }
    if (collision(laser, enemy)) {
        scoreGame++;
        score.text(scoreGame);
        explode(enemy.offset().left + (enemy.outerWidth(true) / 2), enemy.offset().top + (enemy.outerHeight(true) / 2));
        enemy.remove();
        clearTimeout(enemyTimeout);
        setTimeout(() => enemyShow(), enemyRespawn);
    }
    setTimeout(() => collisionDetection(), 10);
})();

function explode(x, y) {
    let particles = 15,
        explosion = $('<div class="explosion"></div>');

    $('body').append(explosion);

    explosion.css('left', x - explosion.width() / 2);
    explosion.css('top', y - explosion.height() / 2);

    for (let i = 0; i < particles; i++) {
        let x = (explosion.width() / 2) + rand(80, 150) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
            y = (explosion.height() / 2) + rand(80, 150) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
            color = rand(0, 255) + ', ' + rand(0, 255) + ', ' + rand(0, 255),
            elm = $('<div class="particle" style="' +
                'background-color: rgb(' + color + ') ;' +
                'top: ' + y + 'px; ' +
                'left: ' + x + 'px"></div>');

        if (i == 0) {
            elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
                explosion.remove();
            });
        }

        explosion.append(elm);
    }
}

function rand(min, max) {
    return Math.floor(Math.random() * (max + 1)) + min;
}

$('body').on('click', function (e) {
    laserShot(e.pageY / (pageY / 100));
});

$(window).resize(function () {
    location.reload(true)
});

if (location && location.hash.length) {
    // twitch chat commands support
    const client = new tmi.Client({
        options: { debug: true },
        channels: [location.hash]
    });
    client.connect().catch(console.error);
    client.on('message', (channel, tags, message, self) => {
        if (self) return;
        if (message.toLowerCase().startsWith('atirar')) {
            let args = message.split(" ");
            if (args && args[1]) {
                let position = parseInt(args[1]);
                laserShot(position)
            }
        }
    });
}