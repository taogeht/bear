// Supabase Configuration
const SUPABASE_URL = 'https://dpaqeqosxerbfxldwlvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYXFlcW9zeGVyYmZ4bGR3bHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjcwNTYsImV4cCI6MjA1ODYwMzA1Nn0.1NvhcmGd0zzGwkZ_UkECM5vJWLQeXaC2Jb6y3K2kx94';

// Create a single global instance of the Supabase client
let supabaseClientInstance = null;

// Authentication and Database Functions
const supabaseAuth = {
    // Initialize supabaseAuth and create client if needed
    init: function() {
        // Create a Supabase client if one doesn't exist yet
        if (!supabaseClientInstance && typeof supabase !== 'undefined') {
            supabaseClientInstance = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabaseClient = supabaseClientInstance;
        }
        return this;
    },
    
    // Initialize Supabase client using a singleton pattern
    getSupabaseClient: async function() {
        // If we already have an instance, return it
        if (supabaseClientInstance) {
            return supabaseClientInstance;
        }
        
        // Create a new instance if we don't have one yet
        if (typeof supabase !== 'undefined') {
            supabaseClientInstance = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return supabaseClientInstance;
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
            // --- ADDED: Trim whitespace from name input ---
            if (typeof name === 'string') {
                name = name.trim();
            }

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
                // Search by name
                const response = await supabase
                    .from('parents')
                    .select('*')
                    .eq('name', name)
                    .single();
                
                parentData = response.data;
                parentError = response.error;
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
                profile: {
                    name: parentData.name
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

                    // --- ADDED: Password verification for fallback ---
                    if (teacherData) {
                        // Check if the provided password matches the stored one
                        if (teacherData.password !== password) {
                            console.log('Fallback check: Password mismatch.');
                            // Set teacherData to null to trigger the error below
                            teacherData = null; 
                            // Throw a specific error for clarity
                            throw new Error('Invalid email or password.'); 
                        } else {
                            console.log('Fallback check: Password matches.');
                            // Password matches, proceed with this teacherData
                            teacherError = null; // Clear any previous error like "no rows found"
                        }
                    } else {
                        // Teacher not found even in fallback
                        console.log('Fallback check: Teacher not found.');
                        // Let the existing error handling below catch this
                        if (teacherError && teacherError.code !== 'PGRST116') {
                             // If there was a real DB error (not just 'not found')
                             throw teacherError; 
                        } else {
                            // Ensure we throw a user-friendly error if not found
                            throw new Error('Invalid email or password.');
                        }
                    }
                    // --- END ADDED verification ---
                }
            }
            
            if (teacherError && teacherError.code !== 'PGRST116') {
                // Handle potential errors from the initial UUID check or other issues
                console.error('Supabase error before final check:', teacherError);
                throw teacherError;
            }
            
            if (!teacherData) {
                // This will now catch cases where Auth failed AND fallback failed (wrong password or not found)
                throw new Error('Invalid email or password.');
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

    // Function to get the current week's start date in YYYY-MM-DD format
    getWeekStartDate: function() {
        // Get current date
        const now = new Date();
        
        // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
        const day = now.getDay();
        
        // Calculate how many days we need to go back to reach Monday
        // If today is Monday (day=1), diff will be 0
        // If today is Tuesday (day=2), diff will be -1, etc.
        const diff = now.getDate() - (day - 1);
        
        // Create a new date for the Monday that starts this week
        // If today is Sunday (day=0), we need to go to the next day for Monday
        const weekStart = new Date(now);
        weekStart.setDate(day === 0 ? diff + 1 : diff);
        weekStart.setHours(0, 0, 0, 0);
        
        // Format as YYYY-MM-DD
        return weekStart.getFullYear() + '-' + 
               String(weekStart.getMonth() + 1).padStart(2, '0') + '-' + 
               String(weekStart.getDate()).padStart(2, '0');
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
            return await this.getParentFormForDate(parentId, weekStart);
        } catch (error) {
            console.error('Error getting form:', error);
            throw error;
        }
    },

    // Get form data for a specific parent for a specific date
    getParentFormForDate: async function(parentId, weekStart) {
        try {
            if (!parentId) throw new Error('Parent ID is required');
            if (!weekStart) throw new Error('Week start date is required');
            
            const supabase = await this.getSupabaseClient();
            
            console.log(`Querying forms for parent_id=${parentId} and week_start=${weekStart}`);
            
            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('parent_id', parentId)
                .eq('week_start', weekStart);
            
            if (error) {
                console.error('Error fetching form:', error);
                throw error;
            }
            
            // Return the first form if multiple exist, or null if none
            if (data && data.length > 0) {
                const formData = data[0];
                console.log('Form data retrieved successfully:', JSON.stringify(formData, null, 2));
                
                // Create a new object with all properties to avoid reference issues
                const formDataCopy = { ...formData };
                return formDataCopy;
            } else {
                console.log('No form found for parent ID', parentId, 'with week_start', weekStart);
                return null;
            }
        } catch (error) {
            console.error('Error getting form for date:', error);
            throw error;
        }
    },

    // Check if fields were saved correctly
    _checkSavedFields: function(data, savedData, fieldsToSave) {
        const missingFields = [];
        
        for (const field of fieldsToSave) {
            // Skip non-essential fields
            if (['year', 'month', 'day', 'breakfast', 'watch', 'watch2', 'todo', 'todo2'].includes(field)) {
                continue;
            }
            
            // Check if field was saved
            if (data[field] !== undefined && data[field] !== null) {
                if (!savedData[field] || savedData[field].toString() !== data[field].toString()) {
                    missingFields.push(field);
                    console.log(`Field ${field} not saved correctly. Expected: ${data[field]}, Got: ${savedData[field]}`);
                }
            }
        }
        
        return missingFields;
    },

    // Save form for a specific date
    saveFormForDate: async function(parentId, formData, weekStart, isTeacherForm = false) {
        try {
            console.log('------------- SAVE FORM FOR DATE START -------------');
            console.log('saveFormForDate called with parentId:', parentId, 'isTeacherForm:', isTeacherForm);
            console.log('Week start date:', weekStart);
            console.log('Form data received:', JSON.stringify(formData, null, 2));
            
            if (!parentId) {
                throw new Error('Parent ID is required');
            }
            
            if (!weekStart) {
                throw new Error('Week start date is required');
            }
            
            const supabase = await this.getSupabaseClient();
            
            // Check if a form already exists for this parent and week
            console.log('Checking for existing form with parentId:', parentId, 'weekStart:', weekStart);
            
            // Add specific error handling for single query
            let existingForm = null;
            try {
                const { data, error } = await supabase
                    .from('forms')
                    .select('*')
                    .eq('parent_id', parentId)
                    .eq('week_start', weekStart)
                    .single();
                
                if (data) {
                    existingForm = data;
                    console.log('Found existing form:', JSON.stringify(existingForm, null, 2));
                } else if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found" error
                    console.error('Error checking for existing form:', error);
                    // Don't throw here, we'll try to create a new form if needed
                }
            } catch (checkError) {
                console.log('No existing form found, will create new one');
            }
            
            const userSession = this.getSession();
            const userId = userSession?.id || null;
            const userType = userSession?.userType || null;
            console.log('User session info - ID:', userId, 'Type:', userType);
            
            console.log('Building form data object');
            const data = {
                week_start: weekStart,
                parent_id: parentId,
                updated_at: new Date().toISOString(),
            };
            
            // Create a record of all fields we're trying to save for later verification
            const fieldsToSave = new Set();
            
            // Add correct fields based on who is submitting
            if (isTeacherForm) {
                console.log('Adding teacher form fields');
                
                // Only include teacher_id if it's a valid teacher in the system
                if (userType === 'teacher' && userId) {
                    const teacherData = await this.validateTeacherId(userId);
                    if (teacherData) {
                        data.teacher_id = userId;
                        console.log('Using validated teacher ID:', userId);
                    } else {
                        console.log('Teacher ID not valid or not found, omitting from form data');
                    }
                } else {
                    console.log('No teacher ID available or user not a teacher');
                }
                
                // Add the form data fields - use lowercase only
                if (formData.year) {
                    data.year = formData.year;
                    fieldsToSave.add('year');
                }
                if (formData.month) {
                    data.month = formData.month;
                    fieldsToSave.add('month');
                }
                if (formData.day) {
                    data.day = formData.day;
                    fieldsToSave.add('day');
                }
                
                // Always set these fields when applying a template (isTeacherForm=true)
                // even if they're empty strings, to ensure overwriting any existing values
                data.teachermood = formData.teachermood || '';
                fieldsToSave.add('teachermood');
                
                data.weeklysong = formData.weeklysong || '';
                fieldsToSave.add('weeklysong');
                
                data.videohomework = formData.videohomework || '';
                fieldsToSave.add('videohomework');
                
                data.weeklystorybook = formData.weeklystorybook || '';
                fieldsToSave.add('weeklystorybook');
                
                data.lifehomework = formData.lifehomework || '';
                fieldsToSave.add('lifehomework');
                
                data.practicecontent = formData.practicecontent || '';
                fieldsToSave.add('practicecontent');
                
                data.teachercomments = formData.teachercomments || '';
                fieldsToSave.add('teachercomments');
                
                // Preserve parent data if it exists - use lowercase only
                if (formData.sleeptime) {
                    data.sleeptime = formData.sleeptime;
                    fieldsToSave.add('sleeptime');
                }
                if (formData.helpneeded) {
                    data.helpneeded = formData.helpneeded;
                    fieldsToSave.add('helpneeded');
                }
                if (formData.breakfast) {
                    data.breakfast = formData.breakfast;
                    fieldsToSave.add('breakfast');
                }
                if (formData.watch) {
                    data.watch = formData.watch;
                    fieldsToSave.add('watch');
                }
                if (formData.watch2) {
                    data.watch2 = formData.watch2;
                    fieldsToSave.add('watch2');
                }
                if (formData.todo) {
                    data.todo = formData.todo;
                    fieldsToSave.add('todo');
                }
                if (formData.todo2) {
                    data.todo2 = formData.todo2;
                    fieldsToSave.add('todo2');
                }
                if (formData.parentshare) {
                    data.parentshare = formData.parentshare;
                    fieldsToSave.add('parentshare');
                }
                if (formData.parentcomments) {
                    data.parentcomments = formData.parentcomments;
                    fieldsToSave.add('parentcomments');
                }
            } else {
                console.log('Adding parent form fields');
                // Parent is updating - use lowercase only
                if (formData.sleeptime) {
                    data.sleeptime = formData.sleeptime;
                    fieldsToSave.add('sleeptime');
                }
                if (formData.helpneeded) {
                    data.helpneeded = formData.helpneeded;
                    fieldsToSave.add('helpneeded');
                }
                if (formData.breakfast) {
                    data.breakfast = formData.breakfast;
                    fieldsToSave.add('breakfast');
                }
                if (formData.watch) {
                    data.watch = formData.watch;
                    fieldsToSave.add('watch');
                }
                if (formData.watch2) {
                    data.watch2 = formData.watch2;
                    fieldsToSave.add('watch2');
                }
                if (formData.todo) {
                    data.todo = formData.todo;
                    fieldsToSave.add('todo');
                }
                if (formData.todo2) {
                    data.todo2 = formData.todo2;
                    fieldsToSave.add('todo2');
                }
                if (formData.parentshare) {
                    data.parentshare = formData.parentshare;
                    fieldsToSave.add('parentshare');
                }
                if (formData.parentcomments) {
                    data.parentcomments = formData.parentcomments;
                    fieldsToSave.add('parentcomments');
                }
                
                // Preserve teacher data if it exists - use lowercase only
                if (formData.year) {
                    data.year = formData.year;
                    fieldsToSave.add('year');
                }
                if (formData.month) {
                    data.month = formData.month;
                    fieldsToSave.add('month');
                }
                if (formData.day) {
                    data.day = formData.day;
                    fieldsToSave.add('day');
                }
                
                // Preserve teacher fields if they exist - use lowercase only
                if (formData.teachermood) {
                    data.teachermood = formData.teachermood;
                    fieldsToSave.add('teachermood');
                }
                
                if (formData.weeklysong) {
                    data.weeklysong = formData.weeklysong;
                    fieldsToSave.add('weeklysong');
                }
                
                if (formData.videohomework) {
                    data.videohomework = formData.videohomework;
                    fieldsToSave.add('videohomework');
                }
                
                if (formData.weeklystorybook) {
                    data.weeklystorybook = formData.weeklystorybook;
                    fieldsToSave.add('weeklystorybook');
                }
                
                if (formData.lifehomework) {
                    data.lifehomework = formData.lifehomework;
                    fieldsToSave.add('lifehomework');
                }
                
                if (formData.practicecontent) {
                    data.practicecontent = formData.practicecontent;
                    fieldsToSave.add('practicecontent');
                }
                
                if (formData.teachercomments) {
                    data.teachercomments = formData.teachercomments;
                    fieldsToSave.add('teachercomments');
                }
            }
            
            console.log('Final form data to save:', JSON.stringify(data, null, 2));
            console.log('Fields we are attempting to save:', Array.from(fieldsToSave));
            
            let result;
            if (existingForm) {
                console.log('Updating existing form with ID:', existingForm.id);
                // Update existing form
                try {
                    console.log('Before update operation');
                    const updateResult = await supabase
                        .from('forms')
                        .update(data)
                        .eq('id', existingForm.id)
                        .select();
                    
                    console.log('After update operation, result:', JSON.stringify(updateResult, null, 2));
                    
                    if (updateResult.error) {
                        console.error('Error updating form:', updateResult.error);
                        
                        // Handle specific database errors
                        if (updateResult.error.message && updateResult.error.message.includes('column')) {
                            throw new Error(`Database schema error: ${updateResult.error.message}. Please run the fix-forms-schema.sql script.`);
                        } else if (updateResult.error.message && updateResult.error.message.includes('foreign key constraint')) {
                            throw new Error(`Foreign key error: ${updateResult.error.message}. Please check that the teacher ID exists in the database.`);
                        }
                        
                        throw updateResult.error;
                    }
                    
                    result = updateResult.data;
                    
                    // Verify if all fields were saved correctly using our helper
                    if (result && Array.isArray(result) && result.length > 0) {
                        const savedData = result[0];
                        console.log('Saved data:', JSON.stringify(savedData, null, 2));
                        
                        // Check if all fields were saved using the helper
                        const missingFields = this._checkSavedFields(data, savedData, fieldsToSave);
                        
                        if (missingFields.length > 0) {
                            console.warn('Warning: Some fields were not saved correctly:', missingFields);
                        } else {
                            console.log('All fields were saved correctly');
                        }
                    }
                } catch (updateError) {
                    console.error('Detailed update error:', updateError);
                    throw updateError;
                }
            } else {
                console.log('Inserting new form');
                // Insert new form
                try {
                    console.log('Before insert operation');
                    const insertResult = await supabase
                        .from('forms')
                        .insert(data)
                        .select();
                    
                    console.log('After insert operation, result:', JSON.stringify(insertResult, null, 2));
                    
                    if (insertResult.error) {
                        console.error('Error inserting form:', insertResult.error);
                        
                        // Handle specific database errors
                        if (insertResult.error.message && insertResult.error.message.includes('column')) {
                            throw new Error(`Database schema error: ${insertResult.error.message}. Please run the fix-forms-schema.sql script.`);
                        } else if (insertResult.error.message && insertResult.error.message.includes('foreign key constraint')) {
                            throw new Error(`Foreign key error: ${insertResult.error.message}. Please check that the teacher ID exists in the database.`);
                        }
                        
                        throw insertResult.error;
                    }
                    
                    result = insertResult.data;
                    
                    // Verify if all fields were saved correctly using our helper
                    if (result && Array.isArray(result) && result.length > 0) {
                        const savedData = result[0];
                        console.log('Saved data:', JSON.stringify(savedData, null, 2));
                        
                        // Check if all fields were saved using the helper
                        const missingFields = this._checkSavedFields(data, savedData, fieldsToSave);
                        
                        if (missingFields.length > 0) {
                            console.warn('Warning: Some fields were not saved correctly:', missingFields);
                        } else {
                            console.log('All fields were saved correctly');
                        }
                    }
                } catch (insertError) {
                    console.error('Detailed insert error:', insertError);
                    throw insertError;
                }
            }
            
            console.log('Form saved successfully:', JSON.stringify(result, null, 2));
            console.log('------------- SAVE FORM FOR DATE END -------------');
            return result;
        } catch (error) {
            console.error('Error saving form for date:', error);
            console.log('------------- SAVE FORM FOR DATE ERROR END -------------');
            throw error;
        }
    },
    
    // Save form data to Supabase - now uses saveFormForDate with current week
    saveForm: async function(parentId, formData, isTeacherForm = false) {
        try {
            console.log('------------- SAVE FORM START -------------');
            
            let weekStart = this.getWeekStartDate();
            
            // If form has year, month, day values, use those to create a custom week start
            if (formData.year && formData.month && formData.day) {
                try {
                    // Create a date from the form data
                    const formDate = new Date(formData.year, parseInt(formData.month) - 1, parseInt(formData.day));
                    
                    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                    const day = formDate.getDay();
                    
                    // Calculate how many days we need to go back to reach Monday
                    // If date is Monday (day=1), diff will be 0
                    // If date is Tuesday (day=2), diff will be -1, etc.
                    const diff = formDate.getDate() - (day - 1);
                    
                    // Create a new date for the Monday that starts this week
                    // If date is Sunday (day=0), we need to go to the next day for Monday
                    const customWeekStart = new Date(formDate);
                    customWeekStart.setDate(day === 0 ? diff + 1 : diff);
                    customWeekStart.setHours(0, 0, 0, 0);
                    
                    // Format as YYYY-MM-DD
                    weekStart = customWeekStart.toISOString().split('T')[0];
                    console.log('Using custom week start date based on form input:', weekStart);
                } catch (dateError) {
                    console.error('Error calculating custom week start date:', dateError);
                    console.log('Falling back to current week start:', weekStart);
                }
            } else {
                console.log('Using current week start date:', weekStart);
            }
            
            return await this.saveFormForDate(parentId, formData, weekStart, isTeacherForm);
        } catch (error) {
            console.error('Error in saveForm:', error);
            throw error;
        }
    },
    
    // Helper to validate if a teacher ID exists in the database
    validateTeacherId: async function(teacherId) {
        if (!teacherId) {
            console.log('No teacher ID provided for validation');
            return null;
        }
        
        // Check if ID is a valid UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
        if (!isValidUUID) {
            console.error('Invalid UUID format for teacher ID:', teacherId);
            return null;
        }
        
        try {
            console.log('Validating teacher ID:', teacherId);
            const supabase = await this.getSupabaseClient();
            const { data, error } = await supabase
                .from('teachers')
                .select('id, name')
                .eq('id', teacherId)
                .single();
                
            if (error) {
                console.error('Error validating teacher ID:', error);
                if (error.code === 'PGRST116') {
                    console.log('Teacher not found in database with ID:', teacherId);
                } else {
                    console.error('Database error while validating teacher ID:', error);
                }
                return null;
            }
            
            if (!data) {
                console.log('No teacher found with ID:', teacherId);
                return null;
            }
            
            console.log('Teacher validated successfully:', data.name);
            return data;
        } catch (error) {
            console.error('Exception in validateTeacherId:', error);
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
    
    // Delete all form history for a specific parent
    deleteParentFormHistory: async function(parentId) {
        try {
            if (!parentId) throw new Error('Parent ID is required');
            
            const supabase = await this.getSupabaseClient();
            console.log(`Deleting form history for parent ID: ${parentId}`);
            
            // Delete all forms associated with this parent
            const { error } = await supabase
                .from('forms')
                .delete()
                .eq('parent_id', parentId);
            
            if (error) {
                console.error('Error deleting form history:', error);
                throw error;
            }
            
            console.log(`Successfully deleted form history for parent ID: ${parentId}`);
            return { success: true };
        } catch (error) {
            console.error('Error in deleteParentFormHistory function:', error);
            throw error;
        }
    },
    
    // Delete a specific week's form for a parent
    deleteParentFormForWeek: async function(parentId, weekStart) {
        try {
            if (!parentId) throw new Error('Parent ID is required');
            if (!weekStart) throw new Error('Week start date is required');
            
            const supabase = await this.getSupabaseClient();
            console.log(`Deleting form for parent ID: ${parentId} and week: ${weekStart}`);
            
            // Delete the specific form
            const { error } = await supabase
                .from('forms')
                .delete()
                .eq('parent_id', parentId)
                .eq('week_start', weekStart);
            
            if (error) {
                console.error('Error deleting form for week:', error);
                throw error;
            }
            
            console.log(`Successfully deleted form for parent ID: ${parentId} and week: ${weekStart}`);
            return { success: true };
        } catch (error) {
            console.error('Error in deleteParentFormForWeek function:', error);
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
    },

    // Add a new function to delete a parent and all associated forms
    deleteParent: async function(parentId) {
        if (!parentId) throw new Error('Parent ID is required');
        
        try {
            // Get Supabase client
            const supabase = await this.getSupabaseClient();
            
            console.log(`Starting deletion process for parent ID: ${parentId}`);
            
            // First, delete all forms associated with this parent
            console.log(`Deleting forms for parent ID: ${parentId}`);
            const { error: formsError } = await supabase
                .from('forms')
                .delete()
                .eq('parent_id', parentId);
            
            if (formsError) {
                console.error('Error deleting forms:', formsError);
                // Continue with parent deletion even if form deletion fails
            } else {
                console.log(`Successfully deleted forms for parent ID: ${parentId}`);
            }
            
            // Then delete the parent
            console.log(`Deleting parent with ID: ${parentId}`);
            const { error: parentError } = await supabase
                .from('parents')
                .delete()
                .eq('id', parentId);
            
            if (parentError) {
                console.error('Error deleting parent:', parentError);
                throw parentError;
            }
            
            console.log(`Successfully deleted parent with ID: ${parentId}`);
            return { success: true };
        } catch (error) {
            console.error('Error in deleteParent function:', error);
            throw error;
        }
    },

    // Save weekly template to the weekly_templates table
    saveWeeklyTemplate: async function(templateData) {
        if (!templateData) throw new Error('Template data is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            
            // Always set weekStart to Monday of the current week
            const weekStart = this.getWeekStartDate();
            
            return await this.saveWeeklyTemplateForDate(templateData, weekStart);
        } catch (error) {
            console.error('Error in saveWeeklyTemplate:', error);
            throw error;
        }
    },
    
    // Save weekly template for a specific date
    saveWeeklyTemplateForDate: async function(templateData, weekStart, weekEnd) {
        if (!templateData) throw new Error('Template data is required');
        if (!weekStart) throw new Error('Week start date is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            
            console.log('Saving weekly template for week starting:', weekStart);
            if (weekEnd) {
                console.log('Week ending:', weekEnd);
            }
            
            // Format template data - ensure all fields are set to prevent undefined values
            const dataToSave = {
                week_start: weekStart,
                week_end: weekEnd || null, // Store end date if provided
                weeklysong: templateData.weeklysong || '',
                videohomework: templateData.videohomework || '',
                weeklystorybook: templateData.weeklystorybook || '',
                lifehomework: templateData.lifehomework || '',
                practicecontent: templateData.practicecontent || ''
            };
            
            // First check if a record exists for this week_start
            const { data: existingData, error: checkError } = await supabase
                .from('weekly_templates')
                .select('id')
                .eq('week_start', weekStart)
                .single();
                
            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error checking for existing template:', checkError);
                throw checkError;
            }
            
            let result;
            
            // If record exists, update it
            if (existingData && existingData.id) {
                console.log('Updating existing template with id:', existingData.id);
                
                const { data: updateData, error: updateError } = await supabase
                    .from('weekly_templates')
                    .update(dataToSave)
                    .eq('id', existingData.id)
                    .select()
                    .single();
                
                if (updateError) {
                    console.error('Error updating template:', updateError);
                    throw updateError;
                }
                
                result = updateData;
            } else {
                // Otherwise insert a new record
                console.log('Inserting new template for week:', weekStart);
                
                const { data: insertData, error: insertError } = await supabase
                    .from('weekly_templates')
                    .insert(dataToSave)
                    .select()
                    .single();
                
                if (insertError) {
                    console.error('Error inserting template:', insertError);
                    throw insertError;
                }
                
                result = insertData;
            }
            
            return result;
        } catch (error) {
            console.error('Error in saveWeeklyTemplateForDate:', error);
            throw error;
        }
    },
    
    // Get the weekly template from the weekly_templates table
    getWeeklyTemplate: async function() {
        try {
            const weekStart = this.getWeekStartDate();
            return await this.getWeeklyTemplateForDate(weekStart);
        } catch (error) {
            console.error('Error in getWeeklyTemplate:', error);
            throw error;
        }
    },
    
    // Get the weekly template for a specific date
    getWeeklyTemplateForDate: async function(weekStart) {
        if (!weekStart) throw new Error('Week start date is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            
            console.log('Getting weekly template for week starting:', weekStart);
            
            const { data, error } = await supabase
                .from('weekly_templates')
                .select('*')
                .eq('week_start', weekStart)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error retrieving weekly template:', error);
                throw error;
            }
            
            if (data) {
                console.log('Found template for week starting:', weekStart, data);
                return data;
            } else {
                console.log('No template found for week starting:', weekStart);
                return null;
            }
        } catch (error) {
            console.error('Error in getWeeklyTemplateForDate:', error);
            throw error;
        }
    },
    
    // Get template history from the weekly_templates table
    getWeeklyTemplateHistory: async function(limit = 10) {
        try {
            const supabase = await this.getSupabaseClient();
            
            console.log('Getting weekly template history, limit:', limit);
            
            const { data, error } = await supabase
                .from('weekly_templates')
                .select('*')
                .order('week_start', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('Error retrieving weekly template history:', error);
                throw error;
            }
            
            return data || [];
        } catch (error) {
            console.error('Error in getWeeklyTemplateHistory:', error);
            throw error;
        }
    },
    
    // Delete a template by ID
    deleteWeeklyTemplate: async function(templateId) {
        if (!templateId) throw new Error('Template ID is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            
            console.log('Deleting template with ID:', templateId);
            
            const { data, error } = await supabase
                .from('weekly_templates')
                .delete()
                .eq('id', templateId);
                
            if (error) {
                console.error('Error deleting template:', error);
                throw error;
            }
            
            console.log('Template deleted successfully');
            return true;
        } catch (error) {
            console.error('Error in deleteWeeklyTemplate:', error);
            throw error;
        }
    },

    // --- ADDED: Functions for Daily Practice Content ---

    // Get practice content for a specific date
    getDailyPracticeContent: async function(date) {
        if (!date) throw new Error('Date is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            console.log('Getting daily practice content for date:', date);
            
            const { data, error } = await supabase
                .from('daily_practice') // New table name
                .select('content')
                .eq('practice_date', date)
                .maybeSingle(); // Use maybeSingle to return null if not found, instead of erroring
            
            if (error) {
                console.error('Error retrieving daily practice content:', error);
                throw error; // Re-throw actual DB errors
            }
            
            console.log('Content found:', data ? data.content : null);
            return data ? data.content : null; // Return content string or null
        } catch (error) {
            console.error('Error in getDailyPracticeContent:', error);
            throw error;
        }
    },

    // Save (Upsert) practice content for a specific date
    saveDailyPracticeContent: async function(date, content) {
        if (!date) throw new Error('Date is required');
        // Allow empty string for content, but maybe check for null/undefined if needed
        // if (content === null || content === undefined) throw new Error('Content is required');
        
        try {
            const supabase = await this.getSupabaseClient();
            console.log(`Upserting daily practice content for ${date}`);
            
            const dataToSave = {
                practice_date: date,
                content: content,
                updated_at: new Date().toISOString()
            };

            // Upsert based on the unique practice_date
            const { data, error } = await supabase
                .from('daily_practice') 
                .upsert(dataToSave, { onConflict: 'practice_date' })
                .select()
                .single();
            
            if (error) {
                console.error('Error upserting daily practice content:', error);
                throw error;
            }
            
            console.log('Daily practice content saved:', data);
            return data;
        } catch (error) {
            console.error('Error in saveDailyPracticeContent:', error);
            throw error;
        }
    },

    // Apply daily practice content to all relevant parent forms
    applyDailyPracticeContent: async function(date, content) {
        if (!date) throw new Error('Date is required');

        try {
            console.log(`Applying daily practice content for ${date}`);
            showLoading(true); // Assuming showLoading is accessible or defined globally

            // Step 1: Save the canonical daily content
            await this.saveDailyPracticeContent(date, content);
            console.log('Canonical daily content saved.');

            // Step 2: Calculate the week_start for the given practice_date
            let weekStart;
            try {
                const practiceDateObj = new Date(date + 'T00:00:00Z'); // Treat date as UTC to avoid timezone issues
                const day = practiceDateObj.getUTCDay(); // 0 = Sunday, 1 = Monday
                const diff = practiceDateObj.getUTCDate() - (day === 0 ? 6 : day - 1); // Adjust for Sunday
                const weekStartObj = new Date(practiceDateObj.setUTCDate(diff));
                weekStart = weekStartObj.toISOString().split('T')[0];
                console.log(`Calculated week_start: ${weekStart} for practice_date: ${date}`);
            } catch (dateError) {
                console.error('Error calculating week_start:', dateError);
                throw new Error('Invalid date format provided.');
            }

            // Step 3: Get all current parent IDs
            const parents = await this.getParents(); // Reuse existing function
            const parentIds = parents.map(p => p.id);

            if (!parentIds || parentIds.length === 0) {
                console.log('No parents found, skipping update to forms table.');
                showLoading(false);
                return { success: true, message: 'Daily content saved, but no parents found to apply it to.' };
            }
            console.log(`Found ${parentIds.length} parents to update.`);

            // Step 4: Update the 'practicecontent' in the 'forms' table for relevant parents and week_start
            const supabase = await this.getSupabaseClient();
            console.log(`Updating forms table for week_start ${weekStart} and ${parentIds.length} parents.`);
            
            const { count, error: updateError } = await supabase
                .from('forms')
                .update({ practicecontent: content, updated_at: new Date().toISOString() })
                .eq('week_start', weekStart)
                .in('parent_id', parentIds);

            if (updateError) {
                console.error('Error updating forms table:', updateError);
                throw updateError;
            }

            console.log(`Successfully updated practicecontent for ${count !== null ? count : 'an unknown number of'} forms.`);
            showLoading(false);
            return { success: true, updatedCount: count };

        } catch (error) {
            console.error('Error in applyDailyPracticeContent:', error);
            if (typeof showLoading === 'function') showLoading(false);
            throw error;
        }
    }

    // --- END ADDED Daily Practice Content Functions ---
};

// Set up the global Supabase instance
try {
    // Use the singleton pattern to get or create the instance
    if (!supabaseClientInstance && typeof supabase !== 'undefined') {
        supabaseClientInstance = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    
    // Make it available globally
    window.supabaseClient = supabaseClientInstance;
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// Export all functions
window.supabaseAuth = supabaseAuth; 