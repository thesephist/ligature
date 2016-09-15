var nightEnabled = false,
    $app = e("app-container"),
    keybindings = {
        // keyCode : function name
        "66": function() {$(".add-book").click()},
        "78": function() {eventStack.trigger("newNote")},
        "88": function() {$("#delete-note").click()},
        "87": function() {$("#wordcount").click()},
        "82": function() {$(".note-title.clickable").click()},
        "190": night
    };

function e(id){return document.getElementById(id)}

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else {
        input.focus();
    }
}

function night(onload) {
    if (onload) {
        if ("localStorage" in window) {
            nightEnabled = localStorage.getItem("nightEnabled") == "true";
        }
    } else {
        nightEnabled = !nightEnabled;
    }

    document.body.classList.toggle("night", nightEnabled);
    if ("localStorage" in window) {
        localStorage.setItem("nightEnabled", nightEnabled);
    }
}

function setAppSize() {
    $app.style.height = window.innerHeight + "px";
    $app.style.width = window.innerWidth + "px";
}

$app.addEventListener("keydown", function(evt) {
    if (!evt.altKey) return;
    if (keybindings[evt.keyCode.toString()]) {
        evt.preventDefault();
        keybindings[evt.keyCode.toString()]();
    }
});

window.addEventListener("resize", setAppSize);
setAppSize();
night(true);

