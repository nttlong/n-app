function createError(name,message,fields,code,schema,source,foreignSource){
    
    var ret=new Error(message);
    ret.name=name;
    ret.fields=fields;
    ret.code=code;
    ret.source=source;
    ret.foreignSource=foreignSource;
    return ret;
}
module.exports=createError