import { ref, computed } from 'vue';
import { RouterView, RouterLink, useRouter } from 'vue-router';
import logo from '@/assets/logo.svg';
const isAuthenticated = ref(true);
const userName = ref('John Doe');
const userProfilePicture = ref('https://randomuser.me/api/portraits/men/32.jpg');
const router = useRouter();
const logout = () => {
    isAuthenticated.value = false;
    router.push('/login');
};
// Simulated authentication check
const checkAuthentication = () => {
    // In a real app, this would check for a valid token
    const token = localStorage.getItem('authToken');
    isAuthenticated.value = !!token;
};
// Call on component mount
checkAuthentication(); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: ("app"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: ("main-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logo") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ((__VLS_ctx.logo)),
        alt: ("Alumni Management SaaS"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    if (__VLS_ctx.isAuthenticated) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
            ...{ class: ("main-nav") },
        });
        const __VLS_0 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            to: ("/"),
            ...{ class: ("nav-item") },
            exactActiveClass: ("active"),
        }));
        const __VLS_2 = __VLS_1({
            to: ("/"),
            ...{ class: ("nav-item") },
            exactActiveClass: ("active"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-home") },
        });
        __VLS_5.slots.default;
        var __VLS_5;
        const __VLS_6 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            to: ("/alumni"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }));
        const __VLS_8 = __VLS_7({
            to: ("/alumni"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-users") },
        });
        __VLS_11.slots.default;
        var __VLS_11;
        const __VLS_12 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            to: ("/events"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }));
        const __VLS_14 = __VLS_13({
            to: ("/events"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-calendar-alt") },
        });
        __VLS_17.slots.default;
        var __VLS_17;
        const __VLS_18 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.RouterLink, ] } */ ;
        // @ts-ignore
        const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
            to: ("/jobs"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }));
        const __VLS_20 = __VLS_19({
            to: ("/jobs"),
            ...{ class: ("nav-item") },
            activeClass: ("active"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_19));
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-briefcase") },
        });
        __VLS_23.slots.default;
        var __VLS_23;
    }
    if (__VLS_ctx.isAuthenticated) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("user-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("user-profile") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
            src: ((__VLS_ctx.userProfilePicture)),
            alt: ("Profile"),
            ...{ class: ("profile-pic") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.userName);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.logout) },
            ...{ class: ("logout-btn") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-sign-out-alt") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: ("main-content") },
    });
    const __VLS_24 = {}.RouterView;
    /** @type { [typeof __VLS_components.RouterView, ] } */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_elementAsFunction(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: ("main-footer") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("footer-content") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("footer-links") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: ("#"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: ("#"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
        href: ("#"),
    });
    ['main-header', 'logo', 'main-nav', 'nav-item', 'fas', 'fa-home', 'nav-item', 'fas', 'fa-users', 'nav-item', 'fas', 'fa-calendar-alt', 'nav-item', 'fas', 'fa-briefcase', 'user-actions', 'user-profile', 'profile-pic', 'logout-btn', 'fas', 'fa-sign-out-alt', 'main-content', 'main-footer', 'footer-content', 'footer-links',];
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
            RouterView: RouterView,
            RouterLink: RouterLink,
            logo: logo,
            isAuthenticated: isAuthenticated,
            userName: userName,
            userProfilePicture: userProfilePicture,
            logout: logout,
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
//# sourceMappingURL=App.vue.js.map