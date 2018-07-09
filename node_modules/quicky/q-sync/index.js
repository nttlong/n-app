var DEASYNC = require("deasync");
function sync(fn, args, cb) {
    function reject(e) {
        result = {
            error: e
        };
    }
    ;
    function resolve(r) {
        result = {
            result: r
        };
    }
    if (args instanceof Array) {
        var result = undefined;
        var _cb = function (e, r) {
            if (e) {
                result = {
                    error: e
                };
            }
            else {
                result = {
                    result: r
                };
            }
        };
        args.push(_cb);
        fn.apply(fn, args);
        DEASYNC.loopWhile(function () {
            return result === undefined;
        });
        if (result.error) {
            throw (new Error(result.error));
        }
        else {
            return result.result;
        }
    }
    else {
        var result = undefined;
        fn({
            resolve: resolve,
            reject: reject,
        });
        DEASYNC.loopWhile(function () {
            return result === undefined;
        });
        if (result.error) {
            throw (result.error);
        }
        else {
            return result.result;
        }
    }
};
var _callers={}
/**
 * 
 * @param {Function} fn 
 * @param {Function} callback 
 * @param {string} fileName 
 */
function exec(fn,callback,fileName,noneException){
    if(fileName){
        function run(cb){
            var xFileName=fileName;

            try {
                fn(function(err,result){
                    if(err){
                        if(noneException){
                            cb(null,{
                                error:err
                            });
                        }
                        else {
                            cb(err);
                        }
                        
                    }
                    else {
                        if(noneException){
                            if(Object.keys(result).length>2){
                                require("../q-exception").next(new Error("The callback function:\r\n"+fn.toString()+"\r\n must return an object with result and error"),__filename);
                            }
                            else {
                                if(result.result===undefined){
                                    require("../q-exception").next(new Error("The callback function:\r\n"+fn.toString()+"\r\n must return an object with result and error"),__filename);
                                }
                                else if(result.error===undefined){
                                    require("../q-exception").next(new Error("The callback function:\r\n"+fn.toString()+"\r\n must return an object with result and error"),__filename);
                                }
                                cb(null,{result:result});
                            }
                        }
                        else {
                            cb(null,result);
                        }
                    }
                });
                
            } catch (error) {
                if(noneException){

                }
                else {
                    var err=new Error("\r\n Error:'"+xFileName+"'\r\n"+
                          "error :\r\n'"+
                           error.message+"\r\n at declare :\r\n"+
                            fn.toString());
                    require("../q-exception").next(err,__filename);                            
                }
                
                
            }
           
        }
        if(callback){
            if(noneException){
                try {
                    fn(function(err,result){
                        if(err){
                            callback(null,{
                                error:err
                            });
                        }
                        else {
                            callback(null,{result:result});
                        }
                    });    
                } catch (error) {
                    callback(null,{
                        error:error
                    });
                         
                }
                
            }
            else {
                try {
                    fn(callback)    
                } catch (error) {
                    require("../q-exception").next(errors,__filename);  
                }
                
            }
            
        }
        else {
            return sync(run,[]);
        }
        
    }
    else {
        function run(cb){
        
            try {
                fn(cb);
                
            } catch (error) {
                require("../q-exception").next(new Error("\r\n"+
                "error :\r\n'"+
                 error.message+"\r\n at declare :\r\n"+
                  fn.toString()),__filename);  
            }
           
        }
        if(callback){
            if(noneException){
                try {
                    fn(function(err,result){
                        if(err){
                            callback(null,{
                                error:err
                            });
                        }
                        else {
                            callback(null,{result:result});
                        }
                    });    
                } catch (error) {
                    callback(null,{
                        error:error
                    });
                         
                }
                
            }
            else {
                try {
                    fn(callback)    
                } catch (error) {
                    require("../q-exception").next(errors,__filename);  
                }
                
            }
        }
        else {
            return sync(run,[]);
        }
    }
}
module.exports={
    sync:sync,
    exec:exec
}