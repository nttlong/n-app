var sys=require("quicky/q-system");
module.exports=function(args,cb){
    args.data.pageSize=args.data.pageSize||50;
    args.data.pageIndex=args.data.pageIndex||0;
    args.data.sortList=args.data.sortList||[];
    args.data.schema=args.schema;
    var ret= sys.listOfUsers.sync(args.data);
    cb(null,ret);
}