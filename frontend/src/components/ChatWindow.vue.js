import { ref, reactive, onMounted, nextTick } from 'vue';
const props = defineProps({
    recipient: {
        type: Object,
        required: true
    }
});
const currentUser = ref({
    id: 1,
    name: 'Current User',
    avatar: '/path/to/current-user-avatar.jpg'
});
const messages = ref([
    {
        id: 1,
        sender: 2,
        text: 'Hey, how are you doing?',
        timestamp: new Date(),
        file: null
    }
]);
const newMessage = ref('');
const showEmojiPicker = ref(false);
const messagesContainer = ref(null);
const commonEmojis = [
    '😀', '😍', '👍', '🎉', '❤️', '🤔', '👏', '😢', '🚀', '🌟'
];
function sendMessage() {
    if (newMessage.value.trim() === '')
        return;
    messages.value.push({
        id: messages.value.length + 1,
        sender: currentUser.value.id,
        text: newMessage.value,
        timestamp: new Date(),
        file: null
    });
    newMessage.value = '';
    scrollToBottom();
}
function handleFileUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        messages.value.push({
            id: messages.value.length + 1,
            sender: currentUser.value.id,
            text: '',
            timestamp: new Date(),
            file: file
        });
    }
    scrollToBottom();
}
function triggerFileUpload() {
    messagesContainer.value.click();
}
function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function openEmojiPicker() {
    showEmojiPicker.value = !showEmojiPicker.value;
}
function addEmoji(emoji) {
    newMessage.value += emoji;
    showEmojiPicker.value = false;
}
function toggleVideoCall() {
    // Placeholder for video call functionality
    alert('Video call feature coming soon!');
}
function toggleAudioCall() {
    // Placeholder for audio call functionality
    alert('Audio call feature coming soon!');
}
function downloadFile(file) {
    // Placeholder for file download
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
onMounted(() => {
    scrollToBottom();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['chat-actions', 'message', 'message', 'message', 'sent', 'message-content', 'message', 'received', 'message-content', 'input-actions', 'input-actions', 'send-btn', 'emoji-grid', 'emoji-grid', 'message-file', 'message-file',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chat-window") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chat-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
        src: ((__VLS_ctx.recipient.avatar)),
        alt: ((__VLS_ctx.recipient.name)),
        ...{ class: ("recipient-avatar") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.recipient.name);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chat-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleVideoCall) },
        ...{ class: ("video-call-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("fas fa-video") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleAudioCall) },
        ...{ class: ("audio-call-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("fas fa-phone") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chat-messages") },
        ref: ("messagesContainer"),
    });
    // @ts-ignore navigation for `const messagesContainer = ref()`
    /** @type { typeof __VLS_ctx.messagesContainer } */ ;
    for (const [message] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((message.id)),
            ...{ class: ((['message', message.sender === __VLS_ctx.currentUser.id ? 'sent' : 'received'])) },
        });
        if (message.sender !== __VLS_ctx.currentUser.id) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
                src: ((__VLS_ctx.recipient.avatar)),
                ...{ class: ("avatar") },
            });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("message-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (message.text);
        if (message.file) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("message-file") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
                ...{ class: ("fas fa-file") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (message.file.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((message.file)))
                            return;
                        __VLS_ctx.downloadFile(message.file);
                    } },
            });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("timestamp") },
        });
        (__VLS_ctx.formatTime(message.timestamp));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("chat-input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("input-actions") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openEmojiPicker) },
        ...{ class: ("emoji-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("far fa-smile") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        type: ("file"),
        ref: ("fileInput"),
        ...{ style: ({}) },
        multiple: (true),
    });
    // @ts-ignore navigation for `const fileInput = ref()`
    /** @type { typeof __VLS_ctx.fileInput } */ ;
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.triggerFileUpload) },
        ...{ class: ("file-upload-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("fas fa-paperclip") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        ...{ onKeyup: (__VLS_ctx.sendMessage) },
        value: ((__VLS_ctx.newMessage)),
        placeholder: ("Type a message..."),
        rows: ("3"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.sendMessage) },
        ...{ class: ("send-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("fas fa-paper-plane") },
    });
    if (__VLS_ctx.showEmojiPicker) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("emoji-picker") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("emoji-grid") },
        });
        for (const [emoji] of __VLS_getVForSourceType((__VLS_ctx.commonEmojis))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.showEmojiPicker)))
                            return;
                        __VLS_ctx.addEmoji(emoji);
                    } },
                key: ((emoji)),
            });
            (emoji);
        }
    }
    ['chat-window', 'chat-header', 'recipient-avatar', 'chat-actions', 'video-call-btn', 'fas', 'fa-video', 'audio-call-btn', 'fas', 'fa-phone', 'chat-messages', 'message', 'avatar', 'message-content', 'message-file', 'fas', 'fa-file', 'timestamp', 'chat-input', 'input-actions', 'emoji-btn', 'far', 'fa-smile', 'file-upload-btn', 'fas', 'fa-paperclip', 'send-btn', 'fas', 'fa-paper-plane', 'emoji-picker', 'emoji-grid',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'messagesContainer': __VLS_nativeElements['div'],
        'fileInput': __VLS_nativeElements['input'],
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            currentUser: currentUser,
            messages: messages,
            newMessage: newMessage,
            showEmojiPicker: showEmojiPicker,
            messagesContainer: messagesContainer,
            commonEmojis: commonEmojis,
            sendMessage: sendMessage,
            handleFileUpload: handleFileUpload,
            triggerFileUpload: triggerFileUpload,
            formatTime: formatTime,
            openEmojiPicker: openEmojiPicker,
            addEmoji: addEmoji,
            toggleVideoCall: toggleVideoCall,
            toggleAudioCall: toggleAudioCall,
            downloadFile: downloadFile,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=ChatWindow.vue.js.map