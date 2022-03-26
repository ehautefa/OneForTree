const socket = io();
localStorage.debug = 'socket.io-client:socket'
var	world = [];
//Connect to server
socket.on("connect", () => {
	console.log(socket.connected);
	socket.emit("create", "elise");
	socket.on("created", ({map, user, users}) => {
		world = [...map];
 		// world = [42]
		console.log("AAAAA", world);
		
	});
});

setTimeout(() => {
console.log("BBBBBB", world);
}, 200);

socket.on("disconnect", () => {
	console.log(socket.connected); 
});

// Create the application helper and add its render target to the page
let app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);

// Create the sprite and add it to the stage

function createSquare(position) {
  let square = new PIXI.Sprite.from("/public/map_case.png");
  square.position.set(position.x * 30, position.y * 30);
  square.width = 30;
  square.height = 30;
  if (position.type == 1) square.tint = "0x00FF00";
  return square;
}

function createPlayer() {
  let player = new PIXI.Sprite.from("/public/map_case.png");
  console.log(app.view.width);
  player.position.set(app.view.width / 2, app.view.height / 2);
  player.width = 30;
  player.height = 30;
  player.tint = "0x0000FF";
  return player;
}

let playerPosition = {x:0, y:0}

const offset = {x:app.view.width / 2, y:app.view.height / 2}

let mapContainer = new PIXI.Container();

let playerDestination = {x:0, y:0};
playerDestination.setPlayerPosition = (val) => {
  playerPosition = val;
  val.x != undefined ? playerDestination.x = val.x * 30 + offset.x : null
  val.y != undefined ? playerDestination.y = val.y * 30 + offset.y : null
  socket.emit("move", {playerPosition, })
};

playerDestination.setPlayerPosition({x:0, y:0})

setInterval(() => {
  if (playerDestination.x > mapContainer.x)
  {
    mapContainer.x++;
  }
  else if (playerDestination.x < mapContainer.x)
  {
    mapContainer.x--;
  }
  if (playerDestination.y > mapContainer.y)
  {
    mapContainer.y++;
  }
  else if (playerDestination.y < mapContainer.y)
  {
    mapContainer.y--;
  }
}, 10)


let itemsMap = world.map((row, y) => {
  let currentRow = row.map((cell, x) => {
    console.log("cell :", cell);
    let currentCell = createSquare({ x: x, y: y, type: cell });
    currentCell.interactive = true;
    currentCell.on('pointerdown', (e) => {
      console.log("ptr dw:", y, x)
      playerDestination.setPlayerPosition({x:-x, y:-y});
    });
    mapContainer.addChild(currentCell);
    return currentCell;
  });
  return currentRow;
});


app.stage.addChild(mapContainer);


let player = createPlayer();

app.stage.addChild(player);

document.addEventListener(
  "keydown",
  (event) => {
    var name = event.key;
    if (name == "ArrowRight") playerPosition.x--;
    if (name == "ArrowLeft") playerPosition.x++;
    if (name == "ArrowDown") playerPosition.y--;
    if (name == "ArrowUp") playerPosition.y++;
    playerDestination.setPlayerPosition(playerPosition);
  
  },
  false
);




// PROFILE CHARACTERS
// ----------------------------------------------------------
planterCarac = {
  nbSeeds: 0
}

sprinklerCarac = {
  liters: 0
}




// EFFECTS BLOCKS
// ----------------------------------------------------------

function effectBlock(blockType) {
    // Dry Tile
    if (blockType == 0) {
      dryTile();
    }
    // Plowed Tile
    if (blockType == 1) {
      plowedTile();
    }
    // Seeded Tile
    if (blockType == 2) {
      seededTile();
    }
    // Watered Tile
    if (blockTile == 3) {
      wateredTile();
    }
}

function dryTile(){
  console.log("Dry Tile");
}

function plowedTile() {
  planter = planterCarac;
  planter.nbSeeds - 1;
  console.log("Plowed Tile");
}

function seededTile() {
  sprinkler = sprinklerCarac;
  sprinkler.liters - 50;
  console.log("Seeded Tile"); 
}

function wateredTile() {
  console.log("Watered Tile");
}