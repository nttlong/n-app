
var apps=require("quicky/q-apps");
var express = require('express')
  , router = express.Router()
  //Declare route for app
  apps.urls(router)
.setTemplateDir(__dirname) 
//Create route with template file in templates
.url("index.html","/",require("./views/index"));
router.use('/static',express.static(__dirname+'/static'))//set template dir
/**
 * router define
 */
module.exports=router;