var conf = require('./conf.js');
var mongoose = require('mongoose');
var util = require('util');
mongoose.connect(conf.mongo.uri);

//mongodb stuff
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var TurnSchema = new Schema({
  move: String,
  delta: Number
});

var SolveSchema = new Schema({
  turns:[TurnSchema],
  gameName: String,
  inspectSec: Number,
  solveMillis: Number
});

//initializing models
var Turn = mongoose.model('Turn', TurnSchema);
var Solve = mongoose.model('Solve', SolveSchema);


var solveMillis = 1000;
var moves = [];
var storeObject = {
        turns: moves,
        gameName: "3x3x3",
        inspectSec: 15,
        solveMillis: solveMillis
};
var solveInstance = new Solve(storeObject);
util.puts(moves);
var randomState = null;
util.puts(randomState);
util.puts(solveMillis);
// TODO - store inspection time!!!
// We clear randomState because we have now solved the puzzle.
solveInstance.save(function(err){
  util.puts("SAVED SOME SHIT SOMEWHERE");

  if(err){
          util.puts("db error : " + err);
  }
});
