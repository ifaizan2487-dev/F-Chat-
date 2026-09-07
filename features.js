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
// ==========================================
// #F CHAT
// GROUP DELETE FEATURE
// PASTE AT THE END OF FEATURES.JS
// ==========================================


// ==========================================
// DELETE CURRENT GROUP
// ==========================================

async function deleteCurrentGroup() {

    const groupId =
        window.currentGroupId;


    const groupName =
        window.currentGroupName ||
        "this group";


    if (!groupId) {

        alert(
            "❌ Group open nahi hai."
        );

        return;

    }


    // CONFIRM DELETE

    const confirmed =
        confirm(

            '⚠️ "' +
            groupName +
            '" ko permanently delete karna hai?\n\n' +

            "Is group ke saare messages aur members bhi database se delete ho jayenge.\n\n" +

            "⚠️ Ye action undo nahi hoga."

        );


    if (!confirmed) {

        return;

    }


    // ==========================================
    // VERIFY GROUP + CREATOR
    // ==========================================

    const {

        data: group,

        error: groupCheckError

    } =

        await supabaseClient

        .from(
            "fchat_groups"
        )

        .select(
            "id, created_by"
        )

        .eq(
            "id",
            groupId
        )

        .maybeSingle();


    if (groupCheckError) {

        console.log(
            groupCheckError
        );


        alert(

            "❌ Group verify nahi ho saka.\n\n" +

            groupCheckError.message

        );


        return;

    }


    if (!group) {

        alert(
            "⚠️ Ye group already delete ho chuka hai."
        );


        backToHome();


        return;

    }


    // ONLY CREATOR CAN DELETE

    if (

        group.created_by !==
        currentUser

    ) {

        alert(
            "❌ Sirf group creator group delete kar sakta hai."
        );


        return;

    }


    // ==========================================
    // STEP 1
    // DELETE GROUP MESSAGES
    // ==========================================

    const {

        error: messagesError

    } =

        await supabaseClient

        .from(
            "fchat_group_messages"
        )

        .delete()

        .eq(
            "group_id",
            groupId
        );


    if (messagesError) {

        console.log(
            messagesError
        );


        alert(

            "❌ Group messages delete nahi hue.\n\n" +

            messagesError.message

        );


        return;

    }


    // ==========================================
    // STEP 2
    // DELETE GROUP MEMBERS
    // ==========================================

    const {

        error: membersError

    } =

        await supabaseClient

        .from(
            "fchat_group_members"
        )

        .delete()

        .eq(
            "group_id",
            groupId
        );


    if (membersError) {

        console.log(
            membersError
        );


        alert(

            "❌ Group members delete nahi hue.\n\n" +

            membersError.message

        );


        return;

    }


    // ==========================================
    // STEP 3
    // DELETE MAIN GROUP
    // ==========================================

    const {

        error: deleteGroupError

    } =

        await supabaseClient

        .from(
            "fchat_groups"
        )

        .delete()

        .eq(
            "id",
            groupId
        );


    if (deleteGroupError) {

        console.log(
            deleteGroupError
        );


        alert(

            "❌ Group database se delete nahi hua.\n\n" +

            deleteGroupError.message

        );


        return;

    }


    // ==========================================
    // REMOVE REALTIME CHANNEL
    // ==========================================

    if (currentChannel) {

        supabaseClient.removeChannel(
            currentChannel
        );


        currentChannel =
            null;

    }


    // ==========================================
    // CLEAR CURRENT GROUP
    // ==========================================

    window.currentGroupId =
        null;


    window.currentGroupName =
        null;


    alert(

        "✅ Group aur uska saara data permanently delete ho gaya."

    );


    // ==========================================
    // BACK TO HOME
    // ==========================================

    backToHome();

}


// ==========================================
// ADD DELETE BUTTON TO GROUP HEADER
// ==========================================


// Original openGroupChat function save

const originalOpenGroupChatForDelete =
    openGroupChat;


// Replace function

openGroupChat =
function(

    groupId,

    groupName

) {


    // ORIGINAL GROUP CHAT OPEN

    originalOpenGroupChatForDelete(

        groupId,

        groupName

    );


    // WAIT FOR SCREEN

    setTimeout(

        async function() {


            // CHECK GROUP DETAILS

            const {

                data: group,

                error

            } =

                await supabaseClient

                .from(
                    "fchat_groups"
                )

                .select(
                    "created_by"
                )

                .eq(
                    "id",
                    groupId
                )

                .maybeSingle();


            if (

                error ||

                !group

            ) {

                return;

            }


            // ONLY CREATOR GETS DELETE BUTTON

            if (

                group.created_by !==
                currentUser

            ) {

                return;

            }


            // PREVENT DUPLICATE BUTTON

            if (

                document.getElementById(
                    "deleteGroupButton"
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


            // CREATE BUTTON

            const deleteButton =

                document.createElement(
                    "button"
                );


            deleteButton.id =
                "deleteGroupButton";


            deleteButton.innerText =
                "🗑️";


            deleteButton.title =
                "Delete Group";


            deleteButton.style.marginLeft =
                "auto";


            deleteButton.style.fontSize =
                "20px";


            deleteButton.onclick =
                function() {

                    deleteCurrentGroup();

                };


            // ADD BUTTON

            chatTop.appendChild(
                deleteButton
            );


        },

        200

    );

};


// ==========================================
// GROUP DELETE FEATURE END
// ==========================================
// ==========================================
// #F CHAT
// PHOTO / VIDEO / FILE FEATURE
// PERSONAL + GROUP CHAT
// PASTE AT END OF FEATURES.JS
// ==========================================


// ==========================================
// SETTINGS
// ==========================================

const FCHAT_MEDIA_BUCKET =
    "fchat-media";


const FCHAT_MEDIA_PREFIX =
    "__FCHAT_MEDIA__";


// ==========================================
// CREATE ATTACHMENT BUTTONS
// ==========================================

function addFChatAttachmentButtons() {

    // ======================================
    // PERSONAL CHAT
    // ======================================

    const personalInput =
        document.getElementById(
            "messageInput"
        );


    if (personalInput) {

        const personalArea =
            personalInput.parentElement;


        if (

            personalArea &&

            !document.getElementById(
                "fchatPersonalAttachButton"
            )

        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.id =
                "fchatPersonalAttachButton";


            button.type =
                "button";


            button.innerText =
                "📎";


            button.title =
                "Send Photo, Video or File";


            button.onclick =
                function() {

                    openFChatFilePicker(
                        "personal"
                    );

                };


            personalArea.insertBefore(
                button,
                personalInput
            );

        }

    }


    // ======================================
    // GROUP CHAT
    // ======================================

    const groupInput =
        document.getElementById(
            "groupMessageInput"
        );


    if (groupInput) {

        const groupArea =
            groupInput.parentElement;


        if (

            groupArea &&

            !document.getElementById(
                "fchatGroupAttachButton"
            )

        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.id =
                "fchatGroupAttachButton";


            button.type =
                "button";


            button.innerText =
                "📎";


            button.title =
                "Send Photo, Video or File";


            button.onclick =
                function() {

                    openFChatFilePicker(
                        "group"
                    );

                };


            groupArea.insertBefore(
                button,
                groupInput
            );

        }

    }

}


// ==========================================
// HIDDEN FILE PICKER
// ==========================================

function openFChatFilePicker(
    chatType
) {

    let picker =
        document.getElementById(
            "fchatHiddenFilePicker"
        );


    if (picker) {

        picker.remove();

    }


    picker =
        document.createElement(
            "input"
        );


    picker.type =
        "file";


    picker.id =
        "fchatHiddenFilePicker";


    picker.accept =
        "image/*,video/*,*/*";


    picker.style.display =
        "none";


    picker.onchange =
        async function() {

            const file =
                picker.files[0];


            if (!file) {

                return;

            }


            await uploadAndSendFChatFile(

                file,

                chatType

            );


            picker.remove();

        };


    document.body.appendChild(
        picker
    );


    picker.click();

}


// ==========================================
// UPLOAD FILE TO SUPABASE
// ==========================================

async function uploadAndSendFChatFile(

    file,

    chatType

) {

    // ======================================
    // FILE SIZE LIMIT
    // 50 MB
    // ======================================

    const maxSize =
        50 *
        1024 *
        1024;


    if (

        file.size >

        maxSize

    ) {

        alert(
            "❌ File 50 MB se badi nahi honi chahiye."
        );


        return;

    }


    // ======================================
    // CHECK CHAT
    // ======================================

    if (

        chatType ===
        "personal"

    ) {

        if (

            !currentUser ||

            !currentChat

        ) {

            alert(
                "❌ Personal chat open nahi hai."
            );


            return;

        }

    }


    if (

        chatType ===
        "group"

    ) {

        if (

            !currentUser ||

            !window.currentGroupId

        ) {

            alert(
                "❌ Group chat open nahi hai."
            );


            return;

        }

    }


    // ======================================
    // CREATE UNIQUE FILE NAME
    // ======================================

    const extension =

        file.name.includes(
            "."
        )

        ?

        file.name.split(
            "."
        ).pop()

        :

        "";


    const safeName =

        file.name

        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const uniqueName =

        Date.now() +

        "_" +

        Math.random()

        .toString(36)

        .substring(2, 10)

        +

        "_" +

        safeName;


    // ======================================
    // CREATE FOLDER
    // ======================================

    let folder;


    if (

        chatType ===
        "personal"

    ) {

        folder =
            "personal/" +

            currentUser +

            "_" +

            currentChat;

    }


    else {

        folder =
            "groups/" +

            window.currentGroupId;

    }


    const filePath =

        folder +

        "/" +

        uniqueName;


    // ======================================
    // SHOW UPLOAD MESSAGE
    // ======================================

    const uploading =
        document.createElement(
            "div"
        );


    uploading.id =
        "fchatUploadingMessage";


    uploading.style.position =
        "fixed";


    uploading.style.bottom =
        "80px";


    uploading.style.left =
        "50%";


    uploading.style.transform =
        "translateX(-50%)";


    uploading.style.padding =
        "10px 16px";


    uploading.style.background =
        "#222";


    uploading.style.color =
        "white";


    uploading.style.borderRadius =
        "10px";


    uploading.style.zIndex =
        "99999";


    uploading.innerText =
        "⏳ Uploading " +

        file.name;


    document.body.appendChild(
        uploading
    );


    // ======================================
    // UPLOAD
    // ======================================

    const {

        error: uploadError

    } =

        await supabaseClient

        .storage

        .from(
            FCHAT_MEDIA_BUCKET
        )

        .upload(

            filePath,

            file,

            {

                contentType:
                    file.type ||

                    "application/octet-stream"

            }

        );


    // REMOVE UPLOADING MESSAGE

    if (uploading) {

        uploading.remove();

    }


    if (uploadError) {

        console.log(
            uploadError
        );


        alert(

            "❌ File upload nahi hui.\n\n" +

            uploadError.message

        );


        return;

    }


    // ======================================
    // GET PUBLIC URL
    // ======================================

    const {

        data: publicData

    } =

        supabaseClient

        .storage

        .from(
            FCHAT_MEDIA_BUCKET
        )

        .getPublicUrl(
            filePath
        );


    if (

        !publicData ||

        !publicData.publicUrl

    ) {

        alert(
            "❌ File URL nahi mila."
        );


        return;

    }


    // ======================================
    // DETECT FILE TYPE
    // ======================================

    let mediaType =
        "file";


    if (

        file.type

        .startsWith(
            "image/"
        )

    ) {

        mediaType =
            "image";

    }


    else if (

        file.type

        .startsWith(
            "video/"
        )

    ) {

        mediaType =
            "video";

    }


    // ======================================
    // CREATE MEDIA DATA
    // ======================================

    const mediaData = {

        type:
            mediaType,


        url:
            publicData.publicUrl,


        name:
            file.name,


        size:
            file.size,


        mime:
            file.type,


        path:
            filePath

    };


    const messageData =

        FCHAT_MEDIA_PREFIX +

        JSON.stringify(
            mediaData
        );


    // ======================================
    // SEND
    // ======================================

    if (

        chatType ===
        "personal"

    ) {

        await sendFChatPersonalAttachment(
            messageData
        );

    }


    else {

        await sendFChatGroupAttachment(
            messageData
        );

    }

}


// ==========================================
// SEND PERSONAL ATTACHMENT
// ==========================================

async function sendFChatPersonalAttachment(
    messageData
) {

    const {

        data,

        error

    } =

        await supabaseClient

        .from(
            "messagess"
        )

        .insert({

            sender:
                currentUser,


            receiver:
                currentChat,


            message:
                messageData

        })

        .select();


    if (error) {

        console.log(
            error
        );


        alert(

            "❌ Attachment send nahi hua.\n\n" +

            error.message

        );


        return;

    }


    if (

        data &&

        data.length > 0

    ) {

        displayFChatPersonalAttachment(
            data[0]
        );

    }

}


// ==========================================
// SEND GROUP ATTACHMENT
// ==========================================

async function sendFChatGroupAttachment(
    messageData
) {

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
                messageData

        })

        .select();


    if (error) {

        console.log(
            error
        );


        alert(

            "❌ Attachment send nahi hua.\n\n" +

            error.message

        );


        return;

    }


    if (

        data &&

        data.length > 0

    ) {

        displayFChatGroupAttachment(
            data[0]
        );

    }

}


// ==========================================
// CHECK IF MESSAGE IS MEDIA
// ==========================================

function getFChatMediaData(
    message
) {

    if (

        !message ||

        typeof message !==
        "string"

    ) {

        return null;

    }


    if (

        !message.startsWith(
            FCHAT_MEDIA_PREFIX
        )

    ) {

        return null;

    }


    try {

        const json =

            message.substring(

                FCHAT_MEDIA_PREFIX.length

            );


        return JSON.parse(
            json
        );

    }


    catch (

        error

    ) {

        console.log(
            error
        );


        return null;

    }

}


// ==========================================
// CREATE MEDIA ELEMENT
// ==========================================

function createFChatMediaElement(
    media
) {

    const container =
        document.createElement(
            "div"
        );


    container.className =
        "fchat-media-container";


    // ======================================
    // IMAGE
    // ======================================

    if (

        media.type ===
        "image"

    ) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            media.url;


        image.alt =
            media.name ||
            "Image";


        image.style.maxWidth =
            "250px";


        image.style.maxHeight =
            "300px";


        image.style.borderRadius =
            "8px";


        image.style.display =
            "block";


        image.style.cursor =
            "pointer";


        image.onclick =
            function() {

                window.open(
                    media.url,
                    "_blank"
                );

            };


        container.appendChild(
            image
        );

    }


    // ======================================
    // VIDEO
    // ======================================

    else if (

        media.type ===
        "video"

    ) {

        const video =
            document.createElement(
                "video"
            );


        video.src =
            media.url;


        video.controls =
            true;


        video.style.maxWidth =
            "280px";


        video.style.maxHeight =
            "300px";


        video.style.borderRadius =
            "8px";


        container.appendChild(
            video
        );

    }


    // ======================================
    // NORMAL FILE
    // ======================================

    else {

        const link =
            document.createElement(
                "a"
            );


        link.href =
            media.url;


        link.target =
            "_blank";


        link.rel =
            "noopener";


        link.innerText =
            "📄 " +

            (

                media.name ||

                "Download File"

            );


        link.style.display =
            "block";


        link.style.padding =
            "8px";


        link.style.textDecoration =
            "none";


        link.download =
            media.name ||
            "";


        container.appendChild(
            link
        );

    }


    return container;

}


// ==========================================
// PERSONAL ATTACHMENT DISPLAY
// ==========================================

function displayFChatPersonalAttachment(
    msg
) {

    // Duplicate check

    const existing =
        document.querySelector(

            `[data-message-id="${msg.id}"]`

        );


    if (existing) {

        return;

    }


    const messagesBox =
        document.getElementById(
            "messages"
        );


    if (!messagesBox) {

        return;

    }


    const media =
        getFChatMediaData(
            msg.message
        );


    if (!media) {

        return;

    }


    const div =
        document.createElement(
            "div"
        );


    const isMine =

        msg.sender ===
        currentUser;


    div.className =

        isMine

        ?

        "message sent"

        :

        "message received";


    div.setAttribute(

        "data-message-id",

        msg.id

    );


    const mediaElement =
        createFChatMediaElement(
            media
        );


    div.appendChild(
        mediaElement
    );


    // TIME

    const time =
        document.createElement(
            "span"
        );


    time.className =
        "message-time";


    if (

        typeof formatMessageTime ===
        "function"

    ) {

        time.innerText =
            formatMessageTime(
                msg.created_at
            );

    }


    div.appendChild(
        time
    );


    messagesBox.appendChild(
        div
    );


    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ==========================================
// GROUP ATTACHMENT DISPLAY
// ==========================================

function displayFChatGroupAttachment(
    msg
) {

    const existing =
        document.querySelector(

            `[data-group-message-id="${msg.id}"]`

        );


    if (existing) {

        return;

    }


    const messagesBox =
        document.getElementById(
            "groupMessages"
        );


    if (!messagesBox) {

        return;

    }


    const media =
        getFChatMediaData(
            msg.message
        );


    if (!media) {

        return;

    }


    const div =
        document.createElement(
            "div"
        );


    const isMine =

        msg.sender ===
        currentUser;


    div.className =

        isMine

        ?

        "group-message sent"

        :

        "group-message received";


    div.setAttribute(

        "data-group-message-id",

        msg.id

    );


    // SENDER NAME

    const sender =
        document.createElement(
            "div"
        );


    sender.innerText =
        msg.sender;


    sender.style.fontWeight =
        "bold";


    div.appendChild(
        sender
    );


    // MEDIA

    div.appendChild(

        createFChatMediaElement(
            media
        )

    );


    // TIME

    const time =
        document.createElement(
            "span"
        );


    time.className =
        "group-message-time";


    if (msg.created_at) {

        const date =
            new Date(
                msg.created_at
            );


        time.innerText =
            date.toLocaleTimeString(

                [],

                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }

            );

    }


    div.appendChild(
        time
    );


    messagesBox.appendChild(
        div
    );


    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ==========================================
// OVERRIDE PERSONAL DISPLAY
// ==========================================

const originalDisplayMessageForMedia =
    displayMessage;


displayMessage =
function(msg) {

    const media =
        getFChatMediaData(
            msg.message
        );


    if (media) {

        displayFChatPersonalAttachment(
            msg
        );


        return;

    }


    originalDisplayMessageForMedia(
        msg
    );

};


// ==========================================
// OVERRIDE GROUP DISPLAY
// ==========================================

const originalDisplayGroupMessageForMedia =
    displayGroupMessage;


displayGroupMessage =
function(msg) {

    const media =
        getFChatMediaData(
            msg.message
        );


    if (media) {

        displayFChatGroupAttachment(
            msg
        );


        return;

    }


    originalDisplayGroupMessageForMedia(
        msg
    );

};


// ==========================================
// WATCH FOR CHAT SCREEN
// AND ADD ATTACHMENT BUTTON
// ==========================================

setInterval(

    function() {

        addFChatAttachmentButtons();

    },

    700

);


// ==========================================
// F-CHAT MEDIA FEATURE END
// ==========================================
// ==========================================
// #F CHAT
// PROFILE FEATURE
// PASTE AT END OF FEATURES.JS
// ==========================================


// ==========================================
// PROFILE SETTINGS
// ==========================================

const FCHAT_PROFILE_BUCKET =
    "fchat-media";


// ==========================================
// ADD PROFILE STYLES
// ==========================================

function addFChatProfileStyles() {

    if (
        document.getElementById(
            "fchatProfileStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "fchatProfileStyles";


    style.innerHTML =
    `

    /* =====================================
       PROFILE BUTTON
    ===================================== */

    .fchat-profile-button {

        width: 100%;

        padding: 13px;

        margin-top: 10px;

        border: none;

        border-radius: 10px;

        font-size: 16px;

        cursor: pointer;

        background: #075e54;

        color: white;

    }


    /* =====================================
       CHAT PROFILE BUTTON
    ===================================== */

    .fchat-chat-profile-button {

        margin-left: auto;

        background: transparent;

        border: none;

        font-size: 22px;

        cursor: pointer;

        color: white;

    }


    /* =====================================
       PROFILE SCREEN
    ===================================== */

    .fchat-profile-screen {

        min-height: 100vh;

        background: #f5f5f5;

        font-family: Arial, sans-serif;

    }


    /* =====================================
       HEADER
    ===================================== */

    .fchat-profile-header {

        height: 64px;

        display: flex;

        align-items: center;

        gap: 15px;

        padding: 0 16px;

        background: #075e54;

        color: white;

        box-sizing: border-box;

    }


    .fchat-profile-header button {

        background: transparent;

        border: none;

        color: white;

        font-size: 27px;

        cursor: pointer;

    }


    .fchat-profile-header h2 {

        margin: 0;

        font-size: 20px;

    }


    /* =====================================
       BODY
    ===================================== */

    .fchat-profile-body {

        padding: 25px 16px;

        max-width: 600px;

        margin: auto;

    }


    /* =====================================
       PROFILE IMAGE
    ===================================== */

    .fchat-profile-photo-box {

        display: flex;

        flex-direction: column;

        align-items: center;

        margin-bottom: 30px;

    }


    .fchat-profile-photo {

        width: 150px;

        height: 150px;

        border-radius: 50%;

        object-fit: cover;

        background: #dfe5e8;

        border: 4px solid white;

        box-shadow:
            0 2px 10px rgba(
                0,
                0,
                0,
                0.2
            );

    }


    .fchat-profile-default-photo {

        width: 150px;

        height: 150px;

        border-radius: 50%;

        display: flex;

        align-items: center;

        justify-content: center;

        font-size: 70px;

        background: #dfe5e8;

        border: 4px solid white;

        box-shadow:
            0 2px 10px rgba(
                0,
                0,
                0,
                0.2
            );

    }


    .fchat-change-photo {

        margin-top: 15px;

        border: none;

        background: #128c7e;

        color: white;

        padding: 10px 18px;

        border-radius: 20px;

        cursor: pointer;

        font-size: 14px;

    }


    /* =====================================
       PROFILE CARD
    ===================================== */

    .fchat-profile-card {

        background: white;

        border-radius: 12px;

        padding: 18px;

        margin-bottom: 15px;

        box-shadow:
            0 1px 5px rgba(
                0,
                0,
                0,
                0.1
            );

    }


    .fchat-profile-label {

        color: #128c7e;

        font-size: 14px;

        margin-bottom: 10px;

    }


    .fchat-profile-value {

        font-size: 18px;

        word-break: break-word;

        color: #222;

    }


    .fchat-profile-about {

        color: #444;

        line-height: 1.5;

    }


    /* =====================================
       EDIT BUTTON
    ===================================== */

    .fchat-profile-edit {

        margin-top: 15px;

        border: none;

        background: transparent;

        color: #128c7e;

        font-size: 15px;

        cursor: pointer;

        padding: 5px 0;

    }


    /* =====================================
       IMAGE VIEW
    ===================================== */

    .fchat-profile-image-viewer {

        position: fixed;

        top: 0;

        left: 0;

        width: 100%;

        height: 100%;

        background: rgba(
            0,
            0,
            0,
            0.95
        );

        display: flex;

        align-items: center;

        justify-content: center;

        z-index: 999999;

    }


    .fchat-profile-image-viewer img {

        max-width: 95%;

        max-height: 90%;

        object-fit: contain;

    }


    .fchat-profile-image-close {

        position: absolute;

        top: 20px;

        right: 20px;

        background: transparent;

        border: none;

        color: white;

        font-size: 35px;

        cursor: pointer;

    }

    `;


    document.head.appendChild(
        style
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeFChatProfileHTML(
    text
) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// GET PROFILE
// ==========================================

async function getFChatProfile(
    username
) {

    if (!username) {

        return null;

    }


    const {

        data,

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .select(
            "*"
        )

        .eq(
            "username",
            username
        )

        .maybeSingle();


    if (error) {

        console.log(
            "Profile load error:",
            error
        );

        return null;

    }


    return data;

}


// ==========================================
// CREATE PROFILE IF NOT EXISTS
// ==========================================

async function ensureFChatProfile(
    username
) {

    if (!username) {

        return;

    }


    const existing =
        await getFChatProfile(
            username
        );


    if (existing) {

        return;

    }


    const {

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .insert({

            username:
                username,

            about:
                "Hey there! I am using F Chat."

        });


    if (error) {

        console.log(
            "Profile create error:",
            error
        );

    }

}


// ==========================================
// SHOW PROFILE
// ==========================================

async function showFChatProfile(
    username
) {

    if (!username) {

        return;

    }


    addFChatProfileStyles();


    const isOwnProfile =
        username === currentUser;


    if (isOwnProfile) {

        await ensureFChatProfile(
            username
        );

    }


    document.body.innerHTML =
    `

    <div
        class="fchat-profile-screen"
    >


        <div
            class="fchat-profile-header"
        >


            <button
                onclick="backFromFChatProfile()"
            >

                ←

            </button>


            <h2>

                Profile

            </h2>


        </div>


        <div
            class="fchat-profile-body"
        >

            <div
                id="fchatProfileContent"
            >

                Loading profile...

            </div>

        </div>


    </div>

    `;


    const content =
        document.getElementById(
            "fchatProfileContent"
        );


    if (!content) {

        return;

    }


    const profile =
        await getFChatProfile(
            username
        );


    let profileImage =
        "";


    let about =
        "Hey there! I am using F Chat.";


    if (profile) {

        profileImage =
            profile.profile_image ||
            "";


        about =
            profile.about ||
            about;

    }


    let photoHTML;


    if (profileImage) {

        photoHTML =
        `

        <img

            class="fchat-profile-photo"

            src="${escapeFChatProfileHTML(
                profileImage
            )}"

            onclick="viewFChatProfileImage(
                '${escapeFChatProfileHTML(
                    profileImage
                )}'
            )"

        >

        `;

    }


    else {

        photoHTML =
        `

        <div
            class="fchat-profile-default-photo"
        >

            👤

        </div>

        `;

    }


    let changePhotoHTML =
        "";


    if (isOwnProfile) {

        changePhotoHTML =
        `

        <button

            class="fchat-change-photo"

            onclick="changeFChatProfilePhoto()"

        >

            📷 Change Profile Photo

        </button>

        `;

    }


    let editNameHTML =
        "";


    let editAboutHTML =
        "";


    if (isOwnProfile) {

        editNameHTML =
        `

        <button

            class="fchat-profile-edit"

            onclick="editFChatProfileName()"

        >

            ✏️ Edit name

        </button>

        `;


        editAboutHTML =
        `

        <button

            class="fchat-profile-edit"

            onclick="editFChatProfileAbout()"

        >

            ✏️ Edit about

        </button>

        `;

    }


    content.innerHTML =
    `

    <div
        class="fchat-profile-photo-box"
    >

        ${photoHTML}

        ${changePhotoHTML}

    </div>


    <div
        class="fchat-profile-card"
    >

        <div
            class="fchat-profile-label"
        >

            Name

        </div>


        <div
            class="fchat-profile-value"
        >

            ${escapeFChatProfileHTML(
                username
            )}

        </div>


        ${editNameHTML}

    </div>


    <div
        class="fchat-profile-card"
    >

        <div
            class="fchat-profile-label"
        >

            About

        </div>


        <div
            class="
                fchat-profile-value
                fchat-profile-about
            "
        >

            ${escapeFChatProfileHTML(
                about
            )}

        </div>


        ${editAboutHTML}

    </div>


    <div
        class="fchat-profile-card"
    >

        <div
            class="fchat-profile-label"
        >

            F Chat User

        </div>


        <div
            class="fchat-profile-value"
        >

            👤 ${escapeFChatProfileHTML(
                username
            )}

        </div>

    </div>

    `;


    window.fchatViewingProfile =
        username;

}


// ==========================================
// BACK FROM PROFILE
// ==========================================

function backFromFChatProfile() {

    if (

        window.fchatViewingProfile ===
        currentUser

    ) {

        showUserPanel(
            currentUser
        );

    }


    else if (

        currentChat

    ) {

        /*
        Agar kisi user ka profile
        personal chat se open hua hai
        */

        if (
            typeof openChat ===
            "function"
        ) {

            openChat(
                currentChat
            );

        }


        else {

            showUserPanel(
                currentUser
            );

        }

    }


    else {

        showUserPanel(
            currentUser
        );

    }


    window.fchatViewingProfile =
        null;

}


// ==========================================
// EDIT PROFILE ABOUT
// ==========================================

async function editFChatProfileAbout() {

    const username =
        currentUser;


    if (!username) {

        return;

    }


    const profile =
        await getFChatProfile(
            username
        );


    const oldAbout =
        profile &&
        profile.about

        ?

        profile.about

        :

        "Hey there! I am using F Chat.";


    const newAbout =
        prompt(
            "Write your About:",
            oldAbout
        );


    if (
        newAbout === null
    ) {

        return;

    }


    const cleanedAbout =
        newAbout
        .trim()
        .substring(
            0,
            300
        );


    if (!cleanedAbout) {

        alert(
            "⚠️ About empty nahi ho sakta."
        );

        return;

    }


    const {

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .upsert({

            username:
                username,

            about:
                cleanedAbout,

            updated_at:
                new Date()
                .toISOString()

        });


    if (error) {

        console.log(error);


        alert(

            "❌ About update nahi hua.\n\n" +

            error.message

        );


        return;

    }


    showFChatProfile(
        currentUser
    );

}


// ==========================================
// EDIT PROFILE NAME
// ==========================================

async function editFChatProfileName() {


    alert(

        "ℹ️ Username edit feature abhi account system se connected nahi hai.\n\n" +

        "Profile photo aur About change kar sakte ho."

    );

}


// ==========================================
// CHANGE PROFILE PHOTO
// ==========================================

function changeFChatProfilePhoto() {


    const oldInput =
        document.getElementById(
            "fchatProfilePhotoInput"
        );


    if (oldInput) {

        oldInput.remove();

    }


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        "image/*";


    input.id =
        "fchatProfilePhotoInput";


    input.style.display =
        "none";


    input.onchange =
        async function() {


            const file =
                input.files[0];


            if (!file) {

                return;

            }


            await uploadFChatProfilePhoto(
                file
            );


            input.remove();

        };


    document.body.appendChild(
        input
    );


    input.click();

}


// ==========================================
// UPLOAD PROFILE PHOTO
// ==========================================

async function uploadFChatProfilePhoto(
    file
) {


    if (!currentUser) {

        return;

    }


    const maxSize =
        10 *
        1024 *
        1024;


    if (

        file.size >
        maxSize

    ) {

        alert(
            "⚠️ Profile photo 10 MB se chhoti honi chahiye."
        );

        return;

    }


    const safeFileName =

        file.name

        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const filePath =

        "profiles/" +

        currentUser +

        "/" +

        Date.now() +

        "_" +

        safeFileName;


    const {

        error:
        uploadError

    } =

        await supabaseClient

        .storage

        .from(
            FCHAT_PROFILE_BUCKET
        )

        .upload(

            filePath,

            file,

            {

                upsert:
                    false

            }

        );


    if (uploadError) {

        console.log(
            uploadError
        );


        alert(

            "❌ Profile photo upload nahi hui.\n\n" +

            uploadError.message

        );


        return;

    }


    const {

        data:
        urlData

    } =

        supabaseClient

        .storage

        .from(
            FCHAT_PROFILE_BUCKET
        )

        .getPublicUrl(
            filePath
        );


    if (

        !urlData ||

        !urlData.publicUrl

    ) {

        alert(
            "❌ Photo URL nahi mila."
        );

        return;

    }


    const {

        error:
        profileError

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .upsert({

            username:
                currentUser,

            profile_image:
                urlData.publicUrl,

            updated_at:
                new Date()
                .toISOString()

        });


    if (profileError) {

        console.log(
            profileError
        );


        alert(

            "❌ Profile photo save nahi hui.\n\n" +

            profileError.message

        );


        return;

    }


    alert(
        "✅ Profile photo updated!"
    );


    showFChatProfile(
        currentUser
    );

}


// ==========================================
// VIEW PROFILE IMAGE
// ==========================================

function viewFChatProfileImage(
    imageURL
) {


    if (!imageURL) {

        return;

    }


    const oldViewer =
        document.getElementById(
            "fchatProfileImageViewer"
        );


    if (oldViewer) {

        oldViewer.remove();

    }


    const viewer =
        document.createElement(
            "div"
        );


    viewer.id =
        "fchatProfileImageViewer";


    viewer.className =
        "fchat-profile-image-viewer";


    viewer.innerHTML =
    `

    <button

        class="
            fchat-profile-image-close
        "

        onclick="
            document
            .getElementById(
                'fchatProfileImageViewer'
            )
            .remove()
        "

    >

        ×

    </button>


    <img
        src="${imageURL}"
    >

    `;


    document.body.appendChild(
        viewer
    );

}


// ==========================================
// ADD MY PROFILE BUTTON
// ==========================================

function addFChatMyProfileButton() {


    const chatBody =
        document.querySelector(
            ".chat-body"
        );


    if (!chatBody) {

        return;

    }


    if (

        document.getElementById(
            "fchatMyProfileButton"
        )

    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "fchatMyProfileButton";


    button.className =
        "fchat-profile-button";


    button.innerText =
        "👤 My Profile";


    button.onclick =
        function() {

            showFChatProfile(
                currentUser
            );

        };


    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (searchBox) {

        searchBox.after(
            button
        );

    }


    else {

        chatBody.insertBefore(

            button,

            chatBody.firstChild

        );

    }

}


// ===============================
// ==========================================
// F CHAT PROFILE FEATURE
// ==========================================


// ==========================================
// ADD PROFILE CSS
// ==========================================

(function() {

    if (
        document.getElementById(
            "fProfileStyle"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "fProfileStyle";


    style.innerHTML = `

        .f-profile-btn {

            width: calc(100% - 20px);

            margin: 10px;

            padding: 14px;

            border: none;

            border-radius: 12px;

            background: #075e54;

            color: white;

            font-size: 16px;

            cursor: pointer;

        }


        .f-profile-page {

            min-height: 100vh;

            background: #f5f5f5;

            font-family: Arial, sans-serif;

        }


        .f-profile-header {

            height: 65px;

            display: flex;

            align-items: center;

            gap: 20px;

            padding: 0 18px;

            background: #075e54;

            color: white;

        }


        .f-profile-header button {

            border: none;

            background: none;

            color: white;

            font-size: 28px;

        }


        .f-profile-header h2 {

            margin: 0;

            font-size: 21px;

        }


        .f-profile-content {

            padding: 25px 15px;

        }


        .f-profile-photo-box {

            text-align: center;

            margin-bottom: 30px;

        }


        .f-profile-photo {

            width: 150px;

            height: 150px;

            border-radius: 50%;

            object-fit: cover;

            background: #ddd;

            border: 4px solid white;

            box-shadow: 0 2px 10px #999;

        }


        .f-profile-default {

            width: 150px;

            height: 150px;

            margin: auto;

            border-radius: 50%;

            display: flex;

            align-items: center;

            justify-content: center;

            font-size: 75px;

            background: #dfe5e8;

            border: 4px solid white;

        }


        .f-profile-change {

            margin-top: 15px;

            padding: 10px 20px;

            border: none;

            border-radius: 20px;

            background: #128c7e;

            color: white;

        }


        .f-profile-card {

            background: white;

            padding: 18px;

            margin-bottom: 15px;

            border-radius: 12px;

            box-shadow:
                0 1px 5px
                rgba(0,0,0,0.15);

        }


        .f-profile-label {

            color: #128c7e;

            font-size: 14px;

            margin-bottom: 8px;

        }


        .f-profile-value {

            font-size: 18px;

            color: #222;

            word-break: break-word;

        }


        .f-profile-edit {

            margin-top: 12px;

            border: none;

            background: none;

            color: #128c7e;

            font-size: 15px;

        }

    `;


    document.head.appendChild(
        style
    );


})();


// ==========================================
// GET PROFILE
// ==========================================

async function getFProfile(
    username
) {

    const {

        data,

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .select(
            "*"
        )

        .eq(
            "username",
            username
        )

        .maybeSingle();


    if (error) {

        console.log(
            "Profile Error:",
            error
        );

        return null;

    }


    return data;

}


// ==========================================
// CREATE PROFILE
// ==========================================

async function createFProfile(
    username
) {

    const profile =
        await getFProfile(
            username
        );


    if (profile) {

        return;

    }


    const {

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .insert({

            username:
                username,

            about:
                "Hey! I am using F Chat."

        });


    if (error) {

        console.log(
            error
        );

    }

}


// ==========================================
// SHOW PROFILE
// ==========================================

async function showFProfile(
    username
) {

    if (!username) {

        return;

    }


    window.fProfileUsername =
        username;


    const isMyProfile =

        username ===
        currentUser;


    if (isMyProfile) {

        await createFProfile(
            username
        );

    }


    document.body.innerHTML = `

        <div class="f-profile-page">


            <div
                class="f-profile-header"
            >


                <button
                    onclick="closeFProfile()"
                >

                    ←

                </button>


                <h2>

                    Profile

                </h2>


            </div>


            <div
                class="f-profile-content"
                id="fProfileContent"
            >

                Loading...

            </div>


        </div>

    `;


    const profile =
        await getFProfile(
            username
        );


    let about =
        "Hey! I am using F Chat.";


    let image =
        "";


    if (profile) {

        if (profile.about) {

            about =
                profile.about;

        }


        if (profile.profile_image) {

            image =
                profile.profile_image;

        }

    }


    let photoHTML;


    if (image) {

        photoHTML = `

            <img

                class="f-profile-photo"

                src="${image}"

            >

        `;

    }


    else {

        photoHTML = `

            <div
                class="f-profile-default"
            >

                👤

            </div>

        `;

    }


    let changePhoto =
        "";


    let editAbout =
        "";


    if (isMyProfile) {

        changePhoto = `

            <br>

            <button

                class="
                    f-profile-change
                "

                onclick="
                    chooseFProfilePhoto()
                "

            >

                📷 Change Photo

            </button>

        `;


        editAbout = `

            <button

                class="
                    f-profile-edit
                "

                onclick="
                    editFProfileAbout()
                "

            >

                ✏️ Edit About

            </button>

        `;

    }


    const content =
        document.getElementById(
            "fProfileContent"
        );


    if (!content) {

        return;

    }


    content.innerHTML = `


        <div
            class="
                f-profile-photo-box
            "
        >

            ${photoHTML}

            ${changePhoto}

        </div>


        <div
            class="f-profile-card"
        >


            <div
                class="
                    f-profile-label
                "
            >

                Name

            </div>


            <div
                class="
                    f-profile-value
                "
            >

                ${username}

            </div>


        </div>


        <div
            class="f-profile-card"
        >


            <div
                class="
                    f-profile-label
                "
            >

                About

            </div>


            <div
                class="
                    f-profile-value
                "
            >

                ${about}

            </div>


            ${editAbout}


        </div>


        <div
            class="f-profile-card"
        >


            <div
                class="
                    f-profile-label
                "
            >

                Account

            </div>


            <div
                class="
                    f-profile-value
                "
            >

                👤 F Chat User

            </div>


        </div>

    `;

}


// ==========================================
// CLOSE PROFILE
// ==========================================

function closeFProfile() {

    showUserPanel(
        currentUser
    );

}


// ==========================================
// EDIT ABOUT
// ==========================================

async function editFProfileAbout() {

    const profile =
        await getFProfile(
            currentUser
        );


    let oldAbout =
        "Hey! I am using F Chat.";


    if (

        profile &&

        profile.about

    ) {

        oldAbout =
            profile.about;

    }


    const newAbout =
        prompt(

            "Enter your description:",

            oldAbout

        );


    if (

        newAbout === null

    ) {

        return;

    }


    const finalAbout =
        newAbout.trim();


    if (!finalAbout) {

        alert(
            "Description empty nahi ho sakta."
        );

        return;

    }


    const {

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .upsert({

            username:
                currentUser,

            about:
                finalAbout,

            updated_at:
                new Date()
                .toISOString()

        });


    if (error) {

        alert(

            "Error: " +

            error.message

        );

        return;

    }


    showFProfile(
        currentUser
    );

}


// ==========================================
// CHOOSE PHOTO
// ==========================================

function chooseFProfilePhoto() {


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        "image/*";


    input.onchange =
        async function() {


            const file =
                input.files[0];


            if (!file) {

                return;

            }


            uploadFProfilePhoto(
                file
            );

        };


    input.click();

}


// ==========================================
// UPLOAD PHOTO
// ==========================================

async function uploadFProfilePhoto(
    file
) {


    const fileName =

        "profiles/" +

        currentUser +

        "_" +

        Date.now() +

        "_" +

        file.name.replace(

            /[^a-zA-Z0-9._-]/g,

            "_"

        );


    const {

        error:
        uploadError

    } =

        await supabaseClient

        .storage

        .from(
            "fchat-media"
        )

        .upload(

            fileName,

            file

        );


    if (uploadError) {

        alert(

            "Photo upload error: " +

            uploadError.message

        );

        return;

    }


    const {

        data

    } =

        supabaseClient

        .storage

        .from(
            "fchat-media"
        )

        .getPublicUrl(
            fileName
        );


    const photoURL =
        data.publicUrl;


    const {

        error

    } =

        await supabaseClient

        .from(
            "fchat_profiles"
        )

        .upsert({

            username:
                currentUser,

            profile_image:
                photoURL,

            updated_at:
                new Date()
                .toISOString()

        });


    if (error) {

        alert(

            "Profile save error: " +

            error.message

        );

        return;

    }


    alert(
        "✅ Profile photo updated!"
    );


    showFProfile(
        currentUser
    );

}


// ==========================================
// ADD MY PROFILE BUTTON
// ==========================================

function addFProfileButton() {


    const chatBody =
        document.querySelector(
            ".chat-body"
        );


    if (!chatBody) {

        return;

    }


    if (

        document.getElementById(
            "fProfileButton"
        )

    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.id =
        "fProfileButton";


    button.className =
        "f-profile-btn";


    button.innerText =
        "👤 My Profile";


    button.onclick =
        function() {

            showFProfile(
                currentUser
            );

        };


    const searchBox =
        document.getElementById(
            "searchBox"
        );


    if (searchBox) {

        searchBox.after(
            button
        );

    }


    else {

        chatBody.prepend(
            button
        );

    }

}


// ==========================================
// OVERRIDE HOME SCREEN
// ==========================================

const originalShowUserPanelForProfile =
    showUserPanel;


showUserPanel =
function(username) {


    originalShowUserPanelForProfile(
        username
    );


    setTimeout(

        function() {

            addFProfileButton();

        },

        300

    );

};


// ==========================================
// PROFILE FEATURE END
// ==========================================
// ==========================================
// F CHAT
// OTHER USER PROFILE FEATURE
// ==========================================


// ==========================================
// SAVE ORIGINAL OPEN CHAT
// ==========================================

const originalOpenChatForProfile =
    openChat;


// ==========================================
// OVERRIDE OPEN CHAT
// ==========================================

openChat =
function(username) {


    // ORIGINAL CHAT OPEN

    originalOpenChatForProfile(
        username
    );


    // WAIT FOR CHAT SCREEN

    setTimeout(

        function() {


            // GROUP CHAT HAI TO STOP

            if (
                window.currentGroupId
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


            // DUPLICATE BUTTON CHECK

            if (
                document.getElementById(
                    "otherUserProfileButton"
                )
            ) {

                return;

            }


            // CREATE PROFILE BUTTON

            const profileButton =
                document.createElement(
                    "button"
                );


            profileButton.id =
                "otherUserProfileButton";


            profileButton.innerHTML =
                "ℹ️";


            profileButton.title =
                "View Profile";


            profileButton.style.marginLeft =
                "auto";


            profileButton.style.background =
                "transparent";


            profileButton.style.border =
                "none";


            profileButton.style.fontSize =
                "22px";


            profileButton.style.cursor =
                "pointer";


            // OPEN OTHER USER PROFILE

            profileButton.onclick =
                function() {


                    showFProfile(
                        username
                    );


                };


            // ADD BUTTON

            chatTop.appendChild(
                profileButton
            );


            // =================================
            // MAKE USER NAME CLICKABLE
            // =================================


            const title =
                chatTop.querySelector(
                    "h3"
                );


            if (title) {


                title.style.cursor =
                    "pointer";


                title.title =
                    "View Profile";


                title.onclick =
                    function() {


                        showFProfile(
                            username
                        );


                    };


            }


        },

        200

    );


};


// ==========================================
// OTHER USER PROFILE FEATURE END
// ==========================================
