<template>
  <div class="jobs-container">
    <div class="jobs-header">
      <h1>Alumni Job Board</h1>
      <div class="jobs-stats">
        <div class="stat-card">
          <h3>{{ activeJobsCount }}</h3>
          <p>Active Jobs</p>
        </div>
        <div class="stat-card">
          <h3>{{ companiesHiring }}</h3>
          <p>Companies Hiring</p>
        </div>
        <div class="stat-card">
          <h3>{{ successRate }}%</h3>
          <p>Placement Success</p>
        </div>
      </div>
    </div>

    <div class="jobs-filters">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search jobs by title, company, or skills"
      >
      <select v-model="selectedDepartment">
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept">{{ dept }}</option>
      </select>
      <select v-model="selectedJobType">
        <option value="">All Job Types</option>
        <option v-for="type in jobTypes" :key="type">{{ type }}</option>
      </select>
    </div>

    <div class="featured-jobs">
      <h2>Featured Job Opportunities</h2>
      <div class="featured-jobs-grid">
        <div 
          v-for="job in featuredJobs" 
          :key="job.id" 
          class="featured-job-card"
        >
          <div class="featured-job-header">
            <img :src="job.companyLogo" :alt="job.company" class="company-logo">
            <div class="job-title-info">
              <h3>{{ job.title }}</h3>
              <p>{{ job.company }} • {{ job.location }}</p>
            </div>
          </div>
          <div class="featured-job-details">
            <div class="job-meta">
              <span>
                <i class="fas fa-briefcase"></i> {{ job.type }}
              </span>
              <span>
                <i class="fas fa-dollar-sign"></i> {{ job.salaryRange }}
              </span>
            </div>
            <button 
              class="quick-apply-btn" 
              @click="openJobDetailsModal(job)"
            >
              Quick Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="jobs-grid">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id" 
        class="job-card"
      >
        <div class="job-card-header">
          <img :src="job.companyLogo" :alt="job.company" class="company-logo">
          <div class="job-info">
            <h3>{{ job.title }}</h3>
            <p>{{ job.company }} • {{ job.location }}</p>
          </div>
        </div>
        
        <div class="job-card-details">
          <div class="job-meta">
            <span>
              <i class="fas fa-briefcase"></i> {{ job.type }}
            </span>
            <span>
              <i class="fas fa-map-marker-alt"></i> {{ job.location }}
            </span>
            <span>
              <i class="fas fa-dollar-sign"></i> {{ job.salaryRange }}
            </span>
          </div>
          
          <div class="skills-tags">
            <span 
              v-for="skill in job.requiredSkills" 
              :key="skill" 
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>
          
          <button 
            class="quick-apply-btn" 
            @click="openJobDetailsModal(job)"
          >
            Quick Apply
          </button>
        </div>
      </div>
    </div>

    <JobDetailsModal 
      v-if="selectedJob" 
      :job="selectedJob"
      @close="closeJobDetailsModal"
      @apply="applyForJob"
    />
    <button class="back-button" @click="goToHome">Back to Home</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import JobDetailsModal from '@/components/JobDetailsModal.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedJobType = ref('')

const departments = [
  'Computer Science', 'Engineering', 'Business', 
  'Design', 'Data Science', 'Marketing'
]

const jobTypes = [
  'Full-time', 'Part-time', 'Contract', 
  'Internship', 'Remote', 'Hybrid'
]

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
])

const selectedJob = ref(null)

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      job.requiredSkills.some(skill => skill.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesDepartment = !selectedDepartment.value || job.department === selectedDepartment.value
    const matchesType = !selectedJobType.value || job.type === selectedJobType.value
    
    return matchesSearch && matchesDepartment && matchesType
  })
})

const featuredJobs = computed(() => {
  return jobs.value.slice(0, 2)
})

const activeJobsCount = computed(() => jobs.value.length)
const companiesHiring = computed(() => new Set(jobs.value.map(job => job.company)).size)
const successRate = computed(() => 85)

function openJobDetailsModal(job) {
  selectedJob.value = job
}

function closeJobDetailsModal() {
  selectedJob.value = null
}

function applyForJob(jobData) {
  // Placeholder for job application logic
  console.log('Applying for job:', jobData)
  alert(`Application submitted for ${jobData.jobTitle}`)
  closeJobDetailsModal()
}

const goToHome = () => {
  router.push('/')
}

// Add keyboard event listener to close modal with Esc key
const handleEscKey = (event) => {
  if (event.key === 'Escape' && selectedJob.value) {
    closeJobDetailsModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscKey)
})
</script>

<style scoped>
.jobs-container {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9fafb;
}

.jobs-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
}

.jobs-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.jobs-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.jobs-filters input,
.jobs-filters select {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex: 1;
}

.featured-jobs {
  margin-bottom: 40px;
}

.featured-jobs h2 {
  margin-bottom: 20px;
  color: #1f2937;
}

.featured-jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.featured-job-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.featured-job-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.company-logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.job-title-info h3 {
  margin: 0 0 5px;
  color: #1f2937;
  font-size: 1.1rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.job-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.job-card:hover {
  transform: translateY(-2px);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6b7280;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
}

.skill-tag {
  background-color: #f3f4f6;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #4b5563;
}

.quick-apply-btn {
  width: 100%;
  padding: 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quick-apply-btn:hover {
  background-color: #1d4ed8;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #1d4ed8;
}
</style>
