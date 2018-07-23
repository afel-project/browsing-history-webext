document.addEventListener('DOMContentLoaded', function() {

    var c = chrome.extension.getBackgroundPage().acbh__count;

    // just to check if the upload button should be shown or not 
    // TODO : shall this be visible anyway?
    if (chrome.extension.getBackgroundPage().acbh__count == 0) {
        document.getElementById('load-btn').style.display = 'block';
    } else {
        document.getElementById('load-btn').style.display = 'none';
    }

    // at start, check if plugin is active or not 
    // shows respective panel
    if (chrome.extension.getBackgroundPage().acbh__active) {
        document.getElementById('acbh_monitor').style.display = 'block';
        document.getElementById('acbh_monitor_off').style.display = 'none';
    } else {
        document.getElementById('acbh_monitor').style.display = 'none';
        document.getElementById('acbh_monitor_off').style.display = 'block';
    }

    document.getElementById('nvisits').innerHTML = c;

    document.getElementById('stop-btn').addEventListener('click', function() {

        var bg = chrome.extension.getBackgroundPage();
        bg.acbh__active = false;

        //  TODO : check w/ MdA
        bg.acbh__count = 0;
        document.getElementById('nvisits').innerHTML = 0;
        stg.set({
            "acbh_pref_active": false
        }, function() {
            if (chrome.runtime.lastError)
                console.error('Error occurred while storing user setting for AFEL state (OFF) : ' + chrome.runtime.lastError);
            else bg.acbh__checkActivity()
        })
        // XXX Should really clear credentials when deactivating? 
        // It forces user to re-enter them upon re-activation.
        stg.remove(["acbh_dataset_id", "acbh_user_key"], function(items) {});

        document.getElementById('acbh_monitor_off').style.display = 'block';
        document.getElementById('acbh_monitor').style.display = 'none';

    });

    document.getElementById('start-btn').addEventListener('click', function() {

        var bg = chrome.extension.getBackgroundPage();
        stg.set({
            "acbh_pref_active": true
        }, function() {
            if (chrome.runtime.lastError)
                console.error('Error occurred while storing user setting for AFEL state (ON) : ' + chrome.runtime.lastError);
            else {
                bg.acbh__checkActivity();
                bg.acbh__getDatasetInfo()
            }
        })

        document.getElementById('acbh_monitor_off').style.display = 'none';
        document.getElementById('acbh_monitor').style.display = 'block';

    });

    // upload last 10 pages from history
    document.getElementById('load-btn').addEventListener('click', function() {

        // To look for history items visited in the last week,
        // subtract a week of microseconds from the current time.
        var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;

        chrome.history.search({
            'text': '',
            'startTime': oneWeekAgo,
            'maxResults': 1000
        }, function(historyItems) {

            for (var i = 0; i < historyItems.length; ++i) {
                // console.log(historyItems[i].url);
                chrome.extension.getBackgroundPage().acbh__save(historyItems[i]);
                // console.log(chrome.extension.getBackgroundPage().acbh__count);
            }
            // TODO : this is a workaround
            document.getElementById('nvisits').innerHTML = chrome.extension.getBackgroundPage().acbh__count + historyItems.length;
            document.getElementById('load-btn').style.display = 'none';
        });

    });
    
    $('[data-toggle="tooltip"]').tooltip()
    
});