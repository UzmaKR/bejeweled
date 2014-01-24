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
  },

  

});