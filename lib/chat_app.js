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

var guestNumber = 1;

var io = socketio(server);
io.on("connection", function(socket) {
  console.log('new connection');
  nicknames[socket.id] = "guest" + guestNumber;
  guestNumber++;
  
  socket.emit("from_node_event", { message: "Hi from node," + nicknames[socket.id] + "!" } );
  
  socket.on("from_browser_event", function(data) {
    console.log(data);
    io.sockets.emit("from_node_event", { message: nicknames[socket.id] + ":" + " " + data.message });
  });
  
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
    
    var values = Object.keys(nicknames).map(function(v) { 
      return nicknames[v];
    });

    if (newNickname.slice(0, 5).toLowerCase() == "guest") {
      var nicknameMessage = "Nickname cannot begin with 'guest'"
    } else if (contains(values, newNickname)) {
      var nicknameMessage = 'Too late. Someone has that nickname.'
    } else {
      nicknames[socket.id] = newNickname;
      var nicknameMessage = "Awesome, you changed your nickname to " + newNickname
    }
    socket.emit("from_node_event", { message: nicknameMessage})
  });
});