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
  // let player = {x:0, y:0};
  let player = new PIXI.Sprite.from("/public/map_case.png");
  console.log(app.view.width);
  player.position.set(app.view.width / 2, app.view.height / 2);
  player.width = 30;
  player.height = 30;
  player.tint = "0x0000FF";
  
  // player = {...player, setPosition : () => {},  get userPosition() {return({x:this.x/30, y:this.y/30})},
  // set userPosition(val) {this.x=val.x*30, this.y=val.y*30} };
  return player;
  
}


// console.log("Player getter :", player.userPosition);

let playerPosition = {x:0, y:0}

let map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const offset = {x:app.view.width / 2, y:app.view.height / 2}




let mapContainer = new PIXI.Container();
mapContainer.setPlayerPosition = (val) => {
  val.x != undefined ? mapContainer.x = val.x * 30 + offset.x : null
  val.y != undefined ? mapContainer.y = val.y * 30 + offset.y : null
};

mapContainer.setPlayerPosition(playerPosition);

let itemsMap = map.map((row, y) => {
  let currentRow = row.map((cell, x) => {
    console.log("cell :", cell);
    let currentCell = createSquare({ x: x, y: y, type: cell });
    currentCell.interactive = true;
    // currentCell.buttonMode = true;
    currentCell.on('pointerdown', (e) => {console.log("ptr dw:", y, x)});

    mapContainer.addChild(currentCell);

    // app.stage.addChild(currentCell);
    
    return currentCell;
  });
  return currentRow;
});

// mapContainer.setPlayerPosition({x:3,  y:3});

app.stage.addChild(mapContainer);


let player = createPlayer();

console.log("Map :", itemsMap);

let square = createSquare({ x: 10, y: 10 });
let squareList = [];

let direction = 0;



// for (let i = 0; i < 10; i++) {
//   squareList.push(createSquare({ x: 10 * i, y: 10 }));
// }
// // let sprite = PIXI.Sprite.from("/public/sample.png");
// // app.stage.addChild(sprite);
// for (let i = 0; i < 10; i++) {
//   app.stage.addChild(squareList[i]);
// }

app.stage.addChild(player);

document.addEventListener(
  "keydown",
  (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    // alert(`Key pressed ${name} \r\n Key code value: ${code}`);
    if (name == "ArrowRight") playerPosition.x--;
    if (name == "ArrowLeft") playerPosition.x++;
    if (name == "ArrowDown") playerPosition.y--;
    if (name == "ArrowUp") playerPosition.y++;
      mapContainer.setPlayerPosition(playerPosition);
  
  },
  false
);

setInterval(() => {
  // for (let i = 9; i >= 1; i--) {
  //   // console.log(squareList[i - 1]);
  //   squareList[i].x = squareList[i - 1].x;
  //   squareList[i].y = squareList[i - 1].y;
  // }

  // if (direction == 0) squareList[0].x = squareList[0].x + 10;
  // if (direction == 1) squareList[0].y = squareList[0].y + 10;
  // if (direction == 2) squareList[0].x = squareList[0].x - 10;
  // if (direction == 3) squareList[0].y = squareList[0].y - 10;
}, 200);

// Add a ticker callback to move the sprite back and forth
// let elapsed = 0.0;
// app.ticker.add((delta) => {
//   elapsed += delta;
//   sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
// });
