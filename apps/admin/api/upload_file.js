module.exports=function(args,cb){
    console.log(args.data);
   try {
        cb(null,{
            data:{id:"1"}
        });   
   } catch (error) {
       cb(error);
   }
    

}