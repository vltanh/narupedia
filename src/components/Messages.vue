<template>
    <div class="messages">
      <div v-for="(message, id) in messages" v-bind:key="id"> 
          <img v-if="message.type == 'Image'" :src="message.message" class="chat-message col-md-5"
          v-bind:class="[(message.from_user == active_chat) ? 'to-message' : 'from-message offset-md-7']" />
          <div v-else-if="message.type == 'Text'" class="chat-message col-md-5" 
            v-bind:class="[(message.from_user == active_chat) ? 'to-message' : 'from-message offset-md-7']">
            {{message.message}}
          </div> 
      </div>
    </div>
</template>
<script>
export default {
  name: "Messages",
  props: {
    messages: Array,
    active_chat: Number
  }
};
</script>
<style>
.from-message {
  background: #3498db;
  color: white;
  padding: 8px 8px;
  margin-bottom: 4px;
}
.to-message {
  background: rgb(201, 209, 209);
  color: rgb(41, 53, 52);
  padding: 8px 8px;
  margin-bottom: 4px;
}
</style>