// ==========================================
// F CHAT - FEATURES 2
// ❤️ MESSAGE REACTIONS
// ↩️ REPLY TO MESSAGE
// PART 1
// ==========================================

window.fchatReplyData = null;

const FCHAT_REACTIONS = [
    "❤️",
    "😂",
    "👍",
    "😢",
    "😡"
];


// ==========================================
// ADD STYLES
// ==========================================

(function () {

    const style = document.createElement("style");

    style.innerHTML = `

        .fchat-tools {
            display: flex;
            gap: 4px;
            margin-top: 4px;
        }

        .fchat-tool-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 17px;
            padding: 3px;
        }

        .fchat-reaction-picker {
            position: fixed;
            z-index: 99999;
            display: flex;
            gap: 4px;
            background: white;
            padding: 7px;
            border-radius: 30px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.25);
        }

        .fchat-reaction-picker button {
            border: none;
            background: transparent;
            font-size: 23px;
            cursor: pointer;
        }

        .fchat-reactions {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-top: 4px;
        }

        .fchat-reaction {
            border: none;
            padding: 3px 7px;
            border-radius: 15px;
            background: #eeeeee;
            cursor: pointer;
            font-size: 13px;
        }

        .fchat-reaction.mine {
            background: #d9fdd3;
        }

        .fchat-reply-preview {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #f0f2f5;
            border-top: 1px solid #ddd;
        }

        .fchat-reply-info {
            flex: 1;
            border-left: 4px solid #25d366;
            padding-left: 8px;
        }

        .fchat-reply-name {
            font-size: 13px;
            font-weight: bold;
            color: #128c7e;
        }

        .fchat-reply-text {
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .fchat-reply-cancel {
            border: none;
            background: transparent;
            font-size: 22px;
            cursor: pointer;
        }

        .fchat-replied-box {
            border-left: 4px solid #25d366;
            background: rgba(0,0,0,0.06);
            padding: 5px 8px;
            margin-bottom: 5px;
            border-radius: 5px;
            cursor: pointer;
        }

        .fchat-replied-name {
            font-size: 12px;
            font-weight: bold;
            color: #128c7e;
        }

        .fchat-replied-text {
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

    `;

    document.head.appendChild(style);

})();


// ==========================================
// GET MESSAGE ELEMENT
// ==========================================

function fchatGetMessageElement(id, type) {

    if (type === "group") {

        return document.querySelector(
            '[data-group-message-id="' + id + '"]'
        );

    }

    return document.querySelector(
        '[data-message-id="' + id + '"]'
    );

}


// ==========================================
// GET MESSAGE TEXT
// ==========================================

function fchatGetMessageText(element) {

    if (!element) return "";

    const text =
        element.querySelector(".message-text") ||
        element.querySelector(".group-message-text");

    return text ? text.textContent : "";

}


// ==========================================
// GET SENDER
// ==========================================

function fchatGetSender(element, type) {

    if (!element) return "";

    if (type === "group") {

        const username =
            element.querySelector(".group-message-username");

        if (username) {
            return username.textContent;
        }

    }

    if (element.classList.contains("sent")) {
        return currentUser;
    }

    return currentChat || "";

}


// ==========================================
// ADD MESSAGE TOOLS
// ==========================================

function fchatAddTools(element, messageId, type) {

    if (!element) return;

    if (element.querySelector(".fchat-tools")) return;


    const tools =
        document.createElement("div");

    tools.className = "fchat-tools";


    // REACTION BUTTON

    const reactButton =
        document.createElement("button");

    reactButton.className =
        "fchat-tool-btn";

    reactButton.innerText = "😊";


    reactButton.onclick = function (event) {

        event.stopPropagation();

        fchatOpenReactionPicker(
            reactButton,
            messageId,
            type
        );

    };


    // REPLY BUTTON

    const replyButton =
        document.createElement("button");

    replyButton.className =
        "fchat-tool-btn";

    replyButton.innerText = "↩️";


    replyButton.onclick = function (event) {

        event.stopPropagation();

        fchatStartReply(
            element,
            messageId,
            type
        );

    };


    tools.appendChild(reactButton);
    tools.appendChild(replyButton);

    element.appendChild(tools);


    fchatLoadReactions(
        messageId,
        type,
        element
    );

}


// ==========================================
// REACTION PICKER
// ==========================================

function fchatOpenReactionPicker(
    button,
    messageId,
    type
) {

    const old =
        document.getElementById(
            "fchatReactionPicker"
        );

    if (old) old.remove();


    const picker =
        document.createElement("div");

    picker.id =
        "fchatReactionPicker";

    picker.className =
        "fchat-reaction-picker";


    FCHAT_REACTIONS.forEach(function (emoji) {

        const emojiButton =
            document.createElement("button");

        emojiButton.innerText = emoji;


        emojiButton.onclick =
            async function () {

                await fchatSaveReaction(
                    messageId,
                    type,
                    emoji
                );

                picker.remove();

            };


        picker.appendChild(emojiButton);

    });


    document.body.appendChild(picker);


    const rect =
        button.getBoundingClientRect();


    picker.style.left =
        Math.max(5, rect.left) + "px";


    picker.style.top =
        Math.max(5, rect.top - 55) + "px";

}


// ==========================================
// SAVE REACTION
// ==========================================

async function fchatSaveReaction(
    messageId,
    type,
    emoji
) {

    let column = "message_id";

    if (type === "group") {
        column = "group_message_id";
    }


    const {
        data: oldReaction,
        error
    } = await supabaseClient
        .from("fchat_message_reactions")
        .select("*")
        .eq(column, messageId)
        .eq("username", currentUser)
        .maybeSingle();


    if (error) {

        console.log(error);
        return;

    }


    // SAME REACTION = DELETE

    if (
        oldReaction &&
        oldReaction.emoji === emoji
    ) {

        await supabaseClient
            .from("fchat_message_reactions")
            .delete()
            .eq("id", oldReaction.id);

    }


    // UPDATE OLD REACTION

    else if (oldReaction) {

        await supabaseClient
            .from("fchat_message_reactions")
            .update({
                emoji: emoji
            })
            .eq("id", oldReaction.id);

    }


    // NEW REACTION

    else {

        const data = {
            username: currentUser,
            emoji: emoji
        };


        data[column] = messageId;


        await supabaseClient
            .from("fchat_message_reactions")
            .insert(data);

    }


    const element =
        fchatGetMessageElement(
            messageId,
            type
        );


    if (element) {

        fchatLoadReactions(
            messageId,
            type,
            element
        );

    }

}


// ==========================================
// LOAD REACTIONS
// ==========================================

async function fchatLoadReactions(
    messageId,
    type,
    element
) {

    let column = "message_id";

    if (type === "group") {
        column = "group_message_id";
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("fchat_message_reactions")
        .select("*")
        .eq(column, messageId);


    if (error) return;


    fchatRenderReactions(
        data,
        messageId,
        type,
        element
    );

}


// ==========================================
// RENDER REACTIONS
// ==========================================

function fchatRenderReactions(
    reactions,
    messageId,
    type,
    element
) {

    const oldBox =
        element.querySelector(
            ".fchat-reactions"
        );

    if (oldBox) oldBox.remove();


    if (
        !reactions ||
        reactions.length === 0
    ) return;


    const box =
        document.createElement("div");

    box.className =
        "fchat-reactions";


    const grouped = {};


    reactions.forEach(function (reaction) {

        if (!grouped[reaction.emoji]) {

            grouped[reaction.emoji] = [];

        }


        grouped[reaction.emoji]
            .push(reaction);

    });


    Object.keys(grouped)
        .forEach(function (emoji) {

            const list =
                grouped[emoji];


            const button =
                document.createElement("button");

            button.className =
                "fchat-reaction";


            const mine =
                list.some(function (reaction) {

                    return (
                        reaction.username ===
                        currentUser
                    );

                });


            if (mine) {

                button.classList.add("mine");

            }


            button.innerText =
                emoji + " " + list.length;


            button.onclick = function () {

                fchatSaveReaction(
                    messageId,
                    type,
                    emoji
                );

            };


            box.appendChild(button);

        });


    element.appendChild(box);

}
// ==========================================
// START REPLY
// ==========================================

function fchatStartReply(
    element,
    messageId,
    type
) {

    window.fchatReplyData = {

        id: messageId,

        sender: fchatGetSender(
            element,
            type
        ),

        message: fchatGetMessageText(
            element
        ),

        type: type

    };


    fchatShowReplyPreview();

}


// ==========================================
// SHOW REPLY PREVIEW
// ==========================================

function fchatShowReplyPreview() {

    const reply =
        window.fchatReplyData;

    if (!reply) return;


    const old =
        document.getElementById(
            "fchatReplyPreview"
        );

    if (old) old.remove();


    const inputId =
        reply.type === "group"
            ? "groupMessageInput"
            : "messageInput";


    const input =
        document.getElementById(inputId);

    if (!input) return;


    const area =
        input.closest(".message-area");

    if (!area) return;


    const preview =
        document.createElement("div");

    preview.id =
        "fchatReplyPreview";

    preview.className =
        "fchat-reply-preview";


    const info =
        document.createElement("div");

    info.className =
        "fchat-reply-info";


    info.innerHTML = `

        <div class="fchat-reply-name">
            ${reply.sender}
        </div>

        <div class="fchat-reply-text">
            ${reply.message}
        </div>

    `;


    const cancel =
        document.createElement("button");

    cancel.className =
        "fchat-reply-cancel";

    cancel.innerText = "×";


    cancel.onclick = function () {

        fchatCancelReply();

    };


    preview.appendChild(info);
    preview.appendChild(cancel);


    area.parentNode.insertBefore(
        preview,
        area
    );


    input.focus();

}


// ==========================================
// CANCEL REPLY
// ==========================================

function fchatCancelReply() {

    window.fchatReplyData = null;


    const preview =
        document.getElementById(
            "fchatReplyPreview"
        );


    if (preview) {

        preview.remove();

    }

}


// ==========================================
// ADD REPLY BOX
// ==========================================

function fchatAddReplyBox(
    element,
    replyId,
    sender,
    message,
    type
) {

    if (
        element.querySelector(
            ".fchat-replied-box"
        )
    ) return;


    const box =
        document.createElement("div");

    box.className =
        "fchat-replied-box";


    box.innerHTML = `

        <div class="fchat-replied-name">
            ${sender}
        </div>

        <div class="fchat-replied-text">
            ${message}
        </div>

    `;


    box.onclick = function () {

        const original =
            fchatGetMessageElement(
                replyId,
                type
            );


        if (original) {

            original.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }

    };


    const textElement =

        element.querySelector(
            ".message-text"
        )

        ||

        element.querySelector(
            ".group-message-text"
        );


    if (textElement) {

        element.insertBefore(
            box,
            textElement
        );

    }

    else {

        element.prepend(box);

    }

}


// ==========================================
// LOAD REPLIED MESSAGE
// ==========================================

async function fchatLoadReply(
    msg,
    element,
    type
) {

    if (!msg.reply_to) return;


    let table =
        "messagess";


    if (type === "group") {

        table =
            "fchat_group_messages";

    }


    const {
        data,
        error
    } = await supabaseClient
        .from(table)
        .select("*")
        .eq(
            "id",
            msg.reply_to
        )
        .maybeSingle();


    if (
        error ||
        !data
    ) return;


    fchatAddReplyBox(

        element,

        msg.reply_to,

        data.sender,

        data.message,

        type

    );

}


// ==========================================
// OVERRIDE PERSONAL DISPLAY
// ==========================================

if (
    typeof displayMessage === "function"
) {

    const originalDisplayMessageFeatures2 =
        displayMessage;


    displayMessage =
        function (msg) {


            originalDisplayMessageFeatures2(
                msg
            );


            const element =
                fchatGetMessageElement(
                    msg.id,
                    "personal"
                );


            if (!element) return;


            fchatAddTools(

                element,

                msg.id,

                "personal"

            );


            fchatLoadReply(

                msg,

                element,

                "personal"

            );


        };

}


// ==========================================
// OVERRIDE GROUP DISPLAY
// ==========================================

if (
    typeof displayGroupMessage === "function"
) {

    const originalDisplayGroupMessageFeatures2 =
        displayGroupMessage;


    displayGroupMessage =
        function (msg) {


            originalDisplayGroupMessageFeatures2(
                msg
            );


            const element =
                fchatGetMessageElement(
                    msg.id,
                    "group"
                );


            if (!element) return;


            fchatAddTools(

                element,

                msg.id,

                "group"

            );


            fchatLoadReply(

                msg,

                element,

                "group"

            );


        };

}


// ==========================================
// OVERRIDE PERSONAL SEND
// ==========================================

if (
    typeof sendMessage === "function"
) {

    const originalSendMessageFeatures2 =
        sendMessage;


    sendMessage =
        async function () {


            const reply =
                window.fchatReplyData;


            // NORMAL MESSAGE

            if (

                !reply ||

                reply.type !== "personal"

            ) {


                return originalSendMessageFeatures2();


            }


            const input =
                document.getElementById(
                    "messageInput"
                );


            if (!input) return;


            const message =
                input.value.trim();


            if (!message) return;


            const {
                data,
                error
            } = await supabaseClient

                .from("messagess")

                .insert({

                    sender: currentUser,

                    receiver: currentChat,

                    message: message,

                    reply_to: reply.id

                })

                .select();


            if (error) {

                alert(error.message);

                return;

            }


            input.value = "";


            fchatCancelReply();


            if (
                data &&
                data[0]
            ) {

                displayMessage(
                    data[0]
                );

            }


        };

}


// ==========================================
// OVERRIDE GROUP SEND
// ==========================================

if (
    typeof sendGroupMessage === "function"
) {

    const originalSendGroupMessageFeatures2 =
        sendGroupMessage;


    sendGroupMessage =
        async function () {


            const reply =
                window.fchatReplyData;


            // NORMAL MESSAGE

            if (

                !reply ||

                reply.type !== "group"

            ) {


                return originalSendGroupMessageFeatures2();


            }


            const input =
                document.getElementById(
                    "groupMessageInput"
                );


            if (!input) return;


            const message =
                input.value.trim();


            if (!message) return;


            const {
                data,
                error
            } = await supabaseClient

                .from(
                    "fchat_group_messages"
                )

                .insert({

                    group_id:
                        window.currentGroupId,

                    sender:
                        currentUser,

                    message:
                        message,

                    reply_to:
                        reply.id

                })

                .select();


            if (error) {

                alert(error.message);

                return;

            }


            input.value = "";


            fchatCancelReply();


            if (
                data &&
                data[0]
            ) {

                displayGroupMessage(
                    data[0]
                );

            }


        };

}


// ==========================================
// WATCH FOR NEW MESSAGES
// ==========================================

setInterval(
    function () {


        // ==============================
        // PERSONAL MESSAGES
        // ==============================

        document
            .querySelectorAll(
                "[data-message-id]"
            )
            .forEach(
                function (element) {


                    const id =
                        element.getAttribute(
                            "data-message-id"
                        );


                    if (id) {

                        fchatAddTools(

                            element,

                            id,

                            "personal"

                        );

                    }


                }
            );


        // ==============================
        // GROUP MESSAGES
        // ==============================

        document
            .querySelectorAll(
                "[data-group-message-id]"
            )
            .forEach(
                function (element) {


                    const id =
                        element.getAttribute(
                            "data-group-message-id"
                        );


                    if (id) {

                        fchatAddTools(

                            element,

                            id,

                            "group"

                        );

                    }


                }
            );


    },

    1000
);


// ==========================================
// F CHAT FEATURES 2 END
// ==========================================


        


       

                


                    

        


                    