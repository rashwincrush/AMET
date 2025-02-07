import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import EventRegistrationModal from '@/components/EventRegistrationModal.vue';
const router = useRouter();
const searchQuery = ref('');
const selectedEventType = ref('');
const selectedMonth = ref('');
const eventTypes = [
    'Networking', 'Workshop', 'Career Fair',
    'Seminar', 'Conference', 'Social Event'
];
const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
];
const events = ref([
    {
        id: 1,
        title: 'AI & Machine Learning Workshop',
        type: 'Workshop',
        date: 'February 20, 2025',
        time: '10:00 AM - 4:00 PM PST',
        location: 'Silicon Valley, CA',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        shortDescription: 'Deep dive into the latest AI and Machine Learning trends.',
        description: 'A comprehensive workshop exploring cutting-edge AI technologies, machine learning algorithms, and their real-world applications.',
        ticketTypes: [
            { type: 'Standard', price: 50 },
            { type: 'Premium', price: 100 }
        ]
    },
    {
        id: 2,
        title: 'Spring Career Fair 2025',
        type: 'Career Fair',
        date: 'March 10, 2025',
        time: '9:00 AM - 5:00 PM PST',
        location: 'Online Event',
        image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        shortDescription: 'Connect with top tech companies and explore job opportunities.',
        description: 'An exclusive online career fair featuring top tech companies, networking sessions, and direct recruitment opportunities.',
        ticketTypes: [
            { type: 'Attendee', price: 25 },
            { type: 'Recruiter', price: 200 }
        ]
    },
    {
        id: 3,
        title: 'Tech Leadership Summit',
        type: 'Conference',
        date: 'April 15, 2025',
        time: '8:00 AM - 6:00 PM PST',
        location: 'San Francisco, CA',
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        shortDescription: 'Learn from industry leaders about tech management and leadership.',
        description: 'Join top tech executives and thought leaders for a day of insights, networking, and leadership development.',
        ticketTypes: [
            { type: 'Early Bird', price: 150 },
            { type: 'Regular', price: 250 },
            { type: 'VIP', price: 500 }
        ]
    }
]);
const selectedEvent = ref(null);
const filteredEvents = computed(() => {
    return events.value.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesType = !selectedEventType.value || event.type === selectedEventType.value;
        const matchesMonth = !selectedMonth.value || event.date.includes(selectedMonth.value);
        return matchesSearch && matchesType && matchesMonth;
    });
});
const featuredEvent = computed(() => events.value[0]);
const upcomingEventsCount = computed(() => events.value.length);
const pastEventsCount = computed(() => 5); // Mock data
const totalParticipants = computed(() => 500); // Mock data
function openRegistrationModal(event) {
    selectedEvent.value = event;
}
function closeRegistrationModal() {
    selectedEvent.value = null;
}
function submitRegistration(registrationData) {
    // Placeholder for registration submission logic
    console.log('Registration submitted:', registrationData);
    alert('Registration successful!');
    closeRegistrationModal();
}
const goToHome = () => {
    router.push('/');
};
// Add keyboard event listener to close modal with Esc key
const handleEscKey = (event) => {
    if (event.key === 'Escape' && selectedEvent.value) {
        closeRegistrationModal();
    }
};
onMounted(() => {
    window.addEventListener('keydown', handleEscKey);
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleEscKey);
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['stat-card', 'events-filters', 'events-filters', 'events-filters', 'featured-event-image', 'featured-event-details', 'event-meta', 'event-card', 'event-card-image', 'event-card-details', 'event-details', 'register-btn',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("events-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("events-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("events-stats") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.upcomingEventsCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.pastEventsCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.totalParticipants);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("events-filters") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.searchQuery)),
        placeholder: ("Search events by name or type"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.selectedEventType)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [type] of __VLS_getVForSourceType((__VLS_ctx.eventTypes))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((type)),
        });
        (type);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.selectedMonth)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [month] of __VLS_getVForSourceType((__VLS_ctx.months))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((month)),
        });
        (month);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goToHome) },
    });
    if (__VLS_ctx.featuredEvent) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-event") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-event-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-event-image") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((__VLS_ctx.featuredEvent.image)),
            alt: ((__VLS_ctx.featuredEvent.title)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-event-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("featured-badge") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.featuredEvent.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.featuredEvent.description);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-meta") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-calendar") },
        });
        (__VLS_ctx.featuredEvent.date);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-map-marker-alt") },
        });
        (__VLS_ctx.featuredEvent.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.featuredEvent)))
                        return;
                    __VLS_ctx.openRegistrationModal(__VLS_ctx.featuredEvent);
                } },
            ...{ class: ("register-btn") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("events-grid") },
    });
    for (const [event] of __VLS_getVForSourceType((__VLS_ctx.filteredEvents))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((event.id)),
            ...{ class: ("event-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-card-image") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((event.image)),
            alt: ((event.title)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("event-type-badge") },
        });
        (event.type);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-card-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (event.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-calendar") },
        });
        (event.date);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-map-marker-alt") },
        });
        (event.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (event.shortDescription);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openRegistrationModal(event);
                } },
            ...{ class: ("register-btn") },
        });
    }
    if (__VLS_ctx.selectedEvent) {
        // @ts-ignore
        /** @type { [typeof EventRegistrationModal, ] } */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(EventRegistrationModal, new EventRegistrationModal({
            ...{ 'onClose': {} },
            ...{ 'onRegister': {} },
            event: ((__VLS_ctx.selectedEvent)),
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onClose': {} },
            ...{ 'onRegister': {} },
            event: ((__VLS_ctx.selectedEvent)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onClose: (__VLS_ctx.closeRegistrationModal)
        };
        const __VLS_7 = {
            onRegister: (__VLS_ctx.submitRegistration)
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    ['events-container', 'events-header', 'events-stats', 'stat-card', 'stat-card', 'stat-card', 'events-filters', 'featured-event', 'featured-event-content', 'featured-event-image', 'featured-event-details', 'featured-badge', 'event-meta', 'fas', 'fa-calendar', 'fas', 'fa-map-marker-alt', 'register-btn', 'events-grid', 'event-card', 'event-card-image', 'event-type-badge', 'event-card-details', 'event-details', 'fas', 'fa-calendar', 'fas', 'fa-map-marker-alt', 'register-btn',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
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
            EventRegistrationModal: EventRegistrationModal,
            searchQuery: searchQuery,
            selectedEventType: selectedEventType,
            selectedMonth: selectedMonth,
            eventTypes: eventTypes,
            months: months,
            selectedEvent: selectedEvent,
            filteredEvents: filteredEvents,
            featuredEvent: featuredEvent,
            upcomingEventsCount: upcomingEventsCount,
            pastEventsCount: pastEventsCount,
            totalParticipants: totalParticipants,
            openRegistrationModal: openRegistrationModal,
            closeRegistrationModal: closeRegistrationModal,
            submitRegistration: submitRegistration,
            goToHome: goToHome,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=EventsView.vue.js.map