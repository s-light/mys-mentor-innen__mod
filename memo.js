
// find all hackdays
// for (const hd_id of state.appointment.allIds) {console.log(state.appointment.byId[hd_id])}

// maybe use this to manipulate data table?
// https://forum.vuejs.org/t/innerhtml-compilation-vue-2/8780/8?u=s-light





// console.clear();
// console.info('******************************************');
// window.addEventListener('load', (event) => {
//      console.info('All resources finished loading!', event);
window.addEventListener('load', () => {
    // console.info('All resources finished loading.');
    start_main_script();
});





    // setup iframe message handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
    window.addEventListener ("message", (event) => {
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


//
// function add_search_button(parent) {
//     console.info('add_search_button...');
//     const button_el = create_search_button(prepare_hackdays);
//     const table_el = document.querySelector(".v-data-table");
//     table_el.before(button_el);
// }


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
    } catch (e) {
        console.warn('', e);
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
