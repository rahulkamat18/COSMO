// Digital Farm Management Portal - Interactive Frontend
class FarmPortal {
    constructor() {
        this.socket = io();
        this.currentSection = 'dashboard';
        this.farms = [];
        this.alerts = [];
        this.init();
    }

    init() {
        this.setupSocketListeners();
        this.loadInitialData();
        this.initializeCharts();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    setupSocketListeners() {
        this.socket.on('new_alert', (alert) => {
            this.showRealTimeNotification(alert);
            this.updateAlertBadge();
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });
    }

    loadInitialData() {
        // Load farms
        fetch('/api/farms')
            .then(response => response.json())
            .then(data => {
                this.farms = data.farms;
                this.populateFarms();
            });

        // Load alerts
        fetch('/api/alerts')
            .then(response => response.json())
            .then(data => {
                this.alerts = data.alerts;
                this.populateAlerts();
            });

        // Populate risk assessment
        this.populateRiskFactors();
        
        // Populate training modules
        this.populateTrainingModules();
        
        // Populate vet contacts
        this.populateVetContacts();
    }

    updateTime() {
        const now = new Date();
        document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    }

    showRealTimeNotification(alert) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-white border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-sm z-50 slide-in';
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                </div>
                <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">${alert.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="mt-2 text-xs text-blue-600 hover:text-blue-700">Dismiss</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    updateAlertBadge() {
        const badge = document.getElementById('alertBadge');
        const currentCount = parseInt(badge.textContent);
        badge.textContent = currentCount + 1;
    }

    populateFarms() {
        const grid = document.getElementById('farmsGrid');
        grid.innerHTML = this.farms.map(farm => `
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${farm.name}</h3>
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${farm.type === 'poultry' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                        ${farm.type.charAt(0).toUpperCase() + farm.type.slice(1)}
                    </span>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Risk Level:</span>
                        <span class="text-sm font-medium ${farm.riskLevel === 'low' ? 'text-green-600' : farm.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}">
                            ${farm.riskLevel.charAt(0).toUpperCase() + farm.riskLevel.slice(1)}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Last Assessment:</span>
                        <span class="text-sm text-gray-900">2 days ago</span>
                    </div>
                </div>
                <div class="mt-4 flex space-x-2">
                    <button onclick="viewFarmDetails(${farm.id})" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        View Details
                    </button>
                    <button onclick="assessRisk(${farm.id})" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                        Assess Risk
                    </button>
                </div>
            </div>
        `).join('');
    }

    populateAlerts() {
        const alertsList = document.getElementById('alertsList');
        const alertPanel = document.getElementById('alertPanelContent');
        
        const alertsHTML = this.alerts.map(alert => `
            <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 ${alert.severity === 'high' ? 'border-red-500' : alert.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-gray-900">${alert.title}</h4>
                        <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
                        <span class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${alert.severity === 'high' ? 'bg-red-100 text-red-800' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                            ${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Priority
                        </span>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        alertsList.innerHTML = alertsHTML;
        alertPanel.innerHTML = alertsHTML;
    }

    populateRiskFactors() {
        const riskFactors = document.getElementById('riskFactors');
        const factors = [
            { name: 'Animal Health Monitoring', category: 'Health' },
            { name: 'Feed Source Verification', category: 'Feed' },
            { name: 'Visitor Access Control', category: 'Personnel' },
            { name: 'Vehicle Disinfection', category: 'Transport' },
            { name: 'Wildlife Contact Prevention', category: 'Environment' },
            { name: 'Waste Management', category: 'Sanitation' }
        ];

        riskFactors.innerHTML = factors.map((factor, index) => `
            <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-medium text-gray-900">${factor.name}</h4>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${factor.category}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <label class="text-sm text-gray-600">Risk Level:</label>
                    <select class="risk-select border border-gray-300 rounded px-3 py-1 text-sm" data-factor="${index}">
                        <option value="1">Low (1)</option>
                        <option value="2">Medium-Low (2)</option>
                        <option value="3">Medium (3)</option>
                        <option value="4">Medium-High (4)</option>
                        <option value="5">High (5)</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    populateTrainingModules() {
        const modules = document.getElementById('trainingModules');
        const trainingData = [
            { title: 'Biosecurity Fundamentals', duration: '45 min', progress: 100, difficulty: 'Beginner' },
            { title: 'Disease Prevention Strategies', duration: '60 min', progress: 75, difficulty: 'Intermediate' },
            { title: 'Emergency Response Protocols', duration: '30 min', progress: 0, difficulty: 'Advanced' },
            { title: 'Compliance Requirements', duration: '40 min', progress: 50, difficulty: 'Intermediate' },
            { title: 'Animal Welfare Standards', duration: '35 min', progress: 25, difficulty: 'Beginner' },
            { title: 'Record Keeping Best Practices', duration: '25 min', progress: 0, difficulty: 'Beginner' }
        ];

        modules.innerHTML = trainingData.map((module, index) => `
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">${module.title}</h3>
                    <span class="px-2 py-1 text-xs font-medium rounded ${module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                        ${module.difficulty}
                    </span>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Duration:</span>
                        <span class="text-gray-900">${module.duration}</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Progress:</span>
                            <span class="text-gray-900">${module.progress}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${module.progress}%"></div>
                        </div>
                    </div>
                </div>
                <button onclick="startTraining(${index})" class="w-full mt-4 ${module.progress === 100 ? 'bg-green-600 hover:bg-green-700' : module.progress > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white py-2 rounded-lg transition-colors">
                    ${module.progress === 100 ? 'Completed' : module.progress > 0 ? 'Continue' : 'Start Training'}
                </button>
            </div>
        `).join('');
    }

    initializeCharts() {
        const ctx = document.getElementById('riskChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    populateVetContacts() {
        const grid = document.getElementById('vetContactsGrid');
        if (!grid) return;
        
        // Sample vet contacts data
        const vetContacts = [
            {
                id: 1,
                name: 'Dr. Sarah Johnson',
                specialization: 'Poultry Specialist',
                phone: '+1-555-0123',
                email: 'sarah.johnson@vetclinic.com',
                address: '123 Farm Road, Agricultural District',
                distance: '2.5 km',
                isEmergency: true,
                rating: 4.8
            },
            {
                id: 2,
                name: 'Dr. Michael Chen',
                specialization: 'Swine Specialist',
                phone: '+1-555-0456',
                email: 'michael.chen@animalcare.com',
                address: '456 Livestock Avenue, Rural Area',
                distance: '5.2 km',
                isEmergency: false,
                rating: 4.6
            },
            {
                id: 3,
                name: 'Dr. Priya Sharma',
                specialization: 'General Veterinary',
                phone: '+91-98765-43210',
                email: 'priya.sharma@vetcare.in',
                address: 'Village Health Center, Rural Karnataka',
                distance: '3.8 km',
                isEmergency: true,
                rating: 4.9
            },
            {
                id: 4,
                name: 'Dr. Rajesh Patel',
                specialization: 'Livestock Specialist',
                phone: '+91-87654-32109',
                email: 'rajesh.patel@farmvet.com',
                address: 'Main Road, Agricultural Hub',
                distance: '7.1 km',
                isEmergency: false,
                rating: 4.7
            }
        ];
        
        grid.innerHTML = vetContacts.map(vet => `
            <div class="bg-white rounded-xl p-6 shadow-sm card-hover">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-blue-100 p-3 rounded-full">
                            <i class="fas fa-user-md text-blue-600"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${vet.name}</h3>
                            <p class="text-sm text-gray-600">${vet.specialization}</p>
                            <div class="flex items-center mt-1">
                                <div class="flex items-center">
                                    ${Array(5).fill().map((_, i) => 
                                        `<i class="fas fa-star text-xs ${i < Math.floor(vet.rating) ? 'text-yellow-400' : 'text-gray-300'}"></i>`
                                    ).join('')}
                                </div>
                                <span class="text-xs text-gray-500 ml-1">(${vet.rating})</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        ${vet.isEmergency ? '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-1 block">24/7</span>' : ''}
                        <span class="text-sm font-medium text-green-600">${vet.distance}</span>
                    </div>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-phone w-4 mr-2"></i>
                        <a href="tel:${vet.phone}" class="text-blue-600 hover:text-blue-700">${vet.phone}</a>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-envelope w-4 mr-2"></i>
                        <a href="mailto:${vet.email}" class="text-blue-600 hover:text-blue-700">${vet.email}</a>
                    </div>
                    <div class="flex items-start text-sm text-gray-600">
                        <i class="fas fa-map-marker-alt w-4 mr-2 mt-0.5"></i>
                        <span>${vet.address}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="callVet('${vet.phone}')" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors">
                        <i class="fas fa-phone mr-1"></i>Call
                    </button>
                    <button onclick="getDirections('${vet.address}')" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        <i class="fas fa-directions mr-1"></i>Directions
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Language functions
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    dropdown.classList.toggle('hidden');
}

function changeLanguage(langCode) {
    const langDisplay = document.getElementById('currentLanguage');
    const langNames = {
        'en': 'EN',
        'hi': 'HI', 
        'kn': 'KN'
    };
    
    if (langDisplay) {
        langDisplay.textContent = langNames[langCode] || 'EN';
    }
    
    // Close dropdown
    document.getElementById('languageDropdown').classList.add('hidden');
    
    // Here you would implement actual language translation
    console.log(`Language changed to: ${langCode}`);
    alert(`Language changed to ${langCode.toUpperCase()}. Translation functionality can be implemented here.`);
}

// Vet Contact functions
function addNewVet() {
    const vetName = prompt('Enter veterinarian name:');
    if (vetName) {
        alert(`New vet contact "${vetName}" would be added. This would open a detailed form to add vet information.`);
    }
}

function callVet(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

function getDirections(address) {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#languageDropdown') && !e.target.closest('[onclick="toggleLanguageDropdown()"]')) {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
});

// Global functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        link.classList.add('text-gray-500');
    });
    
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.remove('text-gray-500');
        activeLink.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
    }
}

function toggleAlerts() {
    const panel = document.getElementById('alertPanel');
    panel.classList.toggle('hidden');
}

function calculateRisk() {
    const selects = document.querySelectorAll('.risk-select');
    let totalScore = 0;
    selects.forEach(select => {
        totalScore += parseInt(select.value);
    });
    
    const averageScore = totalScore / selects.length;
    let riskLevel = 'Low';
    let riskColor = 'text-green-600';
    
    if (averageScore > 3.5) {
        riskLevel = 'High';
        riskColor = 'text-red-600';
    } else if (averageScore > 2.5) {
        riskLevel = 'Medium';
        riskColor = 'text-yellow-600';
    }
    
    alert(`Risk Assessment Complete!\n\nOverall Risk Score: ${averageScore.toFixed(1)}/5\nRisk Level: ${riskLevel}\n\nRecommendations will be generated based on your assessment.`);
}

function startTraining(moduleIndex) {
    alert(`Starting training module ${moduleIndex + 1}. This would open the interactive training interface with videos, quizzes, and progress tracking.`);
}

function addNewFarm() {
    const farmName = prompt('Enter farm name:');
    if (farmName) {
        alert(`Farm "${farmName}" would be added to your account. This would open a detailed farm registration form.`);
    }
}

function viewFarmDetails(farmId) {
    alert(`Viewing details for farm ID: ${farmId}. This would show comprehensive farm information, recent assessments, and analytics.`);
}

function assessRisk(farmId) {
    showSection('risk');
    alert(`Starting risk assessment for farm ID: ${farmId}. The form has been pre-loaded with farm-specific data.`);
}

function generateReport() {
    alert('Generating comprehensive farm report with analytics, compliance status, and recommendations. This would create a downloadable PDF report.');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FarmPortal();
});
