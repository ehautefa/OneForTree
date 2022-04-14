import * as PIXI from "pixi.js";

const mapData = [
	[{ground: "grass", plant: "tree", animal: "bee"}, {ground: "water"}, {ground: "dry", animal: "butterfly"}],
	[{ground: "plowed", plant: "seed"}, {ground: "watered", plant: "wateredSeed"}, {ground: "berry"}],
	[{}, {}, {}]
]

class Map {
	/*
	**	create map with the chunck size in tiles and the number of chunck to charge
	*/
	constructor({ chunckSize, nbChunck, data, app }) {
		this.chunckSize = chunckSize
		this.nbChunck = nbChunck
		this.mapSizeTile = Math.pow(nbChunck * chunckSize, 2)
		this.mapSizeChunck = this.mapSizeTile / this.chunckSize
		this.spriteSize = 120

		this.totalMapSizeTile = { x: data[0].lenght, y: data.lenght}
		this.totalMapSizeChunck = { x: this.totalMapSizeTile.x / this.chunckSize,  y: this.totalMapSizeTile.y / this.chunckSize }

		this.app = app
		
		if (this.checkMapError())
			return
		
		this.data = this.shallowCopyMap(data)
		this.chunck = this.createContainer()
		this.loadedChuncks = new Array(this.nbChunck)
	}

	checkMapError() {
		let error = ""
		if (this.chunckSize === 0)
			error = "chunck size must be non-null"
		if (this.nbChunck === 0)
			error = "chunck number must be non-null"
		if (this.data.lenght === 0 || this.data[0].lenght === 0)
			error = "map size must be non-null"
		for (let i = 0; i < this.data.length - 1; i++) {
			if (this.data[i].lenght !== this.data[i + 1].lenght)
				error = "line", i, "or", i+1, "of the map is invalide"
		}
		if (this.data.lenght % this.chunckSize !== 0 || this.data[0].lenght % this.chunckSize !== 0)
			error = "the map size don't match the actual map chuncking"
		console.error("Map Error:", error)
		return error
	}

	shallowCopyMap(data) {
		let tab = new Array(this.nbChunck)
		for (let i = 0; i < tab.length; i++)
			tab[i] = new Array(0)
		
		let X = 0, Y = 0
		for (let i = 0; i < tab.length; i++) {
			for (let x = X; x < this.chunckSize; x++) {
				for (let y = Y; y < this.chunckSize; y++) {
					tab[i].push(Object.assign({}, data[x][y]))
				}
			}
			X += this.chunckSize
			if (X > this.mapSizeTile) {
				X = 0
				Y += this.chunckSize
			}
		}
		return tab
	}

	createContainer() {
		let chunck = new Array(this.nbChunck)
		// create chunck containers
		for (let i = 0; i < chunck.lenght; i++) {
			chunck[i] = new PIXI.container()

			// create tile containers
			for (let j = 0; j < this.chunckSize * this.chunckSize; j++) {
				let tile = new PIXI.container()
				chunck[i].addChildAt(tile, j)

				// create animated sprites
				let types = ["ground", "plant", "animal"]
				for (const key in types) {
					let sprite = new PIXI.animatedSprite()
					sprite.name = key
					
					tile.addChild(sprite)
				}
			}
		}
		return chunck
	}

	loadChunck({ chunckIndex, dataIndex }) {
		if (this.loadedChuncks[chunckIndex] === dataIndex)
			return
		for (let i = 0; i < this.chunckSize; i++) {
			let tileContainer = this.chunck[chunckIndex].getChildAt(i)
			let tileData = this.data[dataIndex][i]

			let textures = [
				this.app.loader.resource[tileData.ground],
				this.app.loader.resource[tileData.plant],
				this.app.loader.resource[tileData.animal]
			]

			let sprites = [
				tileContainer.getChildByName("ground"),
				tileContainer.getChildByName("plant"),
				tileContainer.getChildByName("animal")
			]

			for (let j = 0; j < 3; j++) {
				sprites[j].visible = true
				if (textures[j])
					sprites[j].setTexture(textures[j])
				else
					sprites[j].visible = false
			}
		}
		this.loadedChuncks[chunckIndex] = dataIndex
	}

	/*
	**	update chuncks with the player position in pixel
	*/
	update({ playerPosPixel }) {

		// retrieve the index of the chunk on which the player is located
		let playerPosTile = { x: playerPosPixel.x / this.spriteSize, y: playerPosPixel.y / this.spriteSize }
		let playerPosChunck = { x: playerPosTile.x / this.chunckSize, y: playerPosTile.y / this.chunckSize }
		let playerChunckIndex = playerPosChunck.x + (playerPosChunck.y * this.mapSizeChunck)
		let newChuncks = new Array(this.nbChunck)

		// retrieve the list of the chuncks which will be loaded
		let X = playerPosChunck.x - this.mapSizeChunck / 2, Y = playerPosChunck.y - this.mapSizeChunck / 2
		for (let y = 0; y < this.mapSizeChunck; y++) {
			for (let x = 0; x < this.mapSizeChunck; x++) {
				newChuncks[i].push(X + x + ((Y + y) * this.totalMapSizeChunck))
			}
			Y++
		}

		// find out which are the new chuncks to load among the new ones and which are the chuncks to unload among the current ones
		let chuncksToLoad = newChuncks.filter(value => !this.includes(value), this.loadedChuncks)
		let chuncksToUnload = this.loadedChuncks.filter(value => !this.includes(value), newChuncks)

		for (let i = 0; i < this.nbChunck; i++) {
			this.loadChunck(this.loadedChuncks.find(i => ), chuncksToLoad[i])
		}

	}
}

//    0  1  2  3  4  5 
//    _________________
// 0 |0  1  2  3  4  5 
// 1 |6  7  8  9  10 11
// 2 |12 13 14 15 16 17
// 3 |18 19 20 21 22 23
// 4 |24 25 26 27 30 31
// 5 |30 31 32 33 34 35
