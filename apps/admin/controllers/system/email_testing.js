module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        return {
            ajax:{
                testSendEmail:(s,d)=>{
                    var settings=s.postData.settings;
                    var data=s.postData.data;
                    var email=require("quicky/q-email");
                    email.sandBoxSetSettings(settings);
                    try {
                        var ret=email.sandBoxSendEmail(data.Subject,data.Body,data.MailTo);
                        s.setValue({
                            result:true
                        });
                        d();    
                    } catch (error) {
                        s.setValue({
                            result:false,
                            error_message:error.message
                        });
                        d();
                    }
                    
                }
            }
        }
    }
)