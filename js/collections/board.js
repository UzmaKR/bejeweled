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

  calcScore: function(numTiles) {//all tile types get 25 points each
    return numTiles * 25;
  },

  
  completeRound: function(tilePairCoords) {
    
    var x1 = tilePairCoords.x1;
    var y1 = tilePairCoords.y1;
    var x2 = tilePairCoords.x2;
    var y2 = tilePairCoords.y2;

    this.tileSwap(x1,y1,x2,y2);
    
    var listMatchedTiles1 = this.findMatchedTiles(x1,y1); //find for 1st tile
    console.log('match tiles for tile1: ', listMatchedTiles1);
    var listMatchedTiles2 = this.findMatchedTiles(x2,y2); //find for 2nd tile
    console.log('match tiles for tile2: ', listMatchedTiles2);

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
    //eliminate the matched tiles for the tile pair
    this.nullify(uniqueTiles);
    //save the (max-row,col) information 
    var prevDropTileInfo = this.dropTilesFillinNewTiles(uniqueTiles);
  
    //continue to find the tile matches in region of new tiles
    //use prevDropTileInfo to check region
    while (true) {
      var newTileMatches = [];
      prevDropTileInfo.forEach(function(tileCoord) {
        var y = tileCoord[1]; //each column
        var x = tileCoord[0]; //max row
        for (var i = 0; i < x + 1; i++) {
          newTileMatches = newTileMatches.concat(this.findMatchedTiles(i,y));
        }
      }, this);
      var newUniqueTiles = this.removeDuplicates(newTileMatches);
      if (newUniqueTiles.length === 0) {
        break;
      } else {
        playerScore += this.calcScore(newUniqueTiles.length);
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
      
    var x = x1;
    var y = y1;

    var targetVal = this.getModel(x,y).getVal();
    var tileSet = [];
    var listOfIdenticalTiles = [];

    var leftTilesResult = this.findTiles(targetVal,0,x,y,"left",tileSet);
    console.log('left tiles results: ', leftTilesResult);
    if (leftTilesResult[0] >= 3) {  //Check for matches left of tile
      for (var i = 0; i < leftTilesResult[0]; i++) {
        listOfIdenticalTiles.push(leftTilesResult[1][i]);
      }
    }
    var rightTilesResult = this.findTiles(targetVal,0,x,y,"right",tileSet);
    console.log('right tiles results: ', rightTilesResult);
    if (rightTilesResult[0] >= 3) {  //Check for matches right of tile
      for (var i = 0; i < rightTilesResult[0]; i++) {
        listOfIdenticalTiles.push(rightTilesResult[1][i]);
      }
    }
    var topTilesResult = this.findTiles(targetVal,0,x,y,"top",tileSet);
    console.log('top tiles results: ', topTilesResult);
    if (topTilesResult[0] >= 3) {   //Check for matches top of tile
      for (var i = 0; i < topTilesResult[0]; i++) {
        listOfIdenticalTiles.push(topTilesResult[1][i]);
      }
    }
    var bottomTilesResult = this.findTiles(targetVal,0,x,y,"bottom",tileSet);
    console.log('bottom tiles results: ', bottomTilesResult);
    if (bottomTilesResult[0] >= 3) {   //Check for matches bottom of tile
      for (var i = 0; i < bottomTilesResult[0]; i++) {
        listOfIdenticalTiles.push(bottomTilesResult[1][i]);
      }
    }

    if ((leftTilesResult[0] >= 2) && (rightTilesResult[0] >= 2)) {
      for (var i = 0; i < leftTilesResult[0]; i++) {  //check for mid horizontal
        listOfIdenticalTiles.push(leftTilesResult[1][i]);
      }
      for (var j = 0; j < rightTilesResult[0]; j++) {
        listOfIdenticalTiles.push(rightTilesResult[1][j]);
      }
    }

    if ((topTilesResult[0] >= 2) && (bottomTilesResult[0] >= 2)) {
      for (var i = 0; i < topTilesResult[0]; i++) { //check for mid vertical
        listOfIdenticalTiles.push(topTilesResult[1][i]);
      }
      for (var j = 0; j < bottomTilesResult[0]; j++) {
        listOfIdenticalTiles.push(bottomTilesResult[1][j]);
      }
    }

    return listOfIdenticalTiles;
  },

  findTiles: function(val,count,x,y,direction,tileSet) {
    //Recursive method to find tile sets in each direction

    //end of table is reached, return undefined
    if ((this.getModel(x,y) === null) || (this.getModel(x,y) === undefined)) {
      console.log('out of table');
      return ;
    }

    var tileArray = tileSet.slice(0); //local copy of tile variables
    var target = val;
    var xNew = x;
    var yNew = y;
    var counter = count;
    var dir = direction;
    var newVal = this.getModel(xNew,yNew).getVal();
    var rtn;

    if (newVal === target) {
      console.log('newVal is: ', newVal);
      console.log('target is: ', target);
      counter++;
      tileArray.push([xNew,yNew]);
      if (dir === "left") {
        rtn = this.findTiles(target,counter,xNew,yNew-1,"left",tileArray);
      } else if (dir === "right") {
        rtn = this.findTiles(target,counter,xNew,yNew+1,"right",tileArray);
      } else if (dir === "top") {
        rtn = this.findTiles(target,counter,xNew-1,yNew,"top",tileArray);
      } else if (dir === "bottom") {
        rtn = this.findTiles(target,counter,xNew+1,yNew,"bottom",tileArray);
      }
    }
    if ((rtn === null) || (rtn === undefined)) {
      console.log('rnt is null or undefined: ', rtn);
     return [counter,tileArray];
    } else {
      console.log('rnt is not null/undefine: ', rtn);
      return rtn;
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