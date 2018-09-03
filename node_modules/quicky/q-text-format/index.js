module.exports=function(){
    if(arguments.length==0) return "";
    var ret=arguments[0];
    for(var i=1;i<arguments.length;i++){
        while(ret.indexOf("{"+(i-1)+"}")>-1){
            ret=ret.replace("{"+(i-1)+"}",arguments[i]);
        }
    }
    return ret;
}