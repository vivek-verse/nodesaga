const { promisify } = require("util");

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
		    executeCallback(new Error("Failed at task ", currentIndex), null);
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
			checkQueueCallback(new Error("Failed to execute all transactions"), null);
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
			   				startCallback(err, null);
			   			}else{
					    	startCallback(done, null);
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

		runFallbackCallback(null, "Could not complete full transaction ran "+fallbackIndexes.length+" fallbacks.");

	} 

}