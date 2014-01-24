var app = app || {};

app.BoardView = Backbone.View.extend({

  el: '#bejeweled',

  genInitBoardState: function() {
    var gems = 'ABCDE';
    for ( var i = 0; i < 8; i++ ) {
      for (var j=0; j < 8; j++ ) {
          app.BoardGame.create( {value: gems[Math.floor(Math.random() * gems.length)],
                             state: false,
                             x: i,
                             y: j } );
      }
    }
  },

  initialize: function() {
  	//Grab the DOM elements to the game board and input field.
    this.board = this.$('#board');
    this.username = this.$('#user-name');

    //generate the gem locations
    this.genInitBoardState();
    this.renderInit();
  },

  renderInit: function() {
    var self = this;

    app.BoardGame.forEach(function(item) {
      var row = item.get('x');
      var col = item.get('y');
      var rowDom = self.board.find('#row'+(row+1));
      var cellDom = rowDom.find('.col'+(col+1));
      var view = new app.SquareView( {model: item} );
      (view.render().$el).appendTo(cellDom);

    });

  }

});

