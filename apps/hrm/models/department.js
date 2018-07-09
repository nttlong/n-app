var baseModel=require("./base");
var qMongo=require("quicky/q-mongo");
qMongo.model("hrm.departments","hrm.base")
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
).indexes([
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
   
}).onBeforeUpdate(function(){
    data.ModifiedOn=new Date();
    data.ModefiedOnUTC=new Date();
});
var department=function(prefix){ 
    return qMongo.collection(prefix?repfxi+".hrm.departments":"hrm.departments");
}
module.exports=department;