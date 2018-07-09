var qs=require("querystring");
var sys=require("quicky/q-system");
var logger=require("quicky/q-logger")(__filename);
var sync=require("quicky/q-sync");
var q=require("quicky")
module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        var model={
            data:{
                username:"",
                password:"",
                errorMessage:""
            }
        }
        return {
            load:(s,d)=>{
                s.setValue(model);
                d();
    
            },
            post:(s,d)=>{
                var data=s.postData;
                var ret=q.sys.login(s.req.tenancySchema,data.username,data.password);
                if(!ret){
                    var app=q.apps.getAppByDir(__dirname);
                    var msg=q.language.getItem(s.reg.getLanguage(),app.name,"Login fail");
                    s.setValue("errorMessage",msg);
                    d();
                    return;
                }
                else {
                    var ret=q.sys.signIn(s.req.tenancySchema,data.username,s.req.sessionID,s.req.getLanguage());
                    s.req.setUser(ret);
                    if(s.req.query.next){
                        s.redirect(s.unescapeUrl(s.req.query.next));
                        d();
                        return
                    }
                    else {
                        s.redirect(s.unescapeUrl(s.req.getAppUrl()));
                        d();
                        return
                    }
                }
                d();

            }
        }
    }
)
module.exports1=require("quicky/q-view")(
    {
        username:["text",true],
        password:["text",true],
        language:{
            $type:"array",
            $detail:{
                code:["text",true],
                name:["text",true]
            }
        },
        error:{
            message:["text",true]
        }

    },
    function(sender){
        debugger;
        sender.setDataModel({
            username:"",
            password:"",
            language:[
                {
                    code:"vn",
                    name:"Tieng Viet"
                },{
                    code:"en",
                    name:"Enhlish"
                }
            ],
            error:{
                message:""
            }
        });
        sender.render();
    },
    function(sender){
        debugger;
        var language=require("quicky/q-language");
        var app=require("quicky/q-apps").getAppByDir(__dirname);
        try {
            var post=sender.postData;
            post.language=sender.req.getLanguage();
            post.schema=sender.schema;
            
            var retLogin=sys.login(sender.schema,post.username,post.password)
            if(!retLogin){
                sender.setDataModel("error",{
                    message:language.getItem(sender.req.getLanguage(),app.name,"-","Wrong username or password")
                })
                sender.render();
                return;
                
            }
            else{
                var ret=sys.signIn(
                    sender.schema,
                    retLogin.username,
                    sender.req.sessionID,
                    sender.req.getLanguage());
                    
                sender.req.setUser(ret);
                sender.res.redirect(sender.req.getAppUrl());
                return;
            }
        } catch (error) {
            throw(error);
        }
    },
    __filename
)


