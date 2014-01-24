
var app = app || {};

app.Square = Backbone.Model.extend({
	default: {
		value: '',
		state: false, //if clicked on, state of square is true
		x: 0,
		y: 0
	},

	toggle: function() {
	  this.set("state", !this.get('state') );
	}

	
});