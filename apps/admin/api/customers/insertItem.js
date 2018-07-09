var customers=require("./../../models/customers")
module.exports=require("quicky/q-func-define")(
    {
        data:{
            code:["text",true],
            schema:["text",true],
            OrganizeInfo:{
                Name:["text",true],
                Address:["text",true],
                Email:["text",true]
            },
            AdminInfo:{
                Username:["text",true],
                Email:["text",true]
            }
        }
    },function(args,cb){
        try {
            args.data.SchemaHistory=[];
            if(!args.data.RegisterInfo){
                args.data.RegisterInfo={}
            }
            if(!args.data.RegisterInfo.ByEmail){
                args.data.RegisterInfo.ByEmail=args.data.AdminInfo.Email;
            }
            var ret=customers().insertOneSync(args.data);
            
            if(!ret.error){
                cb(null,ret.data);
            }
            else {
                cb(ret.error);
            }
            
        } catch (error) {
            cb(error);
        }
        

    }
)