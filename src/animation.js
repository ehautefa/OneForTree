import * as PIXI from "pixi.js";

const animationSheet = {

	createAnimationSheet : (type, url) => {
	let animationSheet = {};
	let w = 60;
	let h = 60;

	let ssheet = new PIXI.BaseTexture.from(url);

	function createTextureArray(firstIndex, lastIndex) {
		let array = [];

		for (let i = firstIndex; i <= lastIndex; i++)
		{
			array.push(new PIXI.Texture(ssheet, new PIXI.Rectangle(i * w, 0, w, h)));
		}
		return array;
	}

	if (type == "worker")
	{
		animationSheet["walkSouth"] = createTextureArray(0, 2);
		animationSheet["walkWest"] = createTextureArray(3, 5);
		animationSheet["walkEast"] = createTextureArray(6, 8);
		animationSheet["walkNorth"] = createTextureArray(9, 11);
		animationSheet["standSouth"] = createTextureArray(13, 17);
		animationSheet["standWest"] = createTextureArray(23, 27);
		animationSheet["standEast"] = createTextureArray(18, 22);
		animationSheet["standNorth"] = animationSheet["standSouth"];
		animationSheet["action"] = createTextureArray(28, 41);
		animationSheet["default"] = animationSheet["standSouth"];
	}
	else if (type == "cultivator")
	{
		animationSheet["walkSouth"] = createTextureArray(0, 3);
		animationSheet["walkWest"] = createTextureArray(31, 34);
		animationSheet["walkEast"] = createTextureArray(4, 7);
		animationSheet["walkNorth"] = createTextureArray(8, 11);
		animationSheet["standSouth"] = animationSheet["walkSouth"];
		animationSheet["standWest"] = animationSheet["walkWest"];
		animationSheet["standEast"] = animationSheet["walkEast"];
		animationSheet["standNorth"] = animationSheet["walkNorth"];
		animationSheet["southSansBaie"] = createTextureArray(20, 23);
		animationSheet["westSansBaie"] = createTextureArray(35, 38);
		animationSheet["eastSansBaie"] = createTextureArray(16, 19);
		animationSheet["northSansBaie"] = createTextureArray(12, 15);
		animationSheet["action"] = createTextureArray(24, 30);
		animationSheet["default"] = animationSheet["standSouth"];
	}
	else if (type == "waterer")
	{
		animationSheet["walkSouth"] = createTextureArray(34, 37);
		animationSheet["walkWest"] = createTextureArray(66, 69);
		animationSheet["walkEast"] = createTextureArray(38, 41);
		animationSheet["walkNorth"] = createTextureArray(50, 53);
		animationSheet["standSouth"] = createTextureArray(0, 3);
		animationSheet["standWest"] = createTextureArray(58, 61);
		animationSheet["standEast"] = createTextureArray(4, 7);
		animationSheet["standNorth"] = createTextureArray(8, 11);
		animationSheet["walkSouthVide"] = createTextureArray(46, 49);
		animationSheet["walkWestVide"] = createTextureArray(70, 73);
		animationSheet["walkEastVide"] = createTextureArray(42, 45);
		animationSheet["walkNorthVide"] = createTextureArray(54, 57);
		animationSheet["standSouthVide"] = createTextureArray(22, 25);
		animationSheet["standWestVide"] = createTextureArray(62, 65);
		animationSheet["standEastVide"] = createTextureArray(26, 29);
		animationSheet["standNorthVide"] = createTextureArray(30, 33);
		animationSheet["action"] = createTextureArray(12, 21);
		animationSheet["default"] = animationSheet["standSouth"];
	}
	else if (type == "treater")
	{
		animationSheet["walkSouth"] = createTextureArray(34, 37);
		animationSheet["walkWest"] = createTextureArray(66, 69);
		animationSheet["walkEast"] = createTextureArray(38, 41);
		animationSheet["walkNorth"] = createTextureArray(50, 53);
		animationSheet["standSouth"] = createTextureArray(0, 3);
		animationSheet["standWest"] = createTextureArray(58, 61);
		animationSheet["standEast"] = createTextureArray(4, 7);
		animationSheet["standNorth"] = createTextureArray(8, 11);
		animationSheet["walkSouthVide"] = createTextureArray(46, 49);
		animationSheet["walkWestVide"] = createTextureArray(70, 73);
		animationSheet["walkEastVide"] = createTextureArray(42, 45);
		animationSheet["walkNorthVide"] = createTextureArray(54, 57);
		animationSheet["standSouthVide"] = createTextureArray(22, 25);
		animationSheet["standWestVide"] = createTextureArray(62, 65);
		animationSheet["standEastVide"] = createTextureArray(26, 29);
		animationSheet["standNorthVide"] = createTextureArray(30, 33);
		animationSheet["action"] = createTextureArray(12, 21);
		animationSheet["default"] = animationSheet["standSouth"];
	}
	else if (type == "papillionBlanc")
	  animationSheet["animation"] = createTextureArray(0, 13);
	else if (type == "papillionJaune")
		animationSheet["animation"] = createTextureArray(0, 15);
	else if (type == "frog")
		animationSheet["animation"] = createTextureArray(0, 8);
	else if (type == "waterTile")
		animationSheet["animation"] = createTextureArray(0, 2);
	return animationSheet;
  }
};
export default animationSheet;