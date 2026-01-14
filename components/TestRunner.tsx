"use client";

import React, { useState, useEffect } from 'react';
import SplitPane from './SplitPane';
import ReadingMaterial from './ReadingMaterial';
import QuestionForm from './QuestionForm';

interface TestRunnerProps {
    testData: any[]; // Array of parts
    testId: string;
}

export default function TestRunner({ testData, testId }: TestRunnerProps) {
    // State
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isScoreOverlayVisible, setIsScoreOverlayVisible] = useState(false);
    // Track the FURTHEST part reached to enforce locking of previous parts
    const [maxPartReached, setMaxPartReached] = useState(0);
    // Store remaining time for each part: { [partIndex]: seconds }
    const [remainingTimes, setRemainingTimes] = useState<Record<number, number>>({});

    const currentPart = testData[currentPartIndex];
    const isLastPart = currentPartIndex === testData.length - 1;
    const isReviewMode = isSubmitted && !isScoreOverlayVisible;

    // READ-ONLY LOGIC:
    // Read-only if submitted OR if viewing a previous part (one index less than maxPartReached)
    // Actually, strict logic: if index < maxPartReached, it's locked.
    const isReadOnly = isSubmitted || currentPartIndex < maxPartReached;


    // Initialize Timer logic
    // We NO LONGER reset timer purely on index change in a simple Effect, because we want to load SAVED time.
    useEffect(() => {
        // Initial load for the very first part if not set
        if (currentPartIndex === 0 && timeLeft === 0 && !remainingTimes[0]) {
            setTimeLeft(testData[0].timer_seconds);
        }
    }, []);

    // Helper to switch parts safely
    const switchToPart = (newIndex: number) => {
        // 1. Save current time
        const newRemainingTimes = { ...remainingTimes, [currentPartIndex]: timeLeft };
        setRemainingTimes(newRemainingTimes);

        // 2. Load next time
        let nextTime = 0;
        if (typeof newRemainingTimes[newIndex] === 'number') {
            nextTime = newRemainingTimes[newIndex];
        } else {
            // First time entering this part
            nextTime = testData[newIndex].timer_seconds;
        }

        setTimeLeft(nextTime);
        setCurrentPartIndex(newIndex);
        window.scrollTo(0, 0);
    };


    // Timer Countdown Logic
    useEffect(() => {
        if (isSubmitted) return;
        // Strict Locked check: If we are looking at a previous locked part, typically we might NOT run the timer?
        // OR we run it but it doesn't matter?
        // User said: "once move to the next section, we can stop the timer for the prev section"
        // If isReadOnly is true, we technically shouldn't be ticking the timer for THAT part.
        // However, if we are reviewing, maybe hide it?

        if (isReadOnly && timeLeft > 0) {
            // Optional: Pause timer for ReadOnly parts? 
            // Let's just Return to stop ticking.
            return;
        }

        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newVal = prev - 1;

                // --- AUTO ADVANCE ON TIMEOUT ---
                if (newVal < 0) {
                    clearInterval(timer);

                    // Logic to move next automatically
                    if (isLastPart) {
                        // Finish Test
                        setIsSubmitted(true);
                        setIsScoreOverlayVisible(true);
                    } else {
                        // Move to next part & LOCK current one
                        // Only if we are currently looking at the latest part (which we should be if timer is running)
                        if (currentPartIndex === maxPartReached) {
                            // Save current time as 0
                            setRemainingTimes(prevTimes => ({ ...prevTimes, [currentPartIndex]: 0 }));

                            setMaxPartReached(p => p + 1);

                            // Switch to next part
                            const nextIndex = currentPartIndex + 1;

                            // Determine next time (likely full duration)
                            let nextTime = testData[nextIndex].timer_seconds;
                            // (Edge case: if we somehow visited it before? Unlikely in strict mode.)

                            setTimeLeft(nextTime);
                            setCurrentPartIndex(nextIndex);
                            window.scrollTo(0, 0);
                        }
                    }
                    return 0;
                }
                return newVal;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, isLastPart, currentPartIndex, maxPartReached, isReadOnly, testData, remainingTimes]);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (id: string, value: string) => {
        // Namespace the answer key with the current part ID to avoid overlaps 
        const namespacedId = `${currentPart.part_id}_${id}`;
        setUserAnswers(prev => ({ ...prev, [namespacedId]: value }));
    };

    const handleNext = () => {
        // If we are reviewing previous parts (read-only), just let them go forward freely until they hit the "wall"
        if (currentPartIndex < maxPartReached) {
            switchToPart(currentPartIndex + 1);
            return;
        }

        // We are on the furthest reaching part.
        // Advancing means LOCKING this part.

        if (isLastPart) {
            if (confirm("Are you sure you want to FINISH the test and see your score? You cannot change answers after this.")) {
                setIsSubmitted(true);
                setIsScoreOverlayVisible(true);
            }
            return;
        }

        if (confirm("You are about to move to the next section. You will NOT be able to return to change your answers in this section. Do you want to proceed?")) {
            setMaxPartReached(prev => prev + 1);
            switchToPart(currentPartIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPartIndex > 0) {
            switchToPart(currentPartIndex - 1);
        }
    };

    // Calculate Global Score
    const calculateScore = () => {
        let score = 0;
        let total = 0;

        testData.forEach(part => {
            // Normalize sections: check if array or object
            const sectionsData = part.right_panel_data.sections || part.right_panel_data;
            const sectionsArray = Array.isArray(sectionsData)
                ? sectionsData
                : Object.values(sectionsData);

            sectionsArray.forEach((section: any) => {
                // For MC & Matching
                if (section.questions) {
                    section.questions.forEach((q: any) => {
                        total++;
                        const namespacedId = `${part.part_id}_${q.id}`;
                        const answer = userAnswers[namespacedId];

                        // Check correct_index for MC
                        if (typeof q.correct_index === 'number') {
                            if (answer === q.options[q.correct_index]) {
                                score++;
                            }
                        }
                        // Check correct_value (string)
                        else if (answer === q.correct_value) {
                            score++;
                        }
                    });
                }
                // For Fill in Blank
                if (section.content_blocks) {
                    section.content_blocks.forEach((block: any) => {
                        if (block.type === 'dropdown') {
                            total++;
                            const namespacedId = `${part.part_id}_${block.id}`;
                            if (userAnswers[namespacedId] === block.correct_value) {
                                score++;
                            }
                        }
                    });
                }
            });
        });

        return { score, total };
    };

    const { score, total } = isSubmitted ? calculateScore() : { score: 0, total: 0 };

    // SAVE SCORE EFFECT
    useEffect(() => {
        if (isSubmitted) {
            localStorage.setItem(`celpip_score_${testId}`, `${score}/${total}`);
        }
    }, [isSubmitted, score, total, testId]);

    // Prepare normalized sections for Child Component
    const currentSectionsData = currentPart.right_panel_data.sections || currentPart.right_panel_data;
    const normalizedSections = Array.isArray(currentSectionsData)
        ? currentSectionsData
        : Object.values(currentSectionsData);

    const currentPartAnswers: Record<string, string> = {};
    Object.keys(userAnswers).forEach(key => {
        if (key.startsWith(`${currentPart.part_id}_`)) {
            const cleanId = key.replace(`${currentPart.part_id}_`, '');
            currentPartAnswers[cleanId] = userAnswers[key];
        }
    });

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
            <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-4 md:px-8 shadow-md z-10 sticky top-0">
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold tracking-wide">
                        Practice Test - {currentPart.title}
                    </h1>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>Part {currentPartIndex + 1} of {testData.length}</span>
                        {isSubmitted && <span className="bg-green-600 text-white px-1 rounded text-[10px] uppercase font-bold tracking-wider">Review Mode</span>}
                        {/* Show Read Only badge if strictly read only but NOT submitted yet (e.g. moved past it) */}
                        {!isSubmitted && isReadOnly && <span className="bg-yellow-600 text-white px-1 rounded text-[10px] uppercase font-bold tracking-wider">Read Only</span>}
                    </div>
                </div>

                <div className="flex items-center space-x-4 md:space-x-6">
                    {!isSubmitted && (
                        <div className={`hidden md:block text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                            Time Remaining: {formatTime(timeLeft)}
                        </div>
                    )}

                    {/* Previous Button */}
                    {currentPartIndex > 0 && (
                        <button
                            onClick={handlePrevious}
                            className="text-gray-300 hover:text-white text-sm font-medium uppercase tracking-wider"
                        >
                            &lt; Prev Part
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded shadow transition-transform active:scale-95 font-medium uppercase text-sm tracking-wider"
                    >
                        {isLastPart ? (isSubmitted ? 'Finish Review' : 'Finish Test') : 'Next Part >'}
                    </button>
                </div>
            </header>

            {/* Main Split Content */}
            <div className="flex-grow flex flex-col relative">
                <SplitPane
                    left={
                        <ReadingMaterial
                            title={currentPart.left_panel_data.title}
                            data={currentPart.left_panel_data}
                        />
                    }
                    right={
                        <QuestionForm
                            sections={normalizedSections}
                            userAnswers={currentPartAnswers}
                            isSubmitted={isSubmitted}
                            isReadOnly={isReadOnly}
                            onAnswerChange={handleAnswerChange}
                        />
                    }
                />

                {/* Score Overlay */}
                {isScoreOverlayVisible && (
                    <div className="fixed inset-0 bg-gray-900/95 text-white flex flex-col justify-center items-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
                        <h2 className="text-4xl font-bold mb-4">Test Completed!</h2>
                        <div className="text-6xl font-black mb-8">
                            <span className="text-green-400">{score}</span> / {total}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsScoreOverlayVisible(false)}
                                className="px-6 py-3 border border-white/20 rounded hover:bg-white/10 font-medium"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 font-bold"
                            >
                                Take Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
