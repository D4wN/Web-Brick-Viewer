"use strict";

var express = require('express');
var router = express.Router();

router.get('/:viewID', function(req, res, next){
    console.log("/extendedView/");
    console.log(req.params);

    var view = req.params.viewID;
    // console.log(view.substring(view.length - 5));
    if(view.substring(view.length - 5) == ".html"){
        view = view.slice(0, view.length - 5)
        // console.log("sliced: " + view);
    }

    console.log("render: " + view);
    console.log("------------------------------------------------------------");

    res.render('factory/extendedView/' + view, function(err, html) {
        if (err) {
            if (err.message.indexOf('Failed to lookup view') !== -1) {
                return res.render('factory/extendedView/errorView');
            }
            throw err;
        }
        res.send(html);
    });

});

router.get('/RED/:viewID', function(req, res, next){
    console.log("/extendedView/RED/");
    console.log(req.params);

    var view = req.params.viewID;
    // console.log(view.substring(view.length - 5));
    if(view.substring(view.length - 5) == ".html"){
        view = view.slice(0, view.length - 5)
        // console.log("sliced: " + view);
    }

    // res.render('factory/extendedView/' + view); //./angular is the context
    res.render('factory/extendedView/red/' + view, function(err, html) {
        if (err) {
            if (err.message.indexOf('Failed to lookup view') !== -1) {
                console.error("Failed to lookup view");
                console.log("render: errorView");
                console.log("------------------------------------------------------------");
                return res.render('factory/extendedView/errorView');
            }
            throw err;
        }
        console.log("render: " + view);
        console.log("------------------------------------------------------------");
        res.send(html);
    });

});


module.exports = router;
