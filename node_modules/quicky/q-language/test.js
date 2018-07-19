var lang=require("./index");
lang.setConfig("mongodb://sys:123456@172.16.7.63:27017/lv01_lms","sys_languages");
var x=lang.getItem("vi","_","_","login","login");
console.log(x);