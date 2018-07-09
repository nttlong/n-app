var users=require("./db.users")
module.exports=require("../q-func-define")(
    {
        username:["text",true],
        schema:["text",true]
    },
    function deleteUser(args,cb){
        users(args.schema).deleteOne("Username=={0}",args.username,cb);
    },
    __filename
);