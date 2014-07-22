(function () {

  var ChatApp = window.ChatApp = (window.ChatApp || {});

  ChatApp.UI = function(chatClient) {
    this.chatClient = chatClient;
  };

  ChatApp.UI.prototype.getMessage = function(event) {
    event.preventDefault();
    var message = $('textarea').val();
    this.chatClient.sendMessage(message);
  };
  
  ChatApp.UI.prototype.displayMessage = function (data) {
    var $li = $('<li>');
    $li.text(data.message);

    $('#log').prepend($li);
  };

})();