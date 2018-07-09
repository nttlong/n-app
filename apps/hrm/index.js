var router=require("./router");
var models=require("./models");
var sys=require("quicky/q-system")
var apps=require("quicky/q-apps")
function authenticate(req,res,next){
    var schema=apps.getSchemaFromRequest(req);
    if (req.getCurrentUrl().toLowerCase()==req.getAppUrl("login").toLowerCase()){
        next();
        return;
    }
    var ret=sys.checkSession.sync({
        sessionID:req.sessionID,
        schema:schema
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
    router:router,
    authenticate:authenticate
}