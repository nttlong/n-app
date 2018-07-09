var x=require("./index");
x.settings('localhost:9200')
// x.pingSync();
// var fx=x.searchSync("OK");
var f=x.index("long_test","my_test");
var xx=f.create("aaa2",{
    title:"Long test",
    content:"dsad dsad dd sdsad ada dad ad ad a",
   
});
var txt=f.searchText("dsad");
console.log(txt);