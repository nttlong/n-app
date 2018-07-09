//var model=require("./../model-define");
var model=require("../q-model-define")
var sync=require("../q-sync");
var cache={}
var logger=require("../q-logger");
var filewatcher = require('filewatcher');
var watcher = filewatcher();
var watcher_cache={}
var cache={}
watcher.on('change', function(file, stat) {
    try {
        delete require.cache[file];  
        console.log('File modified: %s', file);
        var fx=require(file);
        // cache[file].run=fx;
    } catch (error) {
        
    }
   
  });

function define_func(paramsDeclare,callback,filePath){
    if(!filePath){
        require("../q-exception").next(new Error("filePath is missing"),__filename);
    }
    if(!watcher_cache[filePath]){
        watcher.add(filePath);
        watcher_cache[filePath]=filePath
    }
    
    return function(args,cb){
        var _filePath=filePath
        var _callback=callback;
        var _model=model().fields(paramsDeclare);
        try {
            if(!args){
                var msg="\r\n Please set params:\r\n";
                _model.getFieldsAsArray().forEach(function(ele) {
                    msg+="\t\t\t\t"+Object.keys(ele)[0]+":"+ele[Object.keys(ele)[0]].$type+","+((ele[Object.keys(ele)[0]].$require)?
                    "The params is require":"The param is optional")+"\r\n";
                });
               throw (new Error( "\r\n"+  msg));
            }
            var error=_model.validate(args);
            if(error){
                if(!cb){
                    if(error.missingItems.length>0){
                        var msg="\r\n Please set value for below arguments:\r\n";
                            error.missingItems.forEach(function(ele) {
                                msg+="\t\t\t\t"+ele;
                            });
                        return {
                            
                            error:{
                                name:"ArgumentNullException",
                                messsage:msg,
                                code:"ArgumentNullException",
                                arguments:error.missingItems

                            }
                        }
                    }
                    if(error.invalidDataType.length>0){
                        var msg="\r\n The below arguments are invalid data type:\r\n";
                            error.invalidDataType.forEach(function(ele) {
                                msg+="\t\t\t\t"+ele;
                            });
                        return {
                            
                            error:{
                                name:"InvalidArgumentDataTypeException",
                                messsage:msg,
                                code:"InvalidArgumentDataTypeException",
                                arguments:error.missingItems

                            }
                        }
                    }
                }
                else {
                    cb(error);
                }
                return;
            }
            if(!cb){
                function run(args,cb){
                    _callback(args,function(err,res){
                        if(err){
                            cb(null,{
                                error:err
                            });
                        }
                        else {
                            cb(null,{
                                result:res
                            });
                        }
                    });
                }
                return require("../q-sync").sync(run,[args]);
            }
            else {
                _callback(args,function(err,res){
                    if(err){
                        cb(null,{
                            error:err
                        });
                    }
                    else {
                        cb(null,{
                            result:res
                        });
                    }
                });
            }
            
        } catch (error) {
            throw(error);
            // require("../q-exception").next(error,_filePath)
        }
    }
}
module.exports=define_func