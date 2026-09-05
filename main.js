// ===============================
// #F CHAT - MAIN.JS
// PART 1 / 2
// ===============================


// ---------- SUPABASE ----------

const SUPABASE_URL =
    "https://nltckcltknnzclqprxsc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_vaJh3MXDOuCZ5Jl9GSeZTQ_QXbRfW8Q";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ---------- GLOBAL ----------

let adminUsername = "admin";

let adminPassword = "admin123";

let currentUser = "";

let currentChat = "";

let currentChannel = null;


// ===============================
// USER LOGIN
// ===============================

function login() {

    const usernameElement =
        document.getElementById("username");

    const passwordElement =
        document.getElementById("password");

    const result =
        document.getElementById("result");

    if (
        !usernameElement ||
        !passwordElement ||
        !result
    ) {
        return;
    }

    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value;

    if (!username || !password) {

        result.innerText =
            "⚠️ Username aur password bharo.";

        return;
    }

    if (username === adminUsername) {

        result.innerText =
            "⚠️ Admin Login button use karo.";

        return;
    }

    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );

    if (!users[username]) {

        result.innerText =
            "❌ Account nahi mila.";

        return;
    }

    if (
        users[username].password !==
        password
    ) {

        result.innerText =
            "❌ Wrong password.";

        return;
    }

    if (
        users[username].approved !== true
    ) {

        result.innerText =
            "⏳ Admin approval pending hai.";

        return;
    }

    currentUser =
        username;

    showUserPanel(username);
}


// ===============================
// SIGNUP SCREEN
// ===============================

function showSignup() {

    const userLogin =
        document.getElementById("userLogin");

    const adminLoginBox =
        document.getElementById("adminLogin");

    const signup =
        document.getElementById("signup");

    const pageTitle =
        document.getElementById("pageTitle");

    const result =
        document.getElementById("result");

    if (userLogin) {

        userLogin.style.display =
            "none";
    }

    if (adminLoginBox) {

        adminLoginBox.style.display =
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


// ===============================
// CREATE ACCOUNT
// ===============================

function createAccount() {

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
        document.getElementById("result");

    if (
        !usernameElement ||
        !passwordElement ||
        !confirmElement ||
        !result
    ) {
        return;
    }

    const username =
        usernameElement.value.trim();

    const password =
        passwordElement.value;

    const confirmPassword =
        confirmElement.value;

    if (
        !username ||
        !password ||
        !confirmPassword
    ) {

        result.innerText =
            "⚠️ Sab fields bharo.";

        return;
    }

    if (
        !/^[a-zA-Z0-9_]+$/.test(username)
    ) {

        result.innerText =
            "⚠️ Username me sirf letters, numbers aur _ use karo.";

        return;
    }

    if (
        password !==
        confirmPassword
    ) {

        result.innerText =
            "❌ Password match nahi kar raha.";

        return;
    }

    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );

    if (users[username]) {

        result.innerText =
            "❌ Username already exist karta hai.";

        return;
    }

    users[username] = {

        password:
            password,

        approved:
            false

    };

    localStorage.setItem(
        "FChatUsers",
        JSON.stringify(users)
    );

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
// USER LOGIN SCREEN
// ===============================

function showUserLogin() {

    const userLogin =
        document.getElementById(
            "userLogin"
        );

    const signup =
        document.getElementById(
            "signup"
        );

    const adminLoginBox =
        document.getElementById(
            "adminLogin"
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

    if (signup) {

        signup.style.display =
            "none";
    }

    if (adminLoginBox) {

        adminLoginBox.style.display =
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


// ===============================
// ADMIN LOGIN SCREEN
// ===============================

function showAdminLogin() {

    const userLogin =
        document.getElementById(
            "userLogin"
        );

    const signup =
        document.getElementById(
            "signup"
        );

    const adminLoginBox =
        document.getElementById(
            "adminLogin"
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

    if (adminLoginBox) {

        adminLoginBox.style.display =
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


// ===============================
// ADMIN LOGIN
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
        usernameElement.value.trim();

    const password =
        passwordElement.value;

    if (
        username === adminUsername &&
        password === adminPassword
    ) {

        showAdminPanel();

    } else {

        result.innerText =
            "❌ Wrong Admin Username or Password.";
    }
}


// ===============================
// USER HOME
// ===============================

function showUserPanel(username) {

    document.body.innerHTML = `

        <div class="chat-app">

            <div class="chat-header">

                <div>

                    <h2>#F Chat</h2>

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

                <div class="profile-box">

                    <h3>
                        👤 ${username}
                    </h3>

                    <p>
                        Account Approved ✅
                    </p>

                </div>


                <input
                    id="searchBox"
                    type="text"
                    placeholder="Search users..."
                    oninput="searchContacts()"
                >


                <div class="chat-list">

                    <h3>
                        Chats
                    </h3>

                    <div id="contacts"></div>

                </div>


                <button
                    class="password-button"
                    onclick="changePassword()"
                >
                    🔑 Change Password
                </button>

            </div>

        </div>
    `;

    loadContacts();
}


// ===============================
// LOAD CONTACTS
// ===============================

function loadContacts() {

    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );

    const contacts =
        document.getElementById(
            "contacts"
        );

    if (!contacts) return;

    contacts.innerHTML =
        "";

    let found =
        false;

    Object.keys(users).forEach(
        function(username) {

            if (
                username !== currentUser &&
                users[username].approved === true
            ) {

                found =
                    true;

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "chat-item";

                item.innerHTML = `

                    <div class="chat-avatar">
                        💬
                    </div>

                    <div class="chat-info">

                        <b>
                            ${username}
                        </b>

                        <p>
                            Tap to chat
                        </p>

                    </div>
                `;

                item.onclick =
                    function() {

                        openChat(
                            username
                        );

                    };

                contacts.appendChild(
                    item
                );
            }
        }
    );

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

    if (!searchBox) return;

    const search =
        searchBox.value
            .toLowerCase();

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

            if (!nameElement) return;

            const name =
                nameElement.innerText
                    .toLowerCase();

            item.style.display =
                name.includes(search)
                ? "flex"
                : "none";
        }
    );
}


// ===============================
// OPEN CHAT
// ===============================

function openChat(username) {

    currentChat =
        username;

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;
    }

    document.body.innerHTML = `

        <div class="chat-screen">

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


            <div
                id="messages"
                class="messages"
            >

                <p>
                    Loading messages...
                </p>

            </div>


            <div class="message-area">

                <input
                    id="messageInput"
                    type="text"
                    placeholder="Type a message..."
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

    loadMessages();

    startRealtime();

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
// PART 1 END
// ===============================
// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) return;

    if (!currentUser || !currentChat) {

        alert("❌ Chat properly open nahi hai.");

        return;
    }

    const { data, error } =
        await supabaseClient
        .from("messagess")
        .insert({

            sender: currentUser,

            receiver: currentChat,

            message: message

        })
        .select();

    if (error) {

        console.log(error);

        alert(
            "❌ Message send nahi hua.\n\n" +
            error.message
        );

        return;
    }

    if (!data || data.length === 0) {

        alert(
            "⚠️ Message save hua, lekin row return nahi hui."
        );

        return;
    }

    displayMessage(data[0]);

    input.value = "";

    input.focus();
}


// ===============================
// LOAD MESSAGES
// ===============================

async function loadMessages() {

    const messagesBox =
        document.getElementById("messages");

    if (!messagesBox) return;

    const { data, error } =
        await supabaseClient
        .from("messagess")
        .select("*")
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.log(error);

        messagesBox.innerHTML =
            "<p>❌ Messages load nahi hue.</p>";

        return;
    }

    messagesBox.innerHTML = "";

    let found = false;

    data.forEach(function(msg) {

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

            found = true;

            displayMessage(msg);
        }
    });

    if (!found) {

        messagesBox.innerHTML =
            "<p style='text-align:center;color:#8696a0;'>No messages yet.</p>";
    }
}


// ===============================
// DISPLAY MESSAGE
// ===============================

function displayMessage(msg) {

    const messagesBox =
        document.getElementById("messages");

    if (!messagesBox) return;


    // ---------- DUPLICATE CHECK ----------

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        const existing =
            messagesBox.querySelector(
                `[data-message-id="${msg.id}"]`
            );

        if (existing) return;
    }


    // ---------- MESSAGE DIV ----------

    const div =
        document.createElement("div");


    div.className =
        msg.sender === currentUser
        ? "message sent"
        : "message received";


    // ---------- MESSAGE ID ----------

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        div.setAttribute(
            "data-message-id",
            msg.id
        );
    }


    // ---------- TIME ----------

    let timeText = "";

    if (msg.created_at) {

        const date =
            new Date(msg.created_at);

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

        timeText =
            hours +
            ":" +
            minutes +
            " " +
            ampm;

    } else {

        const now =
            new Date();

        let hours =
            now.getHours();

        let minutes =
            now.getMinutes();

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

        timeText =
            hours +
            ":" +
            minutes +
            " " +
            ampm;
    }


    // ---------- MESSAGE TEXT ----------

    div.innerText =
        msg.message +
        "   " +
        timeText;


    // ---------- EDIT + DELETE ----------

    if (msg.sender === currentUser) {

        // EDIT BUTTON
        const editBtn =
            document.createElement("button");

        editBtn.innerText =
            "✏️";

        editBtn.className =
            "edit-message-btn";

        editBtn.onclick =
            function(event) {

                event.stopPropagation();

                editMessage(
                    msg.id,
                    msg.message
                );
            };


        // DELETE BUTTON
        const deleteBtn =
            document.createElement("button");

        deleteBtn.innerText =
            "🗑️";

        deleteBtn.className =
            "delete-message-btn";

        deleteBtn.onclick =
            function(event) {

                event.stopPropagation();

                deleteMessage(
                    msg.id
                );
            };


        div.appendChild(editBtn);

        div.appendChild(deleteBtn);
    }


    messagesBox.appendChild(div);

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


    if (newMessage === null) return;


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


    const { data, error } =
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

        console.log(error);

        alert(
            "❌ Message edit nahi hua.\n\n" +
            error.message
        );

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "⚠️ Message update nahi hua."
        );

        return;
    }


    const messageElement =
        document.querySelector(
            `[data-message-id="${messageId}"]`
        );


    if (!messageElement) return;


    // Re-create message display
    messageElement.innerText =
        cleanedMessage +
        "   " +
        getMessageTime(
            data[0]
        );


    // Edit button
    const editBtn =
        document.createElement("button");

    editBtn.innerText =
        "✏️";

    editBtn.className =
        "edit-message-btn";

    editBtn.onclick =
        function(event) {

            event.stopPropagation();

            editMessage(
                messageId,
                cleanedMessage
            );
        };


    // Delete button
    const deleteBtn =
        document.createElement("button");

    deleteBtn.innerText =
        "🗑️";

    deleteBtn.className =
        "delete-message-btn";

    deleteBtn.onclick =
        function(event) {

            event.stopPropagation();

            deleteMessage(
                messageId
            );
        };


    messageElement.appendChild(
        editBtn
    );

    messageElement.appendChild(
        deleteBtn
    );
}


// ===============================
// GET MESSAGE TIME
// ===============================

function getMessageTime(msg) {

    let date;

    if (msg && msg.created_at) {

        date =
            new Date(
                msg.created_at
            );

    } else {

        date =
            new Date();
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


    if (!confirmDelete) return;


    const { error } =
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

        console.log(error);

        alert(
            "❌ Message delete nahi hua.\n\n" +
            error.message
        );

        return;
    }


    const messageElement =
        document.querySelector(
            `[data-message-id="${messageId}"]`
        );


    if (messageElement) {

        messageElement.remove();
    }
}


// ===============================
// REALTIME
// ===============================

function startRealtime() {

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;
    }


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
        .subscribe();
}


// ===============================
// ENTER TO SEND
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

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;
    }


    currentChat =
        "";


    showUserPanel(
        currentUser
    );
}


// ===============================
// CHANGE PASSWORD
// ===============================

function changePassword() {

    const oldPassword =
        prompt(
            "Old password:"
        );


    if (
        oldPassword === null
    ) return;


    const newPassword =
        prompt(
            "New password:"
        );


    if (
        newPassword === null
    ) return;


    if (
        newPassword === ""
    ) {

        alert(
            "❌ New password empty nahi ho sakta."
        );

        return;
    }


    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );


    if (
        !users[currentUser]
    ) {

        alert(
            "❌ User nahi mila."
        );

        return;
    }


    if (
        users[currentUser].password !==
        oldPassword
    ) {

        alert(
            "❌ Old password wrong hai."
        );

        return;
    }


    users[currentUser].password =
        newPassword;


    localStorage.setItem(
        "FChatUsers",
        JSON.stringify(users)
    );


    alert(
        "✅ Password changed successfully!"
    );
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;
    }


    currentUser =
        "";

    currentChat =
        "";


    location.reload();
}


// ===============================
// ADMIN PANEL
// ===============================

function showAdminPanel() {

    document.body.innerHTML = `

        <div class="admin-app">

            <div class="admin-header">

                <h1>
                    #F Chat Admin
                </h1>

                <button
                    onclick="logout()"
                >
                    Logout
                </button>

            </div>


            <h2>
                Manage Users
            </h2>


            <div
                id="adminUsers"
            ></div>

        </div>
    `;


    loadAdminUsers();
}


// ===============================
// LOAD ADMIN USERS
// ===============================

function loadAdminUsers() {

    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );


    const box =
        document.getElementById(
            "adminUsers"
        );


    if (!box) return;


    box.innerHTML =
        "";


    const usernames =
        Object.keys(users);


    if (
        usernames.length === 0
    ) {

        box.innerHTML =
            "<p>No users found.</p>";

        return;
    }


    usernames.forEach(
        function(username) {

            const user =
                users[username];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-user-card";


            const status =
                user.approved === true
                ? "✅ Approved"
                : "⏳ Pending";


            card.innerHTML = `

                <h3>
                    ${username}
                </h3>

                <p>
                    Status:
                    ${status}
                </p>

            `;


            if (
                username !==
                adminUsername
            ) {

                // APPROVE BUTTON
                if (
                    user.approved !== true
                ) {

                    const approveBtn =
                        document.createElement(
                            "button"
                        );

                    approveBtn.innerText =
                        "✅ Approve";

                    approveBtn.onclick =
                        function() {

                            approveUser(
                                username
                            );
                        };

                    card.appendChild(
                        approveBtn
                    );
                }


                // REJECT BUTTON
                const rejectBtn =
                    document.createElement(
                        "button"
                    );

                rejectBtn.innerText =
                    "❌ Reject";

                rejectBtn.onclick =
                    function() {

                        rejectUser(
                            username
                        );
                    };

                card.appendChild(
                    rejectBtn
                );
            }


            box.appendChild(
                card
            );
        }
    );
}


// ===============================
// APPROVE USER
// ===============================

function approveUser(
    username
) {

    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );


    if (
        !users[username]
    ) {

        alert(
            "❌ User nahi mila."
        );

        return;
    }


    users[username].approved =
        true;


    localStorage.setItem(
        "FChatUsers",
        JSON.stringify(users)
    );


    alert(
        "✅ " +
        username +
        " approved!"
    );


    loadAdminUsers();
}


// ===============================
// REJECT USER
// ===============================

function rejectUser(
    username
) {

    const confirmReject =
        confirm(
            "Kya " +
            username +
            " ko reject/delete karna hai?"
        );


    if (!confirmReject) return;


    const users =
        JSON.parse(
            localStorage.getItem(
                "FChatUsers"
            ) || "{}"
        );


    if (
        !users[username]
    ) {

        alert(
            "❌ User nahi mila."
        );

        return;
    }


    delete users[username];


    localStorage.setItem(
        "FChatUsers",
        JSON.stringify(users)
    );


    alert(
        "🗑️ " +
        username +
        " reject kar diya."
    );


    loadAdminUsers();
}


// ===============================
// MAIN.JS COMPLETE
// ===============================