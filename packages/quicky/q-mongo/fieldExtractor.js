function extractFields(expr){
    var ret={
        fields:[],
        originExpr:expr
    }
    var _expr=expr;
    var regEx=/\$\(([^\$)]+)\)/i;
    var regExIndex=/\[([^\]\[]+)\]/i;
    var item=regEx.exec(_expr);
    while(item!=null){
        while(_expr.indexOf(item[0])>-1){
            _expr=_expr.replace(item[0],item[1]);
        }
        var m=regExIndex.exec(item[1]);
        while(m!=null){
            while(item[1].indexOf(m[0])>-1){
                item[1]=item[1].replace(m[0],"");
            }
            m=regExIndex.exec(item[1]);
        }
        ret.fields.push(item[1]);
        item=regEx.exec(_expr);
    }
    ret.expr=_expr;
    return ret;
}
module.exports={
    extractFields:extractFields
}