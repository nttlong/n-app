var router=require("./router");
var sys=require("quicky/q-system")
var logger=require("quicky/q-logger");

function authenticate(req,res,next){
    try {
        if (req.getCurrentUrl().toLowerCase()==req.getAppUrl("login").toLowerCase()){
            next();
            return;
        }
        var ret=sys.checkSession(
            req.tenancySchema,
            req.sessionID
        );
        if(!ret){
            res.redirect(req.getAppUrl("login"));
            return;
        }
        req.setUser(ret);
        if(!ret || !ret.isSysAdmin){
            if (req.getCurrentUrl()!=req.getAppUrl("login")){
                res.redirect(req.getAppUrl("login"));
            return;
            }
            
        }
        next();
    } catch (error) {
        throw(error);
        next();
    }
    
    
}
function getFileStorage(){
    return require("path").join(require("quicky/q-apps").getRootDir(),"data");
}
module.exports={
    router:router,
    authenticate:authenticate,
    getFileStorage:getFileStorage
}