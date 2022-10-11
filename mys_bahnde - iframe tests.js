// ==UserScript==
// @name     MYS bahn.de - iframe tests
// @version  0.3.0
// @grant    none
// @namespace   https://github.com/s-light
// @match https://prod.mys-mentor-innen.de/mentor/*
// @require https://git.io/waitForKeyElements.js
// ==/UserScript==

window.addEventListener('load', () => {
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
    console.log('window.top == window.self', window.top == window.self);
    prepare_iframe();
    console.info(
        'all user scripting done.\n' +
        '******************************************'
    );
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
        var loc = frame_window.querySelector('#locS0');
        console.log('search for elements', loc);
    } catch (e) {
        console.warn(e);
    }
    // console.log("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    // frame_window.window.top.postMessage("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    console.info('frame - init script done.\n\n');
}






function main(where) {
    console.log('func main', where);
    // do stuff here with `where` instead of `document`
    // e.g. use  where.querySelector()  in place of  document.querySelector()
    // and add stylesheets with  where.head.appendChild(stylesheet)
    try {
        var loc = where.querySelector('#locS0');
        console.log('main - locS0', loc);
    } catch (e) {
        console.warn(e);
    }
}

main(document); // run it on the top level document (as normal)

waitForKeyElements("iframe, frame", function(frame) {
    console.log('waitForKeyElements - found...');
    frame.addEventListener('load', function(event) {
        console.log('waitForKeyElements - load event fired...');
        console.log('event', event);
        console.log('event.contentDocument', event.contentDocument);
        // give main() the `document` from the frame each time it loads
        main(event.contentDocument);
    });
});
