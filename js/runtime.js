// RUNTIME.JS balances and checks the interaction between db.js and ui.js, also acting as the trigger for many common, application-wide events

// check for and register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ligature/lsw.js').then(function(registration) {
        console.log('Service worker registration successful');
    }).catch(function(err) {
        console.error('Service worker registration failed', err);
    });
}
