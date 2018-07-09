
module.exports=function(req,res,next){
    
    var app=require("quicky/q-apps").getAppByDir(__dirname);
    var language=require("quicky/q-language");
    var qs=require("querystring");
    var sys=require("quicky/q-system");
    if(req.method==="POST"){
        var post=qs.parse(req.body);
        var ret=require("./../bll/createCandidateUser")({
            schema:req.tenancySchema,
            username:post.username,
            password:post.password,
            firstName:post.firstName,
            lastName:post.lastName,
            email:post.email,
            createdBy:app.name+"/register"

        });

        if(ret.error){
            req.render(
                {
                    error:ret.error,
                    data:post
                }
            )
            return;
        }
        else {
            res.redirect(req.getAppUrl("my-account"));
            return;
        }
        
    }
    req.render({data:{}});
}