"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [text, setText] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch MCQs");
      }
      const data = await res.json();
      setMcqs(data);
      // Reset states for a new session
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setUserAnswers([]);
    } catch (error) {
      console.error(error);
      // Handle error state in UI
    }
  };

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = option;
    setUserAnswers(newUserAnswers);
    setIsAnswered(true);
    const correctOptionIndex = mcqs[currentQuestionIndex].answer;
    if (mcqs[currentQuestionIndex].options[correctOptionIndex] === option) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  if (mcqs.length > 0 && currentQuestionIndex < mcqs.length) {
    const currentQuestion = mcqs[currentQuestionIndex];
    const correctOptionIndex = currentQuestion.answer;

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.mcqContainer}>
            <h2>{currentQuestion.question}</h2>
            <div className={styles.options}>
              {currentQuestion.options.map((option, index) => {
                const isCorrect =
                  currentQuestion.options[correctOptionIndex] === option;
                const isSelected = selectedOption === option;
                let buttonStyle = styles.optionButton;
                if (isAnswered) {
                  if (isCorrect) {
                    buttonStyle = `${styles.optionButton} ${styles.correct}`;
                  } else if (isSelected) {
                    buttonStyle = `${styles.optionButton} ${styles.incorrect}`;
                  }
                }
                return (
                  <button
                    key={index}
                    className={buttonStyle}
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswered}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <button
                onClick={handleNextQuestion}
                className={styles.nextButton}
              >
                {currentQuestionIndex < mcqs.length - 1 ? "Next" : "Finish"}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (mcqs.length > 0 && currentQuestionIndex >= mcqs.length) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.resultsContainer}>
            <h2>Quiz Completed!</h2>
            <p>
              Your score: {score} out of {mcqs.length}
            </p>
            <div className={styles.summaryContainer}>
              <h3>Quiz Summary</h3>
              {mcqs.map((mcq, index) => {
                const correctOptionIndex = mcq.answer;
                const correctOption = mcq.options[correctOptionIndex];
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === correctOption;

                return (
                  <div key={index} className={styles.summaryItem}>
                    <p>
                      <strong>Question {index + 1}</strong>: {mcq.question}
                    </p>
                    <p
                      className={
                        isCorrect ? styles.correctAnswer : styles.wrongAnswer
                      }
                    >
                      Your answer: {userAnswer}{" "}
                      {isCorrect ? "(Correct)" : "(Wrong)"}
                    </p>
                    {!isCorrect && (
                      <p className={styles.correctAnswer}>
                        Correct answer: {correctOption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setMcqs([]);
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setScore(0);
                setUserAnswers([]);
              }}
              className={styles.primary}
            >
              Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your multiple-choice questions text here..."
            rows={20}
            cols={100}
          />
          <button type="submit" className={styles.primary}>
            Start Quiz
          </button>
        </form>
      </main>
    </div>
  );
}
