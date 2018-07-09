var frm=require("./../forms");
var models=require("./../db-models");
var db=require("quicky/q-mongo");
module.exports=function(args,cb){
    var cols=frm[args.data.source].getColumnsOfTable();
    var modelName=frm[args.data.source].meta.table.modelName;
    var project={};
    cols.forEach(function(item) {
        var key=item.fieldName;
        project[key]=1;
    });
    
    var colls=db.collection(modelName).aggregate()
                        .project(project)
    var ret=colls.toArray(function(err,items){
        cb(err,items);
    });                        
    
    
}