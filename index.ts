const path = require("path");
import { uuid } from "uuidv4";

const serveIndex = require('serve-index');
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
const serveIndex = require("serve-index");

// Config
const port = 3000;
const mapWidth = 1000;
const mapHeight = 1000;

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
console.log("Map", map);

// Default route to serve game html file
app.get("/", (req: any, res: any) => {
  res.sendFile("./index.html", { root: __dirname });
});

app.use("/public", express.static("public"));
app.use("/public", serveIndex("public"));

// Socket logic
io.on("connection", (socket) => {
  // User creation
  // Note: You need to create a user to interract with the world
  socket.on("create", ({ name }) => {
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
    socket.emit("created", { map: map, user: users[socket.id], users: users });
    // Sends to other players that a new user connected
    socket.broadcast.emit("login", { user: users[socket.id] });
  });

  // Update a tile
  socket.on("edit", ({ user, x, y, state }) => {
    // TODO check for correctness
    switch ([user.role, map[x][y]]) {
      case ["worker", "dry"]:
        map[x][y] = "plowed";
        break;
    }
    console.log("Map Update:", user.role, x, y, map[x][y]);
    map[x][y] = state;
  });

  // Move a player
  socket.on("move", ({ position, uuid }) => {
    for (const [id, user] of Object.entries(users)) {
      if (
        user.id === uuid &&
        // Check for valid position
        Math.abs(user.x - position.x) <= 1 &&
        Math.abs(user.y - position.y) <= 1
      ) {
        // Update player position
        users[id] = {
          ...user,
          x: position.x,
          y: position.y,
        };
        // And broadcast it
        io.emit("update", { user: users[id] });
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
    users[socket.id] = undefined;
  });
});

server.listen(port, () => {
  console.log(`🚀 One for tree launched on localhost:${port}`);
});
