var http = require('http'),
    static = require('node-static'),
    socketio = require('socket.io');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('../public');

var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
})

server.listen(8000);

var nicknames = {};

var currentRooms = {};

var users = function() {
  return Object.keys(nicknames).map(function(nickname) { 
    return nicknames[nickname];
  });
};

var rooms = function() {
  return Object.keys(currentRooms).map(function(currentRoom) { 
    return currentRooms[currentRoom];
  });
};

var socketsInRoom = function(room) {
	console.log("socketsInRoom called");
	return Object.keys(currentRooms).filter(function(thisSocket) {
		return currentRooms[thisSocket] === room;
	});
};

var guestNumber = 1;

var io = socketio(server);
io.on("connection", function(socket) {
  console.log('new connection');
  nicknames[socket.id] = "guest" + guestNumber;
  guestNumber++;
  
  var joinRoom = function(room) {
    socket.leave(currentRooms[socket.id]);
    socket.join(room);
	
	var oldRoom = currentRooms[socket.id];
    currentRooms[socket.id] = room;
	
    io.sockets.in(oldRoom).emit("new_users_event", usersInRoom(oldRoom));
    io.sockets.in(room).emit("new_users_event", usersInRoom(room));
	socket.emit("change_room_event", room);
  };
  
  var usersInRoom = function(room) {
	console.log("usersInRoom called");
	room = room || currentRooms[socket.id];
    var roomSockets = socketsInRoom(room);
	console.log("RoomSockets:");
	console.log(roomSockets);
    var myUsers = [];
	
    for (var i = 0; i < roomSockets.length; i++) {
      myUsers.push(nicknames[roomSockets[i]])
    }
	console.log("Users array:")
    console.log(myUsers);
    return myUsers;
  }
  
  var that = this;
  joinRoom("lobby");
  
  socket.emit("from_node_event", { message: "Hi from node," + nicknames[socket.id] + "!" } );
  io.sockets.emit("from_node_event", { message: nicknames[socket.id] + " has logged on." });
  io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + " has joined the lobby." });
  io.sockets.in(currentRooms[socket.id]).emit("new_users_event", usersInRoom());
  
  
  socket.on("from_browser_event", function(data) {
    console.log(data);
    io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + ":" + " " + data.message });
  });
  
  socket.on("disconnect", function() {
    io.sockets.emit("from_node_event", { message: nicknames[this.id] + " has left the building" });
    delete nicknames[this.id];
    io.sockets.in(currentRooms[socket.id]).emit("new_users_event", usersInRoom());
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

    if (newNickname.slice(0, 5).toLowerCase() === "guest") {
      var nicknameMessage = "Nickname cannot begin with 'guest'"
    } else if (contains(users(), newNickname)) {
      var nicknameMessage = 'Too late. Someone has that nickname.'
    } else {
      io.sockets.in(currentRooms[socket.id]).emit("from_node_event", { message: nicknames[socket.id] + " changed their name to " + newNickname });
      nicknames[socket.id] = newNickname;
      var nicknameMessage = "Awesome, you changed your nickname to " + newNickname;
      io.sockets.in(currentRooms[socket.id]).emit("new_users_event", usersInRoom());
    }
    socket.emit("from_node_event", { message: nicknameMessage});
  });
  
  socket.on("roomChangeRequest", function(room) {
    joinRoom(room);	
  })
  
});