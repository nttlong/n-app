var api=require("../q-api");
var tenancy=require("./tenancy");
var sync=require("../q-sync");
var path=require("path");
var ECT = require('ect');
var LANGUAGE=require("../q-language");
var caching={};
var session_caching={}
var logger=require("../q-logger")(__filename);
var sessionCache=require("./session-cache");
function getAppByDir(dir){
    if(caching[dir]){
        return caching[dir];
    }
    var apps=global["___n-apps___caching"];
    var findItem=apps.find(function(ele){
        var fullPath=path.join(process.cwd(),ele.app.dir);
        return dir.toLowerCase()==fullPath.toLowerCase();
    });
    if(findItem){
        caching[dir]=findItem.app;
    }
    return caching[dir];
}
/**
 * this function will add to http request method and property in below list:
 * 
 */
function applyRequest(req,res,me,owner){
    if(req.tenancyCode===undefined){
        req.tenancyCode=tenancy.getDefaultTenancy()||"";
        req.tenancySchema=tenancy.getDefaultSchema()||"";
    }
    else {
        req.tenancySchema=tenancy.getSchema(req.tenancyCode)
    }
    
    
    if(!req.__abs_url__){
        
        var requrl = req.protocol+"://"+req.get('host');
        req.__abs_url__= requrl;
    }
    if(!me._workingDir){
        throw("It look like you forgot 'setDir' when call urls(router)\r\n Please review at application dir router.js and place .setTemplateDir(__dirname) at urls")
    }
    if(!me.app){
        me.app=getAppByDir(me._workingDir);
    }
    var scriptTags={
        ajax:function(){
            return "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/ajax.js\"></script>";
        },
        angualar:function(){
            return "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/angular.min.js\"></script>";
        },
        jquery:function(){
            return "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/jquery-3.3.1.min.js\"></script>";
        },
        ui:function(){
            return "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/ui.js\"></script>";
        },
        all:function(){
            return "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/jquery-3.3.1.min.js\"></script>"+
                    "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/angular.min.js\"></script>"+
                    "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/ui.js\"></script>"+
                    "<script src=\""+req.protocol+"://"+req.get('host')+"/site-static/ajax.js\"></script>";
        }
    }
    
    var getAbsUrl=function(){
        
        return req.__abs_url__;
    }
    var getAppUrl=function(file){
        if(me.app.hostDir){
            if(req.tenancyCode){
                return getAbsUrl()+"/"+req.tenancyCode+"/"+me.app.hostDir+(file?("/"+file):"");
            }
            else {
                return getAbsUrl()+"/"+me.app.hostDir+(file?("/"+file):"");
            }
            
        }
        else {
            if(req.tenancyCode){
                return getAbsUrl()+"/"+req.tenancyCode+(file?("/"+file):"");
            }
            else {
                return getAbsUrl()+(file?("/"+file):"");
            }
        }
    }
    var getAppStatic=function(file){
        if(req.tenancyCode){
            if(me.app.hostDir){
                return getAbsUrl()+"/"+req.tenancyCode+"/"+me.app.hostDir+"/static/"+file;
            }
            else {
                return getAbsUrl()+"/"+req.tenancyCode+"/static/"+file;
            }
        }
        else {
            if(me.app.hostDir){
                return getAbsUrl()+"/"+me.app.hostDir+"/static/"+file;
            }
            else {
                return getAbsUrl()+"/static/"+file;
            }
        }
    }
    var getLanguage=function(){
        return "en";
    }
    var getGlobalRes=function(key,value){
        return LANGUAGE.getItem(getLanguage(),"-","-",key,value);
    }
    var getAppRes=function(key,value){
        return LANGUAGE.getItem(getLanguage(),me.app.name,"-",key,value);
    }
    var getRes=function(key,value){
        return LANGUAGE.getItem(getLanguage(),me.app.name,owner.fileName,key,value);
    }
    var getCurrentUrl=function(){
        var _url=req.url.split('?')[0];
        return req.getAppUrl(_url.substring(1,_url.length))
    }
    var setUser=function(user){
        var key=req.sessionID+"://user";
        if(sessionCache.getIsUseMemCache()){
            sessionCache.sessionCacheSet(key,user);
        }
        else {
            session_caching[key]=user;
        }
        // req.__user__=user;
    }
    var getUser=function(){
        var key=req.sessionID+"://user";
        if(sessionCache.getIsUseMemCache()){
            return sessionCache.sessionCacheGet(key);
        }
        else {
            return session_caching[key];
        }
    }
    var escapeUrl=function(url){
        return encodeURIComponent(escape(url));
    }
    var unescapeUrl=function(url){
        return unescape(decodeURIComponent(url));
    }
    var getViewPath=function(){
        return req.__viewPath||owner.fileName
    }
    var setViewPath=function(path){
        req.__viewPath=path;
    }
    var loadModule=function(path){
        if(path.substring(0,2)=="./"){
            var PATH=require("path")
            return require(PATH.parse(require.main.filename).dir+"/"+ path);
        }
        else {
            return require(path);
        }
    }
    var getApi=function(path){
        return api.getKey(me.app.hostDir+"@"+path)
    }
    var getFullUrl=function(){
        return req.getAppUrl(req.url.substring(1,req.url.length))
    }
   
    var renderModel={
        getAbsUrl:getAbsUrl,
        getAppUrl:getAppUrl,
        getAppStatic:getAppStatic,
        application:me.app,
        getGlobalRes:getGlobalRes,
        getAppRes:getAppRes,
        getRes:getRes,
        request:req,
        getCurrentUrl:getCurrentUrl,
        getUser:getUser,
        setUser:setUser,
        getViewPath:getViewPath,
        setViewPath:setViewPath,
        loadModule:loadModule,
        getApi:getApi,
        getFullUrl:getFullUrl,
        escapeUrl:escapeUrl,
        unescapeUrl:unescapeUrl,
        scriptTags:scriptTags
    };
    req.render=function(model){
        try {
            function renderTemplate(cb){
                if(!me.app._mdl.render){
                    var renderer = ECT({ root : path.join(me._workingDir,me.app._templateDir||"views"), ext : '.html' });
                    renderer.render(owner.fileName, renderModel, function (error, html) {
                        cb(error, html);
                    });
                }
                else {
                    me.app._mdl.render(owner.fileName, renderModel,function(error,html){
                        cb(error, html);
                    });
                }
                
            }
            renderModel.model=model;
            var ret=sync.sync(renderTemplate,[]);
            res.end(ret);
        } catch (error) {
            logger.error(error);
            throw(error);
        }
       
    }
    req.getFullUrl=getFullUrl;
    req.getLanguage=getLanguage;
    req.getAbsUrl=getAbsUrl;
    req.getAppUrl=getAppUrl;
    req.getAppStatic=getAppStatic;
    req.application=me.app;
    req.getGlobalRes=getGlobalRes;
    req.getAppRes=getAppRes;
    req.getRes=getRes;
    req.getCurrentUrl=getCurrentUrl;
    req.setUser=setUser;
    req.getUser=getUser;
    req.getViewPath=getViewPath;
    req.setViewPath=setViewPath;
    req.escapeUrl=escapeUrl;
    req.unescapeUrl=unescapeUrl;
}
module.exports= {
    applyRequest:applyRequest,
    getAppByDir:getAppByDir
}