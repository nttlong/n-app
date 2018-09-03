var watcher_cache={};
var filewatcher = require('filewatcher');
var watcher = filewatcher();
var qs=require("querystring");
var controllerCache={};

watcher.on('change', function(file, stat) {
    try {
        delete require.cache[file];  
        console.log('File modified: %s', file);
        if(!controllerCache[file]){
            controllerCache[file]={};
        }
        controllerCache[file].mdl=require(file);
        controllerCache[file].reload=true;
        // watcher_cache[file]()
        // cache[file].run=fx;
    } catch (error) {
        console.log(error);
    }
  });
function getValueByPath(path,data){
    if(!binder_cache[path]){
        binder_cache[path]=Function("data"," return data."+path);
    }
    try {
        return binder_cache[path](data);
    } catch (error) {
        return undefined;
    }
};
var binder_set_value={};
/**
 * Set value for one property by path to property of object;
 * @param {Path point to property in data} path 
 * @param {*} data 
 * @param {*} val 
 */
function setValueByPath(path,data,val){
    if(!binder_set_value[path]){
        var items=path.split('.');
        var txtFunc="";
        var txtEle="data";
        for(var i=0;i<items.length-1;i++){
            txtEle=txtEle+"."+items[i];
            txtFunc+="if(!"+txtEle+") "+txtEle+"={};\r\n";
        }
        txtEle+="."+items[items.length-1]
        txtFunc+=txtEle+"=val;\r\n;return data;\r\n";
        binder_set_value[path]=Function("data,val",txtFunc);
    }
    return binder_set_value[path](data,val);


}
module.exports=function(filename,handler){
    
    if(!watcher_cache[filename]){
        watcher.add(filename);
        watcher_cache[filename]=filename
    }
    if(!controllerCache[filename]){
        controllerCache[filename]={};
    }
    if(!controllerCache[filename].handler){
        controllerCache[filename].handler=handler;
    }
    
    return function(req,res,next,inherit){
        function extHandler(_handler){
            _handler.req=req;
            _handler.res=res;
            _handler.next=next;
            _handler.model={};
            _handler.escapeUrl=function(url){
                return req.escapeUrl(url);
            }
            _handler.unescapeUrl=function(url){
                return req.unescapeUrl(url);
            }
            _handler.redirect=function(url){
                return res.redirect(url);
            }
            _handler.setValue=function(path,data){
                if(data===undefined){
                    _handler.model=path;
                }
                else {
                    _handler.model=setValueByPath(path,_handler.model,data);
                }
            }
            _handler.getValue=function(path){
                if(path==undefined){
                    return _handler.model;
                }
                else {
                    return getValueByPath(path,_handler.data);
                }
            }
            return _handler;
        }
        if(!controllerCache[filename]){
            controllerCache[filename]={};
            
        }
        if(controllerCache[filename].reload){
            controllerCache[filename].reload=false;
            controllerCache[filename].ignoreHandler=true;
            controllerCache[filename]=undefined;
            if(!controllerCache[filename]){
                controllerCache[filename]={
                    ignoreHandler:true,
                    mdl:require(filename)
                };
            }
            controllerCache[filename].mdl(filename,handler);
            
        }
        else {
            if(!controllerCache[filename].handler){
                controllerCache[filename].handler=handler;
            }
            
        }
        if(controllerCache[filename].ignoreHandler) {
            controllerCache[filename].ignoreHandler=false;
            return;
        }
        var _handler=extHandler({});
        var retHandler=controllerCache[filename].handler(_handler);
        if(!retHandler){
            require("../q-exception").next(new Error("Controller must retunr an object"),filename);
        }
        Object.keys(retHandler).forEach(function(key){
            _handler[key]=retHandler[key];
        });

        if(inherit){
            return _handler;
        }
        if(!_handler.base){
            // _handler.model={};
            // _handler=extHandler(_handler);
        }
        else {
            var fx=_handler.base(req,res,next,true);
            Object.keys(_handler).forEach(function(key){
                fx[key]=_handler[key];
            });
            _handler=fx;
            _handler=extHandler(_handler);
        }
        if(_handler.load){
            _handler.load(_handler,function(error){
                if(error){
                    throw(error);
                }
                if(req.method==="POST"){
                    if(!req.get("AJAX-POST")){ 
                        if (req.files){
                            
                        }
                        _handler.postData=qs.parse(req.body);
                        if(_handler.post){
                            
                            _handler.post(_handler,function(ex){
                                if(ex){
                                    throw(ex);
                                }
                                req.render(_handler.model);
                            })
                        }
                        else {
                            req.render(_handler.model);
                        }
                    }
                    else {
                        if((!_handler.ajax)||(!_handler.ajax[req.get("AJAX-POST")])){
                            require("../q-exception").next(new Error("post with ajax fails at '"+ req.get("AJAX-POST")+"'"),__filename)
                        }
                        else {
                            _handler.postData=require("../q-json").fromJSON(req.body);
                            _handler.ajax[req.get("AJAX-POST")](_handler,function(ex){
                                if(ex){
                                    require("../q-exception").next(new Error("post with ajax fails at '"+ req.get("AJAX-POST")+"'"),__filename)
                                }
                                else{
                                    res.end(require("../q-json").toJSON(_handler.model))
                                }
                            }); 
                        }
                    }
                    
                }
                else {
                    if(_handler.get){
                        _handler.get(_handler,function(ex){
                            if(ex){
                                throw(ex);
                            }
                            req.render(_handler.model);

                        });
                    }
                    else {
                        req.render(_handler.model);
                    }
                }
            });
        }
        else {
            if(req.method==="POST"){
                if(!req.get("AJAX-POST")){ 
                    if(_handler.post){
                        _handler.post(_handler,function(ex){
                            if(ex){
                                throw(ex);
                            }
                            req.render(_handler.model);
                        })
                    }
                    else {
                        req.render(_handler.model);
                    }
                }
                else {
                    if((!_handler.ajax)||(!_handler.ajax[req.get("AJAX-POST")])){
                        require("../q-exception").next(new Error("post with ajax fails at '"+ req.get("AJAX-POST")+"'"),__filename)
                    }
                    else {
                        _handler.postData=require("../q-json").fromJSON(req.body);
                        _handler.ajax[req.get("AJAX-POST")](_handler,function(ex){
                            if(ex){
                                require("../q-exception").next(new Error("post with ajax fails at '"+ req.get("AJAX-POST")+"'"),__filename)
                            }
                            else{
                                res.end(require("../q-json").toJSON(_handler.model))
                            }
                        }); 
                    }
                }
            }
            else {
                if(_handler.get){
                    _handler.get(_handler,function(ex){
                        if(ex){
                            throw(ex);
                        }
                        req.render(_handler.model);

                    });
                }
                else {
                    req.render(_handler.model);
                }
            }   

        }
    }
    
}
