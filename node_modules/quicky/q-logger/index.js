var cache={}
const log4js = require('log4js');
log4js.configure({
  appenders: { 
    error: { type: 'dateFile', 
             filename: 'logs/error.log',
             pattern: "-yyyy-MM-dd.log", 
             alwaysIncludePattern: true, 
             keepFileExt: true ,
             maxLogSize: 20480,
             level: "ERROR"} ,
    info: { type: 'dateFile', 
            filename: 'logs/info.log',
            pattern: "-yyyy-MM-dd.log", 
            alwaysIncludePattern: true, 
            keepFileExt: true,
            maxLogSize: 20480,
            level: "INFO" } ,
    debug: { type: 'dateFile', 
              filename: 'logs/debug.log',
              pattern: "-yyyy-MM-dd.log", 
              alwaysIncludePattern: true, 
              keepFileExt: true,
              maxLogSize: 20480,
              level: "DEBUG"  } ,
      },
  categories: { 
    default: { 
      appenders: ['error'], level: 'error' 
    },
    error:{
      appenders: ['error'], level: 'error' 
    },
    info:{
      appenders: ['info'], level: 'info' 
    },
    debug:{
      appenders: ['debug'], level: 'debug' 
    }
 }
});
var logError=log4js.getLogger().error;
var logDebug=log4js.getLogger('debug').debug;
var logInfo=log4js.getLogger('info').info;

function logger(name){
  if(cache[name]) return cache[name];
  function ret(name){
    var me=this;
    me.name=name;
    me.error=function(data){
      log4js.getLogger('error').error(me.name,data);
    }
    me.debug=function(data){
      log4js.getLogger('debug').debug(me.name,data);
    }
    me.info=function(data){
      log4js.getLogger('info').info(me.name,data);
    }
  }
  cache[name]=new ret(name);
  return cache[name];
}
module.exports=logger