const { promisify } = require("util");

var task1 = function(a, b, c, callback){
	if(true){
		return callback(null, "Task one executed successfully.");
	}else{
		return callback(new Error("Task one could not be executed successfully."), null);
	}
}

var task2 = function(a, b, c, callback){
	if(true){
		return callback(null, "Task two executed successfully.");
	}else{
		return callback(new Error("Task two could not be executed successfully."), null);
	}
}

var task3 = function(a, b, c, callback){
	if(false){
		return callback(null, "Task three executed successfully.");
	}else{
		return callback(new Error("Task three could not be executed successfully."), null);
	}
}

var fallback1 = function(a, b, c, callback){
	console.log("Fallback one called");
}

var fallback2 = function(a, b, c, callback){
	console.log("Fallback two called");
}

var fallback3 = function(a, b, c, callback){
	console.log("Fallback three called");
}

module.exports = {
	
	StartTransaction   : function(taskQueue, startCallback){
		var queueArray = taskQueue;
		this.SetTransactionQueue(taskQueue, startCallback);
	},
	ExecuteTask         : function(taskQueue, currentIndex, executeCallback){

	    var taskPromise = promisify(taskQueue[currentIndex].task);

	    taskPromise = taskPromise.bind(null, ...taskQueue[currentIndex].args.task);

	    taskPromise().then(function(str){
		    executeCallback(null, str);
		}).catch(function(err){

			console.log("Err is ", err);

		    executeCallback(new Error("Failed at index ", currentIndex), null);
		})
	},
	CheckQueueStack     : function(queueStates, checkQueueCallback){

		var failed = false;

		for(var key in queueStates){
				if(queueStates[key].ran != "yes" || queueStates[key].executed != "yes"){
					failed = true;
					break;
				}
		}

		if(failed){
			checkQueueCallback(new Error("Failed to execute all transaction"), null);
		}else{
			checkQueueCallback(null, "All executed successfully");
		}

	},
	LoopQueue           : function(taskQueue, queueStates, currentIndex, startCallback){

		var that = this;

	    if(currentIndex < taskQueue.length){
	    	that.ExecuteTask(taskQueue, currentIndex, function(err, done){
	    		if(done){

	    			for(var key in queueStates){
	    				if(key == "task"+currentIndex){
	    					queueStates[key].ran = "yes";
	    					queueStates[key].executed = "yes";
	    				}
	    			}

					currentIndex++;
			    	that.LoopQueue(taskQueue, queueStates, currentIndex, startCallback);
	    		}else{

	    			for(var key in queueStates){
	    				if(key == "task"+currentIndex){
	    					queueStates[key].ran = "yes";
	    					queueStates[key].executed = "failed";
	    				}
	    			}

	    			that.RunFallbacks(taskQueue, queueStates, function(err, done){
			   			if(err){

			   			}else{
					    	startCallback(null, done);
			   			}
			   		});

	    		}
	    	})
	    }else{
	   		that.CheckQueueStack(queueStates, function(err, done){
	   			if(err){
			    	startCallback(err, null);
	   			}else{
			    	startCallback(null, done);
	   			}
	   		});
	    }

	},
	ExecuteTransaction  : function(queueStates, taskQueue, startCallback){

		var queueLength      = taskQueue.length,
	    	currentIndex 	 = 0;
	    	this.LoopQueue(taskQueue, queueStates, currentIndex, startCallback, function(err, done){
	    		console.log(done);
	    	})
	},
	SetTransactionQueue : function(taskQueue, startCallback){
		
		var queueStates = new Object();

		for(var i = 0; i < taskQueue.length; i++){
			queueStates["task"+i] = {
				"ran"      : "no", //will check if the task is executed or not
				"executed" : "no"  //there will be two other states yes and failed
			}
		}

		this.ExecuteTransaction(queueStates, taskQueue, startCallback);

	},
	RunFallbacks        : function(taskQueue, queueStates, runFallbackCallback){

		var fallbackIndexes = []; 

		for(key in queueStates){
			if(queueStates[key].ran == 'yes' && queueStates[key].executed == 'yes'){
				fallbackIndexes.push(parseInt(key.substr(4)));
			}
		}

		for(var i = 0; i < fallbackIndexes.length; i++){
			taskQueue[fallbackIndexes[i]].fallback.apply(null, taskQueue[fallbackIndexes[i]].args.fallback);
		}

		runFallbackCallback(null, "Fallbacks ran successfully");

	} 

}

module.exports.StartTransaction([
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