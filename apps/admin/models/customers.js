var db=require("quicky/q-mongo");
var model_name="sys_multi_tenancy"
var qDateTime=require("quicky/q-date-time");
db.model(model_name)
.fields({
    code:["text",true],
    schema:["text",true],
    OrganizeInfo:{
        Name:["text",true],
        Address:["text",true],
        Email:["text",true]
    },
    RegisterInfo:{
        Time:["date",true],
        UTCTime:["date",true],
        ByEmail:["text",true]
    },
    AdminInfo:{
        Username:["text",true],
        Email:["text",true]
    },
    Description:"text",
    CreatedOn:["date",true],
    CreatedOnUTC:["date",true],
    CreatedBy:["text",true],
    ModifiedOn:"date",
    ModifiedOnUTC:"date",
    ModifiedBy:"text",
    SchemaHistory:{
        $type:"array",
        $detail:{
            schema:["text",true],
            CreatedOn:["date",true],
            CreatedBy:["text",true]
        }
    }
})
.onBeforeInsert(function(data){
    if(!data.RegisterInfo){
        data.RegisterInfo={}
    }
    data.CreatedOn=new Date();
    data.CreatedOnUTC=qDateTime.getUTCNow();
    data.CreatedBy=data.CreatedBy||"application";
    data.RegisterInfo.Time=data.RegisterInfo.Time||data.CreatedOn;
    data.RegisterInfo.UTCTime=data.RegisterInfo.UTCTime||data.CreatedOnUTC

})
.onBeforeUpdate(function(data){
    data.ModifiedOn=new Date();
    data.ModifiedOnUTC=qDateTime.getUTCNow();
    data.ModifiedBy=data.ModifiedBy||"application";
})
.indexes(
    [
        {
            code:1,
            $unique:true
        },
        {
            schema:1,
            $unique:true
        },{
            "OrganizeInfo.Name":1,
            $unique:true
        },{
            "OrganizeInfo.Email":1,
            $unique:true
        }

    ]
);
function customers(){
    return db.collection(model_name)
}
module.exports=customers
