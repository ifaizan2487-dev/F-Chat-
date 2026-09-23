// ==========================================
// F-CHAT FEATURES 3
// VOICE CALL - PART 1/5
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
window.fchatProcessedSignals = new Set();
window.fchatPendingIceCandidates = [];

const RTC_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
    ]
};


// ---------- HELPERS ----------

function getUser() {
    return window.currentUser ||
        (typeof currentUser !== "undefined"
            ? currentUser : null);
}

function getDB() {
    return window.supabaseClient ||
        (typeof supabaseClient !== "undefined"
            ? supabaseClient : null);
}


// ---------- MICROPHONE ----------
// Sirf ye function microphone request karega.

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

    } finally {

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

        audio.id = "fchatRemoteAudio";
        audio.autoplay = true;
        audio.playsInline = true;
        audio.style.display = "none";

        document.body.appendChild(audio);
    }

    return audio;
}


// ---------- CALL STATUS ----------

function fchatSetCallStatus(text) {

    const el =
        document.getElementById(
            "fchatCallStatus"
        );

    if (el) el.textContent = text;
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

    if (old) old.remove();

    const screen =
        document.createElement("div");

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
        font-family:Arial;
    `;

    screen.innerHTML = `
        <div style="font-size:60px">👤</div>
        <h2>${username}</h2>
        <p id="fchatCallStatus">${status}</p>

        <button id="fchatEndCallButton"
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
            ">
            📵
        </button>

        <audio id="fchatRemoteAudio"
            autoplay playsinline>
        </audio>
    `;

    document.body.appendChild(screen);

    document
        .getElementById("fchatEndCallButton")
        .onclick = () =>
            window.fchatEndVoiceCall(true);
}


// ---------- PEER CONNECTION ----------

async function fchatCreatePeerConnection(
    username,
    callId
) {

    if (window.fchatPeerConnection) {
        try {
            window.fchatPeerConnection.close();
        } catch (e) {}
    }

    const pc =
        new RTCPeerConnection(
            RTC_CONFIG
        );

    window.fchatPeerConnection = pc;

    // Local audio
    if (window.fchatLocalStream) {

        window.fchatLocalStream
            .getTracks()
            .forEach(track => {

                pc.addTrack(
                    track,
                    window.fchatLocalStream
                );

            });
    }

    // Remote audio
    pc.ontrack = event => {

        const audio =
            fchatCreateRemoteAudio();

        audio.srcObject =
            event.streams[0];

        audio.play().catch(() => {});

        fchatSetCallStatus(
            "Connected 🔊"
        );
    };

    // ICE
    pc.onicecandidate = event => {

        if (!event.candidate) return;

        fchatSendSignal(
            username,
            callId,
            "ice",
            {
                candidate:
                    event.candidate
            }
        );
    };

    // Connection state
    pc.onconnectionstatechange = () => {

        const state =
            pc.connectionState;

        if (state === "connected")
            fchatSetCallStatus("Connected 🔊");

        else if (state === "connecting")
            fchatSetCallStatus("Connecting...");

        else if (state === "failed")
            fchatSetCallStatus("Connection failed");
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

    const db = getDB();
    const me = getUser();

    if (!db || !me || !toUser) {
        console.error(
            "Supabase/current user missing"
        );
        return;
    }

    const { error } =
        await db
        .from("call_signals")
        .insert({
            from_user: me,
            to_user: toUser,
            signal_type: signalType,
            signal: {
                callId: callId,
                from: me,
                to: toUser,
                data: data
            }
        });

    if (error)
        console.error(
            "Signal error:",
            error
        );
}


// ---------- START CALL ----------

async function fchatStartVoiceCall(
    username
) {

    if (
        !username ||
        window.fchatVoiceCallActive
    ) return;

    const me = getUser();

    if (!me) {
        alert("Current user nahi mila.");
        return;
    }

    window.fchatVoiceCallActive = true;
    window.fchatVoiceCallPartner = username;

    const callId =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 9);

    window.fchatCurrentCallId =
        callId;

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
                offerToReceiveAudio: true
            });

        await pc.setLocalDescription(
            offer
        );

        await fchatSendSignal(
            username,
            callId,
            "offer",
            {
                type: offer.type,
                sdp: offer.sdp
            }
        );

        fchatSetCallStatus(
            "Ringing..."
        );

    } catch (error) {

        console.error(
            "Start call error:",
            error
        );

        alert(
            "Microphone error: " +
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

    if (btn) return btn;

    btn =
        document.createElement("button");

    btn.id =
        "fchatVoiceCallButton";

    btn.innerHTML = "📞";

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
    `;

    btn.onclick = () => {

        const chat =
            window.currentChat ||
            (typeof currentChat !==
                "undefined"
                ? currentChat : null);

        if (!chat) {
            alert(
                "Pehle chat open karo."
            );
            return;
        }

        fchatStartVoiceCall(chat);
    };

    document.body.appendChild(btn);

    return btn;
}


function fchatUpdateVoiceCallButton() {

    const btn =
        document.getElementById(
            "fchatVoiceCallButton"
        );

    if (!btn) return;

    const chat =
        window.currentChat ||
        (typeof currentChat !==
            "undefined"
            ? currentChat : null);

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

setInterval(() => {

    fchatAddVoiceCallButton();
    fchatUpdateVoiceCallButton();

}, 700);


console.log(
    "📞 F-Chat Voice Call Part 1 loaded"
);

})();
// ==========================================
// F-CHAT VOICE CALL - PART 2 / 5
// INCOMING CALL + ACCEPT / REJECT
// ==========================================

(function () {

"use strict";


// ---------- SHOW INCOMING CALL ----------

function showIncomingCall(row) {

    if (
        document.getElementById(
            "fchatIncomingCall"
        )
    ) return;


    const caller =
        row.from_user;

    const box =
        document.createElement("div");


    box.id =
        "fchatIncomingCall";


    box.style.cssText = `
        position:fixed;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
        width:300px;
        padding:25px;
        background:white;
        color:#222;
        border-radius:20px;
        box-shadow:0 10px 40px rgba(0,0,0,.35);
        z-index:99999999;
        text-align:center;
        font-family:Arial;
    `;


    box.innerHTML = `

        <div style="font-size:50px">
            📞
        </div>

        <h2>
            Incoming Call
        </h2>

        <p>
            ${caller} is calling...
        </p>

        <button
            id="fchatAcceptBtn"
            style="
                border:0;
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
                border:0;
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
            () =>
                acceptIncomingCall(
                    row
                );


    document
        .getElementById(
            "fchatRejectBtn"
        )
        .onclick =
            () =>
                rejectIncomingCall(
                    row
                );
}


// ---------- ACCEPT ----------

async function acceptIncomingCall(row) {

    if (
        !row ||
        window.fchatVoiceCallActive
    ) return;


    const caller =
        row.from_user;

    const signal =
        row.signal || {};

    const callId =
        signal.callId;


    if (!caller || !callId) {

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


    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );

    if (popup) popup.remove();


    fchatShowVoiceCallScreen(
        caller,
        "Connecting microphone..."
    );


    try {

        // IMPORTANT:
        // Existing microphone reuse hoga
        await fchatGetMicrophone();


        const pc =
            await fchatCreatePeerConnection(
                caller,
                callId
            );


        // Offer database me already hai.
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


        // Queued ICE candidates
        for (
            const candidate
            of window.fchatPendingIceCandidates
        ) {

            try {

                await pc.addIceCandidate(
                    new RTCIceCandidate(
                        candidate
                    )
                );

            } catch (e) {

                console.log(
                    "Queued ICE error:",
                    e
                );

            }

        }


        window.fchatPendingIceCandidates =
            [];


        const answer =
            await pc.createAnswer();


        await pc.setLocalDescription(
            answer
        );


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


        fchatSetCallStatus(
            "Connecting..."
        );


        console.log(
            "✅ Answer sent"
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


        window.fchatEndVoiceCall(
            false
        );

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


    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );

    if (popup) popup.remove();


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


    window.fchatIncomingCall =
        row;


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
    ) return;


    const data =
        signal.data;


    if (
        !data ||
        !window.fchatPeerConnection
    ) return;


    try {

        await window.fchatPeerConnection
            .setRemoteDescription(
                new RTCSessionDescription(
                    data
                )
            );


        window.fchatRemoteDescriptionSet =
            true;


        for (
            const candidate
            of window.fchatPendingIceCandidates
        ) {

            try {

                await window.fchatPeerConnection
                    .addIceCandidate(
                        new RTCIceCandidate(
                            candidate
                        )
                    );

            } catch (e) {}

        }


        window.fchatPendingIceCandidates =
            [];


        fchatSetCallStatus(
            "Connected..."
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
        signal.data?.candidate;

    if (!callId || !candidate) return;


    // Agar ye current call nahi hai
    // lekin incoming call popup abhi open hai,
    // to candidate ko queue kar do.
    if (
        callId !== window.fchatCurrentCallId
    ) {

        if (
            window.fchatIncomingCall &&
            window.fchatIncomingCall.signal?.callId === callId
        ) {

            window.fchatPendingIceCandidates.push(
                candidate
            );

            console.log(
                "🧊 ICE queued before Accept"
            );

        }

        return;
    }


    const pc =
        window.fchatPeerConnection;


    // Peer abhi create nahi hua
    if (!pc) {

        window.fchatPendingIceCandidates.push(
            candidate
        );

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

            window.fchatPendingIceCandidates.push(
                candidate
            );

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


    if (!db || !me) return;


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
                        ascending:true
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
            const row of
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
                    row.signal?.callId ===
                    window.fchatCurrentCallId
                ) {

                    fchatSetCallStatus(
                        "Call rejected"
                    );

                    setTimeout(
                        () =>
                            window.fchatEndVoiceCall(
                                false
                            ),
                        500
                    );

                }

            }

            else if (
                row.signal_type ===
                "end"
            ) {

                if (
                    row.signal?.callId ===
                    window.fchatCurrentCallId
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
// F-CHAT VOICE CALL - PART 3 / 5
// CLEANUP + END CALL
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
    ) return;


    try {

        await fchatSendSignal(
            partner,
            callId,
            "end",
            {}
        );

    } catch (e) {

        console.log(
            "End signal error:",
            e
        );

    }

}


// ---------- CLEANUP ----------

function fchatCleanupCall() {

    console.log(
        "🧹 Cleaning voice call"
    );


    // Stop peer connection
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
                .close();

        } catch (e) {}

    }


    window.fchatPeerConnection =
        null;


    // Stop microphone
    if (
        window.fchatLocalStream
    ) {

        try {

            window.fchatLocalStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

        } catch (e) {}

    }


    window.fchatLocalStream =
        null;


    // Clear remote stream
    window.fchatRemoteStream =
        null;


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


    // Remove call screen
    const screen =
        document.getElementById(
            "fchatVoiceCallScreen"
        );

    if (screen) {

        screen.remove();

    }


    // Remove incoming popup
    const popup =
        document.getElementById(
            "fchatIncomingCall"
        );

    if (popup) {

        popup.remove();

    }


    // Re-create call button
    setTimeout(
        () => {

            if (
                typeof fchatUpdateVoiceCallButton
                === "function"
            ) {

                fchatUpdateVoiceCallButton();

            }

        },
        100
    );

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


// ---------- HANDLE PAGE CLOSE ----------

window.addEventListener(
    "beforeunload",
    () => {

        if (
            window.fchatVoiceCallActive
        ) {

            try {

                fchatSendEndSignal();

            } catch (e) {}

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
// F-CHAT VOICE CALL - PART 4 / 5
// SIGNAL HANDLER + CONNECTION STATE
// ==========================================

(function () {

"use strict";


// ---------- HANDLE CONNECTION STATE ----------

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
            "Connected"
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
            1200
        );

    }


    else if (
        state === "closed"
    ) {

        fchatCleanupCall();

    }

}


// ---------- ATTACH CONNECTION EVENTS ----------

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


// ---------- WATCH FOR NEW PEER ----------

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


// ---------- SAFE SIGNAL CLEANUP ----------

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


    if (!db || !me) return;


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

// ---------- INCOMING CALL RINGTONE ----------

window.fchatIncomingRingtone = null;
window.fchatRingtoneTimer = null;

function fchatStartIncomingRingtone() {

    if (window.fchatRingtoneTimer) return;

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const ctx =
            new AudioContext();

        window.fchatIncomingRingtone = ctx;

        const ring = () => {

            if (
                !window.fchatIncomingRingtone ||
                !window.fchatIncomingCall
            ) {
                return;
            }

            try {

                if (ctx.state === "suspended") {
                    ctx.resume().catch(() => {});
                }

                const oscillator =
                    ctx.createOscillator();

                const gain =
                    ctx.createGain();

                oscillator.type = "sine";

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

                oscillator.connect(gain);
                gain.connect(ctx.destination);

                oscillator.start();

                oscillator.stop(
                    ctx.currentTime + 0.5
                );

            } catch (e) {

                console.log(
                    "Ringtone error:",
                    e
                );

            }
        };

        ring();

        window.fchatRingtoneTimer =
            setInterval(ring, 1000);

    } catch (error) {

        console.log(
            "Ringtone start error:",
            error
        );
    }
}


function fchatStopIncomingRingtone() {

    if (window.fchatRingtoneTimer) {

        clearInterval(
            window.fchatRingtoneTimer
        );

        window.fchatRingtoneTimer =
            null;
    }

    if (window.fchatIncomingRingtone) {

        try {
            window.fchatIncomingRingtone.close();
        } catch (e) {}

        window.fchatIncomingRingtone =
            null;
    }
}
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
// F-CHAT VOICE CALL - PART 5 / 5
// FINAL INITIALIZATION + SAFETY
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
            typeof fchatUpdateVoiceCallButton ===
            "function"
        ) {

            fchatUpdateVoiceCallButton();

        }

    }

    catch (e) {

        console.log(
            "Call UI update skipped:",
            e
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


        if (
            !window.fchatPeerConnection
        ) {

            return;

        }


        const state =
            window.fchatPeerConnection
                .connectionState;


        if (
            state === "closed"
        ) {

            if (
                typeof fchatCleanupCall ===
                "function"
            ) {

                fchatCleanupCall();

            }

        }

    },
    2000
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
                .includes("getusermedia")
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
    "📴 Call cleanup enabled"
);

console.log(
    "================================"
);

})();