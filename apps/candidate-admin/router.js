
var apps=require("quicky/q-apps");
var express = require('express')
  , router = express.Router()
  //Declare route for app
  
  apps.urls(router)
.setTemplateDir(__dirname) //set template dir
//Create route with template file in templates
.url("index.html","/",require("./controllers/index"))
.url("login.html","/login",require("./controllers/login"))
.url("accounts/users.html","/accounts/users",require("./controllers/accounts/users"))
.url("accounts/user.html","/accounts/users/new",require("./controllers/accounts/user"))
.url("accounts/admin-users.html","/accounts/admin-users",require("./controllers/accounts/admin-users"))
.url("categories/nation.html","/categories/nation",require("./controllers/categories/nation"))
.url("categories/MarriedStatus.html","/categories/MarriedStatus")
.url("signout.html","/signout",require("./controllers/signout"));
router.use('/static',express.static(__dirname+'/static'))
/**
 * router define
 */
module.exports=router;