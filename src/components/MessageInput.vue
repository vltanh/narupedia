<template>
    <div class="message-input">
      <b-container fluid>
        <b-row>
          <b-col cols = "5">
            <b-form-input 
              v-model="message_input"
              type="text"
              placeholder="Enter your message"
              v-on:keyup.enter.native="send_message"
            >
            </b-form-input>
          </b-col>
          <b-col cols = "7">
            <!-- <b-form-file
              accept="image/jpeg"
              v-model="file_input"
              :state="Boolean(file_input)"
              placeholder="Choose a file..."
              drop-placeholder="Drop file here..."
              ref="file-input"
              @change="send_file"
            ></b-form-file> -->
            <label>File
              <input accept="image/jpeg" type="file" id="file" ref="file" v-on:change="handleFileUpload()"/>
            </label>
            <button v-on:click="send_file()">Submit</button>
          </b-col>
        </b-row>
      </b-container>
    </div>
</template>

<script>
export default {
  name: "MessageInput",
  data() {
    return {
      message_input: "",
      file_input: null,
      file: ''
    };
  },
  methods: {
    send_message() {
      if (this.message_input !== "") {
        this.$emit("send_message", this.message_input);
        this.message_input = "";
      }
    },
    handleFileUpload(){
      this.file = this.$refs.file.files[0];
    },
    send_file() {
      this.$emit("send_file", this.file);
      this.$refs.file.type = 'text';
      this.$refs.file.type = 'file';
    },
  }
};
</script>

<style scoped>
.message-input {
  position: absolute;
  bottom: 0px;
  width: 100%;
}
</style>
