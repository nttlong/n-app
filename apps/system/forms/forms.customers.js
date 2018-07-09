var forms=require("quicky/q-forms");
forms.table.sync(
    {
        name:"customers",
        modelName:"sys_multi_tenancy",
        columns:[{
            fieldName:"code",
            fieldType:"text",
            fieldCaption:"Code",
            format:null,
            displayOrder:100,
            isShowOnTable:true
        },{
            fieldName:"OrganizeInfo.Name",
            fieldType:"text",
            fieldCaption:"Name",
            displayOrder:200,
            isShowOnTable:true

        },{
            fieldName:"OrganizeInfo.Email",
            fieldType:"text",
            fieldCaption:"Email",
            displayOrder:300,
            isShowOnTable:true
        },{
            fieldName:"OrganizeInfo.Username",
            fieldType:"text",
            fieldCaption:"Registered by",
            displayOrder:400,
            isShowOnTable:true
        },{
            fieldName:"schema",
            fieldType:"text",
            fieldCaption:"Database schema",
            displayOrder:500,
            isShowOnTable:false

        },{
            fieldName:"CreatedOn",
            fieldType:"date",
            fieldCaption:"Created on",
            displayOrder:700,
            isShowOnTable:true,
            format:"dd-MM-yyyy hh:mm:ss"
        },{
            fieldName:"CreatedOnUTC",
            fieldType:"date",
            fieldCaption:"Created on (utc time zone)",
            displayOrder:800,
            isShowOnTable:true,
            format:"dd-MM-yyyy hh:mm:ss"
        },{
            fieldName:"CreatedBy",
            fieldType:"text",
            fieldCaption:"Created by",
            displayOrder:900,
            isShowOnTable:true
        },{
            fieldName:"ModifiedOn",
            fieldType:"date",
            fieldCaption:"Modified on",
            displayOrder:1000,
            isShowOnTable:true
        },{
            fieldName:"ModifiedOnUTC",
            fieldType:"date",
            fieldCaption:"Modified on (utc time zone)",
            displayOrder:1100,
            isShowOnTable:true
        },{
            fieldName:"ModifiedBy",
            fieldType:"text",
            fieldCaption:"Modified by",
            displayOrder:1200,
            isShowOnTable:true
        }]
    }
)
forms.dialog.sync({
    name:"customers",
    modelName:"sys_multi_tenancy",
    rows:[
        {
            lgCols:[4,8],
            mdCols:[4,8],
            smCols:[4,8],
            xsCols:[12],
            fields:[{
                fieldName:"code",
                controlType:"text"
            },{
                fieldName:"OrganizeInfo.Name",
                controlType:"text"
            }]
        }
    ]
})
module.exports=forms.getForm("customers")