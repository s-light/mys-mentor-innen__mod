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
