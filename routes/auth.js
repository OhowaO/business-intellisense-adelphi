const jwt = require('express-jwt');

const getTokenFromHeaders = (req) => {
    const { headers: { authorization } } = req;

    if(authorization && authorization.split(' ')[0] === 'Token') {
	return authorization.split(' ')[1];
    }
    return null;
};

const auth = {
    complete: jwt({
	secret: 'twice_approved',
	userProperty: 'payload',
	getToken: getTokenFromHeaders,
    }),	
    required: jwt({
	secret: 'secret',
	userProperty: 'payload',
	getToken: getTokenFromHeaders,
    }),
    optional: jwt({
	secret: 'secret',
	userProperty: 'payload',
	getToken: getTokenFromHeaders,
	credentialsRequired: false,
    }),
};

module.exports = auth;
