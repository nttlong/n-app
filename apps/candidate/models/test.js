var qMongo=require("quicky/q-mongo");
qMongo.connect("mongodb://root:123456@localhost:27017/hrm"); 
var m=require("./candidate")
var v=require("quicky/q-mongo/extens_helper")
var d=v.model("jobs.candidate");
var db=require("mongodb")
 
// console.log(d);
// var data={
//     Experience:[{
//         History:[]
//     }]};
// var x=d.validateRequireData(data)
// var y=d.validateDataType(data)
var ret=m.insertOneSync({});