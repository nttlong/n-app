var emp=require("./employee");
var qMongo=require("quicky/q-mongo");
var _db;
function setConnection(url){

    _db=qMongo.connect(url);
}
function employees(){
    return qMongo.collection("hrm.employees")
}
module.exports={
    employee:require("./employee"),
    department:require("./department"),
    setConnection:setConnection,
    queries:require("./query")
}