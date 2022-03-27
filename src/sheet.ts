import * as PIXI from "pixi.js";

export type AnimationConfig = {
  name: string;
  rect: { w: number; h: number };
  animations: {
    name: string;
    length: number;
  }[];
  app: any;
};

export const createSheet = ({
  name,
  rect,
  animations,
  app,
}: AnimationConfig) => {
  // Load the atlas from a loaded file
  let atlas = PIXI.BaseTexture.from(app.loader.resources[name].url);
  let index = 0;
  return animations.reduce((sheet, { name, length }) => {
    // Frames buffer for a given animation
    let frames = [];
    // Loads a frame from the atlas
    for (let i = 0; i < length; i++, index++) {
      frames.push(
        new PIXI.Texture(
          atlas,
          new PIXI.Rectangle(index * rect.w, 0, rect.w, rect.h)
        )
      );
    }
    sheet[name] = frames;
    return sheet;
  }, <{ [key: string]: any }>{});
};
