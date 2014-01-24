var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,
  localStorage: new Backbone.LocalStorage('bejeweled-backbone')
});

app.BoardGame = new Board();