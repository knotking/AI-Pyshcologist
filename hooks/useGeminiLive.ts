
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, CurrentTranscription, TranscriptionEntry } from '../types';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

const SYSTEM_INSTRUCTION = "You are a compassionate and empathetic psychologist. Listen carefully to the user, offer thoughtful reflections, and guide them through their thoughts and feelings. Maintain a calm, professional, and supportive tone. Keep your responses concise and conversational.";

export const useGeminiLive = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState<CurrentTranscription>({ user: '', model: '' });

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRefs = useRef<{ input: AudioContext | null, output: AudioContext | null, scriptProcessor: ScriptProcessorNode | null, mediaStream: MediaStream | null }>({ input: null, output: null, scriptProcessor: null, mediaStream: null });
    const outputAudioRefs = useRef<{ queue: Set<AudioBufferSourceNode>, nextStartTime: number }>({ queue: new Set(), nextStartTime: 0 });

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

    const connect = useCallback(async () => {
        if (connectionState !== ConnectionState.IDLE && connectionState !== ConnectionState.CLOSED && connectionState !== ConnectionState.ERROR) {
            return;
        }

        setConnectionState(ConnectionState.CONNECTING);
        setTranscriptionHistory([]);
        setCurrentTranscription({ user: '', model: '' });

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

                        let userText = '', modelText = '';
                        if (message.serverContent?.inputTranscription) {
                            userText = message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            modelText = message.serverContent.outputTranscription.text;
                        }

                        setCurrentTranscription(prev => ({ user: prev.user + userText, model: prev.model + modelText }));

                        if (message.serverContent?.turnComplete) {
                            setTranscriptionHistory(prev => {
                                const newHistory = [...prev];
                                if (currentTranscription.user.trim()) {
                                    newHistory.push({ speaker: 'user', text: currentTranscription.user.trim() });
                                }
                                if (currentTranscription.model.trim()) {
                                    newHistory.push({ speaker: 'model', text: currentTranscription.model.trim() });
                                }
                                return newHistory;
                            });
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
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: SYSTEM_INSTRUCTION,
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
    }, [connectionState, cleanup, stopAudioPlayback, currentTranscription]);
    
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
