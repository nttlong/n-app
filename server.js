var q=require("quicky")
// var conn=q.configs.getConfig("configs/connections.xml");
// if(conn.error){
//     throw(conn.error);
// }
// conn=conn.result;
var app=q.apps;
var api=q.api;
var cnn1="mongodb://nttlong:nttlong123456@ds129321.mlab.com:29321/hrm";
var cnn="mongodb://root:123456@localhost/hrm";
var cnn2="mongodb://sys:123456@172.16.7.63:27017/lv01_lms";
var language=q.language;
var qMongo=q.mongo;
q.email.setConfig(
    cnn,
    "sys_send_emails",
    "sys_email_settings",
    "email_templates"

)
qMongo.connect(cnn);
 language.setConfig(cnn,"sys_languages");
api.connect(cnn,"sys_api_callback_cache");
app.setSecretKey("sas03udh74327%$63283");
app.setCacheMode(true);
app.setCompressMode(false);
// app.sessionCacheUseMemCache(true);
app.sessionCacheUseMemCache(false);
var port=process.env.PORT || 3000;
app.load(
    [
        {
            name:"example",
            dir:"apps/example",
            hostDir:"exp"

        },{
            name:"cms",
            dir:"apps/cms"
        },
        // {
        //     name:"candidate",
        //     dir:"apps/candidate",
        //     hostDir:"candidate"

        // },
        {
            name:"candidate-admin",
            dir:"apps/candidate-admin",
            hostDir:"candidate-admin"

        },
        {
            name:"admin",
            dir:"apps/admin",
            hostDir:"admin"

        },
    ]
).listen(3000,()=>{
    console.log("app start  at port 3000");
});