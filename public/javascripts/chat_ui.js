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
  
  ChatApp.UI.prototype.changeUsersList = function (users) {
    var users_list = $("<ul>");
    
    users.forEach(function(user) {
      var $li = $("<li>");
      $li.text(user);
      users_list.append($li);
    });
    
    $("#users-list").html(users_list);
  }

})();