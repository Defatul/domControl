domControl.add(
    function(key, index, remove, destroy) {
        return [...document.querySelectorAll('table.table-striped tbody tr:not(.message)')] > 0 ? 'Complete' : false;
    }, {
        Complete: function() {
            console.log('Complete...');
        }
    },
    function() {
        console.log('Waiting..');
    }
);

domControl.add({
        status: function(key, index, remove, destroy) {
            return document.querySelector('input#name') ? 'Complete' : false;
        },
        timeout: {
            time: (1000 * 60),
            action: function(key, index, destroy) {

                let thisKey = key;

                console.log('I timed out.');

                destroy(function(key) {
                    console.log(key + ' Stopped => ' + thisKey);
                });

            }
        },
        destroy: function() {
            console.log('I am destroyed');
        }
    }, {
        Complete: function(forKey, key, index, destroy) {
            console.log('Complete...');
        }
    },
    function() {
        console.log('Waiting..');
    },
    'inputShow'
);

let SetGet = domControl.add(
    {
        timeout: {
            time: (1000 * 60),
            action: function(key, index, destroy) {
				console.log('I timed out.');
            }
        },
        destroy: function() {
            console.log('I am destroyed');
        }, 
        status: function(key, index, remove, destroy) {
        
        	if(document.querySelector('.set')){
        		return 'Set';
        	}else if(document.querySelector('.get')){
        		return 'Get';
        	}
        
            return false;
        }, 
        destroyAction: function(){
        	console.log('XxXxXxxxx');
        }
    }, 
    {
        Set: function(forKey, key, index, destroy) {
			console.log('Set..');            
        }, 
        Get: function(forKey, key, index, destroy) {
        	destroy();
			console.log('Get..');
        }
    },
    function() {
        console.log('Not found..');
    }, 
    fasle, 
    5
);

domControl.destroy();

domControl.remove('xxXX');
