var apps=require("quicky/q-apps");
var views=require("./views");
var express = require('express')
  , router = express.Router()
var models=require("./models");
var sync=require("quicky/q-sync");
router.use('/static',express.static(__dirname+'/static'))
apps.urls(router)
.setTemplateDir(__dirname)
.url("index.html","/",views.index)
.url("login.html","/login",views.login)
.url("views.html","/views/:page",views.loadView)
router.use('/static',express.static(__dirname+'/static'));
module.exports = router