module.exports=function(code,prefix){
    var ret=require("./../department")(prefix)
    .aggregate()
    .match("(MapPath=={0})&&(Code!={0})",code);
    return ret;

}