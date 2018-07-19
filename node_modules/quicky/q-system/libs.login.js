var qUsers=require("./db.users");
var logger=require("../q-logger");
var func=require("../q-func-define")
var sha=require("sha256");
var findUser=require("./libs.findUser");
var createUser=require("./libs.createUser");
var dateTimeMdl=require("../q-date-time");
var sync=require("../q-sync");
var validators=require("../q-validator");
/**
 * 
 * @param {string} schema 
 * @param {string}username 
 * @param {string} password 
 * @param {function} callback 
 */
module.exports=function(
    schema,
    username,
    password,
    callback
){
    try {
        validators.validateRequire({
            schema:schema,
            username:username,
            password:password
        })
        return sync.exec(
            function(cb){
            var users=qUsers(schema)
                var user= users.findOne("Username=={0}",username);
                if(!user){
                    cb(null,{
                        error:{
                            code:"user_not_found",
                            message:"User was not found"
                        }
                     });
                     return
                }
                var hasPassword=sha.x2("uid="+username+";pwd="+password);
                if(hasPassword!=user.Password){
                    cb(null,{
                        error:{
                            code:"password_is_incorrect",
                            message:"Password is incorrect"
                        }
                    });
                    return;
                }
                var retUser=require("./libs.findUser")(
                    schema,
                    username
                );
                cb(null,retUser);
            
            
        },callback,__filename)
    } catch (error) {
        require("../q-exception").next(error,__filename);
    }
    
}