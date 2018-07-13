const model_name="ec_contact";
var db=require("quicky/q-mongo");
var qDateTime=require("quicky/q-date-time");
function getNow(){
    return new Date();
}
db.model(model_name)
.fields({
    FullName:["text",true],
    Email:["text",true],
    Tel:["text",true],
    createdOn:["date",true,getNow],
    createdOnUTC:["date",true,qDateTime.getUTCNow],
    createdBy:["text",true],
    modifiedOn:["date",false],
    modifiedOnUTC:["date",false],
    modifiedBy:["text",false]
})

function contact(schema){
    return db.collection(schema,model_name)
}
module.exports=contact