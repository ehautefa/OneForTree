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
  | "shrub"; // little bush
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

export const server = (io, socket) => {
  // Socket logic
  io.on("connection", (socket) => {
    console.log("Connection:", socket.id);
    // User creation
    // Note: You need to create a user to interract with the world
    socket.on("create", ({ name }, callback: ({}) => void) => {
      if (!users[socket.id]) {
        users[socket.id] = {
          role: "treater",
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
    socket.on("edit", ({ user, x, y, state }) => {
      // TODO check for correctness
      // switch ([user.role, map[x][y]]) {
      //   case ["worker", "dry"]:
      //     map[x][y] = "plowed";
      //     break;
      // }
      console.log("Map Update:", user.id, user.role, x, y, map[x][y]);
      map[x][y] = state;
    });

    // Move a player
    socket.on("move", ({ position, uuid }, callback: ({}) => void) => {
      // console.log("move", { position, uuid });
      for (const [id, user] of Object.entries(users)) {
        if (user.id === uuid) {
          if (
            // Check for valid position
            Math.abs(user.x - position.x) <= 1 &&
            Math.abs(user.y - position.y) <= 1
          ) {
            const prev = { x: users[id].x, y: users[id].y };
            // Update player position
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
    io.on("emote", (emote) => {
      io.emit("react", emote);
    });

    socket.on("disconnect", () => {
      // Destroy the user
      // TODO Maybe we don't want this
      delete users[socket.id];
    });
  });
};

export default defineConfig({
  plugins: [vitePluginSocketIO({ socketEvents: server })],
});

