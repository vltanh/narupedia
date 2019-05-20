<template>
  <div id="app">
    <Login v-if="!authenticated" v-on:authenticated="setAuthenticated" />
    <b-container v-else>
      <NavBar :logged_user="logged_user_username" />
      <b-row class="main-area">
        <b-col cols="3" class="users">
          <Users :users="users" v-on:chat="chat" />
        </b-col>
        <b-col cols="9" class="messages-area">
          <div class="messages-main" v-chat-scroll="{always: false, smooth: true, scrollonremoved:true}">
            <div v-if="loading_model"
              class="select-chat text-center"
            >
              Loading model...
            </div>
            <div 
              v-else-if="!current_chat_channel" 
              class="select-chat text-center"
            >
              Select your favorite bot!
            </div>
            <Messages 
              v-else 
              :active_chat="active_chat_id" 
              :messages="messages[current_chat_channel]"
            /> 
          </div>
          <MessageInput v-on:send_message="send_message" v-on:send_file="send_file" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import MessageInput from "./components/MessageInput.vue";
import Messages from "./components/Messages.vue";
import NavBar from "./components/NavBar.vue";
import Login from "./components/Login.vue";
import Users from "./components/Users.vue";
import Pusher from "pusher-js";
// Declare pusher variable so it's global to this file.
let pusher;
export default {
  name: "app",
  components: {
    MessageInput,
    NavBar,
    Messages,
    Users,
    Login
  },
  data: function() {
    return {
      loading_model: false,
      authenticated: false,
      messages: {},
      users: [],
      active_chat_id: null,
      active_chat_index: null,
      logged_user_id: null,
      logged_user_username: null,
      current_chat_channel: null
    };
  },
  methods: {
    async setAuthenticated(login_status, user_data) {
      this.logged_user_id = user_data.id;
      this.logged_user_username = user_data.username;
      this.authenticated = login_status;
      this.token = user_data.token;

      pusher = new Pusher(process.env.VUE_APP_PUSHER_KEY, {
          cluster: process.env.VUE_APP_PUSHER_CLUSTER,
          authEndpoint: "/api/pusher/auth",
          auth: {
            headers: {
              Authorization: "Bearer " + this.token
            }
          }
      });

      // Get all the users from the server
      const users = await this.axios.get("/api/users", {
        headers: { Authorization: "Bearer " + this.token }
      });

      // Get all users excluding the current logged user
      this.users = users.data.filter(
        user => user.userName != user_data.username
      );

      var notifications = pusher.subscribe(
        `private-notification_user_${this.logged_user_id}`
      );

      notifications.bind("new_chat", data => {
        const isSubscribed = pusher.channel(data.channel_name);
        if (!isSubscribed) {
          const one_on_one_chat = pusher.subscribe(data.channel_name);

          this.$set(this.messages, data.channel_name, []);

          one_on_one_chat.bind("new_message", data => {
            // Check if the current chat channel is where the message is coming from
            if (
              data.channel !== this.current_chat_channel &&
              data.from_user !== this.logged_user_id
            ) {
              // Get the index of the user that sent the message
              const index = this.users.findIndex(
                user => user.id == data.from_user
              );
              // Set the has_new_message status of the user to true
              this.$set(this.users, index, {
                ...this.users[index],
                has_new_message: true
              });
            }

            this.messages[data.channel].push({
              type: data.type,
              message: data.message,
              from_user: data.from_user,
              to_user: data.to_user,
              channel: data.channel
            });
          });
        }
      });
    },
    getMessage: function(channel_name) {
      this.axios
        .get(`/api/get_message/${channel_name}`, {
          headers: { Authorization: "Bearer " + this.token }
        })
        .then(response => {
          this.$set(this.messages, channel_name, response.data);
        });
    },
    chat: function(id) {
      this.active_chat_id = id;

      // Get index of the current chatting user...
      this.active_chat_index = this.users.findIndex(
        user => user.id == this.active_chat_id
      );

      // Set the has_new_message status of the user to true
      this.$set(this.users, this.active_chat_index, {
        ...this.users[this.active_chat_index],
        has_new_message: false
      });

      this.loading_model = true;
      this.axios
        .post(
          "/api/request_chat",
          {
            from_user: this.logged_user_id,
            to_user: this.active_chat_id
          },
          { headers: { Authorization: "Bearer " + this.token } }
        )
        .then(response => {
          this.loading_model = false;
          
          this.users[this.active_chat_index]["channel_name"] =
            response.data.channel_name;

          this.current_chat_channel = response.data.channel_name;

          // Get messages on this channel
          this.getMessage(response.data.channel_name);

          var isSubscribed = pusher.channel(response.data.channel_name);

          if (!isSubscribed) {
            var channel = pusher.subscribe(response.data.channel_name);

            this.$set(this.messages, response.data.channel_name, []);

            channel.bind("new_message", data => {
              //Check if the current chat channel is where the message is comming from
              if (
                data.channel !== this.current_chat_channel &&
                data.from_user !== this.logged_user_id
              ) {
                // Set the has_new_message status of the user to true
                this.$set(this.users, this.active_chat_index, {
                  ...this.users[this.active_chat_index],
                  has_new_message: true
                });
              }

              this.messages[response.data.channel_name].push({
                type: data.type,
                message: data.message,
                from_user: data.from_user,
                to_user: data.to_user,
                channel: data.channel
              });
            });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    send_message: function(message) {
      this.axios.post(
        "/api/send_message",
        {
          type: 'Text',
          from_user: this.logged_user_id,
          to_user: this.active_chat_id,
          message: message,
          channel: this.current_chat_channel
        },
        { headers: { Authorization: "Bearer " + this.token } }
      );
    },
    send_file: function(file) {
      let formData = new FormData();
      formData.append('type', 'Image')
      formData.append('from_user', this.logged_user_id);
      formData.append('to_user', this.active_chat_id);
      formData.append('file', file);
      formData.append('channel', this.current_chat_channel);
      this.axios.post(
        "/api/send_file",
        formData,
        { headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: "Bearer " + this.token
          } 
        }
      );
    },
  }
};
</script>

<style>
.messages-main {
  overflow-y: scroll;
  height: 90%;
}
.users {
  padding: 0px !important;
}
.no-margin {
  margin: 0px;
}
.messages-area {
  padding: 0px !important;
  max-height: calc(100vh - 4em) !important;
}
.input-message {
  height: 40px;
}
.active {
  background: #3498db !important;
  border: #3498db !important;
}
.select-chat {
  margin-top: 35vh;
  padding: 8px;
}
.main-area {
  margin: 0px;
  min-height: calc(100vh - 5em) !important;
}
.logged_user {
  color: white;
}
</style>