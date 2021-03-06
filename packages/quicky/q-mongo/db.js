const MongoClient = require('mongodb').MongoClient;
const sync=require("../q-sync");
const Mng=require("mongodb")
const E=require("./expr");
const M=require("./extens_helper");
const F=require("./fieldExtractor");
const data_modified_error="data_modified_error";
var errors={
    missing:"missing",
    invalid_data_type:"invalid_data_type",
    duplicate_data:"duplicate_data",
    constraint:"constraint_error",
    foreign_key_error:"foreign_key_error"
}
var _db;
const _update_functions=",$pop,$unset$addToSet,$pull,$pullAll,$each,$position,$slice,$sort,$push,$inc";

function _aggregate(owner){
    var me=this;
    me.__objClassName="_aggregate"
    me.owner=owner;
    me._pipe=[];
    me.currentSelectedFields;
    /**
     * get current selected fields of aggregate
     */
    me.getSelectedFields=function(){
        if(me.owner._noneModel) return [];
        if(!me.currentSelectedFields){
            return me.owner.model.getFieldsAsArray();
        }
        else {
            if(me.currentSelectedFields.length===0){
                return me.owner.model.getFieldsAsArray();
            }
        }
        return me.currentSelectedFields;
    }
    /**
     * get text that show all currentt selected fields of aggregate
     * @param {tab indent} tabs 
     */
    me.describeListOfField=function(tabs){
        var ret="\r\n";
        me.getSelectedFields().forEach(function(ele){
            ret+=tabs+ Object.keys(ele)[0]+"\r\n";
        })
        return ret;

    }
    /**
     * get text that show list of field in list params
     * @param {*} tabs 
     * @param {*} list 
     */
    me.descrideArray=function(tabs,list){
        var ret="\r\n";
        list.forEach(function(ele){
            if(typeof ele==="string"){
                ret+=tabs+ ele+"\r\n";
            }
            else {
                ret+=tabs+ Object.keys(ele)[0]+"\r\n";
            }
            
        })
        return ret;
    }
    /**
     * get all child fields of field info
     * @param {*} field 
     */
    me.getChildFields=function(field){
        if(me.owner._noneModel) return [];
        var ret= me.owner.model.getFieldsAsArray().filter(function(x){
            var key=Object.keys(x)[0];
            return key.indexOf(field+".")==0 || field===key;
        });
        return ret;
    }
    /**
     * Find a field in current selected fields
     * @param {*} field 
     */
    me.findField=function(field){
        var fields=me.getSelectedFields();
        for(var i=0;i<fields.length;i++){
            var key=Object.keys(fields[i])[0];
            if((key==field)||
            ((field.length<key.length)&&
             (key.substring(0,field.length+1)==field+"."))){
                break;
            }
        }
        if(i<fields.length){
            return key;
        }
        else {
            return undefined;
        }
    }
    /**
     * Check field is in current selected fields
     * @param {} field 
     */
    me.checkField=function(field){
        var findItem=me.findField(field);
        if(!findItem){
            var error=new Error("\r\n\t\tWhat is '"+field+"'?.\r\n\t\t'"+field+"' is not in below list:\r\n"+me.descrideArray("\t\t\t\t",me.getSelectedFields()));
            throw(error);
        }
    }
    /**
     * mongodb aggregate project
     * @param {*} selectors 
     * @param {*} params 
     */
    me.project=function(selectors,params){
        var args=arguments;
        if((!params)&&(typeof selectors==="string")){
            _selectors={};
            _selectors[selectors]=1;
            return me.project(_selectors);


        }
        if(args.length>=2 && typeof selectors=="string"){
            var _selectors={};
            for(var i=0;i<args.length;i++){
                if(typeof args[i]==="string"){
                    _selectors[args[i]]=1;
                }
                else if (typeof args[i]==="object") {
                    _selectors[Object.keys[args[i]]]=args[i][Object.keys[args[i]][0]];

                } 
                else if(args[i] instanceof Array){
                    params=args[i];

                }
            }
            selectors=_selectors;
        }
       
        var checkFields=me.getSelectedFields();
        if(!selectors){
            throw(new Error(("Are you confuse?\r\nYou can select in bellow list:\r\n"+me.describeListOfField("\t\t\t"))));
        }
        var $project={
            $project:{}
        }
        var currentSelectors=[];
        Object.keys(selectors).forEach(function(key){
            if(selectors[key]!==0){
                if(selectors[key]===1){
                    me.checkField(key);
                    $project.$project[key]=1;
                    var _field={};
                    _field[key]={$type:"object"};
                    currentSelectors.push(_field);
                    me.getChildFields(key).forEach(function(x){
                        if(Object.keys(x)[0]!==key){
                            currentSelectors.push(x);
                        }
                        
                    })
                }
                else {
                    var unknownFields=[];
                    if(!me._noneModel){

                        unknownFields=E.getUnknownFields(me.getSelectedFields(), selectors[key],params);
                    }
                    if(unknownFields.length>0){
                        
                        throw(new Error("\r\n\t\tThe list of bellow fields:"+
                                me.descrideArray("\t\t\t\t\t",unknownFields)+
                                "\r\n\t\t\t\t are not in :\r\n"+
                                me.describeListOfField("\t\t\t\t")));
                    }
                    
                    var selector
                    try {
                        selector=(selectors[key]===1)?selectors[key]:E.selector(selectors[key],params);
                    } catch (error) {
                        throw(new Error("\r\n"+selectors[key]+"\r\n is invalid expression"));
                    }
                    $project.$project[key]=selector;
                    currentSelectors.push(key);
                }
                
            }
            else {
                $project.$project[key]=0;
            }
            
        })
        me.currentSelectedFields=currentSelectors;
        me._pipe.push($project);
        return me;
    }
    /**
     * mongodb match
     * @param {*} expr 
     * @param {*} params 
     */
    me.match=function(expr,params){
        if(!(params instanceof Array)){
            params=[params];
        }
        var checkFields=me.getSelectedFields();
       
        var unknownFields=E.getUnknownFields(checkFields, expr,params);
        if(unknownFields.length>0){
            throw(new Error(
                "\r\nThe bellow list:\r\n"+
                me.descrideArray("\t\t\t",unknownFields)+"\r\n"+
                " is not in :\r\n"+
                me.descrideArray("\t\t\t",checkFields)+"\r\n"

            ))
        }
        var filter=E.filter(expr,params);
        me._pipe.push({
            $match:filter
        });
        return me;
    }
    /**
     * mongodb lookup aggregate
     * @param {} fromSource 
     * @param {*} foreignField 
     * @param {*} localField 
     * @param {*} alias 
     */
    me.lookup=function(fromSource,foreignField,localField,alias){
        if(!fromSource){
            throw(new Error("\r\nAre you confuse?\r\n"+
                    "\t How to use lookup?\r\n"+
                    "\t\t.lookup(\r\n"+
                    "\t\t\t\t<source collection> or <name of collection>,\r\n"+
                    "\t\t\t\t<one field of soucre collection>,\r\n"+
                    "\t\t\t\t<one field of '"+me.owner.collectionName+"'>\r\n"+
                    "\t\t\t\t<alais name>)"));
        }
        source=fromSource;
        if(typeof source==="function"){
            source=source();
        }
        if(typeof source==="object" && source.collectionName){
            source=source.collectionName;
        }
        var sourceModel=M.model(fromSource.model.name);
        var sourceFields=M.model(fromSource.model.name).getFieldsAsArray();
        var findItem=sourceFields.find(function(ele){
            return Object.keys(ele)[0]==foreignField;
        })
        if(!findItem){
            throw(new Error("t\r\nWhat is '"+foreignField+"'?\r\n"+
                  "\t\t\tList of fields in '"+source+"' are :"+ 
                    me.descrideArray("\t\t\t\t",sourceFields)));
        }
        me.checkField(localField);
        me.currentSelectedFields=me.currentSelectedFields||M.model(me.owner.collectionName).getFieldsAsArray();
        if(typeof source=="object" && source.collectionName){
            source=source.collectionName;
        }
        
        
        
        sourceModel.getFieldsAsArray().forEach(function(ele){
            var key=Object.keys(ele)[0];
            var item={};
            item[alias+"."+key]=ele[key];

            me.currentSelectedFields.push(item);
        });
        var findItem=me.currentSelectedFields.find(function(ele){
             var findkey=Object.keys(ele)[0];
             if(findkey==localField){
                 return true;
             }
             else {
                 return false;
             }
        });
        if(!findItem){
            var fields=[];
            me.currentSelectedFields.forEach(function(ele){
                fields.push(Object.keys(ele)[0])
            });
            var retMsg=JSON.stringify(fields);
            while(retMsg.indexOf(",")>-1){
                retMsg=retMsg.replace(",",".\r\n");
            }

            throw(new Error("'"+localField+"' was not found'.\r\n The selected fields are below :\r\n"+retMsg+"'"));
        }


        me._pipe.push({
            $lookup:{
                from:source,
                localField:localField,
                foreignField:foreignField,
                as:alias
            }
        });
        return me;
    }
    /**
     * Mongodb unwind aggregate
     * @param {*} field 
     * @param {*} NoPreserveNullAndEmptyArrays 
     */
    me.unwind=function(field,NoPreserveNullAndEmptyArrays){
        var args=arguments;
        if((args.length>1)&&(typeof args[1]==="string")){
            if(typeof args[args.length-1]==="boolean"){
                for(var i=0;i<args.length-1;i++){
                    me.unwind(key,args[args.length-1]);
                }
                return me;
            }
            else {
                args.forEach(key=>{
                    me.unwind(key);
                });
                return me;
            }
        }
        me.checkField(field);
        if(field[0]!="$"){
            field="$"+field;
        }
        me._pipe.push({
            "$unwind":{
                path:field,
                preserveNullAndEmptyArrays:!NoPreserveNullAndEmptyArrays
            }
        });
        return me;

    }
    /**
     * mongodb sort aggregate
     * @param {} fields 
     */
    me.sort=function(fields){
        if(!fields){
            throw(new Error("\r\nAre you confuse?\r\n\t\tThe parameters of sort look like that:\r\m\t\t"+
            "{<field name>:1 or -1},..{<field name n>:1 or -1}"));
        }
        me.currentSelectedFields=me.currentSelectedFields||M.model(me.owner.collectionName).getFieldsAsArray();
        Object.keys(fields).forEach(function(key){
            me.checkField(key);
        });
        me._pipe.push({
            $sort:fields
        });
        return me;

    }
    me.skip=function(num){
        me._pipe.push({
            $skip:num
        });
        return me;
    }
    me.limit=function(num){
        me._pipe.push({
            $limit:num
        });
        return me;
    }
    me.group=function(_id,selectors,params){
        if(typeof params!=="object" && (!(params instanceof Array))){
            params=[params]
        }
        var currentSelectors=[];
        var _group={_id:{}}
        if(typeof _id=="string"){
            me.checkField(_id);
            _group._id=_id
            currentSelectors.push(_id);
        }
        if(_id!==null && typeof _id==="object"){
            var checkFields=me.getSelectedFields();
            Object.keys(_id).forEach(function(key){
                var selector
                    try {
                        selector=E.selector(_id[key],params);

                    } catch (error) {
                        throw(new Error("\r\n"+selectorObj.originExpr+"\r\n is invalid expression"));
                    }
                    _group._id[key]=selector;
                    currentSelectors.push(key);
            });
        }
        
        Object.keys(selectors).forEach(function(key){
            
            var unknownFields=E.getUnknownFields(me.getSelectedFields(), selectors[key],params);
                    if(unknownFields.length>0){
                        
                        throw(new Error("\r\n\t\tThe list of bellow fields:"+
                                me.descrideArray("\t\t\t\t\t",unknownFields)+
                                "\r\n\t\t\t\t are not in :\r\n"+
                                me.describeListOfField("\t\t\t\t")));
                    }
                    var selector
                    try {
                        selector=(selectors[key]===1)?selectors[key]:
                                    E.selector(selectors[key],params);
                    } catch (error) {
                        throw(new Error("\r\n"+selectors[key]+"\r\n is invalid expression"));
                    }
                    _group[key]=selector;
                    currentSelectors.push(key);
        });
        me._pipe.push({
            $group:_group
        });
        me.currentSelectedFields=currentSelectors;
        return me;
    }
    me.createObjectFromFields=function(fields){
        var fieldsWithTypeOfArray=fields.filter(function(ele){
            return ele[Object.keys(ele)[0]].$type==="array";
        });
        var rFields=fields.filter(function(f){
            var fItem=fieldsWithTypeOfArray.find(function(fx){
                 return (f.length>fx.length && f[0,fx.length+1]===f+".") || (fx===f);   
            });
            return fItem===null || fItem===undefined;
        });

        var ret={};
        rFields.forEach(function(f){
            var k=f;
            var items=[];
            if (typeof f!=="string" && typeof f==="object"){
                k=Object.keys(f)[0]
               
                
            }
            var items=k.split('.');
            var fx=ret;
            
            for(var i=0;i<items.length-1;i++){
                fx[items[i]]={};
            }
            fx[items[items.length-1]]=null;
            
        });
        fieldsWithTypeOfArray.forEach(function(f){
            var k=Object.keys(f)[0]
            var fx=ret;
            var items=k.split('.');
            for(var i=0;i<items.length-1;i++){
                fx[items[i]]={};
            }
            fx[items[items.length-1]]=[];
            
        });
        return ret;
    }
    me.toArray=function(callback){
        return sync.exec(function(cb){
            var obj=me.createObjectFromFields(me.getSelectedFields());
            var strObj=JSON.stringify(obj);
            if(!cb){
                throw(new Error("It look like you forgot put callback param into 'aggregate.toArray',\r\n or else you can call 'aggregate.toArraySync'"));
            }
            me.owner.getCollection().aggregate(
            me._pipe 
            ).toArray(function(error,items){
                if(error){
                    cb(error)
                }
                else {
                    me._pipe=[];
                    me.currentSelectedFields=null;
                    var retItems=[];
                    items.forEach(function(x){
                        var _obj=JSON.parse(strObj);
                        var keys=Object.keys(x);
                        keys.forEach(function(k){
                            _obj[k]=x[k];
                        });
                        retItems.push(_obj);
                    });
                    cb(null,retItems);
                }
                
            });
            },callback);
    }
    me.toPage=function(pageIndex,pageSize,callback){
        return sync.exec(function(cb){
            var _pipeCount=[];
            me._pipe.forEach(function(item){
                _pipeCount.push(item)
            })
            _pipeCount.push({
                $count: "count"
            })
            me.owner.getCollection().aggregate(_pipeCount)
            .toArray(function(err,items){
                if(err) cb(err);
                else {
                    var totalItems=(items.length>0)?items[0].count:0;
                    me.skip(pageIndex*pageSize).limit(pageSize).toArray(function(err,items){
                        if(err) cb(err);
                        else {
                            cb(null,{
                                totalItems:totalItems,
                                items:items,
                                pageIndex:pageIndex,
                                pageSize:pageSize
                            })
                        }
                    });
                }
            });
        },callback)
        
    }
  
    me.toItem=function(callback){
       return sync.exec(function(cb){
            me.toArray(function(err,items){
                if(err){
                    cb(err);
                }
                else {
                    if(items.length===0){
                        cb()
                    }
                    else {
                        cb(null,items[0])
                    }
                }
    
            });
        },callback);
        
    }
    
}
function _collection(db,schema,name,isNoneModel){
    if(!db){
        throw(new Error("It look like you forgot connect to database"));
    }
    var me=this;
    me.schema=schema;
    me.collectionName=((schema)&&(schema!==""))?schema+"."+name:name;
    me.db=db;
    if(!isNoneModel){
        me.model=M.getModel(name);
    }
    else {
        me._isNoneModelisNoneModel;
    }
    me.throwForeignKeyError=function(message,localField,foreignField,source){
        var ret=new Error(message);
        ret.code=errors.foreign_key_error;
        ret.localField=localField;
        ret.foreignField=foreignField;
        ret.source=me.collectionName;
        ret.foreignSource=source;
        throw(ret);
    }
    me.throwError=function(ex){
        if(arguments.length>0){
            var msg=require("../q-text-format")(arguments);
            throw(new Error(ex));
        }
        if(typeof ex==="string"){
            throw(new Error(ex));
        }
        throw(ex);
    }
    me.descrideArray=function(tabs,list){
        var ret="\r\n";
        list.forEach(function(ele){
            if(typeof ele==="string"){
                ret+=tabs+ ele+"\r\n";
            }
            else {
                ret+=tabs+ Object.keys(ele)[0]+"\r\n";
            }
            
        })
        return ret;
    }
    /**
     * get mongodb collection
     */
    me.getCollection=function(){
        
        var ret= me.db.collection(me.collectionName);
        if(me._noneModel){
            return ret;
        }
        if(!me.model.$hasCreatedIndex){
            var indexes=me.model.getIndexes();
            indexes.forEach(function(ele){
                if(ele.$unique){
                    var fields={};
                    var options={}
                    Object.keys(ele).forEach(function(sKey){
                        if(sKey[0]!="$"){
                            fields[sKey]=ele[sKey];
                        }
                        else {
                            options[sKey.substring(1,sKey.length)]=ele[sKey];
                        }
                    });
                    function run(cb){
                        ret.createIndex(fields,options, function(err,result){
                            cb(err,result);
                        })
                    }
                    var resultOfCreatedIndex=sync.sync(run,[]);
                    
                    if(!me.model.$mongodb_indexes){
                        me.model.$mongodb_indexes={}
                    }
                    me.model.$mongodb_indexes[resultOfCreatedIndex]=fields;

                }
                else {
                    function run(cb){
                        ret.createIndex(ele, function(err,result){
                            cb(err,result);
                        })
                    }
                    var resultOfCreatedIndex=sync.sync(run,[]);
                    if(!me.model.$mongodb_indexes){
                        me.model.$mongodb_indexes={}
                    }
                    me.model.$mongodb_indexes[resultOfCreatedIndex]=fields;
                }
                
                
            });
            me.model.$hasCreatedIndex=true;
        }
        return ret;
        
    }
    me.findOne=function(expr,params,callback){
        if(expr===undefined){
            return sync.exec(function(cb){
                me.db.collection(me.collectionName).findOne((error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        cb(null,item);
                    }
                });
            },callback)
        }
        return sync.exec(function(cb){
            if(params!==undefined && (!(params instanceof Array)&&(typeof params!=="object"))){
                params=[params];
            }
            if(!expr && !params && !cb){
                throw(new Error("It look like you forgot put callback params into 'findOne'"));
            }
            if(expr &&  !params && !cb){
                if(typeof expr!="function"){
                    throw(new Error("you mean '"+expr+"' with callback function? Callback function was not put into 'findOne'"));
                }
            }
            if(expr &&  params && !cb){
                if(typeof expr=="string" && typeof params!="function"){
                    throw(new Error("you mean '"+expr+"' with callacbk function?.But the second param is not a function"));
                }
            }
            if(!cb){
                if(!params){
                    cb=expr;
                    expr=undefined;
                    params=undefined;
                }
                else{
                    cb=params;
                    params=undefined;
                }
            }
    
            if(expr){
                var unknownFields=E.getUnknownFields(me.model.getFieldsAsArray(),expr,params);
                if(unknownFields && unknownFields.length>0){
                    throw(new Error("\r\nThe list of bellow fields:\h\n"+
                           me.descrideArray("\t\t",unknownFields)+"\r\n"+
                           "are not in bellow list:\r\n"+
                           me.descrideArray("\t\t",me.model.getFieldsAsArray())));
                }
    
                me.db.collection(me.collectionName).findOne(E.filter(expr,params),(error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        cb(null,item);
                    }
                });
            }
            else {
                me.db.collection(me.collectionName).findOne({},(error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        data._id=item.inserted._id;
                        ret={
                            data:data
                        }
                        cb(null,ret);
                    }
                });
            }
    
        },callback);
    }
    me.deleteOne=function(expr,params,callback){
        return sync.exec(function(cb){
            if(params && (!(params instanceof Array))){
                params=[params];
            }
            if(!expr && !params && !cb){
                throw(new Error("It look like you forgot put callback params into 'findOne'"));
            }
            if(expr &&  !params && !cb){
                if(typeof expr!="function"){
                    throw(new Error("you mean '"+expr+"' with callback function? Callback function was not put into 'findOne'"));
                }
            }
            if(expr &&  params && !cb){
                if(typeof expr=="string" && typeof params!="function"){
                    throw(new Error("you mean '"+expr+"' with callacbk function?.But the second param is not a function"));
                }
            }
            if(!cb){
                if(!params){
                    cb=expr;
                    expr=undefined;
                    params=undefined;
                }
                else{
                    cb=params;
                    params=undefined;
                }
            }

            if(expr){
                var unknownFields=E.getUnknownFields(me.model.getFieldsAsArray(),expr,params);
                if(unknownFields && unknownFields.length>0){
                    throw(new Error("\r\nThe list of bellow fields:\h\n"+
                        me.descrideArray("\t\t",unknownFields)+"\r\n"+
                        "are not in bellow list:\r\n"+
                        me.descrideArray("\t\t",me.model.getFieldsAsArray())));
                }

                me.db.collection(me.collectionName).deleteOne(E.filter(expr,params),(error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        cb(null,item);
                    }
                });
            }
            else {
                me.db.collection(me.collectionName).findOne({},(error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        data._id=item.inserted._id;
                        ret={
                            data:data
                        }
                        cb(null,ret);
                    }
                });
            }
        },callback,__filename)
    }
  
    me.find=function(expr,params,callback){
        if(expr===undefined){
            return sync.exec(function(cb){
                me.db.collection(me.collectionName).find().toArray((error,item)=>{
                    if(error){
                        cb(error)
                    }
                    else {
                        cb(null,item);
                    }
                });
            },callback)
        }
        return sync.exec(function(cb){
            if((typeof params!=="object") &&
            (typeof params!=="array")){
                params=[params];
            }
            if(expr){
                var unknownFields=E.getUnknownFields(me.model.getFieldsAsArray(),expr,params);
                if(unknownFields && unknownFields.length>0){
                    throw(new Error("\r\nThe list of bellow fields:\h\n"+
                        me.descrideArray("\t\t",unknownFields)+"\r\n"+
                        "are not in bellow list:\r\n"+
                        me.descrideArray("\t\t",me.model.getFieldsAsArray())));
                }
                me.db.collection(me.collectionName).find(
                    E.filter(expr,params)
                ).toArray(function(ex,r){
                    cb(ex,r);
                });
            }
            else {
                return me.db.collection(me.collectionName).find().toArray(function(ex,r){
                    cb(ex,r);
                })
            }
        },callback);
        
    }
    
    me.makesureData=function(data,forUpdate){
        if(!forUpdate){
            var fieldsWithDefaultValues=me.model.meta.arrayFields.filter(function(field){
                return field[Object.keys(field)[0]] .$default!==undefined;
            });
            for(var i=0;i<fieldsWithDefaultValues.length;i++){
                var propertyPath=Object.keys(fieldsWithDefaultValues[i])[0];
                var valIndata=M.getValueByPath(propertyPath,data);
                var defaultValue=fieldsWithDefaultValues[i][propertyPath].$default;
                if(typeof defaultValue==="function"){
                    M.setValueByPath(propertyPath,data,valIndata||defaultValue());
                }
                else {
                    M.setValueByPath(propertyPath,data,valIndata||defaultValue);
                }
            }
            
        }
        if(data instanceof Array){
            var ret=[];
            for(var i=0;i<data.length;i++){
                ret.push(makesureData(data[i]),forUpdate);
            }
            return ret;
        }
        var ret={}
        var keys=Object.keys(data);
        keys.forEach(function(key){
            if(forUpdate){
                if((key!="_id")&&
                    (key[0]!="$")&&
                    (_update_functions.indexOf(key)===-1)){
                    var val=data[key];
                    if((val!==null)&&(val!==undefined)&&(typeof val==="object")&&(!(val instanceof Date))){
                        val=me.makesureData(val,forUpdate);
                        ret[key]=val
                    }
                    else {
                        ret[key]=val;
                    }
                }
                else {
                    ret[key]=data[key];
                }
            }
            else {
                if((key[0]!="$")){
                    var val=data[key];
                    if((val!==null)&&(val!==undefined)&&(typeof val==="object")&&(!(val instanceof Date))){
                        val=me.makesureData(val,forUpdate);
                        ret[key]=val;
                    }
                    else {
                        ret[key]=val;
                    }
                }
            }
        });
        return ret;
    }
    me.createDataInstance=function(){
        var ret={};
        ret=mr.makesureData(ret);
        return ret;
    }
    me.updateOne=function(data,expr,params,callback){
       return sync.exec(function(cb){
        if((!(params instanceof Array))&&
        (!(params instanceof Date))&&
        (typeof params!=="object")){
            params=[params];
        }
        data=me.makesureData(data,true);
        me.checkData(data);
        filter=E.filter(expr,params);
        var retInvalidRequireFields=me.model.validateRequireData(data,true);
        if(retInvalidRequireFields.length>0){
            cb(null,{
                error:require("./exception")(
                    data_modified_error,
                    `Update data to ${me.schema}.${me.collectionName} require data fields, see fields in this error`,
                    errors.missing,
                    retInvalidRequireFields,
                    me.schema,
                    me.collectionName,
                    ""
                )
            });
            return;
        }
        var retInvalidFieldTypes=me.model.validateDataType(data);
        if(retInvalidFieldTypes.length>0){
            cb(null,{
                error:require("./exception")(
                    data_modified_error,
                    `Update data to ${me.schema}.${me.collectionName} with invalid data type fields, see fields in this error`,
                    errors.invalid_data_type,
                    retInvalidFieldTypes,
                    me.schema,
                    me.collectionName,
                    ""
                )
            });
            return;
        }
        var unknownFields=E.getUnknownFields(me.model.getFieldsAsArray(),expr,params);
        if(unknownFields.length>0){
            var msg="\r\nThe list of bellow fields:\r\n"+
                    me.descrideArray("\t\t",unknownFields)+"\r\n"+
                    "\t is not in bellow list:\r\n"+
                    me.descrideArray("\t\t",me.model.getFieldsAsArray())+"\r\n";
            require("../q-exception").next(new Error(msg),__filename);
        }
        var updateData={};
        var keys=Object.keys(data);
        for(var i=0;i<keys.length;i++){
            if(_update_functions.indexOf(keys[i])==-1){
                if(!updateData.$set){
                    updateData.$set={};
                }
                if(keys[i]!="_id"){
                    updateData.$set[keys[i]]=data[keys[i]];
                }
            }
            else {
                if(keys[i]!="_id"){
                    updateData[keys[i]]=data[keys[i]];
                }
            }

        }
        //raise on before update
            try {
                me.filter=filter;
                me.data=updateData.$set;
                me.model.fireOnBeforeUpdate(me,(ex,result)=>{
                    try {
                        updateData.$set=me.data;
                        me.getCollection().updateOne(me.filter,updateData,function(err,ret){
                            if(err && err.code===11000){
                                var uniqueName=err.errmsg.split(":")[2].split(" ")[1];
                                var fields=me.model.$mongodb_indexes[uniqueName];
                                var retErrorFields=[];
                                Object.keys(fields).forEach(function(key){
                                    retErrorFields.push(key);
                                });
                                cb({
                                    error:require("./exception")(
                                        data_modified_error,
                                        `Update data to ${me.schema}.${me.collectionName} with the values is existing, see fields in this error`,
                                        errors.duplicate_data,
                                        retErrorFields,
                                        me.schema,
                                        me.collectionName,
                                        ""
                                    ),
                                    data:data
                                });
                                return;
                
                            }
                            else {
                                if(err){
                                    cb(err)
                                }
                                else {
                                    me.model.fireOnAfterUpdate(me,(err,res)=>{
                                        cb(err,{
                                            data:data
                                        });
                                    });
                                    
                                }
                            }
                
                        });
                    } catch (error) {
                        cb(error);
                    }
                  
                });    
            } catch (error) {
                if(error.code!=undefined){
                    cb(null,{
                        error:error
                    });
                }
                else {
                    throw(error);
                }
                
            }
        //end on before update

       
        },callback,__filename);
    }
    me.updateMany=function(data,expr,params,callback){
        sync.exec(function(cb){

        
                data=me.makesureData(data,true);
                if(params && !(params instanceof Array)){
                    params=[params];
                }
                me.checkData(data);

                filter=E.filter(expr,params);
                var retInvalidRequireFields=me.model.validateRequireData(data,true);
                if(retInvalidRequireFields.length>0){
                    cb(null,{
                        error:require("./exception")(
                            data_modified_error,
                            `Update data to ${me.schema}.${me.collectionName} require data fields, see fields in this error`,
                            retInvalidRequireFields,
                            errors.missing,
                            
                            me.schema,
                            me.collectionName,
                            ""
                        )
                    });
                    return;
                }
                var retInvalidFieldTypes=me.model.validateDataType(data);
                if(retInvalidFieldTypes.length>0){
                    cb(null,{
                        error:require("./exception")(
                            data_modified_error,
                            `Update data to ${me.schema}.${me.collectionName} with invalid data type fields, see fields in this error`,
                            retInvalidFieldTypes,
                            errors.invalid_data_type,
                            me.schema,
                            me.collectionName,
                            ""
                        )
                    });
                    return;
                }
                var unknownFields=E.getUnknownFields(me.model.getFieldsAsArray(),expr,params);
                if(unknownFields.length>0){
                    var msg="\r\nThe list of bellow fields:\r\n"+
                            me.descrideArray("\t\t",unknownFields)+"\r\n"+
                            "\t is not in bellow list:\r\n"+
                            me.descrideArray("\t\t",me.model.getFieldsAsArray())+"\r\n";
                    require("../q-exception").next(new Error(msg),__filename);
                }
                me.filter=filter;
                me.getCollection().updateMany(me.filter,{$set: data},function(err,ret){
                    if(err && err.code===11000){
                        var uniqueName=err.errmsg.split(":")[2].split(" ")[1];
                        var fields=me.model.$mongodb_indexes[uniqueName];
                        var retErrorFields=[];
                        Object.keys(fields).forEach(function(key){
                            retErrorFields.push(key);
                        });
                        cb(null,{
                            error:require("./exception")(
                                data_modified_error,
                                `Update data to ${me.schema}.${me.collectionName} with the values is existing, see fields in this error`,
                                retErrorFields,
                                errors.duplicate_data,
                                me.schema,
                                me.collectionName,
                                ""
                            ),
                            data:data
                        });
                        return;

                    }
                    else {
                        if(err){
                            cb(err)
                        }
                        else {
                            cb(null,{
                                data:data
                            })
                        }
                    }

                });
        },callback,__filename);
    }
    
    me.insertMany=function(data,callback){
        sync.exec(function(cb){
            
            data=me.makesureData(data);
            me.checkData(data);
            var insertData=data;
            if(! insertData instanceof Array){
                insertData=[insertData];
            }
            if(!cb){
                throw(new Error("\r\nIt look like you forgot set callback param\r\n.Example: myColl.insertMany(myData,function(err,result)\r\n{\r\n..put yoour hanlder code here..\r\n})"));
            }
            me.getCollection().insertMany(insertData,cb);
        },callback,__filename);
    }
    me.getListOfFieldNameOfModel=function(){
        if(!me._listOfFieldNameOfModel){
            me._listOfFieldNameOfModel={};
            var x=M.parseDataToArrayKeyAndValue(me.model.meta.fields);
            for(var i=0;i<x.length;i++){
                var key=Object.keys(x[i])[0];
                while(key.indexOf(".$detail.")>-1){
                    key=key.replace(".$detail.",".");
                }
                while(key.indexOf(".$type")>-1){
                    key=key.replace(".$type","");
                }
                while(key.indexOf(".$require")>-1){
                    key=key.replace(".$require","");
                }
                while(key.indexOf(".$default")>-1){
                    key=key.replace(".$default","");
                }
                me._listOfFieldNameOfModel[key]=1;

            }



        }
        return me._listOfFieldNameOfModel;
    }
    me.checkData=function(data){
        var x=M.parseDataToArrayKeyAndValue(data);
        if(!me._u_fields){
            me._u_fields=M.unwind
        }
        x.forEach(function(ele){
            var key=Object.keys(ele)[0];
            if(key[0]==="$"){
                var items=key.split(".");
                if(_update_functions.indexOf(items[0])>-1){
                    key=key.substring(items[0].length+1,key.length);
                }
            }
            
            if(!me.getListOfFieldNameOfModel()[key]){
                var msg="\r\nWhat is '"+key+"'?. '"+key+"' is not in '"+me.model.name+"', see list:\r\n"+
                me.descrideArray("\t\t",me.model.getFieldsAsArray())+"\r\n";
                throw(new Error(msg));
            }
        });
    }
   
    me.insertOne=function(data,callback){
     
       return sync.exec(function(cb){
            data=me.makesureData(data);
            if(!me._noneModel){
                try {
                    var retBeforeInsert=sync.exec(function(cb){
                        me.model.fireOnBeforeInsert(data,function(error,result){
                            cb(error,result)
                        })
                    },callback);
                    var x= retBeforeInsert
                    // me.model.fireOnBeforeInsert(me,(ex,r)=>{
                    //     cb(ex,r);
                    // });    
                } catch (error) {
                    if(error.code!=undefined){
                        cb(null,{
                            error:error
                        });
                    }
                    else {
                        throw(error);
                    }
                    
                }
                
                // me.checkData(data);
                var retInvalidRequireFields=me.model.validateRequireData(data);
                if(retInvalidRequireFields.length>0){
                    cb(null,{
                        error:require("./exception")(
                            data_modified_error,
                            `Insert data to ${me.schema}.${me.collectionName} require data fields, see fields in this error`,
                            retInvalidRequireFields,
                            errors.missing,
                            me.schema,
                            me.collectionName,
                            ""
                        )
                    });
                    return;
                }
                var retInvalidFieldTypes=me.model.validateDataType(data);
                if(retInvalidRequireFields.length>0){
                    cb(null,{
                        error:require("./exception")(
                            data_modified_error,
                            `Insert data to ${me.schema}.${me.collectionName} require data fields, see fields in this error`,
                            errors.missing,
                            retInvalidRequireFields,
                            me.schema,
                            me.collectionName,
                            ""
                        )
                    });
                    return;
                    
                }
            }
            me.getCollection().insertOne(data,function(err,result){
                if(err && err.code===11000){
                    var uniqueName=err.errmsg.split(":")[2].split(" ")[1];
                    var fields=me.model.$mongodb_indexes[uniqueName];
                    var retErrorFields=[];
                    Object.keys(fields).forEach(function(key){
                        retErrorFields.push(key);
                    });
                    cb(null,{
                        error:require("./exception")(
                            data_modified_error,
                            `Insert data to ${me.schema}.${me.collectionName} with the values is existing, see fields in this error`,
                            retErrorFields,
                            errors.duplicate_data,
                            
                            me.schema,
                            me.collectionName,
                            ""
                        ),
                        data:data
                    });
                    return;

                }
                else {
                    if(err){
                        cb(err)
                    }
                    else {
                        data._id=result.insertedId;
                        if(!me._noneModel){
                            var retAfterInsert=sync.exec(function(cb){
                                me.model.fireOnAfterInsert(data,function(ex,r){
                                    cb(ex,r);
                                });
                            });
                            
                        }
                        cb(null,{
                            data:data
                        })
                    }
                }
            });
        },callback);
    }
   
    me.descrideArray=function(tabs,list){
        var ret="\r\n";
        list.forEach(function(ele){
            if(typeof ele==="string"){
                ret+=tabs+ ele+"\r\n";
            }
            else {
                ret+=tabs+ Object.keys(ele)[0]+"\r\n";
            }
            
        })
        return ret;
    }
    me.aggregate=function(){
        return new _aggregate(me);
    }
}//# sourceMappingURL=sync.js.map
function collection(db,schema,name,isNoneModel){
    if(((!db)||(db==="")) &&(schema)){
        name=schema
        schema=undefined;
        db=_db
    }
    else  if((!name) && (!schema)){
        name=db;
        db=_db;
    }
    else if(!name){
        if(typeof db==="string"){
            name=schema;
            schema=db;
            db=_db;
        }
        else {
            name=schema;
            schema=null;
            
        }

    }
    return new _collection(db,schema,name,isNoneModel);
}
function query(db,schema,name){
    var ret=collection(db,schema,name,true);
    ret._noneModel=true;
    return ret;
}
function connect(url){
    if(!global["__1-mongo-database-connection__"]){
        global["__1-mongo-database-connection__"]={};
    }
    if(global["__1-mongo-database-connection__"][url]){
        _db= global["__1-mongo-database-connection__"][url];
        return global["__1-mongo-database-connection__"][url];
    }
    if(_db) return _db;
    var dbName=url.split('/')[url.split('/').length-1];
    var cnn=sync.sync(MongoClient.connect,[url]);
    var DB= cnn.db(dbName);
    global["__1-mongo-database-connection__"][url]=DB;
    _db= global["__1-mongo-database-connection__"][url]
    return  global["__1-mongo-database-connection__"][url];
    
}
var view_cache={}
function createView(aggregateObject,schema,name,callback){
    return require("../q-sync").exec(function(cb){
        if(view_cache["views."+name]){
            cb(null,view_cache["views."+name]);
            return;
        }
        var cnn=aggregateObject.owner.db;
        var viewName="views."+name;
        if((schema!==undefined) && (schema!=="")){
            viewName=schema+"."+viewName;
        }
        var sourceName=aggregateObject.owner.model.name;
        if((schema!==undefined) && (schema!=="")){
            sourceName=schema+"."+sourceName;
        }
        cnn.dropCollection(viewName,function(ex,r){
            // if(ex) {
                // cb(ex);
            // }
            // else {
                var command=[viewName,sourceName,aggregateObject._pipe];
                var commandText=JSON.stringify(command);
                commandText=commandText.substring(1,commandText.length-1);
                commandText="db.createView("+commandText+")";
                cnn.eval(commandText,function(ex,r){
                    coll=aggregateObject;
                    var fields={};
                    coll.getSelectedFields().forEach(function(x){
                        fields[Object.keys(x)[0]]=x[Object.keys(x)[0]]
                    })
                    M.model("views."+name)
                    .fields(fields);
                    view_cache["views."+name]=collection(cnn,schema,"views."+name);
                    cb(ex,view_cache["views."+name]);
                });
            // }
        });
        
    },callback,__filename);
    
}
module.exports={
    collection:collection,
    query:query,
    connect:connect,
    model:M.model,
    getModel:M.getModel,
    createView:createView
}