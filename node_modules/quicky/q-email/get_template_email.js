var locks = require('locks'); 
var fs=require("fs")
var path=require("path")
var sync=require("../q-sync")
var default_template_dir
var collOfEmailItems
var collTemplateName
var settingsCollection;
var db
var cache={}
var _tempSettings;
const MongoClient = require('mongodb').MongoClient;
function checkDirectorySync(directory) {  
    try {
      fs.statSync(directory);
    } catch(e) {
      fs.mkdirSync(directory);
    }
  }
function setConfig(url,collection,settingsCollectionName,collectionTemplateName,_default_template_dir){
    var dbName=url.split('/')[url.split('/').length-1];
        var cnn=sync.sync(MongoClient.connect,[url]);
        db= cnn.db(dbName);
        collOfEmailItems=db.collection(collection);
        collTemplateName=collectionTemplateName
        default_template_dir=_default_template_dir
        settingsCollection=db.collection(settingsCollectionName);


}
function getRawSchemaFromData(data,field){
    if(data===undefined ||data===null){
        return [];
    }
    if(data instanceof Array 
    && data.length>0){
        return getRawSchemaFromData(data[0])
    }
    var keys=Object.keys(data);
    var ret=[]
    keys.forEach(function(key){
        if(!(data[key] instanceof Date) &&(typeof data[key]==="object")){
            var k=getRawSchemaFromData(data[key],key)
            k.forEach(function(x){
                if(field){
                    ret.push(field+"."+x)
                }
                else{
                    ret.push(x)
                }
            });
        }
    })
    return ret;

}
function get_template_email(
    prefix,
    template,
    default_suject,
    default_body,
    sample_data
){

    var key="prefix="+prefix+";template="+template
    if(cache[key]) {
        return cache[key]
    }
    var mutex = locks.createMutex();
    var ret={}
    mutex.lock(function(){
        var coll=db.collection(prefix+"."+collTemplateName);
        function findItem(cb){
            coll.findOne({
                template:{
                    $regex:new RegExp("^"+template+"$","i")
                }
            },cb)
        }
        function insertItem(cb){
            coll.insertOne({
                template:template,
                subject:default_suject,
                body:default_body,
                schema:getRawSchemaFromData(sample_data)
            },cb)
        }
        var item=sync.sync(findItem,[]);
        if(!item){
            var root=path.parse(require.main.filename).dir;
            checkDirectorySync(path.join(root,default_template_dir));
            checkDirectorySync(path.join(root,default_template_dir,template));
            var subjectFileName=path.join(root,default_template_dir,template,"subject.txt");
            var bodyFileName=path.join(root,default_template_dir,template,"body.txt");
            if(!fs.existsSync(subjectFileName)){
                fs.writeFileSync(subjectFileName, default_suject, 'utf8');
                
            }
            else {
                
                default_suject=fs.readSync(subjectFileName,'utf8')
            }
            if(!fs.existsSync(bodyFileName)){
                fs.writeFileSync(bodyFileName, default_body, 'utf8');
                
            }
            else {
                
                default_body=fs.readSync(bodyFileName,'utf8')
            }
            var retItem=sync.sync(insertItem,[]);
            ret.subject=default_suject;
            ret.body=default_body;
            cache[key]=ret;
        }
        else {
            ret.subject=item.subject;
            ret.body=item.body;
            cache[key]=ret;
        }
    });
    return cache[key]; 
}
function send(prefix,mailTo,subject,body,ccTo,data,cb){
    collOfEmailItems.insertOne({
        mail_to:mailTo,
        subject:subject,
        body:body,
        cc_to:ccTo,
        data:data,
        created_on_utc:new Date(),
        created_on:new Date(),
        sent_error:null,
        sent_on:null,
        prefix:prefix,
        has_error:false
    },cb)
}
function getSettings(callback){
    var ED=require("./ed");
    if(!settingsCollection){
        require("../q-exception").next(
            new Error("It looks like you forgot call 'setConffig' of quicky/q-email"),
            __filename
        )
    }
    return require("../q-sync").exec(function(cb){
        settingsCollection.findOne(function(ex,res){
            if(ex) cb(ex);
            else {
                if(res){
                    delete res._id;
                    if(res.password){
                        res.password=ED.decrypt(res.password);
                    }
                    _tempSettings=res;
                    cb(null,res);
                }
                else {
                    if(!res){
                        var item={
                            server:"",
                            username:"",
                            password:"",
                            port:0,
                            useSSL:true,
                            useDefaultCredentials:true,
                            email:""
                        }
                        settingsCollection.insertOne(item,function(ex,res){
                            if(ex) cb(ex);
                            else {
                                delete item._id;
                                _tempSettings=item;
                                cb(null,item);
                            }

                        });
                    }
                    else {
                        delete res._id;
                        _tempSettings=res;
                        cb(null,res);
                    }
                }
            }
        });
    },callback,__filename)
}
function setSettings(settings,callback){
    if(!settingsCollection){
        require("../q-exception").next(
            new Error("It looks like you forgot call 'setConffig' of quicky/q-email"),
            __filename
        )
    }
    var ED=require("./ed");
    require("../q-validator").validateRequire(
        {
            server:settings.server,
            username:settings.username,
            password:settings.password,
            port:settings.port,
            useSSL:settings.useSSL,
            useDefaultCredentials:settings.useDefaultCredentials,
            email:settings.email
        }
    );
    settings.password=ED.encrypt(settings.password)
    return require("../q-sync").exec(function(cb){
        settingsCollection.findOne(function(ex,res){
           if(ex) {cb(ex); return}
           if(!res){
               settingsCollection.insertOne(settings,function(ex,res){
                
                    cb(ex,res);
               });
           }
           else {
            settingsCollection.updateOne({}, {"$set": settings},function(ex,res){
                cb(ex,res);
            });
           }
        });
    },callback, __filename);
}
function sandBoxSetSettings(settings){
    require("../q-validator").validateRequire(
        {
            server:settings.server,
            username:settings.username,
            password:settings.password,
            port:settings.port,
            useSSL:settings.useSSL,
            useDefaultCredentials:settings.useDefaultCredentials,
            email:settings.email
        }
    );
    _tempSettings=settings;

}
function sandBoxSendEmail(subject,body,mailTo,callback){
    require("../q-validator").validateRequire(
        {
            subject:subject,
            mailTo:mailTo,
            body:body
        }
    );
    return require("../q-sync").exec(function(cb){
        var mailer = require("nodemailer");
        var smtpConfig = {
            host: _tempSettings.server,
            auth: {
                user: _tempSettings.username,
                pass: _tempSettings.password
            },
            // direct:true,
            port: _tempSettings.port,
            secure: _tempSettings.useSSL,
            use_authentication:!_tempSettings.useDefaultCredentials,
            tls: { rejectUnauthorized: false },
        };
        var smtpTransport = mailer.createTransport(smtpConfig);
        smtpTransport.verify(function(err){
            if (!err) {
                var mail = {
                    from: _tempSettings.email,
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

    },callback,__filename)
}
module.exports={
    get_template_email:get_template_email,
    setConfig:setConfig,
    send:send,
    getSettings:getSettings,
    setSettings:setSettings,
    sandBoxSetSettings:sandBoxSetSettings,
    sandBoxSendEmail:sandBoxSendEmail
}