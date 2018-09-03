var sessions=require("./db.session");
var users=require("./db.users");
var cache_key="__q-apps__aut_cache__";
var dateMdl=require("../q-date-time");
if(!global[cache_key]){
    global[cache_key]={}
}
// module.exports=require("q-func-define")(
//     {
//         sessionId:["text",true],
//         schema:["text",true]
//     },function signOut(args,cb){
//         var sessionItem=sessions(args.schema).findOneSync("SessionID=={0}",args.sessionId);
//         var ret=sessions(args.schema).updateManySync({
//             IsLogout:true,
//             LogoutTime:dateMdl.getNow(),
//             LogoutTimeUCT:dateMdl.getUTCNow()
//         },"SessionID=={0}",args.sessionId);
        
//         delete global[cache_key][args.sessionId];
//         cb(null,null);
//     },
//     __filename
// );
module.exports=function(
    schema,
    sessionId,
    callback
){
    try {
        require("../q-validator").validateRequire({
            schema:schema,
            sessionId:sessionId
        });
        require("../q-sync").exec(function(cb){
            var sessionItem=sessions(schema).findOne("SessionID=={0}",sessionId);
            var ret=sessions(schema).updateMany({
                IsLogout:true,
                LogoutTime:dateMdl.getNow(),
                LogoutTimeUCT:dateMdl.getUTCNow()
            },"SessionID=={0}",sessionId);
            
            delete global[cache_key][sessionId];
            cb(null,null);
    
        },callback,__filename)
    } catch (error) {
        require("../q-exception").next(error,__filename);
    }
    
}