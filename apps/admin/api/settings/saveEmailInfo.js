module.exports=require("quicky/q-func-define")(
    {
        data:{
            server:["text",true],
            port:["number",true],
            ssl:["bool",true],
            email:["text",true],
            username:["text",true],
            password:["text",true]
        }
    },function(args,cb){
        var email=require("./../../models/email");
        var retItem=email().aggregate().toItemSync();
        if(!retItem){
            var ret=email().insertOneSync(args.data);
            if(ret.error){
                cb(ret.error);
                return;
            }
            
            cb(null,ret.data);

        }
        else {
            var ret=email().updateOneSync(args.data,"_id==@_id",retItem);
            if(ret.error){
                cb(ret.error);
                return;
            }
            cb(null,args.data);
        }
    }
)