(function () {

  var ChatApp = window.ChatApp = (window.ChatApp || {});

  ChatApp.Chat = function(socket) {
    this.socket = socket;
  };

  ChatApp.Chat.prototype.sendMessage = function(message) {
    this.socket.emit('from_browser_event', { message: message });
  }

  // chat = new Chat();
  // Chat.prototype.method = function() {}


})();