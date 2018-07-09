module.exports=require("quicky/q-controller")(
    __filename,
    ()=>{
        var menuData=[
            {
                caption:"Account manager",
                items:[
                    {
                        caption:"Users",
                        page:"accounts/users"
                    },{
                        caption:"Admin users",
                        page:"accounts/admin-users"
                    }
                ]
            },
            {
                caption:"Categories",
                items:[
                    {
                        caption:"Nation",
                        page:"categories/nation"
                    },{
                        caption:"Married status",
                        page:"categories/MarriedStatus"
                    },{
                        caption:"Job title group",
                        page:"categories/JobTitleGroup"
                    },{
                        caption:"Customers",
                        page:"categories/recruiters"
                    },{
                        caption:"Members",
                        page:"categories/recruiters"
                    }
                ]
            }
        ];
        return {
            load:(s,d)=>{
                s.setValue("menu",menuData);
                d();
            }
        }
        
    }
)