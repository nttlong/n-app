var mailer = require("nodemailer");
var smtpConfig = {
    host: "",
    auth: {
        user: "",
        pass: ""
    },
    // direct:true,
    port: 0,
    secure: false,
    use_authentication:true,
    tls: { rejectUnauthorized: false },
};
var fromEmail
function setConfig(
    mailServer,
    port,
    useSSL,
    useDefaultCredentials,
    username,
    Password,
    email
){
    smtpConfig.auth.user=username;
    smtpConfig.auth.pass=Password;
    smtpConfig.host=mailServer;
    smtpConfig.port=port,
    smtpConfig.secure=useSSL;
    smtpConfig.use_authentication=!useDefaultCredentials;
    fromEmail=email
}
function getConfig(){
    if(!fromEmail){
        return;
    }
    return {
        username:smtpConfig.auth.user,
        password:smtpConfig.auth.pass,
        port:smtpConfig.port,
        useSSL:smtpConfig.secure,
        useDefaultCredentials:!smtpConfig.use_authentication,
        email:fromEmail
    }
}
function sendEmail(mailTo,subject,body,cb){
    var smtpTransport = mailer.createTransport(smtpConfig);
    smtpTransport.verify(function(err){
        if (!err) {
            var mail = {
                from: fromEmail,
                to: mailTo,
                subject: subject,
                text: body,
                html: body
            };
            smtpTransport.sendMail(mail, function (err, res) {
                cb(err,res)
            });
        }
        else {
            cb(err);
        }
    });
}
module.exports={
    setConfig:setConfig,
    sendEmail:sendEmail,
    getConfig:getConfig
}