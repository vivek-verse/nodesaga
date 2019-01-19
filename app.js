const { promisify } = require("util");

var task1 = function(callback){
	if(true){
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

var task2 = function(callback){
	if(true){
		return callback(null, "Task two executed successfully.");
	}else{
		return callback(new Error("Task two could not be executed successfully."), null);
	}
}

var fallback1 = function(){
	console.log("Fallback one called");
}

var fallback2 = function(){
	console.log("Fallback two called");
}

module.exports = {
	
	StartTransaction   : function(taskQueue){
		console.log("StartTransaction called.");
		var queueArray = taskQueue;
		this.SetTransactionQueue(taskQueue);
	},
	LoopQueue           : function(taskQueue, queueStates, currentIndex, callback){

	    var taskPromise = promisify(taskQueue[currentIndex].task);

	    taskPromise().then(function(str){
	    	console.log(str)
	    }).catch(function(err){
	    	console.log("RunFallbacks");
	    })

	    if(currentIndex < taskQueue.length - 1){
	    	currentIndex++;
	    	this.LoopQueue(taskQueue, queueStates, currentIndex, callback);
	    }else{
	    	callback(null, "All forward");
	    }

	},
	ExecuteTransaction  : function(queueStates, taskQueue){
		console.log("ExecuteTransaction called.");
		var queueLength      = taskQueue.length,
	    	currentIndex 	 = 0;
	    	this.LoopQueue(taskQueue, queueStates, currentIndex, function(err, done){
	    		console.log(done);
	    	})

	},
	SetTransactionQueue : function(taskQueue){
		
		var queueStates = new Object();

		for(var i = 0; i < taskQueue.length; i++){
			queueStates["task"+i] = {
				"ran"      : "no", //will check if the task is executed or not
				"executed" : "no"  // // there will be two other states yes and no
			}
		}

		this.ExecuteTransaction(queueStates, taskQueue);

	},
	RunFallbacks        : function(fallbacks){
		console.log("RunFallbacks called.");
	} 

}

module.exports.StartTransaction([{task : task1, fallback : fallback1}, {task : task2, fallback : fallback2}]);