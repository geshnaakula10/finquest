'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface Question {
  scenario: string;
  correct: 'save' | 'invest';
  explanation: string;
}

interface SaveOrInvestGameProps {
  onXpChange: (delta: number) => void;
  onLevelComplete?: () => void;
}

const questions: Question[] = [
  {
    scenario: "You might need this money in the next 3 months for medical expenses.",
    correct: "save",
    explanation:
      "Money needed in the short term or for emergencies should be kept safe and easily accessible.",
  },
  {
    scenario: "You are saving money for a vacation planned 6 months from now.",
    correct: "save",
    explanation:
      "Short-term goals should be saved, not invested, to avoid market risk.",
  },
  {
    scenario: "You are planning for retirement that is 25 years away.",
    correct: "invest",
    explanation:
      "Long-term goals benefit from investing because of compounding and higher returns over time.",
  },
  {
    scenario: "You want to buy a house in 10 years and can tolerate some risk.",
    correct: "invest",
    explanation:
      "Long-term goals with flexible timelines are suitable for investing.",
  },
  {
    scenario: "You have an emergency fund already and extra money you won't need for 15 years.",
    correct: "invest",
    explanation:
      "Once emergencies are covered, long-term surplus money can be invested for growth.",
  },
  {
    scenario: "You are unsure when you might need the money and cannot afford losses.",
    correct: "save",
    explanation:
      "If you need certainty and capital protection, saving is the safer choice.",
  },
];

const TIME_PER_QUESTION = 15; // seconds per question
const FEEDBACK_DURATION = 2000; // milliseconds to show feedback before auto-advancing

export default function SaveOrInvestGame({ onXpChange, onLevelComplete }: SaveOrInvestGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'save' | 'invest' | 'timeout' | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleNext = useCallback(() => {
    // Clear any timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
      // Mark level as complete when game finishes
      if (onLevelComplete) {
        onLevelComplete();
      }
    }
  }, [currentQuestionIndex]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(TIME_PER_QUESTION);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowFeedback(false);

    // Clear any existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - mark as incorrect and show feedback
          setSelectedAnswer(prevAnswer => {
            if (prevAnswer === null) {
              setShowFeedback(true);
              // Auto-advance after feedback
              feedbackTimerRef.current = setTimeout(() => {
                handleNext();
              }, FEEDBACK_DURATION);
              return 'timeout';
            }
            return prevAnswer;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [currentQuestionIndex, handleNext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleAnswer = useCallback((answer: 'save' | 'invest') => {
    if (selectedAnswer !== null) return; // Prevent multiple selections

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const answerTime = Date.now() - questionStartTime;
    const timeTaken = answerTime / 1000; // Convert to seconds
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correct;

    if (correct) {
      setScore(prev => prev + 1);

      // Calculate XP based on speed
      // Base XP: 10 points
      // Bonus XP: up to 10 extra points for answering quickly
      // Formula: 10 + (10 * (timeRemaining / TIME_PER_QUESTION))
      const timeBonus = Math.max(0, (timeRemaining / TIME_PER_QUESTION) * 10);
      const xpEarned = Math.round(10 + timeBonus);

      onXpChange(xpEarned);
      setTotalTime(prev => prev + timeTaken);
    } else {
      setTotalTime(prev => prev + timeTaken);
    }

    setShowFeedback(true);

    // Auto-advance after feedback duration
    feedbackTimerRef.current = setTimeout(() => {
      handleNext();
    }, FEEDBACK_DURATION);
  }, [selectedAnswer, currentQuestion.correct, onXpChange, timeRemaining, questionStartTime, handleNext]);

  // Completion screen
  if (gameCompleted) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-2xl p-8 md:p-12 border-2 border-green-500 shadow-2xl text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl md:text-4xl font-bold text-green-300 mb-2">
                Game Complete!
              </h2>
              <p className="text-lg text-gray-300">
                You scored {score} out of {questions.length}
              </p>
            </div>

            <div className="mb-8">
              <div className="text-5xl font-black text-yellow-400 mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(score / questions.length) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Average time: {totalTime > 0 ? (totalTime / questions.length).toFixed(1) : 0}s per question
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                {score === questions.length
                  ? "Perfect score! You're a financial expert! 🌟"
                  : score >= questions.length * 0.8
                    ? "Great job! You understand saving vs investing well! 👍"
                    : "Good effort! Keep learning and you'll master this! 💪"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-300">
                Score: {score}/{questions.length}
              </span>
              <div className={`text-lg font-bold px-3 py-1 rounded-full ${timeRemaining <= 5
                  ? 'bg-red-600 text-white animate-pulse'
                  : timeRemaining <= 8
                    ? 'bg-yellow-500 text-black'
                    : 'bg-green-600 text-white'
                }`}>
                ⏱️ {timeRemaining}s
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Time progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${timeRemaining <= 5
                  ? 'bg-red-500'
                  : timeRemaining <= 8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              style={{ width: `${(timeRemaining / TIME_PER_QUESTION) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-gray-700 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
              What should you do?
            </h3>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
              {currentQuestion.scenario}
            </p>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleAnswer('save')}
              disabled={selectedAnswer !== null}
              className={`
                px-6 py-6 rounded-xl font-bold text-lg transition-all duration-200
                ${selectedAnswer === null
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
                  : selectedAnswer === 'save'
                    ? isCorrect
                      ? 'bg-green-600 text-white border-4 border-green-400'
                      : 'bg-red-600 text-white border-4 border-red-400'
                    : currentQuestion.correct === 'save'
                      ? 'bg-green-600/50 text-green-200 border-2 border-green-400'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              💰 SAVE
            </button>

            <button
              onClick={() => handleAnswer('invest')}
              disabled={selectedAnswer !== null}
              className={`
                px-6 py-6 rounded-xl font-bold text-lg transition-all duration-200
                ${selectedAnswer === null
                  ? 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-95'
                  : selectedAnswer === 'invest'
                    ? isCorrect
                      ? 'bg-green-600 text-white border-4 border-green-400'
                      : 'bg-red-600 text-white border-4 border-red-400'
                    : currentQuestion.correct === 'invest'
                      ? 'bg-green-600/50 text-green-200 border-2 border-green-400'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              📈 INVEST
            </button>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`
                rounded-xl p-6 mb-6 border-2 transition-all duration-300
                ${selectedAnswer === 'timeout'
                  ? 'bg-orange-900/50 border-orange-500'
                  : isCorrect
                    ? 'bg-green-900/50 border-green-500'
                    : 'bg-red-900/50 border-red-500'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {selectedAnswer === 'timeout' ? '⏰' : isCorrect ? '✅' : '❌'}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-xl font-bold mb-2 ${selectedAnswer === 'timeout'
                        ? 'text-orange-300'
                        : isCorrect
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}
                  >
                    {selectedAnswer === 'timeout'
                      ? 'Time\'s Up!'
                      : isCorrect
                        ? 'Correct!'
                        : 'Incorrect'}
                  </h4>
                  {selectedAnswer !== 'timeout' && (
                    <p className="text-gray-200 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  )}
                  {selectedAnswer === 'timeout' && (
                    <p className="text-gray-200 leading-relaxed">
                      The correct answer was: <span className="font-bold text-orange-300">{currentQuestion.correct.toUpperCase()}</span>
                      <br />
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Auto-advance indicator */}
          {showFeedback && (
            <div className="flex justify-center mb-4">
              <p className="text-sm text-gray-400 animate-pulse">
                Next question in {Math.ceil(FEEDBACK_DURATION / 1000)}s...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

