const model_name="sys_session"
var db=require("../q-mongo");
function connect(url){
    db.connect(url);
}
db.model(model_name)
.fields({
    Username : ["text",true],
    LoginTime :["date",true,Date.now],
    LoginTimeUTC:["date",true,Date.now],
    SessionID:["text",true],
    Language:["text",true],
    IsLogout:["bool",true,false],
    LogoutTime:"date",
    LogoutTimeUCT:"date"
                            
}).indexes([
    {SessionID:1,$unique:true}
]);
function sessions(schema){
    return db.collection(schema,model_name)
}
module.exports=sessions