/* global $, chrome, require, s2t, t2s */

'use strict';

// Globals
var iconv = require('iconv-lite');
var candidates = {};

function updateGlyphRadios(encoding, glyph) {
    var $glyph = $('input[name="glyph"]');
    if (encoding === 'big5') {
        $('#trad').prop('checked', true).trigger('click');
        $glyph.attr('disabled', true);
    } else if (encoding === 'gbk') {
        $('#simp').prop('checked', true).trigger('click');
        $glyph.attr('disabled', true);
    } else {
        if (glyph) {
            $('#' + glyph).prop('checked', true).trigger('click');
        }
        $glyph.attr('disabled', false);
    }
}

function initUI() {
    chrome.storage.sync.get(['encoding', 'glyph'], function(items) {
        var encoding = items.encoding || 'utf8';
        var glyph = items.glyph || 'trad';

        $('#encoding-to').val(encoding);
        updateGlyphRadios(encoding, glyph);
    });
}

/*function showLoading(msg) {
    $('.status').html('<span class="icon-loading"></span> <span>' + msg + '</span>');
}*/

function showStatus(msg) {
    $('.status').html('<span>' + msg + '</span>');
}

function occurrences(string, subString, allowOverlapping){
    string+=''; subString+='';
    if(subString.length<=0) return string.length+1;

    var n=0, pos=0;
    var step=(allowOverlapping)?(1):(subString.length);

    while(true){
        pos=string.indexOf(subString,pos);
        if(pos>=0){ n++; pos+=step; } else break;
    }
    return(n);
}

function toGlyph(text, glyph) {
    var table = glyph === 'simp' ? t2s : s2t;
    var res = '';
    var c, orig;
    for (var i = 0; i < text.length; i++) {
        orig = text[i];
        c = table[orig];
        if (c) {
            res += c;
        } else {
            res += orig;
        }
    }
    return res;
}

function isUnicode(encoding) {
    return encoding.indexOf('utf') >= 0;
}

function loadFile(entry) {
    showStatus('Loading...');

    entry.file(function(file) {
        var reader = new FileReader();
        reader.onerror = function(e) {
            showStatus('Failed to load file');
        };
        reader.onload = function(e) {
            var str = e.target.result;

            var encodings = ['big5', 'gbk', 'utf8', 'utf16le', 'utf16be'];
            var i, encoding;
            for (i in encodings) {
                encoding = encodings[i];
                candidates[encoding] = iconv.decode(str, encoding);
            }

            // try to guess the file encoding
            var bestEncoding;
            var maxCount = -1;
            var count;
            for (i in candidates) {
                count = occurrences(candidates[i], '的');
                if (count > maxCount) {
                    bestEncoding = i;
                    maxCount = count;
                }
            }

            var text = candidates[bestEncoding].substring(0, 1000);

            chrome.storage.sync.get('glyph', function(items) {
                var glyph = items.glyph || 'simp';
                var newText = toGlyph(text, glyph);
                var $previewTo = $('#preview-to');
                $previewTo.val(newText);

                var encodingTo = $('#encoding-to').val();
                if (isUnicode(encodingTo)) {
                    $previewTo.addClass('unicode');
                } else {
                    $previewTo.removeClass('unicode');
                }

                updateGlyphRadios(encodingTo);
            });

            var $previewFrom = $('#preview-from');
            $previewFrom.val(text);
            if (isUnicode(bestEncoding)) {
                $previewFrom.addClass('unicode');
            } else {
                $previewFrom.removeClass('unicode');
            }

            $('#encoding-from').removeAttr('disabled').val(bestEncoding);
            $('#encoding-to').removeAttr('disabled');
            $('#trad').removeAttr('disabled');
            $('#simp').removeAttr('disabled');
            $('#save-as').removeAttr('disabled');

            showStatus('');
        };
        reader.readAsBinaryString(file);
    });
}

$(function() {

    initUI();

    $('.select-file').click(function() {
        chrome.fileSystem.chooseEntry({}, function(entry) {
            if (entry) {
                loadFile(entry);
            }
        });
    });

    $('#encoding-from').change(function() {
        var encoding = $(this).val();
        var text = candidates[encoding].substring(0, 1000);
        $('#preview-from').val(text);

        var $preview = $('#preview-from');
        if (isUnicode(encoding)) {
            $preview.addClass('unicode');
        } else {
            $preview.removeClass('unicode');
        }
    });

    $('#encoding-to').change(function() {
        var encoding = $(this).val();
        chrome.storage.sync.set({ encoding: encoding });

        updateGlyphRadios(encoding);

        var $preview = $('#preview-to');
        if (isUnicode(encoding)) {
            $preview.addClass('unicode');
        } else {
            $preview.removeClass('unicode');
        }
    });

    $('input[name="glyph"]').click(function() {
        var glyph = $('input[name="glyph"]:checked').val();
        console.log('Glyph: ' + glyph);
        var text = $('#preview-from').val();
        text = toGlyph(text, glyph);
        $('#preview-to').val(text);

        chrome.storage.sync.set({ glyph: glyph });
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

            if (entry === undefined) {
                showStatus('');
                return;
            }

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
