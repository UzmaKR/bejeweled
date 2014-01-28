var app = app || {};

app.UserView = Backbone.View.extend({

  usrTpl: _.template($('#user-template').html()),

  initialize: function() {
    this.listenTo(this.model, "change:totalScore", this.render);
  },

  render: function() {
  	this.$el.html(this.usrTpl(this.model.toJSON() ));
  	return this;
  }

});