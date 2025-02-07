<template>
  <div class="chat-window">
    <div class="chat-header">
      <img :src="recipient.avatar" :alt="recipient.name" class="recipient-avatar">
      <h3>{{ recipient.name }}</h3>
      <div class="chat-actions">
        <button @click="toggleVideoCall" class="video-call-btn">
          <i class="fas fa-video"></i>
        </button>
        <button @click="toggleAudioCall" class="audio-call-btn">
          <i class="fas fa-phone"></i>
        </button>
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="['message', message.sender === currentUser.id ? 'sent' : 'received']"
      >
        <img v-if="message.sender !== currentUser.id" :src="recipient.avatar" class="avatar">
        <div class="message-content">
          <p>{{ message.text }}</p>
          <div v-if="message.file" class="message-file">
            <i class="fas fa-file"></i>
            <span>{{ message.file.name }}</span>
            <button @click="downloadFile(message.file)">Download</button>
          </div>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <div class="input-actions">
        <button @click="openEmojiPicker" class="emoji-btn">
          <i class="far fa-smile"></i>
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileUpload" 
          style="display: none" 
          multiple
        >
        <button @click="triggerFileUpload" class="file-upload-btn">
          <i class="fas fa-paperclip"></i>
        </button>
      </div>
      
      <textarea 
        v-model="newMessage" 
        @keyup.enter="sendMessage" 
        placeholder="Type a message..."
        rows="3"
      ></textarea>
      
      <button @click="sendMessage" class="send-btn">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
    
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-grid">
        <span 
          v-for="emoji in commonEmojis" 
          :key="emoji" 
          @click="addEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

const props = defineProps({
  recipient: {
    type: Object,
    required: true
  }
})

const currentUser = ref({
  id: 1,
  name: 'Current User',
  avatar: '/path/to/current-user-avatar.jpg'
})

const messages = ref([
  {
    id: 1,
    sender: 2,
    text: 'Hey, how are you doing?',
    timestamp: new Date(),
    file: null
  }
])

const newMessage = ref('')
const showEmojiPicker = ref(false)
const messagesContainer = ref(null)

const commonEmojis = [
  '😀', '😍', '👍', '🎉', '❤️', '🤔', '👏', '😢', '🚀', '🌟'
]

function sendMessage() {
  if (newMessage.value.trim() === '') return

  messages.value.push({
    id: messages.value.length + 1,
    sender: currentUser.value.id,
    text: newMessage.value,
    timestamp: new Date(),
    file: null
  })

  newMessage.value = ''
  scrollToBottom()
}

function handleFileUpload(event) {
  const files = event.target.files
  for (let file of files) {
    messages.value.push({
      id: messages.value.length + 1,
      sender: currentUser.value.id,
      text: '',
      timestamp: new Date(),
      file: file
    })
  }
  scrollToBottom()
}

function triggerFileUpload() {
  messagesContainer.value.click()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function openEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function addEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

function toggleVideoCall() {
  // Placeholder for video call functionality
  alert('Video call feature coming soon!')
}

function toggleAudioCall() {
  // Placeholder for audio call functionality
  alert('Audio call feature coming soon!')
}

function downloadFile(file) {
  // Placeholder for file download
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-window {
  width: 400px;
  height: 600px;
  border-radius: 12px;
  background-color: #f9f9fc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.recipient-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
}

.chat-actions button {
  background: none;
  border: none;
  color: #6b7280;
  margin-left: 10px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.chat-actions button:hover {
  color: #3b82f6;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f4f6f9;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message.sent {
  justify-content: flex-end;
}

.message.received .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
}

.message.sent .message-content {
  background-color: #3b82f6;
  color: white;
  align-self: flex-end;
}

.message.received .message-content {
  background-color: #e5e7eb;
  color: #1f2937;
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.input-actions {
  display: flex;
  margin-right: 10px;
}

.input-actions button {
  background: none;
  border: none;
  color: #6b7280;
  margin-right: 10px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.input-actions button:hover {
  color: #3b82f6;
}

textarea {
  flex-grow: 1;
  resize: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  margin-right: 10px;
}

.send-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.send-btn:hover {
  background-color: #2563eb;
}

.emoji-picker {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  max-width: 250px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.emoji-grid span {
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.emoji-grid span:hover {
  transform: scale(1.2);
}

.message-file {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.message-file i {
  margin-right: 10px;
  color: #6b7280;
}

.message-file button {
  margin-left: 10px;
  background-color: #e5e7eb;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
