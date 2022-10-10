// ==UserScript==
// @name     test gm and iframe interaction
// @version  0.3.0
// @grant    none
// @namespace   https://github.com/s-light
// @match https://s-light.github.io/mys-mentor-innen__mod/main.html
// ==/UserScript==

// https://output.jsbin.com/zicuhud/
// https://jsbin.com/zatagic/edit?html,js,output


// console.clear();
// console.info('******************************************');
// window.addEventListener('load', (event) => {
//      console.info('All resources finished loading!', event);
window.addEventListener('load', () => {
    // console.info('All resources finished loading.');
    start_main_script();
});


// const base_url = 'https://output.jsbin.com/zatagic/';
const target_url = 'https://output.jsbin.com/zatagic/';
// let request_frame = null;

function start_main_script() {
    try {
        console.info(
            '******************************************' + '\n' +
            'test gm and iframe interaction'
        );
        console.log('location.host', location.host);
        prepare_iframe();
        add_main_eventListener();
    } catch (e) {
        console.error(e);
    } finally {
        console.info(
            'all user scripting done.\n' +
            '******************************************'
        );
    }
}


function add_main_eventListener() {
    // setup iframe message handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    window.addEventListener ('message', (event) => {
        console.log('main - event', event);
        console.log('main - event.origin', event.origin);
        // Do we trust the sender of this message?
        if (event.origin == target_url) {
            // event.source is window.opener
            // event.data is "hello there!"
            // Assuming you've verified the origin of the received message (which
            // you must do in any case), a convenient idiom for replying to a
            // message is to call postMessage on event.source and provide
            // event.origin as the targetOrigin.
            // event.source.postMessage(
            //     "hi there yourself!  the secret response is: rheeeeet!",
            //     event.origin
            // );
            // request_frame_message_received
        }
    });

    //
    // if (/prod\.mys-mentor-innen.de/i.test (location.host) ) {
    //     console.log ("***Main start...");
    //     add_css();
    //     prepare_iframe();
    //     // prepare_hackdays();
    //     // prepare_hackdays();
    //     // add_search_button();
    //     // setup iframe message handler
    //     // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    //     window.addEventListener ("message", (event) => {
    //         console.log('main - event.origin', event.origin);
    //         // Do we trust the sender of this message?
    //         if (event.origin == target_url) {
    //             // event.source is window.opener
    //             // event.data is "hello there!"
    //             // Assuming you've verified the origin of the received message (which
    //             // you must do in any case), a convenient idiom for replying to a
    //             // message is to call postMessage on event.source and provide
    //             // event.origin as the targetOrigin.
    //             // event.source.postMessage(
    //             //     "hi there yourself!  the secret response is: rheeeeet!",
    //             //     event.origin
    //             // );
    //             // request_frame_message_received
    //         }
    //     });
    // } else {
    //     console.log ("***Frame start...");
    //     window.addEventListener ("message", (event) => {
    //         console.log('frame - event.origin', event.origin);
    //         // Do we trust the sender of this message?
    //         // if (event.origin == "https://prod.mys-mentor-innen.de/mentor/*") {
    //         // }
    //     });
    // }
}



function request_frame_message_received(event) {
    console.log('request_frame_message_received', event);
}




// ******************************************
// Frame scripts

function prepare_iframe() {
    console.info('prepare_iframe...');
    const main__wrap_el = document.querySelector(".placeholder");
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
        console.log('frame_window.addEventListener ("message", (event)...');
        frame_window.addEventListener("message", (event) => {
            console.log('frame_window - event', event);
        });
    } catch (e) {
        console.warn('frame_window.addEventListener', e);
    }
    try {
        console.log('frame_window.window.addEventListener ("message", (event)...');
        frame_window.window.addEventListener("message", (event) => {
            console.log('frame_window.window - event', event);
            // Do we trust the sender of this message?
            // if (event.origin == "https://prod.mys-mentor-innen.de/mentor/*") {
            // }
        });
    } catch (e) {
        console.warn('frame_window.window.addEventListener', e);
    }


    // console.log("start_frame_script - frame_window.postMessage - PING FROM FRAME!!");
    // frame_window.postMessage("start_frame_script - frame_window.postMessage - PING FROM FRAME!!");
    // console.log("start_frame_script - frame_window.window.postMessage - PING FROM FRAME!!");
    // frame_window.window.postMessage("start_frame_script - frame_window.window.postMessage - PING FROM FRAME!!");
    console.log("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    frame_window.window.top.postMessage("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
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
