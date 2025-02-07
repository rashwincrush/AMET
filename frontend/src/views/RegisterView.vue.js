import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const graduationYear = ref('');
const department = ref('');
const showPassword = ref(false);
const graduationYears = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => 1990 + i).reverse();
const departments = [
    'Computer Science',
    'Engineering',
    'Business',
    'Design',
    'Data Science',
    'Marketing'
];
const register = () => {
    // Here you would typically make an API call to register the user
    console.log('Registration data:', {
        name: name.value,
        email: email.value,
        password: password.value,
        graduationYear: graduationYear.value,
        department: department.value
    });
    // For now, just redirect to login
    router.push('/login');
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['register-form', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group', 'register-btn', 'login-link', 'login-link',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("register-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("register-form-wrapper") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.register) },
        ...{ class: ("register-form") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("name"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("text"),
        id: ("name"),
        value: ((__VLS_ctx.name)),
        required: (true),
        placeholder: ("Enter your full name"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("email"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("email"),
        id: ("email"),
        required: (true),
        placeholder: ("Enter your email"),
    });
    (__VLS_ctx.email);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("password"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("password-input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ((__VLS_ctx.showPassword ? 'text' : 'password')),
        id: ("password"),
        required: (true),
        placeholder: ("Enter your password"),
    });
    (__VLS_ctx.password);
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
            } },
        type: ("button"),
        ...{ class: ("toggle-password") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
        ...{ class: ((__VLS_ctx.showPassword ? 'fas fa-eye-slash' : 'fas fa-eye')) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("graduationYear"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        id: ("graduationYear"),
        value: ((__VLS_ctx.graduationYear)),
        required: (true),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [year] of __VLS_getVForSourceType((__VLS_ctx.graduationYears))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((year)),
            value: ((year)),
        });
        (year);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("form-group") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("department"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        id: ("department"),
        value: ((__VLS_ctx.department)),
        required: (true),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [dept] of __VLS_getVForSourceType((__VLS_ctx.departments))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((dept)),
            value: ((dept)),
        });
        (dept);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: ("submit"),
        ...{ class: ("register-btn") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("login-link") },
    });
    const __VLS_0 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: ("/login"),
    }));
    const __VLS_2 = __VLS_1({
        to: ("/login"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_5.slots.default;
    var __VLS_5;
    ['register-container', 'register-form-wrapper', 'register-form', 'form-group', 'form-group', 'form-group', 'password-input', 'toggle-password', 'form-group', 'form-group', 'register-btn', 'login-link',];
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
            RouterLink: RouterLink,
            name: name,
            email: email,
            password: password,
            graduationYear: graduationYear,
            department: department,
            showPassword: showPassword,
            graduationYears: graduationYears,
            departments: departments,
            register: register,
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
//# sourceMappingURL=RegisterView.vue.js.map