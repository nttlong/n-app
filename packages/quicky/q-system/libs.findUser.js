
var sync=require("../q-sync")

module.exports=function(schema,username,callback){
    return sync.exec(function(cb){
        var users=require("./db.users");
            var qr_user=users(schema);
            qr_user=qr_user.aggregate();
            qr_user=qr_user.match("Username=={0}",username);
            qr_user=qr_user.project({
                _id:0,
                userId:"_id",
                username:"Username",
                displayName:"DisplayName",
                isSysAdmin:"IsSysAdmin",
                issStaff:"IsStaff",
                email:"Email"
            });
            qr_user.toItem(function(err,result){
                var x=result;
                cb(err,result)
            })
    },
    callback,
    __filename
    )
}