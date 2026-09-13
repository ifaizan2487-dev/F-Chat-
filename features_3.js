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