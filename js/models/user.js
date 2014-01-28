var app = app || {};

app.User = Backbone.Model.extend({
   
   default: {
     username: '',

     totalScore: 0
   },

   updateScore: function(score) {
   	var oldScore = this.get('totalScore');
   	this.set('totalScore',oldScore+score);
   },

   getScore: function() {
   	return this.get('totalScore');
   },

   getUsername: function() {
   	return this.get('username');
   },

   setUsername: function(name) {
   	this.set('username',name);
   }

})