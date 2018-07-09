function api_define(fields,callback){
    return require("quicky/q-func-define")(
        {
            data:fields,
            offset_minutes:["number",true],
            path:["text",true],
            view:["text",true],
            username:["text",true],
            language:["text",true],
            appName:["text",true],
            sessionId:["text",true],
            isAnonymous:["bool",true]
    
        },callback
    )
}
module.exports=api_define