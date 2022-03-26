const { io } = require("socket.io-client");
const { setTokenSourceMapRange } = require("typescript");
const socket = io();

//Connect to server
socket.on("connect", () => {
	console.log(socket.connected);
});

socket.on("disconnect", () => {
	console.log(socket.connected); 
});
