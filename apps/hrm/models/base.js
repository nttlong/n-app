var qMongo=require("quicky/q-mongo");
qMongo.model("hrm.base")
.fields({
    CreatedOn:["date",true],
    CreatedOnUTC:["date",true],
    CreatedBy:["text",true],
    ModifiedOn:"date",
    ModifiedOnUTC:"date",
    ModifiedBy:"text"
})
.onBeforeInsert(function(data){
    data.CreatedOn=new Date();
    data.CreatedOnUTC=new Date();
    if(!data.CreatedBy){
        data.CreatedBy="application"
    }
}).onBeforeUpdate(function(data){
    data.ModifiedBy=data.ModifiedBy||"application";
    data.ModifiedOn=new Date();
    data.ModifiedOnUTC=new Date();
});