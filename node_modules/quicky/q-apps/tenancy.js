var _defaultSchema=undefined;
var _defaultTenancy=undefined;
var _coll=undefined;
var _cache={}
var _cacheRevert={}
var lock=require("locks")

var sync=require("../q-sync");
const MongoClient = require('mongodb').MongoClient;

/**
 * Set database where store tenancy schema and code
 * @param {url where mongodb host} url 
 * @param {* collection name of schema and tenancy code} collection 
 */
function setTenancyConfig(url,collection){
    if(!_coll){
        var dbName=url.split('/')[url.split('/').length-1];
        var cnn=sync.sync(MongoClient.connect,[url]);
        var DB= cnn.db(dbName);
        _coll=DB.collection(collection);
        
    }
    return _coll;
}
/**
 * get schema from tenancy code
 * @param {*Tenancy code} tenancyCode 
 */
function getSchema(tenancyCode){
    if(_defaultTenancy===undefined) return "";
    tenancyCode=tenancyCode.toLowerCase();
    if(!_coll){
        throw(new Error("\r\n It look like you forgot call setTenancyConfig:\r\r"+
                   "\t\t How to use 'setTenancyConfig' in q-app:\r\n"+
                     "\t\t setTenancyConfig(mongodb url,\r\n"+
                    "\t\t\t\t  collection name, \r\n "));
    }
    
    if(_cache[tenancyCode]){
        return _cache[tenancyCode]
    }
    var ret=undefined;
    var mutex=lock.createMutex();
    mutex.lock(function(){
        function run(cb){
            _coll.findOne({
                code:{$regex:new RegExp("^"+tenancyCode+"$","i")}
            },function(error,item){
                if(error){
                    cb(error)
                }
                else {
                    if(!item){
                        if(tenancyCode===getDefaultTenancy().toLowerCase()){
                            _coll.insertOne({
                                code:getDefaultSchema(),
                                schema:getDefaultSchema()
                            },function(err,result){
                                if(err){
                                    cb(err);
                                }
                                else {
                                    _cache[tenancyCode]=getDefaultSchema();
                                    _cacheRevert[getDefaultSchema().toLowerCase()]=tenancyCode;
                                    cb(null,_cache[tenancyCode]);
                                }
                            })    
                        }
                        else {
                            cb( new Error("'"+tenancyCode+"' was not found"));
                        }
                    }
                    else {
                        _cache[item.code.toLowerCase()]=getDefaultSchema();
                        _cacheRevert[item.schema.toLowerCase()]=tenancyCode;
                        cb( null,item.schema);
                    }
                }
            });

        }
        ret=sync.sync(run,[]);
    });
    return ret;

}
/**
 * Set default schema it was call at start server
 * @param {default schema if use multi tenancy} schema 
 */
function setDefaultSchema(schema){
    _defaultSchema=schema;
}
/**
 * Set default tenancy code
 * @param {Defaul tenancy code} value 
 */
function setDefaultTenancy(value){
    _defaultTenancy=value
}
function getDefaultSchema(){
    return _defaultSchema
}
function getDefaultTenancy(){
    return _defaultTenancy
}
function isUseMultitenancy(){
    return _defaultSchema!==undefined
}
function reWriteRoute(callback){
    var me=this;
    me.callback=callback;
    me.route=function(req,res,next){
        req.tenancyCode=req.params.tenancy;
        delete req.params.tenancy;
        req.tenancySchema=getSchema(req.tenancyCode)
        
        me.callback(req,res,next);
    }
}
function mRoute(callback){
    var ret=new reWriteRoute(callback);
    return ret.route;
}
module.exports={
    setDefaultSchema:setDefaultSchema,
    setDefaultTenancy:setDefaultTenancy,
    getDefaultSchema:getDefaultSchema,
    getDefaultTenancy:getDefaultTenancy,
    isUseMultitenancy:isUseMultitenancy,
    mRoute:mRoute,
    setTenancyConfig:setTenancyConfig,
    getSchema:getSchema
}