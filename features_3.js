// ============================================================
// F-CHAT VOICE CALL COMPATIBILITY FIX
// PART 1/3
// CURRENT USER + INCOMING OFFER DETECTION
// ============================================================

(function () {

    // --------------------------------------------------------
    // GET CURRENT USER
    // Works with both:
    // currentUser
    // window.currentUser
    // --------------------------------------------------------

    function getFchatCurrentUser() {

        if (
            typeof currentUser !== "undefined" &&
            currentUser
        ) {

            return currentUser;

        }


        if (
            window.currentUser
        ) {

            return window.currentUser;

        }


        return null;

    }


    // Make available for next parts

    window.getFchatCurrentUser =
        getFchatCurrentUser;


    // --------------------------------------------------------
    // PROCESSED SIGNALS
    // --------------------------------------------------------

    const fixedProcessedSignals =
        new Set();


    // Make available for Part 2 and 3

    window.fchatFixedProcessedSignals =
        fixedProcessedSignals;


    // --------------------------------------------------------
    // SHOW INCOMING CALL POPUP
    // --------------------------------------------------------

    function fchatFixedShowIncomingCall(
        row
    ) {

        // Already showing

        if (
            document.getElementById(
                "fchatIncomingCall"
            )
        ) {

            return;

        }


        const caller =
            row.from_user;


        // Save incoming call

        window.fchatIncomingCall =
            row;


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
            "#ffffff";

        box.style.borderRadius =
            "20px";

        box.style.boxShadow =
            "0 10px 40px rgba(0,0,0,.35)";

        box.style.zIndex =
            "99999999";

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
                margin-bottom:10px;
            ">
                Incoming Call
            </div>


            <div style="
                color:#666;
                margin-bottom:20px;
            ">
                ${caller} is calling...
            </div>


            <button
                id="fchatFixedAcceptBtn"
                style="
                    border:none;
                    background:#22c55e;
                    color:white;
                    padding:12px 20px;
                    border-radius:10px;
                    font-size:16px;
                    margin-right:8px;
                    cursor:pointer;
                "
            >
                📞 Accept
            </button>


            <button
                id="fchatFixedRejectBtn"
                style="
                    border:none;
                    background:#ef4444;
                    color:white;
                    padding:12px 20px;
                    border-radius:10px;
                    font-size:16px;
                    cursor:pointer;
                "
            >
                ❌ Reject
            </button>

        `;


        document.body.appendChild(
            box
        );


        // ----------------------------------------------------
        // ACCEPT BUTTON
        // ----------------------------------------------------

        const acceptButton =
            document.getElementById(
                "fchatFixedAcceptBtn"
            );


        if (acceptButton) {

            acceptButton.onclick =
                function () {

                    if (
                        window
                            .fchatAcceptIncomingCall
                    ) {

                        window
                            .fchatAcceptIncomingCall();

                    } else {

                        console.error(
                            "Accept function not found"
                        );

                    }

                };

        }


        // ----------------------------------------------------
        // REJECT BUTTON
        // ----------------------------------------------------

        const rejectButton =
            document.getElementById(
                "fchatFixedRejectBtn"
            );


        if (rejectButton) {

            rejectButton.onclick =
                function () {

                    if (
                        window
                            .fchatRejectIncomingCall
                    ) {

                        window
                            .fchatRejectIncomingCall();

                    }

                };

        }


        console.log(
            "📞 INCOMING CALL FROM:",
            caller
        );

    }


    // Make available

    window.fchatFixedShowIncomingCall =
        fchatFixedShowIncomingCall;


    // --------------------------------------------------------
    // HANDLE INCOMING OFFER
    // --------------------------------------------------------

    function fchatFixedProcessOffer(
        row
    ) {

        // Don't show duplicate call

        if (
            window.fchatIncomingCall
        ) {

            return;

        }


        if (
            window.fchatVoiceCallActive
        ) {

            return;

        }


        console.log(
            "📞 OFFER RECEIVED:",
            row
        );


        fchatFixedShowIncomingCall(
            row
        );

    }


    window.fchatFixedProcessOffer =
        fchatFixedProcessOffer;


    console.log(
        "✅ F-Chat Compatibility Fix Part 1 loaded"
    );

})()
//
// ============================================================
// F-CHAT VOICE CALL COMPATIBILITY FIX
// PART 2/3
// ANSWER + ICE HANDLING
// ============================================================

(function () {

    // --------------------------------------------------------
    // PROCESS ANSWER
    // --------------------------------------------------------

    async function fchatFixedProcessAnswer(row) {

        const signal =
            row.signal;


        if (!signal) {
            return;
        }


        if (
            !window.fchatPeerConnection
        ) {
            console.log(
                "⏳ Peer connection not ready for answer"
            );

            return;
        }


        if (
            signal.callId !==
            window.fchatCurrentCallId
        ) {

            return;

        }


        // Part 1/old code may store answer in signal.data

        const answerData =
            signal.data;


        if (!answerData) {

            console.error(
                "❌ Answer data missing"
            );

            return;

        }


        try {

            await window
                .fchatPeerConnection
                .setRemoteDescription(

                    new RTCSessionDescription(
                        answerData
                    )

                );


            console.log(
                "✅ Remote answer connected"
            );


            window.fchatVoiceCallActive =
                true;


        } catch (error) {

            console.error(
                "❌ Answer processing error:",
                error
            );

        }

    }


    window.fchatFixedProcessAnswer =
        fchatFixedProcessAnswer;


    // --------------------------------------------------------
    // PROCESS ICE CANDIDATE
    // --------------------------------------------------------

    async function fchatFixedProcessICE(row) {

        const signal =
            row.signal;


        if (!signal) {
            return;
        }


        if (
            signal.callId !==
            window.fchatCurrentCallId
        ) {

            return;

        }


        if (
            !window.fchatPeerConnection
        ) {

            return;

        }


        // IMPORTANT:
        // Part 1 sends ICE inside signal.data

        let candidate = null;


        if (
            signal.data &&
            signal.data.candidate
        ) {

            candidate =
                signal.data.candidate;

        }


        // Compatibility with another format

        else if (
            signal.candidate
        ) {

            candidate =
                signal.candidate;

        }


        if (!candidate) {

            console.log(
                "⚠️ ICE candidate missing"
            );

            return;

        }


        try {

            const pc =
                window.fchatPeerConnection;


            // If remote description is not ready,
            // save candidate for later.

            if (
                !pc.remoteDescription
            ) {

                if (
                    !window.fchatPendingICE
                ) {

                    window.fchatPendingICE =
                        [];

                }


                window.fchatPendingICE
                    .push(candidate);


                console.log(
                    "⏳ ICE candidate queued"
                );


                return;

            }


            await pc.addIceCandidate(

                new RTCIceCandidate(
                    candidate
                )

            );


            console.log(
                "✅ ICE candidate added"
            );


        } catch (error) {

            console.error(
                "❌ ICE processing error:",
                error
            );

        }

    }


    window.fchatFixedProcessICE =
        fchatFixedProcessICE;


    // --------------------------------------------------------
    // ADD PENDING ICE
    // --------------------------------------------------------

    window.fchatAddPendingICE =
        async function () {

            const pc =
                window.fchatPeerConnection;


            if (!pc) {
                return;
            }


            if (
                !pc.remoteDescription
            ) {
                return;
            }


            const pending =
                window.fchatPendingICE || [];


            if (!pending.length) {
                return;
            }


            for (
                const candidate of pending
            ) {

                try {

                    await pc.addIceCandidate(

                        new RTCIceCandidate(
                            candidate
                        )

                    );

                    console.log(
                        "✅ Queued ICE added"
                    );

                } catch (error) {

                    console.error(
                        "Queued ICE error:",
                        error
                    );

                }

            }


            window.fchatPendingICE =
                [];

        };


    console.log(
        "✅ F-Chat Compatibility Fix Part 2 loaded"
    );

})();
// ============================================================
// F-CHAT VOICE CALL COMPATIBILITY FIX
// PART 3/3
// SIGNAL POLLING + OFFER + ANSWER + ICE + END
// ============================================================

(function () {

    async function checkFixedCallSignals() {

        const user =
            window.getFchatCurrentUser
                ? window.getFchatCurrentUser()
                : window.currentUser;


        if (
            !user ||
            !window.supabaseClient
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
                        user
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (result.error) {

                console.error(
                    "❌ Signal polling error:",
                    result.error
                );

                return;

            }


            const rows =
                result.data || [];


            for (
                const row of rows
            ) {

                const processed =
                    window
                        .fchatFixedProcessedSignals;


                if (
                    processed &&
                    processed.has(row.id)
                ) {
                    continue;
                }


                if (processed) {
                    processed.add(row.id);
                }


                const signal =
                    row.signal;


                if (!signal) {
                    continue;
                }


                // ==================================================
                // INCOMING OFFER
                // ==================================================

                if (
                    row.signal_type ===
                    "offer"
                ) {

                    if (
                        !window.fchatIncomingCall &&
                        !window.fchatVoiceCallActive
                    ) {

                        if (
                            window
                                .fchatFixedProcessOffer
                        ) {

                            window
                                .fchatFixedProcessOffer(
                                    row
                                );

                        }

                    }

                }


                // ==================================================
                // ANSWER
                // ==================================================

                else if (
                    row.signal_type ===
                    "answer"
                ) {

                    if (
                        window
                            .fchatFixedProcessAnswer
                    ) {

                        await window
                            .fchatFixedProcessAnswer(
                                row
                            );

                    }


                    if (
                        window
                            .fchatAddPendingICE
                    ) {

                        await window
                            .fchatAddPendingICE();

                    }

                }


                // ==================================================
                // ICE
                // ==================================================

                else if (
                    row.signal_type ===
                    "ice"
                ) {

                    if (
                        window
                            .fchatFixedProcessICE
                    ) {

                        await window
                            .fchatFixedProcessICE(
                                row
                            );

                    }

                }


                // ==================================================
                // REJECT
                // ==================================================

                else if (
                    row.signal_type ===
                    "reject"
                ) {

                    if (
                        signal.callId ===
                        window.fchatCurrentCallId
                    ) {

                        alert(
                            "Call rejected"
                        );


                        if (
                            window
                                .fchatEndVoiceCall
                        ) {

                            await window
                                .fchatEndVoiceCall();

                        }

                    }

                }


                // ==================================================
                // END CALL
                // ==================================================

                else if (
                    row.signal_type ===
                    "end"
                ) {

                    if (
                        signal.callId ===
                        window.fchatCurrentCallId
                    ) {

                        console.log(
                            "📴 Other user ended call"
                        );


                        // Stop microphone

                        if (
                            window.fchatLocalStream
                        ) {

                            window
                                .fchatLocalStream
                                .getTracks()
                                .forEach(
                                    function (track) {

                                        track.stop();

                                    }
                                );

                        }


                        // Close peer

                        if (
                            window.fchatPeerConnection
                        ) {

                            try {

                                window
                                    .fchatPeerConnection
                                    .close();

                            } catch (e) {}

                        }


                        window.fchatPeerConnection =
                            null;

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


                        const audio =
                            document.getElementById(
                                "fchatRemoteAudio"
                            );

                        if (audio) {

                            audio.srcObject =
                                null;

                            audio.remove();

                        }


                        const callScreen =
                            document.getElementById(
                                "fchatVoiceCallScreen"
                            );

                        if (callScreen) {

                            callScreen.remove();

                        }


                        console.log(
                            "✅ Call cleanup complete"
                        );

                    }

                }

            }

        } catch (error) {

            console.error(
                "❌ Fixed call polling error:",
                error
            );

        }

    }


    // ==========================================================
    // POLLING
    // ==========================================================

    setInterval(
        checkFixedCallSignals,
        700
    );


    setTimeout(
        checkFixedCallSignals,
        1200
    );


    console.log(
        "✅ F-Chat Compatibility Fix Part 3 loaded"
    );

})();