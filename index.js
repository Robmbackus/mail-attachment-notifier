var notifier = require('mail-notifier');
var async = require('async');
var fs = require('fs'),
    csv = require('csv-stream'),
    xlsx = require('xlsx-to-json'),
    AdmZip = require('adm-zip'),
    mime = require('mime'),
    uuid = require('node-uuid'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;


function ProcessAttachments(filePath, fileExtension, callback) {

    function processFile() {
        switch (fileExtension) {
            case 'csv':

                csvToJson(filePath, function (err, result) {
                    callback(err, result);
                })
                break;
            case 'xlsx':

                xlsxToJson(filePath, function (err, result) {
                    callback(err, result);
                })
                break
            case 'txt':

                readText(filePath, function (err, result) {
                    callback(err, result);
                })
                break
        }
    }

    if (fileExtension == 'zip') {
        unzipAttachment(filePath, function (newPath, newExtension) {
            processFile(newPath)
        });
    } else {
        processFile(filePath)
    }

}

function unzipAttachment(filePath, callback) {
    var newPath;

    var zip = new AdmZip(filePath);
    var zipEntries = zip.getEntries(); // an array of ZipEntry records

    zipEntries.forEach(function (zipEntry) {
        if (zipEntry.isDirectory == false && zipEntry.name.indexOf('._') < 0) {
            var contentType = mime.lookup(zipEntry.name);
            var fileExtension = mime.extension(contentType);
            var fileName = uuid.v1() + '.' + fileExtension;
            var newPath = '/tmp/' + fileName;

            fs.writeFile(newPath, zipEntry.getData(), function (err) {
                callback(newPath, fileExtension);
            })
        }

    });

}

function readText(filePath, callback) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        console.log(data)
        callback(false, data);
    });
}


function csvToJson(filePath, callback) {
    var dataList = [];
    var csvStream = csv.createStream(options);
    var options = {
        // delimiter : '\t', // default is ,
        endLine: '\r\n', // default is \n,
        // columns : ['columnName1', 'columnName2'], // by default read the first line and use values found as columns
        escapeChar: '"', // default is an empty string
        enclosedChar: '"' // default is an empty string
    }

    fs.createReadStream(filePath, {autoClose: true})
        .pipe(csvStream)
        .on('close', function (f) {
            callback(false, dataList)
        })
        .on('error', function (err) {
            console.log(err)
        })
        .on('data', function (data) {
            dataList.push(data);
        })

}

function xlsxToJson(filePath, callback) {

    xlsx({
        input: filePath,
        output: null
    }, function (err, data) {
        if (err) {
            console.error(err);
            callback(true, null)
        } else {
            //Array of data
            callback(false, data)

        }
    });
}

var n;

function MailAttachment(opts) {
    EventEmitter.call(this);
    n = notifier(opts)
    var self = this;
    self.options = opts;

}

util.inherits(MailAttachment, EventEmitter);

MailAttachment.prototype.start = function(){
    var self = this;
    n.on('mail', function (mail) {
        console.log(mail);
        if (mail.attachments) {
            async.each(mail.attachments, function (attachment, callback) {
                var filePath = self.options.directory + '/' + attachment.fileName;
                fs.writeFile(filePath, attachment.content, function (err) {
                    if (err) {
                        console.log(err)
                    } else {

                        var fileExtension = mime.extension(attachment.contentType);

                        ProcessAttachments(filePath, fileExtension, function (err, result) {

                            var event = {
                                date:mail.date,
                                from:mail.from,
                                to:mail.to,
                                subject:mail.subject,
                                fileName:attachment.fileName,
                                contentType:attachment.contentType,
                                extention:fileExtension,
                                path:filePath,
                                data:result
                            }

                            self.emit('attachment', event);

                        })

                    }
                });

            })

        }

    }).start()
}

MailAttachment.prototype.stop = function () {
    n.stop();
}

module.exports = function (opts) {

    return new MailAttachment(opts);

};
