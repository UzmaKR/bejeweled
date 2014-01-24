
var app = app || {};

app.SquareView = Backbone.View.extend({
  sqrTpl: _.template('<%= value %>'),

  render: function() {
  	this.$el.html( this.sqrTpl( this.model.toJSON()) );
  	return this;
  }
})