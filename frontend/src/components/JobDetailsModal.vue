<template>
  <div class="job-details-modal" v-if="isVisible">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">×</button>
      
      <div class="job-header">
        <img :src="job.companyLogo" :alt="job.company" class="company-logo">
        <div class="job-title-info">
          <h2>{{ job.title }}</h2>
          <p>{{ job.company }} • {{ job.location }}</p>
        </div>
      </div>
      
      <div class="job-details-grid">
        <div class="job-section">
          <h3>Job Overview</h3>
          <div class="job-meta">
            <div class="meta-item">
              <i class="fas fa-briefcase"></i>
              <span>{{ job.type }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ job.schedule }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-dollar-sign"></i>
              <span>{{ job.salaryRange }}</span>
            </div>
          </div>
        </div>
        
        <div class="job-section">
          <h3>Required Qualifications</h3>
          <ul class="qualifications-list">
            <li v-for="qual in job.requiredQualifications" :key="qual">
              {{ qual }}
            </li>
          </ul>
        </div>
      </div>
      
      <div class="job-description">
        <h3>Job Description</h3>
        <p>{{ job.description }}</p>
      </div>
      
      <div class="job-responsibilities">
        <h3>Key Responsibilities</h3>
        <ul>
          <li v-for="resp in job.responsibilities" :key="resp">
            {{ resp }}
          </li>
        </ul>
      </div>
      
      <div class="job-skills">
        <h3>Required Skills</h3>
        <div class="skills-tags">
          <span v-for="skill in job.requiredSkills" :key="skill" class="skill-tag">
            {{ skill }}
          </span>
        </div>
      </div>
      
      <div class="application-process">
        <h3>Application Process</h3>
        <div class="process-steps">
          <div class="step">
            <i class="fas fa-file-upload"></i>
            <span>Upload Resume</span>
          </div>
          <div class="step">
            <i class="fas fa-envelope"></i>
            <span>Submit Cover Letter</span>
          </div>
          <div class="step">
            <i class="fas fa-video"></i>
            <span>Initial Video Interview</span>
          </div>
        </div>
      </div>
      
      <button class="apply-btn" @click="applyForJob">
        Quick Apply
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'apply'])

const isVisible = ref(true)

function closeModal() {
  isVisible.value = false
  emit('close')
}

function applyForJob() {
  emit('apply', {
    jobId: props.job.id,
    jobTitle: props.job.title
  })
  closeModal()
}
</script>

<style scoped>
.job-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
}

.job-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.company-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-right: 20px;
  border-radius: 8px;
}

.job-title-info h2 {
  margin: 0 0 10px;
  color: #1f2937;
}

.job-title-info p {
  color: #6b7280;
  margin: 0;
}

.job-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.job-section h3 {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
  color: #374151;
}

.job-meta {
  display: flex;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.meta-item i {
  margin-right: 8px;
  color: #3b82f6;
}

.qualifications-list, .job-responsibilities ul {
  padding-left: 20px;
  color: #4b5563;
}

.job-description p {
  color: #4b5563;
  line-height: 1.6;
}

.job-skills h3 {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
  color: #374151;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background-color: #e5e7eb;
  color: #4b5563;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.application-process {
  margin-top: 20px;
}

.process-steps {
  display: flex;
  justify-content: space-between;
  background-color: #f4f6f9;
  padding: 20px;
  border-radius: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6b7280;
}

.step i {
  font-size: 24px;
  color: #3b82f6;
  margin-bottom: 10px;
}

.apply-btn {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.apply-btn:hover {
  background-color: #2563eb;
}
</style>
