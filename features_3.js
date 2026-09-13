// ==========================================
// F CHAT - FEATURES 3
// VOICE CALL - BASE SYSTEM
// ==========================================


// ==========================================
// GLOBAL VARIABLES
// ==========================================

window.fchatVoiceCallActive = false;

window.fchatLocalStream = null;

window.fchatVoiceCallPartner = null;


// ==========================================
// ADD CALL BUTTON
// ==========================================

function fchatAddVoiceCallButton() {

    // Already exists?
    if (
        document.getElementById(
            "fchatVoiceCallButton"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "fchatVoiceCallButton";


    button.innerHTML =
        "📞";


    button.title =
        "Voice Call";


    // Button style

    button.style.position =
        "fixed";


    button.style.top =
        "70px";


    button.style.right =
        "65px";


    button.style.width =
        "48px";


    button.style.height =
        "48px";


    button.style.border =
        "none";


    button.style.borderRadius =
        "50%";


    button.style.background =
        "#25D366";


    button.style.color =
        "white";


    button.style.fontSize =
        "23px";


    button.style.cursor =
        "pointer";


    button.style.zIndex =
        "999999";


    button.style.display =
        "none";


    button.onclick =
        function () {


            if (
                typeof currentChat ===
                "undefined"
            ) {

                alert(
                    "Pehle chat open karo."
                );

                return;

            }


            if (
                !currentChat
            ) {

                alert(
                    "Pehle kisi user ki chat open karo."
                );

                return;

            }


            fchatStartVoiceCall(
                currentChat
            );

        };


    document.body.appendChild(
        button
    );

}


// ==========================================
// SHOW / HIDE CALL BUTTON
// ==========================================

function fchatUpdateVoiceCallButton() {

    const button =
        document.getElementById(
            "fchatVoiceCallButton"
        );


    if (!button) {

        return;

    }


    // Chat open hai

    if (

        typeof currentChat !==
        "undefined"

        &&

        currentChat

    ) {

        button.style.display =
            "flex";


        button.style.alignItems =
            "center";


        button.style.justifyContent =
            "center";

    }


    // Chat closed

    else {

        button.style.display =
            "none";

    }

}


// ==========================================
// CALL SCREEN
// ==========================================

function fchatShowVoiceCallScreen(
    username
) {


    // Remove old screen

    const oldScreen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (oldScreen) {

        oldScreen.remove();

    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "fchatVoiceCallScreen";


    screen.style.position =
        "fixed";


    screen.style.top =
        "0";


    screen.style.left =
        "0";


    screen.style.width =
        "100%";


    screen.style.height =
        "100%";


    screen.style.background =
        "linear-gradient(135deg, #075E54, #128C7E)";


    screen.style.zIndex =
        "9999999";


    screen.style.display =
        "flex";


    screen.style.flexDirection =
        "column";


    screen.style.alignItems =
        "center";


    screen.style.justifyContent =
        "center";


    screen.style.color =
        "white";


    screen.innerHTML = `

        <div
            style="
                width:120px;
                height:120px;

                border-radius:50%;

                background:
                rgba(
                    255,
                    255,
                    255,
                    0.2
                );

                display:flex;

                align-items:center;

                justify-content:center;

                font-size:55px;

                margin-bottom:20px;
            "
        >
            👤
        </div>


        <h2
            style="
                margin:0;
                font-family:Arial;
            "
        >
            ${fchatEscapeHTML(username)}
        </h2>


        <p
            id="fchatCallStatus"
            style="
                font-family:Arial;
                font-size:16px;
                opacity:0.9;
            "
        >
            Calling...
        </p>


        <button

            id="fchatEndCallButton"

            style="
                position:absolute;

                bottom:60px;

                width:70px;

                height:70px;

                border:none;

                border-radius:50%;

                background:#e53935;

                color:white;

                font-size:28px;

                cursor:pointer;
            "

        >
            📵
        </button>

    `;


    document.body.appendChild(
        screen
    );


    const endButton =
        document.getElementById(
            "fchatEndCallButton"
        );


    if (endButton) {


        endButton.onclick =
            function () {

                fchatEndVoiceCall();

            };

    }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function fchatEscapeHTML(text) {


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


// ==========================================
// START VOICE CALL
// ==========================================

async function fchatStartVoiceCall(
    username
) {


    // Already active?

    if (
        window.fchatVoiceCallActive
    ) {

        return;

    }


    try {


        window.fchatVoiceCallActive =
            true;


        window.fchatVoiceCallPartner =
            username;


        // Show call screen

        fchatShowVoiceCallScreen(
            username
        );


        fchatSetCallStatus(
            "Connecting microphone..."
        );


        // Get microphone

        const stream =

            await navigator.mediaDevices
            .getUserMedia({

                audio: true,

                video: false

            });


        window.fchatLocalStream =
            stream;


        fchatSetCallStatus(
            "Microphone connected"
        );


        console.log(
            "F Chat voice call started with:",
            username
        );
      fchatSendCallRequest(username);


        // ----------------------------------
        // REAL WEBRTC CALL
        // NEXT PART WILL GO HERE
        // ----------------------------------


    }

    catch (error) {

    console.error(
        "Microphone error:",
        error
    );


    alert(
        "Microphone Error: " +
        error.name +
        "\n\n" +
        error.message
    );


    fchatEndVoiceCall();

    }

}


// ==========================================
// SET CALL STATUS
// ==========================================

function fchatSetCallStatus(
    text
) {


    const status =
        document.getElementById(
            "fchatCallStatus"
        );


    if (status) {

        status.innerText =
            text;

    }

}


// ==========================================
// END VOICE CALL
// ==========================================

function fchatEndVoiceCall() {


    // Stop microphone

    if (
        window.fchatLocalStream
    ) {


        window.fchatLocalStream
        .getTracks()
        .forEach(

            function (track) {

                track.stop();

            }

        );


        window.fchatLocalStream =
            null;

    }


    // Remove screen

    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (screen) {

        screen.remove();

    }


    // Reset

    window.fchatVoiceCallActive =
        false;


    window.fchatVoiceCallPartner =
        null;

}


// ==========================================
// START BUTTON SYSTEM
// ==========================================

setTimeout(

    function () {


        fchatAddVoiceCallButton();


        setInterval(

            function () {


                fchatAddVoiceCallButton();


                fchatUpdateVoiceCallButton();


            },

            300

        );


    },

    1000

);


// ==========================================
// F CHAT FEATURES 3 END
// ==========================================
// ==========================================
// F CHAT VOICE CALL - STEP 2
// SUPABASE CALL SIGNALING
// ==========================================


// ==========================================
// CALL VARIABLES
// ==========================================

window.fchatCallChannel = null;

window.fchatIncomingCall = null;


// ==========================================
// CREATE CALL CHANNEL
// ==========================================

function fchatSetupCallChannel() {


    // Current user check

    if (

        typeof currentUser ===
        "undefined"

        ||

        !currentUser

    ) {

        return;

    }


    // Already connected

    if (

        window.fchatCallChannel

    ) {

        return;

    }


    // Personal channel

    const channelName =

        "fchat-calls-" +

        currentUser;


    window.fchatCallChannel =

        supabaseClient

        .channel(

            channelName

        )

        .on(

            "broadcast",

            {

                event:
                    "incoming-call"

            },

            function (payload) {


                const data =
                    payload.payload;


                // Ignore own call

                if (

                    !data

                    ||

                    data.to !==
                    currentUser

                ) {

                    return;

                }


                fchatShowIncomingCall(

                    data.from

                );


            }

        )

        .subscribe(

            function (status) {

                console.log(

                    "Call channel:",

                    status

                );

            }

        );

}


// ==========================================
// SHOW INCOMING CALL
// ==========================================

function fchatShowIncomingCall(
    username
) {


    // Already in a call

    if (

        window.fchatVoiceCallActive

    ) {

        return;

    }


    window.fchatIncomingCall = {

        from:
            username

    };


    // Remove old screen

    const oldScreen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (

        oldScreen

    ) {

        oldScreen.remove();

    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "fchatVoiceCallScreen";


    screen.style.position =
        "fixed";


    screen.style.inset =
        "0";


    screen.style.background =
        "linear-gradient(135deg, #075E54, #128C7E)";


    screen.style.zIndex =
        "9999999";


    screen.style.display =
        "flex";


    screen.style.flexDirection =
        "column";


    screen.style.alignItems =
        "center";


    screen.style.justifyContent =
        "center";


    screen.style.color =
        "white";


    screen.innerHTML = `

        <div
            style="
                width:120px;
                height:120px;

                border-radius:50%;

                background:
                rgba(255,255,255,0.2);

                display:flex;

                align-items:center;

                justify-content:center;

                font-size:55px;

                margin-bottom:20px;
            "
        >
            👤
        </div>


        <h2
            style="
                font-family:Arial;
                margin:0;
            "
        >
            ${fchatEscapeHTML(username)}
        </h2>


        <p
            style="
                font-family:Arial;
                opacity:0.9;
            "
        >
            Incoming voice call...
        </p>


        <div
            style="
                display:flex;
                gap:35px;
                margin-top:30px;
            "
        >


            <!-- REJECT -->

            <button

                id="fchatRejectCall"

                style="
                    width:70px;
                    height:70px;

                    border:none;
                    border-radius:50%;

                    background:#e53935;

                    color:white;

                    font-size:28px;

                    cursor:pointer;
                "

            >
                ❌
            </button>


            <!-- ACCEPT -->

            <button

                id="fchatAcceptCall"

                style="
                    width:70px;
                    height:70px;

                    border:none;
                    border-radius:50%;

                    background:#25D366;

                    color:white;

                    font-size:28px;

                    cursor:pointer;
                "

            >
                📞
            </button>


        </div>

    `;


    document.body.appendChild(
        screen
    );


    // Reject

    document.getElementById(
        "fchatRejectCall"
    ).onclick =

        function () {

            fchatRejectIncomingCall();

        };


    // Accept

    document.getElementById(
        "fchatAcceptCall"
    ).onclick =

        function () {

            fchatAcceptIncomingCall();

        };

}


// ==========================================
// ACCEPT INCOMING CALL
// ==========================================

async function fchatAcceptIncomingCall() {


    if (

        !window.fchatIncomingCall

    ) {

        return;

    }


    window.fchatVoiceCallActive =
        true;


    window.fchatVoiceCallPartner =

        window.fchatIncomingCall.from;


    fchatSetCallStatus(
        "Connecting..."
    );


    try {


        const stream =

            await navigator.mediaDevices
            .getUserMedia({

                audio: true,

                video: false

            });


        window.fchatLocalStream =
            stream;


        fchatSetCallStatus(
            "Microphone connected"
        );


        console.log(
            "Accepted call from:",
            window.fchatVoiceCallPartner
        );


    }

    catch (error) {


        console.error(error);


        alert(
            "Microphone permission allow karo."
        );


        fchatEndVoiceCall();

    }

}


// ==========================================
// REJECT INCOMING CALL
// ==========================================

function fchatRejectIncomingCall() {


    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (

        screen

    ) {

        screen.remove();

    }


    window.fchatIncomingCall =
        null;


}


// ==========================================
// SEND CALL REQUEST
// ==========================================

function fchatSendCallRequest(
    username
) {


    if (

        !username

    ) {

        return;

    }


    // Receiver channel

    const receiverChannel =

        supabaseClient

        .channel(

            "fchat-calls-" +

            username

        );


    receiverChannel

    .subscribe(

        function (status) {


            if (

                status ===
                "SUBSCRIBED"

            ) {


                receiverChannel.send({

                    type:
                        "broadcast",

                    event:
                        "incoming-call",

                    payload: {

                        from:
                            currentUser,

                        to:
                            username

                    }

                });


                // Close temporary channel

                setTimeout(

                    function () {

                        supabaseClient
                        .removeChannel(

                            receiverChannel

                        );

                    },

                    1000

                );

            }

        }

    );

}


// ==========================================
// SETUP CALL LISTENER
// ==========================================

setInterval(

    function () {

        fchatSetupCallChannel();

    },

    1000

);


// ==========================================
// END STEP 2
// ==========================================
// ==========================================
// F CHAT - VOICE CALL SIGNALING FIX
// ==========================================

window.fchatCallChannel = null;
window.fchatIncomingCall = null;
window.fchatCurrentCallId = null;


// ==========================================
// SETUP PERSONAL CALL CHANNEL
// ==========================================

function fchatSetupCallChannel() {

    if (
        typeof currentUser === "undefined" ||
        !currentUser
    ) {
        return;
    }


    if (window.fchatCallChannel) {
        return;
    }


    const channelName =
        "fchat-calls-" + currentUser;


    const channel =
        supabaseClient.channel(
            channelName
        );


    channel.on(
        "broadcast",
        {
            event: "incoming-call"
        },
        function (payload) {

            const data =
                payload.payload;


            if (!data) {
                return;
            }


            if (
                data.to !== currentUser
            ) {
                return;
            }


            // Same call ko baar-baar show mat karo

            if (
                window.fchatCurrentCallId ===
                data.callId
            ) {
                return;
            }


            window.fchatCurrentCallId =
                data.callId;


            fchatShowIncomingCall(
                data.from
            );

        }
    );


    channel.subscribe(
        function (status) {

            console.log(
                "F-Chat Call Channel:",
                status
            );

        }
    );


    window.fchatCallChannel =
        channel;

}


// ==========================================
// SEND CALL REQUEST
// ==========================================

async function fchatSendCallRequest(
    username
) {

    if (!username) {
        return;
    }


    if (
        typeof currentUser ===
        "undefined" ||
        !currentUser
    ) {

        alert(
            "Current user nahi mila."
        );

        return;

    }


    const callId =
        Date.now().toString() +
        "-" +
        Math.random()
        .toString(36)
        .substring(2, 8);


    window.fchatCurrentCallId =
        callId;


    const channelName =
        "fchat-calls-" +
        username;


    const receiverChannel =
        supabaseClient.channel(
            channelName
        );


    let sent = false;


    receiverChannel.subscribe(
        async function (status) {

            console.log(
                "Receiver channel:",
                status
            );


            if (
                status !==
                "SUBSCRIBED"
            ) {
                return;
            }


            // Call ko multiple times bhejenge
            // taaki receiver miss na kare

            for (
                let i = 0;
                i < 5;
                i++
            ) {

                await receiverChannel.send({

                    type:
                        "broadcast",

                    event:
                        "incoming-call",

                    payload: {

                        callId:
                            callId,

                        from:
                            currentUser,

                        to:
                            username

                    }

                });


                sent = true;


                await new Promise(
                    function (resolve) {

                        setTimeout(
                            resolve,
                            800
                        );

                    }
                );

            }


            setTimeout(
                function () {

                    supabaseClient
                    .removeChannel(
                        receiverChannel
                    );

                },
                1000
            );

        }
    );

}


// ==========================================
// INCOMING CALL SCREEN
// ==========================================

function fchatShowIncomingCall(
    username
) {

    if (
        window.fchatVoiceCallActive
    ) {
        return;
    }


    window.fchatIncomingCall = {

        from:
            username

    };


    const oldScreen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (oldScreen) {
        oldScreen.remove();
    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "fchatVoiceCallScreen";


    screen.style.position =
        "fixed";

    screen.style.inset =
        "0";

    screen.style.background =
        "linear-gradient(135deg,#075E54,#128C7E)";

    screen.style.zIndex =
        "9999999";

    screen.style.display =
        "flex";

    screen.style.flexDirection =
        "column";

    screen.style.alignItems =
        "center";

    screen.style.justifyContent =
        "center";

    screen.style.color =
        "white";


    screen.innerHTML = `

        <div
            style="
                width:120px;
                height:120px;
                border-radius:50%;
                background:rgba(255,255,255,.2);
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:55px;
                margin-bottom:20px;
            "
        >
            📞
        </div>

        <h2
            style="
                margin:0;
                font-family:Arial;
            "
        >
            ${fchatEscapeHTML(username)}
        </h2>

        <p
            style="
                font-family:Arial;
                font-size:17px;
            "
        >
            Incoming voice call...
        </p>

        <div
            style="
                display:flex;
                gap:35px;
                margin-top:30px;
            "
        >

            <button
                id="fchatRejectCall"
                style="
                    width:70px;
                    height:70px;
                    border:none;
                    border-radius:50%;
                    background:#e53935;
                    color:white;
                    font-size:28px;
                "
            >
                ❌
            </button>

            <button
                id="fchatAcceptCall"
                style="
                    width:70px;
                    height:70px;
                    border:none;
                    border-radius:50%;
                    background:#25D366;
                    color:white;
                    font-size:28px;
                "
            >
                📞
            </button>

        </div>
    `;


    document.body.appendChild(
        screen
    );


    document.getElementById(
        "fchatRejectCall"
    ).onclick =
        function () {

            fchatRejectIncomingCall();

        };


    document.getElementById(
        "fchatAcceptCall"
    ).onclick =
        function () {

            fchatAcceptIncomingCall();

        };

}


// ==========================================
// ACCEPT CALL
// ==========================================

async function fchatAcceptIncomingCall() {

    if (
        !window.fchatIncomingCall
    ) {
        return;
    }


    const username =
        window.fchatIncomingCall.from;


    window.fchatVoiceCallActive =
        true;


    window.fchatVoiceCallPartner =
        username;


    fchatSetCallStatus(
        "Connecting microphone..."
    );


    try {

        const stream =
            await navigator.mediaDevices
            .getUserMedia({

                audio: true,

                video: false

            });


        window.fchatLocalStream =
            stream;


        fchatSetCallStatus(
            "Microphone connected"
        );


        console.log(
            "Call accepted:",
            username
        );


        // Actual WebRTC connection
        // next step me add karenge

    }

    catch (error) {

        console.error(
            "Incoming call microphone error:",
            error
        );


        alert(
            "Microphone Error: " +
            error.name +
            "\n\n" +
            error.message
        );


        fchatEndVoiceCall();

    }

}


// ==========================================
// REJECT CALL
// ==========================================

function fchatRejectIncomingCall() {

    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (screen) {
        screen.remove();
    }


    window.fchatIncomingCall =
        null;


    window.fchatCurrentCallId =
        null;

}


// ==========================================
// START CALL LISTENER
// ==========================================

setInterval(
    function () {

        fchatSetupCallChannel();

    },
    500
);


// ==========================================
// VOICE CALL SIGNALING FIX END
// ==========================================
// ==========================================================
// F-CHAT VOICE CALL v3
// PART 1/2 — WEBRTC + CALL UI + CALLER
// ==========================================================

(function () {

    window.fchatVoiceCallActive = false;
    window.fchatVoiceCallPartner = null;
    window.fchatLocalStream = null;
    window.fchatPeerConnection = null;
    window.fchatIncomingCall = null;
    window.fchatCurrentCallId = null;

    window.fchatProcessedSignals = {};
    window.fchatOfferProcessed = false;

    const ICE_SERVERS = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ]
    };

    // ======================================================
    // ESCAPE HTML
    // ======================================================

    function fchatEscapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text || "";

        return div.innerHTML;
    }

    // ======================================================
    // CALL BUTTON
    // ======================================================

    function fchatAddVoiceCallButton() {

        if (
            document.getElementById(
                "fchatVoiceCallButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "fchatVoiceCallButton";

        button.innerHTML =
            "📞";

        button.style.position =
            "fixed";

        button.style.right =
            "20px";

        button.style.bottom =
            "80px";

        button.style.width =
            "58px";

        button.style.height =
            "58px";

        button.style.border =
            "none";

        button.style.borderRadius =
            "50%";

        button.style.background =
            "#25D366";

        button.style.color =
            "white";

        button.style.fontSize =
            "25px";

        button.style.zIndex =
            "99999";

        button.style.cursor =
            "pointer";

        button.style.display =
            "none";

        button.onclick =
            async function () {

                if (
                    typeof currentChat ===
                    "undefined" ||
                    !currentChat
                ) {

                    alert(
                        "Pehle kisi user ki chat open karo."
                    );

                    return;
                }

                await fchatStartVoiceCall(
                    currentChat
                );
            };

        document.body.appendChild(
            button
        );
    }

    // ======================================================
    // UPDATE BUTTON
    // ======================================================

    function fchatUpdateVoiceCallButton() {

        const button =
            document.getElementById(
                "fchatVoiceCallButton"
            );

        if (!button) {
            return;
        }

        if (
            typeof currentChat !==
            "undefined" &&
            currentChat &&
            !window.fchatVoiceCallActive
        ) {

            button.style.display =
                "flex";

            button.style.alignItems =
                "center";

            button.style.justifyContent =
                "center";

        } else {

            button.style.display =
                "none";
        }
    }

    // ======================================================
    // CALL SCREEN
    // ======================================================

    function fchatShowVoiceCallScreen(
        username,
        status
    ) {

        const oldScreen =
            document.getElementById(
                "fchatVoiceCallScreen"
            );

        if (oldScreen) {
            oldScreen.remove();
        }

        const screen =
            document.createElement("div");

        screen.id =
            "fchatVoiceCallScreen";

        screen.style.position =
            "fixed";

        screen.style.inset =
            "0";

        screen.style.background =
            "linear-gradient(135deg,#075E54,#128C7E)";

        screen.style.zIndex =
            "9999999";

        screen.style.display =
            "flex";

        screen.style.flexDirection =
            "column";

        screen.style.alignItems =
            "center";

        screen.style.justifyContent =
            "center";

        screen.style.color =
            "white";

        screen.style.fontFamily =
            "Arial";

        screen.innerHTML = `

            <div style="
                width:120px;
                height:120px;
                border-radius:50%;
                background:rgba(255,255,255,.2);
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:55px;
                margin-bottom:20px;
            ">
                👤
            </div>

            <h2 style="margin:0;">
                ${fchatEscapeHTML(username)}
            </h2>

            <p
                id="fchatCallStatus"
                style="
                    font-size:17px;
                    opacity:.9;
                "
            >
                ${fchatEscapeHTML(status)}
            </p>

            <button
                id="fchatEndCallButton"
                style="
                    position:absolute;
                    bottom:60px;
                    width:70px;
                    height:70px;
                    border:none;
                    border-radius:50%;
                    background:#e53935;
                    color:white;
                    font-size:28px;
                    cursor:pointer;
                "
            >
                📵
            </button>

            <audio
                id="fchatRemoteAudio"
                autoplay
                playsinline
            ></audio>
        `;

        document.body.appendChild(
            screen
        );

        const endButton =
            document.getElementById(
                "fchatEndCallButton"
            );

        if (endButton) {

            endButton.onclick =
                function () {

                    fchatEndVoiceCall(
                        true
                    );

                };
        }
    }

    // ======================================================
    // CALL STATUS
    // ======================================================

    function fchatSetCallStatus(
        text
    ) {

        const status =
            document.getElementById(
                "fchatCallStatus"
            );

        if (status) {
            status.textContent =
                text;
        }
    }

    // ======================================================
    // CREATE WEBRTC CONNECTION
    // ======================================================

    async function fchatCreatePeerConnection(
        partner,
        callId
    ) {

        if (
            window.fchatPeerConnection
        ) {

            try {
                window.fchatPeerConnection.close();
            } catch (e) {}
        }

        const pc =
            new RTCPeerConnection(
                ICE_SERVERS
            );

        window.fchatPeerConnection =
            pc;

        // LOCAL AUDIO
        if (
            window.fchatLocalStream
        ) {

            window.fchatLocalStream
                .getTracks()
                .forEach(
                    function (track) {

                        pc.addTrack(
                            track,
                            window.fchatLocalStream
                        );

                    }
                );
        }

        // REMOTE AUDIO
        pc.ontrack =
            function (event) {

                console.log(
                    "Remote audio received"
                );

                let audio =
                    document.getElementById(
                        "fchatRemoteAudio"
                    );

                if (!audio) {

                    audio =
                        document.createElement(
                            "audio"
                        );

                    audio.id =
                        "fchatRemoteAudio";

                    audio.autoplay =
                        true;

                    audio.playsInline =
                        true;

                    document.body.appendChild(
                        audio
                    );
                }

                audio.srcObject =
                    event.streams[0];

                audio.play()
                    .catch(
                        function (error) {

                            console.log(
                                "Audio play:",
                                error
                            );

                        }
                    );

                fchatSetCallStatus(
                    "Connected 🔊"
                );
            };

        // ICE
        pc.onicecandidate =
            async function (event) {

                if (
                    !event.candidate
                ) {
                    return;
                }

                await fchatSendSignal(
                    partner,
                    callId,
                    "ice",
                    {
                        candidate:
                            event.candidate
                    }
                );
            };

        // CONNECTION STATE
        pc.onconnectionstatechange =
            function () {

                console.log(
                    "WebRTC:",
                    pc.connectionState
                );

                if (
                    pc.connectionState ===
                    "connected"
                ) {

                    fchatSetCallStatus(
                        "Connected 🔊"
                    );
                }

                if (
                    pc.connectionState ===
                    "failed"
                ) {

                    fchatSetCallStatus(
                        "Connection failed"
                    );
                }
            };

        return pc;
    }

    // ======================================================
    // SEND SIGNAL TO SUPABASE
    // ======================================================

    async function fchatSendSignal(
        toUser,
        callId,
        type,
        data
    ) {

        const {
            error
        } =
        await supabaseClient
            .from("call_signals")
            .insert({

                from_user:
                    currentUser,

                to_user:
                    toUser,

                signal_type:
                    type,

                signal: {

                    callId:
                        callId,

                    from:
                        currentUser,

                    to:
                        toUser,

                    data:
                        data
                }
            });

        if (error) {

            console.error(
                "Signal error:",
                error
            );
        }
    }

    // ======================================================
    // START VOICE CALL
    // ======================================================

    async function fchatStartVoiceCall(
        username
    ) {

        if (
            !username ||
            !currentUser
        ) {
            return;
        }

        if (
            window.fchatVoiceCallActive
        ) {
            return;
        }

        window.fchatVoiceCallActive =
            true;

        window.fchatVoiceCallPartner =
            username;

        window.fchatOfferProcessed =
            false;

        const callId =
            Date.now().toString() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        window.fchatCurrentCallId =
            callId;

        fchatShowVoiceCallScreen(
            username,
            "Calling..."
        );

        try {

            // MICROPHONE
            window.fchatLocalStream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: true,
                        video: false
                    });

            fchatSetCallStatus(
                "Microphone connected..."
            );

            // WEBRTC
            const pc =
                await fchatCreatePeerConnection(
                    username,
                    callId
                );

            // CREATE OFFER
            const offer =
                await pc.createOffer();

            await pc.setLocalDescription(
                offer
            );

            // SEND OFFER
            await fchatSendSignal(
                username,
                callId,
                "offer",
                {
                    type:
                        offer.type,

                    sdp:
                        offer.sdp
                }
            );

            fchatSetCallStatus(
                "Ringing..."
            );

            console.log(
                "OFFER SENT:",
                callId
            );

        } catch (error) {

            console.error(
                "Start call error:",
                error
            );

            alert(
                "Microphone permission allow karo."
            );

            fchatEndVoiceCall(
                false
            );
        }
    }

    // ======================================================
    // EXPORT PART 1 FUNCTIONS
    // ======================================================

    window.fchatStartVoiceCall =
        fchatStartVoiceCall;

    window.fchatShowVoiceCallScreen =
        fchatShowVoiceCallScreen;

    window.fchatSetCallStatus =
        fchatSetCallStatus;

    // ======================================================
    // INITIALIZE BUTTON
    // ======================================================

    setTimeout(
        function () {

            fchatAddVoiceCallButton();
            fchatUpdateVoiceCallButton();

        },
        1000
    );

    setInterval(
        function () {

            fchatAddVoiceCallButton();
            fchatUpdateVoiceCallButton();

        },
        1000
    );

})();
// ============================================================
// F-CHAT VOICE CALL - PART 2A
// ACCEPT + WEBRTC CONNECTION + ANSWER
// ============================================================

(function () {

    let iceQueue = [];

    // ----------------------------------------------------------
    // Send signal to Supabase
    // ----------------------------------------------------------

    async function sendCallSignal(toUser, signalType, signalData) {

        if (!window.supabaseClient) {
            console.error("❌ Supabase client not found");
            return;
        }

        const { error } =
            await window.supabaseClient
                .from("call_signals")
                .insert([{
                    from_user: window.currentUser,
                    to_user: toUser,
                    signal_type: signalType,
                    signal: signalData
                }]);

        if (error) {
            console.error(
                "❌ Signal send error:",
                error
            );
        }

    }


    // ----------------------------------------------------------
    // Create WebRTC Peer
    // ----------------------------------------------------------

    function createCallPeer(partner) {

        const pc = new RTCPeerConnection({

            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302"
                }
            ]

        });


        // ICE candidate

        pc.onicecandidate = function (event) {

            if (!event.candidate) {
                return;
            }

            sendCallSignal(
                partner,
                "ice",
                {
                    callId:
                        window.fchatCurrentCallId,

                    candidate:
                        event.candidate
                }
            );

        };


        // Remote audio

        pc.ontrack = function (event) {

            console.log(
                "🎧 Remote audio received"
            );

            let audio =
                document.getElementById(
                    "fchatRemoteAudio"
                );


            if (!audio) {

                audio =
                    document.createElement(
                        "audio"
                    );

                audio.id =
                    "fchatRemoteAudio";

                audio.autoplay =
                    true;

                audio.playsInline =
                    true;

                audio.style.display =
                    "none";

                document.body.appendChild(
                    audio
                );

            }


            if (
                event.streams &&
                event.streams[0]
            ) {

                audio.srcObject =
                    event.streams[0];

                audio.play()
                    .catch(function (err) {

                        console.log(
                            "Audio play:",
                            err
                        );

                    });

            }

        };


        // Connection status

        pc.onconnectionstatechange =
            function () {

                console.log(
                    "📡 WebRTC:",
                    pc.connectionState
                );


                if (
                    pc.connectionState ===
                    "connected"
                ) {

                    const status =
                        document.getElementById(
                            "fchatCallStatus"
                        );

                    if (status) {

                        status.innerText =
                            "Connected";

                    }

                }

            };


        return pc;

    }


    // ----------------------------------------------------------
    // ACCEPT INCOMING CALL
    // ----------------------------------------------------------

    window.fchatAcceptIncomingCall =
        async function () {

            try {

                const incoming =
                    window.fchatIncomingCall;


                if (!incoming) {

                    console.log(
                        "❌ No incoming call"
                    );

                    return;

                }


                const caller =
                    incoming.from_user;


                const signal =
                    incoming.signal;


                const offer =
                    signal.data;


                window.fchatCurrentCallId =
                    signal.callId;


                window.fchatVoiceCallPartner =
                    caller;


                console.log(
                    "📞 Accepting call from:",
                    caller
                );


                // ------------------------------------------------
                // Microphone
                // ------------------------------------------------

                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            audio: true
                        });


                window.fchatLocalStream =
                    stream;


                // ------------------------------------------------
                // Create Peer
                // ------------------------------------------------

                const pc =
                    createCallPeer(
                        caller
                    );


                window.fchatPeerConnection =
                    pc;


                // Add microphone

                stream.getTracks()
                    .forEach(function (track) {

                        pc.addTrack(
                            track,
                            stream
                        );

                    });


                // ------------------------------------------------
                // Close incoming popup
                // ------------------------------------------------

                const popup =
                    document.getElementById(
                        "fchatIncomingCall"
                    );

                if (popup) {
                    popup.remove();
                }


                // ------------------------------------------------
                // Show active call screen
                // ------------------------------------------------

                if (
                    window
                        .fchatShowVoiceCallScreen
                ) {

                    window
                        .fchatShowVoiceCallScreen(
                            caller,
                            "Connecting..."
                        );

                }


                // ------------------------------------------------
                // Set caller offer
                // ------------------------------------------------

                await pc.setRemoteDescription(
                    new RTCSessionDescription(
                        offer
                    )
                );


                // ------------------------------------------------
                // Add ICE candidates
                // ------------------------------------------------

                for (
                    const candidate
                    of iceQueue
                ) {

                    try {

                        await pc.addIceCandidate(
                            new RTCIceCandidate(
                                candidate
                            )
                        );

                    } catch (error) {

                        console.log(
                            "ICE queue error:",
                            error
                        );

                    }

                }


                iceQueue = [];


                // ------------------------------------------------
                // Create Answer
                // ------------------------------------------------

                const answer =
                    await pc.createAnswer();


                await pc.setLocalDescription(
                    answer
                );


                // ------------------------------------------------
                // Send Answer to Caller
                // ------------------------------------------------

                await sendCallSignal(
                    caller,
                    "answer",
                    {
                        callId:
                            window
                                .fchatCurrentCallId,

                        data: {
                            type:
                                answer.type,

                            sdp:
                                answer.sdp
                        }
                    }
                );


                console.log(
                    "✅ Answer sent"
                );


                window.fchatIncomingCall =
                    null;


                window.fchatVoiceCallActive =
                    true;


            } catch (error) {

                console.error(
                    "❌ Accept call error:",
                    error
                );

                alert(
                    "Microphone permission required!"
                );

            }

        };


    // ----------------------------------------------------------
    // REJECT INCOMING CALL
    // ----------------------------------------------------------

    window.fchatRejectIncomingCall =
        async function () {

            const incoming =
                window.fchatIncomingCall;


            if (!incoming) {
                return;
            }


            await sendCallSignal(
                incoming.from_user,
                "reject",
                {
                    callId:
                        incoming.signal.callId
                }
            );


            window.fchatIncomingCall =
                null;


            const popup =
                document.getElementById(
                    "fchatIncomingCall"
                );


            if (popup) {
                popup.remove();
            }


            console.log(
                "❌ Call rejected"
            );

        };


    // ----------------------------------------------------------
    // Make functions available for Part 2B
    // ----------------------------------------------------------

    window.fchatSendCallSignal =
        sendCallSignal;

    window.fchatCreateCallPeer =
        createCallPeer;

    window.fchatIceQueue =
        iceQueue;


    console.log(
        "📞 F-Chat Voice Call Part 2A loaded"
    );

})();// ============================================================
// F-CHAT VOICE CALL - PART 2B
// ANSWER + ICE + REALTIME POLLING + END CALL
// ============================================================

(function () {

    const processedSignals = new Set();
    let localIceQueue = [];


    // ----------------------------------------------------------
    // PROCESS ANSWER
    // ----------------------------------------------------------

    async function processAnswer(row) {

        const signal = row.signal;

        if (
            !window.fchatPeerConnection ||
            !signal ||
            signal.callId !==
                window.fchatCurrentCallId
        ) {
            return;
        }

        try {

            await window.fchatPeerConnection
                .setRemoteDescription(
                    new RTCSessionDescription(
                        signal.data
                    )
                );

            console.log("✅ Answer received");

            for (
                const candidate of localIceQueue
            ) {

                try {

                    await window.fchatPeerConnection
                        .addIceCandidate(
                            new RTCIceCandidate(
                                candidate
                            )
                        );

                } catch (error) {

                    console.log(
                        "ICE queue error:",
                        error
                    );

                }

            }

            localIceQueue = [];

        } catch (error) {

            console.error(
                "❌ Answer error:",
                error
            );

        }

    }


    // ----------------------------------------------------------
    // PROCESS ICE
    // ----------------------------------------------------------

    async function processICE(row) {

        const signal = row.signal;

        if (
            !signal ||
            signal.callId !==
                window.fchatCurrentCallId
        ) {
            return;
        }

        if (!window.fchatPeerConnection) {
            return;
        }

        const candidate =
            signal.candidate;

        try {

            if (
                window.fchatPeerConnection
                    .remoteDescription
            ) {

                await window.fchatPeerConnection
                    .addIceCandidate(
                        new RTCIceCandidate(
                            candidate
                        )
                    );

            } else {

                localIceQueue.push(
                    candidate
                );

            }

        } catch (error) {

            console.error(
                "❌ ICE error:",
                error
            );

        }

    }


    // ----------------------------------------------------------
    // CLEANUP WITHOUT SENDING END AGAIN
    // ----------------------------------------------------------

    function cleanupCall() {

        if (
            window.fchatPeerConnection
        ) {

            try {

                window.fchatPeerConnection
                    .close();

            } catch (e) {}

        }

        window.fchatPeerConnection =
            null;


        if (
            window.fchatLocalStream
        ) {

            window.fchatLocalStream
                .getTracks()
                .forEach(function (track) {

                    track.stop();

                });

        }

        window.fchatLocalStream =
            null;

        window.fchatCurrentCallId =
            null;

        window.fchatVoiceCallPartner =
            null;

        window.fchatVoiceCallActive =
            false;

        window.fchatIncomingCall =
            null;

        localIceQueue = [];


        const audio =
            document.getElementById(
                "fchatRemoteAudio"
            );

        if (audio) {

            audio.srcObject = null;
            audio.remove();

        }


        const incoming =
            document.getElementById(
                "fchatIncomingCall"
            );

        if (incoming) {
            incoming.remove();
        }


        const callScreen =
            document.getElementById(
                "fchatVoiceCallScreen"
            );

        if (callScreen) {
            callScreen.remove();
        }

    }


    // ----------------------------------------------------------
    // END CALL
    // ----------------------------------------------------------

    window.fchatEndVoiceCall =
        async function () {

            const partner =
                window.fchatVoiceCallPartner;

            const callId =
                window.fchatCurrentCallId;


            if (
                partner &&
                callId &&
                window.fchatSendCallSignal
            ) {

                await window.fchatSendCallSignal(
                    partner,
                    "end",
                    {
                        callId: callId
                    }
                );

            }


            cleanupCall();

            console.log(
                "📞 Voice call ended"
            );

        };


    // ----------------------------------------------------------
    // HANDLE REMOTE END
    // ----------------------------------------------------------

    function handleRemoteEnd(row) {

        const signal = row.signal;

        if (
            !signal ||
            signal.callId !==
                window.fchatCurrentCallId
        ) {
            return;
        }

        console.log(
            "📴 Other user ended the call"
        );

        cleanupCall();

    }


    // ----------------------------------------------------------
    // HANDLE REJECT
    // ----------------------------------------------------------

    function handleReject(row) {

        const signal = row.signal;

        if (
            !signal ||
            signal.callId !==
                window.fchatCurrentCallId
        ) {
            return;
        }

        alert(
            "Call rejected"
        );

        cleanupCall();

    }


    // ----------------------------------------------------------
    // CHECK CALL SIGNALS
    // ----------------------------------------------------------

    async function checkCallSignals() {

        if (
            !window.supabaseClient ||
            !window.currentUser
        ) {
            return;
        }


        try {

            const result =
                await window.supabaseClient
                    .from("call_signals")
                    .select("*")
                    .eq(
                        "to_user",
                        window.currentUser
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (result.error) {

                console.error(
                    "Signal error:",
                    result.error
                );

                return;

            }


            const rows =
                result.data || [];


            for (
                const row of rows
            ) {

                if (
                    processedSignals.has(
                        row.id
                    )
                ) {
                    continue;
                }


                processedSignals.add(
                    row.id
                );


                // -------------------------------
                // Incoming OFFER
                // -------------------------------

                if (
                    row.signal_type ===
                    "offer"
                ) {

                    if (
                        !window.fchatIncomingCall &&
                        !window.fchatVoiceCallActive
                    ) {

                        window.fchatIncomingCall =
                            row;


                        showIncomingCall(
                            row
                        );

                    }

                }


                // -------------------------------
                // ANSWER
                // -------------------------------

                else if (
                    row.signal_type ===
                    "answer"
                ) {

                    await processAnswer(
                        row
                    );

                }


                // -------------------------------
                // ICE
                // -------------------------------

                else if (
                    row.signal_type ===
                    "ice"
                ) {

                    await processICE(
                        row
                    );

                }


                // -------------------------------
                // REJECT
                // -------------------------------

                else if (
                    row.signal_type ===
                    "reject"
                ) {

                    handleReject(
                        row
                    );

                }


                // -------------------------------
                // END
                // -------------------------------

                else if (
                    row.signal_type ===
                    "end"
                ) {

                    handleRemoteEnd(
                        row
                    );

                }

            }

        } catch (error) {

            console.error(
                "❌ Call polling error:",
                error
            );

        }

    }


    // ----------------------------------------------------------
    // INCOMING CALL UI
    // ----------------------------------------------------------

    function showIncomingCall(row) {

        if (
            document.getElementById(
                "fchatIncomingCall"
            )
        ) {
            return;
        }


        const caller =
            row.from_user;


        const box =
            document.createElement(
                "div"
            );


        box.id =
            "fchatIncomingCall";


        box.style.position =
            "fixed";

        box.style.left =
            "50%";

        box.style.top =
            "50%";

        box.style.transform =
            "translate(-50%, -50%)";

        box.style.width =
            "300px";

        box.style.padding =
            "25px";

        box.style.background =
            "#fff";

        box.style.borderRadius =
            "20px";

        box.style.boxShadow =
            "0 10px 40px rgba(0,0,0,.35)";

        box.style.zIndex =
            "999999";

        box.style.textAlign =
            "center";


        box.innerHTML = `

            <div style="
                font-size:50px;
                margin-bottom:10px;
            ">
                📞
            </div>

            <div style="
                font-size:21px;
                font-weight:bold;
                margin-bottom:8px;
            ">
                Incoming Call
            </div>

            <div style="
                color:#666;
                margin-bottom:22px;
            ">
                ${caller} is calling...
            </div>

            <button
                id="fchatAcceptBtn"
                style="
                    border:none;
                    background:#22c55e;
                    color:white;
                    padding:12px 20px;
                    border-radius:10px;
                    font-size:16px;
                    margin-right:8px;
                "
            >
                📞 Accept
            </button>

            <button
                id="fchatRejectBtn"
                style="
                    border:none;
                    background:#ef4444;
                    color:white;
                    padding:12px 20px;
                    border-radius:10px;
                    font-size:16px;
                "
            >
                ❌ Reject
            </button>

        `;


        document.body.appendChild(
            box
        );


        document
            .getElementById(
                "fchatAcceptBtn"
            )
            .onclick =
                window.fchatAcceptIncomingCall;


        document
            .getElementById(
                "fchatRejectBtn"
            )
            .onclick =
                window.fchatRejectIncomingCall;

    }


    // ----------------------------------------------------------
    // START POLLING
    // ----------------------------------------------------------

    setInterval(
        checkCallSignals,
        700
    );


    setTimeout(
        checkCallSignals,
        1000
    );


    console.log(
        "📞 F-Chat Voice Call Part 2B loaded"
    );

})();