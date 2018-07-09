module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            base:require("./../base-grid"),
            ajax:{
                /**
                 * Get list of user in django framework
                 */
                getListOfUsers:(s,n)=>{ 
                    s.validatePostData();
                    var user=require("quicky/q-system/db.users")(s.schema);
                    var ret=user.aggregate().project({
                        username:"Username",
                        latestLoginFail:"LatestLoginFail",
                        modifiedOn:"ModifiedOn",
                        description:"Description",
                        createdOn:"CreatedOn",
                        createdBy:"CreatedBy",
                        email:"Email",
                        isActive:"IsActive"
                    }).toPage(s.postData.pageIndex,s.postData.pageSize);
                    s.setValue(ret);
                    n();
                }
            }
        }
    }
)