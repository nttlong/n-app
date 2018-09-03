var users=require("./db.users")
module.exports=require("../q-func-define")(
    {
        pageSize:["number",true],
        pageIndex:["number",true],
        searchText:["text"],
        sortList:{
            $type:"array",
            $detail:{
                field:["text",true],
                asc:["bool",true]
            }
        },
        schema:["text",true]
    },function(args,cb){
        try {
            users(args.schema)
            .aggregate()
            .project({
                _id:0,
                userId:"_id",
                username:"Username",
                displayName:"DisplayName",
                isSysAdmin:"IsSysAdmin",
                issStaff:"IsStaff",
                email:"Email"
            })
            .toPage(args.pageIndex,args.pageSize,function(err,res){
                cb(err,res)
            });
        } catch (error) {
            cb(error);
        }
       
    },
    __filename
)