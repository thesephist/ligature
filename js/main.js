Ligature.init = function() {

    // serviceWorker check -- disabled for now
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.register('sw.js').then(function(registration) {
    //         console.log('Service worker registration successful');
    //     }).catch(function(err) {
    //         console.error('Service worker registration failed', err);
    //     });
    // }

    // instantiate collections
    Ligature.objects.notes = new Ligature.collections.NoteCollection();
    Ligature.objects.books = new Ligature.collections.BookCollection();

    // instantiate views
    Ligature.singletonViews.app = new Ligature.views.App();
    Ligature.core = new Ligature.viewManager();

    // router
    Ligature.router = new Ligature.Router();

    // attach views
    $("#content").append(Ligature.singletonViews.app.render().$el);

    // load questions and choices
    Ligature.objects.notes.fetch();

    console.info('Ligature initialized');

};

Ligature.init();
