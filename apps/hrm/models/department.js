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
]);
model.onBeforeInsert(function(data){
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

var department=function(schema){ 
    return qMongo.collection(schema,"hrm.departments");
}
module.exports=department;