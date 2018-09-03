var qs=require("querystring");
var model=require("../q-model-define");
var filewatcher = require('filewatcher');
var watcher = filewatcher();
watcher.on('change', function(file, stat) {
    try {
        delete require.cache[file];  
        console.log('File modified: %s', file);
        var fx=require(file);
        // cache[file].run=fx;
    } catch (error) {
        var x=error;
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
var watcher_cache={};
module.exports=function(modelDeclare,get,post,fileName){
    if(!fileName){
        require("../q-exception").next(new Error("filePath is missing"),__filename);
    }
    if(!watcher_cache[fileName]){
        watcher.add(fileName);
        watcher_cache[fileName]=fileName
    }
    return function(req,res,next){

        var _fileName=fileName;
        var _model=model().fields(modelDeclare);
        var data={}
        var sender={
            request:req,
            response:req,
            next:next,
            req:req,
            res:res,
            schema:req.tenancySchema,
            setDataModel:function(path,_data){
                if(!_data){
                    data=path;
                }
                else {
                    data=setValueByPath(path,data,_data);
                }
            },
            getDataModel:function(path){
                if(!path){
                    return data;
                }
                else {
                    return getValueByPath(path,data);
                }
            },
            render:function(){
                var error=_model.validate(data);
                if(error && error.missingItems.length>0){
                    var msg="\r\n Please set value for below arguments:\r\n";
                        error.missingItems.forEach(function(ele) {
                            msg+="\t\t\t\t"+ele;
                        });
                    var ex=new Error(msg);
                    require("../q-exception").next(ex,__filename);
                    next();
                }
                if(error && error.invalidDataType.length>0){
                    var msg="\r\n The below arguments are invalid data type:\r\n";
                        error.invalidDataType.forEach(function(ele) {
                            msg+="\t\t\t\t"+ele;
                        });
                    var ex=new Error(msg);
                    require("../q-exception").next(ex,__filename);
                    next();
                }
                req.render(data);
            }
        };
        try {
            if(req.method==="POST"){
                sender.postData=qs.parse(req.body);
                post(sender);
            }
            if(req.method==="GET"){
                get(sender);
            }
              
        } catch (error) {
            require("../q-exception").next(error,__filename);
        }
    }
}