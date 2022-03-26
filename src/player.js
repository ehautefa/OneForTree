let app;
let player;
let keys = {};
let keysDiv;
let playerSheet = {};
let speed = 2;

window.onload = function () {
    app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x00000,
    });

    document.body.appendChild(app.view);

    app.loader.add("viking", "/public/viking.png");
    app.loader.load(doneLoading);

    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
};

function doneLoading(e) {
    createPlayerSheet();
    createPlayer();
    app.ticker.add(gameLoop);
}

function createPlayerSheet() {
    let ssheet = new PIXI.BaseTexture.from(
        app.loader.resources["viking"].url
    );
    let w = 26;
    let h = 36;

    playerSheet["standSouth"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0, w, h)),
    ];

    playerSheet["standWest"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 0, w, h)),
    ];
    playerSheet["standEast"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(7 * w, 0, w, h)),
    ];
    playerSheet["standNorth"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(10 * w, 0, w, h)),
    ];

    playerSheet["walkSouth"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 0, w, h)),
    ];
    playerSheet["walkWest"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 0, w, h)),
    ];
    playerSheet["walkEast"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(6 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(7 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(8 * w, 0, w, h)),
    ];
    playerSheet["walkNorth"] = [
        new PIXI.Texture(ssheet, new PIXI.Rectangle(9 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(10 * w, 0, w, h)),
        new PIXI.Texture(ssheet, new PIXI.Rectangle(11 * w, 0, w, h)),
    ];
}

function createPlayer() {
    player = new PIXI.AnimatedSprite(playerSheet.walkSouth);
    player.anchor.set(0.5);
    player.animationSpeed = 0.18;
    player.loop = false;
    player.x = app.view.width / 2;
    player.y = app.view.height / 2;
    app.stage.addChild(player);
    player.play();
}
// kb interactivity
function keysDown(e) {
    keys[e.keyCode] = true;
}

function keysUp(e) {
    keys[e.keyCode] = false;
}

function gameLoop() {
    if (keys["87"]) {
        if (!player.playing) {
            player.textures = playerSheet.walkNorth;
            player.play();
        }
        player.y -= speed;
    }
    //a
    if (keys["65"]) {
        if (!player.playing) {
            player.textures = playerSheet.walkWest;
            player.play();
        }
        player.x -= speed;
    }
    //s
    if (keys["83"]) {
        if (!player.playing) {
            player.textures = playerSheet.walkSouth;
            player.play();
        }
        player.y += speed;
    }
    //d
    if (keys["68"]) {
        if (!player.playing) {
            player.textures = playerSheet.walkEast;
            player.play();
        }
        player.x += speed;
    }
}
//mouse interactions:
/*function movePlayer(event) {
  let pos = event.data.global; // get mouse position
  player.x = pos.x;
  player.y = pos.y;
}*/