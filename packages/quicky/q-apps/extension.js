var URL = require("url");
// var ejs=require("ejs");
// var pejs=require('pejs');
var ECT = require('ect');
var path=require("path");
var sync=require("../q-sync");
var HTTP = require("http");
var LANGUAGE=require("../q-language");
var logger=require("../q-logger")(__filename);
var api=require("../q-api");
var tenancy=require("./tenancy");
var caching={};
var cacheMode=true;
var compressMode=true;
var fs=require("fs");
/**
 * Set cache mode for template render
 * @param {Default value is true} value 
 */
function setCacheMode(value){
    cacheMode=value
}
/**
 * Set commpress mode for render
 * @param {true or false} value 
 */
function setCompressMode(value){
    compressMode=value
}
var handler_cache={};
function execHandlerByPath(app,pathToHandler,req,res,next){
    
    var xPath=path.join( global._rootDir,app.dir,pathToHandler);
    if(!handler_cache[xPath]){
        handler_cache[xPath]=require(xPath);
        fs.watchFile(xPath,function(e,r){
            delete require.cache[xPath];
            handler_cache[xPath]=require(xPath);
            console.log("reload file '"+xPath+"'");
        });
    }
    handler_cache[xPath](req,res,next);
    console.log(xPath);
}
function urls(router){
    function ret(router){
        var me=this;
        me.router=router;
        me._templateDir="";
        me.app;
        me._handlers_cache={};
        /**
         * set Path to controller
         * @param {rel path to controller} controllerPath 
         */
        me.setControllerPath=function(controllerPath){
            me._controllerPath=controllerPath;
            return me;
        }
        /**
         * set working dir of this application
         * @param {} tmpPath 
         */
        me.setDir=function(tmpPath){
            me._workingDir=tmpPath;
            return me;
        }
        /**
         * set template Dir (rel path from project dir)
         * @param {*} relPathFromRootProjectDir 
         */
        me.setTemplateDir=function(relPathFromRootProjectDir){
            me._templateDir=relPathFromRootProjectDir;
            return me;
        }
        me.url=function(fileName,urlPartern,handler,authHandler){
            if(!urlPartern || typeof urlPartern=="function"){
                throw("It look like you forgot set 'urllPartern' param \r\nExample: \r\n apps.url(filename here, url here, view handler here)");
            }
            function hanlderCls(handler){
                
                var owner=this;
                owner._handler=handler;
                owner.fileName=fileName;
                owner.handler=function(req,res,next){
                    
                    
                    req.templateFileName=path.join(me._templateDir,"templates", owner.fileName);
                    req.currentHandler=me;
                    require("./extension-request").applyRequest(req,res,me,owner);
                    if(req.application._mdl.authenticate){
                        try {
                            req.application._mdl.authenticate(req,res,function(){
                                if(typeof owner._handler==="string"){
                                    execHandlerByPath(me.app,owner._handler,req,res,next);
                                }
                                else {
                                    owner._handler(req,res,next);  
                                }
                                
                            });    
                        } catch (error) {
                            logger.debug(error);
                            throw(error);

                        }
                        
                    }
                    else {
                        if(typeof owner._handler==="string"){
                            execHandlerByPath(me.app,owner._handler,req,res,next);
                        }
                        else {
                            owner._handler(req,res,next)
                        }
                        
                    }
                    
                }    
            }
            var instance=new hanlderCls(handler);
            if(authHandler){
                function _authHandler(req,res,next){
                    require("./extension-request").applyRequest(req,res,me,{fileName:fileName});
                    authHandler(req,res,function(){
                        instance.handler(req,res,next);
                    });
                }
                me.router.all(urlPartern,_authHandler);
                
            }
            else {
                me.router.all(urlPartern,instance.handler);
            }
            
            
            return me;
        }
    }
    return new ret(router);
}
module.exports= {
    urls:urls,
    setCacheMode:setCacheMode,
    setCompressMode:setCompressMode,
    getAppByDir:require("./extension-request").getAppByDir
}