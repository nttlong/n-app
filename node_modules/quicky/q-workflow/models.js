var qMongo=require("../q-mongo")
qMongo.model("sys_process")
.fields({
    Name:["text",true],
    Activity:{
        $type:"array",
        $require:true,
        $detail:{
            Name:["text",true],
            Description:["text",true],
            Trasition:{
                $type:"array",
                $require:true,
                $detail:{
                    CurrentState:["number",true],
                    NextState:["number",true],
                    Action:{
                        $type:"array",
                        
                    }
                }
            }
        }
    }
})