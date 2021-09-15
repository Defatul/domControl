const domControl = {

    record: [],
    index: function(key) {
        return this.record[this.record.findIndex(x => x.key == key)];
    },
    remove: function(key, notFoundAction, action = true) {
        let record = this.index(key);
        if (record) {
            record.remove = (action ? action : true);
        } else {
            if (notFoundAction) notFoundAction.call(this, key);
        }
    },
    destroy: function(action) {
        this.record.forEach(function(record) {
            if (!('destroy' in record)) {
                record.destroy = (('destroyAction' in record) ? record.destroyAction : (action ? action : true));
            }
        });
    },
    add: function(status, successful, unsuccessful = false, key = false, time = 200) {

        let statusType = (typeof status == 'object' ? 'object' : (typeof status == 'function' ? 'function' : false));

        if (!statusType) {
            console.log('domControl Failed.');
            return;
        }

        if (statusType == 'object' && !('status' in status)) {
            console.log('There are no status.');
            return;
        }

        key = (key ? key : (Math.random() + 1).toString(36).substring(7));

        let ths = this;
        let repeat;
        let successfulStatus = (typeof successful == 'object' ? 'object' : (typeof successful == 'function' ? 'function' : false));
        let timeoutStatus = (statusType == 'object' ? (('timeout' in status) ? ((typeof status.timeout == 'object') ? (('time' in status.timeout) ? true : false) : false) : false) : false);
        let timeoutIndex;

        ths.record.push({ key: key });

        let index = ths.index(key);

        if((statusType == 'object') && ('before' in status)) status.before.call(this, key, index);
        if (timeoutStatus && ('action' in status.timeout)) index.timeout = status.timeout.action;
        if ((statusType == 'object') && ('destroy' in status)) index.destroyAction = status.destroy;

        let deleteRecord = function(){
            if (timeoutStatus) clearTimeout(timeoutIndex);
            delete ths.record[ths.record.findIndex(x => x.key == key)];
            ths.record = ths.record.filter(() => true);
        }

        let removeAction = function(type, action){
            let self = ths.index(key);
            if (self) {
                if(type == 'remove'){
                    if (typeof action == 'function') {
                        action.call(this, key, index, destroy);
                    } else if (typeof action == 'string') {
                        if ((successfulStatus == 'object') && Object.keys(successful).length > 0) {
                            for (const [forKey, forValue] of Object.entries(successful)) {
                                if (forKey == action) forValue.call(this, forKey, key, index, destroy);
                            }
                        }
                    }
                }else if(type == 'destroy'){
                    if(typeof action == 'function') action.call(this, key, index);
                }else if(type == 'timeout'){
                    if (('timeout' in self) && typeof self.timeout == 'function') self.timeout.call(this, key, index, destroy);
                }
                deleteRecord();
            }
        }

        let remove = function(action){
            index.remove = action;
        }

        let destroy = function(action) {
            ths.record.forEach(function(record) {
                if ((record.key != key) && !('destroy' in record)) {
                    record.destroy = (('destroyAction' in record) ? record.destroyAction : (action ? action : true));
                }
            });
        }

        let reply = function() {
            if (typeof status == 'function') {
                return status.call(this, key, index, remove, destroy);
            } else if ((typeof status == 'object') && ('status' in status)) {
                return status.status.call(this, key, index, remove, destroy);
            }
        }

        let run = function() {
            let statusOut = reply();
            if (statusOut) {
                clearTimeout(repeat);
                if(successfulStatus == 'object'){
                    if (Object.keys(successful).length > 0) {
                        for (const [forKey, forValue] of Object.entries(successful)) {
                            if (forKey == statusOut) forValue.call(this, forKey, key, index, destroy);
                        }
                    }
                }else if(successfulStatus == 'function'){
                    successful.call(this, key, index, destroy);
                }
                deleteRecord();
            } else {

                let stopStatus = ( ('remove' in index) ? 'remove' : ('destroy' in index) ? 'destroy' : false );
                if(stopStatus) clearTimeout(timeoutIndex), clearTimeout(repeat);
                if(stopStatus == 'remove') removeAction('remove', index.remove);
                if(stopStatus == 'destroy') removeAction('destroy', index.destroy);
                if(stopStatus) return;

                repeat = setTimeout(run, time);
                if (typeof unsuccessful == 'function') unsuccessful.call(this, key);
            }

        };

        repeat = setTimeout(run, time);

        if (timeoutStatus) {
            timeoutIndex = setTimeout(function() {
                clearTimeout(repeat);
                removeAction('timeout');
            }, status.timeout.time);
        }

        return key;

    }

};