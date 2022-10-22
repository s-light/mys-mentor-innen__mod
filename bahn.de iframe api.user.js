// ==UserScript==
// @name     bahn.de iframe api
// @author s-light.eu (Stefan Krüger)
// @homepageURL https://github.com/s-light/mys-mentor-innen__mod
// @version  0.1.0
// @grant    none
// @allFrames true
// @namespace   https://github.com/s-light
// @require   https://s-light.github.io/mys-mentor-innen__mod/tools.js
// @match https://reiseauskunft.bahn.de/*
// ==/UserScript==


// window.addEventListener('load', () => {
//     setup_bahn_de_iframe_api();
// });

try {
    setup_bahn_de_iframe_api();
} catch (e) {
    console.warn(e);
}


// const source_url_list = [
//     'https://prod.mys-mentor-innen.de',
// ];
const source_url = 'https://prod.mys-mentor-innen.de';
const target_url = 'https://reiseauskunft.bahn.de/';

function setup_bahn_de_iframe_api() {
    console.info('setup');
    // console.info(
    //     '******************************************' + '\n' +
    //     'bahn.de iframe api'
    // );
    // console.log('location.host', location.host);
    // console.log('window.top === window.self', window.top === window.self);
    // add_css();
    // window.top.postMessage({data: 'PING from frame *.'}, '*');
    setup_message_receive();
    send_current_data();
    // console.info(
    //     'all user scripting done.\n' +
    //     '******************************************'
    // );
    // console.info('setup done');
}



function setup_message_receive() {
    // setup iframe message handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#examples
    window.addEventListener("message", (event) => {
        // console.log('event', event);
        // console.log('event.origin', event.origin);
        // console.log('event.source', event.source);
        // console.log('window.opener', window.opener);
        // Do we trust the sender of this message?
        if (
            (event.origin === source_url)
            // (source_url_list.includes(event.origin))
            // && (event.source === window.opener) →  null for our dynamically created iframe...
        ) {
            message_received(event);
            // a convenient idiom for replying to a message is to
            // call postMessage on event.source and
            // provide event.origin as the targetOrigin.
            // event.source.postMessage(
            //     "hi yourself! response is: rheeeeet!",
            //     event.origin
            // );
        }
    });
}

function message_received(event) {
    console.log('message_received', event);
    try {
        const event_data = event.data;
        // console.log('event_data', event_data);
        const message_type = event_data.data.type;
        // console.log('message_type', message_type);
        const message_data = event_data.data.data;
        // console.log('message_data', message_data);
        switch (message_type) {
            case 'search_connection':
                req_search_connection(message_data)
                break;
            default:
                console.warn(`request ' ${message_type}' not implemented.`);
        }
    } catch (e) {
        console.warn('request malformed.', e);
    }
}

function req_search_connection(data) {
    console.info('req_search_connection', data);
    console.group('fill form:');
    for (const key of Object.keys(data.form_fill)) {
        console.log(`    '${key}'`);
        try {
            const el = document.querySelector(`[name=${key}]`);
            if (el) {
                el.value = data.form_fill[key];
            } else {
                console.warn(`form_fill input '${key}' not found. ignoring.`);
            }
        } catch (e) {
            console.warn(`form_fill failed on input '${key}': `, e);
        }
    }
    console.groupEnd();

    // seems we need some small timeout for the click to work reliable...
    function send_form() {
        // send form
        try {
            console.log(`send form..`);
            // document.querySelector('[name=start]').click();
            const submit_button = document.querySelector('[name=start]');
            submit_button.click();
            // const click_result = submit_button.click();
            // console.log('click_result', click_result);

            // does not work.
            // document.querySelector('[name=formular]').submit();
            // or
            // submitQuery();

            // this reloads the page.
            // so the send_current_data will get triggered..
            // hopefully with the results ;-)
        } catch (e) {
            console.warn(`form_fill submit failed`, e);
        }
    }
    window.setTimeout(send_form, 100);
    console.info(`req_search_connection done.`);
}










function send_current_data() {
    const data = {
        data: collect_current_data(document)
    };
    // console.log('data', data);
    if (data.data.type == 'connection_data_result') {
        const post_result = window.top.postMessage(data, '*');
        // console.log('message posted.');
    } else {
        console.log('no message posted for now.. waiting for results first...');
    }
    // const message_data_text = JSON.stringify(message_obj);
    // window.top.postMessage(message_data_text);
}

function collect_current_data() {
    // console.log('collect_current_data');
    const data = {
        'type': 'connection_data',
        'data': {
            'title': get_value_from_element('title'),
            'data': null,
        }
    };
    if (data.data.title.includes('Auskunft')) {
        data.type = 'connection_data_result';
        data.data.data = collect_connection_result_data();
    } else if (data.data.title.includes('Anfrage')) {
        data.type = 'connection_data_request';
        data.data.data = collect_connection_request_data();
    }
    return data;
}

function collect_connection_request_data() {
    // console.log('collect_connection_request_data');

    const data = {
        "journey_start": get_value_from_element('.connection .conSummaryDep'),
        "journey_start_error": get_value_from_element('#errormsg_S'),
        'journey_target' : get_value_from_element('.connection .conSummaryArr'),
        "journey_target_error": get_value_from_element('#errormsg_Z'),
        'time' :
            get_value_from_element('.connection .conSummaryTime')
            .replaceAll('\n','')
            .replace('ab: ', ''),
        'date' : get_value_from_element('#tp_overview_headline_date'),
    };
    if (data.journey_start_error) {
        document.querySelector('[name=REQ0JourneyStopsS0K]').scrollIntoView();
    }
    if (data.journey_target_error) {
        document.querySelector('[name=REQ0JourneyStopsZ0G]').scrollIntoView();
    }
    return data;
}

function collect_connection_result_data() {
    // console.log('collect_connection_result_data');
    const data = {
        "journey_start": get_value_from_element('.connection .conSummaryDep'),
        'journey_target' : get_value_from_element('.connection .conSummaryArr'),
        'time' :
            get_value_from_element('.connection .conSummaryTime')
            .replaceAll('\n','')
            .replace('ab:', '')
            .trim(),
        'date' : get_value_from_element('#tp_overview_headline_date'),
        'results' : [],
    };
    for (let connection of document.querySelectorAll('.scheduledCon .overviewConnection')) {
        const connection_data = {
            'duration': 0,
            'changes': 0,
        };
        let con_duration = connection.querySelector('.conTimeChanges .duration');
        if (con_duration) {
            connection_data.duration = duration_parse(
                con_duration.innerText.replace('|', '').trim()
            );
        }
        let con_chg = connection.querySelector('.conTimeChanges .changes');
        if (con_chg) {
            connection_data.changes = con_chg.innerText.replace('Umstiege', '');
        }
        data.results.push(connection_data);
    }
    return data;
}

function get_value_from_element(selector) {
    let result = '';
    const el = document.querySelector(selector);
    if (el) {
        if (el.nodeName === "INPUT") {
            result = el.value;
        } else if (["TITLE", "DIV", "SPAN"].includes(el.nodeName)) {
            result = el.innerText.trim();
        } else {
            console.warn(`Node Type '${el.nodeName}' not implemented.`);
        }
    }
    return result;
}













function search_connection_duration(search_options) {
    console.group('search_connection_duration');

    const form_template = {
        'queryPageDisplayed' : 'yes',
        'REQ0JourneyStopsS0A': 1,
        "REQ0JourneyStopsS0G": 'Witzenhausen+Nord',
        'REQ0JourneyStopsS0ID' : '',
        'locationErrorShownfrom' : 'yes',
        'REQ0JourneyStopsZ0A' : 1,
        'REQ0JourneyStopsZ0G' : 'Hofheim (Taunus)',
        'REQ0JourneyStopsZ0ID' : '',
        'locationErrorShownto' : 'yes',
        "REQ0JourneyDate": "29.08.22",
        "REQ0JourneyTime": "12:00",
        'existOptimizePrice' : 1,
        'REQ0HafasOptimize1' : '0:1',
        'rtMode' : 12,
        'existRTMode' : 1,
        'immediateAvail' : 'ON',
        'start' : 'Suchen'
    };
    form_template.REQ0JourneyStopsS0G = encodeURI(search_options.start);
    form_template.REQ0JourneyStopsZ0G = encodeURI(search_options.target);
    form_template.REQ0JourneyDate = search_options.start_date.toLocaleDateString();
    // console.log('form_template', form_template);

    const data = new FormData();
    // for (const [key, value] of Object.entries(x) ) {console.log(key, value)}
    // console.group('FormData');
    for (const [key, value] of Object.entries(form_template)) {
        // console.log(key, value);
        data.append(key, value);
    }
    // console.log("data.get('REQ0JourneyStopsZ0G')", data.get('REQ0JourneyStopsZ0G'));
    // console.groupEnd();


    let duration = -1;
    const base_url = 'https://reiseauskunft.bahn.de/';
    // const base_url = 'https://reiseauskunft.bahn.de/bin/query.exe/dn';

    // console.groupEnd();

  	let debug_out = "";

    // fetch("https://reiseauskunft.bahn.de/bin/query.exe/dn", {
    //     "credentials": "include",
    //     "headers": {
    //         "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0",
    //         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    //         "Accept-Language": "en,en-GB;q=0.8,en-US;q=0.5,de;q=0.3",
    //         "Content-Type": "application/x-www-form-urlencoded",
    //         "Upgrade-Insecure-Requests": "1",
    //         "Sec-Fetch-Dest": "document",
    //         "Sec-Fetch-Mode": "navigate",
    //         "Sec-Fetch-Site": "same-origin",
    //         "Sec-Fetch-User": "?1",
    //         "Pragma": "no-cache",
    //         "Cache-Control": "no-cache"
    //     },
    //     "referrer": "https://reiseauskunft.bahn.de/bin/query.exe/dn",
    //     "method": "POST",
    //     "mode": "cors",
    //     body: data
    // });
    console.log('fetch base');
    fetch(base_url)
    .then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');
        return htmlDoc;
    })
    .then(htmlDoc => {
        // console.log('htmlDoc', htmlDoc);
        const actionURL = htmlDoc.forms[0].action;
        // console.log('actionURL', actionURL);
        console.log('fetch form');
        return fetch(actionURL, { method: "POST", body: data });
    })
    .then(res => res.text())
    .then(html => {
        const parser = new DOMParser();
        const htmlDocConnection = parser.parseFromString(html, 'text/html');
        return htmlDocConnection;
    })
    // .then(htmlDocConnection => {
    //     console.log('htmlDocConnection', htmlDocConnection);
    //     console.log('title', htmlDocConnection.title);
    //     if (htmlDocConnection.title.includes('Anfrage')) {
    //         const actionURL = htmlDocConnection.forms[0].action;
    //         const dataNew = new FormData(htmlDocConnection.forms[0]);
    //         return fetch(actionURL, { method: "POST", body: dataNew })
    //         .then(res => res.text())
    //         .then(html => {
    //             const parser = new DOMParser();
    //             const htmlDocConnection = parser.parseFromString(html, 'text/html');
    //             console.log('second round-trip ', htmlDocConnection);
    //             return htmlDocConnection;
    //         })
    //     } else {
    //         return htmlDocConnection
    //     }
    // })
    .then(htmlDocConnection => {
        console.log('htmlDocConnection', htmlDocConnection);
        console.log('title', htmlDocConnection.title);
        debug_out = document.querySelector('#myscript_debug_output');
        // debug_out.appendChild(htmlDocConnection);
        // ^ --> fails with `Node.appendChild: May not add a Document as a child`
        debug_out.append(htmlDocConnection.body);
        //search_connection__fill(htmlDoc, search_options);
        const duration = htmlDocConnection.querySelector('.connectionData .conTimeChanges .duration');
        console.log('duration', duration);
    });
    return duration;
}




//
//
// function dev_create_button() {
//     console.info('dev_create_button...');
//     const button_el = document.createElement('button');
//     button_el.textContent = 'send ping';
//     button_el.addEventListener('click', () => {
//         const message = 'dev Button PING';
//         console.info(`window.top.postMessage '${message}'`);
//         window.top.postMessage(message, '*');
//     });
//     button_el.classList.add('dev_button');
//     // button_el.classList.add('v-btn');
//     // button_el.classList.add('v-btn--is-elevated');
//     // button_el.classList.add('v-btn--has-bg');
//     // button_el.classList.add('theme--light');
//     // button_el.classList.add('v-size--default');
//     // button_el.classList.add('secondary');
//     button_el.style.position = 'fixed';
//     button_el.style.top = '0.5em';
//     button_el.style.right = '0.5em';
//     button_el.style.zIndex = '10000';
//     document.body.appendChild(button_el)
//     console.info('button_el', button_el);
//     return button_el;
// }
//
// dev_create_button();
