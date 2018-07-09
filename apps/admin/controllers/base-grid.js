module.exports=require("quicky/q-controller")(
    __filename,
    (s)=>{
        s.setCols=(cols)=>{
            s.setValue("cols",cols);
            return s;
        }
        s.validatePostData=function(){
            var postData=s.postData;
            if((postData.pageIndex===undefined)||
                (postData.pageSize===undefined)){
                throw("Please set pageIndex")
            }
            

        }
        return s;
    }
)