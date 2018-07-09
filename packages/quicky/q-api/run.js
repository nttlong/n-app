
var path=require("path");
var logger=require("../q-logger")(__filename);
var MongoClient = require('mongodb').MongoClient;
var sync=require("../q-sync")
var ObjectId=require("mongodb").ObjectId()
var locks = require('locks'); 

var filewatcher = require('filewatcher');
 
var watcher = filewatcher();
var watchCache={}

function reload(item){
    try {
        var file=item.filename;
        if(require.cache[file]){
            delete  require.cache[file]
            require(file);
        }     
    } catch (error) {
        
    }
    
}
function watchItem(item,level){
    if(!level) level=0;
    if(level==2) {
        return;
    }
    try {
        var file=item.filename;
        if(!watchCache[file]){
            watchCache[file]=file;
            watcher.add(file);
            if(item.children){
                for(var i=0;i<item.children.length;i++){
                    watchItem(item.children[i],level+1);
                }
            }
        }
    } catch (error) {
        
    }
    
}
watcher.on('change', function(file, stat) {
    if(require.cache[file]){
        reload(require.cache[file])
    }
});
var _db=null
var _cache={}
var _cache_revert={}
function connect(url,collection){
    try {
        if(_db) return _db;
        var dbName=url.split('/')[url.split('/').length-1];
        var cnn=sync.sync(MongoClient.connect,[url]);
        var DB= cnn.db(dbName);
        _db=DB.collection(collection);
    return _db;    
    } catch (error) {
        var ex=new Error("\r\n connect to '"+url+"' is error\r\n"+
                error.message)
        logger.error(ex);
        throw(ex);
    }
    
}
function getKey(path){
    try {
        var apps=require("quicky/q-apps");
        if(!_cache[path]){
            if(!_db){
                throw(Error("\r\nIt look like you forgot call 'connect' of  'q-api':\r\n"+
                                "\t\tHow to call 'connect' of 'q-api'\r\n"+
                                "\t\t\tconnect(mongodb connection url, api cache collection)"))
            }
            
            var retValue=undefined;
            var mutex = locks.createMutex();
            mutex.lock(function(){
                function run(cb){
                    var item=_db.findOne({
                        api_path:{
                            $regex:new RegExp("^"+path+"$","i")
                        }
                    },function(err,item){
                        if(err){
                            cb(err);
                            return
                        }
                        if(!item){
                            _db.insertOne({
                                api_path:path
                            },function(err,result){
                                if(err){
                                    cb(err);
                                    return;
                                }
                                var id=JSON.stringify(result.insertedId).substring(1,JSON.stringify(result.insertedId).length-1);
                                _cache[path]=id
                                _cache_revert[id]=path;
                                cb(null,_cache[path]);
                            })
                        }
                        else {
                            var id=JSON.stringify(item._id).substring(1,JSON.stringify(item._id).length-1);
                            _cache[path]=id
                            _cache_revert[id]=path;
                            cb(null,_cache[path]);
                        }
                    })
                }
                retValue= sync.sync(run,[]);
            });
            return retValue;
        }
        else {
            return _cache[path];
        }
    } catch (error) {
        logger.error(error);
        throw(error);
    }
    
}
function getPath(id){
    try {
        
        if(_cache_revert[id]) return _cache_revert[id];
        else {
            if(!_db){
                throw(Error("\r\nIt look like you forgot call 'connect' of  'q-api':\r\n"+
                                "\t\tHow to call 'connect' of 'q-api'\r\n"+
                                "\t\t\tconnect(mongodb connection url, api cache collection)"))
            }
            var retValue=undefined;
            mutex.lock(function(){
                function run(){
                _db.findOne({
                    _id:ObjectId(id)
                },function(err,item){
                    if(err){
                        cb(err);
                        return;
                    }
                    if(!item){
                        cb(new Error("Api with id'"+id+"' was not found"));
                        return;
                    }
                    else {
                        _cache_revert[id]=item.api_path;
                        _cache[item.api_path]=id;
                        cb(null,_cache_revert[id])
                    }

                });
                }
                retValue=sync.sync(run,[]);
                return retValue;

            })
        }

    } catch (error) {
        logger.error(error);
        throw(error);
    }
    
}
var fn=require("../q-func-define")(
    {
        data:["object"],
        offset_minutes:["number",true],
        path:["text",true],
        view:["text",true],
        username:["text",true],
        language:["text",true],
        appName:["text",true],
        sessionId:["text",true],
        isAnonymous:["bool",true]

    },function(args,cb){
        try {
            
            var apps=require("../q-apps");
            var app=apps.getAppByName(args.appName);
            _logger=require("../q-logger")(app.fullHostDir+path.sep+args.path+".js");
            var _api_path=getPath(args.path);
            var fileName=app.fullHostDir+path.sep+_api_path.split('@')[1]+".js";
            
            var mdl=require(fileName);
            watchItem(require.cache[fileName]);
            try {
                mdl(args,function(error,result){
                    if(error){
                        _logger.error(error);
                        cb(error);
                    }
                    else {
                        cb(null,result);
                    }
                    
                });    
            } catch (error) {
                _logger.error(error);
                if((error.type &&(error.type==="missing_require_data"))||
                    (error.code)){
                    var retError={
                        code:error.code|| "missing",
                        fields:[]
                        
                    }
                    error.fields.forEach(element => {
                        if(element.substring(0,5)==="data."){
                            retError.fields.push(element.substring("data.".length,element.length));
                        }
                        else {
                            retError.fields.push(element);
                        }
                    });
                    cb(null,{error:retError});
                }
                else {
                    cb(error);
                }
            }
            
            
        } catch (error) {
            throw(error);
        }
    }, __filename
)

module.exports={
    run:fn,
    getKey:getKey,
    getPath:getPath,
    connect:connect
}