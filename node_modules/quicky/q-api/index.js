
var json=require("../q-json");


var run=require("./run");

function handler(req,res,next){
    var data=json.fromJSON(req.body);
    data.appName=req.application.name;
    data.language=req.getLanguage();
    data.username=req.getUser()?req.getUser().username:"";
    data.isAnonymous=req.getUser()?false:true;
    data.sessionId=req.sessionID;
    data.schema=req.tenancySchema;
    run.run(data,function(error,result){
        if(error){
            var err=new Error(((error.ex)?error.ex.message:undefined)||(error.message||error.code));
            Object.keys(error).forEach(function(key){
                if(key!="ex"){
                    err[key]=error[key];
                }
            })
            throw(err);
            next();
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.end(json.toJSON(result));
        }
    });
    
}
var apiDefine=require("./api-define")
module.exports={
    handler:handler,
    getKey:run.getKey,
    getPath:run.getPath,
    connect:run.connect,
    apiDefine:apiDefine
}