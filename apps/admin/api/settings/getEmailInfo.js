
module.exports=module.require("quicky/q-func-define")(
    {
        
    },
    function(args,cb){
        var email=require("./../../models/email");
        var ret=email().aggregate().toItemSync();
        if(!ret){
            ret={
                server:"",
                port:0,
                email:"",
                ssl:false,
                username:"",
                password:""
            }
        }
        cb(null,ret);
    }
)