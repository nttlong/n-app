var h=require("./index")
h.connect("mongodb://sys:123456@172.16.7.63/lv01_lms");
var ret=h.query("test_report");
var item=ret.insertOneSync({
    A:1
})
var ret=ret.aggregate();

ret.project({
    A:"1",
    B:"switch(case(1>2,2),2)"
})
var retItems=ret.toPageSync(0,50)
console.log(retItems);
