var language=require("./../../models/languages");
module.exports=require("quicky/q-api").apiDefine(
    {
        pageSize:["number",true],
        pageIndex:["number",true],
        searchText:["text",true],
        filter:{
            app:["text",true],
            view:["text",true],
            language:["text",true]
        }
    },
    function(args,cb){
        var x=1;
        var y=1;
        var c=1;
        console.log("XXXXcc dasdas");
      
        var coll=language().aggregate();
        if(args.data.searchText!=""){
            
            coll.match("contains(Value,{0})",args.data.searchText);
        }
        var ret=coll.toPageSync(args.data.pageIndex,
            args.data.pageSize);
        cb(null,ret)
    }
)