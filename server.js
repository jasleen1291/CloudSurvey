// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http=require('http');
// configure app
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port
var mongoose = require('mongoose');
var Survey = require('./app/models/survey');
var Response = require('./app/models/response');
var User = require('./app/models/user');
var Transaction = require('./app/models/transaction');
// create our router
var router = express.Router();
router.use(function (req, res, next) {
  // do logging

  next(); // make sure we go to the next routes and don't stop here
});
app.get('/', function (req,res) {
   res.send('Hello');
});
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/myapp');
mongoose.connect('mongodb://cmpe282:cmpe282@ds053160.mongolab.com:53160/survey');
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/barchart/:survey_id/:ques_id', function (req, res) {
  var query = Response.find({
    id: ""+req.params.survey_id,
    question: ""+req.params.ques_id
  }).select("response -_id");
  console.log(req.params.ques_id);
  query.exec(function (err, someValue) {
    if (err)
      return next(err);
//console.log(someValue);
    var aux = {};
    for (i = 0; i < someValue.length; i++) {
        
      var arr = someValue[i].response.toLowerCase().replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ").split(" ");
      for (j = 0; j < arr.length; j++) {
        if (aux[arr[j]] === undefined) {
          aux[arr[j]] = 1;
        } else {
          aux[arr[j]] = (aux[arr[j]]) + 1;
        }

      }
    }

    var array = [];


    for (a in aux) {
      array.push([a, aux[a]]);
    }
    array.sort(function (a, b) {
      return a[1] - b[1];
    });
    array.reverse();
    array.slice(1, 10);
    array.splice(0, 0, ["Name", "Count"]);
    console.log(JSON.stringify(array));
    res.render('pages/barchart.ejs', {
      aux: JSON.stringify(array)
    });
  });
});
router.get('/piechart/:survey_id/:ques_id', function (req, res) {
  var query = Response.find({
    "id": req.params.survey_id,
    "question": req.params.ques_id
  }).select("response -_id");
  query.exec(function (err, someValue) {
    if (err)
      return next(err);


    var aux = {};
    for (i = 0; i < someValue.length; i++) {
      var arr = someValue[i].response.toLowerCase().replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ").split(" ");
      for (j = 0; j < arr.length; j++) {
        if (aux[arr[j]] === undefined) {
          aux[arr[j]] = 1;
        } else {
          aux[arr[j]] = (aux[arr[j]]) + 1;
        }

      }
    }

    var array = [];


    for (a in aux) {
      array.push([a, aux[a]]);
    }
    array.sort(function (a, b) {
      return a[1] - b[1];
    });
    array.reverse();
    array.slice(1, 10);
    array.splice(0, 0, ["Name", "Count"]);
    res.render('pages/piechart.ejs', {
      aux: JSON.stringify(array)
    });
  });
});
router.get('/histogram/:survey_id/:ques_id', function (req, res) {
  var query = Response.find({
    "id": req.params.survey_id,
    "question": req.params.ques_id
  }).select("response -_id");
  query.exec(function (err, someValue) {
    if (err)
      return next(err);


    var aux = {};
    for (i = 0; i < someValue.length; i++) {
      var arr = someValue[i].response.toLowerCase().replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ").split(" ");
      for (j = 0; j < arr.length; j++) {
        if (aux[arr[j]] === undefined) {
          aux[arr[j]] = 1;
        } else {
          aux[arr[j]] = (aux[arr[j]]) + 1;
        }

      }
    }

    var array = [];


    for (a in aux) {
      array.push([a, aux[a]]);
    }
    array.sort(function (a, b) {
      return a[1] - b[1];
    });
    array.reverse();
    //array.slice(1, 10);
    array.splice(0, 0, ["Name", "Count"]);
    console.log(array);
    res.render('pages/histogram.ejs', {
      aux: JSON.stringify(array)
    });
  });
});
// on routes that end in /bears
// ----------------------------------------------------
router.route('/survey')

// create a survey (accessed at POST http://localhost:8080/bears)
.post(function (req, res) {
  //console.log("I am here");
  var survey = new Survey(); // create a new instance of the Bear model
  var error = "None";


  try {
    survey.name = req.body.name; // set the bears name (comes from the request)
    survey.question = req.body.question; // set the bears name (comes from the request)
    var obj = JSON.parse(survey.question);
    var shareInfoLen = Object.keys(obj).length;
    var num_quest = (shareInfoLen);
    survey.user_id = req.body.user_id; // set the bears name (comes from the request)
    survey.expiration_date = req.body.expiration_date; // set the bears name (comes from the request)
    survey.start_date = req.body.start_date;
    console.log(survey);
    // survey.interval = req.body.interval;
    var price = 0.0;
    var interval = (Math.round((new Date(survey.expiration_date) - new Date(survey.start_date)) / 60000));
    if (num_quest <= 5) {
      switch (interval) {
      case 10:
        {
          price = 0.10;
          break;
        }
      case 15:
        {
          price = 0.30;
          break;
        }
      }
    } else {
      num_quest = num_quest - 5;
      var cost = 0.10;
      var iniCost = 0.0;
      switch (interval) {
      case 10:
        {
          cost = 0.20;
          iniCost = 0.10;
          break;
        }
      case 15:
        {
          cost = 0.25;
          iniCost = 0.30;
          break;
        }
      }
      price = price + iniCost;

      while (num_quest > 0) {

        price = price + cost;

        num_quest = num_quest - 5;

      }
    }
    var paid = false;
    if (req.body.cc === "undefined" || req.body.cc === undefined) {
      console.log("undefined card");
    } else if (isNaN(req.body.cc)) {
      error = "Invalid creditcard";
    } else {
      paid = true;

    }

    var transaction = new Transaction();
    transaction.paid = paid;
    transaction.price = price;
    transaction.id = req.body.user_id;
    transaction.date=new Date();
    //console.log(transaction);
    transaction.save(function (err, re) {
      if (err) {
        error = err;
        res.send(err);
      }
      //console.log(re);

    });


    survey.save(function (err, re) {
      if (err)
        console.log(err);


    });
    res.send({
      "error": error
    });
    /*survey.save(function (err, re) {
     if (err)
     res.send(err);
     
     res.send(re);
     });*/
  } catch (e) {
    console.log(e);
    res.json({
      message: "bad request."
    });
  }


})

// get all the surveys (accessed at GET http://localhost:8080/api/surveys)
.get(function (req, res) {

  Survey.find(function (err, survey) {
    if (err)
      res.send(err);

    res.json(survey);
  });
});

router.route('/mysurvey/:user')

// get all the surveys (accessed at GET http://localhost:8080/api/surveys)
.get(function (req, res) {

  Survey.find({
    user_id: req.params.user
  }, function (err, survey) {
    if (err)
      res.send(err);

    res.json(survey);
  });
});

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/survey/:survey_id')

// get the bear with that id
.get(function (req, res) {
  Survey.findOne({
    "_id": req.params.survey_id
  }, function (err, survey) {
    if (survey !== null) {
      if (err)
        res.send(err);
      res.send(survey);
    } else {
      res.json({
        error: "No survey found"
      });
    };
  });
})


// update the bear with this id
.put(function (req, res) {

  Survey.findOne({
    "_id": req.params.survey_id
  }, function (err, survey) {

    if (err)
      res.send(err);
    //console.log(survey);
    survey.expiration_date = req.body.expiration_date;
    //console.log(new Date(survey.expiration_date).toISOString());
    survey.save(function (err, re) {
      if (err)
        res.send(err);

      res.send(re);
    });

  });
})

// delete the bear with this id
.delete(function (req, res) {

  Survey.remove({
    "_id": req.params.survey_id
  }, function (err) {
    if (err)
      res.send(err);

    res.json({
      message: 'Survey deleted'
    });
  });
});

router.route('/responseSurvey/:survey_id')

// get the bear with that id
.get(function (req, res) {



  Response.findOne({
    "id": req.params.survey_id
  }, function (err, survey) {

    if (err)
      res.send(err);
    res.send(survey);
  });
})


// update the bear with this id
.post(function (req, res) {

  var response = new Response();
  response.id = req.params.survey_id;
  response.response = req.body.response;
  response.question = req.body.question;
  response.save(function (err, re) {
    if (err)
      res.send(err);

    res.send(re);
  });


});

// delete the bear with this id

router.route('/responseSurvey/:survey_id/:ques_id')

// get the bear with that id
.get(function (req, res) {
  var query = Response.find({
    "id": req.params.survey_id,
    "question": req.params.ques_id
  }).select("response -_id");
  query.exec(function (err, someValue) {
    if (err)
      return next(err);
    //console.log(someValue);
    var responses = new Array();
    var aux = {};
    for (i = 0; i < someValue.length; i++) {
      var arr = someValue[i].response.replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ").split(" ");
      for (j = 0; j < arr.length; j++) {
        if (aux[arr[j]] === undefined) {
          aux[arr[j]] = 1;
        } else {
          aux[arr[j]] = (aux[arr[j]]) + 1;
        }

      }
    }

    res.send(aux);




  });
})


// update the bear with this id
.post(function (req, res) {

  var response = new Response();
  response.id = req.params.survey_id;
  response.response = req.body.response;
  response.question = req.params.ques_id;
  //console.log(response);
  response.save(function (err, re) {
    if (err)
      res.send(err);

    res.send(re);
  });


});
router.route("/bill/:id")
  .get(function (req, res) {
    Transaction.find({
      "id": req.params.id
    }, function (err, trans) {
      res.send(trans);
    });
  })
  .put(function (req, res) {
    var arr=(JSON.parse(req.body.ids)[0]);
    Transaction.update({
      "_id": {
        $in: [arr]
      }
    }, {paid:"true"},function (err, trans) {
      if (err)
        res.send(err);
      res.json("Success");
    });
  });

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);
var router2 = express.Router();
router2.route('/register')

// get the bear with that id
.post(function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var user = new User();
  user.username = username;
  user.password = password;
  user.save(function (err, re) {
    if (err)
      res.send(err);

    res.send(re);
  });
});
router2.route('/login')

// get the bear with that id
.post(function (req, res) {


  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (err)
      res.send(err);
    // console.log(req.body.username,req.body.password,user);
    if (user !== null) { // test a matching password
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err)
          throw res.send(err);
        res.send({
          "auth": isMatch,
          "id": user._id
        }); // -&gt; Password123: true
      });
    } else {
      res.send({
        "auth": false
      });
    }
    // test a failing password

  });
});
// START THE SERVER
// =============================================================================
app.use('/user', router2);
 app.set('port', 80);
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Express server listening on port ' + app.get('port'));
    });