var app = app || {};

app.BoardView = Backbone.View.extend({

  el: '#bejeweled',

  currentBoardState: '',

  initialize: function() {
  	//Grab the DOM elements to the game board and input field.
    this.board = this.$('#board');
    this.username = this.$('#user-name');

    //generate the gem locations of the board in 2D array
    this.currentBoardState = app.BoardGame.genInitBoardState();
    this.render();
  },

  render: function() {
    var self = this;
    for (var i = 0; i < 8; i++) {
    	var row = this.board.find('#row'+(i+1));
    	var j = 0;
    	row.children().each(function() {
          var view = new app.SquareView( {model: self.currentBoardState[i][j]} );
          (view.render().$el).appendTo($(this));
          j++;
    	});
    }
   }

});

