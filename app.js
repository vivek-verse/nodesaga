import  { promisify } from "util";

export class Saga{
	
	StartTransaction(taskQueue, startCallback){
		const queueArray = taskQueue;

		const queueStates = new Object();

		for(var i = 0; i < taskQueue.length; i++){
			queueStates["task"+i] = {
				"ran"      : "no", //will check if the task is executed or not
				"executed" : "no"  //there will be two other states yes and failed
			}
		}

		const queueLength = taskQueue.length,
	    	currentIndex = 0;
	    this.LoopQueue(taskQueue, queueStates, currentIndex, startCallback, function(err, done){
	    		console.log(done);
	    })

	}

	ExecuteTask(taskQueue, currentIndex, executeCallback){

	    let taskPromise = promisify(taskQueue[currentIndex].task);

	    taskPromise = taskPromise.bind(null, ...taskQueue[currentIndex].args.task);

	    taskPromise().then(function(str){
		    executeCallback(null, str);
		}).catch(function(err){
		    executeCallback(new Error(err, currentIndex), null);
		})
	}

	CheckQueueStack(queueStates, checkQueueCallback){

		let failed = false;

		for(let key in queueStates){
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

	}

	LoopQueue(taskQueue, queueStates, currentIndex, startCallback){

		let _self = this;

	    if(currentIndex < taskQueue.length){
	    	_self.ExecuteTask(taskQueue, currentIndex, function(err, done){
	    		if(done){
	    			for(var key in queueStates){
	    				if(key == "task"+currentIndex){
	    					queueStates[key].ran = "yes";
	    					queueStates[key].executed = "yes";
	    				}
	    			}

					currentIndex++;
			    	_self.LoopQueue(taskQueue, queueStates, currentIndex, startCallback);
	    	 	}else{

	    			for(var key in queueStates){
	    				if(key == "task"+currentIndex){
	    					queueStates[key].ran = "yes";
	    					queueStates[key].executed = "failed";
	    				}
	    			}

	    			_self.RunFallbacks(taskQueue, queueStates, function(err, done){
			   			if(err){
			   				startCallback(err, null);
			   			}else{
					    	startCallback(done, null);
			   			}
			   		});

	    		}
	    	})
	    }else{
	   		_self.CheckQueueStack(queueStates, function(err, done){
	   			if(err){
			    	startCallback(err, null);
	   			}else{
			    	startCallback(null, done);
	   			}
	   		});
	    }

	}

	RunFallbacks(taskQueue, queueStates, runFallbackCallback){

		const fallbackIndexes = []; 

		for(const key in queueStates){
			if(queueStates[key].ran == 'yes' && queueStates[key].executed == 'yes'){
				fallbackIndexes.push(parseInt(key.substr(4)));
			}
		}

		for(let i = 0; i < fallbackIndexes.length; i++){
			taskQueue[fallbackIndexes[i]].fallback.apply(null, taskQueue[fallbackIndexes[i]].args.fallback);
		}

		runFallbackCallback(null, "Could not complete full transaction ran "+fallbackIndexes.length+" fallbacks.");

	}
}
