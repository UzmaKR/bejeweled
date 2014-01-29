var app = app || {};

var Board = Backbone.Collection.extend({
  model: app.Square,

  localStorage: new Backbone.LocalStorage('bejeweled-backbone-board'),

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

  calcScore: function(numTiles) {//each tile type gets 25 points
    return numTiles * 25;
  },

  
  completeRound: function(tilePairCoords) {
    
    var x1 = tilePairCoords.x1;
    var y1 = tilePairCoords.y1;
    var x2 = tilePairCoords.x2;
    var y2 = tilePairCoords.y2;

    this.tileSwap(x1,y1,x2,y2);
    var listMatchedTiles1 = this.findMatchedTiles(x1,y1); //find for 1st tile
    var listMatchedTiles2 = this.findMatchedTiles(x2,y2); //find for 2nd tile

    if ((listMatchedTiles1.length === 0) && (listMatchedTiles2.length === 0)) {
      this.tileSwap(x1,y1,x2,y2); //an invalid move; revert back to original tile locations
      this.trigger('invalidmove');
      return 0;
    }
    
    //merge two Matched Tile arrays 
    var allTileSets = listMatchedTiles1.concat(listMatchedTiles2);
    var uniqueTiles = this.removeDuplicates(allTileSets);
    
    //update score
    var playerScore = this.calcScore(uniqueTiles.length);
    console.log('player score after tile swap is: ', playerScore);
    console.log('tile matches are: ', allTileSets);
    this.nullify(uniqueTiles);

    var prevDropTileInfo = this.dropTilesFillinNewTiles(uniqueTiles);
    console.log('first tile match done');
    //continue to find the tile matches in region of new tiles
    while (true) {
      var newTileMatches = [];
      prevDropTileInfo.forEach(function(tileCoord) {
        var y = tileCoord[1]; //each column
        var x = tileCoord[0]; //xmax
        for (var i = 0; i < x + 1; i++) {
          newTileMatches = newTileMatches.concat(this.findMatchedTiles(i,y));
        }
      }, this);
      var newUniqueTiles = this.removeDuplicates(newTileMatches);
      if (newUniqueTiles.length === 0) {
        console.log('no new tile matches found');
        //return playerScore;
        break;
      } else {
        console.log('new tile matches found');
        console.log('new tile matches are: ', newTileMatches);
        playerScore += this.calcScore(newUniqueTiles.length);
        console.log('new player score is: ', playerScore);
        this.nullify(newUniqueTiles);
        prevDropTileInfo = this.dropTilesFillinNewTiles(newUniqueTiles);
      }
    }

    return playerScore;
  },

  nullify: function(tileSets) {  //eliminate value in each tile
    var arr1 = tileSets.slice(0);
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
    if ( topAndBottomCount[0] >= 2) {                    // Vertical check
      for (var i = 0; i < topAndBottomCount[0]; i++) {
        listOfIdenticalTiles.push([x1-i,y1]);
      }
    }
    if ( topAndBottomCount[1] >= 2) {
      for (var i = 0; i < topAndBottomCount[1]; i++) {
        listOfIdenticalTiles.push([x1+i,y1]);
      }
    }

    var leftAndRightCount = this.horzMidCheck(x1,y1);    //Horizontal middle check
    if ( leftAndRightCount[0] >= 2) {
      for (var i = 0; i < leftAndRightCount[0]; i++) {
        listOfIdenticalTiles.push([x1,y1-i]);
      }
    }
    if ( leftAndRightCount[1] >= 2) {
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

  removeDuplicates: function(arr1) {

    var array1 = arr1.slice(0);

    var hashUniqueCoords = {};
    var listOfUniqueMatchedTiles = [];

    array1.forEach(function(coord) {
      if (hashUniqueCoords[JSON.stringify(coord)] === undefined) {
        hashUniqueCoords[JSON.stringify(coord)] = 1;
      }
    });

    for ( var key in hashUniqueCoords) {
        listOfUniqueMatchedTiles.push(JSON.parse(key));
    };

    return listOfUniqueMatchedTiles;

  },

  dropTilesFillinNewTiles: function(setOfIdenticalTiles) {
    console.log('got in dropTiles method');

    //Get range of columns from identical tile sets
    //Get max row(x) for each column
    //Then for each column: 1. start at xmax, add nonempty tiles from bottom
    // 2. Then add random alphabets.

    var gems = 'ABCDEF';
    var tileSet = setOfIdenticalTiles.slice(0);
    var colIndices = _.map(tileSet, function(coord) { return coord[1] });
    //array of unique columns
    var uniqYs = _.filter(colIndices, function(value, index) { return colIndices.indexOf(value) === index });
  
    var dropTileIterator = [];

    //generate array of (xmax, y), where xmax is largest (empty) row value for each column
    uniqYs.forEach(function(y) {
      var intermArr = _.filter(tileSet, function(coord) { return coord[1] === y });
      var xmax = _.max(intermArr, function(coord) { return coord[0] });
      dropTileIterator.push([xmax[0],y]);
    })

    //Now, iterate through each column 
    dropTileIterator.forEach(function(coord) { //in each column
      //generate array of empty tile coordinates
      // var emptyTiles = _.filter(tileSet, function(tile) { return coord[1] === tile[1] });
      var nonEmptyTiles = [];
      var allTiles = [];
      //generate array of all tiles from xmax to x=0; also create array of nonempty tiles
      for (var x = coord[0]; x >= 0; x-- ) {
        //allTiles 0th item starts at xmax
        allTiles.push([x,coord[1]]);
        if (this.getModel(x,coord[1]).get('value') != '') {
          //non empty tiles array's 0th item starts at xmax row.
          nonEmptyTiles.push([x,coord[1]]);
        }
      }

      //for each column, start *dropping* tiles from bottom-most tile
      for (var i = 0; i < nonEmptyTiles.length; i++) {
        
        var x1 = nonEmptyTiles[i][0];
        var y1 = nonEmptyTiles[i][1];
        var newVal = this.getModel(x1,y1).get('value');

        var x2 = allTiles[i][0];
        var y2 = allTiles[i][1];
        this.getModel(x2,y2).setVal(newVal);
      }

      //for remaining tiles at the top, generate random alphabets
      for (var z = (coord[0] - nonEmptyTiles.length); z >=0 ; z--) {
        this.getModel(z,coord[1]).setVal(gems[Math.floor(Math.random() * gems.length)]);
      }

    }, this)

    return dropTileIterator;

  }



});

app.BoardGame = new Board();