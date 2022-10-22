// ******************************************
// UTILITIES


// https://stackoverflow.com/a/58332058/574981
function createPromiseFromDomEvent (eventTarget, eventName, run) {
    new Promise((resolve, reject) => {
        const handleEvent = () => {
            eventTarget.removeEventListener(eventName, handleEvent);
            resolve();
        };
        eventTarget.addEventListener(eventName, handleEvent);
        try {
            if (run) run();
        } catch (err) {
            reject(err);
        }
    });
}
// usage
// await createPromiseFromDomEvent(
//     sourceBuffer,
//     'update',
//     () => sourceBuffer.remove(3, 10)
// );




function parse_date(date_string) {
    //console.log('parse_date', date_string);
    //const RegExpNamedCaptureGroups = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/
    const RegExpNamedCaptureGroups = /(?<day>[0-9]{2}).(?<month>[0-9]{2}).(?<year>[0-9]{4})/;
    const reResult = RegExpNamedCaptureGroups.exec(date_string);
    //console.log(reResult);
    const date = new Date(
        reResult.groups.year,
        // monthIndex = month - 1
        reResult.groups.month - 1,
        reResult.groups.day
    );
    return date
}

function duration_parse(duration_string) {
    //console.log('duration_parse', duration_string);
    const RegExpNamedCaptureGroups = /(?<hours>[0-9]{2})h (?<minutes>[0-9]{4})min/;
    const reResult = RegExpNamedCaptureGroups.exec(duration_string);
    //console.log(reResult);
    const duration = (
        (reResult.groups.hours * 60)
        + reResult.groups.minutes
    );
    return duration
}

function duration_format(duration) {
    const duration_string = `${Math.trunc(duration / 60)}h ${duration % 60}min`
    return duration_string;
}



function add_styles(styles_string) {
    let head = document.querySelector('head');
    if (head) {
        const el_style = document.createElement('style');
        el_style.type = 'text/css';
        el_style.type = 'text/css';
        el_style.textContent = styles_string;
        head.appendChild(el_style);
    }
}



// alternative way:
// https://stackoverflow.com/a/69466883/574981
// access VUE instance directly
// const app = document.querySelector('[app-data]').__vue__;
// or saver way
// const app = Array.from(document.querySelectorAll('*')).find(e => e.__vue__).__vue__
// const state = app.$store.state
// if ever switched to VUE3 use
// const app = Array.from(document.querySelectorAll('*')).find(e => e.__vue_app__).__vue_app__
// const state = app.config.globalProperties.$store.state

// more on vuex store debugging
// https://www.damianmullins.com/logging-vuex-actions-and-mutations-in-the-wild/

function get_vue_app_instance(doc) {
    let app = null;
    try {
        // const app = Array.from(document.querySelectorAll('*')).find(e => e.__vue__).__vue__;
        const doc_all_el = doc.querySelectorAll('*');
        console.log('doc_all_el', doc_all_el);
        console.log('Array.from', Array.from);
        console.log('Array.find', Array.find);
        const doc_all_el_array = Array.from(doc_all_el);
        console.log('doc_all_el_array', doc_all_el_array);
        const find_result = doc_all_el_array.find(e => e.__vue__);
        console.log('find_result', find_result);
        app = find_result.__vue__;
        console.log('vue.js app', app);
    } catch (e) {
        console.warn(e);
    }
    try {
        app = doc.querySelector('[app-data]').__vue__;
        console.log('doc.querySelector("[app-data]").__vue__', app);
    } catch (e) {
        console.warn(e);
    }
    if (!app) {
        console.warn('app instance not found.', e);
    }
    return app;
}
