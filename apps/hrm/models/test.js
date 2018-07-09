// var deps=require("./department");
var models=require("./index");
var db=require("quicky/q-mongo");
db.connect("mongodb://root:123456@localhost:27017/hrm");
var ret= models.queries.getChildDepartmentsByCode("cn2").toArraySync();
var ret=models.department().insertOneSync({
    Code:"CN61",
    Name:"Chi nhánh số 6/1",
    ParentCode:"CN6"

});
// var ret=models.department().findSync("MapPath=={0}","CN2");
 console.log(ret);