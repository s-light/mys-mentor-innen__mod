// ==UserScript==
// @name MYS & bahn.de - travel times
// @description adds travel times / duration from home base to every hackday location in the list. sourced per iframe from reiseauskunft.bahn.de.
// @author s-light.eu (Stefan Krüger)
// @homepageURL https://github.com/s-light/mys-mentor-innen__mod
// @version  0.3.0
// @grant    none
// @inject-into userScript
// @namespace   https://github.com/s-light
// @require   https://s-light.github.io/mys-mentor-innen__mod/tools.js
// @match https://prod.mys-mentor-innen.de/mentor/*
// @match https://reiseauskunft.bahn.de/*
// ==/UserScript==



const base_url = 'https://prod.mys-mentor-innen.de/mentor/*';
const target_url = 'https://reiseauskunft.bahn.de';

const action_queue = [];


try {
    start_main_script();
} catch (e) {
    console.warn(e);
}

function start_main_script() {
    console.info(
        '******************************************' + '\n' +
        'MYS & bahn.de - travel times'
    );
    console.log('location.host', location.host);
    // const app = get_vue_app_instance(document);
    // add_css();
    // prepare_start_location_input();
    prepare_iframe();
    // wait until list is loaded...
    window.setTimeout(prepare_hackdays, 2000);
    // prepare_hackdays();
    // add_search_button();

    // setup_message_receive();

    console.info(
        'all user scripting done.\n' +
        '******************************************'
    );
}


function setup_message_receive() {
    window.addEventListener("message", (event) => {
        // console.log('event', event);
        // console.log('event.origin', event.origin);
        // console.info(
        //     `message event:
        //     event.origin: '${event.origin}'
        //     event.data:`,
        //     event.data
        // );
        // Do we trust the sender of this message?
        // console.log('event.origin', event.origin);
        // console.log('target_url', target_url);
        // console.log('event.origin == target_url', event.origin == target_url);
        if (event.origin == target_url) {
            // console.log('event', event);
            message_received(event);
        }
    });
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
        hackday.status_el.appendChild(create_search_button(() => {
            console.clear();
            find_hackday_connection_duration(hackday);
        }));
    }
}


function find_hackday_connection_duration(hackday) {
    console.log('find_hackday_connection_duration');
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
    const req_data = {
        'form_fill' : {
            'REQ0JourneyStopsS0G': search_options.start,
            'REQ0JourneyStopsZ0G': search_options.target,
            'REQ0JourneyDate': search_options.start_date.toLocaleDateString(),
            // 'REQ0JourneyTime': search_options.start_date.toLocaleTimeString().remove_seconds_TODO(),
            'REQ0JourneyTime': '08:00',
        }
    };
    send_bahn_iframe_api_request('search_connection', req_data);
    // TODO: wait for result
    console.groupEnd();
    return duration;
}





async function send_bahn_iframe_api_request(req_type, req_data) {
    console.log('send_bahn_iframe_api_request');
    console.log('req_type', req_type);
    console.log('req_data', req_data);
    const request_frame = document.querySelector('#request_frame');
    console.log('request_frame', request_frame);
    if (req_type == 'search_connection') {
        // reload search mask
        // wait until load event has fired..
        console.log('trigger reload and wait...');
        await createPromiseFromDomEvent(
            request_frame,
            'load',
            () => {
                request_frame.src = target_url;
            }
        );
        console.log('reload finished.');
    }
    console.log('wait for message..');


    await new Promise((resolve, reject) => {
        const handleEvent = (event) => {
            try {
                const event_data = event.data;
                console.log('event_data', event_data);
                const message_type = event_data.data.type;
                // console.log('message_type', message_type);
                const message_data = event_data.data.data;
                // console.log('message_data', message_data);
                switch (message_type) {
                    case 'connection_data_result': {
                            // connection_data_result_received(message_data);
                            window.removeEventListener('message', handleEvent);
                            resolve(event_data);
                    } break;
                    case 'connection_data_request':
                        // connection_data_request_received(message_data);
                        console.log('connection_data_request');
                    break;
                    default:
                        console.warn(`message handling for '${message_type}' not implemented.`);
                }
            } catch (e) {
                console.warn('message malformed.', e);
            }
        };
        window.addEventListener('message', handleEvent);
        try {
            const req_message = {
                'data': {
                    'type': req_type,
                    'data': req_data,
                }
            };
            console.log('post message.', req_message);
            request_frame.contentWindow.postMessage(req_message, "*");
            console.log('post message - done.');
        } catch (err) {
            reject(err);
        }
    })
    //
    // await waitForMessageAnswer(
    //     () => {
    //         const req_message = {
    //             'data': {
    //                 'type': req_type,
    //                 'data': req_data,
    //             }
    //         };
    //         console.log('post message.', req_message);
    //         request_frame.contentWindow.postMessage(req_message, "*");
    //         console.log('post message - done.');
    //     }
    // )
    .then((event_data) => {
        console.log('got event_data', event_data);
        const message_type = event_data.data.type;
        const message_data = event_data.data.data;
        switch (message_type) {
            case 'connection_data_result':
                const result_list = message_data.data.results;
                return result_list;
                break;
            // case 'connection_data_request':
            //     throw (message_data);
            //     break;
            default:
                const message = `message handling for '${message_type}' not implemented.`;
                console.warn(message);
                throw message;
        }
    })
    .then((result_list) => {
        // we have a result list
        console.log('result_list', result_list);
    })
    .catch((message_data) => {
        console.log('error: we have message_data..', message_data);
        // so here we have to wait for the next load event (the form got submitted by the user)
        // return createPromiseFromDomEvent(request_frame,'load');
    });
}









function message_received(event) {
    // console.log('message_received', event);
    try {
        const event_data = event.data;
        // console.log('event_data', event_data);
        const message_type = event_data.data.type;
        // console.log('message_type', message_type);
        const message_data = event_data.data.data;
        // console.log('message_data', message_data);
        switch (message_type) {
            case 'connection_data_result':
                connection_data_result_received(message_data);
                break;
            case 'connection_data_request':
                connection_data_request_received(message_data);
                break;
            default:
                console.warn(`message handling for '${message_type}' not implemented.`);
        }
    } catch (e) {
        console.warn('message malformed.', e);
    }
}

function connection_data_request_received(data) {
    console.log('connection_data_request_received');
    // console.log('data', data);
    // console.log('TODO: implement connection_data_request handling');
}

function connection_data_result_received(data) {
    console.log('connection_data_result_received');
    console.log('data', data);
    console.warn('TODO: implement connection_data_result handling');
    const result_list = data.data.results;
    console.log('result_list', result_list);
    // get last element
    // action_queue[action_queue.length-1]
}









// ******************************************
// Frame scripts

function prepare_iframe() {
    console.info('prepare_iframe...');
    const main__wrap_el = document.querySelector(".v-main__wrap");
    const el_wrap = document.createElement('div');
    el_wrap.classList.add('request_frame_wrapper');
    const el = document.createElement('iframe');
    el.id = 'request_frame';
    el.classList.add('request_frame');
    el.addEventListener('load', (event) => {
        // console.log('frame load event fired.', event, el);
        console.log('frame load event fired.');
        // start_frame_script(el.contentWindow, el.contentDocument);
    });
    el.src = target_url;
    el_wrap.appendChild(el);
    main__wrap_el.appendChild(el_wrap);
}













function action_add(type, data=null, check=null, then=null) {
    const action = {
        type: type,
        data: data,
        check: check,
        then: then,
    }
    action_queue.push(action);
}













// https://stackoverflow.com/a/58332058/574981
function waitForMessageAnswer(run) {
    new Promise((resolve, reject) => {
        const handleEvent = (event) => {
            try {
                const event_data = event.data;
                // console.log('event_data', event_data);
                const message_type = event_data.data.type;
                // console.log('message_type', message_type);
                const message_data = event_data.data.data;
                // console.log('message_data', message_data);
                switch (message_type) {
                    case 'connection_data_result': {
                            // connection_data_result_received(message_data);
                            window.removeEventListener('message', handleEvent);
                            resolve(event_data);
                    } break;
                    case 'connection_data_request':
                        // connection_data_request_received(message_data);
                        console.log('connection_data_request');
                    break;
                    default:
                        console.warn(`message handling for '${message_type}' not implemented.`);
                }
            } catch (e) {
                console.warn('message malformed.', e);
            }
        };
        window.addEventListener('message', handleEvent);
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









function add_css() {
    console.groupCollapsed('add_css');
    let modstyles = `
    /* ***** css tweaks ***** */

    /* ***** css tweaks end ***** */
    `;
    add_styles(modstyles);
    console.groupEnd();
}
