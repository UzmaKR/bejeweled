var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,

  genInitBoardState: function() {
  	var gems = 'ABCDE';
  	var locOfGems = new Array(8);
  	for ( var i = 0; i < 8; i++ ) {
  		locOfGems[i] = new Array(8);
  		for (var j=0; j < 8; j++ ) {
          locOfGems[i][j] = new app.Square( {value: gems[Math.floor(Math.random() * gems.length)]} );
  		}
  	}

  	return locOfGems;
  }
  

});

app.BoardGame = new Board();