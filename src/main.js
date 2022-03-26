import { io } from "socket.io-client";
import { createTileMap } from "./tilemap";

const socket = io();
localStorage.debug = "socket.io-client:socket";
let map = [];
let user = {};
let leaderboard = [];

//Connect to server
socket.on("connect", (e) => {
  console.log("connection established");

  socket.emit("create", { name: "mbeilles" }, (data) => {
    console.log(data);

    user = data.user;
    leaderboard = data.users;
    map = data.map;

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
    antialias: false,
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

  app.loader.add("laboureur", "/src/assets/Anim_Laboureur_AllSprites.png");
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
    player.width = 120;
    player.height = 120;
  }

  function createPlayerSheet() {
    let ssheet = new PIXI.BaseTexture.from(
      app.loader.resources["laboureur"].url
    );
    let w = 60;
    let h = 60;

    playerSheet["standSouth"] = [
      new PIXI.Texture(ssheet, new PIXI.Rectangle(13 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(14 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(15 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(16 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(17 * w, 0, w, h)),
    ];

    playerSheet["standWest"] = [
      new PIXI.Texture(ssheet, new PIXI.Rectangle(23 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(24 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(25 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(26 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(27 * w, 0, w, h)),
    ];
    playerSheet["standEast"] = [
      new PIXI.Texture(ssheet, new PIXI.Rectangle(18 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(19 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(20 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(21 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(22 * w, 0, w, h)),
    ];
    playerSheet["standNorth"] = [
      new PIXI.Texture(ssheet, new PIXI.Rectangle(13 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(14 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(15 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(16 * w, 0, w, h)),
      new PIXI.Texture(ssheet, new PIXI.Rectangle(17 * w, 0, w, h)),
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

  let mapContainer = createTileMap(map, (x, y) => {
    playerDestination.setPlayerDestination({ x: -x, y: -y });
  });

  let dir = "N";
  function gameLoop() {
    //	var dir = 'N';
    if (playerDestination.y > mapContainer.y) {
      dir = "N";
      if (!player.playing) {
        player.textures = playerSheet.walkNorth;
        player.play();
      }
    }
    //a
    else if (playerDestination.x > mapContainer.x) {
      dir = "W";
      if (!player.playing) {
        player.textures = playerSheet.walkWest;
        player.play();
      }
    }
    //s
    else if (playerDestination.y < mapContainer.y) {
      dir = "S";
      if (!player.playing) {
        player.textures = playerSheet.walkSouth;
        player.play();
      }
    }
    //d
    else if (playerDestination.x < mapContainer.x) {
      dir = "E";
      if (!player.playing) {
        player.textures = playerSheet.walkEast;
        player.play();
      }
    }
    if (dir == "N") {
      if (!player.playing) {
        player.textures = playerSheet.standNorth;
        player.play();
      }
    } else if (dir == "S") {
      if (!player.playing) {
        player.textures = playerSheet.standSouth;
        player.play();
      }
    } else if (dir == "W") {
      if (!player.playing) {
        player.textures = playerSheet.standWest;
        player.play();
      }
    } else if (dir == "E") {
      if (!player.playing) {
        player.textures = playerSheet.standEast;
        player.play();
      }
    }
  }

  const offset = {
    x: parseInt(app.view.width / 2) - 60,
    y: parseInt(app.view.height / 2) - 20
  };

  let playerDestination = { x: 0, y: 0 };
  playerDestination.setPlayerDestination = (val) => {
    playerPosition = val;
    val.x != undefined ? (playerDestination.x = val.x * 120 + offset.x) : null;
    val.y != undefined ? (playerDestination.y = val.y * 120 + offset.y) : null;
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
  var playersActivitiesSprite = PIXI.Sprite.from(
    "./src/assets/players_activities_sprite.png"
  );
  playersActivitiesSprite.x = screen.width - 260;
  playersActivitiesSprite.y = 10;
  playersActivitiesSprite.height = visualViewport.height - 20;

  let playersActivitiesSpriteTitle = new PIXI.Text("Player Activities", {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0x000000,
    align: "center",
  });
  playersActivitiesSpriteTitle.x = screen.width - 250;
  playersActivitiesSpriteTitle.y = 20;

  // UI LifeBar Init
  var healthBarSprite = PIXI.Sprite.from("./src/assets/lifebar_sprite.png");
  healthBarSprite.x = screen.width - 300;
  healthBarSprite.y = 10;
  healthBarSprite.height = visualViewport.height - 20;

  // UI ProfileType Init
  let textProfileContent = "Profile Type :";
  let powerCapacityBar = new PIXI.Graphics();

  let textProfile = new PIXI.Text(textProfileContent, {
    fontFamily: "Arial",
    fontSize: 24,
    fill: 0xffffff,
    align: "center",
  });

  textProfile.anchor.set(0, 0);
  textProfile.position.x = 20;
  textProfile.position.y = visualViewport.height - 50;

  powerCapacityBar.beginFill(0xffffff, 0.75);
  powerCapacityBar.drawRect(
    textProfile.width + 28,
    visualViewport.height - 50,
    250,
    30
  );

  // UI Deploy
  app.stage.addChild(
    playersActivitiesSprite,
    playersActivitiesSpriteTitle,
    healthBarSprite,
    textProfile,
    powerCapacityBar
  );

  console.log(textProfile.width);
}
