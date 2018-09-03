const mathjs=require("mathjs")
const operators={
    ">":"$gt",
    ">=":"$gte",
    "<":"$lt",
    "<=":"$lte",
    "==":"$eq",
    "!=":"$ne",
    "*":"$multiply",
    "+":"$add",
    "-":"$subtract",
    "/":"$divide",
    "%":"$mod",
    "and":"$and",
    "or":"$or"

};
/*

Name	Description
$avg	Returns an average of numerical values. Ignores non-numeric values.
$first	Returns a value from the first document for each group. Order is only defined if the documents are in a defined order.
$last	Returns a value from the last document for each group. Order is only defined if the documents are in a defined order.
$max	Returns the highest expression value for each group.
$min	Returns the lowest expression value for each group.
$push	Returns an array of expression values for each group.
$addToSet	Returns an array of unique expression values for each group. Order of the array elements is undefined.
$stdDevPop	Returns the population standard deviation of the input values.
$stdDevSamp	Returns the sample standard deviation of the input values.
$sum
*/
const avg_funcs={
    $avg:1,
    $first:1,
    $last:1,
    $max:1,
    $min:1,
    $push:1,
    $addToSet:1,
    $stdDevPop:1,
    $stdDevSamp:1,
    $sum:1,
    $literal:1
}
const functions={
    "multiply":"$multiply"
};
function get_expr(fx,params){
    if(fx.fn && fx.fn==="unaryMinus"){
        return -1*fx.args[0];
    }
    if(fx===undefined) {
        return null;
    }
    var regEx=/\_\$\_get\_index\_\$\_\d+\_\$/i;
    var regExNumber=/\d+/;
    if(fx.content){
        return get_expr(fx.content,params);
    }
    if(fx.value && (!fx.fn)){
        return fx.value;
    }
    if(fx.name  && (!fx.fn)){
        var field=fx.name;
        var m=regEx.exec(field);
        while(m!=null){
            var n=regExNumber.exec(m[0]);
            if(n!=null){
                field=field.replace(m[0],"["+n[0]+"]");
            }
            m=regEx.exec(field);
        }
        while(field.indexOf("_$$$$_dot_$$$$_")>-1){
            field=field.replace("_$$$$_dot_$$$$_",".")
        }
        return "$"+field;
    }
    
    if(fx.op){
        return {
            fn:operators[fx.op],
            params:[get_expr(fx.args[0],params),get_expr(fx.args[1],params)]
        };
    }
    if(fx.fn){
        if(fx.fn=="get_param"){
            return params[fx.args[0]];
        }
        else {
            var  _params=[];
            fx.args.forEach(element => {
                _params.push(get_expr(element,params))
            });
            return {
                fn:"$"+fx.fn,
                params:_params
            };
        }
    }
    c=fx


};
function get_left(fx,params){
    var regEx=/\_\$\_get\_index\_\$\_\d+\_\$/i;
    var regExNumber=/\d+/;
    if(fx.value){
        throw("It look like, the left-hand side of the expression is not a field name ")
    }
    if(fx.content){
        fx=fx.content;
    }
    if(fx.name){
        var field=fx.name;
        var m=regEx.exec(field);
        while(m!=null){
            var n=regExNumber.exec(m[0]);
            if(n!=null){
                field=field.replace(m[0],"["+n[0]+"]");
            }
            m=regEx.exec(field);
        }
        while(field.indexOf("_$$$$_dot_$$$$_")>-1){
            field=field.replace("_$$$$_dot_$$$$_",".")
        }
        return field;
    }
    else {
        return {
            op:operators[fx.op],
            left:get_left(fx.args[0],params),
            right:get_right(fx.args[1],params)
        }
    }
    x=fx;
}
function get_right(fx,params){
    var regEx=/\_\$\_get\_index\_\$\_\d+\_\$/i;
    var regExNumber=/\d+/;
    if(fx.content){
        fx=fx.content;
    }
    if(fx.value){
        return fx.value;
    }
    if(fx.fn && fx.fn=="get_param"){
        return params[fx.args[0]];
    }
    else {
        return {
            op:operators[fx.op],
            left:get_left(fx.args[0],params),
            right:get_right(fx.args[1],params)
        };
    }
    x=fx;
}
function compileCond(fx,params){
    if(fx.params.length!=3){
        throw(new Error("call cond with miss matching parameters"))
    }
    return {
        $cond: {
             if: convertToMongodbSelector(fx.params[0]),
              then: convertToMongodbSelector(fx.params[1]),
              else: convertToMongodbSelector(fx.params[2]) 
            }
    }
}
function compileCase(fx){
    if((!fx.params) ||(fx.params.length!=2)){
        throw(new Error("case expression require 2 params. The first is logical expression and the second is culculate expression"))
    }
    return {
        $case:{
            case:convertToMongodbSelector(fx.params[0]),
            then:convertToMongodbSelector(fx.params[1])
        }
    }
}
function compileSwicth(fx){
    var ret= {
        $switch:{
            branches:[],
            default:convertToMongodbSelector(fx.params[fx.params.length-1])
        }
    }
    for(var i=0;i<fx.params.length-1;i++){
        var retCase=convertToMongodbSelector(fx.params[i]);
        if(!retCase.$case){
            throw(new Error("switch missing case"))
        }
        ret.$switch.branches.push(retCase.$case)
    }
    return ret;
}
function convertToMongodbSelector(fx,params){
    if(fx.fn && fx.fn==="$case"){
        return compileCase(fx);
    }
    if(fx.fn && fx.fn==="$cond"){
        return compileCond(fx);
    }
    if(fx.fn && fx.fn==="$switch"){
        return compileSwicth(fx);
    }
    if (typeof fx =="string"){
        return fx
    }
    if(typeof fx =="number"){
        return fx;
    }
    var ret={}
    var _params=[];
    fx.params.forEach(element => {
        _params.push(convertToMongodbSelector(element))
    });
    if(avg_funcs[fx.fn]){
        ret[fx.fn]=_params[0];
    }
    else {
        ret[fx.fn]=_params;
    }
    return ret;
}
function convertToMongodbWhere(fx){
    logical={
        "$and":1,
        "$or":1
    };
    var ret={};
    if(fx.op=="$eq" && typeof fx.right=="string"){
        ret={};
        ret[fx.left]={
            "$regex":new RegExp("^"+fx.right+"$","i")
        }
        return ret;
    }
    if(logical[fx.op]){
        ret[fx.op]=[
            convertToMongodbWhere(fx.left),
            convertToMongodbWhere(fx.right)
        ];
        return ret;
    }
    else if(fx.op==="contains"){
        ret[fx.left]={}
        ret[fx.left]={$regex: new RegExp(fx.right,"i")};
        return ret;
    }
    else {
        ret[fx.left]={}
        ret[fx.left][fx.op]=fx.right;
        return ret;
    }
    



}
function selector(expr,params){
    var regExIndex=/\[([^\]\[]+)\]/i;
    var m=regExIndex.exec(expr);
    while(m!=null){
        while(expr.indexOf(m[0])>-1){
            expr=expr.replace(m[0],"_$$_get_index_$_"+m[1]+"_$");
        }
        m=regExIndex.exec(expr);
    }
    var pr=params;
    var _expr=expr
    while(_expr.indexOf(".")>-1){
        _expr=_expr.replace(".","_$$$$$$$$_dot_$$$$$$$$_")
    }
    while(_expr.indexOf("&&")>-1){
        _expr=_expr.replace("&&"," and ");
    }
    while(_expr.indexOf("||")>-1){
        _expr=_expr.replace("||"," or ");
    }
    if (params instanceof Array){
        pr=[];
        var index=0;
        params.forEach(element => {
            while(_expr.indexOf("{"+index+"}")>-1){
                _expr=_expr.replace("{"+index+"}","get_param("+index+")");
            }
            index++;
            pr.push(element);
        });

    }
    else{
        if(params){
            var pr=[];
            var index=0;
            Object.keys(params).forEach(key=>{
                pr.push(params[key]);
                while(_expr.indexOf("@"+key)>-1){
                    _expr=_expr.replace("@"+key,"get_param("+index+")");

                }
                index++

            });
        }
    }
    var x=mathjs.parse(_expr);
    var ret_expr= get_expr(x,pr);
    var ret=convertToMongodbSelector(ret_expr,params);
    return ret;

}
function filter(expr,params){
    if((!(params instanceof Array))&&
    (!(params instanceof Date))&&
    (typeof params!=="object")){
        params=[params];
    }

    var pr=params;
    var _expr=expr
    var regExIndex=/\[([^\]\[]+)\]/i;
    var m=regExIndex.exec(_expr);
    while(m!=null){
        while(_expr.indexOf(m[0])>-1){
            _expr=_expr.replace(m[0],"_$$_get_index_$_"+m[1]+"_$");
        }
        m=regExIndex.exec(_expr);
    }
    while(_expr.indexOf(".")>-1){
        _expr=_expr.replace(".","_$$$$$$$$_dot_$$$$$$$$_")
    }
    while(_expr.indexOf("&&")>-1){
        _expr=_expr.replace("&&"," and ");
    }
    while(_expr.indexOf("||")>-1){
        _expr=_expr.replace("||"," or ");
    }
    if (params instanceof Array){
        pr=[];
        var index=0;
        params.forEach(element => {
            while(_expr.indexOf("{"+index+"}")>-1){
                _expr=_expr.replace("{"+index+"}","get_param("+index+")");
            }
            index++;
            pr.push(element);
        });

    }
    else{
        if(params){
            var pr=[];
            var index=0;
            Object.keys(params).forEach(key=>{
                pr.push(params[key]);
                while(_expr.indexOf("@"+key)>-1){
                    _expr=_expr.replace("@"+key,"get_param("+index+")");
                }
                index++

            });
        }
    }
    var x=mathjs.parse(_expr);
    if(x.name==="contains"){
        var ret_expr= {
            op:x.name,
            left:get_left(x.args[0],pr),
            right:get_right(x.args[1],pr)
        };
        
    }
    else    if(x.args){
        var ret_expr= {
            op:operators[x.op],
            left:get_left(x.args[0],pr),
            right:get_right(x.args[1],pr)
        };
    }
    else {
        throw("It look like \r\n"+expr+"\r\n is not a logical expression");
    }
    var ret=convertToMongodbWhere(ret_expr);
    return ret;


}
function vertExprAndParams(expr,params){
    var regExIndex=/\[([^\]\[]+)\]/i;
    var m=regExIndex.exec(expr);
    while(m!=null){
        while(expr.indexOf(m[0])>-1){
            expr=expr.replace(m[0],"_$$_get_index_$_"+m[1]+"_$");
        }
        m=regExIndex.exec(expr);
    }
    var pr=params;
    var _expr=expr
    while(_expr.indexOf(".")>-1){
        _expr=_expr.replace(".","_$$$$$$$$_dot_$$$$$$$$_")
    }
    while(_expr.indexOf("&&")>-1){
        _expr=_expr.replace("&&"," and ");
    }
    while(_expr.indexOf("||")>-1){
        _expr=_expr.replace("||"," or ");
    }
    if (params instanceof Array){
        pr=[];
        var index=0;
        params.forEach(element => {
            while(_expr.indexOf("{"+index+"}")>-1){
                _expr=_expr.replace("{"+index+"}","get_param("+index+")");
            }
            index++;
            pr.push(element);
        });

    }
    else{
        if(params){
            var pr=[];
            var index=0;
            Object.keys(params).forEach(key=>{
                pr.push(params[key]);
                while(_expr.indexOf("@"+key)>-1){
                    _expr=_expr.replace("@"+key,"get_param("+index+")");

                }
                index++

            });
        }
    }
    return {
        expr:_expr,
        params:pr
    };
}
function getFieldsFromExpr(fx){
    if(fx.type==="AssignmentNode"){
        var x= getFieldsFromExpr(fx.value);
        var ret=[]
        x.forEach(function(ele){ ret.push(ele) });
        ret.push(fx.name);
        return ret;
    }
    if(fx.type==="SymbolNode"){
        return [fx.name]
    }
    if(fx.type==="ParenthesisNode"){
        var x= getFieldsFromExpr(fx.content);
        var ret=[]
        x.forEach(function(ele){ ret.push(ele) });
        return ret;
    }
    if(fx.type==="OperatorNode" || 
        fx.type==="OperatorNode" ||
        fx.type==="FunctionNode"){
        var ret=[];
        fx.args.forEach(function(ele){
            var x=getFieldsFromExpr(ele);
            if(x){
                x.forEach(function(ele){ ret.push(ele) });
            }
            
            
        });
        return ret;
    }
}   
function extractFields(expr,params){
    var regEx=/\_\$\_get\_index\_\$\_\d+\_\$/i;
    var regExNumber=/\d+/;
    var ret=vertExprAndParams(expr,params);
    var fx=mathjs.parse(ret.expr);
    var retFields= getFieldsFromExpr(fx);
    var result=[];
    if(!retFields) return [];
    retFields.forEach(function(x){
        var v=x;
        while(v.indexOf("_$$$$_dot_$$$$_")>-1){
            v=v.replace("_$$$$_dot_$$$$_",".")
        }
        var m=regEx.exec(v);
        while(m!=null){
            var n=regExNumber.exec(m[0]);
            if(n!=null){
                v=v.replace(m[0],"");
            }
            m=regEx.exec(v);
        }
        result.push(v);
    })
    return result;
}
function getUnknownFields(fields,expr,params){
    var xFields=extractFields(expr,params);
    var ret=[];
    xFields.forEach(function(x){
        for(var i=0;i<fields.length;i++){
            if(typeof fields[i]==="object" && Object.keys(fields[i])[0]===x){
                break;
            }
            else if(typeof fields[i]==="string"){
                break;
            }
        }
        if(i>=fields.length){
            ret.push(x)
        }
    });
    return ret;
}
module.exports={
    selector:selector,
    filter:filter,
    extractFields:extractFields,
    getUnknownFields:getUnknownFields
}