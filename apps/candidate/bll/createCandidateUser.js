module.exports=require("quicky/q-func-define")(
   {
       schema:["text",true],
       username:["text",true],
       password:["text",true],
       firstName:["text",true],
       lastName:["tex",true],
       email:["text",true],
       createdBy:["text",true]

   } ,
   function(args,callback){
    debugger;
       var sys=require("quicky/q-system");
        var ret=sys.createUser(
           args.schema,
           args.username,
           args.password,
           args.email,
           args.firstName+" "+args.lastName,
           false,
           false);
        if(ret.error){
            callback(ret.error);
            return;
        }
        var candidate=require("../models/candidate")(args.schema);
        
        var ret=candidate.insertOne({
            FirstName:args.firstName,
            LastName:args.lastName,
            Username:args.username,
            Title:""
        });
        if(ret.error){
            callback(ret.error);
            return;
        }
        var user=sys.findUser(args.schema,args.username);
        user.candidateInfo=ret.data;
        callback(null,user);

   },__filename
);