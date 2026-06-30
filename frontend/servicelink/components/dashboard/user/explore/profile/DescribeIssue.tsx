// "use client";
//
// import { useState, useEffect, useRef } from "react";
// import { Mic, MicOff } from "lucide-react";
//
// interface DescribeIssueProps {
//   onIssueChange?: (text: string) => void;
// }
//
// const COMMON_ISSUES = [
//   "Fan not working",
//   "Switchboard problem",
//   "Wall needs repainting",
//   "Door is loose",
//   "Paint touch-up needed",
//   "Light flickering",
// ];
//
// export default function DescribeIssue({ onIssueChange }: DescribeIssueProps) {
//   const [text, setText] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const recognitionRef = useRef<any>(null);
//
//   // Initialize Web Speech API if supported by browser
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const windowSpeech =
//         (window as any).SpeechRecognition ||
//         (window as any).webkitSpeechRecognition;
//       if (windowSpeech) {
//         const rec = new windowSpeech();
//         rec.continuous = true;
//         rec.interimResults = true;
//         rec.lang = "en-US"; // Change to "ne-NP" if you want to explicitly capture Nepali speech phonetics
//
//         rec.onresult = (event: any) => {
//           let interimTranscript = "";
//           let finalTranscript = "";
//
//           for (let i = event.resultIndex; i < event.results.length; ++i) {
//             if (event.results[i].isFinal) {
//               finalTranscript += event.results[i][0].transcript;
//             } else {
//               interimTranscript += event.results[i][0].transcript;
//             }
//           }
//
//           const updatedText =
//             text + (text ? " " : "") + finalTranscript + interimTranscript;
//           setText(updatedText);
//           onIssueChange?.(updatedText);
//         };
//
//         rec.onerror = (e: any) => {
//           console.error("Speech Recognition error: ", e);
//           setIsListening(false);
//         };
//
//         rec.onend = () => {
//           setIsListening(false);
//         };
//
//         recognitionRef.current = rec;
//       }
//     }
//   }, [text, onIssueChange]);
//
//   const toggleListening = () => {
//     if (!recognitionRef.current) {
//       alert(
//         "Speech recognition is not supported natively in this browser version. Please type into the text field directly!",
//       );
//       return;
//     }
//
//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       setIsListening(true);
//       recognitionRef.current.start();
//     }
//   };
//
//   const handleTagClick = (issue: string) => {
//     const freshText = text ? `${text.trim()}, ${issue.toLowerCase()}` : issue;
//     setText(freshText);
//     onIssueChange?.(freshText);
//   };
//
//   return (
//     <div className="bg-white border border-gray-100 rounded-3xl p-6 max-w-4xl w-full shadow-sm select-none">
//       {/* Title */}
//       <div className="mb-4">
//         <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
//           Describe Your Issue
//         </h2>
//         <p className="text-sm text-gray-400 mt-0.5">
//           Use voice or type to explain what you need
//         </p>
//       </div>
//
//       {/* Main Textarea Area Canvas */}
//       <div className="relative border border-gray-200/80 rounded-2xl p-4 bg-slate-50/50 mb-4 focus-within:border-blue-300 transition-colors">
//         <textarea
//           value={text}
//           onChange={(e) => {
//             setText(e.target.value);
//             onIssueChange?.(e.target.value);
//           }}
//           placeholder="Describe your issue in detail... e.g., 'The ceiling fan in my bedroom has stopped working. It was making noise before it stopped.'"
//           className="w-full min-h-[110px] bg-transparent text-sm text-gray-700 placeholder-gray-400/90 outline-none resize-none border-0 p-0 focus:ring-0 leading-relaxed"
//         />
//
//         {/* Dynamic Interactive Microphone Action Trigger Button */}
//         <button
//           onClick={toggleListening}
//           className={`absolute bottom-4 right-4 p-3 rounded-full shadow-md transition-all duration-200 scale-100 active:scale-95 ${
//             isListening
//               ? "bg-red-100 text-red-500 animate-pulse"
//               : "bg-[#1e3a8a] text-white hover:bg-blue-800"
//           }`}
//         >
//           {isListening ? <MicOff size={18} /> : <Mic size={18} />}
//         </button>
//       </div>
//
//       {/* Conditional Speech Listening Animation Bar Section */}
//       {isListening && (
//         <div className="flex items-center gap-3 border border-red-100 bg-red-50/60 rounded-xl px-4 py-3 mb-4 transition-all animate-fadeIn">
//           <div className="flex items-center gap-1">
//             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
//             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
//             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
//           </div>
//           <span className="text-xs font-semibold text-red-500 tracking-wide">
//             Listening... Try speaking into your microphone system
//           </span>
//         </div>
//       )}
//
//       {/* Common Quick Tags Selection Element */}
//       <div>
//         <p className="text-xs font-semibold text-gray-400 mb-2.5">
//           Common issues (click to add):
//         </p>
//         <div className="flex flex-wrap gap-2">
//           {COMMON_ISSUES.map((issue) => (
//             <button
//               key={issue}
//               onClick={() => handleTagClick(issue)}
//               className="text-xs font-medium px-3 py-2 bg-slate-50 border border-gray-200/80 rounded-lg text-gray-700 hover:bg-slate-100/80 active:scale-[0.98] transition-all"
//             >
//               {issue}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useRef } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";

interface DescribeIssueProps {
  onIssueChange?: (text: string) => void;
  // Called whenever the recorded voice note changes (null = removed)
  onVoiceNoteChange?: (blob: Blob | null) => void;
}

const COMMON_ISSUES = [
  "Fan not working",
  "Switchboard problem",
  "Wall needs repainting",
  "Door is loose",
  "Paint touch-up needed",
  "Light flickering",
];

export default function DescribeIssue({
                                        onIssueChange,
                                        onVoiceNoteChange,
                                      }: DescribeIssueProps) {
  const [text, setText] = useState("");

  // ── Recording state ──────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0); // seconds
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ── Recording controls ───────────────────────────────────────────────────
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];

      // webm/opus is well supported and small; backend allowlist includes it
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        onVoiceNoteChange?.(blob);

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // stop mic stream
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("Mic access error:", err);
      setError(
          "Couldn't access your microphone. Please allow microphone permission and try again.",
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setRecordedBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setDuration(0);
    onVoiceNoteChange?.(null);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Text + tag handlers (unchanged) ──────────────────────────────────────
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
            Type your issue, or record a quick voice note
          </p>
        </div>

        {/* Main Textarea */}
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
        </div>

        {/* Voice Note Section */}
        <div className="border border-gray-200/80 rounded-2xl p-4 bg-slate-50/50 mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-3">
            Voice note (optional)
          </p>

          {!recordedBlob && !isRecording && (
              <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl text-sm font-medium hover:bg-blue-800 active:scale-[0.98] transition-all"
              >
                <Mic size={16} />
                Record voice note
              </button>
          )}

          {isRecording && (
              <div className="flex items-center gap-3 border border-red-100 bg-red-50/60 rounded-xl px-4 py-3 transition-all">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                </div>
                <span className="text-xs font-semibold text-red-500 tracking-wide flex-1">
              Recording... {formatTime(duration)}
            </span>
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 active:scale-[0.98] transition-all"
                >
                  <Square size={12} fill="white" />
                  Stop
                </button>
              </div>
          )}

          {recordedBlob && audioUrl && !isRecording && (
              <div className="flex items-center gap-3 border border-gray-200 bg-white rounded-xl px-4 py-3">
                <button
                    onClick={togglePlayback}
                    className="p-2 rounded-full bg-[#1e3a8a] text-white hover:bg-blue-800 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
                <span className="text-xs font-medium text-gray-600 flex-1">
              Voice note · {formatTime(duration)}
            </span>
                <button
                    onClick={discardRecording}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                    title="Discard recording"
                >
                  <Trash2 size={14} />
                </button>
              </div>
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* Common Quick Tags */}
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