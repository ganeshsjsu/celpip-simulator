"use client";

import React from 'react';

// --- Types ---
// --- Types ---
interface BaseQuestion {
    id: string;
    prompt?: string;
    options: string[];
    correct_value?: string;
    correct_index?: number;
    explanation?: string;
}

interface ContentBlock {
    type: 'text' | 'dropdown';
    value?: string;
    id?: string;
    options?: string[];
    correct_value?: string;
    explanation?: string;
}

interface Section {
    type: 'multiple_choice' | 'fill_in_the_blank' | 'matching';
    instructions: string;
    questions?: BaseQuestion[]; // For MC and Matching
    content_blocks?: ContentBlock[]; // For Fill-in-the-blank
}

interface QuestionFormProps {
    sections: Section[];
    userAnswers: Record<string, string>;
    isSubmitted: boolean;
    isReadOnly?: boolean; // New prop
    onAnswerChange: (id: string, value: string) => void;
}

// --- Sub-Components ---

// 1. Multiple Choice Renderer
const MultipleChoiceSection = ({ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }: any) => {
    return (
        <div className="space-y-6">
            {section.questions.map((q: any) => {
                const userAnswer = userAnswers[q.id];

                let isCorrect = false;
                let correctVal = q.correct_value;
                if (typeof q.correct_index === 'number') {
                    correctVal = q.options[q.correct_index];
                }

                if (isSubmitted) {
                    isCorrect = userAnswer === correctVal;
                }

                const isWrong = isSubmitted && !isCorrect;

                return (
                    <div key={q.id} className="bg-gray-50 p-4 rounded border border-gray-100">
                        <p className="font-medium text-gray-800 mb-3">{q.prompt}</p>
                        <div className="space-y-2">
                            {q.options.map((opt: string) => (
                                <label key={opt} className={`flex items-center space-x-3 ${isSubmitted || isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                                    <input
                                        type="radio"
                                        name={q.id}
                                        value={opt}
                                        checked={userAnswer === opt}
                                        onChange={() => onAnswerChange(q.id, opt)}
                                        disabled={isSubmitted || isReadOnly}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:text-gray-400"
                                    />
                                    <span className="text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>

                        {/* Feedback */}
                        {isSubmitted && (
                            <div className="mt-2 text-sm">
                                {isCorrect && <span className="text-green-600 font-bold">✓ Correct</span>}
                                {isWrong && (
                                    <div className="text-red-700">
                                        <span className="font-bold">✗ Incorrect.</span>
                                        <p className="text-gray-600 mt-1">
                                            Answer: {correctVal}
                                        </p>
                                        <p className="italic mt-1 text-gray-500">{q.explanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Helper to parse simple markdown like **bold** to <strong>bold</strong>
const parseMarkdown = (text: string) => {
    if (!text) return '';
    // Replace **text** with <strong>text</strong>
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace newlines with <br/> for good measure if they exist in text blocks
    html = html.replace(/\n/g, '<br/>');
    return html;
};

// 2. Fill-in-the-Blank Renderer (Original Logic Adapted)
const FillBlankSection = ({ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }: any) => {
    return (
        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg leading-loose text-lg text-gray-800 font-serif">
            {section.content_blocks.map((item: ContentBlock, index: number) => {
                if (item.type === 'text') {
                    return (
                        <span
                            key={index}
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(item.value || '') }}
                        />
                    );
                }

                if (item.type === 'dropdown' && item.id && item.options) {
                    const userAnswer = userAnswers[item.id] || '';
                    const isCorrect = isSubmitted && userAnswer === item.correct_value;
                    const isWrong = isSubmitted && userAnswer !== item.correct_value;

                    return (
                        <span key={item.id} className="inline-block mx-1 relative group">
                            <select
                                value={userAnswer}
                                onChange={(e) => onAnswerChange(item.id, e.target.value)}
                                disabled={isSubmitted || isReadOnly}
                                className={`border-b-2 outline-none font-sans text-base py-1 px-2 transition-colors max-w-[200px]
                  ${!isSubmitted && !isReadOnly ? 'border-blue-400 hover:border-blue-600 bg-blue-50/50' : ''}
                  ${isReadOnly && !isSubmitted ? 'border-gray-300 bg-gray-100/50 text-gray-600' : ''}
                  ${isCorrect ? 'border-green-500 bg-green-50 text-green-800 font-bold' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50 text-red-800' : ''}
                `}
                            >
                                <option value="">Select...</option>
                                {item.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>

                            {/* Tooltip for Wrong Answers */}
                            {isWrong && (
                                <div className="absolute z-20 top-full left-0 mt-2 w-64 p-3 bg-white text-red-800 text-sm rounded shadow-xl border border-red-200 leading-normal hidden group-hover:block">
                                    <strong>Correct:</strong> {item.correct_value}
                                    <br />
                                    <span className="text-xs text-gray-600">{item.explanation}</span>
                                </div>
                            )}
                        </span>
                    );
                }
                return null;
            })}
        </div>
    );
};

// 3. Matching Renderer
const MatchingSection = ({ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }: any) => {
    return (
        <div className="space-y-4">
            {section.questions.map((q: BaseQuestion) => {
                const userAnswer = userAnswers[q.id] || '';

                // Determine correct answer string
                let correctVal = q.correct_value;
                if (typeof q.correct_index === 'number' && q.options) {
                    correctVal = q.options[q.correct_index];
                }

                const isCorrect = isSubmitted && userAnswer === correctVal;
                const isWrong = isSubmitted && !isCorrect;

                return (
                    <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 p-3 rounded border border-gray-100 relative group">
                        <div className="md:w-3/4 pr-4 text-gray-800 font-medium text-sm">
                            {q.prompt}
                        </div>
                        <div className="md:w-1/4 mt-2 md:mt-0 flex items-center">
                            <select
                                value={userAnswer}
                                onChange={(e) => onAnswerChange(q.id, e.target.value)}
                                disabled={isSubmitted || isReadOnly}
                                className={`w-full border rounded p-1 font-bold text-center
                            ${!isSubmitted && !isReadOnly ? 'border-gray-300' : ''}
                            ${isReadOnly && !isSubmitted ? 'border-gray-200 bg-gray-100 text-gray-500' : ''}
                            ${isCorrect ? 'border-green-500 bg-green-100 text-green-800' : ''}
                            ${isWrong ? 'border-red-500 bg-red-100 text-red-800' : ''}
                         `}
                            >
                                <option value="">-</option>
                                {q.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Feedback Tooltip */}
                        {isWrong && (
                            <div className="absolute z-20 right-0 top-full mt-1 w-48 p-2 bg-red-50 text-red-800 text-xs rounded shadow border border-red-200 hidden group-hover:block z-50">
                                <span className="font-bold">Correct:</span> {correctVal} <br /> {q.explanation}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// --- Main Component ---
export default function QuestionForm({
    sections,
    userAnswers,
    isSubmitted,
    isReadOnly = false,
    onAnswerChange
}: QuestionFormProps) {

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto pb-24"> {/* Extra padding bottom for scroll */}
            {sections.map((section, idx) => (
                <div key={idx} className="mb-8">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                        <p className="text-blue-800 font-medium text-sm">{section.instructions}</p>
                    </div>

                    {section.type === 'multiple_choice' && (
                        <MultipleChoiceSection {...{ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }} />
                    )}

                    {section.type === 'fill_in_the_blank' && (
                        <FillBlankSection {...{ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }} />
                    )}

                    {section.type === 'matching' && (
                        <MatchingSection {...{ section, userAnswers, isSubmitted, isReadOnly, onAnswerChange }} />
                    )}
                </div>
            ))}
        </div>
    );
}
