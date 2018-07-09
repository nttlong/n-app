var customers=require("./../models/customers")
var fn=require("quicky/q-func-define")
({data:{
    code:["text",true],
    
}},function(args,cb){
    
    var qr=customers().aggregate().match(
        "code=={0}",args.data.code
    ).project({
        code:1,
        OrganizeInfo:1,
        schema:1,
        AdminInfo:1
    });
    var ret=qr.toItemSync();
    cb(null,ret);
});
module.exports=fn;