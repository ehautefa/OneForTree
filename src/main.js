import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
import { createSheet } from "./sheet";
import { createNpc, createPlayer } from "./player";
const socket = io();
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

  function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Create the sprite and add it to the stage
  var grass = createTile("/src/assets/Grass", 3);
  var ground = createTile("/src/assets/Soft_Ground", 3);
  var labored = createTile("/src/assets/Labored_Ground", 1);
  var plant = createTile("/src/assets/Plant", 1);
  var water = createAnimatedTile("/src/assets/Water", 3);
  var tileMethods = [
    { tile: grass, type: "shrub" },
    { tile: ground, type: "dry" },
    { tile: labored, type: "plowed" },
    { tile: plant, type: "seeded" },
    { tile: water, type: "water" },
  ];

  function createTile(name, tileNumber) {
    return function (position) {
      let filename =
        name +
        (tileNumber > 1
          ? parseInt(randomNumber(1, tileNumber)).toString()
          : "") +
        ".png";
      let square = new PIXI.Sprite.from(filename);
      square.position.set(position.x * 120, position.y * 120);
      square.width = 120;
      square.height = 120;
      return square;
    };
  }

  function createAnimatedTile(filename, numberAnimation) {
    return function (position) {
      let w = 60;
      let h = 60;

      let ssheet = new PIXI.BaseTexture.from(filename + ".png");

      let Images = [];
      for (let i = 0; i < numberAnimation; i++) {
        Images.push(
          new PIXI.Texture(ssheet, new PIXI.Rectangle(i * w, 0, w, h))
        );
      }

      let tile = new PIXI.AnimatedSprite(Images);
      tile.animationSpeed = 0.1;
      tile.loop = true;
      tile.position.set(position.x * 120, position.y * 120);
      tile.width = 120;
      tile.height = 120;
      tile.play();
      return tile;
    };
  }

  function setup(e) {
    let playerSheet = createSheet({
      name: "laboureur",
      rect: { w: 60, h: 60 },
      animations: {
        standNorth: { start: 13, end: 17 },
        standSouth: { start: 13, end: 17 },
        standEast: { start: 18, end: 22 },
        standWest: { start: 23, end: 27 },
        walkNorth: { start: 9, end: 11 },
        walkSouth: { start: 0, end: 2 },
        walkWest: { start: 3, end: 5 },
        walkEast: { start: 6, end: 8 },
        default: { start: 13, end: 17 },
      },
      app,
    });
    let [player, setPosition, setAnimation] = createPlayer({
      x: app.view.width / 2,
      y: app.view.height / 2,
      sheet: playerSheet,
      idle: () => console.log("player idle"),
    });
    setPosition(({ x, y }) => ({ x: 0, y: 0 }));

    let mapContainer = new PIXI.Container();
    mapContainer.x = app.view.width / 2 - 60;
    mapContainer.y = app.view.height / 2 - 30;

    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        //let currentCell = tileMethods[x % 5].tile({ x: x, y: y });
        let currentCell = tileMethods
          .find((tile) => {
            return tile.type === cell;
          })
          ?.tile({ x, y });
        if (!currentCell) return;
        currentCell.interactive = true;
        currentCell.on("pointerdown", (e) => {
          console.log("ptr dw:", x, y);
          setPosition(() => ({ x: x, y: y }));
        });
        mapContainer.addChild(currentCell);
      });
    });

    let players = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let [npc, setPosition, setAnimation] = createNpc({
          x: i,
          y: j,
          sheet: playerSheet,
        });
        mapContainer.addChild(npc.render);
        players.push({ npc, setPosition, setAnimation });
      }
    }

    // Make npc move
    setInterval(() => {
      players.forEach(({ npc, setPosition }) => {
        setPosition(() => ({
          x: Math.floor(Math.random() * map[0].length),
          y: Math.floor(Math.random() * map.length),
        }));
      });
    }, 10_000);

    // Move players position
    setInterval(() => {
      // Player
      if (player.position.pixel.x > mapContainer.x) {
        mapContainer.x++;
      } else if (player.position.pixel.x < mapContainer.x) {
        mapContainer.x--;
      }
      if (player.position.pixel.y > mapContainer.y) {
        mapContainer.y++;
      } else if (player.position.pixel.y < mapContainer.y) {
        mapContainer.y--;
      }
      // Npc
      players.forEach(({ npc }) => {
        if (npc.position.pixel.x > npc.render.x) {
          npc.render.x++;
        } else if (npc.position.pixel.x < npc.render.x) {
          npc.render.x--;
        }
        if (npc.position.pixel.y > npc.render.y) {
          npc.render.y++;
        } else if (npc.position.pixel.y < npc.render.y) {
          npc.render.y--;
        }
      });
    }, 10);

    app.stage.addChild(mapContainer);

    player.render.play();
    app.stage.addChild(player.render);

    document.addEventListener(
      "keydown",
      (event) => {
        var name = event.key;
        if (name == "ArrowRight") setPosition(({ x, y }) => ({ x: x - 1, y }));
        if (name == "ArrowLeft") setPosition(({ x, y }) => ({ x: x + 1, y }));
        if (name == "ArrowDown") setPosition(({ x, y }) => ({ x, y: y - 1 }));
        if (name == "ArrowUp") setPosition(({ x, y }) => ({ x, y: y + 1 }));
      },
      false
    );

    app.ticker.add(() =>
      gameLoop({
        player: [player, setPosition, setAnimation, mapContainer],
        players,
      })
    );
  }

  function gameLoop({
    player: [player, setPosition, setAnimation, map],
    players,
  }) {
    if (player.position.pixel.y > map.y) {
      player.state = "working";
      player.direction = "N";
      setAnimation("walkNorth");
    } else if (player.position.pixel.x > map.x) {
      player.state = "working";
      player.direction = "W";
      setAnimation("walkWest");
    } else if (player.position.pixel.y < map.y) {
      player.state = "working";
      player.direction = "S";
      setAnimation("walkSouth");
    } else if (player.position.pixel.x < map.x) {
      player.state = "working";
      player.direction = "E";
      setAnimation("walkEast");
    } else {
      // TODO type this
      let idle = {
        N: () => setAnimation("standNorth"),
        S: () => setAnimation("standSouth"),
        E: () => setAnimation("standEast"),
        W: () => setAnimation("standWest"),
      };
      idle[player.direction]();
      if (player.state === "working") {
        player.idle();
        player.state = "idle";
      }
    }
    players.forEach(({ npc, setAnimation }) => {
      if (npc.position.pixel.y < npc.render.y) {
        npc.direction = "N";
        setAnimation("walkNorth");
      } else if (npc.position.pixel.x < npc.render.x) {
        npc.direction = "W";
        setAnimation("walkWest");
      } else if (npc.position.pixel.y > npc.render.y) {
        npc.direction = "S";
        setAnimation("walkSouth");
      } else if (npc.position.pixel.x > npc.render.x) {
        npc.direction = "E";
        setAnimation("walkEast");
      } else {
        // TODO type this
        let idle = {
          N: () => setAnimation("standNorth"),
          S: () => setAnimation("standSouth"),
          E: () => setAnimation("standEast"),
          W: () => setAnimation("standWest"),
        };
        idle[npc.direction]();
      }
    });
  }

  // Game start
  app.loader.add("laboureur", "/src/assets/Anim_Laboureur_AllSprites.png");
  app.loader.load(setup);

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
