class Chat {
    users = [];
    activateChatId = null;
    messages = {}

    constructor({ currentUser }) {
        this.currentUser = currentUser;

        this.initializeChat();
        this.initializeListeners();
    }

    async initializeChat() {
        this.$chat = document.querySelector('.chat');
        this.$usersList = this.$chat.querySelector('.users-list');
        this.$currentUser = this.$chat.querySelector('.current-user');
        this.$textInput = this.$chat.querySelector('input');
        this.$messagesList = this.$chat.querySelector('.messages-list');

        this.$chat.classList.remove('hidden');
        this.$currentUser.textContent = `Logged in as ${this.currentUser.name}`;

        const users = await this.fetchUsers();
        this.renderUsers(users);

        console.log(users);
    }

    initializeListeners() {
        socket.on('users-changed', (users) => {
            this.renderUsers(users);
        });

        socket.on('new-chat-message', (message) => {
            console.log('new-chat-message', message);
            this.addMessage(message.text, message.senderId);

            if (message.senderId === this.activateChatId) {
                this.renderMessages(message.senderId)
            } else {
                console.log(message.senderId)
            }
        })
    }

    initializeUsersListeners($users) {
        $users.forEach($user => {
            $user.addEventListener('click', () => {
                console.log($user);
                this.activateChat($user);
            });
        });
    }

    showNewNotification(userId) {
        /* this.$usersList
            .querySelector(`div[data-id="${userId}"]`)
            .classList.remove('has-new-notification'); */
    }

    activateChat($user) {
        const userId = $user.dataset.id;

        if (this.activateChatId) {
            this.$usersList
                .querySelector(`div[data-id="${this.activateChatId}"]`)
                .classList.remove('active');
        }

        /* this.$usersList
            .querySelector(`div[data-id="${userId}"]`)
            .classList.remove("has-new-notification"); */

        this.activateChatId = userId;
        $user.classList.add('active');
        this.$textInput.classList.remove('hidden');

        this.renderMessages(userId);
        
        this.$textInput.addEventListener('keyup', (e) => {
            if(e.key === "Enter") {
                const message = {
                    text: this.$textInput.value,
                    recipientId: this.activateChatId
                }

                socket.emit('new-chat-message', message);
                this.addMessage(message.text, message.recipientId);
                this.renderMessages(message.recipientId);
                this.$textInput.value = "";
            }
        });
        
    }

    addMessage(text, userId) {
        if (!this.messages[userId]) {
            this.messages[userId] = []
        }
        
        this.messages[userId].push(text);
    }

    renderMessages(userId) {
        this.$messagesList.innerHTML = "";

        if (!this.messages[userId]) {
            this.messages[userId] = []
        }

        const $messages = this.messages[userId].map((message) => {
            const $message = document.createElement('div');
            $message.textContent = message;
            return $message;
        })

        this.$messagesList.append(...$messages);

        console.log(this.messages)
    }
    
    async fetchUsers() {
        const res = await fetch('/users');
        return await res.json();
    }

    renderUsers(users) {
        this.users = users.filter((user) => user.id !== socket.id);

        this.$usersList.innerHTML = '';
        const $users = this.users.map(user => {
            const $user = document.createElement('div');
            $user.textContent = user.name; 
            $user.dataset.id = user.id;

            return $user;
        });

        this.$usersList.append(...$users);
        this.initializeUsersListeners($users);
    }
}