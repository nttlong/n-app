var _ws_url_
var _wsOnBeforeCall;
var _wsOnAfterCall;
function ws_set_url(url){
    _ws_url_=url;
}
function ws_onBeforeCall(callback){
    _wsOnBeforeCall=callback
}
function ws_onAfterCall(callback){
    _wsOnAfterCall=callback
}
function ws_get_url(){
    return _ws_url_;
}
function ws_call(api_path,view_path,data,cb,owner){
    
    return new Promise(function(resolve,reject){
        
        owner.api_path=api_path;
        console.log("before")
        
        sender=undefined;
        if(_wsOnBeforeCall){
            owner.sender=_wsOnBeforeCall();
            console.log(owner)
        }
          var now = new Date()
          var offset_minutes = now.getTimezoneOffset()
          $.ajax({
            url: ws_get_url(),
            type: "post",
            dataType: "json",
            data: JSON.stringify({
                   path:api_path,
                   view:view_path,
                   data:data,
                   offset_minutes:offset_minutes


            }) ,
            success: function (res) {
                console.log("after")
                console.log(owner)
                if(_wsOnAfterCall){
                    _wsOnAfterCall(owner.sender)
                }
               if(cb){
                cb(undefined,res)
               }
               else{
                resolve(res)
               }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                if(_wsOnAfterCall){
                    _wsOnAfterCall(owner.sender)
                }
                var newWindow = window.open();
                var txt=jqXHR.responseText
                while(txt.indexOf(String.fromCharCode(10))>-1){
                    txt=txt.replace(String.fromCharCode(10),"<br/>")
                }
                newWindow.document.write(txt);
                if(cb){
                    cb({
                        error:{
                            type:"server"
                        }
                    })
                }
                else {
                reject({
                        error:{
                            type:"server"
                        }
                    })}

            }


        });

    })

}
function ws(scope){
    function ret(scope){
        var me=this;

        me.api=function(_api){
            function ret_api(_api){
                var _me=this;
                _me._api=_api;
                _me.data=function(_data){
                    _me._data=_data;
                    return _me;
                }
                _me.done=function(cb){
                       if(!scope.view_path){
                            throw("view_path is empty")
                       }
                       return ws_call(_me._api,scope.view_path,_me._data,cb,_me)

                }
            }

            return new ret_api(_api);
        }


    }
    return new ret(scope)
}
