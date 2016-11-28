/* VIEW MANAGER */

Ligature.viewManager = Ligature.models.Base.extend({

    initialize: function() {
        this.attributes = {
            notesLoaded: false,
            dirtyEdits: false,

            activeBook: false,
            activeNote: false,

            editingMode: 'overview'
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

Ligature.views.Sidebar = Backbone.View.extend({

    className: 'sidebar',
    header: false,
    booklist: false,

    template: '',

    events: {},

    initialize: function(attrs) {
        this.header = new Ligature.views.Header();
        this.booklist = new Ligature.views.BookList();

        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        this.$el.append(this.header.render().$el);
        this.$el.append(this.booklist.render().$el);

        return this;
    }

});

Ligature.views.Header = Backbone.View.extend({

    tagName: 'header',
    toolbar: false,

    template: `
      <a href="/">
        Ligature
      </a>
    `,

    events: {},

    initialize: function(attrs) {
        this.toolbar = new Ligature.views.Toolbar();
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        this.$el.append(this.toolbar.render().$el);

        return this;
    }

});

Ligature.views.Toolbar = Backbone.View.extend({

    className: 'toolbar',

    template: `
      <div>
        <button class="add">add</button>
        <button class="collapse">collapse</button>
        <button class="search">search</button>

        <input class="searchbar" type="text" placeholder="search"></input>
      </div>
    `,

    events: {
        'click .add': 'addClick',
        'click .collapse': 'collapseClick',
        'click .search': 'searchClick',
        'keydown .searchbar': 'searchInput'
    },

    addClick: function(evt) {

    },

    collapseClick: function(evt) {

    },

    searchClick: function(evt) {

    },

    searchInput: function(evt) {

    },

    initialize: function(attrs) {
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.BookList = Backbone.View.extend({

    className: 'booklist',
    books: false,

    template: '',

    events: {},

    initialize: function(attrs) {
        this.books = Ligature.objects.books.map(bookModel =>
            new Ligature.views.BookListItem({ model: bookModel })
        );

        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        this.books.forEach(bookView => this.$el.append(bookView.render().$el));

        return this;
    }

});

Ligature.views.BookListItem = Backbone.View.extend({

    className: 'booklistItem',
    expanded: false,
    notelist: false,

    template: `
      <div class="bookname">
      </div>

      <div class="lastEdited">
      </div>
      <div class="noteCount">
      </div>

      <div class="notes expanded${this.expanded}">
      </div>
    `,

    events: {
        'click': 'select'
    },

    initialize: function(attrs) {
        this.notelist = new Ligature.views.NoteList({ model: this.model });
        this.render();
    },

    select: function(evt) {
        this.expanded = !this.expanded;
        this.render();
    },

    render: function() {
        this.$el.html(this.template);

        this.$('.bookname').html(this.model.get('name'));
        this.$('.lastEdited').html(this.model.get('notes').first().get('timestamp'));
        this.$('.noteCount').html(this.model.get('notes').length);
        this.$el.append(this.notelist.render().$el);

        return this;
    }

});

Ligature.views.NoteList = Backbone.View.extend({

    className: 'notelist',
    notes: false,

    template: '',

    events: {},

    initialize: function(attrs) {
        this.notes = Ligature.objects.notes.map(noteModel =>
            new Ligature.views.NoteListItem({ model: noteModel })
        );

        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        this.books.forEach(noteView => this.$el.append(noteView.render().$el));

        return this;
    }

});

Ligature.views.NoteListItem = Backbone.View.extend({

    className: 'notelistItem',
    buttonset: false,

    template: `
      <div class="title">
      </div>
      <div class="firstline">
      </div>

      <div class="buttonset">
      </div>
    `,

    events: {
        'click': 'select'
    },

    initialize: function(attrs) {
        this.buttonset = new Ligature.views.NoteButtonSet();
        this.render();
    },

    select: function(evt) {
        Ligature.viewManager.set('activeNote', this.model);
    },

    render: function() {
        this.$el.html(this.template);

        this.$('.title').html(this.model.get('title'));
        this.$('.firstline').html(this.model.get('content').substr(0, 100));
        this.$('.buttonset').html(this.buttonset.render().$el);

        return this;
    }

});

Ligature.views.NoteButtonSet = Backbone.View.extend({

    className: 'notebuttonset',

    template: `
      <button class="back">back</button>
      <button class="copy">copy</button>
      <button class="delete">delete</button>
    `,

    events: {
        'click .back': 'backClick',
        'click .copy': 'copyClick',
        'click .delete': 'deleteClick'
    },

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
    buttonset: false,

    template: `
      <button class='modeSwitch'>mode</button>
      <div class="buttonset">
      </div>

      <div class="titlebar">
      </div>

      <div class="metadatabar">
        <span class="lastEdited"></span> |
        <span class="words"></span> |
        <span class="chars"></span>
      </div>

      <textarea class="content">
      </textarea>
    `,

    events: {
        'click .modeSwitch': 'modeSwitch',
        'click .titlebar': 'setTitle'
    },

    initialize: function(attrs) {
        this.buttonset = new Ligature.views.NoteButtonSet();

        this.render();
    },

    render: function() {
        this.$el.html(this.template);

        const activeNote = Ligature.viewManager.get('activeNote');

        this.$('.titlebar').html(activeNote.get('title'));
        this.$('.content').val(activeNote.get('content'));

        this.$('.lastEdited').html(activeNote.get('timestamp'));
        this.$('.words').html(activeNote.get('content').split(' ').length);
        this.$('.chars').html(activeNote.get('content').length);

        this.$('.buttonset').html(this.buttonset.render().$el);

        return this;
    }

});

Ligature.views.Modal = Backbone.View.extend({

    id: 'modal',

    template: `
      <div class="copy">
      </div>

      <input class="modalInput"></input>

      <button class="bad">Cancel</button>
      <button class="good">Ok</button>
    `,

    events: {
        'click .good': 'goodClick',
        'click .bad': 'badClick'
    },

    initialize: function(attrs) {
        this.render();
    },

    goodClick: function(evt) {

    },

    badClick: function(evt) {

    },

    alert: function(options) {

    },

    confirm: function(options) {

    },

    prompt: function(options) {

    },

    _call: function(copy, showInput, showBad, goodCallback, badCallback) {

    },

    render: function() {
        this.$el.html(this.template);
        return this;
    }

});

Ligature.views.App = Backbone.View.extend({

    template: '',
    sidebar: false,
    editor: false,

    events: {},

    initialize: function(attrs) {
        this.sidebar = new Ligature.views.Sidebar();
        this.editor = new Ligature.views.Editor();
        this.modal = new Ligature.views.Modal();
        this.render();
    },

    render: function() {
        this.$el.html(this.template);
        this.$el.append(this.sidebar.render().$el);
        this.$el.append(this.editor.render().$el);
        this.$el.append(this.modal.render().$el);

        return this;
    }

});
