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
}).onBeforeUpdate((sender,cb)=>{
    sender.data.ModifiedBy=sender.data.ModifiedBy||"application";
    sender.data.ModifiedOn=new Date();
    sender.data.ModifiedOnUTC=new Date();
    cb(null,sender);
});