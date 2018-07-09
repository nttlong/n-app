var users=require("./db.users");
var sha=require("sha256");
var findUser=require("./libs.findUser")
var sync=require("../q-sync")
/**
 * Create new user
 * @param {schema} schema
 * @param {*} username 
 * @param {*} password 
 * @param {*} email 
 * @param {*} displayName 
 * @param {*} isSysAdmin 
 * @param {*} isStaff 
 * @param {*} createdBy 
 * @param {*} callback 
 */
module.exports=function(
    schema,
    username,
    password,
    email,
    displayName,
    isSysAdmin,
    isStaff,
    createdBy,
    callback){
        require("../q-validator").validateRequire({
            schema:schema,
            username:username,
            password:password,
            email:email,
            displayName:displayName
        })
        return sync.exec(function(cb){
            var hashPassword= sha.x2("uid="+username+";pwd="+password);
            var ret=users(schema).insertOne({
                Username:username,
                Password:hashPassword,
                ActivationTimeList:[],
                DisplayName:displayName,
                IsSysAdmin:isSysAdmin,
                LoginTimeList:[],
                LoginFailTimeList:[],
                IsStaff:isStaff,
                TotalLoginFail:0,
                Email:email

            });
            cb(null,ret)
            
            
        },callback,__filename)
    };