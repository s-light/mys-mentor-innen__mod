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


const target_url = 'https://reiseauskunft.bahn.de/';

function setup_bahn_de_iframe_api() {
    console.info(
        '******************************************' + '\n' +
        'bahn.de iframe api'
    );
    console.log('location.host', location.host);
    console.log('window.top === window.self', window.top === window.self);
    // add_css();
    // setup iframe message handler
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
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
    send_current_data();
    console.info(
        'all user scripting done.\n' +
        '******************************************'
    );
}


function request_received(event) {
    console.log('request_received', event);
}










function send_current_data() {
    const data = collect_current_data(document);
    // console.log("start_frame_script - frame_window.window.top.postMessage - PING FROM FRAME!!");
    const message_obj = {
        'type': 'connection_data',
        'data': data
    };
    console.log('message_obj', message_obj);
    const message_data = JSON.stringify(message_obj);
    window.top.postMessage(message_data);
}

function collect_current_data() {
    console.log('collect_current_data');
    const data = {
        'title': get_value_from_element('title'),
        'query_result': null,
        'data': null,
    };
    if (data.title.includes('Auskunft')) {
        data.query_result = true;
        data.data = collect_connection_result_data();
    } else if (data.title.includes('Anfrage')) {
        data.query_result = false;
        data.data = collect_connection_request_data();
    }
    return data;
}

function collect_connection_request_data() {
    console.log('collect_connection_request_data');
    const data = {
        "journey_start": get_value_from_element('.connection .conSummaryDep'),
        'journey_target' : get_value_from_element('.connection .conSummaryArr'),
        'time' :
            get_value_from_element('.connection .conSummaryTime')
            .replaceAll('\n','')
            .replace('ab: ', ''),
        'date' : get_value_from_element('#tp_overview_headline_date'),
    };
    return data;
}

function collect_connection_result_data() {
    console.log('collect_connection_result_data');
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
            connection_data.duration = con_duration.innerText.replace('|', '').trim();
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
