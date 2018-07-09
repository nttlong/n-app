var q=require("quicky")
// var conn=q.configs.getConfig("configs/connections.xml");
// if(conn.error){
//     throw(conn.error);
// }
// conn=conn.result;
var app=q.apps;
var api=q.api;
var cnn="mongodb://nttlong:nttlong123456@ds129321.mlab.com:29321/hrm";
var cnn2="mongodb://root:123456@localhost/hrm";
var language=q.language;
var qMongo=q.mongo;
q.email.setConfig(
    cnn,
    "sys_send_emails",
    "sys_email_settings",
    "email_templates"

)
// var dbPath="mongodb://sys:123456@172.16.7.63/lv01_lms";
// qMongo.connect("mongodb://root:123456@localhost/hrm");
qMongo.connect(cnn);
// qMongo.connect(conn.main)
// qMongo.connect("mongodb://sys:123456@172.16.7.63/lv01_lms");
 language.setConfig(cnn,"sys_languages");
// language.setConfig(conn.language.value,conn.language.collection);
// app.setTenancyConfig("mongodb://root:123456@localhost/hrm","sys_tenancy");
// api.connect(conn.api.value,conn.api.collection);

api.connect(cnn,"sys_api_callback_cache");
// api.connect("mongodb://sys:123456@172.16.7.63/lv01_lms","sys_api_callback_cache")
// language.setConfig("mongodb://sys:123456@172.16.7.63:27017/lv01_lms","sys_admin_languages");
//api.connect("mongodb://sys:123456@172.16.7.63:27017/lv01_lms","sys_api_callback_cache");
app.setSecretKey("sas03udh74327%$63283");
app.setCacheMode(true);
app.setCompressMode(false);
app.sessionCacheUseMemCache(true);
app.sessionCacheUseMemCache(false);

// app.sessionCacheSetServers([
//     {server:"localhost",
//     port:11211}
// ]);
// app.setDefaultSchema("q");
// app.setDefaultTenancy("quick");
// app.setTenancyConfig("mongodb://root:123456@localhost/hrm","sys_tenancy");
app.load(
    [
        {
            name:"example",
            dir:"apps/example",
            hostDir:"exp"

        },{
            name:"cms",
            dir:"apps/cms",
            hostDir:"cms"
        },
        {
            name:"candidate",
            dir:"apps/candidate",
            hostDir:"candidate"

        },
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
        // {
        //     name:"hrm",
        //     dir:"apps/hrm",
        //     // hostDir:"hrm"

        // },
        // {
        //     name:"per",
        //     dir:"apps/performance",
        //     hostDir:"per"
        // },{
        //     name:"admin",
        //     dir:"apps/admin"
        // },{
        //     name:"system",
        //     hostDir:"system",
        //     dir:"apps/system"
        // }
    ]
).listen(3000,()=>{
    console.log("app start  at port 3000");
});