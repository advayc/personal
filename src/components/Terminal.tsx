import React, { useState } from "react";
import Draggable from "react-draggable";

const Terminal = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: "Tab 1", content: "Lorem ipsum dolor sit amet..." },
    { id: 1, title: "Tab 2", content: "Consectetur adipiscing elit..." },
    { id: 2, title: "Tab 3", content: "Sed do eiusmod tempor incididunt..." },
  ];

  return (
    <Draggable>
      <div className="w-[450px] bg-gray-800 border border-gray-600 text-white rounded-sm shadow-lg p-2 fixed top-16 left-16 z-50">
        <div className="flex justify-between items-center mb-2 bg-gray-700 text-white px-2 py-1 border-b border-gray-600">
          <div className="flex space-x-2">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-red-600 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <div className="font-bold">Windows Terminal</div>
          </div>
          <button className="text-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="bg-gray-700 border border-gray-600 p-2">
          <ul className="flex space-x-2 mb-2 text-gray-300">
            {tabs.map((tab) => (
              <li
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer px-2 py-1 rounded-sm border ${
                  activeTab === tab.id
                    ? "bg-gray-600 border-gray-500 text-white"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                {tab.title}
              </li>
            ))}
          </ul>
          <div className="h-40 overflow-y-auto bg-gray-800 border border-gray-600 p-2 text-sm font-mono">
            {tabs[activeTab].content}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default Terminal;
