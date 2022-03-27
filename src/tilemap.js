var grass = createTile('/src/assets/Grass', 3);
var ground = createTile('/src/assets/Soft_Ground', 3);
var labored = createTile('/src/assets/Labored_Ground', 1);
var plant = createTile('/src/assets/Plant', 1);
var water = createAnimatedTile('/src/assets/Water', 3);
var tileMethods = [
    { tile: grass, type: "shrub" },
    { tile: ground, type: "dry" },
    { tile: labored, type: "plowed" },
    { tile: plant, type: "seeded" },
    { tile: water, type: 'water' }
];

function randomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createTile(name, tileNumber) {
    return function (position) {
        let filename =
            name +
            (tileNumber > 1
                ? parseInt(randomNumber(1, tileNumber)).toString()
                : "") +
            ".png";
        let tile = new PIXI.Sprite.from(filename);
        tile.position.set(position.x * 120, position.y * 120);
        tile.width = 120;
        tile.height = 120;
        return tile;
    };
}

function createAnimatedTile(filename, numberAnimation) {
    return function (position) {
        let w = 60;
        let h = 60;

        let ssheet = new PIXI.BaseTexture.from(filename + '.png');

        let Images = [];
        for (let i = 0; i < numberAnimation; i++) {
            Images.push(new PIXI.Texture(ssheet, new PIXI.Rectangle(i * w, 0, w, h)))
        }

        let tile = new PIXI.AnimatedSprite(Images);
        tile.animationSpeed = 0.1;
        tile.loop = true;
        tile.position.set(position.x * 120, position.y * 120);
        tile.width = 120;
        tile.height = 120;
        tile.play();
        return tile;
    }
}

export function createTileMap(map, onClick) {
    let mapContainer = new PIXI.Container();
    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            let currentCell = tileMethods[x % 5].tile({ x: x, y: y });
            // let currentCell = tileMethods
            //   .find((tile) => {
            //     return tile.type === cell;
            //   })
            //   ?.tile({ x, y });
            if (!currentCell) return;
            currentCell.interactive = true;
            currentCell.on("pointerdown", (e) => { onClick(x, y) });
            mapContainer.addChild(currentCell);
        });
    });
    return mapContainer;
}