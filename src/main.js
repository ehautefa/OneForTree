import { io } from "socket.io-client";
const socket = io();
localStorage.debug = "socket.io-client:socket";
var world = [];

//Connect to server
socket.on("connect", (e) => {
  console.log("connection established");

  socket.emit("create", { name: "mbeilles" }, (data) => {
    console.log(data);

    // user = data.user;
    // leaderboard = data.users;
    // map = data.map;
    world = data.map;

    launchGame();
  });

  socket.on("login", (data) => {
    console.log(data);
  });

  socket.on("move", ({ uuid, next, prev }) => {
    console.log("player moved: ", uuid, next, prev);
  });
});

async function launchGame() {
  let player;
  let playerSheet = {};
  let playerPosition = { x: 0, y: 0 };

  // Create the application helper and add its render target to the page

  let app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundAlpha: 0,
  });
  document.body.appendChild(app.view);
  app.renderer.view.style.display = "block";
  app.renderer.autoResize = true;
  window.onresize = function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  };

  function randomNumber(min, max) {

    return Math.random() * (max - min) + min;
  }

  // Create the sprite and add it to the stage
  var grass = createTile('/src/assets/Grass', 3);
  var ground = createTile('/src/assets/Soft_Ground', 3);
  var labored = createTile('/src/assets/Labored_Ground', 1);
  var plant = createTile('/src/assets/Plant', 1);
  var tileMethods = [{ tile: grass, type: 'shrub' }, { tile: ground, type: 'dry' }, { tile: labored, type: 'plowed' }, { tile: plant, type: 'seeded' }];

  function createTile(name, tileNumber) {
    return function (position) {
      let filename = name + (tileNumber > 1 ? parseInt(randomNumber(1, tileNumber)).toString() : '') + '.png';
      let square = new PIXI.Sprite.from(filename);
      square.position.set(position.x * 100, position.y * 100);
      square.width = 100;
      square.height = 100;
      return square;
    }
  }

  function doneLoading(e) {
    createPlayerSheet();
    createPlayer();
    app.ticker.add(gameLoop);
  }

  app.loader.add("viking", "/src/assets/viking.png");
  app.loader.load(doneLoading);

  function createPlayer() {
    player = new PIXI.AnimatedSprite(playerSheet.walkSouth);
    player.anchor.set(0.5);
    player.animationSpeed = 0.18;
    player.loop = false;
    player.x = parseInt(app.view.width / 2);
    player.y = parseInt(app.view.height / 2);
    app.stage.addChild(player);
    player.play();
    player.width = 100;
    player.height = 100
  }

  function createPlayerSheet() {
    let ssheet = new PIXI.BaseTexture.from(app.loader.resources["viking"].url);
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

  function doneLoading(e) {
    createPlayerSheet();
    createPlayer();
    app.ticker.add(gameLoop);
  }

  function gameLoop() {
    if (playerDestination.y > mapContainer.y) {
      if (!player.playing) {
        player.textures = playerSheet.walkNorth;
        player.play();
      }
    }
    //a
    else if (playerDestination.x > mapContainer.x) {
      if (!player.playing) {
        player.textures = playerSheet.walkWest;
        player.play();
      }
    }
    //s
    else if (playerDestination.y < mapContainer.y) {
      if (!player.playing) {
        player.textures = playerSheet.walkSouth;
        player.play();
      }
    }
    //d
    else if (playerDestination.x < mapContainer.x) {
      if (!player.playing) {
        player.textures = playerSheet.walkEast;
        player.play();
      }
    }
  }

  const offset = { x: parseInt(app.view.width / 2) - 15, y: parseInt(app.view.height / 2) - 5 };

  let mapContainer = new PIXI.Container();

  let playerDestination = { x: 0, y: 0 };
  playerDestination.setPlayerDestination = (val) => {
    playerPosition = val;
    val.x != undefined ? (playerDestination.x = val.x * 100 + offset.x) : null;
    val.y != undefined ? (playerDestination.y = val.y * 100 + offset.y) : null;
  };

  playerDestination.setPlayerDestination({ x: 0, y: 0 });

  setInterval(() => {
    if (playerDestination.x > mapContainer.x) {
      mapContainer.x++;
    } else if (playerDestination.x < mapContainer.x) {
      mapContainer.x--;
    }
    if (playerDestination.y > mapContainer.y) {
      mapContainer.y++;
    } else if (playerDestination.y < mapContainer.y) {
      mapContainer.y--;
    }
  }, 10);

  let itemsMap = world.map((row, y) => {
    let currentRow = row.map((cell, x) => {
      console.log("cell :", cell);
      let currentCell = tileMethods.find((tile) => { return tile.type === cell }).tile({ x: x, y: y });
      currentCell.interactive = true;
      currentCell.on("pointerdown", (e) => {
        console.log("ptr dw:", y, x);
        playerDestination.setPlayerDestination({ x: -x, y: -y });
      });
      mapContainer.addChild(currentCell);
      return currentCell;
    });
    return currentRow;
  });

  app.stage.addChild(mapContainer);

  document.addEventListener(
    "keydown",
    (event) => {
      var name = event.key;
      if (name == "ArrowRight") playerPosition.x--;
      if (name == "ArrowDown") playerPosition.y--;
      if (name == "ArrowUp") playerPosition.y++;
      if (name == "ArrowLeft") playerPosition.x++;
      playerDestination.setPlayerDestination(playerPosition);
    },
    false
  );

  // PROFILE CHARACTERS
  // ----------------------------------------------------------
  let planterCarac = {
    nbSeeds: 0,
  };

  let sprinklerCarac = {
    liters: 0,
  };

  // EFFECTS BLOCKS
  // ----------------------------------------------------------




  // PLAYER UI
  // ----------------------------------------------------------
  // UI Player Activities Init
  var playersActivitiesSprite = PIXI.Sprite.from('./src/assets/players_activities_sprite.png');
  playersActivitiesSprite.x = 1366 - 260;
  playersActivitiesSprite.y = 10;

  var playersActivitiesSpriteTitle = PIXI.Sprite.from('./src/assets/players_activities_title_sprite.png');
  playersActivitiesSpriteTitle.x = 10;
  playersActivitiesSpriteTitle.y = 10;
  playersActivitiesSprite.addChild(playersActivitiesSpriteTitle);

  // UI LifeBar Init
  var healthBarSprite = PIXI.Sprite.from('./src/assets/lifebar_sprite.png');
  healthBarSprite.x = 1366 - 300;
  healthBarSprite.y = 10;

  // UI ProfileType Init
  let textProfileContent = "Profile Type :";
  let powerCapacityBar = new PIXI.Graphics();

  let textProfile = new PIXI.Text(textProfileContent, {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    align: 'center'
  });

  textProfile.position.x = 20;
  textProfile.position.y = 718;
  textProfile.zIndex = 0;

  powerCapacityBar.beginFill(0xffffff, 0.75);
  powerCapacityBar.drawRect(textProfile.width + 28, 718, 250, 30);

  // UI Deploy
  app.stage.addChild(playersActivitiesSprite, healthBarSprite, textProfile, powerCapacityBar);

  console.log(textProfile.width);
}
