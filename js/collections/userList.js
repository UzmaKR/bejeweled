var app = app || {};

var UserList = Backbone.Collection.extend({

  model: app.User,

  localStorage: new Backbone.LocalStorage('bejeweled-backbone-userlist'),

  getHighestScore: function() {
    var obj = this.max(function(user) { return user.getScore() } );
    return obj.getScore();
  },

  getHighestScoreName: function() {
  	var obj = this.max(function(user) { return user.getScore() } );
  	return obj.getUsername();
  },

  updateUserScore: function(roundScore, currentPlayer) {
    var obj = this.find(function(user) {return (user.getUsername() === currentPlayer) } );	
    obj.updateScore(roundScore);
  }

});

app.Users = new UserList();