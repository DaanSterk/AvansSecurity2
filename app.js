require('jade');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var mongoose = require('mongoose');
require('./userSchema');
var User = mongoose.model("User");

var bcrypt = require('bcryptjs');
var Cryptr = require('cryptr');

mongoose.connect('mongodb://localhost/security2');

var router = express.Router();

app.use(express.static(__dirname + '/'));
app.set('views', __dirname + '/view');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);


// ----- ROUTE FUNCTIONS -----

router.route('/').get(index);
router.route('/').post(chooseMode);

function index(req, res) {
    res.render('index.jade');
}

function chooseMode(req, res) {
    if (req.body.name && req.body.password) {
        if (req.body.msg) {
            encrypt(req, res);
        }
        else {
            decrypt(req, res);
        }
    }
    else {
        console.log("Username or password not entered.");
        res.render('index.jade', { flash: "Voer een gebruikersnaam en wachtwoord in." });
    }
}

function encrypt(req, res) {
    User.findOne({ name: req.body.name }, function(err, user) {
        if (user) {
            console.log("User found. Checking password...");
            bcrypt.compare(req.body.password, user.password, function(err, areEqual) {
                if (areEqual) {
                    console.log("Password correct. Updating message...");
                    var cryptr = new Cryptr(user.password);
                    var encryptedMsg = cryptr.encrypt(req.body.msg);
                    user.update({ message: encryptedMsg }, function(err, user) {
                        if (err) console.log(err);
                        else console.log("Message updated.");
                        res.render('index.jade', { flash: "Bericht gewijzigd." });
                    });
                }
                else {
                    res.render('index.jade', { flash: "Ongeldig(e) gebruikersnaam of wachtwoord." });
                }
            });
        }
        else {
            console.log("User not found. Creating user...");
            encryptPassword(req.body.password, function(hash) {
                var cryptr = new Cryptr(hash);
                var encryptedMsg = cryptr.encrypt(req.body.msg);
                var user = new User(
                    {
                        name: req.body.name,
                        password: hash,
                        message: encryptedMsg
                    }
                )
                console.log("Saving user...");
                user.save(function(err, user) {
                    if (err) console.log(err);
                    else console.log("User saved.");
                    res.render('index.jade', { flash: "Bericht opgeslagen." });
                });
            });

        }
    });
}

function decrypt(req, res) {
    if (req.body.name && req.body.password) {
        User.findOne({ name: req.body.name }, function(err, user) {
            if (user) {
                console.log("User found. Checking password...");
                bcrypt.compare(req.body.password, user.password, function(err, areEqual) {
                    if (areEqual) {
                        console.log("Password correct. Retrieving message...");
                        var cryptr = new Cryptr(user.password);
                        var decryptedMsg = cryptr.decrypt(user.message);
                        res.render('index.jade', { msg : decryptedMsg, flash: "Bericht succesvol opgehaald." });
                    }
                    else {
                        res.render('index.jade', { flash: "Ongeldig(e) gebruikersnaam of wachtwoord." });
                    }
                });
            }
            else {
                console.log("User not found.");
                res.render('index.jade', { flash: "Ongeldig(e) gebruikersnaam of wachtwoord." });
            }
        });
    }
}

// ----- END ROUTE FUNCTIONS -----

function encryptPassword(password, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            callback(hash);
        });
    });
}


var port = 8180;
app.listen(port, function()
{
    console.log("Webserver listening on port " + port + ".");
});