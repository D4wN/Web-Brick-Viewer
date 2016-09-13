var express = require('express');
var router = express.Router();

// REST API
router.get('/', function(req, res, next) {
    //TODO implement callback system to get all brick/bricklet
    res.send('REST Access!');
});


module.exports = router;
