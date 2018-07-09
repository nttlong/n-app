var Memcached = require('memcached');
var memcached = new Memcached({'localhost:11211': 1});
memcached.set('foo', 'bar', 10, function (err) { 
    memcached.get('foo',(e,r)=>{
        console.log(r);
    })
})