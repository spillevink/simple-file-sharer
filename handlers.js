var config   = require('./config'),
    mime     = require('mime'),
    crypto   = require('crypto'),
    sqlite   = require('sqlite3'),
    fs       = require('fs'),

    db       = new sqlite.Database(config.db_name),

    handlers = {
        'home'       : serveHome,
        'upload'     : serveUpload,
        'static'     : serveStatic,
        'favicon.ico': serveFavicon,
        'd'          : serveDownload
    };

// Create table if it doesn't already exist.
db.run("CREATE TABLE IF NOT EXISTS uploaded_files (fid INTEGER PRIMARY KEY AUTOINCREMENT, fileName TEXT, sha TEXT, timestamp INTEGER DEFAULT (strftime('%s', 'now')), remote_ip INTEGER)");

// Serve / and /home
function serveHome(response, pathname, postData, request) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync(config.static_dir+'/index.html'));
    return true;
}

// Serve favicon.ico
function serveFavicon(response, pathname, postData, request) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'});
    response.end(fs.readFileSync(config.static_dir+'/favicon.ico'));
    return true;
}

// Handle uploads, save them to a file and add it to the database
function serveUpload(response, pathname, postData, request) {
    if(!postData) { return false; }

    var file              = JSON.parse(postData);
    var originalFileName  = file.name;
    var remoteAddress     = request.connection.remoteAddress;
    var fileName          = crypto.createHash('sha256').update(file.name + (new Date().getTime()) + config.secret + remoteAddress).digest("hex");

    file.contents = file.contents.split(',').pop();
    var fileBuffer = new Buffer(file.contents, "base64");
    fs.writeFileSync(config.upload_dir+'/'+fileName, fileBuffer);

    var stmt = db.prepare('INSERT INTO uploaded_files (fileName, sha, remote_ip) VALUES (?,?,?)');
    stmt.run(originalFileName, fileName, remoteAddress);
    stmt.finalize();

    response.write(JSON.stringify({'fileName':fileName}));
    response.statusCode = 200;
    response.end();
    return true;

}

// Handle static files
function serveStatic(response, pathname, postData, request) {
    if(!fs.existsSync('.'+pathname)) {
        console.log('ERROR: Unknown file.', pathname);
        return false;
    }
    var mimeType = mime.lookup('.'+pathname);
    response.writeHead(200, {'Content-Type': mimeType});
    response.end(fs.readFileSync('.' + pathname));
    return true;

}

// Handle download requests
function serveDownload(response, pathname, postData, request) {
    var pathArr = pathname.split('/');
    var sha = pathArr[pathArr.length-1].replace(/[^a-f0-9]/g,'');

    var query = "SELECT fileName FROM uploaded_files WHERE sha = ?";
    db.get(query, [sha], function(err, row) {

        if (null == row || null == row.fileName) {
            console.log('ERROR: Unknown hash.', sha);
            return false;
        }

        var fileName = config.upload_dir+'/'+sha;
        if (!fs.existsSync(fileName)) {
            console.log('ERROR: No such file.', fileName);
            return false;
        }

        var header = {};
        var realFileName = row.fileName;

        var mimeType = mime.lookup(realFileName);
        if (mimeType.split('/')[0] != 'image')
            header['Content-Disposition'] = 'attachment; filename=' + realFileName;

        header['Content-Type'] = mimeType;
        response.writeHead(200, header);
        response.end(fs.readFileSync(fileName));
        return true;

    });

}

// return the correct function based on path
function getHandler(path) {
    return handlers[path];
}

exports.getHandler = getHandler;
