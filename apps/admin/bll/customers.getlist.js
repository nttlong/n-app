var customers=require("./../models/customers")
var fn=require("quicky/q-func-define")
({data:{
    pageSize:["number",true],
    pageIndex:["number",true],
    searchText:["text"],
    sortList:{
        $type:"array",
        $detail:{
            field:["text",true],
            asc:["bool",true]
        }
    }}
},function(args,cb){
    var qr=customers().aggregate().project({
        code:1,
        name:"OrganizeInfo.Name",
        address:"OrganizeInfo.Address",
        adminBy:"AdminInfo.Username",
        adminEmail:"AdminInfo.Email",
        registerOn:"RegisterInfo.Time",
        registerBy:"RegisterInfo.ByEmail"
    });
    var ret=qr.toPageSync(args.data.pageIndex,args.data.pageSize);
    cb(null,ret);
});
module.exports=fn;