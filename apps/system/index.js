var sys=require("quicky/q-system")
function authenticate(req,res,next){
    if (req.getCurrentUrl().toLowerCase()==req.getAppUrl("login").toLowerCase()){
        next();
        return;
    }
    var ret=sys.checkSession.sync({
        sessionID:req.sessionID
    })
    req.setUser(ret);
    if(!ret || !ret.isSysAdmin){
        if (req.getCurrentUrl()!=req.getAppUrl("login")){
            res.redirect(req.getAppUrl("login"));
        return;
        }
        
    }
    next();
}
module.exports={
    router:require("./router"),
    authenticate:authenticate
}