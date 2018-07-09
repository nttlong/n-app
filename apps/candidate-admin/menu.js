var menuData=[
    {
        caption:"Account manager",
        items:[
            {
                caption:"Users",
                page:"users"
            }
        ]
    }
];
module.exports=function(language){
    var languageMdl=require("quicky/q-language");
    var apps=require("quicky/q-apps");
    var appName=apps.getAppByDir(__dirname).name;
    var ret=[];
    menuData.forEach(function(menu){
        var retItem={
            caption:languageMdl.getItem(language,appName,"-","menu/"+menu.caption,menu.caption),
            items:[]
        }
        menu.items.forEach(function(item){
            retItem.items.push({
                caption:languageMdl.getItem(language,appName,"-","menu/"+menu.caption+"/"+ item.caption,item.caption),
                page:item.page
            });
        });
        ret.push(retItem);
    });
    return ret;
}