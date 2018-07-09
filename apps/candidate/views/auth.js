var sys=require("quicky/q-system");
var apps=require("quicky/q-apps");
var bll=require("./../bll")
module.exports=function(req,res,next){
    var user=req.getUser();
    
    if(user && !user.candidateInfo){
        var user=require("./../../candidate/bll/auth")(
            req.tenancySchema,
            req.sessionID
        );
    }
    if(!user){
        res.redirect(req.getAppUrl("login")+"?next="+encodeURIComponent(escape(req.getFullUrl())));
        
    }
    else {
        req.setUser(user);
        next();
    }
}