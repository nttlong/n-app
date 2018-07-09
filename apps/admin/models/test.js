var c=require("quicky//languages")
var db=require("quicky/q-mongo");
db.connect("mongodb://sys:123456@172.16.7.63:27017/lv01_lms");
var language=require("quicky/q-language");
// language.setConfig("mongodb://root:123456@localhost/hrm","sys_languages");
language.setConfig("mongodb://sys:123456@172.16.7.63:27017/lv01_lms","sys_languages");
var x=c().aggregate()
x.project({
    a:"literal(1)",
    App:1
})
x.group("App",{
    totalItem:"sum(a+{0})"
},12);
// var ret=x.toArraySync();
console.log(JSON.stringify(x._pipe));