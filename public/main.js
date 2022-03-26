// Create the application helper and add its render target to the page
let app = new PIXI.Application({ width: 640, height: 360 });
document.body.appendChild(app.view);

// Create the sprite and add it to the stage

function createSquare(position) {
  let square = new PIXI.Sprite(PIXI.Texture.WHITE);
  square.position.set(position.x, position.y);
  square.width = 10;
  square.height = 10;
  square.tint = '0x00FF00';
  return (square);
}

let square = createSquare({x:10, y:10});
let squareList = [];

let direction = 0;

for (let i = 0; i < 10; i++)
{
  squareList.push(createSquare({x:10*i, y:10}));
}
// let sprite = PIXI.Sprite.from("/public/sample.png");
// app.stage.addChild(sprite);
for (let i = 0; i < 10; i++)
{
  app.stage.addChild(squareList[i]);
}


app.stage.addChild(square);

document.addEventListener('keydown', (event) => {
  var name = event.key;
  var code = event.code;
  // Alert the key name and key code on keydown
  // alert(`Key pressed ${name} \r\n Key code value: ${code}`);
  if (name == "ArrowRight")
    direction = 0;
  if (name == "ArrowLeft")
    direction = 2;
  if (name == "ArrowDown")
    direction = 1;
  if (name == "ArrowUp")
    direction = 3;



}, false);

setInterval(() => {
  
  for (let i = 9; i >= 1; i--)
  {
    // console.log(squareList[i - 1]);
    squareList[i].x = squareList[i - 1].x
    squareList[i].y = squareList[i - 1].y
  }

  if (direction == 0)
    squareList[0].x = squareList[0].x + 10;
    if (direction == 1)
    squareList[0].y = squareList[0].y + 10;
    if (direction == 2)
    squareList[0].x = squareList[0].x - 10;
    if (direction == 3)
    squareList[0].y = squareList[0].y - 10;


}, 200);

// Add a ticker callback to move the sprite back and forth
// let elapsed = 0.0;
// app.ticker.add((delta) => {
//   elapsed += delta;
//   sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
// });



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
  planter = planterCarac;
  planter.nbSeeds - 1;
  console.log("Dry Tile");
}

function plowedTile() {
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