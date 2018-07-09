var locks = require('locks'); 
var sync=require("../q-sync");
const MongoClient = require('mongodb').MongoClient;
var caching={}
var coll=null;
function setConfig(url,collection){
    if(!coll){
        var dbName=url.split('/')[url.split('/').length-1];
        var cnn=sync.sync(MongoClient.connect,[url]);
        var DB= cnn.db(dbName);
        coll=DB.collection(collection);
        
    }
    return coll;
}
function getItem(language,app,view,key,value){
    if(!coll){
        throw("It look like you forgot call 'setConfig' of 'q-language' \r\n How to use q-language.setConfig? \r\n Just call \r\n"+
        ".setConfig(url db connect, language res collection here");
    }
    if(!value) value=key;
    var matchkey=("lang="+language+";app="+app+";view="+view+";key="+key).toLowerCase();
    if(caching[matchkey]) return caching[matchkey];
    else {
        var mutex = locks.createMutex();
        var resValue;
        mutex.lock(function () {
            function run(cb){
                var item=coll.findOne({
                    Language:{
                        $regex:new RegExp("^"+language+"$","i")
                    },
                    App:{
                        $regex:new RegExp("^"+app+"$","i")
                    },
                    View:{
                        $regex:new RegExp("^"+view+"$","i")
                    },
                    Key:{
                        $regex:new RegExp("^"+key+"$","i")
                    }
                },function(err,result){
                    if(err){
                        mutex.unlock();
                        cb(err);
                        return;
                    }
                    if(!result){
                        coll.insertOne({
                            Language:language,
                            App:app,
                            View:view,
                            Key:key,
                            Value:value
                        },function(err,result){
                            if(err){
                                cb(err);
                                mutex.unlock();
                                return;
                            }
                            mutex.unlock();
                            cb(null,value);
                            
                        })
                    }
                    else {
                        cb(null,result.Value);
                        mutex.unlock();
                    }
                    
                });
            }
            resValue=sync.sync(run,[]);
        });
        caching[matchkey]=resValue;
        return caching[matchkey];
    }

}
module.exports={
    setConfig:setConfig,
    getItem:getItem
}