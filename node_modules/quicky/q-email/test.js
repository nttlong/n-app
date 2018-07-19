var x=require("./index");
x.setUseBackgroudService(false);
x.setEmailConfig(
    "webmail.lacviet.com.vn",
    25,false,false,"lvdomain\\requesthcs","Lvsure!@#$"

)
x.setConfig(
    "mongodb://sys:123456@172.16.7.63:27017/lv01_lms",
    "sys_email_sent_item",
    "email_templates",
    "email_template"
)
x.send("lv",
"long_test",
"nttlong@lacviet.com.vn",
"Hi {{username}},",
"hi {{username}}",
{
    username:"xxxx"
},
null,
(e,r)=>{
    console.log(e);
    console.log(r);
})