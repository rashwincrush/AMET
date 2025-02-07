import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import JobDetailsModal from '@/components/JobDetailsModal.vue';
const router = useRouter();
const searchQuery = ref('');
const selectedDepartment = ref('');
const selectedJobType = ref('');
const departments = [
    'Computer Science', 'Engineering', 'Business',
    'Design', 'Data Science', 'Marketing'
];
const jobTypes = [
    'Full-time', 'Part-time', 'Contract',
    'Internship', 'Remote', 'Hybrid'
];
const jobs = ref([
    {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'Google',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png',
        location: 'Mountain View, CA',
        type: 'Full-time',
        salaryRange: '$150K - $250K',
        requiredSkills: ['Python', 'Machine Learning', 'React'],
        department: 'Computer Science',
        description: 'We are looking for an experienced software engineer to join our AI research team.',
        requiredQualifications: [
            'MS or PhD in Computer Science',
            '5+ years of software engineering experience',
            'Strong background in machine learning'
        ],
        responsibilities: [
            'Design and implement machine learning algorithms',
            'Collaborate with cross-functional teams',
            'Develop scalable AI solutions'
        ]
    },
    {
        id: 2,
        title: 'Data Scientist',
        company: 'Tesla',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/2048px-Tesla_Motors.svg.png',
        location: 'Austin, TX',
        type: 'Full-time',
        salaryRange: '$120K - $200K',
        requiredSkills: ['R', 'Statistics', 'Data Visualization'],
        department: 'Data Science',
        description: 'Join our data science team to drive innovation in electric vehicle technology.',
        requiredQualifications: [
            'PhD or MS in Data Science or related field',
            '3+ years of data science experience',
            'Expertise in statistical modeling'
        ],
        responsibilities: [
            'Develop predictive models for vehicle performance',
            'Analyze large-scale automotive datasets',
            'Create data-driven insights for product development'
        ]
    },
    {
        id: 3,
        title: 'UX Designer',
        company: 'Apple',
        companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png',
        location: 'Cupertino, CA',
        type: 'Full-time',
        salaryRange: '$130K - $180K',
        requiredSkills: ['Figma', 'User Research', 'Prototyping'],
        department: 'Design',
        description: 'Create beautiful and intuitive user experiences for Apple products.',
        requiredQualifications: [
            'Bachelor\'s degree in Design or related field',
            '5+ years of UX design experience',
            'Strong portfolio of shipped products'
        ],
        responsibilities: [
            'Design user interfaces for iOS applications',
            'Conduct user research and usability testing',
            'Collaborate with product and engineering teams'
        ]
    }
]);
const selectedJob = ref(null);
const filteredJobs = computed(() => {
    return jobs.value.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            job.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery.value.toLowerCase()));
        const matchesDepartment = !selectedDepartment.value || job.department === selectedDepartment.value;
        const matchesType = !selectedJobType.value || job.type === selectedJobType.value;
        return matchesSearch && matchesDepartment && matchesType;
    });
});
const featuredJobs = computed(() => {
    return jobs.value.slice(0, 2);
});
const activeJobsCount = computed(() => jobs.value.length);
const companiesHiring = computed(() => new Set(jobs.value.map(job => job.company)).size);
const successRate = computed(() => 85);
function openJobDetailsModal(job) {
    selectedJob.value = job;
}
function closeJobDetailsModal() {
    selectedJob.value = null;
}
function applyForJob(jobData) {
    // Placeholder for job application logic
    console.log('Applying for job:', jobData);
    alert(`Application submitted for ${jobData.jobTitle}`);
    closeJobDetailsModal();
}
const goToHome = () => {
    router.push('/');
};
// Add keyboard event listener to close modal with Esc key
const handleEscKey = (event) => {
    if (event.key === 'Escape' && selectedJob.value) {
        closeJobDetailsModal();
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
    ['jobs-filters', 'jobs-filters', 'featured-jobs', 'job-card', 'quick-apply-btn', 'back-button',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("jobs-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("jobs-header") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("jobs-stats") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.activeJobsCount);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.companiesHiring);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("stat-card") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.successRate);
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("jobs-filters") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.searchQuery)),
        placeholder: ("Search jobs by title, company, or skills"),
    });
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: ((__VLS_ctx.selectedJobType)),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (""),
    });
    for (const [type] of __VLS_getVForSourceType((__VLS_ctx.jobTypes))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: ((type)),
        });
        (type);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("featured-jobs") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("featured-jobs-grid") },
    });
    for (const [job] of __VLS_getVForSourceType((__VLS_ctx.featuredJobs))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((job.id)),
            ...{ class: ("featured-job-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-job-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((job.companyLogo)),
            alt: ((job.company)),
            ...{ class: ("company-logo") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-title-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (job.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (job.company);
        (job.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("featured-job-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-meta") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-briefcase") },
        });
        (job.type);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-dollar-sign") },
        });
        (job.salaryRange);
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openJobDetailsModal(job);
                } },
            ...{ class: ("quick-apply-btn") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("jobs-grid") },
    });
    for (const [job] of __VLS_getVForSourceType((__VLS_ctx.filteredJobs))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((job.id)),
            ...{ class: ("job-card") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-card-header") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
            src: ((job.companyLogo)),
            alt: ((job.company)),
            ...{ class: ("company-logo") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (job.title);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (job.company);
        (job.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-card-details") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("job-meta") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-briefcase") },
        });
        (job.type);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-map-marker-alt") },
        });
        (job.location);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
            ...{ class: ("fas fa-dollar-sign") },
        });
        (job.salaryRange);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("skills-tags") },
        });
        for (const [skill] of __VLS_getVForSourceType((job.requiredSkills))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: ((skill)),
                ...{ class: ("skill-tag") },
            });
            (skill);
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.openJobDetailsModal(job);
                } },
            ...{ class: ("quick-apply-btn") },
        });
    }
    if (__VLS_ctx.selectedJob) {
        // @ts-ignore
        /** @type { [typeof JobDetailsModal, ] } */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(JobDetailsModal, new JobDetailsModal({
            ...{ 'onClose': {} },
            ...{ 'onApply': {} },
            job: ((__VLS_ctx.selectedJob)),
        }));
        const __VLS_1 = __VLS_0({
            ...{ 'onClose': {} },
            ...{ 'onApply': {} },
            job: ((__VLS_ctx.selectedJob)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        let __VLS_5;
        const __VLS_6 = {
            onClose: (__VLS_ctx.closeJobDetailsModal)
        };
        const __VLS_7 = {
            onApply: (__VLS_ctx.applyForJob)
        };
        let __VLS_2;
        let __VLS_3;
        var __VLS_4;
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goToHome) },
        ...{ class: ("back-button") },
    });
    ['jobs-container', 'jobs-header', 'jobs-stats', 'stat-card', 'stat-card', 'stat-card', 'jobs-filters', 'featured-jobs', 'featured-jobs-grid', 'featured-job-card', 'featured-job-header', 'company-logo', 'job-title-info', 'featured-job-details', 'job-meta', 'fas', 'fa-briefcase', 'fas', 'fa-dollar-sign', 'quick-apply-btn', 'jobs-grid', 'job-card', 'job-card-header', 'company-logo', 'job-info', 'job-card-details', 'job-meta', 'fas', 'fa-briefcase', 'fas', 'fa-map-marker-alt', 'fas', 'fa-dollar-sign', 'skills-tags', 'skill-tag', 'quick-apply-btn', 'back-button',];
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
            JobDetailsModal: JobDetailsModal,
            searchQuery: searchQuery,
            selectedDepartment: selectedDepartment,
            selectedJobType: selectedJobType,
            departments: departments,
            jobTypes: jobTypes,
            selectedJob: selectedJob,
            filteredJobs: filteredJobs,
            featuredJobs: featuredJobs,
            activeJobsCount: activeJobsCount,
            companiesHiring: companiesHiring,
            successRate: successRate,
            openJobDetailsModal: openJobDetailsModal,
            closeJobDetailsModal: closeJobDetailsModal,
            applyForJob: applyForJob,
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
//# sourceMappingURL=JobsView.vue.js.map