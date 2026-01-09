"use client";

import { useState, useEffect } from "react";

// Expense option interface
interface ExpenseOption {
  id: string;
  label: string;
  amount: number;
  correctAmount?: number; // For options that have different correct amounts
}

// Game state type
type GameState = "playing" | "overBudget" | "correct" | "wrong";

// Expense options with their amounts
const EXPENSE_OPTIONS: ExpenseOption[] = [
  { id: "rent", label: "House Rent", amount: 16000 },
  { id: "groceries", label: "Groceries & Essentials", amount: 8000 },
  { id: "transport", label: "Transport", amount: 3000 },
  { id: "mobile", label: "Mobile + Internet", amount: 1500 },
  { id: "subscriptions", label: "Subscriptions (OTT, Music, etc.)", amount: 2500 },
  { id: "eatingOut", label: "Eating Out & Shopping", amount: 5000 },
  { id: "entertainment", label: "Weekend Entertainment", amount: 3500 },
  { id: "savings", label: "Savings for House", amount: 12000 },
  { id: "investments", label: "Long-Term Investments", amount: 1500 }, // Correct amount is 4500, not 9000
];

// Correct budget selection (IDs that should be selected)
const CORRECT_SELECTION: Set<string> = new Set([
  "rent",
  "groceries",
  "transport",
  "mobile",
  "savings", 
]);

// Monthly income
const MONTHLY_INCOME = 50000;

// Correct total (should be 45000)
const CORRECT_TOTAL = 40500;

// Explanation text
const EXPLANATION_TEXT = `The correct budget is appropriate because it covers all essential fixed expenses first, such as rent, groceries, transport, and internet, ensuring basic needs are met without compromise. It then prioritizes long-term financial goals by allocating a significant portion of income toward savings and investments for building a house, which directly aligns with the stated goal. Non-essential and variable lifestyle expenses like subscriptions, shopping, and entertainment are either reduced or excluded, preventing unnecessary spending. Finally, keeping the total at ₹45,000 instead of using the entire ₹50,000 creates a safety buffer for unexpected expenses, which is a key principle of realistic and responsible budgeting.`;

export default function FixTheBudget() {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [totalAmount, setTotalAmount] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showExplanation, setShowExplanation] = useState(false);

  // Calculate total amount based on selected options
  useEffect(() => {
    let total = 0;
    selectedOptions.forEach((id) => {
      const option = EXPENSE_OPTIONS.find((opt) => opt.id === id);
      if (option) {
        // Use correctAmount if available (for investments), otherwise use regular amount
        total += option.correctAmount ?? option.amount;
      }
    });
    setTotalAmount(total);

    // Check if over budget
    if (total > MONTHLY_INCOME && gameState === "playing") {
      setGameState("overBudget");
      return;
    }
  },[selectedOptions]);
  
  // Validate selection when player clicks "Check My Budget"
  const validateSelection = () => {
    if (gameState !== "playing" || totalAmount > MONTHLY_INCOME) return;

    // Check if selection matches correct combination
    const isCorrectSelection =
      selectedOptions.size === CORRECT_SELECTION.size &&
      Array.from(selectedOptions).every((id) => CORRECT_SELECTION.has(id)) &&
      totalAmount === CORRECT_TOTAL;

    if (isCorrectSelection) {
      setGameState("correct");
    } else {
      // Within budget but wrong selection
      setGameState("wrong");
      setShowExplanation(true);
    }
  };

  // Handle option toggle
  const handleToggleOption = (id: string) => {
    if (gameState === "overBudget" || gameState === "correct") {
      return; // Disable selections when over budget or correct
    }

    setSelectedOptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle try again
  const handleTryAgain = () => {
    setSelectedOptions(new Set());
    setTotalAmount(0);
    setGameState("playing");
    setShowExplanation(false);
  };

  // Handle show answer
  const handleShowAnswer = () => {
    setSelectedOptions(CORRECT_SELECTION);
    setGameState("wrong");
    setShowExplanation(true);
  };

  // Get amount for display (uses correctAmount if option is selected and has one)
  const getDisplayAmount = (option: ExpenseOption): number => option.amount;

  // Check if current selection is correct
  const isSelectionCorrect = (): boolean => {
    return (
      selectedOptions.size === CORRECT_SELECTION.size &&
      Array.from(selectedOptions).every((id) => CORRECT_SELECTION.has(id)) &&
      totalAmount === CORRECT_TOTAL
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Fix The Budget</h1>
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <p className="text-lg md:text-xl text-slate-200 mb-2">
              You earn <span className="font-bold text-emerald-400">₹{MONTHLY_INCOME.toLocaleString()}</span> per month.
            </p>
            <p className="text-lg md:text-xl text-slate-200">
              Your long-term goal is to <span className="font-bold text-blue-400">build a house</span>.
            </p>
            <p className="text-base md:text-lg text-slate-300 mt-4">
              Select the expenses you will include in your budget.
            </p>
          </div>
        </div>

        {/* Income and Total Display */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-emerald-400">
                ₹{MONTHLY_INCOME.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Selected Total</p>
              <p
                className={`text-2xl font-bold ${
                  totalAmount > MONTHLY_INCOME
                    ? "text-red-400"
                    : totalAmount === CORRECT_TOTAL && isSelectionCorrect()
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                ₹{totalAmount.toLocaleString()}
              </p>
              {totalAmount > MONTHLY_INCOME && (
                <p className="text-sm text-red-400 mt-1 font-semibold">Over Budget!</p>
              )}
            </div>
          </div>
        </div>

        {/* Expense Options */}
        <div className="space-y-3 mb-8">
          {EXPENSE_OPTIONS.map((option) => {
            const isSelected = selectedOptions.has(option.id);
            const displayAmount = getDisplayAmount(option);
            const isDisabled = gameState === "overBudget" || gameState === "correct";

            return (
              <button
                key={option.id}
                onClick={() => handleToggleOption(option.id)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-blue-600/30 border-blue-400 shadow-lg"
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                } ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:scale-[1.02]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-medium ${isSelected ? "text-blue-200" : "text-slate-200"}`}>
                    {option.label}
                  </span>
                  <span className={`text-xl font-bold ${isSelected ? "text-blue-300" : "text-slate-400"}`}>
                    ₹{displayAmount.toLocaleString()}
                  </span>
                </div>
                {isSelected && option.correctAmount !== undefined && option.correctAmount !== option.amount && (
                  <p className="text-xs text-blue-300/80 mt-1">
                    (Adjusted to ₹{option.correctAmount.toLocaleString()} in correct budget)
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Game State Messages */}
        {gameState === "overBudget" && (
          <div className="bg-red-900/50 rounded-lg p-6 mb-6 border-2 border-red-500">
            <h3 className="text-2xl font-bold text-red-300 mb-4 text-center">⚠️ Over Budget</h3>
            <p className="text-lg text-red-200 mb-6 text-center">
              Your total expenses exceed your monthly income. Please adjust your budget.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={handleTryAgain}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleShowAnswer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                Show Correct Budget & Explanation
              </button>
            </div>
          </div>
        )}

        {gameState === "correct" && (
          <div className="bg-green-900/50 rounded-lg p-6 mb-6 border-2 border-green-500">
            <h3 className="text-2xl font-bold text-green-300 mb-4 text-center">✓ Correct!</h3>
            <p className="text-lg text-green-200 mb-4 text-center leading-relaxed">
              You planned your expenses, prioritized your goal, and kept a safety buffer.
              <br />
              This is realistic budgeting.
            </p>
            <div className="bg-green-800/30 rounded-lg p-4 mt-4 mb-4">
              <p className="text-sm text-green-200">
                <span className="font-semibold">Total:</span> ₹{totalAmount.toLocaleString()} (₹
                {(MONTHLY_INCOME - totalAmount).toLocaleString()} safety buffer)
              </p>
            </div>
            {!showExplanation && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowExplanation(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  View Explanation
                </button>
              </div>
            )}
          </div>
        )}

        {gameState === "wrong" && (
          <div className="bg-yellow-900/50 rounded-lg p-6 mb-6 border-2 border-yellow-500">
            <h3 className="text-2xl font-bold text-yellow-300 mb-4 text-center">
              Wrong Options Selected
            </h3>
            <p className="text-lg text-yellow-200 mb-4 text-center">
              Your budget is within limits, but the selection is not optimal.
            </p>
          </div>
        )}

        {/* Explanation Card */}
        {showExplanation && (
          <div className="bg-slate-800/80 rounded-lg p-6 md:p-8 mb-6 border-2 border-blue-500">
            <h3 className="text-2xl font-bold text-blue-300 mb-4">📚 Correct Budget Explanation</h3>
            
            {/* Show correct budget breakdown */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
              <h4 className="text-lg font-semibold text-blue-200 mb-3">Correct Budget Breakdown:</h4>
              <div className="space-y-2">
                {EXPENSE_OPTIONS.filter((opt) => CORRECT_SELECTION.has(opt.id)).map((option) => {
                  const amount = option.correctAmount ?? option.amount;
                  return (
                    <div key={option.id} className="flex justify-between text-slate-200">
                      <span>{option.label}:</span>
                      <span className="font-semibold">₹{amount.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between text-lg font-bold text-green-300">
                  <span>Total:</span>
                  <span>₹{CORRECT_TOTAL.toLocaleString()}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Safety Buffer: ₹{(MONTHLY_INCOME - CORRECT_TOTAL).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Explanation text */}
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
              <h4 className="text-lg font-semibold text-blue-200 mb-3">Why This Budget Works:</h4>
              <p className="text-base md:text-lg text-slate-200 leading-relaxed whitespace-pre-line">
                {EXPLANATION_TEXT}
              </p>
            </div>

            {/* Acknowledge button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowExplanation(false);
                  if (gameState === "wrong") {
                    // If showing explanation after wrong selection, allow them to try again
                    handleTryAgain();
                  }
                }}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
              >
                {gameState === "wrong" ? "Try Again" : "Close"}
              </button>
            </div>
          </div>
        )}

        {/* Validation button (only show when playing and not over budget) */}
        {gameState === "playing" && totalAmount <= MONTHLY_INCOME && totalAmount > 0 && (
          <div className="flex justify-center">
            <button
              onClick={validateSelection}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Check My Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}