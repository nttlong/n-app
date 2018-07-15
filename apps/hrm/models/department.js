var baseModel=require("./base");
var qMongo=require("quicky/q-mongo");
var model=qMongo.model("hrm.departments","hrm.base")
.fields(
    {
        Code:["text",true],
        Name:["text",true],
        ParentCode:"text",
        Description:"text",
        MapPath:{
            $type:"array",
            $require:true,
            $detail:"text"
        }
    }
);
model.indexes([
    {
        Code:1,
        $unique:true
    }
]).onBeforeInsert(function(data){
    var mapPath=[data.Code];
    if(data.ParentCode){
        var parentItem=department()
                        .aggregate()
                        .match("Code=={0}",data.ParentCode)
                        .project({
                            MapPath:1
                        })
                        .toItemSync();
        if(parentItem){
            mapPath=parentItem.MapPath;
            mapPath.push(data.Code);
        }
    }
    data.MapPath=mapPath;
   
});
model.onBeforeUpdate((sender,cb)=>{
    sender.data.ModifiedOn=new Date();
    sender.data.ModefiedOnUTC=new Date();
    if(sender.filter && sender.filter._id && sender.filter._id.$eq){
        var qr=sender.aggregate()
        qr.project("Code")
        qr.match("_id=={0}",[sender.filter._id.$eq])
        var item=qr.toItem();

        var emp=require("./employee")(sender.schema);
        emp.updateMany({
            Department:{Code:sender.data.Code}
        },"Department.Code=={0}",item.Code);
        cb();
        return;
    }
    cb(null,sender);
   
    
});
model.onAfterUpdate((sender,cb)=>{
    
    cb();
});
var department=function(schema){ 
    return qMongo.collection(schema,"hrm.departments");
}
module.exports=department;