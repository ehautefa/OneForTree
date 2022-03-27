const socket = io();

async function sockets(username) {
  let user = null;
  let leaderboard = [];
  let map = [[]];

  console.log("sockets...");

  function keydown(key, callback) {
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key == key) callback();
      },
      false
    );
  }


  socket.on("connect", (e) => {
    console.log("connection established");

    socket.emit("create", { name: username }, (data) => {
      console.log(data);

      user = data.user;
      leaderboard = data.users;
      map = data.map;
    });

    socket.on("login", (data) => {
      console.log(data);
    });

    socket.on("move", ({ uuid, next, prev }) => {
      console.log("player moved: ", uuid, next, prev);
    });

    keydown("ArrowRight", () => {
      socket.emit(
        "move",
        { position: { x: user.x + 1, y: user.y }, uuid: user.id },
        ({ position: { x, y } }) => {
          user.x = x;
          user.y = y;
          console.log("move", user);
        }
      );
    });
    keydown("ArrowLeft", () => {
      socket.emit(
        "move",
        {
          position: { x: user.x - 1, y: user.y },
          uuid: user.id,
        },
        ({ position: { x, y } }) => {
          user.x = x;
          user.y = y;
          console.log("move", user);
        }
      );
    });
    keydown("ArrowUp", () => {
      socket.emit(
        "move",
        {
          position: { x: user.x, y: user.y + 1 },
          uuid: user.id,
        },
        ({ position: { x, y } }) => {
          user.x = x;
          user.y = y;
          console.log("move", user);
        }
      );
    });
    keydown("ArrowDown", () => {
      socket.emit(
        "move",
        {
          position: { x: user.x, y: user.y - 1 },
          uuid: user.id,
        },
        ({ position: { x, y } }) => {
          user.x = x;
          user.y = y;
          console.log("move", user);
        }
      );
    });
  });
};