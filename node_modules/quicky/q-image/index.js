function getMimeTypeFromImageBase64URL(data){
    //data:image/jpeg;
    var i=data.indexOf(':');
    var j=data.indexOf(';',i+1);
    return data.substring(i+1,j);
}
function getBufferFromBase64(data){
    var _data = data.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(_data, 'base64');
    return buf;
}
function saveBase64ToFile(fileName,data,callback){
     return require("../q-sync").exec(function(cb){
        var fs=require("fs");
        var bff=getBufferFromBase64(data);
        fs.writeFile(fileName,bff,"binary",function(ex){
            cb(ex);
        })
     },callback,__filename)
}
function saveBase64ImageToFileByApp(app,fileName,data,callback){
    if(!app._mdl.getFileStorage){
        require("../q-exception").next(
            new Error("It looks like you forgot set 'getFileStorage' function for app '"+app.name+"' in '"+app.dir+"/index.js'"),
            __filename
            );
    }
    var xFilePath=require("path").join(app._mdl.getFileStorage(),"images",fileName);
    return saveBase64ToFile(xFilePath,data,callback);
}
function getExtOfFile(fileName){
    var items=fileName.split(".");
    return items[items.length-1];
}
module.exports={
    getMimeTypeFromImageBase64URL:getMimeTypeFromImageBase64URL.indexOfgetBufferFromBase64,
    getBufferFromBase64:getBufferFromBase64,
    saveBase64ToFile:saveBase64ToFile,
    saveBase64ImageToFileByApp:saveBase64ImageToFileByApp,
    getExtOfFile:getExtOfFile

}