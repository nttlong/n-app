const model_name="ec_products";
var db=require("quicky/q-mongo");
var qDateTime=require("quicky/q-date-time");
function getNow(){
    return new Date();
}
db.model(model_name)
.fields({
    code:["text",true],
    name:["text",true],
    description:["text",true],
    createdOn:["date",true,getNow],
    createdOnUTC:["date",true,qDateTime.getUTCNow],
    createdBy:["text",true],
    modifiedOn:["date",false],
    modifiedOnUTC:["date",false],
    modifiedBy:["text",false],
    main_photo_id:["text",true],
    youtube_video_link:["text",false]
}).indexes([
    'code'
]);

function products(schema){
    return db.collection(schema,model_name)
}
module.exports=products