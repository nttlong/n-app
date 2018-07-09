var express=require("express");
var router=express.Router();
var apps=require("quicky/q-apps");
var views=require("./views");
apps.urls(router)
.setTemplateDir(__dirname)
.url("login.html","/login",views.login)
.url("index.html","/",views.index)
.url("signout.html","/signout",views.signout)
.url("api.html","/api",require("quicky/q-api").handler)
.url("dynamic.html","/views/:page",views.loadPage)
.url("dynamic-dialog.html","/dialog/views/:page",views.loadDialogPage);

router.use('/static',express.static(__dirname+'/static'));

module.exports=router;