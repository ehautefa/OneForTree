import * as PIXI from "pixi.js";
import { Texture } from "pixi.js";

export type AnimationSheet = {
  [name: string]: Texture[];
};

export type AnimationConfig = {
  name: string;
  rect: { w: number; h: number };
  animations: {
    [name: string]: {
      start: number;
      end: number;
    };
  };
  app: PIXI.Application;
};

export const createSheet = ({
  name,
  rect,
  animations,
  app,
}: AnimationConfig) => {
  // Load the atlas from a loaded file
  let atlas = PIXI.BaseTexture.from(app.loader.resources[name].url);
  let sheet: { [name: string]: PIXI.Texture[] } = {};
  for (let [name, range] of Object.entries(animations)) {
    let frames = [];
    for (let i = range.start; i <= range.end; i++) {
      frames.push(
        new PIXI.Texture(
          atlas,
          new PIXI.Rectangle(i * rect.w, 0, rect.w, rect.h)
        )
      );
    }
    sheet[name] = frames;
  }
  return sheet;
};
