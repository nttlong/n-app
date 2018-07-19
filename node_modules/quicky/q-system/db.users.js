const model_name="sys_users"

var db=require("../q-mongo");
var dateTimeMdl=require("../q-date-time");
function connect(url){
    db.connect(url);
}
db.model(model_name)
.fields({
    Username : ["text",true],
	LatestLoginFail :"date",
	ModifiedOn : "date",
	Description : "text",
    CreatedOn : ["date",true,dateTimeMdl.getNow],
    CreateOnUCT:["date",true,dateTimeMdl.getUTCNow],
	ActivationOnUTC :"date",
	CreatedOnUTC :{
        $type:"date",
        $require:true,
        $default:Date.now
    },
	LatestLogin : ["date"],
	ActivationOn :["date"],
	ModifiedOnUTC : ["date"],
	CreatedBy : ["text",true,"application"],
	Password : ["text",true],
	Email : ["text",true],
	IsActive : ["bool",true,false],
	TotalLogin : ["number",true,0],
	ActivationCount :  ["number",true,0],
    ActivationTimeList : {
                            $type:"array",
                            $require:true,
                            $detail:{
                                UTCTime:["date",true],
                                Time:["date",true],
                            },
                            $default:[]
                        },
    DisplayName : ["text",true],
    IsSysAdmin : ["bool",true,false],
    LatestLoginOn : ["date"],
    LatestLoginOnUTC : ["date"],
    LoginTimeList:   {
        $type:"array",
        $require:true,
        $detail:{
            UTCTime:["date",true],
            Time:["date",true]
        },
        $default:[]
    },
    IsStaff : ["bool",true],
	LatestLoginFailOn :"date",
    LatestLoginFailOnUCT : "date",
    LoginFailCount:["number",true,0],
	LoginFailTimeList:{
        $type:"array",
        $require:true,
        $detail:{
            UTCTime:["date",true],
            Time:["date",true]
        },
        $default:[]
    }
                            
}).indexes([
    {Username:1,$unique:true},
    {Email:1,$unique:true}
]);
function users(schema){
    return db.collection(schema,model_name)
}
module.exports=users