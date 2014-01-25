
var app = app || {};

app.SquareView = Backbone.View.extend({

  sqrTpl: _.template('<%= value %>'),

  events: {
	'click': 'toggleState'
  },

  initialize: function() {
    this.listenTo(this.model, 'change:value', this.render);
  },

  toggleState: function() {
    this.model.toggle();
  },

  render: function() {
  	this.$el.html( this.sqrTpl( this.model.toJSON() ) );
  	return this;
  }
})