import { io } from "socket.io-client";
const socket = io();
localStorage.debug = "socket.io-client:socket";
let map = [];
let user = {};
let leaderboard = [];
let mapCells = [];

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

  socket.on("edit", (data) => {
    console.log("tile edited:", data);
  } ) 
});

async function launchGame() {
  let player;
  let keys = {};
  let keysDiv;
  // let playerSheet = {};
  let speed = 2;
  // let playerPosition = { x: 0, y: 0 };
  let othersPlayers = [];
  let mapContainer = new PIXI.Container();

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
  var tileMethods = [
    { tile: grass, type: "shrub" },
    { tile: ground, type: "dry" },
    { tile: labored, type: "plowed" },
    { tile: plant, type: "seeded" },
  ];

  function doneLoading(e) {
    createTileMap();

    let playerSheet = createPlayerSheet(app.loader.resources["laboureur"].url);
    createPlayer(user, playerSheet);
    app.ticker.add(gameLoop);
    setInterval(() => {
      computePlayerMoves();
      computeOtherPlayerMoves();
    }, 10);
  }

  app.loader.add("laboureur", "/src/assets/Anim_Laboureur_AllSprites.png");
  app.loader.load(doneLoading);

  function setDestination(value, player) {
    socket.emit("move", { position: value, uuid: user.id }, (data) => {
      console.log("Move received data :", data);

      data.position.x != undefined
        ? (player.destination.pixels.x = -data.position.x * 100 + offset.x)
        : null;
      data.position.y != undefined
        ? (player.destination.pixels.y = -data.position.y * 100 + offset.y)
        : null;
      data.position.x != undefined
        ? (player.destination.tiles.x = data.position.x)
        : null;
      data.position.y != undefined
        ? (player.destination.tiles.y = data.position.y)
        : null;
    });
  }

  function setDestinationAchived(value) {
    console.log("request edit", value);
    socket.emit("edit", {position: value, user}, (data) => {
      console.log("edit data :", data);
    })
  }

  function createTileMap() {
   mapCells = map.map((row, y) => {
    const currentRow = row.map((cell, x) => {
        let cellContainer = new PIXI.Container();
        let currentCell = tileMethods
          .find((tile) => {
            return tile.type === cell;
          })
          ?.tile({ x, y });
        if (!currentCell) return;
        currentCell.interactive = true;
        currentCell.on("pointerdown", (e) => {
          console.log("ptr dw:", y, x);
          // player.setDestination({ x: x, y: y });
          player.setDestination({ x: x, y: y });
        });
        currentCell.type = "ground";
        cellContainer.tilePosition = {x, y};
        cellContainer.addChild(currentCell);

        mapContainer.addChild(cellContainer);
        return (currentCell);
      });
      return (currentRow);
    });
  
    console.log("Map created :", mapCells);
    app.stage.addChild(mapContainer);
  }


  function createTile(name, tileNumber) {
    return function (position) {
      let filename =
        name +
        (tileNumber > 1
          ? parseInt(randomNumber(1, tileNumber)).toString()
          : "") +
        ".png";
      let square = new PIXI.Sprite.from(filename);
      square.position.set(position.x * 100, position.y * 100);
      square.width = 100;
      square.height = 100;
      return square;
    };
  }

  function createPlayer({ x, y }, playerSheet) {
    player = new PIXI.AnimatedSprite(playerSheet.walkSouth);
    player.playerSheet = playerSheet;
    player.anchor.set(0.5);
    player.animationSpeed = 0.18;
    player.loop = false;
    player.x = parseInt(app.view.width / 2);
    player.y = parseInt(app.view.height / 2);
    app.stage.addChild(player);
    player.play();
    player.width = 200;
    player.height = 200;
    player.destination = {
      pixels: { x: x * 60 + 15, y: y * 60 + 5 },
      tiles: { x, y },
    };

    player.setDestination = (val) => setDestination(val, player);

    // player.setDestination = (val) => {
    //   // playerPosition = val;
    //   val.x != undefined
    //     ? (player.destination.pixels.x = -val.x * 100 + offset.x)
    //     : null;
    //   val.y != undefined
    //     ? (player.destination.pixels.y = -val.y * 100 + offset.y)
    //     : null;
    //   val.x != undefined ? (player.destination.tiles.x = val.x) : null;
    //   val.y != undefined ? (player.destination.tiles.y = val.y) : null;

    // };
  }

  function createOtherPlayer({ x, y, id }, playerSheet) {
    let otherPlayer = new PIXI.AnimatedSprite(playerSheet.walkSouth);
    otherPlayer.id = id;
    otherPlayer.anchor.set(0.5);
    otherPlayer.animationSpeed = 0.18;
    otherPlayer.loop = false;
    otherPlayer.x = x * 30 + 15;
    otherPlayer.y = y * 30 + 5;
    mapContainer.addChild(otherPlayer);
    otherPlayer.play();
    otherPlayer.playerSheet = playerSheet;
    otherPlayer.currentPosition = { x: x * 30 + 15, y: y * 30 + 5 };
    otherPlayer.futurePosition = {
      pixels: { x: x * 30 + 15, y: y * 30 + 5 },
      tiles: { x, y },
    };
    //  { x: x * 30 + 15, y: y * 30 + 5 };
    otherPlayer.width = 200;
    otherPlayer.height = 200;

    // tiles: {x:0, y:0},
    // pixels: {x:0, y:0},
    // x: 0, y: 0
    otherPlayer.setPlayerDestination = (val) => {
      // playerPosition = val;
      val.x != undefined
        ? (otherPlayer.futurePosition.pixels.x = val.x * 100 + offset.x)
        : null;
      val.y != undefined
        ? (otherPlayer.futurePosition.pixels.y = val.y * 100 + offset.y)
        : null;
      val.x != undefined ? (otherPlayer.futurePosition.tiles.x = val.x) : null;
      val.y != undefined ? (otherPlayer.futurePosition.tiles.y = val.y) : null;
    };

    return otherPlayer;
  }

  function createPlayerSheet(texture) {
    let playerSheet = {};
    let ssheet = new PIXI.BaseTexture.from(texture);
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
    return playerSheet;
  }

  // FAKE SOCKETS EVENT
  //
  //
  //
  setInterval(() => {
    let rdmX = Math.floor(Math.random() * 10);
    let rdmY = Math.floor(Math.random() * 10);
    // let newCell = tileMethods
    // .find((tile) => {
    //   return tile.type === cell;
    // })
    // ?.tile({ x:rdmX, y:rdmY });
    // newCell

    // console.log("Map cell : ", mapCells[rdmY][rdmX])
    // let texture01 = PIXI.Texture.from("/src/assets/Grass.png");
    // mapCells[rdmY][rdmX].set(texture01);

    const newCellType = tileMethods[Math.floor(Math.random() * 4)].type;

    // console.log("MapContainer values", mapContainer.children)
    // mapContainer.children.forEach((item, i) => console.log("mapitem,", item, i))
    // let currentTileTest = mapContainer.children[0].tilePosition;
    let currentTile = mapContainer.children.find((item) => item.tilePosition.x == rdmX && item.tilePosition.y == rdmY)
    // console.log("current tile", currentTile, rdmX, rdmY);
    // console.log("current tile AAAA", currentTileTest, rdmX, rdmY);
    // let oldChild = currentTile.children.find((item) => item.type == "ground")
    currentTile.removeChild(currentTile.children.find((item) => item.type == "ground"));
    let newChild = tileMethods
    .find((tile) => {
      return tile.type === newCellType;
    })
    ?.tile({ x:rdmX, y:rdmY });
    if (!newChild) return;
    currentTile.addChild(newChild);
  }, 500)



  setInterval(() => {
    let othersPlayerSheet = createPlayerSheet(
      app.loader.resources["laboureur"].url
    );
    othersPlayers.push(
      createOtherPlayer(
        { x: othersPlayers.length, y: 3, id: othersPlayers.length },
        othersPlayerSheet
      )
    );
    // function createOtherPlayer({x, y},playerSheet)
  }, 5000);

  setInterval(() => {
    let selectId = Math.floor(Math.random() * othersPlayers.length);
    let rdmX = Math.floor(Math.random() * 40);
    let rdmy = Math.floor(Math.random() * 40);
    // console.log("PPPPP", selectId);
    othersPlayers[selectId].setPlayerDestination({ x: rdmX, y: rdmy });

    // othersPlayers[selectId].futurePosition = { x: rdmX, y: rdmy };
  }, 1000);
  //
  //
  //
  // FAKE SOCKETS EVENT
  let dir = "N";

  function computePlayerAnimation() {
    if (player.destination.pixels.y > mapContainer.y) {
      if (!player.playing) {
        player.textures = player.playerSheet.walkNorth;
        player.play();
      }
      dir = "N";
    }
    //a
    else if (player.destination.pixels.x > mapContainer.x) {
      if (!player.playing) {
        player.textures = player.playerSheet.walkWest;
        player.play();
      }
      dir = "W";
    }
    //s
    else if (player.destination.pixels.y < mapContainer.y) {
      if (!player.playing) {
        player.textures = player.playerSheet.walkSouth;
        player.play();
      }
      dir = "S";
    }
    //d
    else if (player.destination.pixels.x < mapContainer.x) {
      if (!player.playing) {
        player.textures = player.playerSheet.walkEast;
        player.play();
      }
      dir = "E";
    }
    if (dir == "N") {
      if (!player.playing) {
        player.textures = player.playerSheet.standNorth;
        player.play();
      }
    } else if (dir == "S") {
      if (!player.playing) {
        player.textures = player.playerSheet.standSouth;
        player.play();
      }
    } else if (dir == "W") {
      if (!player.playing) {
        player.textures = player.playerSheet.standWest;
        player.play();
      }
    } else if (dir == "E") {
      if (!player.playing) {
        player.textures = player.playerSheet.standEast;
        player.play();
      }
    }
  }

  const offset = {
    x: parseInt(app.view.width / 2) - 50,
    y: parseInt(app.view.height / 2) + 50,
  };
  function computeOthersPlayersAnimation() {
    othersPlayers.forEach((otherPlayer) => {
      if (otherPlayer.futurePosition.pixels.y > otherPlayer.y) {
        if (!otherPlayer.playing) {
          otherPlayer.textures = otherPlayer.playerSheet.walkSouth;
          otherPlayer.play();
        }
      }
      //a
      else if (otherPlayer.futurePosition.pixels.x > otherPlayer.x) {
        if (!otherPlayer.playing) {
          otherPlayer.textures = otherPlayer.playerSheet.walkEast;
          otherPlayer.play();
        }
      }
      //s
      else if (otherPlayer.futurePosition.pixels.y < otherPlayer.y) {
        if (!otherPlayer.playing) {
          otherPlayer.textures = otherPlayer.playerSheet.walkNorth;
          otherPlayer.play();
        }
      }
      //d
      else if (otherPlayer.futurePosition.pixels.x < otherPlayer.x) {
        if (!otherPlayer.playing) {
          otherPlayer.textures = otherPlayer.playerSheet.walkWest;
          otherPlayer.play();
        }
      }
    });
  }

  function gameLoop() {
    computePlayerAnimation();
    computeOthersPlayersAnimation();
  }

  // const offset = {
  //   x: parseInt(app.view.width / 2) - 15,
  //   y: parseInt(app.view.height / 2) - 5,
  // };

  // let playerDestination = {
  //   tiles: { x: 0, y: 0 },
  //   pixels: { x: 0, y: 0 },
  //   // x: 0, y: 0
  //   setPlayerDestination: (val) => {
  //     // playerPosition = val;
  //     val.x != undefined
  //       ? (playerDestination.pixels.x = -val.x * 100 + offset.x)
  //       : null;
  //     val.y != undefined
  //       ? (playerDestination.pixels.y = -val.y * 100 + offset.y)
  //       : null;
  //     val.x != undefined ? (playerDestination.tiles.x = val.x) : null;
  //     val.y != undefined ? (playerDestination.tiles.y = val.y) : null;
  //   },
  // };

  function computeOtherPlayerMoves() {
    othersPlayers.forEach((otherPlayer) => {
      if (otherPlayer.futurePosition.pixels.x > otherPlayer.x) {
        otherPlayer.x++;
      } else if (otherPlayer.futurePosition.pixels.x < otherPlayer.x) {
        otherPlayer.x--;
      }
      if (otherPlayer.futurePosition.pixels.y > otherPlayer.y) {
        otherPlayer.y++;
      } else if (otherPlayer.futurePosition.pixels.y < otherPlayer.y) {
        otherPlayer.y--;
      }
    });
  }

  function computePlayerMoves() {
    let isDestinationReached = undefined;

    if (player.destination.pixels.x > mapContainer.x) {
      mapContainer.x++;
      if (
        !(player.destination.pixels.x > mapContainer.x) &&
        isDestinationReached == undefined
      ) {
        isDestinationReached = true;
      } else {
        isDestinationReached = false;
      }
    } else if (player.destination.pixels.x < mapContainer.x) {
      mapContainer.x--;
      if (
        !(player.destination.pixels.x < mapContainer.x) &&
        isDestinationReached == undefined
      ) {
        isDestinationReached = true;
      } else {
        isDestinationReached = false;
      }
    }
    if (player.destination.pixels.y > mapContainer.y) {
      mapContainer.y++;
      if (
        !(player.destination.pixels.y > mapContainer.y) &&
        isDestinationReached == undefined
      ) {
        isDestinationReached = true;
      } else {
        isDestinationReached = false;
      }
    } else if (player.destination.pixels.y < mapContainer.y) {
      mapContainer.y--;
      if (
        !(player.destination.pixels.y < mapContainer.y) &&
        isDestinationReached == undefined
      ) {
        isDestinationReached = true;
      } else {
        isDestinationReached = false;
      }
    }
    if (isDestinationReached) {
      // console.log("destination atteinte :", player.destination.tiles);
      setDestinationAchived(player.destination.tiles);
    }
  }



  document.addEventListener(
    "keydown",
    (event) => {
      var name = event.key;
      let tmpDestination = player.destination.tiles;
      if (name == "ArrowRight") tmpDestination.x++;
      if (name == "ArrowDown") tmpDestination.y++;
      if (name == "ArrowUp") tmpDestination.y--;
      if (name == "ArrowLeft") tmpDestination.x--;
      player.setDestination(tmpDestination);
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
  setTimeout(() => {
    app.stage.addChild(
      // app.stage.setChild(
        playersActivitiesSprite,
        playersActivitiesSpriteTitle,
        healthBarSprite,
        textProfile,
        powerCapacityBar
        );
      }, 1000);

  console.log(textProfile.width);
}
