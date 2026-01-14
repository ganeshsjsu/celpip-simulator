import React from 'react';

interface SplitPaneProps {
    left: React.ReactNode;
    right: React.ReactNode;
}

export default function SplitPane({ left, right }: SplitPaneProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-140px)] bg-gray-100 overflow-hidden">
            {/* Left Panel - Reading Material */}
            <div className="overflow-y-auto border-r border-gray-300 bg-white shadow-inner">
                {left}
            </div>

            {/* Right Panel - Interaction */}
            <div className="overflow-y-auto bg-gray-50">
                {right}
            </div>
        </div>
    );
}
