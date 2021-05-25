const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const port = process.env.PORT || 3001;
const app = express();

app.use(cors());

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let currentUsers = {};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("enterRoom", (data) => {
    socket.join(data.room);
    let userObj = {
      username: data.username,
      id: socket.id,
    };
    if (!currentUsers[data.room]) {
      currentUsers[data.room] = [];
      let exitingUser = currentUsers[data.room].find(
        (user) => user.username === data.username
      );
      if (!exitingUser) {
        currentUsers[data.room].push(userObj);
      }
    } else {
      let exitingUser = currentUsers[data.room].find(
        (user) => user.username === data.username
      );
      if (!exitingUser) {
        currentUsers[data.room].push(userObj);
      }
    }

    console.log(`User ${data.username} has entered the ${data.room} room`);
    io.to(data.room).emit("sendList", currentUsers);
  });

  socket.on("sendMessage", (data) => {
    console.log(data);
    socket.to(data.room).emit("receiveMessage", data.content);
  });

  socket.on("disconnect", () => {
    for (const item in currentUsers) {
      currentUsers[item] = currentUsers[item].filter(
        (obj) => obj.id != socket.id
      );
    }

    console.log("A user has disconnected");

    io.emit("sendList", currentUsers);
  });
});
