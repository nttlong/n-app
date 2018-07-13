// var apps=require("quicky/q-apps");
// var views=require("./views");
// var express = require('express')
//   , router = express.Router()

// var sync=require("quicky/q-sync");
// router.use('/static',express.static(__dirname+'/static'))
// apps.urls(router)
// .setDir(__dirname)
// .url("/","/",require("./views/index"))
// router.use('/static',express.static(__dirname+'/static'));
module.exports = require("quicky/q-apps")
.createAppRoutes(__dirname)
.url([
  "/",
  "/contact",
  "/feedback",
  "/about",
  "/intro"

]).router;