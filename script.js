'use strict';

const form = document.forms['form'];

form.onsubmit = function (event) {
    event.preventDefault();

    const task = {
        title: form.elements['title'].value,
        text:  form.elements['text'].value,
        priority:  form.elements['priority'].value,
        color:  form.elements['color'].value,
        date: Date.now()
    }

    // localStorage.setItem(generateId(), JSON.stringify(task));
    console.log(task);

    form.reset();
    $("#exampleModal").modal("hide");
}

/**
 * Generate id for task
 * @returns {string}
 */
function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}