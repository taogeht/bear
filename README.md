# Parent-Teacher Communication App

A web application for facilitating communication between teachers and parents through weekly forms.

## Features

### Authentication
- Teacher and parent login systems
- Session management and secure authentication

### Teacher Dashboard
- View all parents and their weekly form status
- Add new parents to the system
- Fill out weekly forms for each student
- View form history for each parent

### Parent Dashboard
- Submit weekly forms with information about student progress
- View teacher's weekly notes and assignments
- Access history of all previously submitted forms

### Form Management
- Two-way communication through forms
- Both teachers and parents can update forms
- Form data is stored in a Supabase database
- Weekly tracking with date-specific records

### Form History
- View previously submitted forms in a read-only format
- Organized by week, showing both teacher and parent inputs
- Printable view for record keeping
- Mobile-friendly interface

## Technical Details

### Technologies Used
- HTML, CSS, and JavaScript for the frontend
- Supabase for backend database and authentication
- JSON for data exchange

### Database Schema
The application uses several tables in Supabase:
- `teachers`: Stores teacher information
- `parents`: Stores parent information
- `forms`: Stores the weekly communication forms

### Form Structure
Each form contains:
- Teacher inputs: mood, weekly song, homework assignments, comments
- Parent inputs: sleep time, help needed, breakfast, activity ratings, comments

## Getting Started

1. Open `index.html` in a web browser
2. Choose either Teacher or Parent login
3. Log in with your credentials
4. For teachers: View all parents and manage forms
5. For parents: Submit your weekly form or view history

## Form History View

The Form History feature allows both teachers and parents to:
- Browse previous weekly forms
- View a complete record of communication
- Print forms for record keeping
- Track student progress over time

Forms are displayed in a clean, two-column layout showing both teacher and parent inputs side by side.

## Setup

1. Make sure the Supabase URL and API key in `supabase-config.js` are correct for your Supabase project.

2. Run the SQL schema creation script in your Supabase SQL Editor:
   - Upload and execute `supabase-schema.sql` to create the necessary tables and relationships.

3. If you need to add a user with a specific UUID:
   - Upload and execute `add-uuid-user.sql` in your Supabase SQL Editor
   - This will add sample users with the specified UUID (3e282c5f-8c07-4c3c-9e3b-fcd29a3aba95)
   - You can modify the script to use your own UUIDs as needed

4. Open `index.html` in your browser to start using the application.

## Using the Application

### Login

The application now supports one method of login:

1. **Email Login**: The traditional login using email and password


### Features

#### Parent Features
- View weekly forms prepared by teachers
- Fill out their part of the weekly communication form 
- View history of past communications

#### Teacher Features
- Create weekly forms for parents
- View all parents' responses
- Management dashboard to track communications

## Troubleshooting

If you encounter login issues:

1. Check that your Supabase URL and API key are correct in `supabase-config.js`
2. Ensure the SQL schema has been properly executed
3. Verify that the user (UUID or email) exists in the database
4. Check browser console for any specific error messages

## Database Structure

The application uses three main tables:
- `teachers`: Teacher information
- `parents`: Parent information
- `forms`: Weekly communication forms with fields for both teachers and parents

Each user (parent/teacher) has a UUID primary key that's used for authentication and data retrieval.

## Features

- Separate login systems for parents and teachers
- Weekly communication forms with sections for both parents and teachers
- Data storage in Supabase database
- Dashboard views for both parents and teachers
- Form submission and tracking

## Setup Instructions

### 1. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. In the SQL Editor, run the SQL commands from `supabase-schema.sql` to create all necessary tables, sample data, and security policies
3. Copy your Supabase URL and anon key from the API settings page

### 2. Configure the Application

1. Open `supabase-config.js` and update the following variables with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
   const SUPABASE_KEY = 'your-supabase-anon-key';
   ```

### 3. Run the Application

1. The application is built with plain HTML, CSS, and JavaScript and can be run directly in a browser
2. Simply open `index.html` in your browser, or run the included script:
   ```
   ./run.sh
   ```
3. If you're using Cursor IDE, you can simply open `index.html` directly in the built-in browser

## Usage

### Teacher Login

- Email: teacher@example.com
- Password: password123

### Parent Login

- Email: parent1@example.com (or parent2@example.com, parent3@example.com)
- Password: password123

## Files and Structure

- `index.html` - Main entry point/parent login
- `teacher-login.html` - Teacher login page
- `parent-login.html` - Parent login page
- `parent-dashboard.html` - Dashboard for parents
- `teacher-dashboard.html` - Dashboard for teachers
- `parent-form.html` - Form for parents to fill out
- `teacher-form.html` - Form for teachers to fill out
- `supabase-config.js` - Configuration and utility functions for Supabase
- `supabase-schema.sql` - SQL commands to set up the database schema

## Security Note

This is a sample application with simplified authentication. In a production environment, you should:

1. Use Supabase Auth or another authentication provider instead of storing passwords in the database
2. Implement proper security measures and input validation
3. Use HTTPS for all communications
4. Consider adding request throttling to prevent brute force attacks 