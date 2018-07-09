var qMongo=require("quicky/q-mongo")
qMongo.model("sys_languages")
.fields({
    Language :["text",true],
	App : ["text",true],
	Value :["text",true],
	Key :["text",true],
	View :["text",true]
}).indexes([
    {
        Language:1,
        App:1,
        View:1,
        Key:1,
        $unique:true
    }
])
function languages(){
    return qMongo.collection("sys_languages")
}
module.exports=languages
