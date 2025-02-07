import { ref, reactive } from 'vue';
const props = defineProps({
    event: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close', 'register']);
const isVisible = ref(true);
const registrationForm = reactive({
    fullName: '',
    email: '',
    graduationYear: null,
    department: '',
    notes: '',
    ticketType: null
});
const graduationYears = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => 1990 + i).reverse();
const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Design',
    'Data Science',
    'Marketing',
    'Other'
];
function closeModal() {
    isVisible.value = false;
    emit('close');
}
function submitRegistration() {
    // Validate form
    if (!registrationForm.ticketType) {
        alert('Please select a ticket type');
        return;
    }
    // Emit registration data
    emit('register', {
        eventId: props.event.id,
        registrationData: { ...registrationForm }
    });
    // Close modal
    closeModal();
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['form-group', 'ticket-type', 'submit-btn',];
    // CSS variable injection 
    // CSS variable injection end 
    if (__VLS_ctx.isVisible) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("event-registration-modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.closeModal) },
            ...{ class: ("close-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.event.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.submitRegistration) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-grid") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((__VLS_ctx.registrationForm.fullName)),
            required: (true),
            placeholder: ("Enter your full name"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("email"),
            required: (true),
            placeholder: ("Enter your email"),
        });
        (__VLS_ctx.registrationForm.email);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.registrationForm.graduationYear)),
            required: (true),
        });
        for (const [year] of __VLS_getVForSourceType((__VLS_ctx.graduationYears))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((year)),
            });
            (year);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.registrationForm.department)),
            required: (true),
        });
        for (const [dept] of __VLS_getVForSourceType((__VLS_ctx.departments))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((dept)),
            });
            (dept);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group full-width") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
            value: ((__VLS_ctx.registrationForm.notes)),
            placeholder: ("Any special requirements or comments?"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("ticket-options") },
        });
        for (const [ticket] of __VLS_getVForSourceType((__VLS_ctx.event.ticketTypes))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("ticket-type") },
                key: ((ticket.type)),
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
                type: ("radio"),
                id: ((ticket.type)),
                value: ((ticket.type)),
            });
            (__VLS_ctx.registrationForm.ticketType);
            __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
                for: ((ticket.type)),
            });
            (ticket.type);
            (ticket.price);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("registration-summary") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.event.date);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.event.time);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.event.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            type: ("submit"),
            ...{ class: ("submit-btn") },
        });
    }
    ['event-registration-modal', 'modal-content', 'close-btn', 'form-grid', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'full-width', 'ticket-options', 'ticket-type', 'registration-summary', 'submit-btn',];
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
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
            isVisible: isVisible,
            registrationForm: registrationForm,
            graduationYears: graduationYears,
            departments: departments,
            closeModal: closeModal,
            submitRegistration: submitRegistration,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            $emit: emit,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=EventRegistrationModal.vue.js.map