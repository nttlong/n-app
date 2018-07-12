module.exports=require("quicky/q-controller")(__filename,function(){
    var model={
        username:"",
        password:"",
        error:null
    }
    return {
        load:function(sender,callback){
            
            var user=require("quicky/q-system/libs.findUser")(sender.req.tenancyCode,"sys");
            if(!user){
                var ret=require("quicky/q-system/libs.createUser")(sender.req.tenancyCode,"sys","sys","sys@sys.com.vn","system",true,true,"application");

            }
            sender.setValue(model);
            callback();
        },
        post:(sender,callback)=>{
            var ret=require("quicky/q-system").login(sender.req.tenancyCode,sender.postData.username,sender.postData.password);
            if((!ret)||(ret.error)){
                sender.setValue("username",sender.postData.username);

                sender.setValue("error","Login fail");
                callback();
                return;
            }
            ret=require("quicky/q-system/libs.signIn")(sender.req.tenancyCode,ret.username,sender.req.sessionID,sender.req.getLanguage());
            sender.req.setUser(ret);
            var url=sender.req.getAppUrl();
            sender.redirect(url);

            callback();
        }
    }
});