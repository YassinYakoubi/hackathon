# FEATURE_WORKFLOWS.md

## Feature Workflows Overview

This document outlines the workflows for each feature of the Wellbeing Companion application, detailing how users interact with the system and how data flows through the application.

### 1. Navbar Functionality

- **Purpose**: The navigation bar allows users to seamlessly navigate between different pages of the application (e.g., Quiz, Chat).
- **Workflow**:
  1. **Page Load**: When any page is opened, the navbar is rendered at the top of the page, displaying the logo and navigation links.
  2. **Navigation**: Users can click on the navigation links to switch between pages. The `navbar.js` file handles the dynamic updates and transitions.
  3. **Smooth Transitions**: The transitions between pages are designed to be smooth, enhancing user experience.

### 2. Quiz Feature

- **Purpose**: The quiz feature allows users to assess their mental wellbeing through a series of questions.
- **Workflow**:
  1. **Quiz Initialization**: When the user accesses the quiz page (`quiz.html`), the quiz questions are loaded from the `QUIZ_QUESTIONS` array in the JavaScript code.
  2. **Question Display**: Each question is displayed one at a time, with options for users to select their answers.
  3. **Progress Tracking**: A progress bar visually indicates how far the user is in the quiz.
  4. **Answer Selection**: Users select answers, which are stored in the `answers` object.
  5. **Navigation**: Users can navigate between questions using "Next" and "Previous" buttons. The state of the quiz is maintained as users navigate.
  6. **Submission**: Upon completion, users submit their answers, triggering the calculation of results and displaying personalized feedback based on their responses.

### 3. Results Display

- **Purpose**: After completing the quiz, users receive feedback on their mental wellbeing.
- **Workflow**:
  1. **Results Calculation**: The application calculates scores for different dimensions (anxiety, low mood, burnout, focus difficulties) based on user responses.
  2. **Persona Generation**: The application determines a user persona based on the highest score in the dimensions.
  3. **Results Presentation**: The results are displayed in a structured format, including the user's persona, primary challenge, and how the application can assist them.

### 4. Data Persistence

- **Purpose**: Ensure that user data persists across page refreshes and sessions.
- **Workflow**:
  1. **Local Storage**: User responses and results are stored in the browser's local storage upon quiz submission.
  2. **Data Retrieval**: When the user returns to the application, the stored data can be retrieved to maintain continuity in user experience.

### 5. Chat Feature

- **Purpose**: The chat feature allows users to interact with the application for further support.
- **Workflow**:
  1. **Accessing Chat**: Users can navigate to the chat page (`chat.html`) from the results page.
  2. **User Interaction**: The chat interface allows users to send messages and receive responses, facilitating ongoing support.
  3. **Data Sync**: Any interactions in the chat are synchronized with the backend to ensure that user data is consistent and up-to-date.

### Conclusion

The Wellbeing Companion application is designed to provide a seamless and supportive experience for users seeking to assess and improve their mental wellbeing. Each feature is interconnected, ensuring that user interactions are smooth and data is consistently managed throughout the application.