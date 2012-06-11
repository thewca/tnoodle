var conf = require('./conf.js');
var mongoose = require('mongoose');
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
console.log(moves);//<<<
var randomState = null;
console.log(randomState);
console.log(solveMillis);//<<<
// TODO - store inspection time!!!
// We clear randomState because we have now solved the puzzle.
solveInstance.save(function(err){
  console.log("SAVED SOME SHIT SOMEWHERE");

  if(err){
	  console.log("db error : " + err);
  }
});
