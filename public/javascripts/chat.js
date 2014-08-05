(function () {

  var ChatApp = window.ChatApp = (window.ChatApp || {});

  ChatApp.Chat = function(socket) {
    this.socket = socket;
  };

  ChatApp.Chat.prototype.sendMessage = function(message) {
    if (message.slice(0,5) =='/nick') {
      this.socket.emit('nicknameChangeRequest', message.slice(5, message.length - 1));
      console.log(message.slice(5, message.length - 1));
    } else if (message.slice(0,5) =="/room") {
      this.socket.emit('roomChangeRequest', message.slice(5, message.length - 1));
    } else {
      this.socket.emit('from_browser_event', { message: message });
    }
  };
})();