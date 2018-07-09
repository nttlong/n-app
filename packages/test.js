var model=require("../model-define");
var db=require("../q-mongo")
db.connect("mongodb://sys:123456@172.16.7.63:27017/lv01_lms");
var E=require("../q-mongo/expr")
// var x=model("user")
// .fields({
//     username:{
//         $type:"text",
//         $require:true
//     },
//     password:{
//         $type:"text",
//         $require:true
//     }
// });
db.model("test_user")
.fields({
    username:["text",true],
    password:"text",
    logins:{
        $type:"array",
        $detail:{
            time:"text",
            createdOn:["text",true]
        },
        $require:true
    }
}).indexes([
    {username:1,$unique:true}
]);
db.collection("test_user").aggregate()
.project({
    username:1,
    password:1,
    logins:1
})
.unwind("logins")
.lookup(
    db.collection("test_user"),
    "logins.time",
    "logins.time",
    "x"
)
.project({
    x:"x.password+day(logins.time)+logins[1].time"
})
// .sort([{
//     "logins.time":1
// },{
//     "logins.createdOn":-1
// }]);
// var fx=E.extractFields("(concat(username,\" \",password)+test)==@test",{test:1});
// fx=E.getUnknownFields(x.getFieldsAsArray(),)
// console.log(fx);