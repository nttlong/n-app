
var sessions=require("./db.session");
var findUser=require("./libs.findUser");
var dateTimeMdl=require("../q-date-time");
var cache_key="__q-apps__aut_cache__";
if(!global[cache_key]){
    global[cache_key]={}
}
var sync=require("../q-sync")
module.exports=function(
    schema,
    username,
    sessionId,
    language,
    callback
){
    require("../q-validator").validateRequire({
        schema:schema,
        username:username,
        sessionId:sessionId,
        language:language
    });
    return sync.exec(function(cb){
        sessions(schema).deleteOne("SessionID=={0}",sessionId);
        var newSession=sessions(schema).insertOne({
            Username:username,
            LoginTime:dateTimeMdl.getNow(),
            LoginTimeUTC:dateTimeMdl.getUTCNow(),
            Language:language,
            SessionID:sessionId,
            IsLogout:false
        });
        if(newSession.error){
            cb(newSession.error);
            return;
        }
        var user=findUser(
            schema,
            newSession.data.Username
        );
        global[cache_key][sessionId]=user;
        cb(null,user);

    },callback,__filename)
}