module.exports=require("quicky/q-func-define")(
    {
    server:["text",true],
    port:["number",true],
    ssl:["bool",true],
    email:["text",true],
    username:["text",true],
    password:["text",true],
    useDefaultCredentials:["bool",true]
    },function(args,cb){
        var email=require("./../../models/email");
        var retItem=email().aggregate().toItemSync();
        if(!retItem){
            var ret=email().insertOneSync(args.data);
            cb(null,args.data)

        }
        else {
            var ret=email().updateOne(args.data,"_id==@_id",args.data);
            cb(null,args.data)
        }
    }
)