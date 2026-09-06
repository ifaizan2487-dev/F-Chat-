// ==========================================
// #F CHAT
// GROUP CHAT FEATURE
// FEATURES.JS
// ==========================================


// ==========================================
// ADD GROUP BUTTON TO USER HOME
// ==========================================

const originalShowUserPanel =
    showUserPanel;


showUserPanel =
function(username) {

    // ORIGINAL FUNCTION RUN

    originalShowUserPanel(username);


    // WAIT FOR PAGE

    setTimeout(
        function() {

            addGroupButton();

        },
        100
    );
};


// ==========================================
// ADD CREATE GROUP BUTTON
// ==========================================

function addGroupButton() {

    // CHECK IF ALREADY EXISTS

    if (
        document.getElementById(
            "createGroupButton"
        )
    ) {

        return;

    }


    const chatBody =
        document.querySelector(
            ".chat-body"
        );


    if (!chatBody) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "createGroupButton";


    button.className =
        "create-group-button";


    button.innerText =
        "👥 Create Group";


    button.onclick =
        function() {

            showCreateGroup();

        };


    // INSERT BUTTON

    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (searchBox) {

        searchBox.after(button);

    } else {

        chatBody.appendChild(button);

    }


    // LOAD GROUPS

    loadGroups();

}


// ==========================================
// LOAD GROUPS
// ==========================================

async function loadGroups() {

    const chatBody =
        document.querySelector(
            ".chat-body"
        );


    if (!chatBody) {

        return;

    }


    // REMOVE OLD GROUP BOX

    const oldBox =
        document.getElementById(
            "groupsBox"
        );


    if (oldBox) {

        oldBox.remove();

    }


    const groupsBox =
        document.createElement(
            "div"
        );


    groupsBox.id =
        "groupsBox";


    groupsBox.className =
        "groups-box";


    groupsBox.innerHTML =
        `
        <h3>
            👥 Groups
        </h3>

        <div id="groupsList">

            Loading groups...

        </div>
        `;


    chatBody.appendChild(
        groupsBox
    );


    const groupsList =
        document.getElementById(
            "groupsList"
        );


    if (!groupsList) {

        return;

    }


    // GET GROUP MEMBERSHIPS

    const {
        data: memberships,
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .select(
            "group_id"
        )
        .eq(
            "username",
            currentUser
        );


    if (error) {

        console.log(error);

        groupsList.innerHTML =
            "<p>❌ Groups load nahi hue.</p>";

        return;

    }


    if (
        !memberships ||
        memberships.length === 0
    ) {

        groupsList.innerHTML =
            "<p>No groups yet.</p>";

        return;

    }


    const groupIds =
        memberships.map(
            function(item) {

                return item.group_id;

            }
        );


    // GET GROUP DETAILS

    const {
        data: groups,
        error: groupsError
    } =
        await supabaseClient
        .from(
            "fchat_groups"
        )
        .select("*")
        .in(
            "id",
            groupIds
        );


    if (groupsError) {

        console.log(groupsError);

        groupsList.innerHTML =
            "<p>❌ Groups load nahi hue.</p>";

        return;

    }


    groupsList.innerHTML =
        "";


    groups.forEach(
        function(group) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "group-item";


            item.innerHTML =
                `

                <div class="group-avatar">

                    👥

                </div>


                <div class="group-info">

                    <b>
                        ${group.group_name}
                    </b>

                    <p>
                        Group chat
                    </p>

                </div>

                `;


            item.onclick =
                function() {

                    openGroupChat(
                        group.id,
                        group.group_name
                    );

                };


            groupsList.appendChild(
                item
            );

        }
    );

}


// ==========================================
// CREATE GROUP SCREEN
// ==========================================

async function showCreateGroup() {

    document.body.innerHTML =
    `

    <div class="group-create-screen">


        <div class="group-create-header">

            <button
                onclick="backToHome()"
            >
                ←
            </button>


            <h2>
                Create Group
            </h2>

        </div>


        <div class="group-create-body">


            <input

                id="groupName"

                type="text"

                placeholder="Group name..."

            >


            <h3>
                Select Members
            </h3>


            <div
                id="groupUsers"
            >

                Loading users...

            </div>


            <button

                class="create-group-confirm"

                onclick="createGroup()"

            >

                👥 Create Group

            </button>


        </div>


    </div>

    `;


    await loadUsersForGroup();

}


// ==========================================
// LOAD USERS FOR GROUP
// ==========================================

async function loadUsersForGroup() {

    const usersBox =
        document.getElementById(
            "groupUsers"
        );


    if (!usersBox) {

        return;

    }


    const {
        data: users,
        error
    } =
        await supabaseClient
        .from(
            "fchat_users"
        )
        .select(
            "username, approved"
        )
        .eq(
            "approved",
            true
        );


    if (error) {

        console.log(error);

        usersBox.innerHTML =
            "<p>❌ Users load nahi hue.</p>";

        return;

    }


    usersBox.innerHTML =
        "";


    let found =
        false;


    users.forEach(
        function(user) {


            // CURRENT USER KO SELECT
            // KARNE KI NEED NAHI

            if (
                user.username ===
                currentUser
            ) {

                return;

            }


            found =
                true;


            const userItem =
                document.createElement(
                    "label"
                );


            userItem.className =
                "group-user-item";


            userItem.innerHTML =
                `

                <input

                    type="checkbox"

                    class="group-user-checkbox"

                    value="${user.username}"

                >


                <div class="group-user-avatar">

                    👤

                </div>


                <div>

                    <b>
                        ${user.username}
                    </b>

                </div>

                `;


            usersBox.appendChild(
                userItem
            );

        }
    );


    if (!found) {

        usersBox.innerHTML =
            `
            <p>
                No other approved users found.
            </p>
            `;

    }

}


// ==========================================
// CREATE GROUP
// ==========================================

async function createGroup() {

    const groupNameInput =
        document.getElementById(
            "groupName"
        );


    if (!groupNameInput) {

        return;

    }


    const groupName =
        groupNameInput.value.trim();


    if (!groupName) {

        alert(
            "⚠️ Group name likho."
        );

        return;

    }


    // GET SELECTED USERS

    const checkboxes =
        document.querySelectorAll(
            ".group-user-checkbox:checked"
        );


    const selectedUsers =
        [];


    checkboxes.forEach(
        function(box) {

            selectedUsers.push(
                box.value
            );

        }
    );


    if (
        selectedUsers.length === 0
    ) {

        alert(
            "⚠️ Kam se kam 1 member select karo."
        );

        return;

    }


    // CREATE GROUP

    const {
        data: groupData,
        error: groupError
    } =
        await supabaseClient
        .from(
            "fchat_groups"
        )
        .insert({

            group_name:
                groupName,

            created_by:
                currentUser

        })
        .select();


    if (groupError) {

        console.log(groupError);

        alert(
            "❌ Group create nahi hua.\n\n" +
            groupError.message
        );

        return;

    }


    if (
        !groupData ||
        groupData.length === 0
    ) {

        alert(
            "❌ Group create nahi hua."
        );

        return;

    }


    const group =
        groupData[0];


    // ADD CREATOR

    selectedUsers.push(
        currentUser
    );


    // REMOVE DUPLICATES

    const members =
        [...new Set(
            selectedUsers
        )];


    // PREPARE MEMBER DATA

    const memberData =
        members.map(
            function(username) {

                return {

                    group_id:
                        group.id,

                    username:
                        username

                };

            }
        );


    // INSERT MEMBERS

    const {
        error: memberError
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .insert(
            memberData
        );


    if (memberError) {

        console.log(memberError);

        alert(
            "⚠️ Group bana lekin members add nahi hue.\n\n" +
            memberError.message
        );

        return;

    }


    alert(
        "✅ Group successfully created!"
    );


    // OPEN GROUP

    openGroupChat(
        group.id,
        group.group_name
    );

}


// ==========================================
// OPEN GROUP CHAT
// ==========================================

function openGroupChat(
    groupId,
    groupName
) {

    // REMOVE OLD REALTIME CHANNEL

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;

    }


    document.body.innerHTML =
    `

    <div class="chat-screen">


        <div class="chat-top">


            <button

                onclick="backToHome()"

            >

                ←

            </button>


            <div class="chat-avatar">

                👥

            </div>


            <div>

                <h3>

                    ${groupName}

                </h3>


                <small>

                    Group

                </small>

            </div>


        </div>


        <div

            id="groupMessages"

            class="messages"

        >

            <p>

                Loading messages...

            </p>

        </div>


        <div class="message-area">


            <input

                id="groupMessageInput"

                type="text"

                placeholder="Type a message..."

                onkeydown="handleGroupMessageKey(event)"

            >


            <button

                onclick="sendGroupMessage()"

            >

                ➤

            </button>


        </div>


    </div>

    `;


    // SAVE CURRENT GROUP

    window.currentGroupId =
        groupId;


    window.currentGroupName =
        groupName;


    loadGroupMessages();


    startGroupRealtime();


    setTimeout(
        function() {

            const input =
                document.getElementById(
                    "groupMessageInput"
                );


            if (input) {

                input.focus();

            }

        },
        100
    );

}


// ==========================================
// GROUP FEATURE END - PART 1
// ==========================================
// ==========================================
// F CHAT
// GROUP FEATURE - PART 2
// GROUP MESSAGES
// ==========================================


// ==========================================
// SEND GROUP MESSAGE
// ==========================================

async function sendGroupMessage() {

    const input =
        document.getElementById(
            "groupMessageInput"
        );


    if (!input) {

        return;

    }


    const message =
        input.value.trim();


    if (!message) {

        return;

    }


    if (
        !currentUser ||
        !window.currentGroupId
    ) {

        alert(
            "❌ Group properly open nahi hai."
        );

        return;

    }


    // DISABLE INPUT TEMPORARILY

    input.disabled =
        true;


    const {
        data,
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_messages"
        )
        .insert({

            group_id:
                window.currentGroupId,

            sender:
                currentUser,

            message:
                message

        })
        .select();


    // ENABLE INPUT

    input.disabled =
        false;


    if (error) {

        console.log(error);


        alert(

            "❌ Message send nahi hua.\n\n" +

            error.message

        );


        input.focus();


        return;

    }


    // CLEAR INPUT

    input.value =
        "";


    input.focus();


    // DISPLAY MESSAGE

    if (
        data &&
        data.length > 0
    ) {

        displayGroupMessage(
            data[0]
        );

    }

}


// ==========================================
// ENTER KEY SEND MESSAGE
// ==========================================

function handleGroupMessageKey(
    event
) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();


        sendGroupMessage();

    }

}


// ==========================================
// LOAD GROUP MESSAGES
// ==========================================

async function loadGroupMessages() {

    const messagesBox =
        document.getElementById(
            "groupMessages"
        );


    if (!messagesBox) {

        return;

    }


    if (
        !window.currentGroupId
    ) {

        messagesBox.innerHTML =
            "<p>❌ Group ID nahi mila.</p>";


        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_messages"
        )
        .select("*")
        .eq(

            "group_id",

            window.currentGroupId

        )
        .order(

            "created_at",

            {

                ascending:
                    true

            }

        );


    if (error) {

        console.log(error);


        messagesBox.innerHTML =

            "<p>❌ Messages load nahi hue.</p>";


        return;

    }


    // CLEAR LOADING

    messagesBox.innerHTML =
        "";


    // NO MESSAGES

    if (
        !data ||
        data.length === 0
    ) {

        messagesBox.innerHTML =

            `

            <p

                class="no-group-messages"

            >

                No messages yet.

            </p>

            `;


        return;

    }


    // DISPLAY ALL MESSAGES

    data.forEach(
        function(msg) {

            displayGroupMessage(
                msg
            );

        }
    );

}


// ==========================================
// DISPLAY GROUP MESSAGE
// ==========================================

function displayGroupMessage(
    msg
) {

    const messagesBox =
        document.getElementById(
            "groupMessages"
        );


    if (!messagesBox) {

        return;

    }


    // =====================================
    // REMOVE "NO MESSAGES" TEXT
    // =====================================

    const noMessages =
        messagesBox.querySelector(
            ".no-group-messages"
        );


    if (noMessages) {

        noMessages.remove();

    }


    // =====================================
    // DUPLICATE CHECK
    // =====================================

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        const existing =
            messagesBox.querySelector(

                `[data-group-message-id="${msg.id}"]`

            );


        if (existing) {

            return;

        }

    }


    // =====================================
    // CREATE MESSAGE
    // =====================================

    const div =
        document.createElement(
            "div"
        );


    // =====================================
    // SENT OR RECEIVED
    // =====================================

    if (
        msg.sender === currentUser
    ) {

        div.className =
            "group-message sent";

    }

    else {

        div.className =
            "group-message received";

    }


    // =====================================
    // MESSAGE ID
    // =====================================

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        div.setAttribute(

            "data-group-message-id",

            msg.id

        );

    }


    // =====================================
    // USERNAME
    // =====================================

    const username =
        document.createElement(
            "div"
        );


    username.className =
        "group-message-username";


    username.innerText =
        msg.sender;


    // =====================================
    // MESSAGE TEXT
    // =====================================

    const messageText =
        document.createElement(
            "div"
        );


    messageText.className =
        "group-message-text";


    messageText.innerText =
        msg.message;


    // =====================================
    // TIME
    // =====================================

    const time =
        document.createElement(
            "div"
        );


    time.className =
        "group-message-time";


    let timeText =
        "";


    if (
        msg.created_at
    ) {

        const date =
            new Date(
                msg.created_at
            );


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

    }


    else {

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


    time.innerText =
        timeText;


    // =====================================
    // ADD EVERYTHING
    // =====================================

    div.appendChild(
        username
    );


    div.appendChild(
        messageText
    );


    div.appendChild(
        time
    );


    messagesBox.appendChild(
        div
    );


    // =====================================
    // AUTO SCROLL
    // =====================================

    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ==========================================
// GROUP REALTIME
// ==========================================

function startGroupRealtime() {

    if (
        !window.currentGroupId
    ) {

        return;

    }


    // REMOVE OLD CHANNEL

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );


        currentChannel =
            null;

    }


    // CREATE CHANNEL

    currentChannel =
        supabaseClient
        .channel(

            "group-" +

            window.currentGroupId

        )


        // =================================
        // LISTEN FOR NEW MESSAGES
        // =================================

        .on(

            "postgres_changes",

            {

                event:
                    "INSERT",


                schema:
                    "public",


                table:
                    "fchat_group_messages",


                filter:

                    "group_id=eq." +

                    window.currentGroupId

            },


            function(payload) {


                displayGroupMessage(

                    payload.new

                );


            }

        )


        // =================================
        // START
        // =================================

        .subscribe(

            function(status) {

                console.log(

                    "Group Realtime:",

                    status

                );

            }

        );

}


// ==========================================
// GROUP FEATURE PART 2 END
// =========================================
// ==========================================
// #F CHAT
// GROUP FEATURE - PART 4
// GROUP MEMBERS
// ==========================================


// ==========================================
// SHOW GROUP INFO BUTTON
// ==========================================

// Original openGroupChat ko save karte hain

const originalOpenGroupChat =
    openGroupChat;


// openGroupChat ko extend karte hain

openGroupChat =
function(groupId, groupName) {

    // Original group chat open

    originalOpenGroupChat(
        groupId,
        groupName
    );


    // Info button add karne ke liye

    setTimeout(
        function() {

            addGroupInfoButton();

        },
        100
    );
};


// ==========================================
// ADD GROUP INFO BUTTON
// ==========================================

function addGroupInfoButton() {

    // Duplicate button avoid

    if (
        document.getElementById(
            "groupInfoButton"
        )
    ) {

        return;

    }


    const chatTop =
        document.querySelector(
            ".chat-top"
        );


    if (!chatTop) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "groupInfoButton";


    button.className =
        "group-info-button";


    button.innerText =
        "ℹ️";


    button.onclick =
        function() {

            showGroupInfo();

        };


    chatTop.appendChild(
        button
    );

}


// ==========================================
// SHOW GROUP INFO
// ==========================================

async function showGroupInfo() {

    if (
        !window.currentGroupId
    ) {

        alert(
            "❌ Group open nahi hai."
        );

        return;

    }


    // Get current group members

    const {
        data: members,
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .select(
            "id, username"
        )
        .eq(
            "group_id",
            window.currentGroupId
        )
        .order(
            "added_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.log(error);


        alert(
            "❌ Members load nahi hue.\n\n" +
            error.message
        );


        return;

    }


    const groupName =
        window.currentGroupName ||
        "Group";


    document.body.innerHTML =
    `

    <div class="group-info-screen">


        <div class="group-info-header">


            <button
                onclick="backToGroupChat()"
            >
                ←
            </button>


            <h2>

                ${groupName}

            </h2>


        </div>


        <div class="group-info-body">


            <h3>

                👥 Members

            </h3>


            <p>

                ${members.length} members

            </p>


            <div
                id="groupMembersList"
            >

            </div>


            <button
                class="add-members-button"
                onclick="showAddMembers()"
            >

                ➕ Add Members

            </button>


            <button
                class="leave-group-button"
                onclick="leaveGroup()"
            >

                🚪 Leave Group

            </button>


        </div>


    </div>

    `;


    const list =
        document.getElementById(
            "groupMembersList"
        );


    if (!list) {

        return;

    }


    members.forEach(
        function(member) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "group-member-item";


            let memberName =
                member.username;


            // Creator label

            if (
                member.username ===
                currentUser
            ) {

                memberName +=
                    " (You)";

            }


            item.innerHTML =
            `

                <div
                    class="group-member-avatar"
                >

                    👤

                </div>


                <div
                    class="group-member-name"
                >

                    ${memberName}

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );

}


// ==========================================
// BACK TO GROUP CHAT
// ==========================================

function backToGroupChat() {

    if (
        !window.currentGroupId
    ) {

        backToHome();

        return;

    }


    openGroupChat(
        window.currentGroupId,
        window.currentGroupName
    );

}


// ==========================================
// SHOW ADD MEMBERS SCREEN
// ==========================================

async function showAddMembers() {

    if (
        !window.currentGroupId
    ) {

        return;

    }


    const groupId =
        window.currentGroupId;


    const groupName =
        window.currentGroupName;


    document.body.innerHTML =
    `

    <div class="group-create-screen">


        <div class="group-create-header">


            <button
                onclick="showGroupInfo()"
            >

                ←

            </button>


            <h2>

                Add Members

            </h2>


        </div>


        <div class="group-create-body">


            <h3>

                Select Users

            </h3>


            <div
                id="addMembersUsers"
            >

                Loading users...

            </div>


            <button
                class="create-group-confirm"
                onclick="addSelectedMembers()"
            >

                ➕ Add Selected Members

            </button>


        </div>


    </div>

    `;


    const usersBox =
        document.getElementById(
            "addMembersUsers"
        );


    if (!usersBox) {

        return;

    }


    // Get all approved users

    const {
        data: users,
        error: usersError
    } =
        await supabaseClient
        .from(
            "fchat_users"
        )
        .select(
            "username"
        )
        .eq(
            "approved",
            true
        );


    if (usersError) {

        console.log(usersError);


        usersBox.innerHTML =
            "<p>❌ Users load nahi hue.</p>";


        return;

    }


    // Get existing members

    const {
        data: members,
        error: membersError
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .select(
            "username"
        )
        .eq(
            "group_id",
            groupId
        );


    if (membersError) {

        console.log(membersError);


        usersBox.innerHTML =
            "<p>❌ Members load nahi hue.</p>";


        return;

    }


    const memberNames =
        members.map(
            function(member) {

                return member.username;

            }
        );


    usersBox.innerHTML =
        "";


    let found =
        false;


    users.forEach(
        function(user) {

            // Existing member skip

            if (
                memberNames.includes(
                    user.username
                )
            ) {

                return;

            }


            found =
                true;


            const item =
                document.createElement(
                    "label"
                );


            item.className =
                "group-user-item";


            item.innerHTML =
            `

                <input
                    type="checkbox"
                    class="add-member-checkbox"
                    value="${user.username}"
                >


                <div
                    class="group-user-avatar"
                >

                    👤

                </div>


                <b>

                    ${user.username}

                </b>

            `;


            usersBox.appendChild(
                item
            );

        }
    );


    if (!found) {

        usersBox.innerHTML =
            "<p>All approved users are already members.</p>";

    }

}


// ==========================================
// ADD SELECTED MEMBERS
// ==========================================

async function addSelectedMembers() {

    if (
        !window.currentGroupId
    ) {

        return;

    }


    const checkboxes =
        document.querySelectorAll(
            ".add-member-checkbox:checked"
        );


    const selectedUsers =
        [];


    checkboxes.forEach(
        function(box) {

            selectedUsers.push(
                box.value
            );

        }
    );


    if (
        selectedUsers.length === 0
    ) {

        alert(
            "⚠️ Kam se kam ek user select karo."
        );

        return;

    }


    const memberData =
        selectedUsers.map(
            function(username) {

                return {

                    group_id:
                        window.currentGroupId,

                    username:
                        username

                };

            }
        );


    const {
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .insert(
            memberData
        );


    if (error) {

        console.log(error);


        alert(
            "❌ Members add nahi hue.\n\n" +
            error.message
        );


        return;

    }


    alert(
        "✅ Members successfully added!"
    );


    showGroupInfo();

}


// ==========================================
// LEAVE GROUP
// ==========================================

async function leaveGroup() {

    if (
        !window.currentGroupId
    ) {

        return;

    }


    const confirmLeave =
        confirm(
            "Kya tum group leave karna chahte ho?"
        );


    if (!confirmLeave) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_members"
        )
        .delete()
        .eq(
            "group_id",
            window.currentGroupId
        )
        .eq(
            "username",
            currentUser
        );


    if (error) {

        console.log(error);


        alert(
            "❌ Group leave nahi hua.\n\n" +
            error.message
        );


        return;

    }


    alert(
        "👋 Tum group leave kar chuke ho."
    );


    // Clear group data

    window.currentGroupId =
        null;

    window.currentGroupName =
        null;


    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );

        currentChannel =
            null;

    }


    // Back home

    showUserPanel(
        currentUser
    );

}


// ==========================================
// GROUP FEATURE PART 4 END
// ==========================================
// ==========================================
// #F CHAT
// GROUP FEATURE - PART 5
// EDIT / DELETE GROUP MESSAGES
// ==========================================


// ==========================================
// OVERRIDE DISPLAY GROUP MESSAGE
// ==========================================

// Purane function ko save karo

const originalDisplayGroupMessage =
    displayGroupMessage;


// Naya display function

displayGroupMessage =
function(msg) {

    const messagesBox =
        document.getElementById(
            "groupMessages"
        );

    if (!messagesBox) {

        return;

    }


    // REMOVE NO MESSAGE TEXT

    const noMessages =
        messagesBox.querySelector(
            ".no-group-messages"
        );

    if (noMessages) {

        noMessages.remove();

    }


    // DUPLICATE CHECK

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        const existing =
            messagesBox.querySelector(
                `[data-group-message-id="${msg.id}"]`
            );

        if (existing) {

            return;

        }

    }


    // MESSAGE CONTAINER

    const div =
        document.createElement(
            "div"
        );


    div.className =
        msg.sender === currentUser
        ? "group-message sent"
        : "group-message received";


    // MESSAGE ID

    if (
        msg.id !== undefined &&
        msg.id !== null
    ) {

        div.setAttribute(
            "data-group-message-id",
            msg.id
        );

    }


    // =====================================
    // SENDER NAME
    // =====================================

    const username =
        document.createElement(
            "div"
        );


    username.className =
        "group-message-username";


    username.innerText =
        msg.sender;


    // =====================================
    // MESSAGE TEXT
    // =====================================

    const messageText =
        document.createElement(
            "div"
        );


    messageText.className =
        "group-message-text";


    messageText.innerText =
        msg.message;


    // =====================================
    // TIME
    // =====================================

    const time =
        document.createElement(
            "div"
        );


    time.className =
        "group-message-time";


    let timeText =
        "";


    if (msg.created_at) {

        const date =
            new Date(
                msg.created_at
            );


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

    }


    time.innerText =
        timeText;


    // =====================================
    // ADD TEXT
    // =====================================

    div.appendChild(
        username
    );


    div.appendChild(
        messageText
    );


    time.style.display =
        "inline-block";


    // =====================================
    // EDIT / DELETE
    // ONLY OWN MESSAGE
    // =====================================

    if (
        msg.sender === currentUser
    ) {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "group-message-actions";


        // EDIT BUTTON

        const editButton =
            document.createElement(
                "button"
            );


        editButton.innerText =
            "✏️";


        editButton.className =
            "group-edit-button";


        editButton.onclick =
            function(event) {

                event.stopPropagation();


                editGroupMessage(
                    msg.id,
                    msg.message
                );

            };


        // DELETE BUTTON

        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.innerText =
            "🗑️";


        deleteButton.className =
            "group-delete-button";


        deleteButton.onclick =
            function(event) {

                event.stopPropagation();


                deleteGroupMessage(
                    msg.id
                );

            };


        actions.appendChild(
            editButton
        );


        actions.appendChild(
            deleteButton
        );


        div.appendChild(
            actions
        );

    }


    // ADD TIME

    div.appendChild(
        time
    );


    // ADD MESSAGE

    messagesBox.appendChild(
        div
    );


    // AUTO SCROLL

    messagesBox.scrollTop =
        messagesBox.scrollHeight;

};


// ==========================================
// EDIT GROUP MESSAGE
// ==========================================

async function editGroupMessage(
    messageId,
    oldMessage
) {

    if (
        !messageId
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


    if (
        newMessage === null
    ) {

        return;

    }


    const cleanedMessage =
        newMessage.trim();


    if (
        !cleanedMessage
    ) {

        alert(
            "❌ Message empty nahi ho sakta."
        );

        return;

    }


    if (
        cleanedMessage === oldMessage
    ) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_messages"
        )
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
            "❌ Message update nahi hua.\n\n" +
            error.message
        );


        return;

    }


    // UPDATE SCREEN IMMEDIATELY

    if (
        data &&
        data.length > 0
    ) {

        updateGroupMessageOnScreen(
            data[0]
        );

    }

}


// ==========================================
// UPDATE MESSAGE ON SCREEN
// ==========================================

function updateGroupMessageOnScreen(
    msg
) {

    const messageElement =
        document.querySelector(
            `[data-group-message-id="${msg.id}"]`
        );


    if (!messageElement) {

        return;

    }


    const messageText =
        messageElement.querySelector(
            ".group-message-text"
        );


    if (messageText) {

        messageText.innerText =
            msg.message;

    }


    // ADD EDITED LABEL

    let edited =
        messageElement.querySelector(
            ".group-edited-label"
        );


    if (!edited) {

        edited =
            document.createElement(
                "span"
            );


        edited.className =
            "group-edited-label";


        edited.innerText =
            " (edited)";


        const time =
            messageElement.querySelector(
                ".group-message-time"
            );


        if (time) {

            messageElement.insertBefore(
                edited,
                time
            );

        }

    }

}


// ==========================================
// DELETE GROUP MESSAGE
// ==========================================

async function deleteGroupMessage(
    messageId
) {

    if (
        !messageId
    ) {

        alert(
            "❌ Message ID nahi mila."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Kya tum ye message delete karna chahte ho?"
        );


    if (
        !confirmDelete
    ) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
        .from(
            "fchat_group_messages"
        )
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


    // REMOVE FROM SCREEN

    removeGroupMessageFromScreen(
        messageId
    );

}


// ==========================================
// REMOVE MESSAGE FROM SCREEN
// ==========================================

function removeGroupMessageFromScreen(
    messageId
) {

    const messageElement =
        document.querySelector(
            `[data-group-message-id="${messageId}"]`
        );


    if (
        messageElement
    ) {

        messageElement.remove();

    }


    const messagesBox =
        document.getElementById(
            "groupMessages"
        );


    // IF NO MESSAGES LEFT

    if (
        messagesBox &&
        messagesBox.children.length === 0
    ) {

        messagesBox.innerHTML =
            `

            <p
                class="no-group-messages"
            >
                No messages yet.
            </p>

            `;

    }

}


// ==========================================
// EXTEND GROUP REALTIME
// ==========================================

// Purane realtime function ko save karo

const originalStartGroupRealtime =
    startGroupRealtime;


// Naya realtime

startGroupRealtime =
function() {

    if (
        !window.currentGroupId
    ) {

        return;

    }


    // REMOVE OLD CHANNEL

    if (
        currentChannel
    ) {

        supabaseClient.removeChannel(
            currentChannel
        );


        currentChannel =
            null;

    }


    currentChannel =
        supabaseClient
        .channel(

            "group-messages-" +

            window.currentGroupId +

            "-" +

            Date.now()

        )


        // =================================
        // INSERT
        // =================================

        .on(

            "postgres_changes",

            {

                event:
                    "INSERT",

                schema:
                    "public",

                table:
                    "fchat_group_messages",

                filter:

                    "group_id=eq." +

                    window.currentGroupId

            },


            function(payload) {

                displayGroupMessage(
                    payload.new
                );

            }

        )


        // =================================
        // UPDATE
        // =================================

        .on(

            "postgres_changes",

            {

                event:
                    "UPDATE",

                schema:
                    "public",

                table:
                    "fchat_group_messages",

                filter:

                    "group_id=eq." +

                    window.currentGroupId

            },


            function(payload) {

                updateGroupMessageOnScreen(
                    payload.new
                );

            }

        )


        // =================================
        // DELETE
        // =================================

        .on(

            "postgres_changes",

            {

                event:
                    "DELETE",

                schema:
                    "public",

                table:
                    "fchat_group_messages",

                filter:

                    "group_id=eq." +

                    window.currentGroupId

            },


            function(payload) {

                removeGroupMessageFromScreen(
                    payload.old.id
                );

            }

        )


        // =================================
        // SUBSCRIBE
        // =================================

        .subscribe(
            function(status) {

                console.log(
                    "Group Realtime:",
                    status
                );

            }
        );

};


// ==========================================
// GROUP FEATURE PART 5 END
// ==========================================
