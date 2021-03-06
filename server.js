const fs = require('fs');
const http = require('http');
const mysql = require('mysql');
const V = require("./v.js");

function preprocess(request, response, callback) {
    var queryData = "";

    if (typeof callback !== 'function') return null;

    if (request.method == 'POST' || request.method == "PUT") {
        request.on('data', function(data) {
            queryData += data;

            if (queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        return null;
    }
}

// global MySQL ligature connection
var consecutiveFatalCounts = 0;
var connection;

function makeConnection() {

    const key = fs.readFileSync("./polyx.key", "utf8").trim();

    connection = mysql.createConnection({
        host  : 'tltserve',
        user  : 'thesephist',
        password  : V.decryptor(key, V.rs_w("mysql"), "hex"),
        database : 'ligature'
    });

    connection.on("error", function(err) {
        errorHandler(err);
    });
}

function openConnection() {
    connection.connect(function(err){
        if (err) {
            errorHandler(err);
        } else {
            console.log("Connected to Ligature Database");
            consecutiveFatalCounts = 0;
        }
    });
}

function errorHandler(err) {
    if (err.fatal) {

        if (consecutiveFatalCounts > 32) {
            console.log("Fatal error occured more than 32 times in a row, attempting to reestablish connection in 30 seconds");

            setTimeout(makeConnection, 24000);
            setTimeout(openConnection, 30000);
            return;
        }

        console.log("Fatal error below; retrying connection...");
        consecutiveFatalCounts++;

        makeConnection();
        openConnection();
    } else {
        console.log("Non-fatal error occured below.");
    }

    console.log("Error Code", err.code);
    console.log("Fatal Error Count", consecutiveFatalCounts);
    console.log("Server Time", new Date());
}

// serial || bookID || title || content || lastEdited
// text   || char   || text  || text    || double (20) JS timestamp

// get all notes
function getAll(res) {
    var query = connection.query('SELECT * FROM notes', function(err, rows) {
        if (err) {
            errorHandler(err);

            res.statusCode = 500;
        }

        res.end(JSON.stringify(rows)); // returned as a list of JSON objects
    });
}

// get from notebook
function getFromNotebook(bookID, res) {
    var query = connection.query('SELECT * FROM notes WHERE bookID="' + bookID + '"', function(err, rows) {
        if (err) {
            errorHandler(err);

            res.statusCode = 500;
        }

        res.end(JSON.stringify(rows)); // returned as a list of JSON objects
    });
}

// get note
function getNote(serial, res) {
    var query = connection.query('SELECT * FROM notes WHERE serial="' + serial + '"', function(err, rows) {
        if (err) {
            res.statusCode = 500;
            res.end('{ action: "get", serial: serial, result: "fail" }');

            errorHandler(err);
        }

        res.end(JSON.stringify(rows));
    });
}

// add note
function createNote(bookID, serial, title, content, lastEdited, res) {
    var query = connection.query('INSERT INTO notes (bookID, serial, title, content, lastEdited) VALUES ("' + bookID + '", "' + serial + '", "' + title + '", "' + content + '", "' + lastEdited + '")', function(err, rows) {
        if (err) {
            res.statusCode = 500;
            res.end('{ action: "create", serial: serial, result: "fail" }');

            errorHandler(err);
        }

        res.end(JSON.stringify(rows));
    });
}

// delete note
function deleteNote(serial, res) {
    var query = connection.query('DELETE FROM notes WHERE serial="' + serial + '"', function(err, rows) {
        if (err) {
            res.statusCode = 500;
            res.end('{ action: "delete", serial: serial, result: "fail" }');

            errorHandler(err);
        }

        res.end(JSON.stringify(rows));
    });
}

// update note
function updateNote(bookID, serial, title, content, lastEdited, res) {
    var query = connection.query('UPDATE notes SET bookID="' + bookID + '", title="' + title + '", content="' + content + '", lastEdited="' + lastEdited + '" WHERE serial="' + serial + '"', function(err, rows) {
        if (err) {
            res.statusCode = 500;
            res.end('{ action: "update", serial: serial, result: "fail" }');

            errorHandler(err);
        }

        res.end(JSON.stringify(rows));
    });
}

// make HTTP server
var app = http.createServer(function(req, res) {

    console.log(req.method, req.url, req.headers.referer);

    res.setHeader('Content-Type', 'application/json');

    noteID = req.url.split("ligature/api/")[1];

    if (req.method == "GET") {
        if (noteID) {
            getNote(noteID, res);
        } else {
            getAll(res);
        }
    } else if (req.method == "DELETE") {
        if (noteID) {
            deleteNote(noteID, res);
        }
    }

    preprocess(req, res, function() {

        bookID = req.post.bookID;
        serial = req.post.serial.replace(/"/g, '\\"');
        title = req.post.title.replace(/"/g, '\\"');
        content = req.post.content.replace(/"/g, '\\"');
        lastEdited = req.post.lastEdited;

        if (req.method == "POST") {
            createNote(bookID, serial, title, content, lastEdited, res);
        } else if (req.method == "PUT") {
            updateNote(bookID, serial, title, content, lastEdited, res);
        }
    });

});

// start server
makeConnection();
openConnection();
app.listen(1998);
