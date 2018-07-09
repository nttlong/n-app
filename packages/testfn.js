var fn=require("./func-define")(
    {
        username:["text",true],
        password:["text",true]
    },
    function(error,args,cb){
        if(error){
            throw(error)
        }
        console.log(args),
        cb(null,1)
    }
)
module.exports=fn
