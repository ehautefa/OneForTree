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
  idle: (pos: Position) => void;
  state: "idle" | "working";
};

export function createNpc({
  x, // Tile x
  y, // Tile y
  sheet,
}: {
  x: number;
  y: number;
  sheet: AnimationSheet;
}) {
  let player: Player = {
    render: new PIXI.AnimatedSprite(sheet.default),
    position: {
      tile: { x, y },
      pixel: { x: x * 120 + 60, y: y * 120 + 30 },
    },
    direction: "N",
    idle: () => {},
    state: "idle",
  };
  player.render.animationSpeed = 0.18;
  player.render.anchor.set(0.5);
  // Texture coordinates
  player.render.x = player.position.pixel.x;
  player.render.y = player.position.pixel.y;
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
      // Update the pixel target
      player.position.pixel = {
        // Tile width is 120
        x: player.position.tile.x * 120 + 60,
        y: player.position.tile.y * 120 + 30,
      };
    },
    // set animation
    (animation: string) => {
      if (animation === lastAnimation) return;
      player.render.textures = sheet[animation];
      player.render.play();
      lastAnimation = animation;
    },
  ];
}

export function createPlayer({
  x,
  y,
  sheet,
  idle,
}: {
  x: number;
  y: number;
  sheet: AnimationSheet;
  idle: (pos: Position) => void;
}) {
  let player: Player = {
    render: new PIXI.AnimatedSprite(sheet.default),
    position: {
      tile: { x: 0, y: 0 },
      pixel: { x: 0, y: 0 },
    },
    direction: "N",
    state: "idle",
    idle,
  };
  player.render.animationSpeed = 0.18;
  player.render.anchor.set(0.5);
  player.render.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
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
      player.render.textures = sheet[animation];
      player.render.play();
      lastAnimation = animation;
    },
  ];
}
