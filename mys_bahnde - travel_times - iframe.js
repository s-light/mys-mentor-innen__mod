// ==UserScript==
// @name     MYS bahn.de - travel times
// @version  0.3.0
// @grant    none
// @namespace   https://github.com/s-light
// @match https://prod.mys-mentor-innen.de/mentor/*
// @match https://reiseauskunft.bahn.de/*
// ==/UserScript==


// console.clear();
// console.info('******************************************');
// window.addEventListener('load', (event) => {
//      console.info('All resources finished loading!', event);
window.addEventListener('load', () => {
    // console.info('All resources finished loading.');
    start_main_script();
});



const base_url = 'https://prod.mys-mentor-innen.de/mentor/*';
const target_url = 'https://reiseauskunft.bahn.de/';
// let request_frame = null;

function start_main_script() {
    console.info(
        '******************************************' + '\n' +
        'MYS & bahn.de - travel times'
    );
    console.log('location.host', location.host);
    // const app = get_vue_app_instance(document);
    add_css();
    prepare_iframe();
    // wait until list is loaded...
    window.setTimeout(prepare_hackdays, 2000);
    // prepare_hackdays();
    // add_search_button();

    console.info(
        'all user scripting done.\n' +
        '******************************************'
    );
}


function create_search_button(action) {
    // console.info('create_search_button...');
    const button_el = document.createElement('div');
    button_el.textContent = 'search';
    button_el.addEventListener('click', action);
    button_el.classList.add('button');
    button_el.classList.add('v-btn');
    button_el.classList.add('v-btn--is-elevated');
    button_el.classList.add('v-btn--has-bg');
    button_el.classList.add('theme--light');
    button_el.classList.add('v-size--default');
    button_el.classList.add('secondary');
    return button_el;
}

function request_frame_message_received(event) {
    console.log('request_frame_message_received', event);
}


function prepare_hackdays() {
    console.log('prepare_hackdays');
    const hackday_list = get_hackdays();
    console.log(`found ${hackday_list.length} hackdays.`);
    for (const hackday of hackday_list) {
        hackday_add_search_button(hackday);
    }
}

function get_hackdays() {
    console.log('get_hackdays');
    const hackday_list = [];
    const tbody_el = document.querySelector(".v-data-table__wrapper tbody");
    // console.log('tbody_el', tbody_el);
    if(tbody_el) {
        //console.log('tbody_el.children', tbody_el.children);
        for (const tr_entry of tbody_el.children) {
            // console.log('tr_entry', tr_entry);
            const hackday = {};
            hackday.el = tr_entry;
            hackday.start_date = parse_date(tr_entry.children[1].innerText);
            hackday.end_date = parse_date(tr_entry.children[2].innerText);
            hackday.school = tr_entry.children[3].innerText;
            hackday.place = tr_entry.children[4].innerText;
            hackday.status_el = tr_entry.children[5];
            hackday_list.push(hackday);
        }
    } else {
        console.error("no hackday entries found.");
    }
    return hackday_list;
}

function hackday_add_duration(hackday, duration) {
    let duration_el = hackday.status_el.querySelector('.duration');
    if (!duration_el) {
        duration_el = document.createElement('div');
        duration_el.classList.append('duration');
        hackday.status_el.appendChild(duration_el);
    }
    duration_el.textContent = `${duration}h`;
}

function hackday_add_search_button(hackday) {
    // console.log('hackday_add_search_button');
    let button_el = hackday.status_el.querySelector('.search');
    // console.log('button_el', button_el);
    if (!button_el) {
        hackday.status_el.appendChild(create_search_button((event) => {
            find_hackday_connection_duration(hackday);
        }));
    }
}


function find_hackday_connection_duration(hackday) {
    console.log('tweak_hackday');
    const travel_date = hackday.start_date;
    travel_date.setDate(travel_date.getDate() - 1);
    const search_options = {
        start: "Witzenhausen Nord",
        target: `${hackday.place}, ${hackday.school}`,
        start_date: travel_date,
    };
    const duration = search_connection_duration(search_options);
    hackday_add_duration(hackday, duration);
}



function search_connection_duration(search_options) {
    console.group('search_connection_duration');
    let duration = -1;
    const request_frame = document.querySelector('#request_frame');
    console.log('request_frame', request_frame);
    console.log('post message...');
    request_frame.contentWindow.postMessage('PING', "*");
    console.log('post message - done.');
    // .then(htmlDocConnection => {
    //     console.log('htmlDocConnection', htmlDocConnection);
    //     console.log('title', htmlDocConnection.title);
    //     // debug_out.appendChild(htmlDocConnection);
    //     // ^ --> fails with `Node.appendChild: May not add a Document as a child`
    //     try {
    //         request_frame.contentWindow.document = htmlDocConnection;
    //     } catch (e) {
    //         console.error(e);
    //     }
    //     //search_connection__fill(htmlDoc, search_options);
    //     const duration = htmlDocConnection.querySelector('.connectionData .conTimeChanges .duration');
    //     console.log('duration', duration);
    // });
    console.groupEnd();
    return duration;
}














// ******************************************
// Frame scripts

function prepare_iframe() {
    console.info('prepare_iframe...');
    const main__wrap_el = document.querySelector(".v-main__wrap")
    const el = document.createElement('iframe');
    el.id = 'request_frame';
    el.classList.add('request_frame');
    el.addEventListener('load', (event) => {
        console.log('frame load event fired.', event, el);
        start_frame_script(el.contentWindow, el.contentDocument);
    });
    el.src = target_url;
    main__wrap_el.appendChild(el);
}

function start_frame_script(frame_window, frame_document) {
    console.info(
        'frame - init script\n',
        'frame_window',
        frame_window,
        '\n',
        'frame_document',
        frame_document
    );
    try {
        // following fails do to
        // DOMException: Permission denied to access property "addEventListener" on cross-origin object
        //console.log('frame_window.addEventListener ("message", (event)...');
        //frame_window.addEventListener("message", (event) => {
        //    console.log('frame_window - event', event);
        //});
        console.log('search for elements', frame_window.querySelector(''));
    } catch (e) {
        console.warn(e);
    }


    // console.log("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    // frame_window.window.top.postMessage("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    console.info('frame - init script done.\n\n');
}

































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

function add_css() {
    console.groupCollapsed('add_css');
    let modstyles = `
    /* ***** css tweaks ***** */
    .request_frame {
        display: block;
        position: absolute;
        right: 0;
        z-index: 200;
        width: 20vw;
        height: 20vw;
        top: 0;
        background: hsla(191.3, 42.1%, 22.4%, 0.11);
    }
    /* ***** css tweaks end ***** */
    `;
    add_styles(modstyles);
    console.groupEnd();
}
