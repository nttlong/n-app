var logger=require("../q-logger")(__filename);
var DB=require("mongodb");
var binder_cache={};
var binder_set_value={};
function convertObjectToArrayKeyAndValue(data,field,modelName){
    if(data instanceof Array){
        throw(new Error(JSON.stringify(data)+"is array"))
    }
    try {
        if(data.$type){
            return data;
        }
        else {
            var ret=[];
            Object.keys(data).forEach(function(key){
                var val=data[key];
                if(val.$type){
                    if(typeof val.$type!="string"){
                        var msg="\r\nWhat is '"+JSON.stringify(val.$type)+"'?\r\n"+
                        "Please refer '"+((field)?(field+"."+key):key)+" of '"+modelName+"'";
                        throw(new Error(msg))
                    }
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
    } catch (error) {
        logger.error(error);
        throw(error)
    }
    
}
/**
 * 
 * @param {Check this value is primitive type} data 
 */
function checkIsPrimitiveType(data){
    if(data===null){
        return true;
    }
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
    if( data instanceof DB.ObjectID){
        return true;
        
    }
    return false;
    
}
function parseDataToArrayKeyAndValue(data,field){
    if(checkIsPrimitiveType(data)){
        return data;
    }
    var ret=[];
    if(data instanceof Array){
        for(var i=0;i<data.length;i++){
            var val=data[i];
            var x=parseDataToArrayKeyAndValue(val);
            if(!(x instanceof Array)){
                var item={}
                item[field]=x;
                ret.push(item);
            }
            else {
                x.forEach(function(f){
                    
                    ret.push(field+"."+f);
                })
            }
            
        }
        return ret;
    }
    Object.keys(data).forEach(function(key){
        var val=data[key];
        if(checkIsPrimitiveType(val)){
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
/**
 * Get value of property that is determine by path (not apply for array data)
 * @param {Path to property} path 
 * @param {Data to get value} data 
 */
function getValueByPath(path,data){
    if(!binder_cache[path]){
        binder_cache[path]=Function("data"," return data."+path);
    }
    try {
        return binder_cache[path](data);
    } catch (error) {
        return undefined;
    }
}
/**
 * Set value for one property by path to property of object;
 * @param {Path point to property in data} path 
 * @param {*} data 
 * @param {*} val 
 */
function setValueByPath(path,data,val){
    if(!binder_set_value[path]){
        var items=path.split('.');
        var txtFunc="";
        var txtEle="data";
        for(var i=0;i<items.length-1;i++){
            txtEle=txtEle+"."+items[i];
            txtFunc+="if(!"+txtEle+") "+txtEle+"={};\r\n";
        }
        txtEle+="."+items[items.length-1]
        txtFunc+=txtEle+"=val;\r\n;return data;\r\n";
        binder_set_value[path]=Function("data,val",txtFunc);
    }
    return binder_set_value[path](data,val);


}
function extractFieldInfo(fields){
    var _fields={};
            Object.keys(fields).forEach(function(key){
                if(key==="_id"){
                    _fields[key]={}
                    _fields[key]["$type"]="ObjectId";
                }
                else if(fields[key] instanceof Array){
                    _fields[key]={}
                    _fields[key]["$type"]=fields[key][0];
                    if(fields[key].length>1){
                        _fields[key]["$require"]=fields[key][1];
                    }
                    if(fields[key].length>2){
                        _fields[key]["$default"]=fields[key][2];
                    }
                }
                else {
                    if(typeof fields[key]==="string"){
                        _fields[key]={};
                        _fields[key]["$type"]=fields[key];
                    }
                    else if(fields[key].$type==="object"){
                        
                        if(!fields[key].$require){
                            _fields[key]={};
                            _fields[key]["$type"]="object";
                            _fields[key]["$detail"]=extractFieldInfo(fields[key].$detail);
                            _fields[key]["$require"]=fields[key].$require;
                        }
                        else {
                            
                            var retDetails=extractFieldInfo(fields[key].$detail,key)
                            Object.keys(retDetails).forEach(function(k){
                                _fields[key+"."+k]=retDetails[k];
                            });
                        }
                        
                    }
                    else {
                        if(fields[key].$type==="array"){
                            _fields[key]={};
                            if(!fields[key].$detail){
                                throw("\r\n\t'"+key+"' is array, but detail was not found\r\n"+
                                        "\t\t place $detail: <data type name> or object in which describe the detail info of this array"
                                        );           
                            }
                            _fields[key]["$type"]="array";
                            _fields[key]["$detail"]=extractFieldInfo(fields[key].$detail);
                            _fields[key]["$require"]=fields[key].$require;
                        }
                        else {
                            if((typeof fields[key]==="object")&& 
                            (fields[key].$type!==undefined) &&
                            ((fields[key].$type!=="object")||
                            (fields[key].$type!=="array"))){
                                _fields[key]=fields[key];
                            }
                            else {
                                _fields[key]=extractFieldInfo(fields[key]);
                            }
                            
                        }
                    }
                }
            });
    return _fields;
}
global["___q-mongo/extens_helpers___"]={}
function model(name,base){
   
    if(!name){
        throw("\r\n\tWhat is your model name?\r\n"+
            "\tYou can call\r\n:"+
            "\tmodel(<your model name here>:text)\r\n"+
            "\t.fields(<fields of models here>:object)\r\n"+
            "\t.indexes(<index of model>:array of object)\r\n"+
            "Then you can call:\r\n"+
            "\t\tgetFields():get list of fields\r\n"+
            "\t\tgetFieldsAsArray():get list of fields as key and information array\r\n"+
            "\t\tgetRequireFieldsAsArray():get list of require fields as array\r\n"+
            "\t\tgetFieldTypesAsArray():get list of {<field name>,<field type>}\r\n"+
            "\t\ttoDictionArray(<data>:object): parse data to key and value list\r\n"+
            "\t\tgetValue(<data>:object,path:string): get value of data by path of property. Exp: data={a:{b:1}},path='a.b' =>1 "
        )
    }
    if(global["___q-mongo/extens_helpers___"][name]){
        return global["___q-mongo/extens_helpers___"][name];
    }
    function ret(){
        var me=this;
        me.name=name;
        me.baseModel=undefined;
        if(base){
            me.baseModel=getModel(base);
        }
        var events=[
            "_onBeforeInsert",
            "_onAfterInsert",
            "_onBeforeUpdate",
            "_onAfterUpdate"
        ]
        events.forEach(function(name){
            me[name]=[];
        })
        if(me.baseModel){
            events.forEach(function(name){
                me.baseModel[name].forEach(function(f){
                    me[name].push(f);
                });
            })
        }
        me.fireOnBeforeInsert=function(data){
            if(me._onBeforeInsert){
                me._onBeforeInsert.forEach(function(f){
                    f(data);
                })
            }
           
        }
        me.fireOnAfterInsert=function(data){
            if(me._onAfterInsert){
                me._onAfterInsert.forEach(function(f){
                    f(data);
                })
            }
           
        }
        me.fireOnBeforeUpdate=function(data){
            if(me._onBeforeUpdate){
                me._onBeforeUpdate.forEach(function(f){
                    f(data);
                })
            }
            
        }
        me.fireOnAfterUpdate=function(data){
            if(me._onAfterUpdate){
                me._onAfterUpdate.forEach(function(f){
                    f(data);
                })
            }
            
        }
        me.onBeforeInsert=function(callback){
            if(typeof callback!="function"){
                throw(new Error('onBeforeInsert of '+me.name+"' must be a function with data params"));
            }
            me._onBeforeInsert.push(callback);
            return me;
        }
        me.onAfterInsert=function(callback){
            if(typeof callback!="function"){
                throw(new Error('onAfterInsert of '+me.name+"' must be a function with data params"));
            }
            me._onAfterInsert.push(callback);
            return me;
        }
        me.onBeforeUpdate=function(callback){
            if(typeof callback!="function"){
                throw(new Error('onBeforeUpdate of '+me.name+"' must be a function with data params"));
            }
            me._onBeforeUpdate.push(callback);
            return me;
        }
        me.onAterUpdate=function(callback){
            if(typeof callback!="function"){
                throw(new Error('onAterUpdate of '+me.name+"' must be a function with data params"));
            }
            me._onAterUpdate.push(callback);
            return me;
        }
        if(!global["__q-apps__"]){
            global["__q-apps__"]={}
        }
        if (! global["__q-apps__"][me.name]){
            global["__q-apps__"][me.name]={
                fields:{},
                arrayFields:[],
                indexes:[]
            }
        }
        me.meta=global["__q-apps__"][me.name];
        me.fields=function(fields){
            try {
                fields["_id"]={$type:"ObjectId"}
                if(!fields){
                    throw("What is the fields of model '"+me.name+"'\r\n You can declare fields of model like bellow instruction:\r\n"+
                        ".fields({\r\n your field name 1:{$type:'text,number,date,bool or list',[$require:true]},\r\n "+
                        "....\r\n"+
                        "your field name n:{$type:'text,number,date,bool or list',[$require:true]}\r\n);"         
                        )
                }
                if(Object.keys(fields).length==0){
                    throw("What is the fields of model '"+me.name+"'\r\n You can declare fields of model like bellow instruction:\r\n"+
                        ".fields({\r\n your field name 1:{$type:'text,number,date,bool or list',[$require:true]},\r\n "+
                        "....\r\n"+
                        "your field name n:{$type:'text,number,date,bool or list',[$require:true]}\r\n);"         
                        )
                }
                if(!global["__q-apps__"]){
                    global["__q-apps__"]={}
                }
                if (! global["__q-apps__"][me.name]){
                    global["__q-apps__"][me.name]={
                        fields:{},
                        indexes:[]
                    }
                }
                fields=extractFieldInfo(fields);
                if(me.baseModel){
                    Object.keys(me.baseModel.getFields()).forEach(function(key){
                        fields[key]=me.baseModel.getFields()[key]
                    });
                }
                me.meta=global["__q-apps__"][me.name];
                me.meta.fields=fields
                me.meta.arrayFields=convertObjectToArrayKeyAndValue(fields,undefined,me.name);
                me.meta.requireFields={};
                me.meta.fieldTypes={}
                me.meta.arrayFields.forEach(function(ele){
                    var key=Object.keys(ele)[0];
                    if(ele[key].$require || ele[key].$type==="array"){
                        me.meta.requireFields[key]=ele[key];
                        me.meta.requireFields[key].$require=true;
                    }
                    if(!ele[key].$require && ele[key].$type==="object"){
                        me.meta.requireFields[key]=ele[key];
                        me.meta.requireFields[key].$require=false;
                        me.meta.requireFields[key].$detail=ele[key].$detail;
                    }
                    me.meta.fieldTypes[key]=ele[key].$type;
                })
                return me;
            } catch (error) {
                logger.error(error);
                throw(error);
            }
            return me;
            
        }
        me.indexes=function(indexes){
            if(!indexes || ! indexes instanceof Array){
                throw("\r\n\t\tIndexes param is require and must be array\r\n"+
                        "\t\tYou can call \r\n"+  
                        "\t\t\t .indexes([\r\n"+
                        "\t\t\t\t{<field name 1>:1,.., <field name n>:1,[$unique:true]},..\r\n"+
                        "\t\t\t\t,..\r\n"+
                        "\t\t\t\t{<field name 1>:1,.., <field name n>:1,[$unique:true]}\r\n"+
                        "]) \r\n"  )
            }
            if(!global["__q-apps__"]){
                global["__q-apps__"]={}
            }
            if (! global["__q-apps__"][me.name]){
                global["__q-apps__"][me.name]={
                    fields:{},
                    indexes:[]
                }
            }
            me.meta=global["__q-apps__"][me.name];
            me.meta.indexes=indexes;
            return me;
        }
        me.getFields=function(){
            return me.meta.fields;
        }
        me.getIndexes=function(){
            return me.meta.indexes;
        }
        me.getFieldsAsArray=function(data){
            if(data){
                return convertObjectToArrayKeyAndValue(data);
            }
            return me.meta.arrayFields;
        }
        me.getRequireFieldsAsArray=function(data){
            if(data){
                var ret={};
                Object.keys(data).forEach(function(key){
                    var ele=data[key];
                    if(ele.$require){
                        ret[key]=ele;
                    }
                });
                return ret;
            }
            return me.meta.requireFields;
        }
        me.getFieldTypesAsArray=function(){
            return me.meta.fieldTypes;
        }
        me.validateRequireData=function(data,isPartial,requireFields,ignoreList){
            if(!ignoreList) ignoreList={};
            if((!(data instanceof Array))&&(typeof data!="object")){
                return requireFields||me.getRequireFieldsAsArray();
            }
           
            if(!isPartial){
                var ret=[];
                var listOfRequireFields=requireFields||me.getRequireFieldsAsArray();
                
                Object.keys(listOfRequireFields).forEach(function(key){
                    var ele=listOfRequireFields[key];
                    if(!ignoreList[key]){
                        var val=getValueByPath(key,data);
                        if(ele.$type!="array" && ele.$type!="object"){
                            if((val===undefined)||(val==null)){
                                ret.push(key)
                            }  
                        }
                        else if(ele.$type==="object" && (!ele.$require) && val!==undefined  && typeof ele.$detail==="object") {
                            var rFieilds=me.getRequireFieldsAsArray(ele.$detail);
                            var retCheck=me.validateRequireData(val,isPartial,rFieilds);
                            retCheck.forEach(function(k){
                                ret.push(key+"."+k);
                            })
                            
                        }
                        else if(ele.$type==="object" && (ele.$require) && val===undefined  && typeof ele.$detail==="object"){
                            var rFieilds=me.getRequireFieldsAsArray(ele.$detail);
                            var retCheck=me.validateRequireData(val,isPartial,rFieilds);
                            retCheck.forEach(function(k){
                                ret.push(key+"."+k);
                            })
                        }
                        else if(ele.$type==="array" && (ele.$require) && ((val===undefined)||(val===null))){
                            ret.push(key);
                            isAddIgnore=true;
                        } 
                        else if(ele.$type==="object" && (ele.$require) && val===undefined  && (!ele.$detail)){
                            ret.push(key)
                        }   
                        else {
                            var isAddIgnore=false;
                            if(val===undefined){
                                isAddIgnore=true;
                            }
                            else if(val instanceof Array){
                                if((val!==undefined) &&(val!==null) && val.length===0){
                                    isAddIgnore=true;
                                }
                                else{
                                    if(val!==null && val!==undefined){
                                        var detailFields=me.getRequireFieldsAsArray(ele.$detail);
                                        
                                        for(var i=0;i<val.length;i++){
                                            var x=val[i];
                                           
                                            var retResult=me.validateRequireData(x,isPartial,ele.$detail,ignoreList);
                                            if(retResult && retResult.length>0){
                                                retResult.forEach(function(item){
                                                    ret.push(key+"["+i+"]."+item);
                                                    ignoreList[key+"."+item]=1;
                                                });
                                                
                                                break;
                                            }
                                            else {
                                                // isAddIgnore=true;
                                            }
                                        }
                                    }
                                    else {

                                    }
                                    
                                    
                                }
                            }
                            // if((!val)||(val==null)&&(ele.$require===true)){
                            //     ret.push(key);
                                
                            // } else if(val.length==0) {
                            //     isAddIgnore=true;
                            // }  
                            
                        }
                        
                    }
                    if(isAddIgnore){
                        Object.keys(listOfRequireFields).forEach(function(fKey){
                            if(fKey.length>key.length &&
                               fKey.substring(0,key.length+1)===key+"."){
                                   ignoreList[fKey]=1;
                               }
                        });
                    }
                });
                return ret;
            }
            else {
                var ignoreList={}
                var ret=[];
                var itemsData=parseDataToArrayKeyAndValue(data);
                var listOfRequireFields= requireFields||me.getRequireFieldsAsArray();
                itemsData.forEach(function(item){
                    if(!ignoreList[key]){
                        
                        var key=Object.keys(item)[0];
                        var d=getValueByPath(key,listOfRequireFields);
                        if(listOfRequireFields[key] && ((item[key]===undefined)||(item[key]===null))){
                            ret.push(key)
                        }
                    }
                });
                Object.keys(data).forEach(function(key){
                    if(listOfRequireFields[key] && listOfRequireFields[key].$type==="object" && typeof listOfRequireFields[key].$detail==="object"){
                        var rFields=me.getRequireFieldsAsArray(listOfRequireFields[key].$detail);
                        var checkFields=me.validateRequireData(data[key],Object.keys(data[key]).length>0,rFields);
                        checkFields.forEach(function(k){
                                ret.push(key+"."+k);
                        })
                    }
                })
                return ret;
                
            }

        };
        me.validateDataType=function(data,isPartial,fields){
            
            var ret=[];
            var listOfFields=me.getFieldsAsArray(fields);
            
            for(var i=0;i<listOfFields.length;i++){
                var ele=listOfFields[i];
                var key=Object.keys(ele)[0];
                
                var val=getValueByPath(key,data);
                if((val!==undefined)&&(val!==null)){
                    type=ele[key].$type;
                    if(type==="text"){
                        if(typeof val!=="string"){
                            ret.push({field:key,dataType:"text"});
                        }
                    }
                    if(type==="date"){
                        if(!(val instanceof Date)){
                            ret.push({field:key,dataType:"date"});
                        }
                    }
                    if(type==="bool"){
                        if(typeof val!=="boolean"){
                            ret.push({field:key,dataType:"bool"});
                        }
                    }
                    if(type==="number"){
                        if(typeof val!=="number"){
                            ret.push({field:key,dataType:"number"});
                        }
                    }
                    if(type==="array"){
                        if(!(val instanceof Array)){
                            ret.push({field:key,dataType:"array"});
                        }
                        else {
                        if(val!=null && val !=undefined && val.length>0){
                            for(var j=0;j<val.length;j++){
                                if(!checkIsPrimitiveType(val[j])){
                                    var check_fields=me.validateDataType(val[j],isPartial,me.getFields()[key].$detail);
                                    if(check_fields.length>0){
                                        check_fields.forEach(function(x){
                                            ret.push({field:key+"."+x.field,
                                                    dataType:x.dataType,
                                                    dataRow:i,
                                                    fieldName:key+".["+j+"]."+x.field
                                                    });        
                                        })
                                        break;
                                    }
                                }
                            }
                        }
                            
                        }
                    }
                    if(type==="object"){
                        if(typeof val!=="object"){
                            ret.push({field:key,dataType:"object"});
                        }
                    }
                }
                if(ret.length>0){
                    break;
                }
            }
            return ret;
        }
        me.toDictionArray=function(data){
            return parseDataToArrayKeyAndValue(data);
        };
        
        me.getValue=function(data,path){
            return getValueByPath(path,data);
        };
        me.validateData=function(data,isPartital){
            var reqCheck=me.validateRequireData(data,isPartital);
            var valCheck=me.validateDataType(data,isPartital);
            if(reqCheck && valCheck && 
              reqCheck.length>0 &&
              valCheck.length>0){
                  return {
                      missingData:reqCheck,
                      invalidData:valCheck
                  }
              }

        }
        /**
         * Create instance of model with default value
         */
        me.createInstance=function(){
            var ret={};
            var keys=Object.keys(me.meta.fields);
            for(var i=0;i<keys.length;i++){
                var key=keys[i];
                var metaItemInfo=me.meta.fields[key];
                if(typeof metaItemInfo.$default==="function"){
                    ret[key]=metaItemInfo.$default();
                }
                else {
                    ret[key]=metaItemInfo.$default
                }
            }
            return ret;

        }
    };
    global["___q-mongo/extens_helpers___"][name]=new ret();
    return global["___q-mongo/extens_helpers___"][name];

}
function getModel(name){
    if(!global["___q-mongo/extens_helpers___"][name]){
        throw("\r\nIt look like you forgot define model '"+name+"'\r\n");
    }
    return global["___q-mongo/extens_helpers___"][name];
}
module.exports={
    model:model,
    getModel:getModel,
    parseDataToArrayKeyAndValue:parseDataToArrayKeyAndValue,
    getValueByPath:getValueByPath,
    setValueByPath:setValueByPath
}