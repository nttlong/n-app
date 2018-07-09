var cache_key="__q-forms__";
if(!global[cache_key]){
    global[cache_key]={}
}
function form(meta){
    var me=this;
    me.meta=meta;
    me.getColumnsOfTable=function(language){
        if(me._columnOfTables) return me._columnOfTables;
        var cols=me.meta.table.columns.filter(function(col){
            return col.isShowOnTable;
        });
        cols=cols.sort(function(a,b){
            return a.displayOrder-b.displayOrder
        })
        me._columnOfTables=cols;
        return me._columnOfTables;
    }
    me.getFormRows=function(){
        return me.meta.dialog.rows;
    }
    me.getColumnByField=function(field){
        var item=me.meta.table.columns.find(function(f){
            return f.fieldName===field.fieldName
        });
        return item;
    }
    me.getFormColumns=function(row){
        var ret=[];
        var i=0;
        var fieldIndex=0;
        row.mdCols.forEach(function(ele){
            var item={}
            var field=row.fields[fieldIndex];
            var col=me.getColumnByField(field);
            if(i%2==0){
                item.type="label";
                item.caption=col.fieldCaption;
            }
            else{
                item.type="field";
                item.field=field;
                
            }
            item.mdCol=ele;
            item.fieldIndex=fieldIndex;
            
            ret.push(item);
            fieldIndex+=i %2;
            i++;
        });
        return ret;
    }
}
module.exports=function(name){
    if(!global[cache_key][name]){
        throw(new Error("'"+name+"' was not found"));
    }
    return new form(global[cache_key][name]);
     
}