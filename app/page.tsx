"use client";

import React, { useState, useEffect } from 'react';
import TestRunner from '../components/TestRunner';
import test1Data from '../data/Test1.json';
import test2Data from '../data/Test2.json';
import test3Data from '../data/Test3.json';
import test4Data from '../data/Test4.json';
import test5Data from '../data/Test5.json';
import test6Data from '../data/Test6.json';
import test7Data from '../data/Test7.json';
import test8Data from '../data/Test8.json';
import test9Data from '../data/Test9.json';

// Define available tests metadata
const TESTS = [
  {
    id: 'test1',
    title: 'Practice Test 1',
    description: 'Topics: Insurance Claim, Catering Menu, Coffee History, Scooters Debate.',
    data: test1Data
  },
  {
    id: 'test2',
    title: 'Practice Test 2',
    description: 'Topics: Office Credit, Rail Passes, Telegraph Cable, Right to Repair.',
    data: test2Data
  },
  {
    id: 'test3',
    title: 'Practice Test 3',
    description: 'Topics: Invoice Dispute, Health Benefits, Hudson Bay Co, Solar Geoengineering.',
    data: test3Data
  },
  {
    id: 'test4',
    title: 'Practice Test 4',
    description: 'Topics: Gazebo Dispute, Hall Booking, Silk Road, Humanities Debate.',
    data: test4Data
  },
  {
    id: 'test5',
    title: 'Practice Test 5',
    description: 'Topics: Tenant Repair, Coworking Membership, Rosetta Stone, Green Gentrification.',
    data: test5Data
  },
  {
    id: 'test6',
    title: 'Practice Test 6',
    description: 'Topics: Ergonomic Assessment, Solaris Music Festival, Panama Canal, AI in Hiring.',
    data: test6Data
  },
  {
    id: 'test7',
    title: 'Practice Test 7',
    description: 'Topics: IT Asset Return, Pet Boarding, London Underground, Gig Economy.',
    data: test7Data
  },
  {
    id: 'test8',
    title: 'Practice Test 8',
    description: 'Topics: Billing Error, Course Selection, Antibiotics History, Universal Basic Income.',
    data: test8Data
  },
  {
    id: 'test9',
    title: 'Practice Test 9',
    description: 'Topics: Unexcused Absence, Downtown Rentals, Printing Press History, Space Privatization.',
    data: test9Data
  }
];

export default function Home() {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load scores from localStorage
    const newScores: Record<string, string> = {};
    TESTS.forEach(test => {
      const score = localStorage.getItem(`celpip_score_${test.id}`);
      if (score) {
        newScores[test.id] = score;
      }
    });
    setScores(newScores);
  }, [selectedTestId]); // Reload scores when returning to dashboard

  const selectedTest = TESTS.find(t => t.id === selectedTestId);
  // Ensure data matches the expected type (array of parts)
  const activeTestData = selectedTest ? (selectedTest.data as any[]) : [];

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-900">

      {/* HEADER for Dashboard */}
      {!selectedTest && (
        <header className="bg-blue-900 text-white py-8 px-4 md:px-8 shadow-lg">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-2">CELPIP Simulator</h1>
            <p className="text-blue-200">Select a practice test to begin improving your reading skills.</p>
          </div>
        </header>
      )}

      {/* DASHBOARD VIEW */}
      {!selectedTest && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTS.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col group"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {test.title}
                    </h2>
                    {/* Last Score Display */}
                    {scores[test.id] && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Last Score</div>
                        <div className="text-lg font-bold text-blue-600">{scores[test.id]}</div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {test.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      4 Parts
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      ~38-40 Minutes
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedTestId(test.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow transition-transform active:scale-[0.98]"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-400 text-sm">
            More practice tests coming soon.
          </div>

          <div className="mt-16 border-t border-gray-200 pt-8 text-center text-gray-500 font-medium">
            Made by Ganesh with ❤️ for Ish
          </div>
        </div>
      )}

      {/* TEST RUNNER VIEW */}
      {selectedTest && (
        <div className="relative">
          {/* Allow user to go back to dashboard (WARNING: State will be lost, which is expected behavior for 'Quitting') */}
          <div className="absolute top-0 left-0 w-full h-[64px] pointer-events-none z-20 max-w-[200px]">
            {/* We place a transparent overlay or just hack the position.
                   Actually, better to inject a "Back" button into TestRunner or just rely on Browser Back?
                   Browser Back won't work nicely with SPA.
                   Let's add a small 'Exit' button overlay in the top left or just render a simple button here if z-index allows.
               */}
          </div>

          <TestRunner
            key={selectedTestId} // Force remount when test changes
            testData={activeTestData}
            testId={selectedTestId!}
          />

          {/* Temporary Floating Exit Button (only for convenience, TestRunner header covers top) */}
          <button
            onClick={() => {
              if (confirm("Exit this test? Your progress will be lost.")) {
                setSelectedTestId(null);
              }
            }}
            className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg opacity-50 hover:opacity-100 transition-opacity"
          >
            ← Back to Dashboard
          </button>
        </div>
      )}
    </main>
  );
}
