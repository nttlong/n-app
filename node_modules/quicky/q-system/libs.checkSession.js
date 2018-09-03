var sessions=require("./db.session");
var users=require("./db.users");
var findUser=require("./libs.findUser");
var sync=require("../q-sync");
var cache_key="__q-apps__aut_cache__";
if(!global[cache_key]){
    global[cache_key]={}
}
module.exports=function(
    schema,
    sessionID,
    callback
){
    return sync.exec(function(cb){
        if(global[cache_key][sessionID]){
            cb(null,global[cache_key][sessionID]);
            return; 
        }
            var ret=sessions(schema).findOne("SessionID=={0} && IsLogout=={1}",[sessionID,false]);
            if(ret==null){
                cb(null,null);
                return;
            }    
            else {
                var user=findUser(
                    schema,
                    username
                );
                global[cache_key][args.sessionID]=user;
                cb(null,user)
            }
    },callback,__filename);
}