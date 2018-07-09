var apps=require("quicky/q-apps");
var views=require("./views");
var express = require('express')
  , router = express.Router()

var sync=require("quicky/q-sync");
router.use('/static',express.static(__dirname+'/static'))
apps.urls(router)
.setTemplateDir(__dirname)
.url("index.html","/",require("./views/index"))
router.use('/static',express.static(__dirname+'/static'));
module.exports = router