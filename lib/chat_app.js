var http = require('http'),
    static = require('node-static'),
    socketio = require('socket.io')

//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('../public');

var server = http.createServer(function (request, response) {
  //enableCORS(request, response);
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
})

server.listen(8000);

var nicknames = {
  // socket: nickname
};

var currentRooms = {
  
};

var users = function() {
  return Object.keys(nicknames).map(function(v) { 
    return nicknames[v];
  });
};

var guestNumber = 1;

var io = socketio(server);
io.on("connection", function(socket) {
  console.log('new connection');
  nicknames[socket.id] = "guest" + guestNumber;
  guestNumber++;
  
  var joinRoom = function(room) {
    console.log("i'm in the join room method")
    socket.leave(currentRooms[socket.id]);
    socket.join(room);
    console.log("here are my rooms after joining" + socket.rooms[0])
    currentRooms[socket.id] = room;
    usersInRoom();
  };
  
  var usersInRoom = function() {
    var mySockets = io.sockets.in(currentRooms[socket.id])
    var myUsers = []
    console.log(mySockets.length)
    for (var i = 0; i < mySockets.length; i++) {
      myUsers.push(nicknames[mySockets[i].id])
    }
    console.log(myUsers)
    return myUsers;
  }
  
  var that = this;
  joinRoom("lobby");
  
  socket.emit("from_node_event", { message: "Hi from node," + nicknames[socket.id] + "!" } );
  io.sockets.emit("from_node_event", { message: nicknames[socket.id] + " has logged on." });
  io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + " has joined the lobby." });
  io.sockets.in(currentRooms[socket.id]).emit("new_users_event", users());
  
  
  socket.on("from_browser_event", function(data) {
    console.log(data);
    io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + ":" + " " + data.message });
  });
  
  socket.on("disconnect", function() {
    io.sockets.emit("from_node_event", { message: nicknames[this.id] + " has left the building" });
    delete nicknames[this.id];
    io.sockets.in(currentRooms[socket.id]).emit("new_users_event", users());
  })
  
  socket.on("nicknameChangeRequest", function(newNickname) {
    var contains = function(arr, obj) {
      var i = arr.length;
      for(var i = 0; i<arr.length; i++) {
        if (arr[i] === obj) {
          return true;
        }
      }
      return false;
    }

    if (newNickname.slice(0, 5).toLowerCase() == "guest") {
      var nicknameMessage = "Nickname cannot begin with 'guest'"
    } else if (contains(users(), newNickname)) {
      var nicknameMessage = 'Too late. Someone has that nickname.'
    } else {
      io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + " changed their name to " + newNickname });
      nicknames[socket.id] = newNickname;
      var nicknameMessage = "Awesome, you changed your nickname to " + newNickname;
      io.sockets.in(currentRooms[socket.id]).emit("new_users_event", users());
    }
    socket.emit("from_node_event", { message: nicknameMessage})
  });
  
  socket.on("roomChangeRequest", function(room) {
    joinRoom(room);
  })
  
});