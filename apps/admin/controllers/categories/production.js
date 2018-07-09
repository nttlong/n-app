module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        var products=require("./../models/product");
        return {
            base:require("./../base-grid"),
           
            ajax:{
                getData:(s,d)=>{
                    s.validatePostData();
                   
                    var ret=products(s.schema).aggregate()
                    .project({
                        id:"_id",
                        code:1,
                        name:1,
                        description:1,
                        createdOn:1,
                        createdBy:1,
                        modifiedOn:1,
                        modifiedBy:1,
                        main_photo_id:1
                    }).toPage(s.postData.pageIndex,s.postData.pageSize);
                    s.setValue(ret);
                    d();
                },
                deleteItems:(s,d)=>{
                    s.postData.forEach(function(x){
                        products(s.schema).deleteOne("code=={0}",[x]);
                    });
                    d();
                }
            }
        }
    }
)