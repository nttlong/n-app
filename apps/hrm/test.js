var db=require("quicky/q-mongo")
db.connect("mongodb://root:123456@localhost:27017/test")
var emp=require("./models/employee")("sys")
var deps=require("./models/department")("sys");
var x=emp.aggregate()
x.project({
    Code:1,
    FirstName:1,
    LastName:1,
    "Department.Code":1
})
x.lookup(deps,"Code","Department.Code","Dep");
x.project(
    {
        "Dep.ParentCode":1
    }
);
var v=db.createView(x,"sys","employee_departments");
v=v.aggregate()
v.project(
    {
        "Dep.ParentCode":1
    }
);
var v2=db.createView(v,"sys","test_employee_departments");
var items=v.project(
    {
        x:1
    }
).toArray();
console.log(items);

// var dep=deps.findOne();
//  var ret=deps.updateOne({Code:"GD200"}, "_id=={0}",[dep._id]);
// try {
//    var retInsertDep= deps.insertOne({
//         Code:"Director",
//         Name:"Director"

//     });
//     if(retInsertDep.error){
//         throw(retInsertDep.error);
//     }

    // var retInsert=emp.insertOne({
    //     Code:"NV001",
    //     FirstName:"Johan",
    //     LastName:"Black",
    //     Gender:false,
    //     BirthDate:new Date(1982,12,11),
    //     Department:{
    //         Code:"Director",
    //         ApplyDate:new Date(),
    //         History:[]
    //     }
    // })
    // console.log(ret);
// } catch (error) {
//     console.error(error)
// }
