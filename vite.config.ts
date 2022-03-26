import vitePluginSocketIO from "vite-plugin-socket-io";
import { defineConfig } from "vite";

// Config
const mapWidth = 50;
const mapHeight = 50;

// Types
export type Tile =
  | "water" // A pound of water
  | "rock" // An immouvable rock
  | "dry" // dry land to be watered
  | "plowed" // prepared land for seeding
  | "seeded" // planted land
  | "watered" // germinating land
  | "tree" // A tree entity
  | "shrub" // little bush
  | "garbage"; // Garbage
export type UserRole = "worker" | "cultivator" | "waterer" | "treater";
export type User = {
  // UUID
  id: string;

  // Role can be changed
  role: UserRole;
  // Not unique
  name: string;

  // Position
  x: number;
  y: number;

  // Inventory,
  capacity: number;
};
export type Stats = {
  co2: number;
  // TODO add more stats
};

// Utils
function genMap(width: number, height: number) {
  let map = <Tile[][]>[];

  for (let x = 0; x < width; x++) {
    map[x] = [];
    for (let y = 0; y < height; y++) {
      map[x][y] = "dry";
    }
  }
  return map;
}

// Database xD ptdr
// TODO parse from serialized file
let map: Tile[][] = genMap(mapWidth, mapHeight);
let users: { [key: string]: User } = {};
let stats: Stats = { co2: 10000 };

/// Doctumentation:
/// Front:
/// > Create a new user
///  - emit "create": { name } -> { user, map, leaderboard }
/// > A user logged in
///  - recieve "login": -> { user }
/// > You want to move
///  - emit "move": { uuid, position: {x, y} } -> { position: {x, y} }
/// > A User has moved
///  - recieve "move": -> { uuid, prev: {x, y}, next: {x, y} }
/// > A user emoted
///  - recieve "emote": -> { reaction: string }
/// > Emit an emote
///  - emit "emote": { reaction: string }
/// > Edit a tile
///  - emit "edit": { user: User, position: {x, y} } -> { user: User }
/// > A tile has been edited
///  - recieve "edit": { position: {x, y}, tile: Tile }
export const server = (io, socket) => {
  // Socket logic
  io.on("connection", (socket) => {
    console.log("Connection:", socket.id);
    // User creation
    // Note: You need to create a user to interract with the world
    socket.on("create", ({ name }, callback: ({}) => void) => {
      if (!users[socket.id]) {
        users[socket.id] = {
          role: "worker",
          id: socket.id,
          x: mapWidth / 2,
          y: mapHeight / 2,
          name: name,
          capacity: 0,
        };
      }

      // Sends to the user the finalized user and the map
      // socket.emit("created", { map: map, user: users[socket.id], users: users });
      callback({ map: map, user: users[socket.id], leaderboard: users });
      // Sends to other players that a new user connected
      socket.broadcast.emit("login", { user: users[socket.id] });
    });

    // Update a tile
    socket.on(
      "edit",
      (
        {
          user,
          position: { x, y },
          ...rest
        }: {
          user: User;
          position: { x: number; y: number };
        },
        callback: ({ user }: { user: User }) => void
      ) => {
        // TODO check for correctness
        let tile: Tile = map[x][y];

        // User possible edits
        switch (user.role) {
          case "worker":
            switch (tile) {
              case "dry":
                tile = "plowed";
                if (user.capacity < 5) users[user.id].capacity += 1;
                break;
              case "rock":
                tile = "dry";
                if (user.capacity < 5) users[user.id].capacity += 1;
                break;
            }
            break;
          case "cultivator":
            switch (tile) {
              case "plowed":
                if (user.capacity > 0) {
                  users[user.id].capacity -= 1;
                  tile = "seeded";
                }
                break;
              case "shrub":
                if (user.capacity <= 5) {
                  users[user.id].capacity = 5;
                }
                break;
            }
            break;
          case "waterer":
            switch (tile) {
              case "seeded":
                if (user.capacity > 0) {
                  users[user.id].capacity -= 1;
                  tile = "watered";
                }
                break;
              case "water":
                if (user.capacity <= 5) {
                  users[user.id].capacity = 5;
                }
                break;
            }
            break;
          case "treater":
            switch (tile) {
              case "watered":
                // if (user.capacity > 0) {
                //   users[user.id].capacity -= 1;
                tile = "tree";
                // }
                break;
            }
            break;
        }

        // Maps gets edited
        if (map[x][y] !== tile) {
          console.log(
            "Map Update:",
            user.id,
            user.role,
            x,
            y,
            map[x][y],
            "->",
            tile
          );
          map[x][y] = tile;
          io.emit("edit", { position: { x, y }, tile: tile });
          callback({ user: users[user.id] });
        }
      }
    );

    // Move a player
    socket.on("move", ({ position, uuid }, callback: ({}) => void) => {
      console.log("move", { position, uuid });
      for (const [id, user] of Object.entries(users)) {
        if (user.id === uuid) {
          if (
            // Check for valid position
            position.x >= 0 && position.x < mapWidth &&
            position.y >= 0 && position.y < mapHeight
          ) {
            const prev = { x: users[id].x, y: users[id].y };
            // Update player position
			console.log("POS MOVE", position.x, " ", position.y);
            users[id] = {
              ...user,
              x: position.x,
              y: position.y,
            };
            console.log("allowed move", {
              position: { x: users[uuid].x, y: users[id].y },
            });
            callback({ position });
            // And broadcast it
            socket.broadcast.emit("move", { uuid, prev: prev, next: position });
          } else {
            console.log("denied move", {
              position: { x: users[uuid].x, y: users[id].y },
            });
            callback({ position: { x: users[uuid].x, y: users[id].y } });
          }
        }
      }
    });

    // Player emote
    socket.on("emote", (emote) => {
      socket.broadcast.emit("emote", emote);
    });

    socket.on("disconnect", () => {
      // Destroy the user
      // TODO Maybe we don't want this
      // delete users[socket.id];
    });
  });
};

export default defineConfig({
  plugins: [vitePluginSocketIO({ socketEvents: server })],
});
