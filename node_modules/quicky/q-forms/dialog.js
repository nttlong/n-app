var cache_key="__q-forms__";
if(!global[cache_key]){
    global[cache_key]={}
}

var fn=require("../q-func-define");
var retFn=fn( {
    name:["text",true],
    modelName:["text",true],
    rows:{
        $type:"array",
        $require:true,
        $detail:{
            lgCols:{
                $type:"array",
                $require:true,
                $detail:"number"
            },
            mdCols:{
                $type:"array",
                $require:true,
                $detail:"number"
            },
            smCols:{
                $type:"array",
                $require:true,
                $detail:"number"
            },
            xsCols:{
                $type:"array",
                $require:true,
                $detail:"number"
            },
            fields:{
                $type:"array",
                $require:true,
                $detail:{
                    fieldName:["text",true],
                    controlType:["text",true]
                }
            }
        }
    }
},
function (args,cb){
    if(global[cache_key][args.name]){
        if(global[cache_key][args.name].dialog){
            cb(null,global[cache_key][args.name]);
        }
        else {
            global[cache_key][args.name].dialog={
                modelName:args.modelName,
                rows:args.rows
            }
            cb(null,global[cache_key][args.name]);
        }
    }
    else {
        global[cache_key][args.name]={};
        if(!global[cache_key][args.name].dialog){
            global[cache_key][args.name].dialog={
                modelName:args.modelName,
                rows:args.rows
            }
            cb(null,global[cache_key][args.name]);
        }
    }
},__filename);
module.exports=retFn;