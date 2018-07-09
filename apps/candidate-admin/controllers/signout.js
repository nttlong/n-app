var sysMdl=require("quicky/q-system");
module.exports=function(req,res,next){
    sysMdl.signOut(
        req.tenancySchema,
        req.sessionID
    );
    req.setUser(null);
    res.redirect(req.getAppUrl());
}