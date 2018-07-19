function validateRequire(data){
    var keys=Object.keys(data);
    for(var i=0;i<keys.length;i++){
        if((data[keys[i]]===undefined)||(data[keys[i]]===null)){
            require("../q-exception").raise(
                __filename,
                "ParameterIsMissing",
                "Param '"+keys[i]+"' is missing",
                {
                    paramName:keys[i]
                }
            )
           
        }
    }
}
module.exports={
    validateRequire:validateRequire
}