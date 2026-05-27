"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface DescribeIssueProps {
  onIssueChange?: (text: string) => void;
}

const COMMON_ISSUES = [
  "Fan not working",
  "Switchboard problem",
  "Wall needs repainting",
  "Door is loose",
  "Paint touch-up needed",
  "Light flickering",
];

export default function DescribeIssue({ onIssueChange }: DescribeIssueProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported by browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowSpeech =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (windowSpeech) {
        const rec = new windowSpeech();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US"; // Change to "ne-NP" if you want to explicitly capture Nepali speech phonetics

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const updatedText =
            text + (text ? " " : "") + finalTranscript + interimTranscript;
          setText(updatedText);
          onIssueChange?.(updatedText);
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition error: ", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [text, onIssueChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported natively in this browser version. Please type into the text field directly!",
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleTagClick = (issue: string) => {
    const freshText = text ? `${text.trim()}, ${issue.toLowerCase()}` : issue;
    setText(freshText);
    onIssueChange?.(freshText);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-4xl w-full shadow-sm select-none">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
          Describe Your Issue
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Use voice or type to explain what you need
        </p>
      </div>

      {/* Main Textarea Area Canvas */}
      <div className="relative border border-gray-200/80 rounded-2xl p-4 bg-slate-50/50 mb-4 focus-within:border-blue-300 transition-colors">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onIssueChange?.(e.target.value);
          }}
          placeholder="Describe your issue in detail... e.g., 'The ceiling fan in my bedroom has stopped working. It was making noise before it stopped.'"
          className="w-full min-h-[110px] bg-transparent text-sm text-gray-700 placeholder-gray-400/90 outline-none resize-none border-0 p-0 focus:ring-0 leading-relaxed"
        />

        {/* Dynamic Interactive Microphone Action Trigger Button */}
        <button
          onClick={toggleListening}
          className={`absolute bottom-4 right-4 p-3 rounded-full shadow-md transition-all duration-200 scale-100 active:scale-95 ${
            isListening
              ? "bg-red-100 text-red-500 animate-pulse"
              : "bg-[#1e3a8a] text-white hover:bg-blue-800"
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      </div>

      {/* Conditional Speech Listening Animation Bar Section */}
      {isListening && (
        <div className="flex items-center gap-3 border border-red-100 bg-red-50/60 rounded-xl px-4 py-3 mb-4 transition-all animate-fadeIn">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
          </div>
          <span className="text-xs font-semibold text-red-500 tracking-wide">
            Listening... Try speaking into your microphone system
          </span>
        </div>
      )}

      {/* Common Quick Tags Selection Element */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2.5">
          Common issues (click to add):
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_ISSUES.map((issue) => (
            <button
              key={issue}
              onClick={() => handleTagClick(issue)}
              className="text-xs font-medium px-3 py-2 bg-slate-50 border border-gray-200/80 rounded-lg text-gray-700 hover:bg-slate-100/80 active:scale-[0.98] transition-all"
            >
              {issue}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
