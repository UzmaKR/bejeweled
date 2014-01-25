var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,

  localStorage: new Backbone.LocalStorage('bejeweled-backbone'),

  resetTilesState: function(x1,y1,x2,y2) {
    var tile1 = this.findWhere( {x: x1, y: y1} );
    var tile2 = this.findWhere( {x: x2, y: y2} );
    tile1.toggle();
    tile2.toggle();
  },

  tileSwap: function(tilePairCoords) {
    var tile1 = this.findWhere( {x: tilePairCoords.x1, y: tilePairCoords.y1} );
    var tile2 = this.findWhere( {x: tilePairCoords.x2, y: tilePairCoords.y2} );
    var temp = tile1.get('value');
    tile1.setVal(tile2.getVal());
    tile2.setVal(temp);
  }



});

app.BoardGame = new Board();