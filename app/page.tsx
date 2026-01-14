import React from 'react';
import TestRunner from '../components/TestRunner';
import testData from '../data/full_test.json';

export default function Home() {
  return (
    <main>
      <TestRunner testData={testData} />
    </main>
  );
}
