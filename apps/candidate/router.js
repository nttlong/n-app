var apps=require("quicky/q-apps");
var api=require("quicky/q-api");
var auth=require("./views/auth");
var views=require("./views");
var express = require('express')
  , router = express.Router()
var sync=require("quicky/q-sync");
router.use('/static',express.static(__dirname+'/static'))
apps.urls(router)
.setTemplateDir(__dirname)
.url("index.html","/",views.index)
.url("login.html","/login",require("./views/login"))
.url("post-job.html","/post-job",require("./views/post-job"),auth)
.url("views.html","/views/:page",views.loadView)
.url("my-account.html","/my-account",require("./views/my-account"),auth)
.url("sign-out.html","/sign-out",require("./views/sign-out"))
.url("register.html","/register",require("./views/register"));
module.exports=require("quicky/q-apps")
.create;