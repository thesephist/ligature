/* VIEW MANAGER */

Ligature.viewManager = Ligature.models.Base.extend({

    initialize: function() {
        this.attributes = {
            notesLoaded: false,
            dirtyEdits: false,

            activeBook: false,
            activeNote: false,

            openBooks: [],
            editingMode: false
        };
    },

    changeMode: function(mode) {
        if (mode === 'overview') {
            // do things
        } else if (mode === 'editing') {
            // do things
        } else {
            console.warn(`${mode} isn't a valid editing mode!`);
        }
    }

});

/* VIEWS */

Ligature.views.Base = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.Header = Backbone.View.extend({

    tagName: 'header',
    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.Toolbar = Backbone.View.extend({

    className: 'toolbar',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.BookList = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.BookListItem = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.BookDropdown = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.NoteList = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.NoteListItem = Backbone.View.extend({

    className: '',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.Sidebar = Backbone.View.extend({

    id: 'sidebar',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.Editor = Backbone.View.extend({

    id: 'editor',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.ModeButton = Backbone.View.extend({

    tagName: 'button',
    id: 'mode-button',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.Modal = Backbone.View.extend({

    id: 'modal',

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.App = Backbone.View.extend({

    template: `
      <div></div>
    `,

    events: {},

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});
