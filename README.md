## nodesaga
Saga implementation in Node.JS. It's done to prevent overhead for long transaction processes in an application by breaking the Microservices into multiple.

## HOW TO INSTALL
#npm install nodesaga --save

## HOW TO USE

```javascript

//Suppose your app is having following services tesk1, task2, task3 doing different different operations

var task1 = function(a, b, c, callback){
	if(true){ //true here if the task executed is successfull.
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

var task2 = function(a, b, c, callback){
	if(true){ //true here if the task executed is successfull.
		return callback(null, "Task two executed successfully.");
	}else{    //fasle here if the task executed not successfull.
		return callback(new Error("Task two could not be executed successfully."), null);
	}
}

var task3 = function(a, b, c, callback){
	if(false){ //true here if the task executed is successfull.
		return callback(null, "Task three executed successfully.");
	}else{    //fasle here if the task executed not successfull.
		return callback(new Error("Task three could not be executed successfully."), null);
	}
}

//fallback1 is service if task1 fails, to revert changes

var fallback1 = function(a, b, c, callback){
	console.log("Fallback one called");
}

//fallback2 is service if task2 fails, to revert changes

var fallback2 = function(a, b, c, callback){
	console.log("Fallback two called");
}

//fallback3 is service if task3 fails, to revert changes

var fallback3 = function(a, b, c, callback){
	console.log("Fallback three called");
}

var nodesaga = require('nodesaga');

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

```


## {task : task1, fallback : fallback1, args : {task : ['a', 'b', 'c'], fallback : ['d', 'e', 'f']}}
#### Here we can give a transaction in form of a pipelines. All will run one after another :)

