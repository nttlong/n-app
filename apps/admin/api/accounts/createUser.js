var sysModl=require("quicky/q-system");
module.exports=require("quicky/q-func-define")({
    data:{
        username:["text",true],
        password:["text",true],
        displayName:["text",true],
        email:["text",true]

    }
},
function(args,cb){
    try {
        args.data.isSysAdmin=false;
        args.data.isStaff=false;
        args.data.createdBy=args.username;
        args.data.schema=args.schema;
        var ret=sysModl.createUser.sync(args.data);
        if(ret.error){
            cb(ret.error)
        }
        else{
            cb(null,null);
        }
       
    } catch (error) {
        cb(error);
    }

   // cb("loi")
},
__filename
).runWithoutException;