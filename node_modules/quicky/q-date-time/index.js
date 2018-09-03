
/**
 * get UTC now
 */
function getUTCNow(){
    var now = new Date;
    return  new Date(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() , 
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
} 
/**
 * Convert time from time zone in nodejs to utc timezone
 * @param {Time to convert} time 
 */
function toUCT(time){
    var now = time
    return  Date.UTC(now.getUTCFullYear(),now.getUTCMonth(), now.getUTCDate() , 
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
} 
/**
 * Get time now
 */
function getNow(){
    return new Date();
}
module.exports={
    getUTCNow:getUTCNow,
    toUCT:toUCT,
    getNow:getNow
}    