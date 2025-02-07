import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const searchQuery = ref('');
const selectedBatch = ref('');
const selectedDepartment = ref('');
const selectedAlumni = ref(null);
const newMessage = ref('');
const chatMessages = ref([]);
const graduationYears = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => 1990 + i).reverse();
const departments = [
    'Computer Science', 'Engineering', 'Business',
    'Design', 'Data Science', 'Marketing'
];
const alumniList = ref([
    {
        id: 1,
        name: 'Sarah Johnson',
        graduationYear: 2023,
        department: 'Computer Science',
        currentJob: 'Senior Software Engineer',
        company: 'Google',
        profilePicture: 'https://randomuser.me/api/portraits/women/79.jpg'
    },
    {
        id: 2,
        name: 'Michael Chen',
        graduationYear: 2022,
        department: 'Data Science',
        currentJob: 'Data Scientist',
        company: 'Tesla',
        profilePicture: 'https://randomuser.me/api/portraits/men/85.jpg'
    },
    {
        id: 3,
        name: 'Emily Rodriguez',
        graduationYear: 2021,
        department: 'Business',
        currentJob: 'Product Manager',
        company: 'Airbnb',
        profilePicture: 'https://randomuser.me/api/portraits/women/50.jpg'
    }
]);
const filteredAlumni = computed(() => {
    return alumniList.value.filter(alumni => {
        const matchesSearch = alumni.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            alumni.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            alumni.department.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesBatch = !selectedBatch.value || alumni.graduationYear.toString() === selectedBatch.value;
        const matchesDepartment = !selectedDepartment.value || alumni.department === selectedDepartment.value;
        return matchesSearch && matchesBatch && matchesDepartment;
    });
});
const totalAlumni = computed(() => alumniList.value.length);
const industriesRepresented = computed(() => 15); // Mock data
const countriesRepresented = computed(() => 10); // Mock data
function openChatWithAlumni(alumni) {
    selectedAlumni.value = alumni;
    chatMessages.value = [
        {
            sender: alumni.name,
            text: `Hi there! I'm ${alumni.name}, a ${alumni.currentJob} at ${alumni.company}.`,
            time: '9:30 AM'
        }
    ];
}
function closeChatModal() {
    selectedAlumni.value = null;
}
function sendMessage() {
    if (!newMessage.value.trim())
        return;
    // Add user's message
    chatMessages.value.push({
        sender: 'me',
        text: newMessage.value,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    // Simulate AI/Alumni response
    setTimeout(() => {
        chatMessages.value.push({
            sender: selectedAlumni.value.name,
            text: `Thanks for reaching out! I'd be happy to chat more about ${selectedAlumni.value.currentJob} at ${selectedAlumni.value.company}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }, 1000);
    newMessage.value = '';
}
const handleEscKey = (event) => {
    if (event.key === 'Escape' && selectedAlumni.value) {
        closeChatModal();
    }
};
onMounted(() => {
    window.addEventListener('keydown', handleEscKey);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleEscKey);
});
const goToHome = () => {
    router.push('/');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['alumni-filters', 'alumni-filters', 'alumni-card', 'alumni-info', 'alumni-meta', 'chat-btn', 'chat-header-info', 'message', 'message', 'message', 'sent', 'message-content', 'message', 'received', 'message-content', 'chat-input',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-stats") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.totalAlumni);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.industriesRepresented);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.countriesRepresented);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-content") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-filters") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.searchQuery)),
        placeholder: ("Search alumni by name, company, or department"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.selectedBatch)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [batch] of __VLS_getVForSourceType((__VLS_ctx.graduationYears))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((batch)),
        });
        (batch);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.selectedDepartment)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [dept] of __VLS_getVForSourceType((__VLS_ctx.departments))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((dept)),
        });
        (dept);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goToHome) },
        ...{ class: ("back-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ("fas fa-arrow-left") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("alumni-grid") },
    });
    for (const [alumni] of __VLS_getVForSourceType((__VLS_ctx.filteredAlumni))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openChatWithAlumni(alumni);
                } },
            key: ((alumni.id)),
            ...{ class: ("alumni-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("alumni-card-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((alumni.profilePicture)),
            alt: ((alumni.name)),
            ...{ class: ("alumni-profile-pic") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("alumni-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (alumni.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (alumni.currentJob);
        (alumni.company);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("alumni-card-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("alumni-meta") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-graduation-cap") },
        });
        (alumni.graduationYear);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-building") },
        });
        (alumni.department);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: ("chat-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-comment") },
        });
    }
    if (__VLS_ctx.selectedAlumni) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((__VLS_ctx.selectedAlumni.profilePicture)),
            alt: ((__VLS_ctx.selectedAlumni.name)),
            ...{ class: ("chat-profile-pic") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-header-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.selectedAlumni.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.selectedAlumni.currentJob);
        (__VLS_ctx.selectedAlumni.company);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeChatModal) },
            ...{ class: ("close-chat-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-times") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-messages") },
            ref: ("chatMessages"),
        });
        // @ts-ignore navigation for `const chatMessages = ref()`
        /** @type { typeof __VLS_ctx.chatMessages } */ ;
        for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: ((index)),
                ...{ class: ((['message', message.sender === 'me' ? 'sent' : 'received'])) },
            });
            if (message.sender !== 'me') {
                __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
                    src: ((__VLS_ctx.selectedAlumni.profilePicture)),
                    alt: ("Alumni Profile"),
                    ...{ class: ("message-profile-pic") },
                });
            }
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("message-content") },
            });
            (message.text);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("message-time") },
            });
            (message.time);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("chat-input") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ onKeyup: (__VLS_ctx.sendMessage) },
            type: ("text"),
            value: ((__VLS_ctx.newMessage)),
            placeholder: ("Type a message..."),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.sendMessage) },
            ...{ class: ("send-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-paper-plane") },
        });
    }
    ['alumni-container', 'alumni-header', 'alumni-stats', 'stat-card', 'stat-card', 'stat-card', 'alumni-content', 'alumni-filters', 'back-btn', 'fas', 'fa-arrow-left', 'alumni-grid', 'alumni-card', 'alumni-card-header', 'alumni-profile-pic', 'alumni-info', 'alumni-card-details', 'alumni-meta', 'fas', 'fa-graduation-cap', 'fas', 'fa-building', 'chat-btn', 'fas', 'fa-comment', 'chat-modal', 'chat-modal-content', 'chat-header', 'chat-profile-pic', 'chat-header-info', 'close-chat-btn', 'fas', 'fa-times', 'chat-messages', 'message', 'message-profile-pic', 'message-content', 'message-time', 'chat-input', 'send-btn', 'fas', 'fa-paper-plane',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'chatMessages': __VLS_nativeElements['div'],
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
            searchQuery: searchQuery,
            selectedBatch: selectedBatch,
            selectedDepartment: selectedDepartment,
            selectedAlumni: selectedAlumni,
            newMessage: newMessage,
            chatMessages: chatMessages,
            graduationYears: graduationYears,
            departments: departments,
            filteredAlumni: filteredAlumni,
            totalAlumni: totalAlumni,
            industriesRepresented: industriesRepresented,
            countriesRepresented: countriesRepresented,
            openChatWithAlumni: openChatWithAlumni,
            closeChatModal: closeChatModal,
            sendMessage: sendMessage,
            goToHome: goToHome,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=AlumniView.vue.js.map