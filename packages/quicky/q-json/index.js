var reg=/\:\"\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z\"/
/**
 * Convert json 
 * @param {json text} text 
 */
function fromJSON(text){
    if(!text) return null;
    
    var tmp=[]
    
    var items= reg.exec(text)
    while(items){
        text=text.replace(items[0],":new Date([{["+tmp.length+"]}])");
        tmp.push(items[0]);
        items= reg.exec(text)
    }
    for(var i=0;i<tmp.length;i++){
        text=text.replace(":new Date([{["+i+"]}])",":new Date("+tmp[i].substring(1,tmp[i].length)+")");
    }
    while(text[0]==='"'){
        text=text.substring(1,text.length);
    }
    while(text[text.length-1]==='"'){
        text=text.substring(0,text.length-1);
    }
    return Function("","return "+text)()
}
function toJSON(data){
    return JSON.stringify(data);
}
module.exports={
    fromJSON:fromJSON,
    toJSON:toJSON
}