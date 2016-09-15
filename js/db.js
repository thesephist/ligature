var currentBookID,
    currentBook,
    currentNote,
    currentNoteSaved = true,
    updateTimer,
    hashHistory = [];

function htmlEscape(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

Backbone.history.on("route", function() {
    hashHistory.push(true);
});

window.addEventListener("hashchange", function() {
    if (!hashHistory.pop()) location.reload();
});

var Note = Backbone.Model.extend({

    idAttribute: "serial",

    urlRoot: "/ligature/api",

    defaults: {
        title: "Note",
        content: "",
        lastEdited: new Date().getTime()
    },

    updateLastEdited: function() {
        this.set("lastEdited", new Date().getTime());

        booklist.findWhere({ bookID: this.get("bookID") }).get("notelist").sort();
        booklist.sort();
    },

    saveError: function(model, res) {
        if (res.status != 200) {
            modal.call({
                prompt: "There was an error saving the note!"
            });
        }
    },

    updateTitle: function(newtitle) {
        this.set("title", htmlEscape(newtitle));
        this.updateLastEdited();
        this.save({}, {
            error: this.saveError
        });
    },

    updateContent: function(words) {
        this.set("content", words);
        this.updateLastEdited();
        this.save({}, {
            error: this.saveError
        });
    },

    validate: function(attrs) {
        if (!attrs.title) {
            return "A title is required!";
        } else if (!attrs.serial) {
            return "A serial for a note was not provided!";
        } else if (!attrs.lastEdited) {
            return "A last-edited JavaScript timestamp must be present!";
        }
    }

});

var NoteList = Backbone.Collection.extend({

    url: "/ligature/api",

    model: Note,

    comparator: function(note) {
        return note.get("lastEdited") * -1;
    }

});

var Book = Backbone.Model.extend({

    urlRoot: "/ligature/api",

    idAttribute: "bookID",

    validate: function(attrs) {
        if (!attrs.bookID) {
            return "A book ID is required!";
        }
    }

});

var BookList = Backbone.Collection.extend({

    url: "/ligature/api",

    model: Book,

    comparator: function(book) {
        var firstNote = book.get("notelist").first();
        return firstNote && firstNote.get("lastEdited") * -1 || -new Date().getTime();
    }

});

var NoteView = Backbone.View.extend({

    id: "content-internal",

    initialize: function(options) {
        this.eventStack = options.eventStack;
        this.eventStack.once("noteSelected", this.putAway, this);

        window.addEventListener("beforeunload", this.navAway);

        clearTimeout(updateTimer);
    },

    events: {
        "click .note-title": "renameNote",
        "click #add-note": "addNote",
        "click #delete-note": "confirmDeleteNote",
        "click #wordcount": "wordcount",
        "input textarea": "updateTracker"
    },

    saveNote: function() {
        if (this.$("textarea.note-content").length) {
            clearTimeout(updateTimer);
            var newContent = this.$("textarea.note-content").val();
            if (newContent != this.model.get("content")) {
                this.model.updateContent(newContent);
            }
        }

        currentNoteSaved = true;
    },

    navAway: function(e) {
        if (currentNoteSaved) return null;

        e.returnValue = "Your note isn't saved yet!";
        return "Your note isn't saved yet!";
    },

    updateTracker: function(evt) {
        currentNoteSaved = false;

        clearTimeout(updateTimer);
        updateTimer = setTimeout(function() {
        
            this.saveNote();
            
            $contentInternal = $("#content-internal")[0];
            $contentInternal.classList.add("synced");
            setTimeout(function() {
                $contentInternal.classList.remove("synced");
            }, 10);

        }.bind(this), 2500);
    },

    putAway: function(callback) {
        clearTimeout(updateTimer);
        this.saveNote();
        this.remove();
        this.off();

        window.removeEventListener("beforeunload", this.navAway);
        this.eventStack.off("noteSelected", this.putAway);

        callback();
    },

    renameNote: function() {
        modal.call({
            prompt: "New note title",
            type: "prompt",
            defaultText: this.model.escape("title"),
            success: function(newNoteName) {
                if (!newNoteName.trim()) return;

                this.$(".note-title.clickable").html(newNoteName);
                this.model.updateTitle(newNoteName);
            }.bind(this)
        });
    },

    addNote: function() {
        this.eventStack.trigger("newNote");
    },

    confirmDeleteNote: function() {
        modal.call({
            prompt: "Delete this note?",
            type: "confirm",
            success: this.deleteNote.bind(this)
        });
    },

    deleteNote: function() {
        clearTimeout(updateTimer);
        this.remove();
        this.off();
        this.model.destroy();
        this.eventStack.off("noteSelected", this.putAway);

        var bookid = location.href[location.href.indexOf("/ligature") + 10];
        this.eventStack.trigger("bookSelected");

        ligature.navigate(bookid, {trigger: true});
    },

    wordcount: function() {
        this.saveNote();
        var wordCount = this.model.escape("content").split(" ").length;
        
        modal.call({
            prompt: wordCount.toString() + " words"
        });
    },

    render: function() {
        this.$el.html('<div class="note-title clickable">' + this.model.escape("title") + '</div><textarea autofocus class="note-content" placeholder="Note Content">' + this.model.escape("content") + '</textarea><div id="options" class="icons"><div id="add-note" class="clickable">add</div><div id="delete-note" class="clickable">clear</div><div id="wordcount" class="clickable">done</div></div>');

        return this;
    }

});

var EmptyNoteView = Backbone.View.extend({

    id: "content-internal",

    initialize: function(options) {
        this.eventStack = options.eventStack;
        this.eventStack.once("noteSelected", this.putAway, this);
    },

    events: {
        "click #add-note": "addNote"
    },

    putAway: function(callback) {
        this.remove();
        this.off();

        this.eventStack.off("noteSelected", this.putAway);

        callback();
    },

    addNote: function() {
        this.eventStack.trigger("newNote");
    },

    render: function() {
        this.$el.html('<div id="options" class="icons"><div id="add-note" class="clickable">add</div></div>');

        return this;
    }

});

var LigatureModalView = Backbone.View.extend({

    className: "modal-shade",

    events: {
        "click .pos": "onPosClick",
        "click .neg": "onNegClick",
        "keydown": "onInput"
    },

    initialize: function() {
        this.prompt = null;
        this.type = null;
        this.success = this.fail = undefined;
        this.defaultText = "";

        this.visibility = "hidden";
    },

    call: function(data) {
        this.prompt = data.prompt || "Ligature";
        this.type = data.type || "alert";
        this.success = data.success;
        this.fail = data.fail;
        this.defaultText = data.defaultText && data.defaultText.trim() || "";

        this.show();
    },

    show: function() {
        this.visibility = "visible";
        this.render();

        setTimeout(function(){
            document.getElementById("modal-container").className = this.visibility;
            this.$(".modal-input").focus();
        }.bind(this), 50);
    },

    hide: function() {
        this.visibility = "hidden";
        this.prompt = "";
        this.type = "alert";

        document.getElementById("modal-container").className = this.visibility;
    },

    onInput: function(evt) {
        if (evt.keyCode == 13) {
            this.onPosClick();
            evt.preventDefault();
        } else if (evt.keyCode == 27) {
            this.onNegClick();
            evt.preventDefault();
        }
    },

    onPosClick: function(evt) {
        this.hide();
        if (this.success) this.success(this.$("input").val());
    },

    onNegClick: function(evt) {
        this.hide();
        if (this.fail) this.fail(this.$("input").val());
    },

    render: function() {
        this.$el.html('<div id="modal-internal" class="' + this.type + '"><div class="modal-prompt">' + this.prompt + '</div><input type="text" class="modal-input" value="' + this.defaultText + '"></input><button class="pos button">Confirm</button><button class="neg button">Cancel</button></div>');
        
        return this;
    }

});

var NoteSnippetView = Backbone.View.extend({

    className: "note-id clickable",

    events: {
        "click": "onNoteSelected"
    },

    onNoteSelected: function() {
        var targetURI = this.model.get("bookID") + "/" + this.$el.attr("data-note-id");

        if (location.href.indexOf(targetURI) == -1) {
            this.eventStack.trigger("noteSelected", function() {
                ligature.navigate(targetURI, {trigger: true});
                $("textarea.note-content").focus();
            });
        }
    },

    initialize: function(options) {
        this.model.on("change", this.render, this);
        this.eventStack = options.eventStack;
    },

    render: function() {
        titler = this.model.escape("title");
        contenter = this.model.escape("content").substr(0, 200);

        this.$el.html("<div class='note-title'>" + titler + "</div><div class='note-content'>" + contenter + "</div>");

        this.$el.attr("data-note-id", this.model.get("serial"));

        return this;
    }

});

var NoteSearchView = Backbone.View.extend({
    
    id: "searchbar",

    initialize: function(options) {
        this.eventStack = options.eventStack;
        this.book = options.book;
    },

    events: {
        "keydown": "onKeydown",
    },

    onKeydown: function(e) {
        if (e.keyCode == 13) {
            this.eventStack.trigger("searchNote", $("#searchbar > input").val().toLowerCase());
        }
    },

    render: function() {
        this.$el.html("<input type='text'/>");

        return this;
    }

});

var NoteListView = Backbone.View.extend({

    id: "note-internal",

    initialize: function(options) {
        this.eventStack = options.eventStack;
        this.book = options.book;
        this.eventStack.on("newNote", this.onNewNotePrompt, this);
        this.collection.on("add remove sort", this.render, this);
        this.eventStack.once("bookSelected", this.putAway, this);
        this.eventStack.on("searchNote", this.search, this);
    },

    onNewNotePrompt: function() {
        modal.call({
            prompt: "New note serial",
            type: "prompt",
            success: this.onNewNote.bind(this)
        });
    },

    onNewNote: function(req) {
        if (notelist.map(function(note){return note.get("serial")}).indexOf(req) > -1) {
            modal.call({
                prompt: "A note with that serial already exists!"
            });
            return;
        }

        if (req) {
            if (!/^\d/g.test(req)) {

                var newNoteID = req;
                var newNote = new Note({
                    serial: newNoteID, 
                    bookID: this.book, 
                    title: req.split("-").join(" ").replace(/\w\S*/g, function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    })
                });

                notelist.unshift(newNote);
                this.collection.unshift(newNote);
                newNote.save({}, { type: "post" });

                var targetURI = this.book + "/" + newNoteID;
                this.eventStack.trigger("noteSelected", function() {
                    ligature.navigate(targetURI, {trigger: true});
                });

                $("textarea.note-content").focus();
            } else {
                modal.call({
                    prompt: "Sorry! Note serials cannot begin with a number."
                });
            }
        }
    },

    putAway: function() {
        this.remove();
        this.off();

        this.eventStack.off("bookSelected", this.putAway);
        this.eventStack.off("searchNote", this.search);
        this.eventStack.off("newNote", this.onNewNote);
        this.collection.off();
    },

    search: function(query) {
        this.$el.html("");

        var noteSearchView = new NoteSearchView({ book: this.book, eventStack: this.eventStack });
        this.$el.append(noteSearchView.render().$el);

        matches = _.filter(this.collection.models, function(note) {
            return ( note.get("title").toLowerCase().indexOf(query) > -1 || note.get("content").toLowerCase().indexOf(query) > -1 );
        });

        matches.forEach(function(note) {
            var snippetView = new NoteSnippetView({ model: note, eventStack: this.eventStack });
            this.$el.append(snippetView.render().$el);
        }.bind(this));

        return this;        
    },

    render: function() {
        this.$el.html("");

        var noteSearchView = new NoteSearchView({ book: this.book, eventStack: this.eventStack });
        this.$el.append(noteSearchView.render().$el);
 
        this.collection.each(function(note) {
            var snippetView = new NoteSnippetView({ model: note, eventStack: this.eventStack });
            this.$el.append(snippetView.render().$el);
        }.bind(this));

        return this;
    }
  
});

var BookSnippetView = Backbone.View.extend({

    className: "book-id clickable",

    events: {
        "click": "bookSelected"
    },

    initialize: function(options) {
        this.model.on("change", this.render(), this);
        this.eventStack = options.eventStack;
    },

    bookSelected: function() {
        currentBookID = this.$el.html();
        if (location.href.indexOf("#" + currentBookID) == -1) {
            this.eventStack.trigger("bookSelected");
            this.eventStack.trigger("noteSelected", function() {
                ligature.navigate(currentBookID, {trigger: true});
            });
        }
    },

    render: function() {
        this.$el.html(this.model.get("bookID"));

        return this;
    }

});

var BookListView = Backbone.View.extend({

    id: "book-internal",

    events: {
        "click #logo": "refresh",
        "click .add-book": "addBookPrompt"
    },

    initialize: function(options) {
        this.eventStack = options.eventStack;
        this.collection.on("add remove sort", this.render, this);
    },

    refresh: function() {
        location.href = "http://random.thelifelongtraveler.com/ligature";
    },

    addBookPrompt: function() {
        modal.call({
            prompt: "New book ID",
            type: "prompt",
            success: this.addBook.bind(this)
        });
    },

    addBook: function(rawBookName) {

        var newNoteList = new NoteList();

        if (rawBookName) {
            var newBookName = rawBookName.toUpperCase();
            
            if (booklist.map(function(s){return s.get("bookID")}).indexOf(newBookName) > -1) {
                modal.call({
                    prompt: "This book ID has been used already!"
                });
                return;
            }

            var newBook = new Book({ bookID: newBookName, notelist: newNoteList });
            this.collection.add(newBook);

            this.eventStack.trigger("bookSelected");
            this.eventStack.trigger("noteSelected", function() {
                ligature.navigate(newBookName, {trigger: true});
            });
        } else {
            modal.call({
                prompt: "Invalid book ID! Please try again."
            });
        }

    },

    render: function() {
        var htmls = '<img id="logo" src="/ligature/assets/logo.png"/><div class="lig-button add-book clickable icons">add</div>';
        this.$el.html(htmls);

        this.collection.each(function(book) {
            var bookIcon = new BookSnippetView({ model: book, eventStack: this.eventStack });
            this.$el.append(bookIcon.render().$el);
        }.bind(this));

        return this;
    }

});

var eventStack = _.extend({}, Backbone.Events);

var LigatureRouter = Backbone.Router.extend({

    routes: {
        ":bookid/:noteid": "navNote",
        ":bookid": "navBook",
        "": "navAll",
        "*default": "navHome"
    },

    navAll: function() {
        var currentBookID = booklist.first().get("bookID");
        var currentNoteID = booklist.first().get("notelist").first().get("serial");

        ligature.navigate(currentBookID + "/" + currentNoteID, {trigger: true});
    },

    navHome: function() {
        var bookListView = new BookListView({ collection: booklist, eventStack: eventStack });
        $("#book-container").html(bookListView.render().$el);
    },

    navNote: function(bookid, noteid) {
        var currentBook = booklist.findWhere({ bookID: bookid });

        if (currentBook) {
            var currentNote = currentBook.get("notelist").findWhere({ serial: noteid });

            if (!currentNote) {
                currentNote = currentBook.get("notelist").first();
            }
            
            if (currentNote) {
                var noteView = new NoteView({ model: currentNote, eventStack: eventStack });
            } else {
                var noteView = new EmptyNoteView({ eventStack: eventStack });
            }
            $("#content-container").html(noteView.render().$el);

            if (Backbone.history.firstLoad) {
                this.navBook(bookid, true);
            }
        } else {
            this.navAll();
        }
    },

    navBook: function(bookid, noRenderNote) {
        var currentBook = booklist.findWhere({ bookID: bookid });

        if (currentBook) {
            var noteListView = new NoteListView({ book: currentBook.get("bookID"), collection: currentBook.get("notelist"), eventStack: eventStack });
            $("#note-container").html(noteListView.render().$el);

            if (!noRenderNote) {
                currentNote = currentBook.get("notelist").first();
                
                if (currentNote) {
                    var noteView = new NoteView({ model: currentNote, eventStack: eventStack });

                    hashHistory.push(true);
                    ligature.navigate(bookid + "/" + currentNote.get("serial"), {trigger: false});
                } else {
                    var noteView = new EmptyNoteView({ eventStack: eventStack });
                }

                $("#content-container").html(noteView.render().$el);
            }

        } else {
            this.navAll();
        }

        if (Backbone.history.firstLoad) {
            this.navHome();
        }
    }
 
});

// get notes

var bookIDs = [];
var booklist = new BookList();
var notelist = new NoteList();

notelist.fetch({
    success: parseNotelist,
    error: function(){
        modal.call({
            prompt: "There was an error loading the notes"
        });
    }
});

function parseNotelist() {

    // this could be optimized...
    notelist.each(function(note) {
        if (bookIDs.indexOf(note.get("bookID")) == -1) {
            bookIDs.push(note.get("bookID"));
        }
    });

    // populate books in booklist
    bookIDs.forEach(function(bookID) {
        notesInBook = new NoteList( _.filter(notelist.models, function(note) {return note.get("bookID") == bookID}) );

        booklist.push(new Book({ bookID: bookID, notelist: notesInBook }));
    });

    if (Backbone.history.firstLoad) {
        Backbone.history.start({ pushState: true, root: "/ligature" });
        hashHistory.pop();
    }

}

var ligature = new LigatureRouter();
Backbone.history.firstLoad = true;
Backbone.history.on("route", function() {
    Backbone.history.firstLoad = false;
});

var modal = new LigatureModalView();
$("#modal-container").html(modal.render().$el);

