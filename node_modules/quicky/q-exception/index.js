function raise(fileName,exceptionName,message,data){
    var ret=new Error(message);
    var i=ret.stack.indexOf(__filename);
    ret.stack=ret.stack.substring(0,i)+ret.stack.substring(i+__filename.length,ret.stack.length);
    i=ret.stack.indexOf(fileName);
    ret.stack=ret.stack.substring(0,i)+ret.stack.substring(i+1+fileName.length,ret.stack.length);
    ret.name=exceptionName;
    if(data!==undefined && data!==null){
        Object.keys(data).forEach(function(k){
            ret[k]=data[k];
        });
    }
    throw(ret);
}
function next(ex,fileName){
    var ret=ex;
    var i=ret.stack.indexOf(fileName);
    ret.stack=ret.stack.substring(0,i)+ret.stack.substring(i+1+fileName.length,ret.stack.length);
    
    throw(ret);
}
module.exports={
    raise:raise,
    next:next
}
