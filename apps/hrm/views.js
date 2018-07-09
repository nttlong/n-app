
var qs=require("querystring");
var sys=require("quicky/q-system");
var apps=require("quicky/q-apps")
function login(req,res){
    var schema=apps.getSchemaFromRequest(req);
    var post = qs.parse(req.body);
    if(req.method=="POST"){
        post.language=req.getLanguage();
        post.schema=schema;
        var user=sys.login.sync(post);
        if(!user){
            post.error="Login fail";
        }
        else{
            var ret=sys.signIn.sync({
                username:user.username,
                sessionId:req.sessionID,
                language:req.getLanguage(),
                schema:schema
            })
            res.redirect(req.getAppUrl());
        }
    }
    
    req.render(post);
}
function index(req,res){
    var menu=require("./menu")(req.getLanguage(),req.application.name);
    req.render({menu:menu})
}
function loadView(req,res,next){
    req.setViewPath("views/"+req.params.page+".html");
    req.render({
        page:"views/"+req.params.page+".html",
        source:req.params.page
    });
}
module.exports={
    index:index,
    login:login,
    loadView:loadView
}