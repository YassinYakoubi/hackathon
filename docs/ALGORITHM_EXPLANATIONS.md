# ALGORITHM_EXPLANATIONS.md

## Overview

This document provides detailed explanations of the algorithms used in the project, focusing on the logic and calculations that drive the application's functionality. The primary features of the application include a mental wellbeing assessment quiz and a chat interface for user interaction. Below are the key algorithms and their workflows.

## 1. Quiz Functionality

### 1.1 Question Rendering Algorithm

- **Purpose**: To display the current question and its options to the user.
- **Code Segment**:
  ```javascript
  function renderQuestion() {
      const question = QUIZ_QUESTIONS[currentQuestion];
      const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
      
      document.getElementById('progressBar').style.width = progress + '%';
      
      const container = document.getElementById('questionsContainer');
      container.innerHTML = `
        <div class="question-card">
          <div class="question-number">Question ${currentQuestion + 1} of ${QUIZ_QUESTIONS.length}</div>
          <div class="question-text">${question.text}</div>
          
          <div class="options-grid">
            ${[1, 2, 3, 4, 5].map(score => `
              <button class="option-button ${answers[question.id] === score ? 'selected' : ''}" 
                      onclick="selectAnswer(${question.id}, ${score})">
                <div style="font-size: 24px; font-weight: 800;">${score}</div>
                <span class="option-label">${getScoreLabel(score)}</span>
              </button>
            `).join('')}
          </div>

          <div class="navigation-buttons">
            <button class="nav-button btn-secondary" 
                    onclick="previousQuestion()" 
                    ${currentQuestion === 0 ? 'style="visibility: hidden;"' : ''}>
              ← Previous
            </button>
            
            ${currentQuestion === QUIZ_QUESTIONS.length - 1 ? `
              <button class="nav-button btn-primary" 
                      onclick="submitQuiz()" 
                      ${!answers[question.id] ? 'disabled' : ''}>
                Submit Quiz 🎯
              </button>
            ` : `
              <button class="nav-button btn-primary" 
                      onclick="nextQuestion()" 
                      ${!answers[question.id] ? 'disabled' : ''}>
                Next →
              </button>
            `}
          </div>
        </div>
      `;
  }
  ```
- **Workflow**:
  1. Retrieve the current question based on `currentQuestion` index.
  2. Calculate the progress percentage based on the number of answered questions.
  3. Update the progress bar width.
  4. Render the question text and options dynamically.
  5. Display navigation buttons based on the current question index.

### 1.2 Answer Selection Algorithm

- **Purpose**: To record the user's selected answer for the current question.
- **Code Segment**:
  ```javascript
  function selectAnswer(questionId, score) {
      answers[questionId] = score;
      renderQuestion();
  }
  ```
- **Workflow**:
  1. Update the `answers` object with the selected score for the corresponding question ID.
  2. Call `renderQuestion()` to refresh the display with the updated selection.

### 1.3 Result Calculation Algorithm

- **Purpose**: To calculate the scores for each dimension based on user responses.
- **Code Segment**:
  ```javascript
  function calculateResults() {
      const dimensions = {
          anxiety: 0,
          low_mood: 0,
          burnout: 0,
          focus_difficulties: 0
      };

      QUIZ_QUESTIONS.forEach(q => {
          dimensions[q.dimension] += answers[q.id] || 0;
      });

      Object.keys(dimensions).forEach(key => {
          dimensions[key] = Math.round((dimensions[key] / 25) * 100);
      });

      return dimensions;
  }
  ```
- **Workflow**:
  1. Initialize a `dimensions` object to hold scores for each category.
  2. Iterate through each question, summing the scores based on user answers.
  3. Normalize the scores to a percentage (out of 100) for each dimension.
  4. Return the final scores.

### 1.4 Persona Determination Algorithm

- **Purpose**: To determine the user's persona based on their scores.
- **Code Segment**:
  ```javascript
  function getPersona(scores) {
      const sortedDimensions = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primaryChallenge = sortedDimensions[0][0];
      const primaryScore = sortedDimensions[0][1];

      const personas = {
          anxiety: {
              name: 'The Overthinker',
              icon: '😰',
              description: 'You tend to worry and feel on edge. Your mind often races with what-ifs and worst-case scenarios.',
              support: 'I can help you with calming techniques, mindfulness exercises, and strategies to manage worry.'
          },
          low_mood: {
              name: 'The Heavy Heart',
              icon: '💙',
              description: 'You\'re experiencing low mood and reduced motivation. Things that used to bring joy might feel harder to engage with.',
              support: 'I can offer emotional support, help you rediscover activities you enjoy, and provide coping strategies.'
          },
          burnout: {
              name: 'The Exhausted Achiever',
              icon: '😓',
              description: 'You\'re running on empty. Constant demands have left you feeling drained and overwhelmed.',
              support: 'I can help you set boundaries, prioritize self-care, and find sustainable ways to manage your energy.'
          },
          focus_difficulties: {
              name: 'The Scattered Mind',
              icon: '🌪️',
              description: 'You struggle with concentration and getting started on tasks. Organization and follow-through feel challenging.',
              support: 'I can help you break tasks down, create structure, and develop strategies to improve focus.'
          }
      };

      return {
          ...personas[primaryChallenge],
          primaryChallenge,
          primaryScore
      };
  }
  ```
- **Workflow**:
  1. Sort the dimensions based on scores to identify the primary challenge.
  2. Retrieve the corresponding persona details from the predefined `personas` object.
  3. Return the persona information along with the primary challenge and score.

## 2. Data Persistence

### 2.1 Local Storage Algorithm

- **Purpose**: To store user results in the browser's local storage for persistence.
- **Code Segment**:
  ```javascript
  localStorage.setItem('userProfile', JSON.stringify({
      personaId: persona.name,
      primaryChallenge: persona.primaryChallenge,
      scores: scores,
      completedAt: new Date().toISOString()
  }));
  ```
- **Workflow**:
  1. Convert the user profile data into a JSON string.
  2. Store the string in local storage under the key `userProfile`.

## Conclusion

This document outlines the key algorithms that power the quiz functionality and data persistence in the application. Each algorithm is designed to ensure a smooth user experience while providing meaningful insights into mental wellbeing.