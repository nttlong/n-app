var express = require('express')
  , router = express.Router()

// Domestic animals page

router.get('/', function(req, res) {
    console.log(req.currentApp);
  res.send('I am default app')
});

// Wild animals page
router.get('/wild', function(req, res) {
  res.send('Wolf, Fox, Eagle')
});
router.use('/static',express.static(__dirname+'/static'));

module.exports={
     router:router
};