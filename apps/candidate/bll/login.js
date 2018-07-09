var sysMdl=require("quicky/q-system");
var sync=require("quicky/q-sync")
module.exports1=require("quicky/q-func-define")(
    {
        username:["text",true],
        password:["text",true],
        schema:["text",true],
        sessionID:["text",true]
    },function(args,cb){
        var collCandidate=require("./../models/candidate")(args.schema);
        var retLogin=sysMdl.login.sync({
            username:args.username,
			password:args.password,
		   schema:args.schema
        });
        if(retLogin.error){
            cb(null,{
                error:retLogin.error
            });
            return;
        }
        if(!retLogin.data){
            cb(null,{
                error:{
                    code:"fail",
                    message:"Login fail"
                }
            });
            return;
        }
        var retCandidate=collCandidate.findOneSync("Username=={0}",retLogin.data.username);
        if(!retCandidate){
            var retInsert=collCandidate.insertOneSync({
                Username:retLogin.data.username,
                FirstName:retLogin.displayName||retLogin.data.username,
                LastName:"",
                Title:""
            });
            if(retInsert.error){
                cb(null,{
                    error:{
                        message:"login fail"
                    }
                });
            }
            else{
                retLogin.data.candidateInfo={
                    id:retInsert.data._id,
                    firstName:retInsert.data.FirstName,
                    lastName:retInsert.data.LastName
                } 
                cb(null,{
                    data:retLogin
                });

            }
        }
        else {
            retLogin.data.candidateInfo={
                id:retCandidate._id,
                firstName:retCandidate.FirstName,
                lastName:retCandidate.LastName
            };
            cb(null,{
                data:retLogin.data
            });
        }
    },
    __filename
)
// module.exports=function()