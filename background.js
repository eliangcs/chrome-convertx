/* global chrome */

'use strict';

chrome.app.runtime.onLaunched.addListener(function() {
    // Center window on screen.
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var width = 420;
    var height = 450;

    chrome.app.window.create('index.html', {
        id: 'convertxWinID',
        minWidth: 420,
        minHeight: 450,
        maxWidth: 800,
        maxHeight: 450,
        bounds: {
            width: width,
            height: height,
            left: Math.round((screenWidth-width)/2),
            top: Math.round((screenHeight-height)/2)
        }
    });
});
