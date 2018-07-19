var db=require("quicky/q-mongo")
var x=db.connect("mongodb://root:123456@localhost:27017/test");
console.log(x);

function startSession(db,callback){
    var fn_start_session=`var session=db.getMongo().startSession( { mode: \"primary\" } ); 
        var _db=session.getDatabase(db.getName());
        if(!db.sessions_db) db.sessions_db={};
        if(!db.sessions_cache) db.sessions_cache={};
        var id=session.tojson();
        id=id.split('("')[1].split('")')[0];
        db.sessions_db[id]=_db;
        db.sessions_cache[id]=session;
        return id;`;
    return require("quicky/q-sync").exec(function(cb){
        db.eval(fn_start_session,cb)
    },callback,
    __filename)
}
function startTransaction(db,id,callback){
    var fn="function(id){var session=db.sessions_cache[id]; session.startTransaction( { readConcern: { level: \"snapshot\" }, writeConcern: { w: \"majority\" } } );}"
    return require("quicky/q-sync").exec(function(cb){
        db.eval(fn,cb)
    },callback,
    __filename)
}
function getSession(db,id,callback){
    var fn="function(id){var session=db.sessions_cache[id];return session;}"
    return require("quicky/q-sync").exec(function(cb){
        db.eval(fn,cb)
    },callback,
    __filename)
}
function commitTransaction(db,id,callback){
    var fn="function(id){var session=db.sessions_cache[id]; session.commitTransaction();}";
    return require("quicky/q-sync").exec(function(cb){
        db.eval(fn,cb)
    },callback,
    __filename)
}

var sessionID=startSession(x);
var session=getSession(x,sessionID);
commitTransaction(x,sessionID);
console.log(session);
// var fn_get_db="function(id){ return db.sessions_db[id];}"
// var fn="function() return db.getCollection('xxx');";
// var fn_get_collection
// x.eval(fn1,(ex,r)=>{
//     x.eval(fn_get_db,[r],(ex,r1)=>{
//         console.log(r1);
//     })
//     // var emps=r.getDatabase("test").employees
//     // console.log(r);
// })
// var emp=require("./models/employee")("sys")
// var deps=require("./models/department")("sys");
// var x=emp.aggregate()
// x.project({
//     Code:1,
//     FirstName:1,
//     LastName:1,
//     "Department.Code":1
// })
// x.lookup(deps,"Code","Department.Code","Dep");
// x.project(
//     {
//         "Dep.ParentCode":1
//     }
// );
// var v=db.createView(x,"sys","employee_departments");
// v=v.aggregate()
// v.project(
//     {
//         "Dep.ParentCode":1
//     }
// );
// var v2=db.createView(v,"sys","test_employee_departments");
// var items=v.project(
//     {
//         x:1
//     }
// ).toArray();
// console.log(items);

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
