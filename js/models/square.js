
var app = app || {};

app.Square = Backbone.Model.extend({
	default: {
		value: '',
		state: false, //if clicked on, state of square is true
		x: 0,
		y: 0
	},

	getVal: function() {
		return this.get('value');
	},

	setVal: function(v) {
		return this.set('value',v);
	},

	toggle: function() {
	  this.set("state", !this.get('state') );
	}

	
});