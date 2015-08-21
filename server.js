/*
 This is main file.
 */

var fs = require("fs");
var path = require("path");
var express = require('express');
var https = require('https');
var bodyParser = require('body-parser');

// Default logger to use, if none is passed in.
var defaultLogger = {
    verbose: function (msg) {
        if (process.argv.indexOf("-v") != -1) {
            console.log(msg);
        }
    },
    info: function (msg) {
        console.log(msg);
    },

    warn: function (msg) {
        console.log(msg);
    },

    error: function (msg) {
        console.log(msg);
    }
};

var defaultConfig = {
    db: 'magnetdb://localhost:2333',
    server: {
        port: 3000,
        address: "0.0.0.0"
    },
    accessControl: {
        allowOrigin: "*",
        allowMethods: "GET,POST,PUT,DELETE,HEAD,OPTIONS",
        allowCredentials: false
    },
    dbOptions: {
    },
    humanReadableOutput: true,
    collectionOutputType: "json",
    urlPrefix: "",
    logger: defaultLogger,
    ssl: {
        enabled: false,
        options: {}
    }
};

var server;

module.exports = {
    // Start the REST API server.
    startServer: function (config, started) {
        var logger = (config && config.logger) || defaultLogger;
        var curDir = process.cwd();
        logger.verbose("Current directory: " + curDir);
        if (!config) {
            var configFilePath = path.join(curDir, "config.json");
            if (fs.existsSync(configFilePath)) {
                logger.verbose("Loading configuration from: " + configFilePath);
                config = JSON.parse(fs.readFileSync(configFilePath));
                config.logger = defaultLogger;
            }
            else {
                logger.verbose("Using default configuration.");
                logger.verbose("Please put config.json in current directory to customize configuration.");
                config = defaultConfig;
            }
        } else {
            if (!config.logger) {
                config.logger = defaultLogger;
            }
        }

        var app = express();

        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        if (config.humanReadableOutput) {
            app.set('json spaces', 4);
        }

        if (config.accessControl) {
            var accesscontrol = require('./lib/accesscontrol')(config);
            app.use(accesscontrol.handle);
        }

        app.get('/favicon.ico', function (req, res) {
            res.status(404);
            res.json();
        });

        if (!config.db) {
            config.db = "magnetdb://localhost:2333";
        }

        require('./lib/rest')(app, config);

        logger.verbose('Input Configuration:');
        logger.verbose(config);

        if (!config.server) {
            config.server = {};
        }

        if (!config.server.address) {
            config.server.address = "0.0.0.0";
        }

        if (!config.server.port) {
            config.server.port = 3000;
        }

        logger.verbose('Configuration with defaults applied:');
        logger.verbose(config);

        var host = config.server.address;
        var port = config.server.port;
        var ssl = config.ssl || {enabled: false, options: {}};

        logger.verbose('Starting magnet-danmaku server: ' + host + ":" + port);
        logger.verbose('Connecting to db ' + JSON.stringify(config.db, null, 4));

        var start = function (err) {
            if (err != null) {
                logger.error('error:', err);
            } else {
                logger.verbose('Now listening on: ' + host + ":" + port + ' SSL:' + ssl.enabled);
                if (started) {
                    started();
                }
            }
        };

        if (ssl.enabled) {
            if (ssl.keyFile) {
                ssl.options.key = fs.readFileSync(ssl.keyFile);
            }
            if (ssl.certificate) {
                ssl.options.cert = fs.readFileSync(ssl.certificate);
            }
            server = https.createServer(ssl.options, app).listen(port, host, start);
        } else {
            server = app.listen(port, host, start);
        }

    },

    // Stop the REST API server.
    stopServer: function () {
        if (server) {
            server.close();
            server = null;
        }
    }
};

if (process.argv.length >= 2) {
    if (process.argv[1].indexOf('server.js') != -1) {
        // Auto start server when run as 'node server.js'
        module.exports.startServer();
    }
}
