$(function() {

    $('#btn-choose').click(function() {
        console.log('clicked');
        chrome.fileSystem.chooseEntry({}, function(entry, fileEntries) {
            console.log(entry);
            console.log(fileEntries);
        });
    });

});
