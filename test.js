import { Saga } from "./app.js";

const task1 = function(a, b, c, callback){
	if(true){
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

const task2 = function(a, b, c, callback){
	if(true){
		return callback(null, "Task two executed successfully.");
	}else{
		return callback(new Error("Task two could not be executed successfully."), null);
	}
}

const task3 = function(a, b, c, callback){
	if(false){
		return callback(null, "Task three executed successfully.");
	}else{
		return callback(new Error("Task three could not be executed successfully."), null);
	}
}

const fallback1 = function(a, b, c){
	console.log("Fallback one called");
}

const fallback2 = function(a, b, c){
	console.log("Fallback two called");
}

const fallback3 = function(a, b, c){
	console.log("Fallback three called");
}

const nodesaga = new Saga();

nodesaga.StartTransaction([
								 {task : task1, fallback : fallback1, args : {task : ['a', 'b', 'c'], fallback : ['d', 'e', 'f']}},
								 {task : task2, fallback : fallback2, args : {task : ['g', 'h', 'i'], fallback : ['j', 'k', 'l']}},
								 {task : task3, fallback : fallback3, args : {task : ['g', 'h', 'i'], fallback : ['j', 'k', 'l']}}
								 ], function(err, done){
	if(err){
		console.log("Err is : ", err);
	}else{
		console.log("Message is : ", done);
	}
});