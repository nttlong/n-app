var baseModel=require("./base");
var qMongo=require("quicky/q-mongo");
 
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
);
var employee=function(schema)
{
    return qMongo.collection(schema,"hrm.employees");
};
module.exports=employee;
