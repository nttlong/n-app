const model_name="sys_email"

var db=require("../q-mongo");
var dateTimeMdl=require("../q-date-time");
function connect(url){
    db.connect(url);
}
db.model(model_name)
.fields({
        username:["text",true],
        password:["text",true],
        port:["number",true],
        useSSL:["bool",true],
        useDefaultCredentials:["bool",true],
        email:["text",true]
                            
});
function email(schema){
    return db.collection(schema,model_name)
}
module.exports=email