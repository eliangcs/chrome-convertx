/* global chrome, require */

'use strict';

function showLoading(msg) {
    $('.status').html('<span class="icon-loading"></span> <span>' + msg + '</span>');
}

function showStatus(msg) {
    $('.status').html('<span>' + msg + '</span>');
}

function loadFile(entry) {
    showLoading('Loading...');

    entry.file(function(file) {
        var reader = new FileReader();
        reader.onerror = function(e) {
            console.log(e);
        };
        reader.onload = function(e) {
            var str = e.target.result;
            var text = iconv.decode(str, 'big5');
            $('#preview-from').text(text);
            showStatus('');
        };
        reader.readAsBinaryString(file);
    });
}

var iconv = require('iconv-lite');

$(function() {

    $('.select-file').click(function() {
        chrome.fileSystem.chooseEntry({}, function(entry) {
            loadFile(entry);
        });
    });

});


console.log(iconv);

console.log('big5: ' + iconv.encodingExists('big5'));
console.log('ascii: ' + iconv.encodingExists('ascii'));
console.log('utf-8: ' + iconv.encodingExists('utf-8'));

function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now();
  // wait for a few seconds
  var reentrant = function() {
    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
      setTimeout(reentrant, 100);
      return;
    }
    if (writer.readyState===writer.WRITING) {
      console.error("Write operation taking too long, aborting!"+
        " (current writer readyState is "+writer.readyState+")");
      writer.abort();
    }
    else {
      callback();
    }
  };
  setTimeout(reentrant, 100);
}

$(function() {

    $('#btn-choose').click(function() {
        console.log('clicked');
        chrome.fileSystem.chooseEntry({ type: 'saveFile' }, function(entry, fileEntries) {
            console.log(entry);
            console.log(fileEntries);

            entry.file(function(file) {
                var reader = new FileReader();
                reader.onerror = function(e) {
                    console.log(e);
                };
                reader.onload = function(e) {
                    var str = e.target.result;
                    var text = iconv.decode(str, 'big5');

                    console.log(text);

                    buf = iconv.encode(text, 'utf8');

                    var blob = new Blob([buf], { type: 'text/plain' });
                    entry.createWriter(function(writer) {
                        writer.truncate(blob.size);
                        waitForIO(writer, function() {
                            writer.seek(0);
                            writer.write(blob);
                        });
                    });

                    /*chrome.fileSystem.getWritableEntry(entry, buf, function(e) {
                        console.log('Write complete :)');
                    });*/
                };
                reader.readAsBinaryString(file);
            });
        });
    });

});
