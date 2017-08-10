# mail-attachment-notifer
Processes incoming csv and xlsx mail attachments and notifies node.js with the files converted to json

introduction
------------
Built on the popular [mail-notifier](https://www.npmjs.com/package/mail-notifier) module by [jcreigno](https://www.npmjs.com/~jcreigno), this module aims to provide streamlined attachment handling
for CSV and Excel XLSX files. When a new mail arrives, it is scanned for attachments, csv, xlsx, and txt files will be converted into json and a 'attachment' event will be emitted.

This module will also handle `.zip` files. Each file within the zip directory will be parsed and a separate event for each file will be emitted.

Getting Started
--------
Watch for attachments:

```javascript
var attachmentNotifier = require('mail-attachment-notifier');

const imap = {
  user: "yourimapuser",
  password: "yourimappassword",
  host: "imap.host.com",
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};

var listenAttachments = attachmentNotifier(imap);

  listenAttachments.on('attachment', data => console.log(data));
  listenAttachments.start();
  listenAttachments.stop();
```




installation
------------

    $ npm install mail-attachment-notifier

API
===

Configuration built on [mail-notifier](https://www.npmjs.com/package/mail-notifier) implementation

attachmentNotifier(config)
----------------
The constructor function creates a new `attachmentNotifier`. Parameter provide options needed for imap connection.
`config` :

* `host` :  imap server host
* `port` :  imap server port number
* `user` :  imap user name
* `password` :  imap password
* `tls` :  need a tls connection to server
* `tlsOptions` : see `tls` module options
* `markSeen`: mark mail as read defaults to true
* `box` : mail box read from defaults to 'INBOX'
* `search`: search query defaults to ['UNSEEN']
* `debug`: *function* - if set, the function will be called with one argument, a string containing some debug info. Default: debug output if [enabled](#debugging).


.start()
------------------------------------
Start listening for incomming mail/attachments.

.stop()
------------------------------------
Stop listening and close IMAP connection.

Dependencies
============

This module relies heavily on [node-imap](https://github.com/mscdex/node-imap). For more advanced usage, please consider
using it directly.
