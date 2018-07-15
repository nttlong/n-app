var db=require("quicky/q-mongo")
db.connect("mongodb://root:123456@localhost:27017/hrm")
var emp=require("./models/employee")("sys")
var deps=require("./models/department")("sys");
var x=emp.aggregate()
var dep=deps.findOne();
 deps.updateOne({Code:"TEST002"}, "_id=={0}",[dep._id]);
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
    console.log(retInsert);
// } catch (error) {
//     console.error(error)
// }
