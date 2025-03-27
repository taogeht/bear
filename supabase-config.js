// Supabase Configuration
const SUPABASE_URL = 'https://dpaqeqosxerbfxldwlvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYXFlcW9zeGVyYmZ4bGR3bHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjcwNTYsImV4cCI6MjA1ODYwMzA1Nn0.1NvhcmGd0zzGwkZ_UkECM5vJWLQeXaC2Jb6y3K2kx94';

// Authentication and Database Functions
const supabaseAuth = {
    // Initialize Supabase client
    getSupabaseClient: async function() {
        // Use the global supabase object provided by the CDN
        if (typeof supabase !== 'undefined') {
            return supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        } else {
            console.error('Supabase is not defined. Make sure to include the Supabase JS library.');
            throw new Error('Supabase client not available');
        }
    },

    // User Session Management
    getSession: function() {
        const userSession = JSON.parse(localStorage.getItem('userSession') || 'null');
        if (!userSession) return null;

        // Check if session has expired
        const currentTime = new Date().getTime();
        if (userSession.expiresAt && currentTime > userSession.expiresAt) {
            this.logoutUser();
            return null;
        }

        return userSession;
    },

    // Login functions
    loginParent: async function(name, password) {
        try {
            const supabase = await this.getSupabaseClient();
            let parentData;
            let parentError;
            
            // Check if input is a UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name);
            
            if (isUUID) {
                // Search by UUID
                const response = await supabase
                    .from('parents')
                    .select('*')
                    .eq('id', name)
                    .single();
                
                parentData = response.data;
                parentError = response.error;
            } else {
                // For single name login, search by name
                const response = await supabase
                    .from('parents')
                    .select('*')
                    .eq('name', name)
                    .single();
                
                parentData = response.data;
                parentError = response.error;
                
                // If no parent found by name, check if it's an email
                if (!parentData && name.includes('@')) {
                    const response = await supabase
                        .from('parents')
                        .select('*')
                        .eq('email', name)
                        .single();
                    
                    parentData = response.data;
                    parentError = response.error;
                }
            }
            
            if (parentError && parentError.code !== 'PGRST116') {
                // PGRST116 is just "no rows returned" which is fine, we'll throw our own error later
                console.error('Supabase error:', parentError);
                throw parentError;
            }
            
            if (!parentData) {
                // No parent found - they must be added by a teacher first
                throw new Error('Parent not found.');
            }
            
            // Verify password
            if (parentData.password && parentData.password !== password) {
                throw new Error('Invalid password.');
            }
            
            // Create user session
            const userSession = {
                id: parentData.id,
                email: parentData.email || null,
                profile: {
                    name: parentData.name,
                    email: parentData.email || null,
                    phone: parentData.phone || null
                },
                userType: 'parent',
                expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            localStorage.setItem('userSession', JSON.stringify(userSession));
            return userSession;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    loginTeacher: async function(emailOrId, password) {
        try {
            const supabase = await this.getSupabaseClient();
            let teacherData;
            let teacherError;
            
            // Check if input is a UUID
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(emailOrId);
            
            if (isUUID) {
                // Search by UUID
                const response = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('id', emailOrId)
                    .single();
                
                teacherData = response.data;
                teacherError = response.error;
            } else {
                // First try Supabase Auth sign-in
                try {
                    const authResponse = await supabase.auth.signInWithPassword({
                        email: emailOrId,
                        password: password,
                    });
                    
                    if (authResponse.error) {
                        throw authResponse.error;
                    }
                    
                    if (authResponse.data.user) {
                        console.log('Supabase Auth login successful, checking teachers table');
                        
                        // Look up this Auth user in the teachers table
                        const teacherResponse = await supabase
                            .from('teachers')
                            .select('*')
                            .eq('email', emailOrId)
                            .single();
                        
                        // If teacher exists in teachers table, use that data
                        if (teacherResponse.data) {
                            teacherData = teacherResponse.data;
                            teacherError = null;
                        } else {
                            // Teacher doesn't exist in teachers table yet, so add them
                            console.log('Adding Auth user to teachers table');
                            const insertResponse = await supabase
                                .from('teachers')
                                .insert([
                                    {
                                        id: authResponse.data.user.id,
                                        name: emailOrId.split('@')[0], // Default name from email
                                        email: emailOrId,
                                        password: password
                                    }
                                ])
                                .select()
                                .single();
                            
                            if (insertResponse.error) {
                                throw insertResponse.error;
                            }
                            
                            teacherData = insertResponse.data;
                        }
                    }
                } catch (authError) {
                    // If Supabase Auth fails, fall back to checking the teachers table directly
                    console.log('Auth signin failed, falling back to custom table check:', authError);
                    
                    const response = await supabase
                        .from('teachers')
                        .select('*')
                        .eq('email', emailOrId)
                        .single();
                    
                    teacherData = response.data;
                    teacherError = response.error;
                }
            }
            
            if (teacherError) {
                console.error('Supabase error:', teacherError);
                throw teacherError;
            }
            
            if (!teacherData) {
                throw new Error('Teacher not found.');
            }
            
            // Create user session
            const userSession = {
                id: teacherData.id,
                email: teacherData.email,
                profile: {
                    name: teacherData.name,
                    email: teacherData.email
                },
                userType: 'teacher',
                expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            localStorage.setItem('userSession', JSON.stringify(userSession));
            return userSession;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout function
    logoutUser: function() {
        localStorage.removeItem('userSession');
        sessionStorage.removeItem('editingParentId');
        sessionStorage.removeItem('editingParentName');
        window.location.href = 'index.html';
    },

    // Get the start date of the current week (Sunday)
    getWeekStartDate: function() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = now.getDate() - day;
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
    },

    // Get all parents (for teacher dashboard)
    getParents: async function() {
        try {
            const supabase = await this.getSupabaseClient();
            const { data, error } = await supabase
                .from('parents')
                .select('*')
                .order('name');
            
            if (error) {
                console.error('Supabase error when getting parents:', error);
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('Error getting parents:', error);
            // Return empty array instead of propagating the error to prevent dashboard from breaking
            return [];
        }
    },

    // Get form data for a specific parent
    getParentForm: async function(parentId) {
        try {
            const weekStart = this.getWeekStartDate();
            const supabase = await this.getSupabaseClient();
            
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('parent_id', parentId)
                .eq('week_start', weekStart);
            
            if (error) {
                throw error;
            }
            
            // Return the first form if multiple exist, or null if none
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Error getting form:', error);
            throw error;
        }
    },

    // Save form data to Supabase
    saveForm: async function(parentId, formData, isTeacherForm = false) {
        try {
            console.log('saveForm called with parentId:', parentId, 'isTeacherForm:', isTeacherForm);
            
            const weekStart = this.getWeekStartDate();
            const supabase = await this.getSupabaseClient();
            
            // Check if a form already exists for this parent and week
            console.log('Checking for existing form with parentId:', parentId, 'weekStart:', weekStart);
            
            // Add specific error handling for single query
            let existingForm = null;
            try {
                const { data, error } = await supabase
                    .from('forms')
                    .select('id')
                    .eq('parent_id', parentId)
                    .eq('week_start', weekStart)
                    .single();
                
                if (data) {
                    existingForm = data;
                } else if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found" error
                    console.error('Error checking for existing form:', error);
                    throw error;
                }
            } catch (checkError) {
                console.log('No existing form found, will create new one');
            }
            
            const userSession = this.getSession();
            const userId = userSession?.id || null;
            const userType = userSession?.userType || null;
            
            console.log('Building form data object');
            const data = {
                week_start: weekStart,
                parent_id: parentId,
                updated_at: new Date().toISOString(),
            };
            
            // Add correct fields based on who is submitting
            if (isTeacherForm) {
                console.log('Adding teacher form fields');
                
                // Only include teacher_id if it's a valid teacher in the system
                const teacherData = await this.validateTeacherId(userId);
                if (teacherData) {
                    data.teacher_id = userId;
                    console.log('Using validated teacher ID:', userId);
                } else {
                    console.log('Teacher ID not valid or not found, omitting from form data');
                }
                
                // Add the form data fields
                Object.assign(data, {
                    year: formData.year || '',
                    month: formData.month || '',
                    day: formData.day || '',
                    teacherMood: formData.teacherMood || '',
                    weeklySong: formData.weeklySong || '',
                    videoHomework: formData.videoHomework || '',
                    weeklyHomework: formData.weeklyHomework || '',
                    lifeHomework: formData.lifeHomework || '',
                    practiceContent: formData.practiceContent || '',
                    teacherComments: formData.teacherComments || ''
                });
                
                // Preserve parent data if it exists
                if (formData.sleepTime) data.sleepTime = formData.sleepTime;
                if (formData.helpNeeded) data.helpNeeded = formData.helpNeeded;
                if (formData.breakfast) data.breakfast = formData.breakfast;
                if (formData.watch) data.watch = formData.watch;
                if (formData.watch2) data.watch2 = formData.watch2;
                if (formData.todo) data.todo = formData.todo;
                if (formData.todo2) data.todo2 = formData.todo2;
                if (formData.parentShare) data.parentShare = formData.parentShare;
                if (formData.parentComments) data.parentComments = formData.parentComments;
            } else {
                console.log('Adding parent form fields');
                // Parent is updating
                Object.assign(data, {
                    sleepTime: formData.sleepTime || '',
                    helpNeeded: formData.helpNeeded || '',
                    breakfast: formData.breakfast || '',
                    watch: formData.watch || '',
                    watch2: formData.watch2 || '',
                    todo: formData.todo || '',
                    todo2: formData.todo2 || '',
                    parentShare: formData.parentShare || '',
                    parentComments: formData.parentComments || ''
                });
                
                // Preserve teacher data if it exists
                if (formData.year) data.year = formData.year;
                if (formData.month) data.month = formData.month;
                if (formData.day) data.day = formData.day;
                if (formData.teacherMood) data.teacherMood = formData.teacherMood;
                if (formData.weeklySong) data.weeklySong = formData.weeklySong;
                if (formData.videoHomework) data.videoHomework = formData.videoHomework;
                if (formData.weeklyHomework) data.weeklyHomework = formData.weeklyHomework;
                if (formData.lifeHomework) data.lifeHomework = formData.lifeHomework;
                if (formData.practiceContent) data.practiceContent = formData.practiceContent;
                if (formData.teacherComments) data.teacherComments = formData.teacherComments;
            }
            
            console.log('Final form data to save:', data);
            
            let result;
            if (existingForm) {
                console.log('Updating existing form with ID:', existingForm.id);
                // Update existing form
                const { data: updateData, error: updateError } = await supabase
                    .from('forms')
                    .update(data)
                    .eq('id', existingForm.id)
                    .select();
                
                if (updateError) {
                    console.error('Error updating form:', updateError);
                    throw updateError;
                }
                result = updateData;
            } else {
                console.log('Inserting new form');
                // Insert new form
                const { data: insertData, error: insertError } = await supabase
                    .from('forms')
                    .insert(data)
                    .select();
                
                if (insertError) {
                    console.error('Error inserting form:', insertError);
                    throw insertError;
                }
                result = insertData;
            }
            
            console.log('Form saved successfully:', result);
            return result;
        } catch (error) {
            console.error('Error saving form:', error);
            throw error;
        }
    },
    
    // Helper to validate if a teacher ID exists in the database
    validateTeacherId: async function(teacherId) {
        if (!teacherId) return null;
        
        try {
            const supabase = await this.getSupabaseClient();
            const { data, error } = await supabase
                .from('teachers')
                .select('id, name')
                .eq('id', teacherId)
                .single();
                
            if (error) {
                console.error('Error validating teacher ID:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error in validateTeacherId:', error);
            return null;
        }
    },
    
    // Get form history for a specific parent
    getFormHistory: async function(parentId) {
        try {
            if (!parentId) throw new Error('Parent ID is required');
            
            const supabase = await this.getSupabaseClient();
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('parent_id', parentId)
                .order('week_start', { ascending: false });
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            console.error('Error getting form history:', error);
            throw error;
        }
    },
    
    // Get specific form by ID
    getFormById: async function(formId) {
        try {
            if (!formId) throw new Error('Form ID is required');
            
            const supabase = await this.getSupabaseClient();
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('id', formId)
                .single();
            
            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Error getting form by ID:', error);
            throw error;
        }
    }
};

// Create a global Supabase instance for direct use
try {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// Export all functions
window.supabaseAuth = supabaseAuth; 