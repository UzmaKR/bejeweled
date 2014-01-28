var app = app || {};

app.BoardView = Backbone.View.extend({

  el: '#bejeweled',

  numOfClicks: 0,

  tilePairCoords: {
    x1: -1,
    y1: -1,
    x2: -1,
    y2: -1
  },

  currentPlayer: '',

  events: {
    'keypress #user-name': 'createUser',
    'click #end-game': 'endGame'
  },

  createUser: function(e) {
    if ((e.keyCode === ENTER_KEY) && (this.username.val().trim() != '')) {
      var name = this.username.val().trim();
      app.Users.create({username: name, totalScore: 0});

    }
  },

  endGame: function() {
    this.currentPlayer = '';
    this.$('div #user-info').remove();
    //find highest Score and display it
    var hiScoreDom = this.footer.find('#hiScore');
    (hiScoreDom).html(""+app.Users.getHighestScore());
    var hiNameDom = this.footer.find('#hiUsername');
    (hiNameDom).html(""+app.Users.getHighestScoreName());
  },

  genInitBoardState: function() {
    var gems = 'ABCDEF';
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
    this.footer = this.$('footer');

    this.listenTo(app.BoardGame, 'change:state', this.startMove);
    this.listenTo(app.Users, 'add', this.addUser);
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
  },

  startMove: function(e) {
    console.log('startMove');
    if (!(e.get('state'))) { //when tile is clicked twice, do nothing
      this.numOfClicks = 0;
      return;
    }
    
    if (this.numOfClicks) { //1st click has already been made
      this.numOfClicks = 0; //reset on 2nd click
      if (this.sideBySideTiles(e)) { //check if tiles are side by side
        var roundScore = app.BoardGame.completeRound(this.tilePairCoords); //Start the swap/drop process
        app.Users.updateUserScore(roundScore, this.currentPlayer);
      }
      this.resetRound();
    } else { //on 1st click
      this.numOfClicks = 1;
      this.set1stClickCoords(e);
    }
  },

  addUser: function(user) {
    var view = new app.UserView({model: user});
    (view.render().$el).appendTo(this.footer);
    //sets currentPlayer to new user name
    this.currentPlayer = user.getUsername();
  },

  set1stClickCoords: function(e) {
    this.tilePairCoords.x1 = e.get('x');
    this.tilePairCoords.y1 = e.get('y');
  },

  set2ndClickCoords: function(e) {
    this.tilePairCoords.x2 = e.get('x');
    this.tilePairCoords.y2 = e.get('y');
  },

  sideBySideTiles: function(e) {
    this.set2ndClickCoords(e);
    var x1 = this.tilePairCoords.x1;
    var y1 = this.tilePairCoords.y1;
    var x2 = this.tilePairCoords.x2;
    var y2 = this.tilePairCoords.y2;
    return (((x1 === x2) && (((y1+1) === y2) || ((y1-1) === y2))) ||
           ((y1 === y2) && (((x1+1) === x2) || ((x1-1) === x2))));
  },

  resetRound: function() {
    var x1 = this.tilePairCoords.x1;
    var y1 = this.tilePairCoords.y1;
    var x2 = this.tilePairCoords.x2;
    var y2 = this.tilePairCoords.y2;
    app.BoardGame.resetTilesState(x1,y1,x2,y2);
  }


});

