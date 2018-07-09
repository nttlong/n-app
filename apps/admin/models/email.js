var db=require("quicky/q-mongo");
db.model("sys_email_settings")
.fields({
    server:["text",true],
    port:["number",true],
    ssl:["bool",true],
    email:["text",true],
    username:["text",true],
    password:["text",true],
    useDefaultCredentials:["bool",true]
});
module.exports=function(){
    return db.collection("sys_email_settings")
}