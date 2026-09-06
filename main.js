// ==========================================
// #F CHAT - MAIN.JS
// PART 1 / 6
// SETUP + SCREENS + SIGNUP
// ==========================================


// ==========================================
// SUPABASE SETUP
// ==========================================

const SUPABASE_URL =
    "https://nltckcltknnzclqprxsc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_vaJh3MXDOuCZ5Jl9GSeZTQ_QXbRfW8Q";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let adminUsername = "admin";

let adminPassword = "admin123";


let currentUser = "";

let currentChat = "";

let currentChannel = null;


// ==========================================
// SHOW SIGNUP SCREEN
// ==========================================

function showSignup() {

    const userLogin =
        document.getElementById(
            "userLogin"
        );

    const adminLogin =
        document.getElementById(
            "adminLogin"
        );

    const signup =
        document.getElementById(
            "signup"
        );

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    const result =
        document.getElementById(
            "result"
        );


    if (userLogin) {

        userLogin.style.display =
            "none";
    }


    if (adminLogin) {

        adminLogin.style.display =
            "none";
    }


    if (signup) {

        signup.style.display =
            "block";
    }


    if (pageTitle) {

        pageTitle.innerText =
            "Create Account";
    }


    if (result) {

        result.innerText =
            "";
    }
}


// ==========================================
// SHOW USER LOGIN SCREEN
// ==========================================

function showUserLogin() {

    const userLogin =
        document.getElementById(
            "userLogin"
        );

    const adminLogin =
        document.getElementById(
            "adminLogin"
        );

    const signup =
        document.getElementById(
            "signup"
        );

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    const result =
        document.getElementById(
            "result"
        );


    if (userLogin) {

        userLogin.style.display =
            "block";
    }


    if (adminLogin) {

        adminLogin.style.display =
            "none";
    }


    if (signup) {

        signup.style.display =
            "none";
    }


    if (pageTitle) {

        pageTitle.innerText =
            "User Login";
    }


    if (result) {

        result.innerText =
            "";
    }
}


// ==========================================
// SHOW ADMIN LOGIN SCREEN
// ==========================================

function showAdminLogin() {

    const userLogin =
        document.getElementById(
            "userLogin"
        );

    const adminLogin =
        document.getElementById(
            "adminLogin"
        );

    const signup =
        document.getElementById(
            "signup"
        );

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    const result =
        document.getElementById(
            "result"
        );


    if (userLogin) {

        userLogin.style.display =
            "none";
    }


    if (signup) {

        signup.style.display =
            "none";
    }


    if (adminLogin) {

        adminLogin.style.display =
            "block";
    }


    if (pageTitle) {

        pageTitle.innerText =
            "Admin Login";
    }


    if (result) {

        result.innerText =
            "";
    }
}


// ==========================================
// CREATE ACCOUNT - SUPABASE
// ==========================================

async function createAccount() {

    const usernameElement =
        document.getElementById(
            "newUsername"
        );

    const passwordElement =
        document.getElementById(
            "newPassword"
        );

    const confirmElement =
        document.getElementById(
            "confirmPassword"
        );

    const result =
        document.getElementById(
            "result"
        );


    // ELEMENT CHECK

    if (
        !usernameElement ||
        !passwordElement ||
        !confirmElement ||
        !result
    ) {

        console.error(
            "Signup elements nahi mile."
        );

        return;
    }


    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value;

    const confirmPassword =
        confirmElement.value;


    // EMPTY CHECK

    if (
        !username ||
        !password ||
        !confirmPassword
    ) {

        result.innerText =
            "⚠️ Sab fields bharo.";

        return;
    }


    // USERNAME VALIDATION

    if (
        !/^[a-zA-Z0-9_]+$/.test(
            username
        )
    ) {

        result.innerText =
            "⚠️ Username me sirf letters, numbers aur _ use karo.";

        return;
    }


    // PASSWORD MATCH

    if (
        password !== confirmPassword
    ) {

        result.innerText =
            "❌ Password match nahi kar raha.";

        return;
    }


    result.innerText =
        "⏳ Account create ho raha hai...";


    try {

        // ----------------------------------
        // CHECK EXISTING USER
        // ----------------------------------

        const {
            data: existingUser,
            error: checkError
        } =
            await supabaseClient
            .from("fchat_users")
            .select("id")
            .eq(
                "username",
                username
            )
            .maybeSingle();


        if (checkError) {

            console.error(
                checkError
            );

            result.innerText =
                "❌ Database error: " +
                checkError.message;

            return;
        }


        if (existingUser) {

            result.innerText =
                "❌ Username already exist karta hai.";

            return;
        }


        // ----------------------------------
        // CREATE USER
        // ----------------------------------

        const {
            error: insertError
        } =
            await supabaseClient
            .from("fchat_users")
            .insert({

                username:
                    username,

                password:
                    password,

                approved:
                    false

            });


        if (insertError) {

            console.error(
                insertError
            );

            result.innerText =
                "❌ Account create nahi hua: " +
                insertError.message;

            return;
        }


        // SUCCESS

        result.innerText =
            "✅ Account created! Admin approval ka wait karo.";


        usernameElement.value =
            "";

        passwordElement.value =
            "";

        confirmElement.value =
            "";


    } catch (error) {

        console.error(error);

        result.innerText =
            "❌ Unexpected error aaya.";
    }
}


// ==========================================
// PART 1 END
// ==========================================
// ===============================
// #F CHAT - MAIN.JS
// PART 2 / 6
// ===============================


// ===============================
// USER LOGIN - SUPABASE
// ===============================

async function login() {

    const usernameElement =
        document.getElementById(
            "username"
        );

    const passwordElement =
        document.getElementById(
            "password"
        );

    const result =
        document.getElementById(
            "result"
        );


    if (
        !usernameElement ||
        !passwordElement ||
        !result
    ) {

        return;
    }


    const username =
        usernameElement.value
        .trim();

    const password =
        passwordElement.value;


    // ---------- EMPTY CHECK ----------

    if (
        !username ||
        !password
    ) {

        result.innerText =
            "⚠️ Username aur password bharo.";

        return;
    }


    // ---------- ADMIN CHECK ----------

    if (
        username === adminUsername
    ) {

        result.innerText =
            "⚠️ Admin Login button use karo.";

        return;
    }


    result.innerText =
        "⏳ Login ho raha hai...";


    // ---------- FIND USER ----------

    const {
        data,
        error
    } =
        await supabaseClient
        .from("fchat_users")
        .select("*")
        .eq(
            "username",
            username
        )
        .maybeSingle();


    // ---------- DATABASE ERROR ----------

    if (error) {

        console.log(error);

        result.innerText =
            "❌ Database error: " +
            error.message;

        return;
    }


    // ---------- USER NOT FOUND ----------

    if (!data) {

        result.innerText =
            "❌ Account nahi mila.";

        return;
    }


    // ---------- PASSWORD CHECK ----------

    if (
        data.password !==
        password
    ) {

        result.innerText =
            "❌ Wrong password.";

        return;
    }


    // ---------- APPROVAL CHECK ----------

    if (
        data.approved !== true
    ) {

        result.innerText =
            "⏳ Admin approval pending hai.";

        return;
    }


    // ---------- LOGIN SUCCESS ----------

    currentUser =
        data.username;


    // Save login locally

    localStorage.setItem(
        "FChatCurrentUser",
        currentUser
    );


    result.innerText =
        "✅ Login successful!";


    showUserPanel(
        currentUser
    );
}


// ===============================
// CREATE ACCOUNT - SUPABASE
// ===============================

async function createAccount() {

    const usernameElement =
        document.getElementById(
            "newUsername"
        );

    const passwordElement =
        document.getElementById(
            "newPassword"
        );

    const confirmElement =
        document.getElementById(
            "confirmPassword"
        );

    const result =
        document.getElementById(
            "result"
        );


    if (
        !usernameElement ||
        !passwordElement ||
        !confirmElement ||
        !result
    ) {

        return;
    }


    const username =
        usernameElement.value
        .trim();

    const password =
        passwordElement.value;

    const confirmPassword =
        confirmElement.value;


    // ---------- EMPTY CHECK ----------

    if (
        !username ||
        !password ||
        !confirmPassword
    ) {

        result.innerText =
            "⚠️ Sab fields bharo.";

        return;
    }


    // ---------- USERNAME FORMAT ----------

    if (
        !/^[a-zA-Z0-9_]+$/
        .test(username)
    ) {

        result.innerText =
            "⚠️ Username me sirf letters, numbers aur _ use karo.";

        return;
    }


    // ---------- PASSWORD MATCH ----------

    if (
        password !==
        confirmPassword
    ) {

        result.innerText =
            "❌ Password match nahi kar raha.";

        return;
    }


    // ---------- ADMIN USERNAME BLOCK ----------

    if (
        username === adminUsername
    ) {

        result.innerText =
            "❌ Ye username allowed nahi hai.";

        return;
    }


    // ---------- LOADING ----------

    result.innerText =
        "⏳ Account create ho raha hai...";


    // ===============================
    // CHECK EXISTING USER
    // ===============================

    const {
        data: existingUser,
        error: checkError
    } =
        await supabaseClient
        .from("fchat_users")
        .select("id")
        .eq(
            "username",
            username
        )
        .maybeSingle();


    if (checkError) {

        console.log(
            checkError
        );

        result.innerText =
            "❌ Database error: " +
            checkError.message;

        return;
    }


    // ---------- USER EXISTS ----------

    if (existingUser) {

        result.innerText =
            "❌ Username already exist karta hai.";

        return;
    }


    // ===============================
    // CREATE USER
    // ===============================

    const {
        error: insertError
    } =
        await supabaseClient
        .from("fchat_users")
        .insert({

            username:
                username,

            password:
                password,

            approved:
                false

        });


    // ---------- INSERT ERROR ----------

    if (insertError) {

        console.log(
            insertError
        );

        result.innerText =
            "❌ Account create nahi hua: " +
            insertError.message;

        return;
    }


    // ---------- SUCCESS ----------

    result.innerText =
        "✅ Account created! Admin approval ka wait karo.";


    usernameElement.value =
        "";

    passwordElement.value =
        "";

    confirmElement.value =
        "";
}


// ===============================
// USER HOME PANEL
// ===============================

function showUserPanel(username) {

    document.body.innerHTML = `

        <div class="chat-app">

            <div class="chat-header">

                <div>

                    <h2>
                        #F Chat
                    </h2>

                    <small>
                        Welcome, ${username}
                    </small>

                </div>


                <button
                    onclick="logout()"
                >
                    Logout
                </button>

            </div>


            <div class="chat-body">


                <!-- PROFILE -->

                <div class="profile-box">

                    <h3>
                        👤 ${username}
                    </h3>

                    <p>
                        Account Approved ✅
                    </p>

                </div>


                <!-- SEARCH -->

                <input

                    id="searchBox"

                    type="text"

                    placeholder="Search users..."

                    oninput="searchContacts()"

                >


                <!-- CHAT LIST -->

                <div class="chat-list">

                    <h3>
                        Chats
                    </h3>


                    <div
                        id="contacts"
                    >

                        <p>
                            Loading users...
                        </p>

                    </div>

                </div>


                <!-- PASSWORD -->

                <button

                    class="password-button"

                    onclick="changePassword()"

                >

                    🔑 Change Password

                </button>


            </div>

        </div>
    `;


    // Load approved users

    loadContacts();
}


// ===============================
// LOAD CONTACTS - SUPABASE
// ===============================

async function loadContacts() {

    const contacts =
        document.getElementById(
            "contacts"
        );


    if (!contacts) {

        return;
    }


    contacts.innerHTML =
        "<p>Loading users...</p>";


    // ===============================
    // GET APPROVED USERS
    // ===============================

    const {
        data,
        error
    } =
        await supabaseClient
        .from("fchat_users")
        .select(
            "id, username, approved"
        )
        .eq(
            "approved",
            true
        )
        .order(
            "username",
            {
                ascending: true
            }
        );


    // ---------- ERROR ----------

    if (error) {

        console.log(error);


        contacts.innerHTML =
            "<p>❌ Users load nahi hue.</p>";

        return;
    }


    // Clear loading

    contacts.innerHTML =
        "";


    let found =
        false;


    // ===============================
    // CREATE CONTACT LIST
    // ===============================

    data.forEach(
        function(user) {


            // Don't show yourself

            if (
                user.username ===
                currentUser
            ) {

                return;
            }


            found =
                true;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "chat-item";


            // Avatar

            const avatar =
                document.createElement(
                    "div"
                );


            avatar.className =
                "chat-avatar";


            avatar.innerText =
                "💬";


            // Info box

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "chat-info";


            // Username

            const name =
                document.createElement(
                    "b"
                );


            name.innerText =
                user.username;


            // Subtitle

            const subtitle =
                document.createElement(
                    "p"
                );


            subtitle.innerText =
                "Tap to chat";


            // Add elements

            info.appendChild(
                name
            );


            info.appendChild(
                subtitle
            );


            item.appendChild(
                avatar
            );


            item.appendChild(
                info
            );


            // ===============================
            // OPEN CHAT
            // ===============================

            item.onclick =
                function() {

                    openChat(
                        user.username
                    );

                };


            contacts.appendChild(
                item
            );

        }
    );


    // ===============================
    // NO USERS
    // ===============================

    if (!found) {

        contacts.innerHTML =
            "<p>No approved users yet.</p>";

    }
}


// ===============================
// SEARCH CONTACTS
// ===============================

function searchContacts() {

    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (!searchBox) {

        return;
    }


    const search =
        searchBox.value
        .toLowerCase()
        .trim();


    const items =
        document.querySelectorAll(
            ".chat-item"
        );


    items.forEach(
        function(item) {


            const nameElement =
                item.querySelector(
                    ".chat-info b"
                );


            if (!nameElement) {

                return;
            }


            const name =
                nameElement.innerText
                .toLowerCase();


            if (
                name.includes(
                    search
                )
            ) {

                item.style.display =
                    "flex";

            } else {

                item.style.display =
                    "none";

            }

        }
    );
}


// ===============================
// OPEN CHAT
// ===============================

function openChat(username) {


    // Save current chat

    currentChat =
        username;


    // ===============================
    // REMOVE OLD REALTIME CHANNEL
    // ===============================

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );


        currentChannel =
            null;
    }


    // ===============================
    // CHAT SCREEN
    // ===============================

    document.body.innerHTML = `

        <div class="chat-screen">


            <!-- TOP BAR -->

            <div class="chat-top">


                <button
                    onclick="backToHome()"
                >

                    ←

                </button>


                <div class="chat-avatar">

                    💬

                </div>


                <div>

                    <h3>

                        ${username}

                    </h3>


                    <small>

                        online

                    </small>

                </div>


            </div>


            <!-- MESSAGES -->

            <div

                id="messages"

                class="messages"

            >

                <p>

                    Loading messages...

                </p>

            </div>


            <!-- MESSAGE AREA -->

            <div

                class="message-area"

            >


                <input

                    id="messageInput"

                    type="text"

                    placeholder="Type a message..."

                    autocomplete="off"

                    onkeydown="handleMessageKey(event)"

                >


                <button

                    onclick="sendMessage()"

                >

                    ➤

                </button>


            </div>


        </div>
    `;


    // ===============================
    // LOAD CHAT MESSAGES
    // ===============================

    loadMessages();


    // ===============================
    // START REALTIME
    // ===============================

    startRealtime();


    // ===============================
    // FOCUS INPUT
    // ===============================

    setTimeout(

        function() {


            const input =
                document.getElementById(
                    "messageInput"
                );


            if (input) {

                input.focus();

            }


        },

        100

    );

}


// ===============================
// PART 2 END
// ===============================
// ===============================
// #F CHAT - MAIN.JS
// PART 3 / 6
// MESSAGES SYSTEM
// ===============================


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );

    if (!input) return;


    const message =
        input.value.trim();


    if (!message) return;


    if (
        !currentUser ||
        !currentChat
    ) {

        alert(
            "❌ Chat properly open nahi hai."
        );

        return;
    }


    // Disable input temporarily

    input.disabled =
        true;


    const sendButton =
        document.querySelector(
            ".message-area button"
        );

    if (sendButton) {

        sendButton.disabled =
            true;
    }


    // Insert message in Supabase

    const {
        data,
        error
    } =
        await supabaseClient
        .from("messagess")
        .insert({

            sender:
                currentUser,

            receiver:
                currentChat,

            message:
                message

        })
        .select();


    // Enable input again

    input.disabled =
        false;


    if (sendButton) {

        sendButton.disabled =
            false;
    }


    if (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "❌ Message send nahi hua.\n\n" +
            error.message
        );

        input.focus();

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        console.warn(
            "Message inserted but no data returned."
        );

        input.value =
            "";

        input.focus();

        return;
    }


    // Display immediately
    // Duplicate check realtime se duplicate
    // message nahi aane dega

    displayMessage(
        data[0]
    );


    // Clear input

    input.value =
        "";


    input.focus();

}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages() {

    const messagesBox =
        document.getElementById(
            "messages"
        );


    if (!messagesBox) {

        return;
    }


    messagesBox.innerHTML =
        `
        <p
            style="
                text-align:center;
                color:#8696a0;
            "
        >
            Loading messages...
        </p>
        `;


    if (
        !currentUser ||
        !currentChat
    ) {

        messagesBox.innerHTML =
            `
            <p>
                ❌ Chat open nahi hai.
            </p>
            `;

        return;
    }


    // Load all messages
    // Filtering JavaScript me ho rahi hai

    const {
        data,
        error
    } =
        await supabaseClient
        .from("messagess")
        .select("*")
        .order(
            "created_at",
            {
                ascending:
                    true
            }
        );


    if (error) {

        console.error(
            "Load messages error:",
            error
        );


        messagesBox.innerHTML =
            `
            <p
                style="
                    text-align:center;
                    color:red;
                "
            >
                ❌ Messages load nahi hue.
            </p>
            `;

        return;
    }


    // Clear loading message

    messagesBox.innerHTML =
        "";


    let found =
        false;


    if (
        !data ||
        data.length === 0
    ) {

        messagesBox.innerHTML =
            `
            <p
                style="
                    text-align:center;
                    color:#8696a0;
                "
            >
                No messages yet.
            </p>
            `;

        return;
    }


    data.forEach(
        function(msg) {


            const isMyMessage =

                msg.sender ===
                currentUser

                &&

                msg.receiver ===
                currentChat;


            const isTheirMessage =

                msg.sender ===
                currentChat

                &&

                msg.receiver ===
                currentUser;


            if (

                isMyMessage ||

                isTheirMessage

            ) {


                found =
                    true;


                displayMessage(
                    msg
                );

            }

        }
    );


    if (!found) {

        messagesBox.innerHTML =
            `
            <p
                style="
                    text-align:center;
                    color:#8696a0;
                "
            >
                No messages yet.
            </p>
            `;

    }


    // Scroll bottom

    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ===============================
// FORMAT MESSAGE TIME
// ===============================

function formatMessageTime(
    createdAt
) {

    const date =
        createdAt
        ? new Date(createdAt)
        : new Date();


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    let hours =
        date.getHours();


    let minutes =
        date.getMinutes();


    const ampm =

        hours >= 12
        ? "PM"
        : "AM";


    hours =
        hours % 12 || 12;


    minutes =
        minutes < 10
        ? "0" + minutes
        : minutes;


    return (

        hours +

        ":" +

        minutes +

        " " +

        ampm

    );

}


// ===============================
// DISPLAY MESSAGE
// UPDATED VERSION
// ===============================

function displayMessage(msg) {

    const messagesBox =
        document.getElementById(
            "messages"
        );


    if (!messagesBox) {

        return;
    }


    if (!msg) {

        return;
    }


    // ===============================
    // DUPLICATE CHECK
    // ===============================

    if (

        msg.id !== undefined &&

        msg.id !== null

    ) {


        const existingMessage =

            messagesBox.querySelector(

                `[data-message-id="${msg.id}"]`

            );


        if (existingMessage) {

            return;

        }

    }


    // ===============================
    // REMOVE "NO MESSAGES YET"
    // ===============================

    const noMessageText =

        messagesBox.querySelector(
            ".no-messages"
        );


    if (noMessageText) {

        noMessageText.remove();

    }


    // Also remove simple placeholder

    const paragraphs =
        messagesBox.querySelectorAll(
            "p"
        );


    paragraphs.forEach(
        function(p) {

            const text =
                p.innerText.trim();


            if (

                text ===
                "No messages yet."

                ||

                text ===
                "Loading messages..."

            ) {

                p.remove();

            }

        }
    );


    // ===============================
    // CREATE MESSAGE
    // ===============================

    const messageDiv =
        document.createElement(
            "div"
        );


    const isMyMessage =

        msg.sender ===
        currentUser;


    messageDiv.className =

        isMyMessage

        ? "message sent"

        : "message received";


    // ===============================
    // MESSAGE ID
    // ===============================

    if (

        msg.id !== undefined &&

        msg.id !== null

    ) {


        messageDiv.setAttribute(

            "data-message-id",

            msg.id

        );

    }


    // ===============================
    // MESSAGE TEXT CONTAINER
    // ===============================

    const textSpan =
        document.createElement(
            "span"
        );


    textSpan.className =
        "message-text";


    // IMPORTANT:
    // textContent use kiya hai
    // innerHTML nahi
    // Isse user HTML inject nahi kar sakta

    textSpan.textContent =
        msg.message || "";


    // ===============================
    // MESSAGE TIME
    // ===============================

    const timeSpan =
        document.createElement(
            "span"
        );


    timeSpan.className =
        "message-time";


    timeSpan.textContent =
        formatMessageTime(
            msg.created_at
        );


    // ===============================
    // EDITED LABEL
    // ===============================

    if (

        msg.edited === true ||

        msg.is_edited === true

    ) {


        const editedSpan =
            document.createElement(
                "span"
            );


        editedSpan.className =
            "edited-label";


        editedSpan.textContent =
            " edited";


        timeSpan.appendChild(
            editedSpan
        );

    }


    // ===============================
    // ADD TEXT + TIME
    // ===============================

    messageDiv.appendChild(
        textSpan
    );


    messageDiv.appendChild(
        timeSpan
    );


    // ===============================
    // EDIT + DELETE BUTTONS
    // ONLY OWN MESSAGES
    // ===============================

    if (isMyMessage) {


        // ---------- EDIT ----------

        const editBtn =
            document.createElement(
                "button"
            );


        editBtn.type =
            "button";


        editBtn.innerText =
            "✏️";


        editBtn.className =
            "edit-message-btn";


        editBtn.title =
            "Edit message";


        editBtn.onclick =
            function(event) {


                event.stopPropagation();


                editMessage(

                    msg.id,

                    msg.message

                );

            };


        // ---------- DELETE ----------

        const deleteBtn =
            document.createElement(
                "button"
            );


        deleteBtn.type =
            "button";


        deleteBtn.innerText =
            "🗑️";


        deleteBtn.className =
            "delete-message-btn";


        deleteBtn.title =
            "Delete message";


        deleteBtn.onclick =
            function(event) {


                event.stopPropagation();


                deleteMessage(
                    msg.id
                );

            };


        messageDiv.appendChild(
            editBtn
        );


        messageDiv.appendChild(
            deleteBtn
        );

    }


    // ===============================
    // ADD MESSAGE TO CHAT
    // ===============================

    messagesBox.appendChild(
        messageDiv
    );


    // ===============================
    // SCROLL TO BOTTOM
    // ===============================

    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ===============================
// EDIT MESSAGE
// ===============================

async function editMessage(
    messageId,
    oldMessage
) {


    if (

        messageId === undefined ||

        messageId === null

    ) {


        alert(
            "❌ Message ID nahi mila."
        );

        return;

    }


    const newMessage =
        prompt(

            "Message edit karo:",

            oldMessage

        );


    // Cancel pressed

    if (
        newMessage === null
    ) {

        return;

    }


    const cleanedMessage =
        newMessage.trim();


    if (!cleanedMessage) {

        alert(
            "❌ Message empty nahi ho sakta."
        );

        return;

    }


    if (
        cleanedMessage ===
        oldMessage
    ) {

        return;

    }


    // ===============================
    // UPDATE SUPABASE
    // ===============================

    const {
        data,
        error
    } =

        await supabaseClient

        .from("messagess")

        .update({

            message:
                cleanedMessage

        })

        .eq(
            "id",
            messageId
        )

        .eq(
            "sender",
            currentUser
        )

        .select();


    if (error) {

        console.error(
            "Edit error:",
            error
        );


        alert(

            "❌ Message update nahi hua.\n\n" +

            error.message

        );

        return;

    }


    if (

        !data ||

        data.length === 0

    ) {


        alert(
            "❌ Message update nahi hua."
        );

        return;

    }


    // ===============================
    // UPDATE MESSAGE ON SCREEN
    // ===============================

    const messageElement =

        document.querySelector(

            `[data-message-id="${messageId}"]`

        );


    if (messageElement) {


        const textElement =

            messageElement.querySelector(

                ".message-text"

            );


        if (textElement) {


            textElement.textContent =
                cleanedMessage;

        }

    }


    console.log(
        "Message updated successfully."
    );

}


// ===============================
// DELETE MESSAGE
// ===============================

async function deleteMessage(
    messageId
) {


    if (

        messageId === undefined ||

        messageId === null

    ) {


        alert(
            "❌ Message ID nahi mila."
        );

        return;

    }


    const confirmDelete =

        confirm(

            "Kya ye message delete karna hai?"

        );


    if (!confirmDelete) {

        return;

    }


    // ===============================
    // DELETE FROM SUPABASE
    // ===============================

    const {
        error
    } =

        await supabaseClient

        .from("messagess")

        .delete()

        .eq(
            "id",
            messageId
        )

        .eq(
            "sender",
            currentUser
        );


    if (error) {


        console.error(
            "Delete error:",
            error
        );


        alert(

            "❌ Message delete nahi hua.\n\n" +

            error.message

        );

        return;

    }


    // ===============================
    // REMOVE FROM SCREEN
    // ===============================

    const messageElement =

        document.querySelector(

            `[data-message-id="${messageId}"]`

        );


    if (messageElement) {


        messageElement.remove();

    }


    // ===============================
    // CHECK IF NO MESSAGES LEFT
    // ===============================

    const messagesBox =

        document.getElementById(
            "messages"
        );


    if (messagesBox) {


        const remainingMessages =

            messagesBox.querySelectorAll(
                ".message"
            );


        if (
            remainingMessages.length === 0
        ) {


            messagesBox.innerHTML =

                `
                <p
                    class="no-messages"
                    style="
                        text-align:center;
                        color:#8696a0;
                    "
                >
                    No messages yet.
                </p>
                `;

        }

    }


    console.log(
        "Message deleted successfully."
    );

}


// ===============================
// START REALTIME
// ===============================

function startRealtime() {


    // ===============================
    // REMOVE OLD CHANNEL
    // ===============================

    if (currentChannel) {


        supabaseClient.removeChannel(
            currentChannel
        );


        currentChannel =
            null;

    }


    if (

        !currentUser ||

        !currentChat

    ) {

        return;

    }


    // ===============================
    // CREATE UNIQUE CHANNEL
    // ===============================

    currentChannel =

        supabaseClient

        .channel(

            "FChat-" +

            currentUser +

            "-" +

            currentChat +

            "-" +

            Date.now()

        );


    // ===============================
    // INSERT REALTIME
    // ===============================

    currentChannel.on(

        "postgres_changes",

        {

            event:
                "INSERT",

            schema:
                "public",

            table:
                "messagess"

        },


        function(payload) {


            const msg =
                payload.new;


            if (!msg) {

                return;

            }


            const isMyMessage =

                msg.sender ===
                currentUser

                &&

                msg.receiver ===
                currentChat;


            const isTheirMessage =

                msg.sender ===
                currentChat

                &&

                msg.receiver ===
                currentUser;


            if (

                isMyMessage ||

                isTheirMessage

            ) {


                displayMessage(
                    msg
                );

            }

        }

    );


    // ===============================
    // UPDATE REALTIME
    // ===============================

    currentChannel.on(

        "postgres_changes",

        {

            event:
                "UPDATE",

            schema:
                "public",

            table:
                "messagess"

        },


        function(payload) {


            const msg =
                payload.new;


            if (!msg) {

                return;

            }


            const messageElement =

                document.querySelector(

                    `[data-message-id="${msg.id}"]`

                );


            if (!messageElement) {

                return;

            }


            const textElement =

                messageElement.querySelector(

                    ".message-text"

                );


            if (textElement) {


                textElement.textContent =
                    msg.message || "";

            }


            console.log(
                "Realtime message updated."
            );

        }

    );


    // ===============================
    // DELETE REALTIME
    // ===============================

    currentChannel.on(

        "postgres_changes",

        {

            event:
                "DELETE",

            schema:
                "public",

            table:
                "messagess"

        },


        function(payload) {


            const oldMessage =
                payload.old;


            if (!oldMessage) {

                return;

            }


            const messageElement =

                document.querySelector(

                    `[data-message-id="${oldMessage.id}"]`

                );


            if (messageElement) {


                messageElement.remove();

            }


            console.log(
                "Realtime message deleted."
            );

        }

    );


    // ===============================
    // SUBSCRIBE
    // ===============================

    currentChannel.subscribe(

        function(status) {


            console.log(

                "Realtime status:",

                status

            );

        }

    );

}


// ===============================
// ENTER TO SEND
// ===============================

function handleMessageKey(
    event
) {


    if (

        event.key ===
        "Enter"

    ) {


        event.preventDefault();


        sendMessage();

    }

}


// ===============================
// PART 3 END
// ===============================
// ===============================
// #F CHAT - MAIN.JS
// PART 4 / 6
// ===============================


// ===============================
// REALTIME MESSAGES
// ===============================

function startRealtime() {

    // Purana realtime channel remove
    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel = null;
    }


    // Unique realtime channel
    currentChannel =
        supabaseClient
        .channel(
            "FChat-" +
            currentUser +
            "-" +
            currentChat +
            "-" +
            Date.now()
        )
        .on(

            "postgres_changes",

            {

                event: "INSERT",

                schema: "public",

                table: "messagess"

            },

            function(payload) {

                const msg =
                    payload.new;


                // Sirf current chat ke messages
                const isMyMessage =
                    msg.sender === currentUser &&
                    msg.receiver === currentChat;


                const isTheirMessage =
                    msg.sender === currentChat &&
                    msg.receiver === currentUser;


                if (
                    isMyMessage ||
                    isTheirMessage
                ) {

                    displayMessage(msg);
                }

            }

        )
        .on(

            "postgres_changes",

            {

                event: "UPDATE",

                schema: "public",

                table: "messagess"

            },

            function(payload) {

                const msg =
                    payload.new;


                const isMyMessage =
                    msg.sender === currentUser &&
                    msg.receiver === currentChat;


                const isTheirMessage =
                    msg.sender === currentChat &&
                    msg.receiver === currentUser;


                if (
                    isMyMessage ||
                    isTheirMessage
                ) {

                    updateDisplayedMessage(msg);
                }

            }

        )
        .on(

            "postgres_changes",

            {

                event: "DELETE",

                schema: "public",

                table: "messagess"

            },

            function(payload) {

                const oldMsg =
                    payload.old;


                if (
                    !oldMsg ||
                    oldMsg.id === undefined ||
                    oldMsg.id === null
                ) {

                    return;
                }


                const messageElement =
                    document.querySelector(
                        `[data-message-id="${oldMsg.id}"]`
                    );


                if (messageElement) {

                    messageElement.remove();
                }

            }

        )
        .subscribe(

            function(status) {

                console.log(
                    "Realtime status:",
                    status
                );

            }

        );

}


// ===============================
// UPDATE DISPLAYED MESSAGE
// ===============================

function updateDisplayedMessage(msg) {

    if (
        !msg ||
        msg.id === undefined ||
        msg.id === null
    ) {

        return;
    }


    const messageElement =
        document.querySelector(
            `[data-message-id="${msg.id}"]`
        );


    // Agar message screen par nahi hai
    if (!messageElement) {

        return;
    }


    // Pehle pura message element remove
    messageElement.remove();


    // Updated message dubara display
    displayMessage(msg);
}


// ===============================
// ENTER TO SEND MESSAGE
// ===============================

function handleMessageKey(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        sendMessage();
    }

}


// ===============================
// BACK TO HOME
// ===============================

function backToHome() {

    // Realtime channel remove
    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel = null;
    }


    currentChat =
        "";


    if (!currentUser) {

        logout();

        return;
    }


    showUserPanel(
        currentUser
    );
}


// ===============================
// CHANGE PASSWORD
// ===============================

async function changePassword() {

    if (!currentUser) {

        alert(
            "❌ User login nahi hai."
        );

        return;
    }


    const oldPassword =
        prompt(
            "Old password:"
        );


    if (
        oldPassword === null
    ) {

        return;
    }


    const newPassword =
        prompt(
            "New password:"
        );


    if (
        newPassword === null
    ) {

        return;
    }


    const cleanedPassword =
        newPassword.trim();


    if (
        !cleanedPassword
    ) {

        alert(
            "❌ New password empty nahi ho sakta."
        );

        return;
    }


    if (
        cleanedPassword.length < 4
    ) {

        alert(
            "❌ Password kam se kam 4 characters ka hona chahiye."
        );

        return;
    }


    // User ka password Supabase se check karo

    const {

        data: userData,

        error: selectError

    } =
        await supabaseClient
        .from("fchat_users")
        .select("*")
        .eq(
            "username",
            currentUser
        )
        .maybeSingle();


    if (selectError) {

        console.log(
            selectError
        );


        alert(
            "❌ User check nahi hua.\n\n" +
            selectError.message
        );

        return;
    }


    if (!userData) {

        alert(
            "❌ User nahi mila."
        );

        return;
    }


    // Old password check

    if (
        userData.password !==
        oldPassword
    ) {

        alert(
            "❌ Old password wrong hai."
        );

        return;
    }


    // Password update

    const {

        error: updateError

    } =
        await supabaseClient
        .from("fchat_users")
        .update({

            password:
                cleanedPassword

        })
        .eq(
            "username",
            currentUser
        );


    if (updateError) {

        console.log(
            updateError
        );


        alert(
            "❌ Password change nahi hua.\n\n" +
            updateError.message
        );

        return;
    }


    alert(
        "✅ Password changed successfully!"
    );
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    // Realtime channel remove

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel = null;
    }


    currentUser =
        "";


    currentChat =
        "";


    // Website reload

    location.reload();
}


// ===============================
// CLEANUP CHAT
// ===============================

function closeCurrentChat() {

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;
    }


    currentChat =
        "";
}


// ===============================
// PAGE CLOSE CLEANUP
// ===============================

window.addEventListener(

    "beforeunload",

    function() {

        if (currentChannel) {

            supabaseClient.removeChannel(
                currentChannel
            );

        }

    }

);


// ===============================
// PART 4 END
// ===============================
// ===============================
// #F CHAT - MAIN.JS
// PART 5 / 6
// ADMIN PANEL + SUPABASE USERS
// ===============================


// ===============================
// SHOW ADMIN PANEL
// ===============================

function showAdminPanel() {

    // Current user clear
    currentUser = "";

    currentChat = "";


    // Remove chat realtime if active

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel = null;
    }


    document.body.innerHTML = `

        <div class="admin-app">

            <div class="admin-header">

                <div>

                    <h1>
                        #F Chat Admin
                    </h1>

                    <small>
                        User Management
                    </small>

                </div>


                <button
                    onclick="logout()"
                >
                    Logout
                </button>

            </div>


            <div
                class="admin-controls"
            >

                <button
                    onclick="loadAdminUsers()"
                >
                    🔄 Refresh Users
                </button>

            </div>


            <h2>
                Manage Users
            </h2>


            <div
                id="adminUsers"
            >

                <p>
                    Loading users...
                </p>

            </div>

        </div>
    `;


    loadAdminUsers();
}


// ===============================
// LOAD ADMIN USERS
// ===============================

async function loadAdminUsers() {

    const box =
        document.getElementById(
            "adminUsers"
        );


    if (!box) {

        return;
    }


    box.innerHTML = `

        <p>
            ⏳ Loading users...
        </p>

    `;


    // ===============================
    // LOAD USERS FROM SUPABASE
    // ===============================

    const {

        data: users,

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Load users error:",
            error
        );


        box.innerHTML = `

            <p>
                ❌ Users load nahi hue.
            </p>

            <p>
                ${error.message}
            </p>

        `;


        return;
    }


    // ===============================
    // NO USERS
    // ===============================

    if (

        !users ||

        users.length === 0

    ) {


        box.innerHTML = `

            <p>
                No users found.
            </p>

        `;


        return;

    }


    // Clear box

    box.innerHTML =
        "";


    // ===============================
    // CREATE USER CARDS
    // ===============================

    users.forEach(
        function(user) {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-user-card";


            // ===============================
            // USERNAME
            // ===============================

            const username =
                user.username ||
                "Unknown";


            // ===============================
            // STATUS
            // ===============================

            const isApproved =
                user.approved === true;


            const statusText =
                isApproved

                ? "Approved ✅"

                : "Pending ⏳";


            // ===============================
            // CARD CONTENT
            // ===============================

            card.innerHTML = `

                <div
                    class="admin-user-info"
                >

                    <h3>
                        👤 ${escapeHTML(username)}
                    </h3>


                    <p>
                        Status:
                        <b>
                            ${statusText}
                        </b>
                    </p>


                    <small>
                        User ID:
                        ${user.id}
                    </small>

                </div>


                <div
                    class="admin-user-actions"
                >

                </div>

            `;


            // Actions container

            const actions =
                card.querySelector(
                    ".admin-user-actions"
                );


            // ===============================
            // APPROVE BUTTON
            // ===============================

            if (!isApproved) {


                const approveButton =
                    document.createElement(
                        "button"
                    );


                approveButton.innerText =
                    "✅ Approve";


                approveButton.className =
                    "approve-user-btn";


                approveButton.onclick =
                    function() {


                        approveUser(
                            user.id,
                            username
                        );

                    };


                actions.appendChild(
                    approveButton
                );

            }


            // ===============================
            // UNAPPROVE BUTTON
            // ===============================

            if (isApproved) {


                const unapproveButton =
                    document.createElement(
                        "button"
                    );


                unapproveButton.innerText =
                    "⏳ Unapprove";


                unapproveButton.className =
                    "unapprove-user-btn";


                unapproveButton.onclick =
                    function() {


                        unapproveUser(
                            user.id,
                            username
                        );

                    };


                actions.appendChild(
                    unapproveButton
                );

            }


            // ===============================
            // DELETE USER BUTTON
            // ===============================

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.innerText =
                "🗑️ Delete";


            deleteButton.className =
                "delete-user-btn";


            deleteButton.onclick =
                function() {


                    deleteUser(
                        user.id,
                        username
                    );

                };


            actions.appendChild(
                deleteButton
            );


            // Add card

            box.appendChild(
                card
            );

        }
    );

}


// ===============================
// APPROVE USER
// ===============================

async function approveUser(
    userId,
    username
) {

    if (
        !userId
    ) {

        alert(
            "❌ User ID nahi mila."
        );

        return;
    }


    const confirmApprove =
        confirm(

            "Approve user: " +
            username +
            " ?"

        );


    if (!confirmApprove) {

        return;
    }


    const {

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .update({

            approved:
                true

        })

        .eq(
            "id",
            userId
        );


    if (error) {

        console.error(
            "Approve error:",
            error
        );


        alert(

            "❌ User approve nahi hua.\n\n" +

            error.message

        );


        return;
    }


    alert(

        "✅ " +

        username +

        " approved successfully!"

    );


    // Refresh list

    loadAdminUsers();

}


// ===============================
// UNAPPROVE USER
// ===============================

async function unapproveUser(
    userId,
    username
) {

    if (!userId) {

        alert(
            "❌ User ID nahi mila."
        );

        return;
    }


    const confirmUnapprove =
        confirm(

            "Unapprove user: " +
            username +
            " ?"

        );


    if (!confirmUnapprove) {

        return;
    }


    const {

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .update({

            approved:
                false

        })

        .eq(
            "id",
            userId
        );


    if (error) {

        console.error(
            "Unapprove error:",
            error
        );


        alert(

            "❌ User unapprove nahi hua.\n\n" +

            error.message

        );


        return;
    }


    alert(

        "⏳ " +

        username +

        " is now pending approval."

    );


    // Refresh users

    loadAdminUsers();

}


// ===============================
// DELETE USER
// ===============================

async function deleteUser(
    userId,
    username
) {

    if (!userId) {

        alert(
            "❌ User ID nahi mila."
        );

        return;
    }


    const confirmDelete =
        confirm(

            "⚠️ Delete user: " +

            username +

            " ?\n\n" +

            "Ye action undo nahi hoga."

        );


    if (!confirmDelete) {

        return;
    }


    // ===============================
    // DELETE USER FROM SUPABASE
    // ===============================

    const {

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .delete()

        .eq(
            "id",
            userId
        );


    if (error) {

        console.error(
            "Delete user error:",
            error
        );


        alert(

            "❌ User delete nahi hua.\n\n" +

            error.message

        );


        return;
    }


    alert(

        "🗑️ " +

        username +

        " deleted successfully."

    );


    // Refresh list

    loadAdminUsers();

}


// ===============================
// ESCAPE HTML
// SECURITY HELPER
// ===============================

function escapeHTML(text) {

    if (
        text === undefined ||
        text === null
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// ===============================
// PART 5 END
// ===============================
// ===============================
// #F CHAT - MAIN.JS
// PART 6 / 6
// FINAL SUPABASE USER SYSTEM
// ===============================


// ===============================
// USER LOGIN - SUPABASE
// ===============================

async function login() {

    const usernameElement =
        document.getElementById(
            "username"
        );


    const passwordElement =
        document.getElementById(
            "password"
        );


    const result =
        document.getElementById(
            "result"
        );


    if (
        !usernameElement ||
        !passwordElement ||
        !result
    ) {

        return;

    }


    const username =
        usernameElement.value
        .trim();


    const password =
        passwordElement.value;


    // ===============================
    // EMPTY CHECK
    // ===============================

    if (
        !username ||
        !password
    ) {

        result.innerText =
            "⚠️ Username aur password bharo.";

        return;

    }


    // ===============================
    // ADMIN CHECK
    // ===============================

    if (
        username === adminUsername
    ) {

        result.innerText =
            "⚠️ Admin Login button use karo.";

        return;

    }


    result.innerText =
        "⏳ Login ho raha hai...";


    // ===============================
    // GET USER FROM SUPABASE
    // ===============================

    const {

        data: user,

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .select("*")

        .eq(
            "username",
            username
        )

        .maybeSingle();


    // ===============================
    // DATABASE ERROR
    // ===============================

    if (error) {

        console.error(
            "Login error:",
            error
        );


        result.innerText =

            "❌ Login error: " +

            error.message;


        return;

    }


    // ===============================
    // USER NOT FOUND
    // ===============================

    if (!user) {

        result.innerText =
            "❌ Account nahi mila.";

        return;

    }


    // ===============================
    // PASSWORD CHECK
    // ===============================

    if (
        user.password !== password
    ) {

        result.innerText =
            "❌ Wrong password.";

        return;

    }


    // ===============================
    // APPROVAL CHECK
    // ===============================

    if (
        user.approved !== true
    ) {

        result.innerText =
            "⏳ Admin approval pending hai.";

        return;

    }


    // ===============================
    // LOGIN SUCCESS
    // ===============================

    currentUser =
        user.username;


    result.innerText =
        "✅ Login successful!";


    setTimeout(

        function() {

            showUserPanel(
                currentUser
            );

        },

        300

    );

}


// ===============================
// ADMIN LOGIN - FINAL FIX
// ===============================

function adminLogin() {

    const usernameElement =
        document.getElementById(
            "adminUsername"
        );


    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    const result =
        document.getElementById(
            "result"
        );


    if (
        !usernameElement ||
        !passwordElement ||
        !result
    ) {

        return;

    }


    const username =
        usernameElement.value
        .trim();


    const password =
        passwordElement.value;


    // ===============================
    // EMPTY CHECK
    // ===============================

    if (
        !username ||
        !password
    ) {

        result.innerText =
            "⚠️ Admin Username aur Password bharo.";

        return;

    }


    // ===============================
    // ADMIN CHECK
    // ===============================

    if (

        username ===
        adminUsername

        &&

        password ===
        adminPassword

    ) {


        result.innerText =
            "";


        showAdminPanel();


    } else {


        result.innerText =

            "❌ Wrong Admin Username or Password.";

    }

}


// ===============================
// LOAD CONTACTS - SUPABASE
// ===============================

async function loadContacts() {

    const contacts =
        document.getElementById(
            "contacts"
        );


    if (!contacts) {

        return;

    }


    contacts.innerHTML =

        `
        <p
            style="
                text-align:center;
                color:#8696a0;
            "
        >
            ⏳ Loading users...
        </p>
        `;


    if (!currentUser) {

        contacts.innerHTML =

            `
            <p>
                ❌ User login nahi hai.
            </p>
            `;

        return;

    }


    // ===============================
    // LOAD APPROVED USERS
    // ===============================

    const {

        data: users,

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .select(
            "id, username, approved"
        )

        .eq(
            "approved",
            true
        )

        .order(
            "username",
            {
                ascending: true
            }
        );


    // ===============================
    // ERROR
    // ===============================

    if (error) {

        console.error(
            "Load contacts error:",
            error
        );


        contacts.innerHTML =

            `
            <p
                style="
                    text-align:center;
                    color:red;
                "
            >
                ❌ Users load nahi hue.
            </p>
            `;

        return;

    }


    // Clear loading

    contacts.innerHTML =
        "";


    let found =
        false;


    // ===============================
    // CREATE CONTACTS
    // ===============================

    if (
        users &&
        users.length > 0
    ) {


        users.forEach(
            function(user) {


                // Apne aap ko list me mat dikhao

                if (

                    user.username ===
                    currentUser

                ) {

                    return;

                }


                found =
                    true;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "chat-item";


                // Avatar

                const avatar =
                    document.createElement(
                        "div"
                    );


                avatar.className =
                    "chat-avatar";


                avatar.innerText =
                    "💬";


                // Info

                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "chat-info";


                const name =
                    document.createElement(
                        "b"
                    );


                name.textContent =
                    user.username;


                const text =
                    document.createElement(
                        "p"
                    );


                text.textContent =
                    "Tap to chat";


                info.appendChild(
                    name
                );


                info.appendChild(
                    text
                );


                item.appendChild(
                    avatar
                );


                item.appendChild(
                    info
                );


                // ===============================
                // OPEN CHAT
                // ===============================

                item.onclick =
                    function() {


                        openChat(
                            user.username
                        );

                    };


                contacts.appendChild(
                    item
                );

            }

        );

    }


    // ===============================
    // NO USERS
    // ===============================

    if (!found) {

        contacts.innerHTML =

            `
            <p
                style="
                    text-align:center;
                    color:#8696a0;
                "
            >
                No approved users yet.
            </p>
            `;

    }

}


// ===============================
// REFRESH CONTACTS
// ===============================

async function refreshContacts() {

    await loadContacts();

}


// ===============================
// USER APPROVAL CHECK
// ===============================

async function checkCurrentUserApproval() {

    if (!currentUser) {

        return false;

    }


    const {

        data: user,

        error

    } =
        await supabaseClient

        .from("fchat_users")

        .select(
            "approved"
        )

        .eq(
            "username",
            currentUser
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Approval check error:",
            error
        );


        return false;

    }


    if (!user) {

        return false;

    }


    return (
        user.approved === true
    );

}


// ===============================
// REFRESH USER PANEL
// ===============================

async function refreshUserPanel() {

    const isApproved =
        await checkCurrentUserApproval();


    if (!isApproved) {

        alert(

            "⚠️ Aapka account ab approved nahi hai."

        );


        logout();

        return;

    }


    loadContacts();

}


// ===============================
// SUPABASE CONNECTION TEST
// ===============================

async function testSupabaseConnection() {

    try {


        const {

            error

        } =
            await supabaseClient

            .from("fchat_users")

            .select("id")

            .limit(1);


        if (error) {


            console.error(

                "Supabase connection error:",

                error

            );


            return false;

        }


        console.log(

            "✅ Supabase connected successfully."

        );


        return true;


    } catch (error) {


        console.error(

            "Supabase connection exception:",

            error

        );


        return false;

    }

}


// ===============================
// INITIALIZATION
// ===============================

window.addEventListener(

    "load",

    function() {


        console.log(
            "#F Chat Loaded"
        );


        // Supabase test

        testSupabaseConnection();


    }

);


// ===============================
// PART 6 END
// ===============================


// ===============================
// #F CHAT MAIN.JS COMPLETE
// ===============================