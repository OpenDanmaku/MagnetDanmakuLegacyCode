/*
 rest.js
 implement of rest style interface
 */
var connection = require('./connection');

module.exports = function (app, config) {

    var urlPrefix = config.urlPrefix || "";
    var logger = config.logger;
    var dbOptions = config.dbOptions || {};

    if (!logger) {
        throw new Error("Config should contain a logger!");
    }

    var dbConnectionStr;
    if (typeof config.db === 'string') {
        dbConnectionStr = config.db;
    } else {
        throw new Error('config.db is not defined!');
    }

    logger.verbose("Database options: ");
    logger.verbose(dbOptions);

    // interface for test
    app.get(urlPrefix + '/ping', function (req, res) {
        res.json({data: "pong"});
    });

    /**
     * Query
     */
    app.get(urlPrefix + '/*', function (req, res) {
        logger.verbose('get method');
        res.json({ok: 1});
    });

    /**
     * Insert
     */
    app.post(urlPrefix + '/*', function (req, res) {
        logger.verbose('post method:');
        res.json({ok: 1});
    });

    /**
     * Update
     */
    app.put(urlPrefix + '/*', function (req, res) {
        logger.verbose('put method');
        res.json({ok: 1});
    });

    /**
     * Delete
     */
    app.delete(urlPrefix + '/*', function (req, res) {
        logger.verbose('delete method');
        res.json({ok: 1});
    });
};