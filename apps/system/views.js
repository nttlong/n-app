var qs=require("querystring");
var system=require("quicky/q-system");
function login(req,res){
    var post = qs.parse(req.body);
    if(req.method=="POST"){
        post.language=req.getLanguage();
        
        var user=system.login.sync(post);
        if(!user){
            post.error="Login fail";
        }
        else{
            var ret=system.signIn.sync({
                username:user.username,
                sessionId:req.sessionID,
                language:req.getLanguage()
            })
            res.redirect(req.getAppUrl());
        }
    }
    
    req.render(post);
}
function signout(req,res,next){
    if(req.method==="POST"){
        system.signOut.sync({
            sessionId:req.sessionID
        });
        req.render({});

    }
    
}
function index(req,res){
    var menu=require("./menu")(req.getLanguage(),req.application.name);
    req.render({menu:menu})
}
function loadPage(req,res,next){
    var forms=require("./forms");
    var tbl=forms[req.params.page];
    req.setViewPath("views/"+req.params.page+".html");
    req.render({
        page:"views/"+req.params.page+".html",
        columns:tbl.getColumnsOfTable(),
        source:req.params.page
    });
}
function loadDialogPage(req,res,next){
    var forms=require("./forms");
    var tbl=forms[req.params.page];
    req.setViewPath("views/"+req.params.page+".html");
    req.render({
        page:"views/"+req.params.page+".html",
        source:req.params.page
    });
}
module.exports={
    login:login,
    index:index,
    signout:signout,
    loadPage:loadPage,
    loadDialogPage:loadDialogPage
}