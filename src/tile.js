// map
var G = 0, D = 1, W = 2;
var terrain = [
    [G, G, G, G, W],
    [D, D, G, G, W],
    [D, G, G, W, W],
    [D, G, W, W, W],
    [G, G, W, W, W],
];

// Tiles with height can exceed these dimensions.
var tileHeight = 50;
var tileWidth = 50;

// tiles
var grass = createTile('grass.png');
var dirt = createTile('dirt.png');
var water = createTile('water.png');
var sand = createTile('beach.png');
var tileMethods = [grass, dirt, water, sand];

function isoTile(filename) {
    return function (x, y) {
        var tile = PIXI.Sprite.fromFrame(filename);
        tile.position.x = x;
        tile.position.y = y;

        // bottom-left
        square.width = 60;
        square.height = 60;
        stage.addChild(tile);
    }
}