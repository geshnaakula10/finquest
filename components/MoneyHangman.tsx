'use client';

import { useState, useEffect, useCallback } from 'react';
import HangmanFigure from './HangmanFigure';

// Data structure for questions
interface Question {
  sentence: string;
  answers: string[];
  explanation: string;
}

// Game data - all questions in order with explanations
const GAME_DATA: Question[] = [
  {
    sentence: "Money often disappears by the end of the month because people do not ________ or ________ their spending.",
    answers: ["plan", "track"],
    explanation: "When people do not plan how to use their money or track where it is spent, small expenses add up. This causes money to run out without knowing where it went."
  },
  {
    sentence: "Budgeting means planning and controlling how money comes ________ and goes ________.",
    answers: ["in", "out"],
    explanation: "Money comes in as income and goes out as expenses. Budgeting is about managing both inflows and outflows of money."
  },
  {
    sentence: "Money that you receive, such as salary or allowance, is called ________.",
    answers: ["income"],
    explanation: "Income is any money that comes to you from work, business, or other sources. It increases the amount of money you have."
  },
  {
    sentence: "Money that you spend on things like food, rent, or transport is called ________.",
    answers: ["expenses"],
    explanation: "Expenses are costs or payments you make for daily needs and wants. Expenses reduce the money you have available."
  },
  {
    sentence: "Tracking money helps you understand where your money is being ________ and how much is ________.",
    answers: ["spent", "remaining"],
    explanation: "By tracking money, you can see what your money is spent on and how much is left. This helps you control spending and plan better."
  }
];

// Flatten all answers into individual rounds
const getAllRounds = (): {
  sentence: string;
  answer: string;
  explanation: string;
  roundIndex: number;
  totalRounds: number;
  questionIndex: number;
  answerIndex: number;
}[] => {
  const rounds: {
    sentence: string;
    answer: string;
    explanation: string;
    roundIndex: number;
    totalRounds: number;
    questionIndex: number;
    answerIndex: number;
  }[] = [];
  let globalIndex = 0;
  let totalRounds = 0;

  // First pass: count total rounds
  GAME_DATA.forEach(q => {
    totalRounds += q.answers.length;
  });

  // Second pass: create rounds
  GAME_DATA.forEach((q, questionIndex) => {
    q.answers.forEach((answer, answerIndex) => {
      rounds.push({
        sentence: q.sentence, // Keep original sentence, we'll render it dynamically
        answer: answer.toLowerCase(),
        explanation: q.explanation, // Share explanation for all blanks in same question
        roundIndex: globalIndex++,
        totalRounds,
        questionIndex,
        answerIndex
      });
    });
  });

  return rounds;
};

interface MoneyHangmanProps {
  onXpChange: (delta: number) => void;
  onLevelComplete?: () => void;
}

export default function MoneyHangman({ onXpChange, onLevelComplete }: MoneyHangmanProps) {
  const allRounds = getAllRounds();

  // Current game state
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasAwardedCompletion, setHasAwardedCompletion] = useState(false);
  const [hasAppliedPenalty, setHasAppliedPenalty] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentRound = allRounds[currentRoundIndex];
  const MAX_ATTEMPTS = 6;
  const remainingAttempts = MAX_ATTEMPTS - incorrectGuesses;

  // Reset game state for new round
  useEffect(() => {
    setGuessedLetters(new Set());
    setIncorrectGuesses(0);
    setGameStatus('playing');
    setFeedback('');
    setShowSuccess(false);
    setHasAwardedCompletion(false);
    setHasAppliedPenalty(false);
    setShowResult(false);
    setShowExplanation(false);
  }, [currentRoundIndex]);

  // Check if word is complete
  const isWordComplete = () => {
    const word = currentRound.answer;
    return word.split('').every(letter => guessedLetters.has(letter));
  };

  // Check if game is lost - when attempts reach 0, set status but don't reveal answer yet
  useEffect(() => {
    if (gameStatus === 'playing' && remainingAttempts <= 0) {
      setGameStatus('lost');

      // Apply XP penalty only once when failing
      if (!hasAppliedPenalty) {
        onXpChange(-10);
        setHasAppliedPenalty(true);
      }
    }
  }, [remainingAttempts, gameStatus, hasAppliedPenalty, onXpChange]);

  // Check if game is won - show explanation instead of auto-advancing
  useEffect(() => {
    if (gameStatus === 'playing' && isWordComplete()) {
      setGameStatus('won');
      setShowSuccess(true);
      setFeedback('Correct!');

      // Award completion bonus only once
      if (!hasAwardedCompletion) {
        onXpChange(20);
        setHasAwardedCompletion(true);
      }

      // Mark level as complete when last round is finished
      if (currentRoundIndex === allRounds.length - 1 && onLevelComplete) {
        onLevelComplete();
      }

      // Show explanation automatically after word completion
      // Small delay to let success feedback display briefly
      setTimeout(() => {
        setShowExplanation(true);
      }, 1000);
    }
  }, [guessedLetters, gameStatus, hasAwardedCompletion, onXpChange, currentRoundIndex, allRounds.length, onLevelComplete]);

  /**
   * Shared guess handler - used by both on-screen buttons and keyboard input
   * Handles letter guessing logic including XP, feedback, and game state updates
   * Memoized with useCallback to ensure stable reference for event listeners
   * 
   * @param letter - The letter being guessed (will be converted to lowercase)
   */
  const handleGuess = useCallback((letter: string) => {
    // Normalize input to lowercase
    const normalizedLetter = letter.toLowerCase();

    // Validate input: must be a single letter (a-z)
    if (!/^[a-z]$/.test(normalizedLetter)) {
      return;
    }

    // Only process guesses when game is in 'playing' state and explanation is not showing
    if (gameStatus !== 'playing' || showExplanation) {
      return;
    }

    // Ignore already guessed letters (no penalty, no feedback)
    if (guessedLetters.has(normalizedLetter)) {
      return;
    }

    // Add letter to guessed set
    setGuessedLetters(prev => {
      const newGuessed = new Set(prev);
      newGuessed.add(normalizedLetter);
      return newGuessed;
    });

    // Check if guess is correct
    if (currentRound.answer.includes(normalizedLetter)) {
      // Correct guess: +5 XP
      onXpChange(5);
      setFeedback('Correct!');
      setTimeout(() => setFeedback(''), 1000);
    } else {
      // Incorrect guess: -2 XP and increment incorrect attempts
      onXpChange(-2);
      setIncorrectGuesses(prev => prev + 1);
      setFeedback('Try again');
      setTimeout(() => setFeedback(''), 1000);
    }
  }, [gameStatus, guessedLetters, currentRound, onXpChange, showExplanation]);

  // Keyboard input handler - listens for physical keyboard presses
  useEffect(() => {
    /**
     * Handles keyboard keydown events
     * Processes A-Z keys and delegates to shared handleGuess function
     * 
     * Keyboard input is disabled when:
     * - Game is not in 'playing' state (won/lost)
     * - Show Result screen is active
     * - Explanation is being displayed
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only process when game is actively playing and explanation is not showing
      // This also prevents input when "Show Result" is active (gameStatus !== 'playing')
      if (gameStatus !== 'playing' || showExplanation) {
        return;
      }

      // Get the pressed key
      const key = event.key;

      // Convert to lowercase for consistent processing
      const lowerKey = key.toLowerCase();

      // Only process A-Z keys (ignore numbers, special chars, function keys)
      if (/^[a-z]$/.test(lowerKey)) {
        // Prevent default browser behavior
        event.preventDefault();

        // Use shared guess handler
        handleGuess(lowerKey);
      }
    };

    // Attach event listener to window for global keyboard capture
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove event listener on unmount or when dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, showExplanation, handleGuess]); // handleGuess is stable due to useCallback

  // Handle showing result after failure - also shows explanation
  const handleShowResult = () => {
    setShowResult(true);
    setFeedback(`Correct answer: ${currentRound.answer}`);
    // Show explanation immediately when showing result
    setShowExplanation(true);
  };

  // Handle retry
  const handleRetry = () => {
    setGuessedLetters(new Set());
    setIncorrectGuesses(0);
    setGameStatus('playing');
    setFeedback('');
    setHasAppliedPenalty(false);
    setShowResult(false);
    setShowExplanation(false);
  };

  // Handle continuing to next word after viewing explanation
  const handleContinue = () => {
    // Move to next word (this will reset all state via useEffect)
    if (currentRoundIndex < allRounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    }
  };

  // Generate display word with underscores and revealed letters
  const getDisplayWord = () => {
    return currentRound.answer
      .split('')
      .map(letter => guessedLetters.has(letter) ? letter : '_')
      .join(' ');
  };

  // Alphabet for keyboard
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // Render sentence with blank replaced by word display
  const renderSentence = () => {
    const sentence = currentRound.sentence;
    const questionData = GAME_DATA[currentRound.questionIndex];
    const blankPattern = /_{4,}/g;

    // Find all blank positions using matchAll
    const blanks: RegExpMatchArray[] = [];
    const matches = sentence.matchAll(blankPattern);
    for (const match of matches) {
      blanks.push(match);
    }

    if (blanks.length === 0) {
      return <p className="text-lg md:text-xl mb-6 text-center">{sentence}</p>;
    }

    // Build sentence parts with previous answers filled in and current blank as hangman
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    blanks.forEach((match, blankIndex) => {
      const blankStart = match.index!;
      const blankEnd = blankStart + match[0].length;

      // Add text before this blank
      if (blankStart > lastIndex) {
        parts.push(sentence.substring(lastIndex, blankStart));
      }

      // Add the blank or answer
      if (blankIndex === currentRound.answerIndex) {
        // Current blank - show hangman word
        parts.push(
          <span key={blankIndex} className="font-mono font-bold text-2xl md:text-3xl text-yellow-300 tracking-wider mx-2">
            {getDisplayWord()}
          </span>
        );
      } else if (blankIndex < currentRound.answerIndex) {
        // Previous blank - show completed answer
        const completedAnswer = questionData.answers[blankIndex];
        parts.push(
          <span key={blankIndex} className="font-bold text-xl text-green-300 mx-1">
            {completedAnswer}
          </span>
        );
      } else {
        // Future blank - show underscores
        parts.push(
          <span key={blankIndex} className="font-mono text-xl text-gray-500 mx-1">
            {match[0]}
          </span>
        );
      }

      lastIndex = blankEnd;
    });

    // Add remaining text after last blank
    if (lastIndex < sentence.length) {
      parts.push(sentence.substring(lastIndex));
    }

    return (
      <p className="text-lg md:text-xl mb-6 text-center leading-relaxed">
        {parts}
      </p>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Money Hangman</h1>
          <p className="text-gray-300">
            Round {currentRoundIndex + 1} of {allRounds.length}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentRoundIndex + 1) / allRounds.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Hangman Figure */}
        <HangmanFigure incorrectAttempts={incorrectGuesses} />

        {/* Game Status */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold mb-2">
            Attempts remaining: <span className={`${remainingAttempts <= 2 ? 'text-red-400' : 'text-green-400'}`}>
              {remainingAttempts} / {MAX_ATTEMPTS}
            </span>
          </p>

          {feedback && gameStatus === 'playing' && (
            <p className={`text-lg font-semibold ${feedback === 'Correct!' ? 'text-green-400' : 'text-red-400'} animate-pulse`}>
              {feedback}
            </p>
          )}

          {/* Show Result Button - appears when game is lost but result not shown yet */}
          {gameStatus === 'lost' && !showResult && !showExplanation && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-lg text-red-300 mb-4">No attempts remaining!</p>
              <button
                onClick={handleShowResult}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-colors shadow-lg"
              >
                Show Result
              </button>
            </div>
          )}
        </div>

        {/* Sentence with blank */}
        <div className="bg-gray-800/50 rounded-lg p-6 md:p-8 mb-8 border border-gray-700">
          {renderSentence()}
        </div>

        {/* Explanation Panel - shown after word completion or failure */}
        {showExplanation && (
          <div className={`mb-8 p-6 md:p-8 rounded-lg border-2 ${gameStatus === 'won'
              ? 'bg-green-900/50 border-green-500'
              : 'bg-red-900/50 border-red-500'
            }`}>
            {/* Status Header */}
            <div className="text-center mb-4">
              <h3 className={`text-2xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-300' : 'text-red-300'
                }`}>
                {gameStatus === 'won' ? '✓ Correct!' : '✗ Incorrect'}
              </h3>
              <p className="text-lg text-gray-300 font-semibold">
                Correct answer: <span className="text-yellow-300 font-bold">{currentRound.answer}</span>
              </p>
            </div>

            {/* Explanation Text */}
            <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-blue-300 mb-3">💡 Learning Moment:</h4>
              <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                {currentRound.explanation}
              </p>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              {gameStatus === 'lost' && (
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors mr-4"
                >
                  Try Again
                </button>
              )}
              {currentRoundIndex < allRounds.length - 1 ? (
                <button
                  onClick={handleContinue}
                  className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-lg ${gameStatus === 'won'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  Continue →
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-lg text-gray-300 mb-4">You've completed all rounds!</p>
                  <button
                    onClick={handleRetry}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition-colors shadow-lg text-white"
                  >
                    Review Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keyboard - disabled when explanation is showing */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Guess a letter:
            <span className="text-sm text-gray-400 font-normal ml-2">(Click or type on keyboard)</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {alphabet.map(letter => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = currentRound.answer.includes(letter);
              // Disable buttons if guessed, not playing, explanation showing, or game is lost (before showing result)
              const isDisabled = isGuessed || gameStatus !== 'playing' || showExplanation;

              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isDisabled}
                  className={`
                    w-10 h-10 md:w-12 md:h-12
                    font-bold text-lg
                    rounded-lg
                    transition-all duration-200
                    ${isDisabled
                      ? isCorrect
                        ? 'bg-green-700 text-green-200 cursor-not-allowed'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 hover:scale-110 active:scale-95 text-white'
                    }
                  `}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion message */}
        {currentRoundIndex === allRounds.length - 1 && gameStatus === 'won' && (
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500">
            <p className="text-2xl font-bold text-green-300 mb-2">🎉 Congratulations!</p>
            <p className="text-lg text-gray-200">You've completed all rounds of Money Hangman!</p>
          </div>
        )}
      </div>
    </div>
  );
}
