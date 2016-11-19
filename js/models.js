/* MODELS */

Ligature.models.Base = Backbone.Model.extend({

    urlRoot: '/api',

    defaults: {
        // defaults
    },

    initialize: function() {
        // defaults
    },

});

Ligature.models.Note = Backbone.Model.extend({

    urlRoot: '/api',

    defaults: {
        // defaults
    },

    initialize: function() {
        // defaults
    },

});

Ligature.models.Book = Backbone.Model.extend({

    urlRoot: '/api',

    defaults: {
        // defaults
    },

    initialize: function() {
        // defaults
    },

});

/* COLLECTIONS */

Ligature.collections.Base = Backbone.Collection.extend({

    url: '/api',

    initialize: function() {
        // defaults
    },

    fetch: function(options) {
        Backbone.Collection.prototype.fetch.apply(this, _.extend(options, {
            processData: true
        }));
    }

});

Ligature.collections.NoteCollection = Backbone.Collection.extend({

    url: '/api',

    initialize: function() {
        // defaults
    },

    fetch: function(options) {
        Backbone.Collection.prototype.fetch.apply(this, _.extend(options, {
            processData: true
        }));
    }

});

Ligature.collections.BookCollection = Backbone.Collection.extend({

    url: '/api',

    initialize: function() {
        // defaults
    },

    fetch: function(options) {
        Backbone.Collection.prototype.fetch.apply(this, _.extend(options, {
            processData: true
        }));
    }

});
