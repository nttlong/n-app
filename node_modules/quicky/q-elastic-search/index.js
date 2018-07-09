
var sync=require("../q-sync")
var cache={}
var client = undefined;
var requestTimeOut=3000;
var es_index=require("../q-elastic-search/es-index")
/**
 * Set client to server
 * @param {Url for connect exp:localhost:9200} url 
 */
  function settings(url){
    
    client=new require('elasticsearch').Client({host:url,log:"trace"});
    return client
  }
  /**
   * Set request timeout
   * @param {timeoute value in mili second} val 
   */
  function setRequestTimeOut(val){
    requestTimeOut=val;
  }
  /**
   * Get request timeout
   */
  function getRequestTimeOut(){
      return requestTimeOut;
  }
  function checkSetting(){
      if(!client){
          throw(new Error("It look like you forgot call 'q-elastic-search.settings"))
      }
  }
  /**
   * Ping server
   */
  function ping(cb){
    checkSetting();
    client.ping({
        requestTimeout: 30000,
      }, function (error) {
        cb(error,true)
      });
  }
  /**
   * Ping server in sync mode
   */
  function pingSync(){
     return sync.sync(ping,[]);
  }
  /**
   * 
   * @param {query expression} query 
   */
  function search(query,cb){
    checkSetting();
    client.search({
      q: query
    }).then(function (body) {
      
      var hits = body.hits.hits;
      cb(null,hits);
    }, function (error) {
      cb(error)
    });
  }
  function searchSync(query){
    return sync.sync(search,[query]);
  }
  function index(name,type){
    
    checkSetting();
    return new es_index(client,name,type)
  }
  module.exports={
    settings:settings,
    ping:ping,
    pingSync:pingSync,
    search:search,
    searchSync:searchSync,
    index:index
  }