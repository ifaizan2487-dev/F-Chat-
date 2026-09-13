// ==========================================
// F CHAT - FEATURES 3
// VOICE CALL - WEBRTC SYSTEM
// PART 1 / 5
// ==========================================


// ==========================================
// GLOBAL VOICE CALL VARIABLES
// ==========================================

window.fchatVoiceCallActive = false;

window.fchatLocalStream = null;

window.fchatRemoteStream = null;

window.fchatVoiceCallPartner = null;

window.fchatPeerConnection = null;

window.fchatCallChannel = null;

window.fchatIncomingCall = null;

window.fchatCallStartedByMe = false;


// ==========================================
// WEBRTC CONFIG
// ==========================================

window.fchatRTCConfig = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: "stun:stun1.l.google.com:19302"
        }
    ]
};


// ==========================================
// CREATE WEBRTC PEER CONNECTION
// ==========================================

function fchatCreatePeerConnection(username) {

    console.log(
        "Creating WebRTC connection with:",
        username
    );


    // Existing connection remove karo

    if (window.fchatPeerConnection) {

        try {

            window.fchatPeerConnection.close();

        } catch (error) {

            console.warn(
                "Old peer connection close error:",
                error
            );

        }

    }


    const peerConnection =
        new RTCPeerConnection(
            window.fchatRTCConfig
        );


    window.fchatPeerConnection =
        peerConnection;


    // ======================================
    // REMOTE AUDIO STREAM
    // ======================================

    window.fchatRemoteStream =
        new MediaStream();


    const remoteAudio =
        document.getElementById(
            "fchatRemoteAudio"
        );


    if (remoteAudio) {

        remoteAudio.srcObject =
            window.fchatRemoteStream;

    }


    // ======================================
    // RECEIVE REMOTE AUDIO
    // ======================================

    peerConnection.ontrack =
        function (event) {

            console.log(
                "Remote audio received"
            );


            event.streams[0]
                .getTracks()
                .forEach(
                    function (track) {

                        window.fchatRemoteStream
                            .addTrack(track);

                    }
                );


            const audio =
                document.getElementById(
                    "fchatRemoteAudio"
                );


            if (audio) {

                audio.srcObject =
                    window.fchatRemoteStream;


                audio.play()
                    .catch(
                        function (error) {

                            console.warn(
                                "Audio autoplay blocked:",
                                error
                            );

                        }
                    );

            }


            fchatSetCallStatus(
                "Connected"
            );

        };


    // ======================================
    // ICE CANDIDATE
    // ======================================

    peerConnection.onicecandidate =
        function (event) {

            if (!event.candidate) {

                return;

            }


            console.log(
                "New ICE candidate"
            );


            fchatSendSignal(
                username,
                "ice-candidate",
                {
                    candidate:
                        event.candidate
                }
            );

        };


    // ======================================
    // CONNECTION STATE
    // ======================================

    peerConnection.onconnectionstatechange =
        function () {

            const state =
                peerConnection.connectionState;


            console.log(
                "WebRTC connection state:",
                state
            );


            if (
                state ===
                "connected"
            ) {

                fchatSetCallStatus(
                    "Connected"
                );

            }


            if (
                state ===
                "connecting"
            ) {

                fchatSetCallStatus(
                    "Connecting..."
                );

            }


            if (
                state ===
                "disconnected"
                ||
                state ===
                "failed"
            ) {

                fchatSetCallStatus(
                    "Connection lost"
                );

            }


            if (
                state ===
                "closed"
            ) {

                fchatSetCallStatus(
                    "Call ended"
                );

            }

        };


    // ======================================
    // ICE CONNECTION STATE
    // ======================================

    peerConnection.oniceconnectionstatechange =
        function () {

            console.log(
                "ICE state:",
                peerConnection
                    .iceConnectionState
            );

        };


    // ======================================
    // ADD LOCAL AUDIO TRACKS
    // ======================================

    if (
        window.fchatLocalStream
    ) {

        window.fchatLocalStream
            .getTracks()
            .forEach(
                function (track) {

                    peerConnection.addTrack(
                        track,
                        window.fchatLocalStream
                    );

                }
            );

    }


    return peerConnection;

}


// ==========================================
// SEND WEBRTC SIGNAL
// ==========================================

function fchatSendSignal(
    username,
    eventName,
    data
) {

    if (!username) {

        return;

    }


    if (
        typeof supabaseClient ===
        "undefined"
        ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client not found."
        );

        return;

    }


    const channelName =
        "fchat-calls-" +
        username;


    const channel =
        supabaseClient.channel(
            channelName
        );


    channel.subscribe(
        function (status) {

            if (
                status !==
                "SUBSCRIBED"
            ) {

                return;

            }


            channel.send({

                type: "broadcast",

                event: eventName,

                payload: {

                    from:
                        typeof currentUser !==
                        "undefined"
                            ? currentUser
                            : null,

                    to:
                        username,

                    ...data

                }

            });


            setTimeout(
                function () {

                    try {

                        supabaseClient
                            .removeChannel(
                                channel
                            );

                    } catch (error) {

                        console.warn(
                            "Signal channel cleanup error:",
                            error
                        );

                    }

                },
                1500
            );

        }
    );

}


// ==========================================
// ADD REMOTE AUDIO ELEMENT
// ==========================================

function fchatCreateRemoteAudio() {

    let audio =
        document.getElementById(
            "fchatRemoteAudio"
        );


    if (audio) {

        return audio;

    }


    audio =
        document.createElement(
            "audio"
        );


    audio.id =
        "fchatRemoteAudio";


    audio.autoplay =
        true;


    audio.controls =
        false;


    audio.style.display =
        "none";


    document.body.appendChild(
        audio
    );


    return audio;

}


// ==========================================
// INITIALIZE AUDIO
// ==========================================

function fchatInitializeVoiceAudio() {

    fchatCreateRemoteAudio();

}


// ==========================================
// INITIALIZE VOICE CALL SYSTEM
// ==========================================

setTimeout(
    function () {

        try {

            fchatInitializeVoiceAudio();

        } catch (error) {

            console.error(
                "Voice audio initialization error:",
                error
            );

        }

    },
    1000
);


// ==========================================
// PART 1 END
// ==========================================
// ==========================================
// F CHAT - FEATURES 3
// VOICE CALL - WEBRTC
// PART 2 / 5
// OFFER / ANSWER SIGNALING
// ==========================================


// ==========================================
// SETUP CALL SIGNAL CHANNEL
// ==========================================

function fchatSetupCallChannel() {

    if (
        typeof currentUser === "undefined" ||
        !currentUser
    ) {
        return;
    }


    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        console.error(
            "Supabase client not found."
        );

        return;
    }


    // Already connected

    if (window.fchatCallChannel) {
        return;
    }


    const channelName =
        "fchat-calls-" +
        currentUser;


    console.log(
        "Setting up call channel:",
        channelName
    );


    window.fchatCallChannel =
        supabaseClient
            .channel(channelName)


            // ==================================
            // INCOMING CALL
            // ==================================

            .on(
                "broadcast",
                {
                    event: "incoming-call"
                },
                function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "Incoming call from:",
                        data.from
                    );


                    fchatShowIncomingCall(
                        data.from
                    );

                }
            )


            // ==================================
            // WEBRTC OFFER
            // ==================================

            .on(
                "broadcast",
                {
                    event: "webrtc-offer"
                },
                async function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "WebRTC offer received from:",
                        data.from
                    );


                    await fchatHandleOffer(
                        data.from,
                        data.offer
                    );

                }
            )


            // ==================================
            // WEBRTC ANSWER
            // ==================================

            .on(
                "broadcast",
                {
                    event: "webrtc-answer"
                },
                async function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "WebRTC answer received from:",
                        data.from
                    );


                    await fchatHandleAnswer(
                        data.answer
                    );

                }
            )


            // ==================================
            // ICE CANDIDATE
            // ==================================

            .on(
                "broadcast",
                {
                    event: "ice-candidate"
                },
                async function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "ICE candidate received"
                    );


                    await fchatHandleIceCandidate(
                        data.candidate
                    );

                }
            )


            // ==================================
            // CALL ACCEPTED
            // ==================================

            .on(
                "broadcast",
                {
                    event: "call-accepted"
                },
                function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "Call accepted by:",
                        data.from
                    );


                    fchatSetCallStatus(
                        "Call accepted"
                    );

                }
            )


            // ==================================
            // CALL REJECTED
            // ==================================

            .on(
                "broadcast",
                {
                    event: "call-rejected"
                },
                function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "Call rejected"
                    );


                    fchatSetCallStatus(
                        "Call rejected"
                    );


                    setTimeout(
                        function () {

                            fchatEndVoiceCall();

                        },
                        700
                    );

                }
            )


            // ==================================
            // CALL ENDED
            // ==================================

            .on(
                "broadcast",
                {
                    event: "call-ended"
                },
                function (message) {

                    const data =
                        message.payload;


                    if (!data) {
                        return;
                    }


                    if (
                        data.to !==
                        currentUser
                    ) {
                        return;
                    }


                    console.log(
                        "Remote call ended"
                    );


                    fchatEndVoiceCall();

                }
            )


            // ==================================
            // SUBSCRIBE
            // ==================================

            .subscribe(
                function (status) {

                    console.log(
                        "F Chat call channel:",
                        status
                    );

                }
            );

}


// ==========================================
// CREATE OFFER
// ==========================================

async function fchatCreateOffer(
    username
) {

    try {

        console.log(
            "Creating WebRTC offer for:",
            username
        );


        if (
            !window.fchatPeerConnection
        ) {

            fchatCreatePeerConnection(
                username
            );

        }


        const peer =
            window.fchatPeerConnection;


        if (!peer) {

            throw new Error(
                "Peer connection create nahi hui."
            );

        }


        const offer =
            await peer.createOffer();


        await peer.setLocalDescription(
            offer
        );


        console.log(
            "Local offer created"
        );


        fchatSendSignal(
            username,
            "webrtc-offer",
            {
                offer: offer
            }
        );


        fchatSetCallStatus(
            "Calling..."
        );


    } catch (error) {

        console.error(
            "Offer creation error:",
            error
        );


        fchatSetCallStatus(
            "Call connection failed"
        );

    }

}


// ==========================================
// HANDLE OFFER
// ==========================================

async function fchatHandleOffer(
    username,
    offer
) {

    try {

        console.log(
            "Handling offer from:",
            username
        );


        window.fchatVoiceCallPartner =
            username;


        window.fchatVoiceCallActive =
            true;


        // Make sure microphone exists

        if (
            !window.fchatLocalStream
        ) {

            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({
                        audio: true,
                        video: false
                    });


            window.fchatLocalStream =
                stream;

        }


        // Create peer

        if (
            !window.fchatPeerConnection
        ) {

            fchatCreatePeerConnection(
                username
            );

        }


        const peer =
            window.fchatPeerConnection;


        await peer.setRemoteDescription(
            new RTCSessionDescription(
                offer
            )
        );


        const answer =
            await peer.createAnswer();


        await peer.setLocalDescription(
            answer
        );


        fchatSendSignal(
            username,
            "webrtc-answer",
            {
                answer: answer
            }
        );


        fchatSetCallStatus(
            "Connecting..."
        );


        console.log(
            "WebRTC answer sent"
        );


    } catch (error) {

        console.error(
            "Offer handling error:",
            error
        );


        fchatSetCallStatus(
            "Connection failed"
        );

    }

}


// ==========================================
// HANDLE ANSWER
// ==========================================

async function fchatHandleAnswer(
    answer
) {

    try {

        console.log(
            "Handling WebRTC answer"
        );


        const peer =
            window.fchatPeerConnection;


        if (!peer) {

            console.warn(
                "Peer connection not found."
            );

            return;

        }


        await peer.setRemoteDescription(
            new RTCSessionDescription(
                answer
            )
        );


        fchatSetCallStatus(
            "Connecting..."
        );


        console.log(
            "Remote answer applied"
        );


    } catch (error) {

        console.error(
            "Answer handling error:",
            error
        );

    }

}


// ==========================================
// HANDLE ICE CANDIDATE
// ==========================================

async function fchatHandleIceCandidate(
    candidate
) {

    try {

        const peer =
            window.fchatPeerConnection;


        if (!peer) {

            console.warn(
                "Peer connection not ready for ICE."
            );

            return;

        }


        if (!candidate) {
            return;
        }


        await peer.addIceCandidate(
            new RTCIceCandidate(
                candidate
            )
        );


        console.log(
            "ICE candidate added"
        );


    } catch (error) {

        console.error(
            "ICE candidate error:",
            error
        );

    }

}


// ==========================================
// START CALL SIGNAL CHANNEL
// ==========================================

setTimeout(
    function () {

        fchatSetupCallChannel();

    },
    1500
);


// ==========================================
// KEEP CHANNEL ALIVE
// ==========================================

setInterval(
    function () {

        if (
            !window.fchatCallChannel
        ) {

            fchatSetupCallChannel();

        }

    },
    3000
);


// ==========================================
// PART 2 END
// ==========================================
// ==========================================
// F CHAT - FEATURES 3
// VOICE CALL - WEBRTC
// PART 3 / 5
// INCOMING CALL + ACCEPT / REJECT
// ==========================================


// ==========================================
// SHOW INCOMING CALL
// ==========================================

function fchatShowIncomingCall(username) {

    if (!username) {
        return;
    }


    // Agar already call me hai
    if (window.fchatVoiceCallActive) {
        return;
    }


    window.fchatIncomingCall = {
        from: username
    };


    // Purani screen remove
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

        <h2 style="
            margin:0;
            font-family:Arial;
        ">
            ${fchatEscapeHTML(username)}
        </h2>

        <p style="
            font-family:Arial;
            opacity:.9;
            margin-top:10px;
        ">
            Incoming voice call...
        </p>

        <div style="
            display:flex;
            gap:35px;
            margin-top:35px;
        ">

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


    document.body.appendChild(screen);


    // Reject
    const rejectButton =
        document.getElementById(
            "fchatRejectCall"
        );


    if (rejectButton) {

        rejectButton.onclick =
            function () {

                fchatRejectIncomingCall();

            };

    }


    // Accept
    const acceptButton =
        document.getElementById(
            "fchatAcceptCall"
        );


    if (acceptButton) {

        acceptButton.onclick =
            function () {

                fchatAcceptIncomingCall();

            };

    }

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


    const caller =
        window.fchatIncomingCall.from;


    if (!caller) {
        return;
    }


    console.log(
        "Accepting call from:",
        caller
    );


    window.fchatVoiceCallActive =
        true;


    window.fchatCallStartedByMe =
        false;


    window.fchatVoiceCallPartner =
        caller;


    // Incoming screen ko call screen me change karo
    fchatShowVoiceCallScreen(
        caller
    );


    fchatSetCallStatus(
        "Connecting microphone..."
    );


    try {

        // Microphone
        const stream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    audio: true,
                    video: false
                });


        window.fchatLocalStream =
            stream;


        console.log(
            "Receiver microphone connected"
        );


        // Peer connection
        fchatCreatePeerConnection(
            caller
        );


        fchatSetCallStatus(
            "Connecting..."
        );


        // Caller ko batao ki call accept ho gayi
        fchatSendSignal(
            caller,
            "call-accepted",
            {}
        );


        window.fchatIncomingCall =
            null;


        // Agar caller ne already offer bhej diya hai
        // to channel handler usse process karega


    } catch (error) {

        console.error(
            "Accept call microphone error:",
            error
        );


        alert(
            "Microphone permission allow karo."
        );


        fchatSendSignal(
            caller,
            "call-rejected",
            {}
        );


        fchatEndVoiceCall();

    }

}


// ==========================================
// REJECT INCOMING CALL
// ==========================================

function fchatRejectIncomingCall() {

    if (
        !window.fchatIncomingCall
    ) {
        return;
    }


    const caller =
        window.fchatIncomingCall.from;


    console.log(
        "Rejecting call from:",
        caller
    );


    // Caller ko rejection bhejo
    if (caller) {

        fchatSendSignal(
            caller,
            "call-rejected",
            {}
        );

    }


    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (screen) {
        screen.remove();
    }


    window.fchatIncomingCall =
        null;


    window.fchatVoiceCallActive =
        false;


    window.fchatVoiceCallPartner =
        null;

}


// ==========================================
// CALL SCREEN
// ==========================================

function fchatShowVoiceCallScreen(
    username
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

        <h2 style="
            margin:0;
            font-family:Arial;
        ">
            ${fchatEscapeHTML(username)}
        </h2>

        <p
            id="fchatCallStatus"
            style="
                font-family:Arial;
                font-size:16px;
                opacity:.9;
            "
        >
            Connecting...
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
// CALL STATUS
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
// SEND CALL ACCEPTED
// ==========================================

function fchatSendCallAccepted(
    username
) {

    if (!username) {
        return;
    }


    fchatSendSignal(
        username,
        "call-accepted",
        {}
    );

}


// ==========================================
// PART 3 END
// ==========================================
/* =========================================================
   F-CHAT VOICE CALL — PART 4/5
   CALL START + WEBRTC OFFER FLOW
   ========================================================= */

// ---------------------------------------------------------
// START OUTGOING CALL
// ---------------------------------------------------------

async function fchatStartVoiceCall(username) {
    if (!username) return;

    if (window.fchatVoiceCallActive) {
        console.log("Call already active");
        return;
    }

    console.log("Starting voice call with:", username);

    window.fchatVoiceCallActive = true;
    window.fchatVoiceCallPartner = username;
    window.fchatCallStartedByMe = true;

    try {
        // Microphone permission
        window.fchatLocalStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

        console.log("Microphone ready");

        // Show calling screen
        fchatShowVoiceCallScreen(username);
        fchatSetCallStatus("Calling...");

        // Make sure remote audio element exists
        fchatCreateRemoteAudio();

        // Create WebRTC connection
        await fchatCreatePeerConnection(username);

        // Send incoming call notification
        await fchatSendCallRequest(username);

        console.log("Call request sent");

    } catch (error) {
        console.error("Voice call start error:", error);

        alert(
            "Microphone access nahi mila.\n\n" +
            "Browser microphone permission allow karo."
        );

        fchatEndVoiceCall(false);
    }
}


// ---------------------------------------------------------
// SEND CALL REQUEST
// ---------------------------------------------------------

async function fchatSendCallRequest(username) {
    if (!username) return;

    try {
        const channelName = "fchat-calls-" + username;

        const channel = supabaseClient.channel(channelName);

        await channel.subscribe((status) => {
            console.log(
                "Call request channel status:",
                status
            );
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        await channel.send({
            type: "broadcast",
            event: "incoming-call",
            payload: {
                from: currentUser,
                to: username
            }
        });

        console.log(
            "Incoming call request sent to:",
            username
        );

        setTimeout(() => {
            try {
                supabaseClient.removeChannel(channel);
            } catch (e) {
                console.log(e);
            }
        }, 1500);

    } catch (error) {
        console.error(
            "Failed to send call request:",
            error
        );
    }
}


// ---------------------------------------------------------
// CALL ACCEPTED
// CALLER CREATES OFFER
// ---------------------------------------------------------

async function fchatHandleCallAccepted(data) {

    if (!data) return;

    const fromUser = data.from;

    if (!fromUser) return;

    console.log(
        "Call accepted by:",
        fromUser
    );

    // Only caller creates the offer
    if (!window.fchatCallStartedByMe) {
        return;
    }

    if (
        window.fchatVoiceCallPartner &&
        window.fchatVoiceCallPartner !== fromUser
    ) {
        return;
    }

    window.fchatVoiceCallPartner = fromUser;

    try {

        if (!window.fchatLocalStream) {
            window.fchatLocalStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
        }

        if (!window.fchatPeerConnection) {
            await fchatCreatePeerConnection(fromUser);
        }

        fchatSetCallStatus("Connecting...");

        await fchatCreateOffer(fromUser);

    } catch (error) {

        console.error(
            "Offer creation error:",
            error
        );

        fchatSetCallStatus(
            "Connection failed"
        );
    }
}


// ---------------------------------------------------------
// CREATE OFFER
// ---------------------------------------------------------

async function fchatCreateOffer(username) {

    if (!window.fchatPeerConnection) {
        console.error(
            "Peer connection not available"
        );
        return;
    }

    try {

        const offer =
            await window.fchatPeerConnection.createOffer({
                offerToReceiveAudio: true
            });

        await window.fchatPeerConnection.setLocalDescription(
            offer
        );

        console.log(
            "WebRTC offer created"
        );

        await fchatSendSignal(
            username,
            "webrtc-offer",
            {
                from: currentUser,
                to: username,
                offer: offer
            }
        );

        fchatSetCallStatus(
            "Connecting..."
        );

    } catch (error) {

        console.error(
            "Create offer error:",
            error
        );
    }
}


// ---------------------------------------------------------
// HANDLE OFFER
// RECEIVER ACCEPT KE BAAD YE CHALEGA
// ---------------------------------------------------------

async function fchatHandleOffer(username, offer) {

    if (!username || !offer) return;

    console.log(
        "WebRTC offer received from:",
        username
    );

    try {

        window.fchatVoiceCallPartner =
            username;

        window.fchatVoiceCallActive =
            true;

        window.fchatCallStartedByMe =
            false;

        if (!window.fchatLocalStream) {

            window.fchatLocalStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
        }

        fchatCreateRemoteAudio();

        if (!window.fchatPeerConnection) {

            await fchatCreatePeerConnection(
                username
            );
        }

        await window.fchatPeerConnection
            .setRemoteDescription(
                new RTCSessionDescription(offer)
            );

        const answer =
            await window.fchatPeerConnection
                .createAnswer();

        await window.fchatPeerConnection
            .setLocalDescription(answer);

        console.log(
            "WebRTC answer created"
        );

        await fchatSendSignal(
            username,
            "webrtc-answer",
            {
                from: currentUser,
                to: username,
                answer: answer
            }
        );

        fchatShowVoiceCallScreen(
            username
        );

        fchatSetCallStatus(
            "Connecting..."
        );

    } catch (error) {

        console.error(
            "Handle offer error:",
            error
        );

        fchatSetCallStatus(
            "Connection failed"
        );
    }
}


// ---------------------------------------------------------
// HANDLE ANSWER
// ---------------------------------------------------------

async function fchatHandleAnswer(answer) {

    if (!answer) return;

    if (!window.fchatPeerConnection) {
        console.log(
            "Peer connection not ready for answer"
        );
        return;
    }

    try {

        await window.fchatPeerConnection
            .setRemoteDescription(
                new RTCSessionDescription(answer)
            );

        console.log(
            "Remote answer applied"
        );

        fchatSetCallStatus(
            "Connected"
        );

    } catch (error) {

        console.error(
            "Handle answer error:",
            error
        );
    }
}


// ---------------------------------------------------------
// HANDLE ICE CANDIDATE
// ---------------------------------------------------------

async function fchatHandleIceCandidate(candidate) {

    if (!candidate) return;

    if (!window.fchatPeerConnection) {
        console.log(
            "Peer connection not ready for ICE"
        );
        return;
    }

    try {

        await window.fchatPeerConnection
            .addIceCandidate(
                new RTCIceCandidate(candidate)
            );

        console.log(
            "ICE candidate added"
        );

    } catch (error) {

        console.error(
            "ICE candidate error:",
            error
        );
    }
}


// ---------------------------------------------------------
// CALL CONNECTION STATUS
// ---------------------------------------------------------

function fchatHandleConnectionState() {

    if (!window.fchatPeerConnection) {
        return;
    }

    const state =
        window.fchatPeerConnection.connectionState;

    console.log(
        "WebRTC connection state:",
        state
    );

    if (state === "connected") {

        fchatSetCallStatus(
            "Connected"
        );

    } else if (state === "connecting") {

        fchatSetCallStatus(
            "Connecting..."
        );

    } else if (
        state === "disconnected"
    ) {

        fchatSetCallStatus(
            "Disconnected"
        );

    } else if (
        state === "failed"
    ) {

        fchatSetCallStatus(
            "Connection failed"
        );

    } else if (
        state === "closed"
    ) {

        fchatSetCallStatus(
            "Call ended"
        );
    }
}


// ---------------------------------------------------------
// OVERRIDE PEER CONNECTION STATUS HANDLER
// ---------------------------------------------------------

if (window.fchatPeerConnectionStatePatched !== true) {

    window.fchatPeerConnectionStatePatched =
        true;

    console.log(
        "Voice WebRTC Part 4 loaded"
    );
}
/* =========================================================
   F-CHAT VOICE CALL — PART 5/5
   END CALL + CLEANUP + FINAL CONNECTION HANDLING
   ========================================================= */


// ---------------------------------------------------------
// SEND CALL ENDED SIGNAL
// ---------------------------------------------------------

async function fchatSendCallEnded(username) {

    if (!username) return;

    try {

        await fchatSendSignal(
            username,
            "call-ended",
            {
                from: currentUser,
                to: username
            }
        );

        console.log(
            "Call ended signal sent to:",
            username
        );

    } catch (error) {

        console.error(
            "Call ended signal error:",
            error
        );
    }
}


// ---------------------------------------------------------
// SEND CALL REJECTED SIGNAL
// ---------------------------------------------------------

async function fchatSendCallRejected(username) {

    if (!username) return;

    try {

        await fchatSendSignal(
            username,
            "call-rejected",
            {
                from: currentUser,
                to: username
            }
        );

    } catch (error) {

        console.error(
            "Call rejected signal error:",
            error
        );
    }
}


// ---------------------------------------------------------
// REMOTE AUDIO CLEANUP
// ---------------------------------------------------------

function fchatRemoveRemoteAudio() {

    const audio =
        document.getElementById(
            "fchatRemoteAudio"
        );

    if (audio) {

        try {
            audio.pause();
        } catch (e) {}

        audio.srcObject = null;

        audio.remove();
    }

    window.fchatRemoteStream = null;
}


// ---------------------------------------------------------
// PEER CONNECTION CLEANUP
// ---------------------------------------------------------

function fchatClosePeerConnection() {

    if (window.fchatPeerConnection) {

        try {

            window.fchatPeerConnection
                .ontrack = null;

            window.fchatPeerConnection
                .onicecandidate = null;

            window.fchatPeerConnection
                .onconnectionstatechange = null;

            window.fchatPeerConnection
                .oniceconnectionstatechange = null;

            window.fchatPeerConnection
                .close();

        } catch (error) {

            console.log(
                "Peer close error:",
                error
            );
        }
    }

    window.fchatPeerConnection =
        null;
}


// ---------------------------------------------------------
// LOCAL MICROPHONE CLEANUP
// ---------------------------------------------------------

function fchatStopLocalStream() {

    if (window.fchatLocalStream) {

        try {

            window.fchatLocalStream
                .getTracks()
                .forEach(track => {

                    try {
                        track.stop();
                    } catch (e) {}

                });

        } catch (error) {

            console.log(
                "Local stream cleanup error:",
                error
            );
        }
    }

    window.fchatLocalStream =
        null;
}


// ---------------------------------------------------------
// REMOVE CALL SCREEN
// ---------------------------------------------------------

function fchatRemoveCallScreen() {

    const callScreen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );

    if (callScreen) {
        callScreen.remove();
    }

    // Some older versions may use another ID
    const oldScreen =
        document.getElementById(
            "fchatCallScreen"
        );

    if (oldScreen) {
        oldScreen.remove();
    }
}


// ---------------------------------------------------------
// FINAL END CALL FUNCTION
// ---------------------------------------------------------

async function fchatEndVoiceCall(sendSignal = true) {

    const partner =
        window.fchatVoiceCallPartner;

    console.log(
        "Ending voice call:",
        partner
    );

    // Tell other user first
    if (
        sendSignal &&
        partner
    ) {

        await fchatSendCallEnded(
            partner
        );
    }


    // Stop microphone
    fchatStopLocalStream();


    // Stop remote audio
    fchatRemoveRemoteAudio();


    // Close WebRTC
    fchatClosePeerConnection();


    // Remove UI
    fchatRemoveCallScreen();


    // Reset all call variables
    window.fchatVoiceCallActive =
        false;

    window.fchatVoiceCallPartner =
        null;

    window.fchatCallStartedByMe =
        false;

    window.fchatIncomingCall =
        null;


    console.log(
        "Voice call completely ended"
    );


    // Keep call button working
    setTimeout(() => {

        try {
            fchatAddVoiceCallButton();
            fchatUpdateVoiceCallButton();
        } catch (e) {
            console.log(e);
        }

    }, 100);
}


// ---------------------------------------------------------
// HANDLE REMOTE CALL ENDED
// ---------------------------------------------------------

function fchatHandleRemoteCallEnded(data) {

    console.log(
        "Remote user ended the call:",
        data
    );

    fchatSetCallStatus(
        "Call ended"
    );

    setTimeout(() => {

        fchatEndVoiceCall(false);

    }, 500);
}


// ---------------------------------------------------------
// HANDLE REMOTE CALL REJECTED
// ---------------------------------------------------------

function fchatHandleRemoteCallRejected(data) {

    console.log(
        "Call rejected by:",
        data?.from
    );

    fchatSetCallStatus(
        "Call rejected"
    );

    setTimeout(() => {

        fchatEndVoiceCall(false);

    }, 800);
}


// ---------------------------------------------------------
// HANDLE REMOTE CONNECTION FAILURE
// ---------------------------------------------------------

function fchatHandleRemoteConnectionFailure() {

    console.log(
        "Remote connection failed"
    );

    fchatSetCallStatus(
        "Connection failed"
    );

    setTimeout(() => {

        if (window.fchatVoiceCallActive) {
            fchatEndVoiceCall(false);
        }

    }, 1500);
}


// ---------------------------------------------------------
// PATCH PEER CONNECTION EVENTS
// ---------------------------------------------------------

function fchatPatchPeerConnectionEvents() {

    const pc =
        window.fchatPeerConnection;

    if (!pc) return;


    pc.onconnectionstatechange =
        function () {

            const state =
                pc.connectionState;

            console.log(
                "Connection state:",
                state
            );

            if (
                state === "connected"
            ) {

                fchatSetCallStatus(
                    "Connected"
                );

            } else if (
                state === "connecting"
            ) {

                fchatSetCallStatus(
                    "Connecting..."
                );

            } else if (
                state === "disconnected"
            ) {

                fchatSetCallStatus(
                    "Disconnected"
                );

            } else if (
                state === "failed"
            ) {

                fchatHandleRemoteConnectionFailure();

            } else if (
                state === "closed"
            ) {

                fchatSetCallStatus(
                    "Call ended"
                );
            }
        };


    pc.oniceconnectionstatechange =
        function () {

            const state =
                pc.iceConnectionState;

            console.log(
                "ICE state:",
                state
            );

            if (
                state === "connected" ||
                state === "completed"
            ) {

                fchatSetCallStatus(
                    "Connected"
                );

            } else if (
                state === "checking"
            ) {

                fchatSetCallStatus(
                    "Connecting..."
                );
            }
        };
}


// ---------------------------------------------------------
// RE-CREATE PEER CONNECTION WITH EVENTS
// ---------------------------------------------------------

const fchatOriginalCreatePeerConnection =
    window.fchatCreatePeerConnection;


window.fchatCreatePeerConnection =
    async function (username) {

        await fchatOriginalCreatePeerConnection(
            username
        );

        fchatPatchPeerConnectionEvents();

        return window.fchatPeerConnection;
    };


// ---------------------------------------------------------
// FINAL END CALL BUTTON HANDLER
// ---------------------------------------------------------

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#fchatEndCallButton"
            );

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "End call button clicked"
        );

        fchatEndVoiceCall(true);

    },
    true
);


// ---------------------------------------------------------
// REJECT BUTTON HANDLER
// ---------------------------------------------------------

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#fchatRejectCall"
            );

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "Reject call button clicked"
        );

        fchatRejectIncomingCall();

    },
    true
);


// ---------------------------------------------------------
// ACCEPT BUTTON HANDLER
// ---------------------------------------------------------

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#fchatAcceptCall"
            );

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "Accept call button clicked"
        );

        fchatAcceptIncomingCall();

    },
    true
);


// ---------------------------------------------------------
// MAKE SURE CALL BUTTON STAYS AVAILABLE
// ---------------------------------------------------------

setInterval(() => {

    try {

        if (
            typeof fchatAddVoiceCallButton ===
            "function"
        ) {
            fchatAddVoiceCallButton();
        }

        if (
            typeof fchatUpdateVoiceCallButton ===
            "function"
        ) {
            fchatUpdateVoiceCallButton();
        }

    } catch (error) {

        console.log(
            "Call button refresh error:",
            error
        );
    }

}, 1000);


// ---------------------------------------------------------
// FINAL INITIALIZATION
// ---------------------------------------------------------

setTimeout(() => {

    try {

        fchatCreateRemoteAudio();

        fchatAddVoiceCallButton();

        fchatUpdateVoiceCallButton();

        console.log(
            "================================="
        );

        console.log(
            "F-CHAT VOICE CALL SYSTEM READY"
        );

        console.log(
            "Realtime audio + WebRTC enabled"
        );

        console.log(
            "================================="
        );

    } catch (error) {

        console.error(
            "Voice call initialization error:",
            error
        );
    }

}, 1500);
/* =========================================================
   VOICE CALL BUTTON FIX
   ========================================================= */

(function () {

    function forceVoiceCallButton() {

        // Agar button already hai to kuch mat karo
        let btn = document.getElementById(
            "fchatVoiceCallButton"
        );

        if (!btn) {

            btn = document.createElement("button");

            btn.id = "fchatVoiceCallButton";

            btn.innerHTML = "📞";

            btn.title = "Voice Call";

            btn.style.position = "fixed";
            btn.style.right = "20px";
            btn.style.bottom = "80px";

            btn.style.width = "55px";
            btn.style.height = "55px";

            btn.style.borderRadius = "50%";
            btn.style.border = "none";

            btn.style.background = "#25D366";
            btn.style.color = "white";

            btn.style.fontSize = "25px";

            btn.style.zIndex = "999999";

            btn.style.display = "none";

            document.body.appendChild(btn);
        }

        // Current chat check
        let chatUser =
            window.currentChat ||
            window.fchatCurrentChat ||
            currentChat;

        if (chatUser) {

            btn.style.display = "flex";

            btn.style.alignItems = "center";
            btn.style.justifyContent = "center";

            btn.onclick = function (e) {

                e.preventDefault();
                e.stopPropagation();

                console.log(
                    "Voice call button clicked:",
                    chatUser
                );

                fchatStartVoiceCall(
                    chatUser
                );
            };

        } else {

            btn.style.display = "none";
        }
    }

    // Har 500ms check
    setInterval(
        forceVoiceCallButton,
        500
    );

    // Initial check
    setTimeout(
        forceVoiceCallButton,
        1000
    );

})();