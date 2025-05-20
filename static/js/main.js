document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const milestoneForm = document.getElementById('milestone-form');
    const milestonesContainer = document.getElementById('milestones-container');
    const milestoneTemplate = document.getElementById('milestone-template');
    const calendarBody = document.getElementById('calendar-body');
    const currentMonthDisplay = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const surpriseBtn = document.getElementById('surprise-btn');
    const modal = document.getElementById('surprise-modal');
    const closeBtn = document.querySelector('.close-btn');
    
    // Calendar state
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let allMilestones = [];
    
    // Initialize to anniversary date if no milestones exist
    // Fix timezone issues by manually setting hours to noon to avoid date shifting
    const initAnniversaryDate = new Date('2025-05-20T12:00:00');
    const anniversaryMonth = initAnniversaryDate.getMonth();
    const anniversaryYear = initAnniversaryDate.getFullYear();
    
    // Set initial month to anniversary date month
    currentMonth = anniversaryMonth;
    currentYear = anniversaryYear; // Set to 2025 since that's our target year
    
    // Load milestones on page load
    loadMilestones();
    
    // Event Listeners
    milestoneForm.addEventListener('submit', handleFormSubmit);
    milestonesContainer.addEventListener('click', handleMilestoneAction);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    surpriseBtn.addEventListener('click', showSurprise);
    closeBtn.addEventListener('click', closeSurprise);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSurprise();
        }
    });
    
    // Fetch and display milestones
    function loadMilestones() {
        fetch('/api/milestones')
            .then(response => response.json())
            .then(milestones => {
                allMilestones = milestones;
                milestonesContainer.innerHTML = '';
                
                if (milestones.length === 0) {
                    milestonesContainer.innerHTML = '<p class="empty-message">No milestones yet! Add your first milestone above.</p>';
                } else {
                    // Sort milestones by days remaining
                    milestones.sort((a, b) => a.days_remaining - b.days_remaining);
                    
                    milestones.forEach(milestone => {
                        addMilestoneToDOM(milestone);
                    });
                    
                    // Apply animations to the kawaii character based on closest milestone
                    updateCharacterMood(milestones);
                }
                
                // Always render calendar
                renderCalendar();
            })
            .catch(error => console.error('Error loading milestones:', error));
    }
    
    // Add a milestone to the DOM
    function addMilestoneToDOM(milestone) {
        const milestoneCard = milestoneTemplate.content.cloneNode(true);
        
        // Set milestone icon
        const iconElement = milestoneCard.querySelector('.milestone-icon i');
        iconElement.classList.add('fa-' + milestone.icon);
        
        // Set milestone information
        milestoneCard.querySelector('.milestone-title').textContent = milestone.title;
        milestoneCard.querySelector('.milestone-description').textContent = milestone.description || '';
        
        // Format date for display - fix timezone issue by adding hours
        const milestoneDate = new Date(milestone.date + 'T12:00:00');
        const formattedDate = milestoneDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        milestoneCard.querySelector('.milestone-date').textContent = formattedDate;
        
        // Set countdown
        const daysLeft = milestoneCard.querySelector('.days-left');
        daysLeft.textContent = milestone.days_remaining;
        
        // Apply color based on days remaining
        const countdownElement = milestoneCard.querySelector('.countdown');
        if (milestone.days_remaining < 0) {
            countdownElement.style.backgroundColor = '#aaa';
            countdownElement.textContent = 'Passed';
        } else if (milestone.days_remaining === 0) {
            countdownElement.style.backgroundColor = '#ff4757';
            countdownElement.textContent = 'Today!';
        } else if (milestone.days_remaining <= 7) {
            countdownElement.style.backgroundColor = '#ff6b6b';
        } else if (milestone.days_remaining <= 30) {
            countdownElement.style.backgroundColor = '#ff9f43';
        }
        
        // Set data attribute for delete functionality
        const card = milestoneCard.querySelector('.milestone-card');
        card.dataset.id = milestone.id;
        
        // Add card to container
        milestonesContainer.appendChild(milestoneCard);
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        const icon = document.getElementById('icon').value;
        
        const milestone = {
            title,
            description,
            date,
            icon
        };
        
        fetch('/api/milestones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(milestone)
        })
        .then(response => response.json())
        .then(() => {
            // Reset form
            milestoneForm.reset();
            
            // Set default values again after reset
            document.getElementById('title').value = "10 Year Anniversary for marriage";
            document.getElementById('description').value = "I love my husband Shawn!!! Wish we be happy, healthy, and wealthy.";
            document.getElementById('date').value = "2025-05-20";
            document.getElementById('icon').value = "heart";
            
            // Reload milestones
            loadMilestones();
            
            // Show success animation
            showSuccessAnimation();
        })
        .catch(error => console.error('Error adding milestone:', error));
    }
    
    // Handle milestone card actions (delete)
    function handleMilestoneAction(e) {
        if (e.target.closest('.delete-btn')) {
            const card = e.target.closest('.milestone-card');
            const milestoneId = card.dataset.id;
            
            // Confirm deletion
            if (confirm('Are you sure you want to delete this milestone?')) {
                deleteMilestone(milestoneId);
            }
        }
    }
    
    // Delete a milestone
    function deleteMilestone(id) {
        fetch(`/api/milestones/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadMilestones();
        })
        .catch(error => console.error('Error deleting milestone:', error));
    }
    
    // Show success animation when adding a milestone
    function showSuccessAnimation() {
        const character = document.querySelector('.kawaii-character');
        character.style.backgroundColor = '#7bed9f';
        
        // Change eyes to happy eyes
        const face = document.querySelector('.face');
        face.innerHTML = `
            <div class="eyes" style="transform: scale(1.2)"></div>
            <div class="mouth" style="height: 12px; border-radius: 10px 10px 0 0;"></div>
        `;
        
        // Reset after animation
        setTimeout(() => {
            character.style.backgroundColor = '';
            face.innerHTML = `
                <div class="eyes"></div>
                <div class="mouth"></div>
            `;
        }, 2000);
    }
    
    // Update character mood based on closest milestone
    function updateCharacterMood(milestones) {
        if (milestones.length === 0) return;
        
        // Find the closest upcoming milestone
        const upcomingMilestones = milestones.filter(m => m.days_remaining >= 0);
        
        if (upcomingMilestones.length > 0) {
            const closestMilestone = upcomingMilestones[0];
            const character = document.querySelector('.kawaii-character');
            const mouth = document.querySelector('.mouth');
            
            // If milestone is today, show excited character
            if (closestMilestone.days_remaining === 0) {
                character.style.backgroundColor = '#ff6b6b';
                mouth.style.height = '12px';
                mouth.style.borderRadius = '10px 10px 0 0';
            } 
            // If milestone is within a week, show eager character
            else if (closestMilestone.days_remaining <= 7) {
                character.style.backgroundColor = '#ff9f43';
                mouth.style.width = '20px';
            }
            // Otherwise, show default character
            else {
                character.style.backgroundColor = '';
                mouth.style = '';
            }
        }
    }
    
    // Show surprise modal
    function showSurprise() {
        modal.style.display = 'block';
        
        // Animate bear and duck to face each other
        const bear = document.querySelector('.bear-character');
        const duck = document.querySelector('.duck-character');
        
        bear.style.transform = 'translateX(20px) rotate(5deg)';
        duck.style.transform = 'translateX(-20px) rotate(-5deg)';
        
        // Reset after animation
        setTimeout(() => {
            bear.style.transform = '';
            duck.style.transform = '';
        }, 1000);
    }
    
    // Close surprise modal
    function closeSurprise() {
        modal.style.display = 'none';
    }
    
    // Calendar Functions
    
    // Fix timezone issues for date parsing
    function parseDate(dateString) {
        // Add time part to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }
    
    // Render the calendar for the current month and year
    function renderCalendar() {
        // Clear calendar body
        calendarBody.innerHTML = '';
        
        // Update month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Get the first day of the month
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        
        // Get the number of days in the month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Get previous month's last days
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        
        // Calculate total calendar cells needed (max 6 rows of 7 days)
        const totalCells = 42;
        
        // Get current date for highlighting today
        const today = new Date();
        const currentDate = today.getDate();
        const currentMonthIndex = today.getMonth();
        const currentYearValue = today.getFullYear();
        
        // Generate calendar days
        let date = 1;
        let nextMonthDate = 1;
        
        // Filter milestones for current month
        const currentMonthMilestones = allMilestones.filter(milestone => {
            const milestoneDate = parseDate(milestone.date);
            return milestoneDate.getMonth() === currentMonth && 
                   milestoneDate.getFullYear() === currentYear;
        });
        
        // Create a map of dates to milestones
        const dateToMilestones = {};
        currentMonthMilestones.forEach(milestone => {
            const milestoneDate = parseDate(milestone.date).getDate();
            if (!dateToMilestones[milestoneDate]) {
                dateToMilestones[milestoneDate] = [];
            }
            dateToMilestones[milestoneDate].push(milestone);
        });
        
        // Check for anniversary date in current month
        const isAnniversaryMonth = (anniversaryMonth === currentMonth && anniversaryYear === currentYear);
        const anniversaryDay = initAnniversaryDate.getDate();
        
        // Create calendar cells
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day');
            
            // Previous month days
            if (i < firstDay) {
                const prevDate = prevMonthDays - (firstDay - i - 1);
                cell.innerHTML = `<div class="calendar-day-number">${prevDate}</div>`;
                cell.classList.add('inactive');
            } 
            // Current month days
            else if (i >= firstDay && date <= daysInMonth) {
                cell.innerHTML = `<div class="calendar-day-number">${date}</div>`;
                
                // Highlight today
                if (date === currentDate && currentMonth === currentMonthIndex && 
                    currentYear === currentYearValue) {
                    cell.classList.add('today');
                }
                
                // Highlight anniversary date
                if (isAnniversaryMonth && date === anniversaryDay) {
                    if (!dateToMilestones[date]) {
                        // Only add special highlight if there's no milestone on this date already
                        const specialAnniversary = document.createElement('div');
                        specialAnniversary.classList.add('calendar-event', 'anniversary');
                        specialAnniversary.textContent = "Anniversary Date";
                        specialAnniversary.addEventListener('click', () => {
                            showSurprise();
                        });
                        cell.appendChild(specialAnniversary);
                    }
                    cell.style.backgroundColor = '#fff0f5';
                    cell.style.border = '2px solid #ff6b6b';
                }
                
                // Add milestone markers to calendar
                if (dateToMilestones[date]) {
                    dateToMilestones[date].forEach(milestone => {
                        const event = document.createElement('div');
                        event.classList.add('calendar-event');
                        event.classList.add(milestone.icon);
                        event.textContent = milestone.title;
                        event.dataset.id = milestone.id;
                        
                        // Add click event to highlight corresponding milestone card
                        event.addEventListener('click', () => {
                            // Clear previous highlights
                            document.querySelectorAll('.milestone-card').forEach(card => {
                                card.style.boxShadow = '';
                                card.style.transform = '';
                            });
                            
                            // Highlight and scroll to the milestone
                            const targetCard = document.querySelector(`.milestone-card[data-id="${milestone.id}"]`);
                            if (targetCard) {
                                targetCard.style.boxShadow = '0 0 15px rgba(255, 133, 162, 0.8)';
                                targetCard.style.transform = 'translateY(-10px)';
                                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                
                                // Reset highlight after 3 seconds
                                setTimeout(() => {
                                    targetCard.style.boxShadow = '';
                                    targetCard.style.transform = '';
                                }, 3000);
                            }
                        });
                        
                        cell.appendChild(event);
                    });
                }
                
                date++;
            } 
            // Next month days
            else {
                cell.innerHTML = `<div class="calendar-day-number">${nextMonthDate}</div>`;
                cell.classList.add('inactive');
                nextMonthDate++;
            }
            
            calendarBody.appendChild(cell);
        }
    }
    
    // Change month
    function changeMonth(amount) {
        currentMonth += amount;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        renderCalendar();
    }
}); 