import * as PIXI from "pixi.js";
import { AnimationSheet } from "./sheet";

// Cardinal directions
export type Direction = "N" | "S" | "E" | "W";

export type Position = { x: number; y: number };

export type PlayerPosition = {
  tile: Position;
  pixel: Position;
};
export type Player = {
  render: PIXI.AnimatedSprite;
  position: PlayerPosition;
  direction: Direction;
};

export function createPlayer({
  x,
  y,
  sheet,
}: {
  x: number;
  y: number;
  sheet: AnimationSheet;
}) {
  let player: Player = {
    render: new PIXI.AnimatedSprite(sheet.default),
    position: {
      tile: { x: 0, y: 0 },
      pixel: { x: 0, y: 0 },
    },
    direction: "N",
  };
  player.render.animationSpeed = 0.18;
  player.render.anchor.set(0.5);
  // Texture coordinates
  player.render.x = x;
  player.render.y = y;
  player.render.width = 120;
  player.render.height = 120;

  let lastAnimation = "default";
  return [
    // player object
    player,
    // set position
    (proxy: (prev: Position) => Position) => {
      // Update player position through the proxy
      player.position.tile = proxy(player.position.tile);
      console.log("Update postion", player.position);
      console.log(proxy);
      // Update the pixel target
      player.position.pixel = {
        // Tile width is 120
        x: -player.position.tile.x * 120 + player.render.x - 60,
        y: -player.position.tile.y * 120 + player.render.y - 30,
      };
    },
    // set animation
    (animation: string) => {
      if (animation === lastAnimation) return;
      console.log(animation);
      player.render.textures = sheet[animation];
      player.render.play();
      lastAnimation = animation;
    },
  ];
}
