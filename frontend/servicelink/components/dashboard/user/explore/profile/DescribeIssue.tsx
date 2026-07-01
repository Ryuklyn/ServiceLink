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

  // ── Text + tag handlers ──────────────────────────────────────────────────
  const handleTagClick = (issue: string) => {
    const freshText = text ? `${text.trim()}, ${issue.toLowerCase()}` : issue;
    setText(freshText);
    onIssueChange?.(freshText);
  };

  return (
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-4xl mx-auto shadow-sm select-none">
        {/* Title Block */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#0f172a] tracking-tight">
            Describe Your Issue
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Type your issue, or record a quick voice note
          </p>
        </div>

        {/* Main Textarea input zone */}
        <div className="relative border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-slate-50/50 mb-3 sm:mb-4 focus-within:border-blue-300 transition-colors">
          <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onIssueChange?.(e.target.value);
              }}
              placeholder="Describe your issue in detail... e.g., 'The ceiling fan in my bedroom has stopped working. It was making noise before it stopped.'"
              className="w-full min-h-[100px] sm:min-h-[110px] bg-transparent text-sm text-gray-700 placeholder-gray-400/90 outline-none resize-none border-0 p-0 focus:ring-0 leading-relaxed"
          />
        </div>

        {/* Voice Note Section */}
        <div className="border border-gray-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-slate-50/50 mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-2.5">
            Voice note (optional)
          </p>

          {!recordedBlob && !isRecording && (
              <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#1e3a8a] text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-800 active:scale-[0.98] transition-all"
              >
                <Mic size={15} />
                Record voice note
              </button>
          )}

          {isRecording && (
              <div className="flex items-center justify-between gap-3 border border-red-100 bg-red-50/60 rounded-xl px-3 sm:px-4 py-2.5 transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs font-semibold text-red-500 tracking-wide truncate">
                    Recording... {formatTime(duration)}
                  </span>
                </div>
                <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 active:scale-[0.98] transition-all shrink-0"
                >
                  <Square size={11} fill="white" />
                  Stop
                </button>
              </div>
          )}

          {recordedBlob && audioUrl && !isRecording && (
              <div className="flex items-center justify-between gap-3 border border-gray-200 bg-white rounded-xl px-3 sm:px-4 py-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <button
                      onClick={togglePlayback}
                      className="p-2 rounded-full bg-[#1e3a8a] text-white hover:bg-blue-800 active:scale-95 transition-all shrink-0"
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                  />
                  <span className="text-xs font-medium text-gray-600 truncate">
                    Voice note · {formatTime(duration)}
                  </span>
                </div>
                <button
                    onClick={discardRecording}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all shrink-0"
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
          <p className="text-xs font-semibold text-gray-400 mb-2">
            Common issues (click to add):
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {COMMON_ISSUES.map((issue) => (
                <button
                    key={issue}
                    onClick={() => handleTagClick(issue)}
                    className="text-xs font-medium px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 border border-gray-200/80 rounded-lg text-gray-700 hover:bg-slate-100/80 active:scale-[0.98] transition-all"
                >
                  {issue}
                </button>
            ))}
          </div>
        </div>
      </div>
  );
}