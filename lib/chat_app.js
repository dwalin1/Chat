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

var io = socketio(server);
io.on("connection", function(socket) {
  console.log('new connection');
  socket.emit("from_node_event", { message: "Hi from node!" } );
  
  socket.on("from_browser_event", function(data) {
    console.log(data);
    io.sockets.emit("from_node_event", { message: data.message });
  });
});