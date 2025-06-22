"use client";

import { SpeechRecognitionInput } from "@/components/SpeechRecognitionInput";
import { useState } from "react";
import { RiRobot2Line, RiUserLine } from "react-icons/ri";

export default function Home() {
  const [history, setHistory] = useState<string[]>([]);

  const handleUserInput = (input: string) => {
    setHistory((prev) => [...prev, input]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="flex gap-4">
        <div className="w-40 h-40 border-2 border-gray-400 rounded-lg flex items-center justify-center">
          <RiRobot2Line className="w-16 h-16 text-gray-600" />
        </div>
        <div className="w-40 h-40 border-2 border-gray-400 rounded-lg flex items-center justify-center">
          <RiUserLine className="w-16 h-16 text-gray-600" />
        </div>
      </div>
      <SpeechRecognitionInput onResult={handleUserInput} />
    </main>
  );
}
