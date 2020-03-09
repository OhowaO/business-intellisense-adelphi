const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('./auth');

const Users = mongoose.model('Users');
const OneTimePass = mongoose.model('OneTimePass');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
});

//POST new user route (optional, everyone has access)
router.post('/create', auth.optional, (req, res, next) => {
    const { body: { user } } = req;

    if(!user.email) {
	return res.status(422).json({
	    errors: {
		email: 'is required',
	    },
	});
    }

    if(!user.password) {
	return res.status(422).json({
	    errors: {
		password: 'is required',
	    },
	});
    }

    const finalUser = new Users(user);
    finalUser.setPassword(user.password);
    
    return finalUser.save()
	.then(() => res.json({ user: finalUser.toAuthJSON() }));
});

//POST login route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
    const { body: { user } } = req;
    
    if(!user.email) {
	return res.status(422).json({
	    errors: {
		email: 'is required',
	    },
	});
    }

    if(!user.password) {
	return res.status(422).json({
	    errors: {
		password: 'is required',
	    },
	});
    }

    return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
	if(err) {
	    return next(err);
	}

	if(passportUser) {
	    const user = passportUser;
	    user.token = passportUser.generateJWT();

	    OneTimePass.deleteMany({email: user.email}, function (err) {});
	    
	    const oneTime = new OneTimePass({email: user.email}); //user also contains __v
	    oneTime.setOTP();
	    oneTime.save();
	    
	    return res.json({ user: user.toAuthJSON() });
	}

	return status(400).info;
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    const { payload: { id } } = req;

    return Users.findById(id)
	.then((user) => {
	    if(!user) {
		return res.sendStatus(400);
	    }

	    return res.json({ user: user.toAuthJSON() });
	});
});

//GET route for 2FA login page
router.get('/deux', auth.required, (req, res, next) => {
    // some login page here
});

//POST route to authenticate 2FA user
router.post('/deux', auth.required, (req, res, next) => {
    const { payload: { email }, body: { code } } = req;
    var matchFound = false;

    OneTimePass.find({"email": email, "used": false}).then((passes) => {
	for (const pass of passes) {
	    const matched = pass.match(code);
	    pass.save();

	    if (matched) {
		return res.json({ user: pass.toAuthJSON()});
	    }
	}
	return res.send("uh oh wrong code bud");
    });
});

router.get('/junk', auth.complete, (req, res, next) => {
    return res.send("woohoo");
});

module.exports = router;
