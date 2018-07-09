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
            var item=customers().findOneSync("code==@code",args.data);
            if(!item){
                cb(new Error("Data was not found"));
                return;
            }
            if(item.schema!=args.data.schema){
                customers().updateOneSync({
                    $push:{SchemaHistory:{
                        CreatedOn:item.ModifiedOn|item.CreatedOn,
                        CreatedBy:item.ModifiedBy|item.CreatedBy,
                        schema:item.schema
                    }}
                }, "code==@code",args.data);
            }
            var ret=customers().updateOneSync({
                schema:args.data.schema,
                OrganizeInfo:{
                    Name:args.data.OrganizeInfo.Name,
                    Address:args.data.OrganizeInfo.Address,
                    Email:args.data.OrganizeInfo.Email
                },
                AdminInfo:{
                    Username:args.data.AdminInfo.Username,
                    Email:args.data.AdminInfo.Email
                }
            }, "code==@code",args.data);
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