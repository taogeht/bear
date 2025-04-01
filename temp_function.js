        async function setWeeklyTemplate(event) {
            event.preventDefault();
            
            try {
                showLoading(true);
                
                // Get form values
                const weekly_song = document.getElementById('template-weekly-song').value;
                const video_homework = document.getElementById('template-video-homework').value;
                const weekly_storybook = document.getElementById('template-weekly-storybook').value;
                const life_homework = document.getElementById('template-life-homework').value;
                const practice_content = document.getElementById('template-practice-content').value;
                
                // Create template data object
                const templateData = {
                    weekly_song,
                    video_homework,
                    weekly_storybook,
                    life_homework,
                    practice_content,
                    // Add current date
                    year: new Date().getFullYear().toString(),
                    month: (new Date().getMonth() + 1).toString(),
                    day: new Date().getDate().toString()
                };
                
                // Get all parents
                const { data: parents, error } = await supabaseAuth.getParents();
                
                if (error) throw error;
                
                // Success counter
                let successCount = 0;
                
                // For each parent, create or update their form with the template data
                for (const parent of parents) {
                    try {
                        // Save the template to the parent's form
                        await supabaseAuth.saveForm(parent.id, templateData, true);
                        successCount++;
                    } catch (saveError) {
                        console.error(`Error saving template for parent ${parent.id}:`, saveError);
                    }
                }
                
                // Show success message
                document.getElementById('template-success-message').textContent = 
                    `Template saved and applied to ${successCount} parent forms!`;
                document.getElementById('template-success-message').style.display = 'block';
                
                // Close modal after delay
                setTimeout(() => {
                    document.getElementById('weeklyTemplateModal').style.display = 'none';
                    document.getElementById('template-success-message').style.display = 'none';
                }, 2000);
                
                // Reload parents list with updated status
                await loadParents();
                
            } catch (error) {
                console.error('Error setting weekly template:', error);
                document.getElementById('template-modal-message').textContent = 
                    'Error setting template: ' + error.message;
                document.getElementById('template-modal-message').style.display = 'block';
            } finally {
                showLoading(false);
            }
        }
        
        // Load the weekly template
        async function loadWeeklyTemplate() {
            try {
                // Clear form
                document.getElementById('template-form').reset();
                
                // Clear messages
                document.getElementById('template-modal-message').textContent = '';
                document.getElementById('template-success-message').textContent = '';
                
                // Current week's start date
                const weekStart = supabaseAuth.getWeekStartDate();
                
                // Get first parent (template should be the same for all parents)
                const parentsResult = await supabaseAuth.getParents();
                
                // Extract parents array based on response format
                let parents = [];
                if (Array.isArray(parentsResult)) {
                    parents = parentsResult;
