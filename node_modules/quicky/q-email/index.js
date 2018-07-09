var tmp=require("./get_template_email");
var Mustache=require("mustache");
var sync=require("../q-sync");
var sender=require("./sendEmail");
var isUseBackgroundService=false;
function send(
    prefix,
    tempalte,
    mailTo,
    defaultSubject,
    defaultBody,
    data,
    ccTo,
    cb
    
){
    var t=tmp.get_template_email(prefix,tempalte,defaultSubject,defaultBody,data);
    var subject=Mustache.render(t.subject,data);
    var body=Mustache.render(t.body,data);
    
    if(!isUseBackgroundService){
        sender.sendEmail(mailTo,subject,body,cb)
    }
    else {
        tmp.send(prefix,mailTo,subject,body,ccTo,data,cb);
    }


}
function sendSync(prefix,
    tempalte,
    mailTo,
    defaultSubject,
    defaultBody,
    data,
    ccTo){
        function run(cb){
            send(prefix,tempalte,mailTo,defaultSubject,defaultBody,data,ccTo,cb);
        }
        return sync.sync(run,[]);

    }
function setUseBackgroudService(val){
    isUseBackgroundService=val;
}
module.exports={
    setConfig:tmp.setConfig,
    setSettings:tmp.setSettings,
    getSettings:tmp.getSettings,
    sandBoxSendEmail:tmp.sandBoxSendEmail,
    sandBoxSetSettings:tmp.sandBoxSetSettings
    // getEmailConfig:tmp.getConfig,
    // getSettings:sender.getSettings,
    // getConfig:tmp.get_template_email,
    // setEmailConfig:sender.setConfig,
    // sendEmailConfig:sender.setConfig,
    // send:send,
    // sendSync:sendSync,
    // setUseBackgroudService:setUseBackgroudService
}