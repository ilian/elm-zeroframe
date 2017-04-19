/* ZeroFrame.js */
const CMD_INNER_READY = 'innerReady'
const CMD_RESPONSE = 'response'
const CMD_WRAPPER_READY = 'wrapperReady'
const CMD_PING = 'ping'
const CMD_PONG = 'pong'
const CMD_WRAPPER_OPENED_WEBSOCKET = 'wrapperOpenedWebsocket'
const CMD_WRAPPER_CLOSE_WEBSOCKET = 'wrapperClosedWebsocket'

class ZeroFrame {
    constructor(url) {
        this.url = url
        this.waiting_cb = {}
        this.wrapper_nonce = document.location.href.replace(/.*wrapper_nonce=([A-Za-z0-9]+).*/, "$1")
        this.connect()
        this.next_message_id = 1
        this.init()
    }

    init() {
        return this
    }

    connect() {
        this.target = window.parent
        window.addEventListener('message', e => this.onMessage(e), false)
        this.cmd(CMD_INNER_READY)
    }

    onMessage(e) {
        let message = e.data
        let cmd = message.cmd
        if (cmd === CMD_RESPONSE) {
            if (this.waiting_cb[message.to] !== undefined) {
                this.waiting_cb[message.to](message.result)
            }
            else {
                this.log("Websocket callback not found:", message)
            }
        } else if (cmd === CMD_WRAPPER_READY) {
            this.cmd(CMD_INNER_READY)
        } else if (cmd === CMD_PING) {
            this.response(message.id, CMD_PONG)
        } else if (cmd === CMD_WRAPPER_OPENED_WEBSOCKET) {
            this.onOpenWebsocket()
        } else if (cmd === CMD_WRAPPER_CLOSE_WEBSOCKET) {
            this.onCloseWebsocket()
        } else {
            this.onRequest(cmd, message)
        }
    }

    onRequest(cmd, message) {
        this.log("Unknown request", message)
    }

    response(to, result) {
        this.send({
            cmd: CMD_RESPONSE,
            to: to,
            result: result
        })
    }

    cmd(cmd, params={}, cb=null) {
        this.send({
            cmd: cmd,
            params: params
        }, cb)
    }

    send(message, cb=null) {
        message.wrapper_nonce = this.wrapper_nonce
        message.id = this.next_message_id
        this.next_message_id++
        this.target.postMessage(message, '*')
        if (cb) {
            this.waiting_cb[message.id] = cb
        }
    }

    log(...args) {
        console.log.apply(console, ['[ZeroFrame]'].concat(args))
    }

    onOpenWebsocket() {
        this.log('Websocket open')
    }

    onCloseWebsocket() {
        this.log('Websocket close')
    }
}

/* Elm Interface */


var page = new ZeroFrame();

var _nocent$elm_zeronet$Native_ZeroFrame = function () {

    function cmd(cmd, params) {
        return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
            console.info("Got a request from the elm world:", cmd, params);
            params = ctorToJs(params);

            page.cmd(cmd, params, response => {
                console.info("Got a response from ZeroFrame inside elm runtime:", response);
                if (response.error) {
                    callback(_elm_lang$core$Native_Scheduler.fail(response.error));
                } else {
                    callback(_elm_lang$core$Native_Scheduler.succeed(response));
                }
            });


            // TODO: Handle commands that can optionally fire callbacks (e.g. wrapperConfirm);
            // Incomplete list of commands that do not fire callback
            let noCbCmds = ["wrapperNotification", "wrapperSetViewport", "wrapperSetTitle",
                            "wrapperPushState", "wrapperReplaceState", "wrapperOpenWindow",
                            "wrapperProgress", "wrapperReload", "certSelect"];

            // Set tasks as complete for commands that do not fire a callback
            if (noCbCmds.indexOf(cmd) > -1) {
                callback(_elm_lang$core$Native_Scheduler.succeed());
            }
        });
    }

    // Recursively replace elm tuples and lists to JS arrays
    function ctorToJs (obj) {
        if (obj.ctor == undefined) {
            for (var prop in obj) {
                obj[prop] = ctorToJs(obj[prop]);
            }
            return obj;
        } else if (obj.ctor == '::' || obj.ctor == '[]') {
            // Convert elm list to Array
            return _elm_lang$core$Native_List.toArray(obj);
        } else if (obj.ctor.startsWith('_Tuple')){
            // Convert tuple to mixed array
            let match = /_Tuple([0-9]+)/.exec(obj.ctor);
            let res = [];
            for(let i = 0; i < match[1]; i++){
                res.push(obj['_' + i]);
            }
            return res;
        }
    }

    return {
        cmd : F2(cmd)
    };
}();

