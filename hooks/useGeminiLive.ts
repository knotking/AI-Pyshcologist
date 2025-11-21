
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, CurrentTranscription, TranscriptionEntry, InterviewSettings } from '../types';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

export const useGeminiLive = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState<CurrentTranscription>({ user: '', model: '' });

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRefs = useRef<{ input: AudioContext | null, output: AudioContext | null, scriptProcessor: ScriptProcessorNode | null, mediaStream: MediaStream | null }>({ input: null, output: null, scriptProcessor: null, mediaStream: null });
    const outputAudioRefs = useRef<{ queue: Set<AudioBufferSourceNode>, nextStartTime: number }>({ queue: new Set(), nextStartTime: 0 });
    const currentTranscriptionRef = useRef<CurrentTranscription>({ user: '', model: '' });

    const stopAudioPlayback = useCallback(() => {
        outputAudioRefs.current.queue.forEach(source => {
            source.stop();
        });
        outputAudioRefs.current.queue.clear();
        outputAudioRefs.current.nextStartTime = 0;
    }, []);

    const cleanup = useCallback(() => {
        stopAudioPlayback();

        if (audioContextRefs.current.scriptProcessor) {
            audioContextRefs.current.scriptProcessor.disconnect();
            audioContextRefs.current.scriptProcessor = null;
        }
        if (audioContextRefs.current.input) {
            audioContextRefs.current.input.close();
            audioContextRefs.current.input = null;
        }
        if (audioContextRefs.current.output) {
            audioContextRefs.current.output.close();
            audioContextRefs.current.output = null;
        }
        if (audioContextRefs.current.mediaStream) {
            audioContextRefs.current.mediaStream.getTracks().forEach(track => track.stop());
            audioContextRefs.current.mediaStream = null;
        }

        sessionPromiseRef.current = null;
    }, [stopAudioPlayback]);


    const disconnect = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (error) {
                console.error("Error closing session:", error);
            }
        }
        cleanup();
        setConnectionState(ConnectionState.CLOSED);
    }, [cleanup]);

    const connect = useCallback(async (resumeSummary: string, selectedSkill: string, settings: InterviewSettings) => {
        if (connectionState !== ConnectionState.IDLE && connectionState !== ConnectionState.CLOSED && connectionState !== ConnectionState.ERROR) {
            return;
        }

        setConnectionState(ConnectionState.CONNECTING);
        setTranscriptionHistory([]);
        setCurrentTranscription({ user: '', model: '' });
        currentTranscriptionRef.current = { user: '', model: '' };

        const systemInstruction = `
            You are a professional, strict but fair technical interviewer. 
            
            Context about the candidate: ${resumeSummary}
            
            Your goal is to interview the candidate specifically about: "${selectedSkill}".
            
            IMPORTANT: You must conduct this interview in the following language: ${settings.language}.
            
            1. Start by asking a relevant technical question about ${selectedSkill}.
            2. Listen to their answer, then ask a follow-up question or challenge their assumption.
            3. Keep questions concise and focused. 
            4. Maintain a professional interview tone.
            5. Do not provide long explanations unless asked. Focus on evaluating the candidate.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            audioContextRefs.current.input = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRefs.current.output = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioRefs.current.nextStartTime = 0;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRefs.current.mediaStream = stream;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setConnectionState(ConnectionState.CONNECTED);
                        const source = audioContextRefs.current.input!.createMediaStreamSource(stream);
                        const scriptProcessor = audioContextRefs.current.input!.createScriptProcessor(4096, 1, 1);
                        audioContextRefs.current.scriptProcessor = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRefs.current.input!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputCtx = audioContextRefs.current.output!;
                            outputAudioRefs.current.nextStartTime = Math.max(outputAudioRefs.current.nextStartTime, outputCtx.currentTime);

                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                outputAudioRefs.current.queue.delete(source);
                            });

                            source.start(outputAudioRefs.current.nextStartTime);
                            outputAudioRefs.current.nextStartTime += audioBuffer.duration;
                            outputAudioRefs.current.queue.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                        }

                        const userText = message.serverContent?.inputTranscription?.text || '';
                        const modelText = message.serverContent?.outputTranscription?.text || '';
                        
                        if (userText || modelText) {
                            currentTranscriptionRef.current.user += userText;
                            currentTranscriptionRef.current.model += modelText;
                            setCurrentTranscription({ ...currentTranscriptionRef.current });
                        }

                        if (message.serverContent?.turnComplete) {
                            setTranscriptionHistory(prev => {
                                const newHistory = [...prev];
                                const userTurn = currentTranscriptionRef.current.user.trim();
                                const modelTurn = currentTranscriptionRef.current.model.trim();
                                if (userTurn) {
                                    newHistory.push({ speaker: 'user', text: userTurn });
                                }
                                if (modelTurn) {
                                    newHistory.push({ speaker: 'model', text: modelTurn });
                                }
                                return newHistory;
                            });
                            currentTranscriptionRef.current = { user: '', model: '' };
                            setCurrentTranscription({ user: '', model: '' });
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        setConnectionState(ConnectionState.ERROR);
                        cleanup();
                    },
                    onclose: () => {
                        cleanup();
                        setConnectionState(ConnectionState.CLOSED);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voice } } },
                    systemInstruction: systemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

            await sessionPromiseRef.current;

        } catch (error) {
            console.error("Failed to connect:", error);
            setConnectionState(ConnectionState.ERROR);
            cleanup();
        }
    }, [connectionState, cleanup, stopAudioPlayback]);
    
    // Final cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        connectionState,
        transcriptionHistory,
        currentTranscription,
        connect,
        disconnect,
    };
};
