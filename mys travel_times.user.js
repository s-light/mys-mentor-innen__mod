// ==UserScript==
// @name     MYS & bahn.de - travel times
// @author s-light.eu (Stefan Krüger)
// @homepageURL https://github.com/s-light/mys-mentor-innen__mod
// @version  0.3.0
// @grant    none
// @namespace   https://github.com/s-light
// @require   https://s-light.github.io/mys-mentor-innen__mod/tools.js
// @match https://prod.mys-mentor-innen.de/mentor/*
// @match https://reiseauskunft.bahn.de/*
// ==/UserScript==



const base_url = 'https://prod.mys-mentor-innen.de/mentor/*';
const target_url = 'https://reiseauskunft.bahn.de/';


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
    prepare_iframe();
    // wait until list is loaded...
    window.setTimeout(prepare_hackdays, 2000);
    // prepare_hackdays();
    // add_search_button();

    window.addEventListener ("message", (event) => {
        console.log('event', event);
        console.log('event.origin', event.origin);
        // Do we trust the sender of this message?
        if (event.origin === target_url) {
            request_received(event);
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
        hackday.status_el.appendChild(create_search_button(() => {
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
    const main__wrap_el = document.querySelector(".v-main__wrap");
    const el = document.createElement('iframe');
    el.id = 'request_frame';
    el.classList.add('request_frame');
    el.addEventListener('load', (event) => {
        console.log('frame load event fired.', event, el);
        // start_frame_script(el.contentWindow, el.contentDocument);
    });
    el.src = target_url;
    main__wrap_el.appendChild(el);
}


















function add_css() {
    console.groupCollapsed('add_css');
    let modstyles = `
    /* ***** css tweaks ***** */

    /* ***** css tweaks end ***** */
    `;
    add_styles(modstyles);
    console.groupEnd();
}
