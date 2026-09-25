// ==========================================
// F-CHAT FEATURES 3
// VOICE CALL - PART 1/5
// CORRECTED VERSION
// ==========================================

(function () {

"use strict";

// ---------- GLOBALS ----------

window.fchatVoiceCallActive = false;
window.fchatVoiceCallPartner = null;
window.fchatLocalStream = null;
window.fchatRemoteStream = null;
window.fchatPeerConnection = null;
window.fchatIncomingCall = null;
window.fchatCurrentCallId = null;
window.fchatMicRequest = null;

window.fchatProcessedSignals =
    window.fchatProcessedSignals || new Set();

window.fchatPendingIceCandidates =
    window.fchatPendingIceCandidates || [];

window.fchatRemoteDescriptionSet = false;


// ---------- RTC CONFIG ----------

const RTC_CONFIG = {

    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: "stun:stun1.l.google.com:19302"
        }
    ]

};


// ---------- HELPERS ----------

function getUser() {

    return window.currentUser ||
        (
            typeof currentUser !== "undefined"
                ? currentUser
                : null
        );

}


function getDB() {

    return window.supabaseClient ||
        (
            typeof supabaseClient !== "undefined"
                ? supabaseClient
                : null
        );

}


// ---------- MICROPHONE ----------

async function fchatGetMicrophone() {

    if (
        window.fchatLocalStream &&
        window.fchatLocalStream.active
    ) {

        return window.fchatLocalStream;

    }


    if (window.fchatMicRequest) {

        return await window.fchatMicRequest;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        throw new Error(
            "Microphone API supported nahi hai."
        );

    }


    window.fchatMicRequest =
        navigator.mediaDevices.getUserMedia({

            audio: true,
            video: false

        });


    try {

        window.fchatLocalStream =
            await window.fchatMicRequest;

        return window.fchatLocalStream;

    }

    finally {

        window.fchatMicRequest = null;

    }

}


// ---------- REMOTE AUDIO ----------

function fchatCreateRemoteAudio() {

    let audio =
        document.getElementById(
            "fchatRemoteAudio"
        );


    if (!audio) {

        audio =
            document.createElement("audio");

        audio.id =
            "fchatRemoteAudio";

        audio.autoplay = true;
        audio.playsInline = true;

        audio.setAttribute(
            "playsinline",
            ""
        );

        audio.style.display =
            "none";

        document.body.appendChild(
            audio
        );

    }


    return audio;

}


// ---------- CALL STATUS ----------

function fchatSetCallStatus(text) {

    const el =
        document.getElementById(
            "fchatCallStatus"
        );


    if (el) {

        el.textContent =
            text;

    }

}


// ---------- CALL SCREEN ----------

function fchatShowVoiceCallScreen(
    username,
    status = "Calling..."
) {

    const old =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (old) {

        old.remove();

    }


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "fchatVoiceCallScreen";


    screen.style.cssText = `
        position:fixed;
        inset:0;
        z-index:9999999;
        background:#075E54;
        color:white;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        font-family:Arial,sans-serif;
    `;


    screen.innerHTML = `

        <div style="
            font-size:60px;
            margin-bottom:15px;
        ">
            👤
        </div>

        <h2 style="
            margin:8px 0;
        ">
            ${username}
        </h2>

        <p id="fchatCallStatus">
            ${status}
        </p>

        <button
            id="fchatEndCallButton"
            style="
                position:absolute;
                bottom:60px;
                width:70px;
                height:70px;
                border:0;
                border-radius:50%;
                background:#e53935;
                color:white;
                font-size:28px;
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
            () => {

                if (
                    window.fchatEndVoiceCall
                ) {

                    window.fchatEndVoiceCall(
                        true
                    );

                }

            };

    }

}


// ---------- PEER CONNECTION ----------

async function fchatCreatePeerConnection(
    username,
    callId
) {

    if (
        window.fchatPeerConnection
    ) {

        try {

            window.fchatPeerConnection.close();

        }

        catch (e) {}

    }


    const pc =
        new RTCPeerConnection(
            RTC_CONFIG
        );


    window.fchatPeerConnection =
        pc;


    // ---------- LOCAL AUDIO ----------

    if (
        window.fchatLocalStream
    ) {

        window.fchatLocalStream
            .getTracks()
            .forEach(
                track => {

                    pc.addTrack(
                        track,
                        window.fchatLocalStream
                    );

                }
            );

    }


    // ---------- REMOTE AUDIO ----------

    pc.ontrack =
        event => {

            try {

                const stream =
                    event.streams &&
                    event.streams[0];

                if (!stream) return;


                window.fchatRemoteStream =
                    stream;


                const audio =
                    fchatCreateRemoteAudio();


                audio.srcObject =
                    stream;


                const playPromise =
                    audio.play();


                if (
                    playPromise &&
                    typeof playPromise.catch ===
                    "function"
                ) {

                    playPromise.catch(
                        error => {

                            console.log(
                                "Remote audio autoplay blocked:",
                                error
                            );

                        }
                    );

                }


                fchatSetCallStatus(
                    "Connected 🔊"
                );

            }

            catch (error) {

                console.error(
                    "Remote audio error:",
                    error
                );

            }

        };


    // ---------- ICE ----------

    pc.onicecandidate =
        event => {

            if (
                !event.candidate
            ) {

                return;

            }


            const candidate =
                event.candidate.toJSON
                    ? event.candidate.toJSON()
                    : event.candidate;


            fchatSendSignal(
                username,
                callId,
                "ice",
                {
                    candidate:
                        candidate
                }
            );

        };


    // ---------- CONNECTION STATE ----------

    pc.onconnectionstatechange =
        () => {

            const state =
                pc.connectionState;


            console.log(
                "📡 Voice connection:",
                state
            );


            if (
                state === "connected"
            ) {

                fchatSetCallStatus(
                    "Connected 🔊"
                );

            }

            else if (
                state === "connecting"
            ) {

                fchatSetCallStatus(
                    "Connecting..."
                );

            }

            else if (
                state === "disconnected"
            ) {

                fchatSetCallStatus(
                    "Connection lost..."
                );

            }

            else if (
                state === "failed"
            ) {

                fchatSetCallStatus(
                    "Connection failed"
                );

            }

        };


    return pc;

}


// ---------- SEND SIGNAL ----------

async function fchatSendSignal(
    toUser,
    callId,
    signalType,
    data
) {

    const db =
        getDB();

    const me =
        getUser();


    if (
        !db ||
        !me ||
        !toUser ||
        !callId
    ) {

        console.error(
            "Supabase/current user/call ID missing"
        );

        return false;

    }


    try {

        const {
            error
        } =
            await db
                .from("call_signals")
                .insert({

                    from_user:
                        me,

                    to_user:
                        toUser,

                    signal_type:
                        signalType,

                    signal: {

                        callId:
                            callId,

                        from:
                            me,

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

            return false;

        }


        return true;

    }

    catch (error) {

        console.error(
            "Signal exception:",
            error
        );

        return false;

    }

}


// ---------- START CALL ----------

async function fchatStartVoiceCall(
    username
) {

    if (
        !username ||
        window.fchatVoiceCallActive ||
        window.fchatIncomingCall
    ) {

        return;

    }


    const me =
        getUser();


    if (!me) {

        alert(
            "Current user nahi mila."
        );

        return;

    }


    window.fchatVoiceCallActive =
        true;

    window.fchatVoiceCallPartner =
        username;


    const callId =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9);


    window.fchatCurrentCallId =
        callId;


    window.fchatPendingIceCandidates =
        [];

    window.fchatRemoteDescriptionSet =
        false;


    fchatShowVoiceCallScreen(
        username,
        "Microphone permission..."
    );


    try {

        await fchatGetMicrophone();


        const pc =
            await fchatCreatePeerConnection(
                username,
                callId
            );


        const offer =
            await pc.createOffer({

                offerToReceiveAudio:
                    true

            });


        await pc.setLocalDescription(
            offer
        );


        const sent =
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


        if (!sent) {

            throw new Error(
                "Call signal send nahi hua."
            );

        }


        fchatSetCallStatus(
            "Ringing..."
        );


        console.log(
            "📞 Call started:",
            callId
        );

    }

    catch (error) {

        console.error(
            "Start call error:",
            error
        );


        alert(
            "Call start error: " +
            error.message
        );


        if (
            window.fchatEndVoiceCall
        ) {

            window.fchatEndVoiceCall(
                false
            );

        }

    }

}


// ---------- CALL BUTTON ----------

function fchatAddVoiceCallButton() {

    let btn =
        document.getElementById(
            "fchatVoiceCallButton"
        );


    if (btn) {

        return btn;

    }


    btn =
        document.createElement(
            "button"
        );


    btn.id =
        "fchatVoiceCallButton";


    btn.innerHTML =
        "📞";


    btn.style.cssText = `
        position:fixed;
        right:20px;
        bottom:80px;
        width:58px;
        height:58px;
        border:0;
        border-radius:50%;
        background:#25D366;
        color:white;
        font-size:25px;
        z-index:999999;
        display:none;
        align-items:center;
        justify-content:center;
        box-shadow:0 4px 12px rgba(0,0,0,.25);
    `;


    btn.onclick =
        () => {

            const chat =
                window.currentChat ||
                (
                    typeof currentChat !==
                    "undefined"
                        ? currentChat
                        : null
                );


            if (!chat) {

                alert(
                    "Pehle chat open karo."
                );

                return;

            }


            fchatStartVoiceCall(
                chat
            );

        };


    document.body.appendChild(
        btn
    );


    return btn;

}


// ---------- UPDATE BUTTON ----------

function fchatUpdateVoiceCallButton() {

    const btn =
        document.getElementById(
            "fchatVoiceCallButton"
        );


    if (!btn) return;


    const chat =
        window.currentChat ||
        (
            typeof currentChat !==
            "undefined"
                ? currentChat
                : null
        );


    btn.style.display =
        chat &&
        !window.fchatVoiceCallActive &&
        !window.fchatIncomingCall
            ? "flex"
            : "none";

}


// ---------- EXPORT ----------

window.fchatGetMicrophone =
    fchatGetMicrophone;

window.fchatCreatePeerConnection =
    fchatCreatePeerConnection;

window.fchatSendSignal =
    fchatSendSignal;

window.fchatStartVoiceCall =
    fchatStartVoiceCall;

window.fchatShowVoiceCallScreen =
    fchatShowVoiceCallScreen;

window.fchatSetCallStatus =
    fchatSetCallStatus;

window.fchatAddVoiceCallButton =
    fchatAddVoiceCallButton;

window.fchatUpdateVoiceCallButton =
    fchatUpdateVoiceCallButton;


// ---------- INIT ----------

fchatCreateRemoteAudio();

fchatAddVoiceCallButton();


setInterval(
    () => {

        fchatAddVoiceCallButton();
        fchatUpdateVoiceCallButton();

    },
    700
);


console.log(
    "📞 F-Chat Voice Call Part 1 loaded"
);

})();
// ==========================================
// F-CHAT VOICE CALL - PART 2/5
// INCOMING CALL + ACCEPT / REJECT
// CORRECTED VERSION
// ==========================================

(function () {

"use strict";


// ---------- SHOW INCOMING CALL ----------

function showIncomingCall(row) {

    if (!row) return;


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


    box.style.cssText = `
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        width:300px;
        max-width:85vw;
        padding:25px;
        background:white;
        color:#222;
        border-radius:20px;
        box-shadow:0 10px 40px rgba(0,0,0,.35);
        z-index:99999999;
        text-align:center;
        font-family:Arial,sans-serif;
    `;


    box.innerHTML = `

        <div style="
            font-size:50px;
            margin-bottom:10px;
        ">
            📞
        </div>

        <h2>
            Incoming Call
        </h2>

        <p>
            ${caller} is calling...
        </p>

        <div style="
            display:flex;
            justify-content:center;
            gap:8px;
            margin-top:20px;
        ">

            <button
                id="fchatAcceptBtn"
                style="
                    border:0;
                    background:#22c55e;
                    color:white;
                    padding:12px 18px;
                    border-radius:10px;
                    font-size:16px;
                "
            >
                📞 Accept
            </button>

            <button
                id="fchatRejectBtn"
                style="
                    border:0;
                    background:#ef4444;
                    color:white;
                    padding:12px 18px;
                    border-radius:10px;
                    font-size:16px;
                "
            >
                ❌ Reject
            </button>

        </div>
    `;


    document.body.appendChild(
        box
    );


    const acceptBtn =
        document.getElementById(
            "fchatAcceptBtn"
        );


    const rejectBtn =
        document.getElementById(
            "fchatRejectBtn"
        );


    if (acceptBtn) {

        acceptBtn.onclick =
            () => {

                acceptIncomingCall(
                    row
                );

            };

    }


    if (rejectBtn) {

        rejectBtn.onclick =
            () => {

                rejectIncomingCall(
                    row
                );

            };

    }

}


// ---------- ACCEPT ----------

async function acceptIncomingCall(row) {

    if (
        !row ||
        window.fchatVoiceCallActive
    ) {

        return;

    }


    const caller =
        row.from_user;


    const signal =
        row.signal || {};


    const callId =
        signal.callId;


    if (
        !caller ||
        !callId
    ) {

        console.error(
            "Invalid incoming call"
        );

        return;

    }


    window.fchatIncomingCall =
        null;

    window.fchatVoiceCallActive =
        true;

    window.fchatVoiceCallPartner =
        caller;

    window.fchatCurrentCallId =
        callId;

    window.fchatRemoteDescriptionSet =
        false;


    // Stop ringtone immediately
    if (
        typeof window.fchatStopIncomingRingtone ===
        "function"
    ) {

        window.fchatStopIncomingRingtone();

    }


    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );


    if (popup) {

        popup.remove();

    }


    fchatShowVoiceCallScreen(
        caller,
        "Connecting microphone..."
    );


    try {

        await fchatGetMicrophone();


        const pc =
            await fchatCreatePeerConnection(
                caller,
                callId
            );


        const offer =
            signal.data;


        if (
            !offer ||
            !offer.sdp
        ) {

            throw new Error(
                "Offer data missing"
            );

        }


        await pc.setRemoteDescription(
            new RTCSessionDescription(
                offer
            )
        );


        window.fchatRemoteDescriptionSet =
            true;


        // ---------- QUEUED ICE ----------

        const queued =
            Array.isArray(
                window.fchatPendingIceCandidates
            )
                ? [
                    ...window.fchatPendingIceCandidates
                ]
                : [];


        window.fchatPendingIceCandidates =
            [];


        for (
            const candidate
            of queued
        ) {

            try {

                await pc.addIceCandidate(
                    new RTCIceCandidate(
                        candidate
                    )
                );

            }

            catch (error) {

                console.log(
                    "Queued ICE error:",
                    error
                );

            }

        }


        // ---------- CREATE ANSWER ----------

        const answer =
            await pc.createAnswer();


        await pc.setLocalDescription(
            answer
        );


        const sent =
            await fchatSendSignal(

                caller,

                callId,

                "answer",

                {

                    type:
                        answer.type,

                    sdp:
                        answer.sdp

                }

            );


        if (!sent) {

            throw new Error(
                "Answer send nahi hua."
            );

        }


        fchatSetCallStatus(
            "Connecting..."
        );


        console.log(
            "✅ Answer sent:",
            callId
        );

    }

    catch (error) {

        console.error(
            "Accept call error:",
            error
        );


        alert(
            "Call accept error:\n" +
            error.message
        );


        if (
            window.fchatEndVoiceCall
        ) {

            window.fchatEndVoiceCall(
                false
            );

        }

    }

}


// ---------- REJECT ----------

async function rejectIncomingCall(row) {

    if (!row) return;


    const caller =
        row.from_user;


    const signal =
        row.signal || {};


    const callId =
        signal.callId;


    if (
        typeof window.fchatStopIncomingRingtone ===
        "function"
    ) {

        window.fchatStopIncomingRingtone();

    }


    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );


    if (popup) {

        popup.remove();

    }


    window.fchatIncomingCall =
        null;


    if (
        caller &&
        callId
    ) {

        await fchatSendSignal(
            caller,
            callId,
            "reject",
            {}
        );

    }


    fchatUpdateVoiceCallButton();


    console.log(
        "❌ Call rejected"
    );

}


// ---------- PROCESS OFFER ----------

async function processIncomingOffer(row) {

    if (!row) return;


    if (
        window.fchatVoiceCallActive ||
        window.fchatIncomingCall
    ) {

        return;

    }


    const callId =
        row.signal &&
        row.signal.callId;


    if (!callId) {

        return;

    }


    window.fchatIncomingCall =
        row;


    // Start ringtone
    if (
        typeof window.fchatStartIncomingRingtone ===
        "function"
    ) {

        window.fchatStartIncomingRingtone();

    }


    // Show popup
    showIncomingCall(
        row
    );

}


// ---------- PROCESS ANSWER ----------

async function processAnswer(row) {

    if (!row) return;


    const signal =
        row.signal || {};


    if (
        signal.callId !==
        window.fchatCurrentCallId
    ) {

        return;

    }


    const data =
        signal.data;


    const pc =
        window.fchatPeerConnection;


    if (
        !data ||
        !pc
    ) {

        return;

    }


    try {

        await pc.setRemoteDescription(
            new RTCSessionDescription(
                data
            )
        );


        window.fchatRemoteDescriptionSet =
            true;


        const queued =
            Array.isArray(
                window.fchatPendingIceCandidates
            )
                ? [
                    ...window.fchatPendingIceCandidates
                ]
                : [];


        window.fchatPendingIceCandidates =
            [];


        for (
            const candidate
            of queued
        ) {

            try {

                await pc.addIceCandidate(
                    new RTCIceCandidate(
                        candidate
                    )
                );

            }

            catch (error) {

                console.log(
                    "Queued answer ICE error:",
                    error
                );

            }

        }


        fchatSetCallStatus(
            "Connecting..."
        );


        console.log(
            "✅ Answer received"
        );

    }

    catch (error) {

        console.error(
            "Answer error:",
            error
        );

        fchatSetCallStatus(
            "Connection failed"
        );

    }

}


// ---------- PROCESS ICE ----------

async function processICE(row) {

    if (!row) return;


    const signal =
        row.signal || {};


    const callId =
        signal.callId;


    const candidate =
        signal.data &&
        signal.data.candidate;


    if (
        !callId ||
        !candidate
    ) {

        return;

    }


    // ---------- INCOMING POPUP ----------

    if (
        callId !==
        window.fchatCurrentCallId
    ) {

        if (
            window.fchatIncomingCall &&
            window.fchatIncomingCall.signal &&
            window.fchatIncomingCall.signal.callId ===
                callId
        ) {

            window.fchatPendingIceCandidates
                .push(candidate);


            console.log(
                "🧊 ICE queued before Accept"
            );

        }


        return;

    }


    const pc =
        window.fchatPeerConnection;


    if (!pc) {

        window.fchatPendingIceCandidates
            .push(candidate);


        console.log(
            "🧊 ICE queued - peer not ready"
        );


        return;

    }


    try {

        if (
            pc.remoteDescription &&
            pc.remoteDescription.type
        ) {

            await pc.addIceCandidate(
                new RTCIceCandidate(
                    candidate
                )
            );


            console.log(
                "🧊 ICE candidate added"
            );

        }

        else {

            window.fchatPendingIceCandidates
                .push(candidate);


            console.log(
                "🧊 ICE queued - remote description not ready"
            );

        }

    }

    catch (error) {

        console.error(
            "ICE add error:",
            error
        );

    }

}


// ---------- DELETE SIGNAL ----------

async function deleteCallSignal(rowId) {

    if (!rowId) return;


    const db =
        typeof supabaseClient !==
        "undefined"
            ? supabaseClient
            : window.supabaseClient;


    if (!db) return;


    try {

        await db
            .from("call_signals")
            .delete()
            .eq(
                "id",
                rowId
            );

    }

    catch (error) {

        console.log(
            "Signal delete skipped:",
            error
        );

    }

}


// ---------- POLL SUPABASE ----------

async function checkCallSignals() {

    const db =
        typeof supabaseClient !==
        "undefined"
            ? supabaseClient
            : window.supabaseClient;


    const me =
        typeof currentUser !==
        "undefined"
            ? currentUser
            : window.currentUser;


    if (
        !db ||
        !me
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await db
                .from("call_signals")
                .select("*")
                .eq(
                    "to_user",
                    me
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {

            console.error(
                "Call signal error:",
                error
            );

            return;

        }


        for (
            const row
            of
            (data || [])
        ) {

            if (
                window.fchatProcessedSignals
                    .has(row.id)
            ) {

                continue;

            }


            window.fchatProcessedSignals
                .add(row.id);


            try {

                if (
                    row.signal_type ===
                    "offer"
                ) {

                    await processIncomingOffer(
                        row
                    );

                }

                else if (
                    row.signal_type ===
                    "answer"
                ) {

                    await processAnswer(
                        row
                    );

                }

                else if (
                    row.signal_type ===
                    "ice"
                ) {

                    await processICE(
                        row
                    );

                }

                else if (
                    row.signal_type ===
                    "reject"
                ) {

                    if (
                        row.signal &&
                        row.signal.callId ===
                            window.fchatCurrentCallId
                    ) {

                        fchatSetCallStatus(
                            "Call rejected"
                        );


                        setTimeout(
                            () => {

                                if (
                                    window.fchatEndVoiceCall
                                ) {

                                    window.fchatEndVoiceCall(
                                        false
                                    );

                                }

                            },
                            500
                        );

                    }

                }

                else if (
                    row.signal_type ===
                    "end"
                ) {

                    if (
                        row.signal &&
                        row.signal.callId ===
                            window.fchatCurrentCallId
                    ) {

                        if (
                            window.fchatEndVoiceCall
                        ) {

                            window.fchatEndVoiceCall(
                                false
                            );

                        }

                    }

                }

            }

            catch (error) {

                console.error(
                    "Signal processing error:",
                    error
                );

            }


            // Delete processed signal
            await deleteCallSignal(
                row.id
            );

        }

    }

    catch (error) {

        console.error(
            "Polling error:",
            error
        );

    }

}


// ---------- START POLLING ----------

setInterval(
    checkCallSignals,
    700
);


setTimeout(
    checkCallSignals,
    1000
);


// ---------- EXPORT ----------

window.fchatAcceptIncomingCall =
    acceptIncomingCall;

window.fchatRejectIncomingCall =
    rejectIncomingCall;

window.fchatCheckCallSignals =
    checkCallSignals;


console.log(
    "📞 F-Chat Voice Call Part 2 loaded"
);

})();
// ==========================================
// F-CHAT VOICE CALL - PART 3/5
// CLEANUP + END CALL
// CORRECTED VERSION
// ==========================================

(function () {

"use strict";


// ---------- SEND END SIGNAL ----------

async function fchatSendEndSignal() {

    const partner =
        window.fchatVoiceCallPartner;


    const callId =
        window.fchatCurrentCallId;


    if (
        !partner ||
        !callId
    ) {

        return;

    }


    try {

        await fchatSendSignal(
            partner,
            callId,
            "end",
            {}
        );

    }

    catch (error) {

        console.log(
            "End signal error:",
            error
        );

    }

}


// ---------- CLEANUP ----------

function fchatCleanupCall() {

    console.log(
        "🧹 Cleaning voice call"
    );


    // ---------- STOP RINGTONE ----------

    if (
        typeof window.fchatStopIncomingRingtone ===
        "function"
    ) {

        window.fchatStopIncomingRingtone();

    }


    // ---------- STOP PEER ----------

    if (
        window.fchatPeerConnection
    ) {

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
                .onsignalingstatechange = null;

            window.fchatPeerConnection
                .close();

        }

        catch (error) {

            console.log(
                "Peer cleanup error:",
                error
            );

        }

    }


    window.fchatPeerConnection =
        null;


    // ---------- STOP MICROPHONE ----------

    if (
        window.fchatLocalStream
    ) {

        try {

            window.fchatLocalStream
                .getTracks()
                .forEach(
                    track => {

                        try {

                            track.stop();

                        }

                        catch (e) {}

                    }
                );

        }

        catch (error) {}

    }


    window.fchatLocalStream =
        null;


    // ---------- CLEAR REMOTE ----------

    const audio =
        document.getElementById(
            "fchatRemoteAudio"
        );


    if (audio) {

        try {

            audio.pause();

        }

        catch (e) {}


        audio.srcObject =
            null;

    }


    window.fchatRemoteStream =
        null;


    // ---------- RESET STATE ----------

    window.fchatPendingIceCandidates =
        [];

    window.fchatRemoteDescriptionSet =
        false;

    window.fchatVoiceCallActive =
        false;

    window.fchatVoiceCallPartner =
        null;

    window.fchatCurrentCallId =
        null;

    window.fchatIncomingCall =
        null;


    // ---------- REMOVE CALL SCREEN ----------

    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );


    if (screen) {

        screen.remove();

    }


    // ---------- REMOVE POPUP ----------

    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );


    if (popup) {

        popup.remove();

    }


    // ---------- UPDATE BUTTON ----------

    setTimeout(
        () => {

            if (
                typeof window.fchatUpdateVoiceCallButton ===
                "function"
            ) {

                window.fchatUpdateVoiceCallButton();

            }

        },
        100
    );


    // ---------- CALL ENDED EVENT ----------

    try {

        window.dispatchEvent(
            new Event(
                "fchatCallEnded"
            )
        );

    }

    catch (error) {}

}


// ---------- END CALL ----------

async function fchatEndVoiceCall(
    sendSignal = true
) {

    if (
        sendSignal
    ) {

        await fchatSendEndSignal();

    }


    fchatCleanupCall();

}


// ---------- REMOTE END ----------

function fchatHandleRemoteEnd() {

    console.log(
        "📴 Remote user ended call"
    );


    if (
        !window.fchatVoiceCallActive
    ) {

        return;

    }


    fchatSetCallStatus(
        "Call ended"
    );


    setTimeout(
        () => {

            fchatCleanupCall();

        },
        400
    );

}


// ---------- REMOTE REJECT ----------

function fchatHandleRemoteReject() {

    console.log(
        "❌ Remote user rejected call"
    );


    if (
        !window.fchatVoiceCallActive
    ) {

        return;

    }


    fchatSetCallStatus(
        "Call rejected"
    );


    setTimeout(
        () => {

            fchatCleanupCall();

        },
        500
    );

}


// ---------- PAGE CLOSE ----------

window.addEventListener(
    "beforeunload",
    () => {

        if (
            window.fchatVoiceCallActive
        ) {

            try {

                fchatSendEndSignal();

            }

            catch (error) {}

        }

    }
);


// ---------- EXPORT ----------

window.fchatCleanupCall =
    fchatCleanupCall;

window.fchatEndVoiceCall =
    fchatEndVoiceCall;

window.fchatHandleRemoteEnd =
    fchatHandleRemoteEnd;

window.fchatHandleRemoteReject =
    fchatHandleRemoteReject;


console.log(
    "📴 F-Chat Voice Call Part 3 loaded"
);

})();
// ==========================================
// F-CHAT VOICE CALL - PART 4/5
// CONNECTION + INCOMING RINGTONE
// CORRECTED VERSION
// ==========================================

(function () {

"use strict";


// ==========================================
// INCOMING CALL RINGTONE
// ==========================================

window.fchatIncomingRingtone =
    null;

window.fchatRingtoneTimer =
    null;


function fchatStartIncomingRingtone() {

    // Already ringing
    if (
        window.fchatRingtoneTimer
    ) {

        return;

    }


    if (
        !window.fchatIncomingCall
    ) {

        return;

    }


    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            console.log(
                "AudioContext unsupported"
            );

            return;

        }


        const ctx =
            new AudioContext();


        window.fchatIncomingRingtone =
            ctx;


        const ring =
            () => {

                if (
                    !window.fchatIncomingRingtone ||
                    !window.fchatIncomingCall
                ) {

                    return;

                }


                try {

                    if (
                        ctx.state ===
                        "suspended"
                    ) {

                        ctx.resume()
                            .catch(
                                () => {}
                            );

                    }


                    const oscillator =
                        ctx.createOscillator();


                    const gain =
                        ctx.createGain();


                    oscillator.type =
                        "sine";


                    oscillator.frequency.setValueAtTime(
                        880,
                        ctx.currentTime
                    );


                    oscillator.frequency.setValueAtTime(
                        660,
                        ctx.currentTime + 0.35
                    );


                    gain.gain.setValueAtTime(
                        0.0001,
                        ctx.currentTime
                    );


                    gain.gain.exponentialRampToValueAtTime(
                        0.25,
                        ctx.currentTime + 0.03
                    );


                    gain.gain.exponentialRampToValueAtTime(
                        0.0001,
                        ctx.currentTime + 0.45
                    );


                    oscillator.connect(
                        gain
                    );


                    gain.connect(
                        ctx.destination
                    );


                    oscillator.start();


                    oscillator.stop(
                        ctx.currentTime + 0.5
                    );

                }

                catch (error) {

                    console.log(
                        "Ringtone error:",
                        error
                    );

                }

            };


        ring();


        window.fchatRingtoneTimer =
            setInterval(
                ring,
                1000
            );


        console.log(
            "🔔 Incoming ringtone started"
        );

    }

    catch (error) {

        console.log(
            "Ringtone start error:",
            error
        );

    }

}


function fchatStopIncomingRingtone() {

    if (
        window.fchatRingtoneTimer
    ) {

        clearInterval(
            window.fchatRingtoneTimer
        );


        window.fchatRingtoneTimer =
            null;

    }


    if (
        window.fchatIncomingRingtone
    ) {

        try {

            window.fchatIncomingRingtone.close();

        }

        catch (error) {}

        window.fchatIncomingRingtone =
            null;

    }


    console.log(
        "🔕 Incoming ringtone stopped"
    );

}


// ---------- EXPORT RINGTONE ----------

window.fchatStartIncomingRingtone =
    fchatStartIncomingRingtone;

window.fchatStopIncomingRingtone =
    fchatStopIncomingRingtone;


// ==========================================
// HANDLE CONNECTION STATE
// ==========================================

function fchatVoiceConnectionState() {

    const pc =
        window.fchatPeerConnection;


    if (!pc) return;


    const state =
        pc.connectionState;


    console.log(
        "📡 Voice connection:",
        state
    );


    if (
        state === "connected"
    ) {

        fchatSetCallStatus(
            "Connected 🔊"
        );

    }

    else if (
        state === "connecting"
    ) {

        fchatSetCallStatus(
            "Connecting..."
        );

    }

    else if (
        state === "disconnected"
    ) {

        fchatSetCallStatus(
            "Connection lost..."
        );

    }

    else if (
        state === "failed"
    ) {

        fchatSetCallStatus(
            "Connection failed"
        );


        setTimeout(
            () => {

                if (
                    window.fchatVoiceCallActive
                ) {

                    fchatCleanupCall();

                }

            },
            1500
        );

    }

    else if (
        state === "closed"
    ) {

        if (
            window.fchatVoiceCallActive
        ) {

            fchatCleanupCall();

        }

    }

}


// ---------- ATTACH EVENTS ----------

function fchatAttachConnectionEvents() {

    const pc =
        window.fchatPeerConnection;


    if (!pc) return;


    pc.onconnectionstatechange =
        fchatVoiceConnectionState;


    pc.oniceconnectionstatechange =
        () => {

            console.log(
                "🧊 ICE:",
                pc.iceConnectionState
            );

        };


    pc.onsignalingstatechange =
        () => {

            console.log(
                "📡 Signaling:",
                pc.signalingState
            );

        };

}


// ---------- WATCH PEER ----------

let lastPeer =
    null;


setInterval(
    () => {

        const pc =
            window.fchatPeerConnection;


        if (
            pc &&
            pc !== lastPeer
        ) {

            lastPeer =
                pc;


            fchatAttachConnectionEvents();

        }


        if (!pc) {

            lastPeer =
                null;

        }

    },
    500
);


// ---------- SIGNAL CLEANUP ----------

async function fchatDeleteOldSignals() {

    const db =
        typeof supabaseClient !==
        "undefined"
            ? supabaseClient
            : window.supabaseClient;


    const me =
        typeof currentUser !==
        "undefined"
            ? currentUser
            : window.currentUser;


    if (
        !db ||
        !me
    ) {

        return;

    }


    try {

        await db
            .from("call_signals")
            .delete()
            .eq(
                "to_user",
                me
            );

    }

    catch (error) {

        console.log(
            "Signal cleanup skipped:",
            error
        );

    }

}


// ---------- LIMIT PROCESSED SIGNALS ----------

setInterval(
    () => {

        const set =
            window.fchatProcessedSignals;


        if (
            !set ||
            set.size < 300
        ) {

            return;

        }


        window.fchatProcessedSignals =
            new Set();

    },
    30000
);


// ---------- RESET AFTER CALL ----------

window.addEventListener(
    "fchatCallEnded",
    () => {

        window.fchatPendingIceCandidates =
            [];

        window.fchatRemoteDescriptionSet =
            false;

        window.fchatIncomingCall =
            null;

    }
);


// ---------- EXPORT ----------

window.fchatVoiceConnectionState =
    fchatVoiceConnectionState;

window.fchatAttachConnectionEvents =
    fchatAttachConnectionEvents;

window.fchatDeleteOldSignals =
    fchatDeleteOldSignals;


console.log(
    "📡 F-Chat Voice Call Part 4 loaded"
);

})();
// ==========================================
// F-CHAT VOICE CALL - PART 5/5
// FINAL INITIALIZATION + SAFETY
// CORRECTED VERSION
// ==========================================

(function () {

"use strict";


// ---------- INIT LOCK ----------

if (
    window.fchatVoiceFinalInit
) {

    console.log(
        "📞 Voice system already initialized"
    );

    return;

}


window.fchatVoiceFinalInit =
    true;


// ---------- SAFE CALL BUTTON UPDATE ----------

function refreshVoiceCallUI() {

    try {

        if (
            typeof window.fchatUpdateVoiceCallButton ===
            "function"
        ) {

            window.fchatUpdateVoiceCallButton();

        }

    }

    catch (error) {

        console.log(
            "Call UI update skipped:",
            error
        );

    }

}


// ---------- CHAT CHANGE WATCHER ----------

let lastChat =
    null;


setInterval(
    () => {

        const chat =
            window.currentChat ||
            (
                typeof currentChat !==
                "undefined"
                    ? currentChat
                    : null
            );


        if (
            chat !== lastChat
        ) {

            lastChat =
                chat;


            refreshVoiceCallUI();

        }

    },
    700
);


// ---------- INITIAL BUTTON ----------

setTimeout(
    refreshVoiceCallUI,
    500
);


setTimeout(
    refreshVoiceCallUI,
    1500
);


// ---------- MICROPHONE SAFETY ----------

if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
) {

    console.warn(
        "⚠️ Browser microphone API unavailable"
    );

}


// ---------- CALL STATE SAFETY ----------

setInterval(
    () => {

        if (
            !window.fchatVoiceCallActive
        ) {

            return;

        }


        const pc =
            window.fchatPeerConnection;


        if (!pc) {

            return;

        }


        const state =
            pc.connectionState;


        if (
            state === "closed"
        ) {

            if (
                typeof window.fchatCleanupCall ===
                "function"
            ) {

                window.fchatCleanupCall();

            }

        }

    },
    2000
);


// ---------- RINGTONE SAFETY ----------

setInterval(
    () => {

        if (
            !window.fchatIncomingCall
        ) {

            if (
                typeof window.fchatStopIncomingRingtone ===
                "function"
            ) {

                if (
                    window.fchatRingtoneTimer
                ) {

                    window.fchatStopIncomingRingtone();

                }

            }

        }

    },
    1000
);


// ---------- PAGE VISIBILITY ----------

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshVoiceCallUI();

        }

    }
);


// ---------- GLOBAL ERROR PROTECTION ----------

window.addEventListener(
    "unhandledrejection",
    event => {

        const reason =
            event.reason;


        if (
            reason &&
            String(reason)
                .toLowerCase()
                .includes(
                    "getusermedia"
                )
        ) {

            console.log(
                "🎤 Microphone request handled by call system"
            );

        }

    }
);


// ---------- FINAL STATUS ----------

console.log(
    "================================"
);

console.log(
    "📞 F-CHAT VOICE CALL READY"
);

console.log(
    "🎤 Single microphone manager"
);

console.log(
    "📡 Supabase call signaling"
);

console.log(
    "🧊 WebRTC ICE handling"
);

console.log(
    "🔔 Incoming ringtone enabled"
);

console.log(
    "📴 Call cleanup enabled"
);

console.log(
    "================================"
);

})();