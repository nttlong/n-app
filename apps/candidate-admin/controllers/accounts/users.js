module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            base:require("./../base"),
            ajax:{
                getListOfUsers:(s,d)=>{
                    var users=require("quicky/q-system/db.users")(s.schema);
                    var items=users.aggregate()
                    .project({
                        Username:1,
                        Email:1,
                        DisplayName:1,
                        LatestLoginFail:1,
                        IsActive:1,
                        IsSysAdmin:1,
                        LoginFailCount:1
                    })
                    .toPage(0,50);
                    s.setValue(items);
                    d();
                }
            }
        }
       
    }
)