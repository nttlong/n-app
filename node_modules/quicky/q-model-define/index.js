const cache_key="__model-define__"
const cache_key_model="__model-define__model__"
global[cache_key_model]={}
function convertObjectToArrayKeyAndValue(data,field){
    data=extractFieldInfo(data);
    if(data.$type){
        return data;
    }
    else {
        var ret=[];
        Object.keys(data).forEach(function(key){
            var val=data[key];
            if(val.$type){
                var item={}
                var _keyField=(field)?(field+"."+key):key;
                if(field){
                    item[field+"."+key]=val;
                    ret.push(item);
                }
                else {
                    item[key]=val;
                    ret.push(item);
                }
                if(val.$type==="array"){
                    if(!val.$detail){
                        throw(new Error("\r\n The type of field '"+_keyField+"' is array, but detail was not declare:\r\n"+
                              "You can change to {$type:'array',$require:true|false, $details:<detial info of this field here ..>"))
                    }
                    if(typeof val.$detail==="string"){
                        ret.push(item);
                    }
                    else {
                        convertObjectToArrayKeyAndValue(val.$detail,key)
                        .forEach(function(ele){
                            
                            var item={}
                            if(field){
                                item[field+"."+Object.keys(ele)[0]]=ele[Object.keys(ele)[0]]
                            }
                            else {
                                item[Object.keys(ele)[0]]=ele[Object.keys(ele)[0]]
                            }
                            ret.push(item);
                        
                        })
                    }
                    
                }
            }
            
            else {
                var retData=ret;
                var retList=convertObjectToArrayKeyAndValue(val,key);
                retList.forEach(function(ele){
                    var item={};
                    var keys=Object.keys(ele);
                    if(field){
                        item[field+"."+keys[0]]=ele[keys[0]];
                    }
                    else {
                        item[keys[0]]=ele[keys[0]];
                    }
                    retData.push(item);
                });
                ret=retData;
            }
            
        });
        return ret;
    }
}
function checkIsPremetive(data){
    if(data===undefined){
        return true;
    }
    if(typeof data=="string"){
        return true;
    }
    if( typeof data=="boolean"){
        return true;

    }
    if( typeof data=="number"){
        return true;
        
    }
    if( data instanceof Date){
        return true;
        
    }
    return false;
    
}
function parseDataToArrayKeyAndValue(data,field){
    if(checkIsPremetive(data)){
        return data;
    }
    ret=[];
    Object.keys(data).forEach(function(key){
        var val=data[key];
        if(checkIsPremetive(val)){
            var item={}
            if(field){
                item[field+"."+key]=val;
                ret.push(item);
            }
            else {
                item[key]=val;
                ret.push(item);
            }
        }
        else {
            var retData=ret;
            var retList=parseDataToArrayKeyAndValue(val,key);
            retList.forEach(function(ele){
                var item={};
                var keys=Object.keys(ele);
                if(field){
                    item[field+"."+keys[0]]=ele[keys[0]];
                }
                else {
                    item[keys[0]]=ele[keys[0]];
                }
                retData.push(item);
            });
            ret=retData;
        }
        
    });
    return ret;

}
function getValueByPath(path,data){
    var items=path.split(".");
    var ret=data;
    for(var i=0;i<items.length;i++){
        if(!ret){
            return null;
        }
        ret=ret[items[i]];
    }
    return ret;
}
function extractFieldInfo(fields){
    var _fields={};
            Object.keys(fields).forEach(function(key){
                if(fields[key] instanceof Array){
                    _fields[key]={}
                    _fields[key]["$type"]=fields[key][0];
                    if(fields[key].length>1){
                        _fields[key]["$require"]=fields[key][1];
                    }
                }
                else {
                    if(typeof fields[key]==="string"){
                        _fields[key]={};
                        _fields[key]["$type"]=fields[key];
                    }
                    else {
                        if(fields[key].$type==="array"){
                            _fields[key]={};
                            if(!fields[key].$detail){
                                throw(new Error("\r\n\t'"+key+"' is array, but detail was not found\r\n"+
                                        "\t\t place $detail: <data type name> or object in which describe the detail info of this array"
                                        ));           
                            }
                            _fields[key]["$type"]="array";
                            if(typeof fields[key].$detail==="string"){
                                _fields[key]["$detail"]=fields[key].$detail;
                                _fields[key]["$require"]=fields[key].$require;
                            }
                            else {
                                _fields[key]["$detail"]=extractFieldInfo(fields[key].$detail);
                                _fields[key]["$require"]=fields[key].$require;
                            }
                        }
                        else if(typeof fields[key]==="object"){
                            _fields[key]=fields[key];
                        }
                    }
                }
            });
    return _fields;
}
function model(){
    function ret(){
        var me=this;
        me.fields=function(fields){
            me.meta={
                fields:{},
                indexes:[]
            };
            var _fields={};
            Object.keys(fields).forEach(function(key){
                var val=fields[key];
                _fields[key]={};
                if(typeof val==="string"){
                    _fields[key]["$type"]=val
                }
                else if(val instanceof Array){
                    _fields[key]["$type"]=val[0];
                    if(val.length>1){
                        _fields[key]["$require"]=val[1];
                    }
                }
                else {
                    _fields[key]=val;
                }

            });
            me.meta.fields=_fields
            me.meta.arrayFields=convertObjectToArrayKeyAndValue(_fields);
            me.meta.requireFields={};
            me.meta.fieldTypes={}
            me.meta.arrayFields.forEach(function(ele){
                var key=Object.keys(ele)[0];
                if(ele[key].$require || ele[key].$type==="array"){
                    me.meta.requireFields[key]=ele[key];
                    // me.meta.requireFields[key].$require=true;
                }
                me.meta.fieldTypes[key]=ele[key].$type;
            })
            return me;
            
        }
       
        me.getFields=function(){
            return me.meta.fields;
        }
        me.getIndexes=function(){
            return me.meta.indexes;
        }
        me.getFieldsAsArray=function(){
            return me.meta.arrayFields;
        }
        me.getRequireFieldsAsArray=function(fields){
            if(!fields){
                return me.meta.requireFields;
            }
            else {
                var f=convertObjectToArrayKeyAndValue(fields);
                var ret={}
                Object.keys(fields).forEach(function(key){
                    if(fields[key].$require){
                       ret[key]=fields[key];
                    }
                    
                })
                return ret;
            }
        }
        me.getFieldTypesAsArray=function(){
            return me.meta.fieldTypes;
        }
        me.validateRequireData=function(data,isPartial,checkFields){
            if(!isPartial){
                var ret=[];
                var ignoreFields={}
                var listOfRequireFields=Object.keys(checkFields||me.getRequireFieldsAsArray());
                listOfRequireFields.forEach(function(key){
                    if(!ignoreFields[key]){
                        var val=getValueByPath(key,data);
                        if((val===undefined)||(val===null)){
                            ret.push(key)
                        }
                        else if(me.getRequireFieldsAsArray()[key] && me.getRequireFieldsAsArray()[key].$type==="array" &&
                                val instanceof Array){
                                    listOfRequireFields.forEach(function(ele){
                                        if (ele.length>key.length &&  ele.substring(0,key.length+1)==(key+".")){
                                            ignoreFields[ele]=1;
                                        }
                                    });
                                    var details=me.getRequireFieldsAsArray()[key].$detail;
                                    var requireFields=me.getRequireFieldsAsArray(details);
                                for(var i=0;i<val.length;i++){
                                    var x=me.validateRequireData(val[i],false,requireFields);
                                    if (x.length>0){
                                        ret=[];
                                        x.forEach(function(ele){
                                            ret.push(key+"["+i+"]."+ele);
                                        });
                                        return x;
                                    }
                                }

                        }
                        else {
                            // console.log(key);
                        }
                    }
                });
                return ret;
            }
            else {
                var ret=[];
                var itemsData=parseDataToArrakKeyAndValue(data);
                var listOfRequireFields=me.getRequireFieldsAsArray();
                itemsData.forEach(function(item){
                    var key=Object.keys(item)[0];
                    if(listOfRequireFields[key] && ((!item[key])||(item[key]===null))){
                        ret.push(key)
                    }
                });
                return ret;
                
            }

        };
        me.validateDataType=function(data,isPartial){
            
            var ret=[];
            var listOfFields=me.getFieldsAsArray();
            var fields=me.getFields();
            listOfFields.forEach(function(ele){
                var key=Object.keys(ele)[0];
                
                val=getValueByPath(key,data);
                if((val!==undefined)&&(val!==null)){
                    type=ele[key].$type;
                    if(type==="text"){
                        if(typeof val!=="string"){
                            ret.push({field: key,dataType:type});
                        }
                    }
                    if(type==="date"){
                        if(!(val instanceof Date)){
                            ret.push({field: key,dataType:type});
                        }
                    }
                    if(type==="bool"){
                        if(typeof val!=="boolean"){
                            ret.push({field: key,dataType:type});
                        }
                    }
                    if(type==="number"){
                        if(typeof val!=="number"){
                            ret.push({field: key,dataType:type});
                        }
                    }
                    if(type==="array"){
                        if(!(val instanceof Array)){
                            ret.push({field: key,dataType:type});
                        }
                    }
                }
                
            });
            return ret;
        }
        me.toDictionArray=function(data){
            return parseDataToArrakKeyAndValue(data);
        };
        me.getValue=function(data,path){
            return getValueByPath(path,data);
        };
        me.validate=function(data){
            var validateRequireResult=me.validateRequireData(data);
            var validateDataTypeResult=me.validateDataType(data);
            if((validateDataTypeResult.length>0)||(validateRequireResult.length>0)){
                return {
                    missingItems:validateRequireResult,
                    invalidDataType:validateDataTypeResult
                }
            }
            return;
        }
    };
    return new ret();
}
module.exports=model;