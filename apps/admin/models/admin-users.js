var db=require("quicky/q-mongo");
var qDateTime=require("quicky/q-date-time");
var modelName="sys_user";
function getNow(){
    return new Date();
}
db.model(modelName)
.fields({
    Username:["text",true],
    CreatedOn:["date",true,qDateTime.toUCT],
    CreatedOn
});