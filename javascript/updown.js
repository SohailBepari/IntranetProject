var express = require('express');
var router = express.Router();
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var rimraf = require("rimraf");
var bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated} = require('./auth');
const path = require('path');
require('./passport')(passport);

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

router.get('/', function(req, res) {
	if(typeof req.user == 'undefined')
    	res.render('HomePage');
    else{
    	res.render('HomePage',{username : req.user[0].name});
    }
});

router.get('/signup', function(req, res) {
	let errors = [];
    res.render('signup',{errors});
});
router.post('/signup',urlencodedParser, function(req,res){
	var {name, email, password, password2} = req.body;

	var con = mysql.createConnection(
	{
	  host: "localhost",
	  user: "root",
	  password: "putYourDBpassword",
	  database: "putYourDBname"
	});
	con.connect(function(err){
		if(err) console.log(err);
	});
	
	let errors = [];
	con.query( `SELECT * FROM userDetails WHERE name = '${name}';`,function(err,result){
		if(err)
			throw err;
		else if(result.length > 0){
			errors.push({msg:"Same username exists"});
		}
		con.query( `SELECT * FROM userDetails WHERE email = '${email}';`,function(err,result){
			if(err)
				throw err;
			else if(result.length > 0){
				con.end();
				errors.push({msg:"Same email exists"});
			}
			if(errors.length > 0){
				return res.render('signup', {errors});
			}
			else{
				con.query(`INSERT INTO userDetails(name, email, userPassword) values('${name}', '${email}', '${password}')`, function(err){
					if(err)
						return res.send(err);
					bcrypt.genSalt(10, function(err,salt){
						bcrypt.hash(password, salt, function(err, hash){
							if(err) throw err;
							password = hash;
							con.query(`UPDATE userDetails SET userPassword = '${password}' WHERE name = '${name}'`,function(err){
								if(err) throw err
								fs.mkdirSync(`../MyUploads/${name}`,function(err){
								   if (err) {
								        console.error(err);
								   }
								});
								req.flash('success_msg','You are now registered and can log in');
								res.redirect('/login');
							});
						});
					});
				});
			}
		});
	});
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login',urlencodedParser, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});
router.get('/upload',ensureAuthenticated, function(req, res) {
    res.render('upload',{username : req.user[0].name});
});

router.post('/upload',function(req,res){
	if(req.files){
		const name = req.user[0].name;
		const file = req.files.filename;
		const filename = file.name;
		file.mv(`../MyUploads/${name}/`+filename,function(err){
			if(err){
				console.log(err);
				res.send(err);
			}
		});
		res.redirect("/upload");
	}
	else{
		res.end("No file uploaded");
	}
});

router.get('/download',ensureAuthenticated,function(req,res){
	const name = req.user[0].name;
	console.log(name);
	var files = fs.readdirSync(`../MyUploads/${name}/`);
	res.render('download',{data: files, username : req.user[0].name});
});

router.get('/download/:filename',ensureAuthenticated, function(req,res){
	const name = req.user[0].name;
	var filename = `../MyUploads/${name}/` + req.params.filename;
	res.download(filename, req.params.name);
});

router.get('/delete-account', ensureAuthenticated,function(req,res){
	if(req.query.check == undefined)
		res.render('deleteAccount');
	else if(req.query.check == "no")
		res.redirect('/');
	else{
		const name = req.user[0].name;
		rimraf(`../MyUploads/${name}`, function(){ 
			console.log("directory removed"); 
		});
		var con = mysql.createConnection(
		{
	  	host: "localhost",
	  	user: "root",
	  	password: "MySQL@8355//",
	  	database: "users"
		});
		con.connect(function(err){
			if(err) console.log(err);
		});
		con.query(`DELETE FROM userDetails WHERE name = '${name}'`,function(err){
			if(err) throw err;
  			res.redirect('/logout');
		})
	}
});

router.get('/delete/:filename',ensureAuthenticated, function(req,res){
	const name = req.user[0].name;
	var filename = `../MyUploads/${name}/` + req.params.filename;
	fs.unlinkSync(filename, function(err){
		if(err)throw err;
	});
	var files = fs.readdirSync(`../MyUploads/${name}/`);
	res.redirect('/download');
});


router.get('/rename/:filename',ensureAuthenticated, function(req,res){
	const name = req.user[0].name;
	var filename = `../MyUploads/${name}/` + req.params.filename;
	var rename = `../MyUploads/${name}/${req.query.rename}${path.extname(req.params.filename)}`;
	fs.rename(filename, rename, function(err){
    	if ( err ) throw err;
    	var files = fs.readdirSync(`../MyUploads/${name}/`);
		res.redirect('/download');
	});
});

router.get('/termsandprivacy',function(req,res){
	res.end(`Rules : Don't be a jerk`);
});


module.exports = router;