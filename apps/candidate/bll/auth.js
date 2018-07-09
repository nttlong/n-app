var sys=require("quicky/q-system");
var candidates=require("./../models/candidate");
var sync=require("quicky/q-sync");
module.exports=function(
    schema,
    sessionID,
    callback
){
    return sync.exec(function(cb){
        var chk_session=sys.checkSession(schema,sessionID);
        if(!chk_session){
            cb();
            return;
        }
        var candidateColl=candidates(schema);
        var candidate=candidateColl.findOne("Username=={0}",chk_session.username);
        if(!candidate){
            cb();
            return;
        }
        chk_session.candidateInfo={
            id:candidate._id,
            firstName:candidate.FirstName,
            lastName:candidate.LastName
        };
        cb(null,chk_session);

    },callback,__filename);
}