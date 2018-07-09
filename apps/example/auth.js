/**
 * Check auth
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
module.exports=
function authenticate(req,res,next){
    console.log("check auth in '"+__filename+"'")
    next();
}