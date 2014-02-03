ConvertX
========

Traditional/Simplified Chinese encoding converter.

![Screenshot](https://raw.github.com/eliangcs/chrome-convertx/master/screenshot.png)

[![](https://developers.google.com/chrome/web-store/images/branding/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/convertx/cikomljjjpdhmngldoinjdnipbbaaiok)


Developer Guide
---------------

### Installation

Install Node.js if you don't have it.

Clone this repository. `cd` into `chrome-convertx` directory and install the
dependencies:

    npm install


### Testing it on Google Chrome

1. Run `grunt browserify`. This command compile `main.js` to `bundle.js`,
   making it runnable on a browser.

2. Open Google Chrome.

3. Go to `Settings > Extensions` and click `Load unpacked extension` button.

4. Select the `chrome-convertx` directory.

5. You should be able to see **ConvertX** is added. Click `Launch` to start
   the app.


### Packaging

Generate a ZIP file that is ready to publish on Chrome App Store:

    grunt package

The ZIP file will be created in `dist` directory.


Attribution
-----------

Icons provided by:

* Oxygen Team: http://www.oxygen-icons.org/
* Yusuke Kamiyamane: http://yusukekamiyamane.com/
