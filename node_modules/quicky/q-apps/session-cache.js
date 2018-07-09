
var sync=require("../q-sync");
var json=require("../q-json");
var memcached =null;
var isUseMemCache=false;
var local_cache={};
/**
 * set server for memcache session
 * call setServer([{server:IP of server 1, port: port of server 1},..{server:IP of server n, port: port of server n}])
 * 
 * @param {list of server example: [{server:IP of server 1, port: port of server 1},..{server:IP of server n, port: port of server n}]} servers 
 */
function sessionCacheSetServers(servers){
    var Memcached = require('memcached');
    var config={};
    var index=1;
    servers.forEach(element => {
        config[element.server+":"+element.port]=index;
        index++;
    });
    memcached= new Memcached(config);
}
var timeOutValue=0;
function setTimeoutValue(value){
    timeOutValue=value;
}
/**
 * get session info in memcache by session id
 * @param {string} key 
 * @param {Callback function} callback 
 */
function sessionCacheGet(key,callback){
    if(!isUseMemCache){
        if(memcached===null){
            var error=new Error("\r\n\t\t It look like you forgot call 'sessionCacheSetServers' in 'q-app'\r\n"+
            "\t\t call 'sesssionCacheSetServers' with params such as :[{server: IP of server1, port: port of memcache},..{server:..,port:..}]"
             );
            require("../q-exception").next(error,__filename);
            
        }  
    }
    return sync.exec(function(cb){
        if(isUseMemCache){
            memcached.get(key,function(ex,r){
                cb(ex,r);
    
            });
        }
        else {
            cb(null,local_cache[key]);
        }
    },callback,__filename);
}
/**
 * set session cacche
 * @param {key} key 
 * @param {*} data 
 */
function sessionCacheSet(key,data,callback){
    if(!isUseMemCache){
        if(memcached===null){
            var error=new Error("\r\n\t\t It look like you forgot call 'sessionCacheSetServers' in 'q-app'\r\n"+
            "\t\t call 'sesssionCacheSetServers' with params such as :[{server: IP of server1, port: port of memcache},..{server:..,port:..}]"
             );
            require("../q-exception").next(error,__filename);
            
        }  
    }
    return sync.exec(function(cb){
        if(!isUseMemCache){
            memcached.set(key,json.toJSON(data)||null,timeOutValue,function(ex,r){
                cb(ex,json.fromJSON(r));
            });
        }
        else {
            cb(null,local_cache[key]);
        }
    },__filename);
}
/**
 * if allow use memcache server for each session, call this method with true param
 * @param {*} value 
 */
function setIsUseMemCache(value){
    isUseMemCache=value;
}
function getIsUseMemCache(){
    return isUseMemCache;
}
/**
 * Turn use memcache true or
 * @param {True or false} value 
 */
function setEnableUseMemcache(value){

}

module.exports={
    sessionCacheSetServers:sessionCacheSetServers,
    sessionCacheGet:sessionCacheGet,
    sessionCacheSet:sessionCacheSet,
    setIsUseMemCache:setIsUseMemCache,
    getIsUseMemCache:getIsUseMemCache
}