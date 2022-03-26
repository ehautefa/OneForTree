const socket = io();
localStorage.debug = 'socket.io-client:socket'
var	world = [];

//Connect to server
socket.on("connect", () => {
	console.log(socket.connected);
	socket.emit("create", "elise");
	socket.on("created", ({map, user, users}) => {
		world = map;
		launchGame();
	});
	
	socket.on("disconnect", () => {
		console.log(socket.connected); 
	});
});
	
async function launchGame() {
		
	let player;
	let keys = {};
	let keysDiv;
	let playerSheet = {};
	let speed = 2;
	
	// Create the application helper and add its render target to the page
	
	let app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		antialias: true,
		transparent: false,
		resolution: 1,
		backgroundAlpha: 0
	});
	document.body.appendChild(app.view);
	app.renderer.view.style.display = "block";
	app.renderer.autoResize = true;
	window.onresize = function () {
		app.renderer.resize(window.innerWidth, window.innerHeight);
	}
	
	// Create the sprite and add it to the stage
	
	function createSquare(position) {
		let square = new PIXI.Sprite.from("/public/map_case.png");
		square.position.set(position.x * 30, position.y * 30);
		square.width = 30;
		square.height = 30;
		if (position.type == 1) square.tint = "0x00FF00";
		return square;
	}
	
	function doneLoading(e) {
		createPlayerSheet();
		createPlayer();
		app.ticker.add(gameLoop);
	}
	
	app.loader.add("viking", "/public/viking.png");
	app.loader.load(doneLoading);
	
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

	
	const offset = { x: app.view.width / 2, y: app.view.height / 2 }
	
	let mapContainer = new PIXI.Container();
	
	let playerDestination = { x: 0, y: 0 };
	playerDestination.setPlayerDestination = (val) => {
		playerPosition = val;
		val.x != undefined ? playerDestination.x = val.x * 30 + offset.x : null
		val.y != undefined ? playerDestination.y = val.y * 30 + offset.y : null
	};
	
	playerDestination.setPlayerDestination({ x: 0, y: 0 })
	
	setInterval(() => {
		if (playerDestination.x > mapContainer.x) {
		mapContainer.x++;
		}
		else if (playerDestination.x < mapContainer.x) {
		mapContainer.x--;
		}
		if (playerDestination.y > mapContainer.y) {
		mapContainer.y++;
		}
		else if (playerDestination.y < mapContainer.y) {
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
		if (name == "ArrowRight") playerDestination.x--;
		if (name == "ArrowLeft") playerDestination.x++;
		if (name == "ArrowDown") playerDestination.y--;
		if (name == "ArrowUp") playerDestination.y++;
		playerDestination.setPlayerDestination(playerDestination);
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

	function dryTile() {
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
}
