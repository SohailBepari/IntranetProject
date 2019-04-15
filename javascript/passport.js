const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const passport = require('passport');

var con = mysql.createConnection(
{
	host: "localhost",
	user: "root",
	password: "DBpassword",
	database: "DBname"
});
con.connect(function(err){
if(err) console.log(err);
});
module.exports = function(passport) {
	passport.use('local' , 
    	new LocalStrategy({ usernameField: 'name', passwordField: 'password',passReqToCallback : true }, 
    		function(req, name, pass, done){
	    		con.query( `SELECT * FROM userDetails WHERE name = '${name}';`,function(err,result){
	    			
					if(err)
						return done(err);
					else if(result.length === 0){
						return done(null, false , req.flash('error_msg','Username is not registered'));
					}
					bcrypt.compare(pass , result[0].userPassword, (err, isMatch) => {
						if(err)
							throw err;
						if(isMatch){
							return done(null, result[0]);
						}
						else{
							return done(null, false , req.flash('error_msg','Password is invalid'));
						}
					});
	    		});
    	})
    );
    passport.serializeUser(function(user,done){
	    console.log("serializeUser" + user);
	    done(null, user.name);
	});
	passport.deserializeUser(function(name, done) {
		con.query(`select * from userDetails where name = '${name}'`, function (err, row){
        	done(err, row);
    	});
    });
};

