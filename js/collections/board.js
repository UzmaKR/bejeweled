var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,

  localStorage: new Backbone.LocalStorage('bejeweled-backbone'),

  resetTilesState: function(x1,y1,x2,y2) {
    var tile1 = this.findWhere( {x: x1, y: y1} );
    var tile2 = this.findWhere( {x: x2, y: y2} );
    tile1.toggle();
    tile2.toggle();
  }



});

app.BoardGame = new Board();