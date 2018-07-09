var apps=require("quicky/q-apps");
// var api=require("quicky/q-api")
// var express = require('express')
//   , router = express.Router()
// var sync=require("quicky/q-sync");
// router.use('/static',express.static(__dirname+'/static'))
// apps.urls(router)
// .setControllerPath(__dirname+"/controllers")
// .setDir(__dirname)
// .url("index.html","/",require("./controllers/index"))
// .url("login.html","/login","./controllers/login")
// // .url("views.html","./controllers/:page",views.loadView)
// .url("api.html","/api",api.handler)
// .url("api.html","/api/upload_file/resgister",require("./api_uploader").register)
// .url("system/users.html","/system/users",require("./controllers/system/users"))
// .url("system/user.html","/system/user",require("./controllers/system/user"))
// .url("system/customers.html","/system/customers",require("./controllers/system/customers"))
// .url("system/email.html","/system/email",require("./controllers/system/email"))
// .url("/xxxx.html","/xxxx",function(req,res,next){
//   res.end("OK");
// })
// .url("/xxxx.html","/mm",function(req,res,next){
//   res.end("OK");
// })

// router.use('/static',express.static(__dirname+'/static'));

module.exports = apps.createAppRoutes(__dirname)
.url([
  "/",
  "/login",
  "/system/users",
  "/system/user",
  "/system/email",
  "/system/email_testing",
  "/categories/production",
  "/categories/product",
  "/signout"
]
)
.router;