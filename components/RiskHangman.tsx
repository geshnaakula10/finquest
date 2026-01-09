'use client';

import { useState, useEffect, useCallback } from 'react';
import HangmanFigure from './HangmanFigure';

// Data structure for questions
interface Question {
    sentence: string;
    answer: string;
    explanation: string;
}

// Game data - all questions in order with explanations
const GAME_DATA: Question[] = [
    {
        sentence: "Investments with higher returns usually come with higher ______.",
        answer: "risk",
        explanation:
            "Higher potential returns are usually linked to higher uncertainty and risk."
    },
    {
        sentence: "A savings account is considered a ______ risk option.",
        answer: "low",
        explanation:
            "Savings accounts are stable and protected, making them low-risk."
    },
    {
        sentence: "Stocks generally have higher risk but also the potential for higher ______.",
        answer: "returns",
        explanation:
            "Stocks can grow significantly over time but may fluctuate in the short term."
    },
    {
        sentence: "When risk is low, returns are usually ______.",
        answer: "lower",
        explanation:
            "Safer options usually offer smaller returns in exchange for stability."
    },
    {
        sentence: "Money needed in the short term should be kept in ______ investments.",
        answer: "safe",
        explanation:
            "Short-term needs should avoid market risk and stay easily accessible."
    },
    {
        sentence: "Long-term investors can usually afford to take more ______.",
        answer: "risk",
        explanation:
            "Longer time horizons allow investors to recover from short-term losses."
    }
];

interface RiskHangmanProps {
    onXpChange: (delta: number) => void;
    onLevelComplete?: () => void;
}

export default function RiskHangman({ onXpChange, onLevelComplete }: RiskHangmanProps) {
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

    const currentRound = GAME_DATA[currentRoundIndex];
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
        const word = currentRound.answer.toLowerCase();
        return word.split('').every(letter => guessedLetters.has(letter));
    };

    // Check if game is lost
    useEffect(() => {
        if (gameStatus === 'playing' && remainingAttempts <= 0) {
            setGameStatus('lost');

            if (!hasAppliedPenalty) {
                onXpChange(-10);
                setHasAppliedPenalty(true);
            }
        }
    }, [remainingAttempts, gameStatus, hasAppliedPenalty, onXpChange]);

    // Check if game is won
    useEffect(() => {
        if (gameStatus === 'playing' && isWordComplete()) {
            setGameStatus('won');
            setShowSuccess(true);
            setFeedback('Correct!');

            if (!hasAwardedCompletion) {
                onXpChange(20);
                setHasAwardedCompletion(true);
            }

            // Mark level as complete when last round is finished
            if (currentRoundIndex === GAME_DATA.length - 1 && onLevelComplete) {
                onLevelComplete();
            }

            setTimeout(() => {
                setShowExplanation(true);
            }, 1000);
        }
    }, [guessedLetters, gameStatus, hasAwardedCompletion, onXpChange, currentRoundIndex, onLevelComplete]); // Removed isWordComplete from connection to avoid loop, it's a function

    const handleGuess = useCallback((letter: string) => {
        const normalizedLetter = letter.toLowerCase();

        if (!/^[a-z]$/.test(normalizedLetter)) {
            return;
        }

        if (gameStatus !== 'playing' || showExplanation) {
            return;
        }

        if (guessedLetters.has(normalizedLetter)) {
            return;
        }

        setGuessedLetters(prev => {
            const newGuessed = new Set(prev);
            newGuessed.add(normalizedLetter);
            return newGuessed;
        });

        if (currentRound.answer.toLowerCase().includes(normalizedLetter)) {
            onXpChange(5);
            setFeedback('Correct!');
            setTimeout(() => setFeedback(''), 1000);
        } else {
            onXpChange(-2);
            setIncorrectGuesses(prev => prev + 1);
            setFeedback('Try again');
            setTimeout(() => setFeedback(''), 1000);
        }
    }, [gameStatus, guessedLetters, currentRound, onXpChange, showExplanation]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (gameStatus !== 'playing' || showExplanation) {
                return;
            }

            const key = event.key;
            const lowerKey = key.toLowerCase();

            if (/^[a-z]$/.test(lowerKey)) {
                event.preventDefault();
                handleGuess(lowerKey);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameStatus, showExplanation, handleGuess]);

    const handleShowResult = () => {
        setShowResult(true);
        setFeedback(`Correct answer: ${currentRound.answer}`);
        setShowExplanation(true);
    };

    const handleRetry = () => {
        setGuessedLetters(new Set());
        setIncorrectGuesses(0);
        setGameStatus('playing');
        setFeedback('');
        setHasAppliedPenalty(false);
        setShowResult(false);
        setShowExplanation(false);
    };

    const handleContinue = () => {
        if (currentRoundIndex < GAME_DATA.length - 1) {
            setCurrentRoundIndex(prev => prev + 1);
        }
    };

    const getDisplayWord = () => {
        return currentRound.answer
            .toLowerCase()
            .split('')
            .map(letter => guessedLetters.has(letter) ? letter : '_')
            .join(' ');
    };

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    const renderSentence = () => {
        const sentence = currentRound.sentence;
        // Replace all underscores with the display word
        const parts = sentence.split('______');

        return (
            <p className="text-lg md:text-xl mb-6 text-center leading-relaxed">
                {parts.map((part, index) => {
                    if (index === parts.length - 1) {
                        return <span key={index}>{part}</span>;
                    }

                    return (
                        <span key={index}>
                            {part}
                            <span className="font-mono font-bold text-2xl md:text-3xl text-yellow-300 tracking-wider mx-2">
                                {getDisplayWord()}
                            </span>
                        </span>
                    );
                })}
            </p>
        );
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Risk vs Return Hangman</h1>
                    <p className="text-gray-300">
                        Round {currentRoundIndex + 1} of {GAME_DATA.length}
                    </p>
                </div>

                <div className="mb-6">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${((currentRoundIndex + 1) / GAME_DATA.length) * 100}%` }}
                        />
                    </div>
                </div>

                <HangmanFigure incorrectAttempts={incorrectGuesses} />

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

                <div className="bg-gray-800/50 rounded-lg p-6 md:p-8 mb-8 border border-gray-700">
                    {renderSentence()}
                </div>

                {showExplanation && (
                    <div className={`mb-8 p-6 md:p-8 rounded-lg border-2 ${gameStatus === 'won'
                            ? 'bg-green-900/50 border-green-500'
                            : 'bg-red-900/50 border-red-500'
                        }`}>
                        <div className="text-center mb-4">
                            <h3 className={`text-2xl font-bold mb-2 ${gameStatus === 'won' ? 'text-green-300' : 'text-red-300'
                                }`}>
                                {gameStatus === 'won' ? '✓ Correct!' : '✗ Incorrect'}
                            </h3>
                            <p className="text-lg text-gray-300 font-semibold">
                                Correct answer: <span className="text-yellow-300 font-bold">{currentRound.answer}</span>
                            </p>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700">
                            <h4 className="text-lg font-semibold text-blue-300 mb-3">💡 Insight:</h4>
                            <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                                {currentRound.explanation}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            {gameStatus === 'lost' && (
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors mr-4"
                                >
                                    Try Again
                                </button>
                            )}
                            {currentRoundIndex < GAME_DATA.length - 1 ? (
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
                                        Play Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-center">
                        Guess a letter:
                        <span className="text-sm text-gray-400 font-normal ml-2">(Click or type on keyboard)</span>
                    </h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {alphabet.map(letter => {
                            const isGuessed = guessedLetters.has(letter);
                            const isCorrect = currentRound.answer.toLowerCase().includes(letter);
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

                {currentRoundIndex === GAME_DATA.length - 1 && gameStatus === 'won' && (
                    <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500">
                        <p className="text-2xl font-bold text-green-300 mb-2">🎉 Congratulations!</p>
                        <p className="text-lg text-gray-200">You've completed all levels of Risk vs Return Hangman!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
