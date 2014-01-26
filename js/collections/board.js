var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,

  localStorage: new Backbone.LocalStorage('bejeweled-backbone'),

  getModel: function(x1,y1) {
    return this.findWhere( {x: x1, y: y1} );
  },

  resetTilesState: function(x1,y1,x2,y2) {
    var tile1 = this.getModel(x1,y1);
    var tile2 = this.getModel(x2,y2);
    tile1.toggle();
    tile2.toggle();
  },

  tileSwap: function(x1,y1,x2,y2) {
    var x1 = x1;
    var y1 = y1;
    var x2 = x2;
    var y2 = y2;
    var tile1 = this.getModel(x1, y1);
    var tile2 = this.getModel(x2, y2);
    var temp = tile1.get('value');
    tile1.setVal(tile2.getVal());
    tile2.setVal(temp);
  },

  
  completeRound: function(tilePairCoords) {
    var x1 = tilePairCoords.x1;
    var y1 = tilePairCoords.y1;
    var x2 = tilePairCoords.x2;
    var y2 = tilePairCoords.y2;

    this.tileSwap(x1,y1,x2,y2);
    var listMatchedTiles1 = this.findMatchedTiles(x1,y1); //find for 1st tile
    var listMatchedTiles2 = this.findMatchedTiles(x2,y2); //find for 2nd tile
    
    //merge two Matched Tile arrays and remove duplicates
    var allTileSets = this.mergeAndRemoveDuplicates(listMatchedTiles1,listMatchedTiles2);
    
    this.nullify(allTileSets);


  },

  nullify: function(tileSets) {  //eliminate value in each tile
    var arr1 = tileSets;
    var self = this;
    arr1.forEach(function(coords) {
      var model = self.getModel(coords[0],coords[1]);
      model.setVal('');
    });

  },

  findMatchedTiles: function(x1,y1) {
    var listOfIdenticalTiles = [];
    var numOfMatches = this.leftCheck(x1,y1); //Check for matches left of tile
    if (numOfMatches >= 3) {
      for (var i = 0; i < numOfMatches; i++) {
        listOfIdenticalTiles.push([x1,y1-i]);
      }
    }
    numOfMatches = this.rightCheck(x1,y1);    //Check for matches right of tile
    if (numOfMatches >= 3) {
      for (var i = 0; i < numOfMatches; i++) {
        listOfIdenticalTiles.push([x1,y1+i]);
      }
    }
    numOfMatches = this.topCheck(x1,y1);     //Check for matches top of tile
    if (numOfMatches >= 3) {
      for (var i = 0; i < numOfMatches; i++) {
        listOfIdenticalTiles.push([x1-i,y1]);
      }
    }

    numOfMatches = this.bottomCheck(x1,y1);   //Check for matches bottom of tile
    if (numOfMatches >= 3) {
      for (var i = 0; i < numOfMatches; i++) {
        listOfIdenticalTiles.push([x1+i,y1]);
      }
    }

    var topAndBottomCount = this.vertMidCheck(x1,y1);  //Check for matches where tile is in the middle
    if ( topAndBottomCount[0] > 0) {                    // Vertical check
      for (var i = 0; i < topAndBottomCount[0]; i++) {
        listOfIdenticalTiles.push([x1-i,y1]);
      }
    }
    if ( topAndBottomCount[1] > 0) {
      for (var i = 0; i < topAndBottomCount[1]; i++) {
        listOfIdenticalTiles.push([x1+i,y1]);
      }
    }

    var leftAndRightCount = this.horzMidCheck(x1,y1);    //Horizontal middle check
    if ( leftAndRightCount[0] > 0) {
      for (var i = 0; i < leftAndRightCount[0]; i++) {
        listOfIdenticalTiles.push([x1,y1-i]);
      }
    }
    if ( leftAndRightCount[1] > 0) {
      for (var i = 0; i < leftAndRightCount[1]; i++) {
        listOfIdenticalTiles.push([x1,y1+i]);
      }
    }
    return listOfIdenticalTiles;
  },

  leftCheck: function(x1,y1) {
    var count = 1;
    var targetVal = this.getModel(x1,y1).getVal();
    var x = x1;
    var y = y1-1;
    while (y >= 0) {
      var curr_value = this.getModel(x,y).getVal();
      if (targetVal !== curr_value) {
        break;
      } else {
        count=count+1
        y=y-1;
      }
    }
    return count;
  },

  rightCheck: function(x1,y1) {
    var count = 1;
    var targetVal = this.getModel(x1,y1).getVal();
    var x = x1;
    var y = y1+1;
    while (y <= 7) {
      var curr_value = this.getModel(x,y).getVal();
      if (targetVal !== curr_value) {
        break;
      } else {
        count=count+1
        y=y+1;
      }
    }
    return count;
  },

  topCheck: function(x1,y1) {
    var count = 1;
    var targetVal = this.getModel(x1,y1).getVal();
    var x = x1-1;
    var y = y1;
    while (x >= 0) {
      var curr_value = this.getModel(x,y).getVal();
      if (targetVal !== curr_value) {
        break;
      } else {
        count=count+1
        x=x-1;
      }
    }
    return count;
  },

  bottomCheck: function(x1,y1) {
    var count = 1;
    var targetVal = this.getModel(x1,y1).getVal();
    var x = x1+1;
    var y = y1;
    while (x <= 7) {
      var curr_value = this.getModel(x,y).getVal();
      if (targetVal !== curr_value) {
        break;
      } else {
        count=count+1
        x=x+1;
      }
    }
    return count;
  },

  vertMidCheck: function(x1,y1) {
    var topCount = this.topCheck(x1,y1);
    var bottomCount = this.bottomCheck(x1,y1);

    if ((topCount >= 2) && (bottomCount >= 2)) {
      return [topCount,bottomCount];
    } else {
      return [0,0];
    }
  },

  horzMidCheck: function(x1,y1) {
    var leftCount = this.leftCheck(x1,y1);
    var rightCount = this.rightCheck(x1,y1);

    if ((leftCount >= 2) && (rightCount >= 2)) {
      return [leftCount,rightCount];
    } else {
      return [0,0];
    }
  },

  mergeAndRemoveDuplicates: function(arr1, arr2) {

    var array1 = arr1;
    var array2 = arr2;
    if (array1.length === 0) return array2;
    if (array2.length === 0) return array1;

    var hashUniqueCoords = {};
    var listOfAllMatchedTiles = [];

    array1.forEach(function(coord) {
      if (hashUniqueCoords[JSON.stringify(coord)] === undefined) {
        hashUniqueCoords[JSON.stringify(coord)] = 1;
      }
    });

    array2.forEach(function(coord) {
      if (hashUniqueCoords[JSON.stringify(coord)] === undefined) {
        hashUniqueCoords[JSON.stringify(coord)] = 1;
      }
    });

    for ( var key in hashUniqueCoords) {
        listOfAllMatchedTiles.push(JSON.parse(key));
    };

    return listOfAllMatchedTiles;

  }



});

app.BoardGame = new Board();