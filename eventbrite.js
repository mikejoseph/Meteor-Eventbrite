/**
 * Eventbrite API wrapper for Meteor
 *
 * Heavily inspired by eventbrite-node by evenemento
 * https://github.com/evenemento/eventbrite-node
 *
 * @author Mike Joseph <mike@mode3.net>
 * @copyright Mike Joseph
 * @license MIT
 * @see https://github.com/evenemento/eventbrite-node
 */

var url = Npm.require('url'),
    https = Npm.require('https'),
    queryString = Npm.require('querystring');

var OAUTH_URL = 'https://www.eventbrite.com/oauth/authorize',
    AUTH_HOST = 'www.eventbrite.com',
    AUTH_PATH = '/oauth/token',
    API_HOST = 'www.eventbriteapi.com',
    API_PATH = '/v3';

/**
 * Constructor
 * @param {string} clientKey    Client ID
 * @param {string} clientSecret Client Secret Key
 */
Eventbrite = function(clientKey, clientSecret) {

    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
    this.accessToken = false;
};

/**
 * Format and return oAuth url
 * @return {string}
 */
Eventbrite.prototype.getOAuthUrl = function() {
    var params = {
        'response_type': 'code',
        'client_id': this.clientKey
    };

    var oauthUrl = url.parse(OAUTH_URL);
    oauthUrl.query = params;

    return url.format(oauthUrl);
};

/**
 * Exchange auth token for bearer token
 * @param  {string} code auth token
 * @return {string}      bearer token
 */
Eventbrite.prototype.authorize = function(code) {
    var delayed = Async.wrap(this, 'performGetToken');
    return delayed(code);
};

/**
 * Set bearer token
 * @param {string} tok bearer token
 * @return {object} self
 */
Eventbrite.prototype.setToken = function(tok) {
    this.accessToken = tok;
    return this;
};

/**
 * Perform a API GET call
 * @param  {string} path   Local API path
 * @param  {object} params Dict of params
 * @return {object}        Result data
 */
Eventbrite.prototype.get = function(path, params) {
    var delayed = Async.wrap(this, 'performGet');
    return delayed(path, params);
};

/**
 * Perform a API POST call
 * @param  {string} path   Local API path
 * @param  {object} params Dict of params
 * @return {object}        Result data
 */
Eventbrite.prototype.post = function(path, params) {
    var delayed = Async.wrap(this, 'performPost');
    return delayed(path, params);
};

// Private functions
Eventbrite.prototype.performGetToken = function(code, callback) {
    if (!this.accessToken) {
        throw "TokenException";
    }

    var formData = {
        code: code,
        grant_type: 'authorization_code',
        client_secret: this.clientSecret,
        client_id: this.clientKey
    };
    formData = queryString.stringify(formData);

    var opts = {
        host: AUTH_HOST,
        path: AUTH_PATH,
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-length': Buffer.byteLength(formData)
        }
    };

    var returnData = '';
    var req = https.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            returnData += chunk;
        });
        res.on('end', function() {
            callback(null, JSON.parse(returnData));
        });
    });
    req.write(formData);
    req.end();
};

Eventbrite.prototype.performGet = function(path, params, callback) {
    if (!this.accessToken) {
        throw "TokenException";
    }

    if(path[0] === '/') {
      path = path.substr(1);
    }

    var opts = {
        host: API_HOST,
        path: API_PATH + '/' + path,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + this.accessToken
        }
    };

    var returnData = '';
    var req = https.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            returnData += chunk;
        });
        res.on('end', function() {
            callback(null, JSON.parse(returnData));
        });
    });
    req.write(queryString.stringify(params));
    req.end();
};

Eventbrite.prototype.performPost = function(path, params, callback) {
    if(path[0] === '/') {
      path = path.substr(1);
    }

    var formData = queryString.stringify(params);

    var opts = {
        host: API_HOST,
        path: API_PATH + '/' + path,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + this.accessToken,
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-length': Buffer.byteLength(formData)
        }
    };

    var returnData = '';
    var req = https.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            returnData += chunk;
        });
        res.on('end', function() {
            callback(null, JSON.parse(returnData));
        });
    });
    req.write(formData);
    req.end();
};