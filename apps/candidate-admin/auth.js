/**
 * Check auth
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports=
function authenticate(req,res,next){
    if (req.getCurrentUrl().toLowerCase()==req.getAppUrl("login").toLowerCase()){
        next();
        return;
    }
    if(req.getUser()==null){
        res.redirect(req.getAppUrl("login")+"?next="+req.escapeUrl(req.getFullUrl()));
        return;
    }
    if(req.getUser().isSysAdmin){
        next();
        return;
    }
    if(req.getUser().AdminCandidateInfo){
        next();
        return;
    }
    console.log("check auth in '"+__filename+"'")
    next();
}