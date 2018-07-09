var sys=require("quicky/q-system");
var apps=require("quicky/q-apps");
var candidate=require("./../models/candidate");
var qs=require("querystring");
module.exports=function(req,res,next){
    if(req.method==="POST"){
        var data=qs.parse(req.body);
        var login=sys.login(req.tenancySchema,data.username,data.password);
        if(!login){
            req.render({
                data:{error:login.error}
            });
            return;
        }
        var ret=sys.signIn(
            apps.getSchemaFromRequest(req),
            login.username,
            req.sessionID,
            "en");
        
        req.setUser(ret);
        if(req.query && req.query.next){
            var nextUrl=decodeURIComponent(req.query.next);
            res.redirect(nextUrl)
        }
        else {
            res.redirect(req.getAppUrl())
        }

    }
    req.render({
        data:{username:""}
    });
}