import * as PIXI from "pixi.js";

function createMap() {
	let map = {
		c: new PIXI.container(),
		nbChunck: 9,
		chunckSize: 9,
		nbSprite: 3,
		spriteSize: 120
	}

	// create chunck containers
	for (let i = 0; i < map.nbChunck; i++) {
		let chunck = new PIXI.container();
		map.c.addChildAt(chunck, i);

		chunck.position.set(i % 3 * spriteSize, i / 3 * spriteSize);

		// create tile containers
		for (let j = 0; j < map.chunckSize * map.chunckSize; j++) {
			let tile = new PIXI.container();
			chunck.addChildAt(tile, j)

			tile.position.set(chunck.x + (j % chunckSize * spriteSize), chunck.y + (j / chunckSize * spriteSize));

			let types = ["ground", "plant", "animal"];
			let zIndex = 0;
			for (const key in types) {
				let sprite = new PIXI.animatedSprite();
				sprite.name = key;
				sprite.zIndex = zIndex++;
				
				tile.addChild(sprite);
			}
		}
	}
}