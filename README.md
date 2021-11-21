## nodesaga
Saga implementation in Node.JS. It's done to prevent overhead for long transaction processes and call functions of constious microservices related to it depending on each other in a queue execution and run fallbacks if one of them is unsuccessful.

You can define your custom transaction and their respective fallbacks.
Please read below carefully. For better understanding you can reach me out.
Thanks!

![Saga design](https://cdn-images-1.medium.com/max/1600/1*2iJ9L9-PxPU8cT1tRH2VPA.png)

## HOW TO INSTALL
### npm install nodesaga --save

## HOW TO USE

```javascript

import { Saga } from "./app.js";

//Suppose your app is having following services task1, task2, task3 doing different different operations

const task1 = function(a, b, c, callback){
	if(true){ //true here if the task executed is successfull.
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

const task2 = function(a, b, c, callback){
	if(true){ //true here if the task executed is successfull.
		return callback(null, "Task two executed successfully.");
	}else{    //fasle here if the task executed not successfull.
		return callback(new Error("Task two could not be executed successfully."), null);
	}
}

const task3 = function(a, b, c, callback){
	if(false){ //true here if the task executed is successfull.
		return callback(null, "Task three executed successfully.");
	}else{    //fasle here if the task executed not successfull.
		return callback(new Error("Task three could not be executed successfully."), null);
	}
}

//fallback1 is service if task1 fails, to revert changes

const fallback1 = function(a, b, c){
	console.log("Fallback one called");
}

//fallback2 is service if task2 fails, to revert changes

const fallback2 = function(a, b, c){
	console.log("Fallback two called");
}

//fallback3 is service if task3 fails, to revert changes

const fallback3 = function(a, b, c){
	console.log("Fallback three called");
}

const saga = new Saga();

saga.StartTransaction([
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


### {task : task1, fallback : fallback1, args : {task : ['a', 'b', 'c'], fallback : ['d', 'e', 'f']}} 

```javascript

//above is a transaction pipeline

args : {
	      task : ['a', 'b', 'c'], // 'a', 'b', 'c', are the arguments you want to pass in task function, they can be n.
	      fallback : ['d', 'e', 'f'] //'d', 'e', 'f', are the arguments you want to pass in the fallback function, they can be n.
	   }

```
#### task1 is the service function, fallback1 is it's fallback service function

```javascript
const task1 = function(a, b, c, callback){
	if(true){ 
		/*true here if the task executed is successfull. You have to write your logic instead of this and then return the callback like this. */
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

//fallback1 is service if task1 fails, to revert changes

const fallback1 = function(a, b, c){
	console.log("Fallback one called"); //Fallback logic here
}

```

#### While writing the tasks last argument must be a callback with err as first argument and message or data as second argument as per Node.JS convention, in fallback functions I have not implemented callback because it's not needed.

##### Here we can give a transaction in form of pipelines. All will run one after another :)

##### Here in the above figure the transaction has tasks and their specific fallbacks.

### It's all maintained by a central system. If all goes "yes" the whole transaction is successfull. If anyone of the inbetween task or pipeline fails all the previous fallbacks are called and data get's reverted as if nothing happened. 