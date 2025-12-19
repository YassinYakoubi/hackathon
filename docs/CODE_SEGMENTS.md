# CODE_SEGMENTS.md

## Overview
This document provides a breakdown of the code segments linked to each feature of the project, detailing how specific functionalities are implemented in the codebase. The project consists of a frontend application that includes a quiz feature and a chat feature, along with a backend that handles data synchronization and storage.

## Feature: Quiz Functionality

### 1. Quiz Questions
**File:** `frontend/quiz.html`

```javascript
const QUIZ_QUESTIONS = [
  { id: 1, text: "I feel tense, on edge, or physically restless.", dimension: "anxiety" },
  // ... additional questions
];
```
- **Explanation:** This segment defines an array of quiz questions, each with a unique ID, text, and associated dimension (e.g., anxiety, low mood). This data structure is essential for rendering questions dynamically in the quiz interface.

### 2. Rendering Questions
**File:** `frontend/quiz.html`

```javascript
function renderQuestion() {
  const question = QUIZ_QUESTIONS[currentQuestion];
  // ... rendering logic
}
```
- **Explanation:** The `renderQuestion` function is responsible for displaying the current question based on the user's progress. It updates the progress bar and populates the question card with the question text and answer options.

### 3. Selecting Answers
**File:** `frontend/quiz.html`

```javascript
function selectAnswer(questionId, score) {
  answers[questionId] = score;
  renderQuestion();
}
```
- **Explanation:** This function captures the user's selected answer for a specific question and updates the `answers` object. It then calls `renderQuestion` to refresh the display with the updated selection.

### 4. Navigation Between Questions
**File:** `frontend/quiz.html`

```javascript
function nextQuestion() {
  if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}
```
- **Explanation:** The `nextQuestion` function allows users to navigate to the next question in the quiz. It checks if there are more questions available and increments the `currentQuestion` index accordingly.

### 5. Submitting the Quiz
**File:** `frontend/quiz.html`

```javascript
function submitQuiz() {
  const scores = calculateResults();
  // ... results processing
}
```
- **Explanation:** This function is triggered when the user submits the quiz. It calculates the results based on the user's answers and prepares the data for display in the results section.

## Feature: Results Display

### 1. Calculating Results
**File:** `frontend/quiz.html`

```javascript
function calculateResults() {
  const dimensions = { anxiety: 0, low_mood: 0, burnout: 0, focus_difficulties: 0 };
  // ... score calculation logic
}
```
- **Explanation:** The `calculateResults` function aggregates the scores for each dimension based on the user's answers. It normalizes the scores to a percentage for easier interpretation.

### 2. Displaying Results
**File:** `frontend/quiz.html`

```javascript
resultsContainer.innerHTML = `
  <div class="results-card">
    <h2>Your Results Are Ready! 🎉</h2>
    // ... results content
  </div>
`;
```
- **Explanation:** This segment constructs the HTML for displaying the results after the quiz is submitted. It includes the user's primary challenge, scores, and personalized support suggestions.

## Feature: Navigation Bar

### 1. Navbar Functionality
**File:** `frontend/navbar.js`

```javascript
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() {
    // ... navigation logic
  });
});
```
- **Explanation:** This code segment adds event listeners to navigation links in the navbar. When a link is clicked, it triggers the navigation logic to smoothly transition between different pages of the application.

## Data Persistence

### 1. Storing User Profile
**File:** `frontend/quiz.html`

```javascript
localStorage.setItem('userProfile', JSON.stringify({
  personaId: persona.name,
  // ... additional user data
}));
```
- **Explanation:** This segment stores the user's profile data in the browser's local storage upon quiz submission. This ensures that user data persists even after refreshing the page.

## Conclusion
This document outlines the key code segments that implement the main functionalities of the project. Each feature is linked to specific code segments, providing insights into how the application operates and how data flows through the system.