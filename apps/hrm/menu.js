var lang=require("quicky/q-language")
var menu=[{
    caption:"Categories",
    items:require("./menu.categories")
}];
function getMenu(language,appName,items){
    items=items||menu;
    var ret=[];
    items.forEach(function(ele){
        var item={
            
        };
        item["caption"]=lang.getItem(language,appName,"-",ele.caption);
        if(ele.page){
            item["page"]=ele.page;
        }
        ret.push(item);
        if(ele.items){
            item.items=getMenu(language,appName,ele.items);
        }

    });
    return ret;
}
module.exports=getMenu
