var cache_key="__q-forms__";
if(!global[cache_key]){
    global[cache_key]={}
}

var fn=require("../q-func-define");
var retFn=fn( {
    name:["text",true],
    modelName:["text",true],
    columns:{
        $type:"array",
        $require:true,
        $detail:{
            fieldName:["text",true],
            fieldType:["text",true],
            fieldCaption:["text",true],
            displayOrder:["number",true],
            isShowOnTable:["bool",true],
            format:"text"
        }
    }
},
function (args,cb){
    if(global[cache_key][args.name]){
        if(global[cache_key][args.name].table){
            cb(null,global[cache_key][args.name]);
        }
        else {
            global[cache_key][args.name].table={
                modelName:args.modelName,
                columns:args.columns
            }
            cb(null,global[cache_key][args.name]);
        }
    }
    else {
        global[cache_key][args.name]={};
        if(!global[cache_key][args.name].table){
            global[cache_key][args.name].table={
                modelName:args.modelName,
                columns:args.columns
            }
            cb(null,global[cache_key][args.name]);
        }
    }
},__filename);
module.exports=retFn;