var qs=require("querystring");
var sys=require("quicky/q-system");
var logger=require("quicky/q-logger");
module.exports={
    index:require("./views/index"),
    myAccount:require("./views/my-account")
}