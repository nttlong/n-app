var baseModel=require("./base");
var qMongo=require("quicky/q-mongo");
var department=require("./department");

qMongo.model("hrm.employees","hrm.base").fields({
    Code:["text",true],
    FirstName:["text",true],
    LastName:["text",true],
    Gender:["bool",true],
    BirthDate:["date",true],
    Department:{
        Code:["text",true],
        ApplyDate:["date",true],
        DecisionDate:"date",
        DecisionBy:"text",
        DecisionNo:"text",
        AffectedOn:"date",
        History:{
            $type:"array",
            $detail:{
                Code:["text",true],
                Name:["text",true],
                DecisionDate:"date",
                DecisionBy:"text",
                DecisionNo:"text",
                AffectedOn:"date",
                LeftDate:["date",true]


            }
        }
    },
    ContactInfo:{
        Email:"text"
    },
    
}).indexes(
    [
        {
            Code:1,
            $unique:true
        },{
            "ContactInfo.Email":1,
            $unique:true,
            $partialFilterExpression: {"ContactInfo.Email": {$type: "string"}}
        }
    ]
).onBeforeInsert((data,sender)=>{
    if(data.Department && data.Department.Code){
        var item=department(sender.schema).findOne("Code=={0}",[data.Department.Code]);
        console.log(item);
        if(!item){
            if(item==null){
                throw(new Error(`Departent code ${data.Department.Code} was not found in department `))
            }
        }
    }
    console.log(data)
});

var employee=function(schema)
{
    return qMongo.collection(schema,"hrm.employees");
};
module.exports=employee;
