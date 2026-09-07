"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { IconTile } from '../../components/IconTile';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { Camera, ImagePlus, X, Check, ArrowRight, RefreshCcw, FileText } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';

type ScanStep = 'select' | 'camera' | 'processing' | 'confirm';

interface ScannedDoc {
  id: string;
  dataUrl: string;
  ocrData?: any;
}

export default function ScanScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language } = useSessionStore();

  const [step, setStep] = useState<ScanStep>('select');
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'select') {
      speak('Do you have any old prescriptions or reports? You can scan them now.', { language, gesture: 'point-down', stage: true });
    }
  }, [step, speak, language]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStep('camera');
      speak('Hold the document steady in the frame and tap capture.', language);
    } catch (err) {
      console.error('Camera access denied or unavailable', err);
      speak("I couldn't access the camera. Please upload from gallery.", language);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const checkImageQuality = (imageData: ImageData): boolean => {
    const data = imageData.data;
    let brightnessSum = 0;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
    }

    const avgBrightness = brightnessSum / (data.length / 16);

    if (avgBrightness < 40) {
      setQualityWarning("The image is too dark. Please make sure it's well lit.");
      return false;
    }

    setQualityWarning(null);
    return true;
  };

  const processImage = (dataUrl: string) => {
    stopCamera();
    setCurrentImage(dataUrl);
    setStep('processing');
    speak('Checking the image…', language);

    setTimeout(() => {
      setStep('confirm');
      speak('Here is what I found. Does this look correct?', language);
    }, 2500);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const qcCanvas = document.createElement('canvas');
    qcCanvas.width = 100;
    qcCanvas.height = 100;
    const qcCtx = qcCanvas.getContext('2d');
    if (qcCtx) {
      qcCtx.drawImage(canvas, 0, 0, 100, 100);
      const imgData = qcCtx.getImageData(0, 0, 100, 100);
      if (!checkImageQuality(imgData)) {
        speak('The image is too dark. Please retake it in better light.', language);
        return;
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    processImage(dataUrl);
  }, [language, speak]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      const img = new Image();
      img.onload = () => {
        const qcCanvas = document.createElement('canvas');
        qcCanvas.width = 100;
        qcCanvas.height = 100;
        const qcCtx = qcCanvas.getContext('2d');
        if (qcCtx) {
          qcCtx.drawImage(img, 0, 0, 100, 100);
          const imgData = qcCtx.getImageData(0, 0, 100, 100);
          if (!checkImageQuality(imgData)) {
            speak('The uploaded image is too dark. Please try another one.', language);
            setStep('select');
            return;
          }
        }
        processImage(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const confirmDocument = () => {
    if (!currentImage) return;
    setDocs((prev) => [
      ...prev,
      { id: Date.now().toString(), dataUrl: currentImage, ocrData: { type: 'Blood Report', date: '12 Aug 2026', items: ['Hemoglobin: 12.5 g/dL'] } },
    ]);
    setCurrentImage(null);
    setStep('select');
    speak('Saved. You can scan another, or finish.', language);
  };

  const rejectDocument = () => {
    setCurrentImage(null);
    setStep('select');
    speak("No problem. Let's try again.", language);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* prompt */}
      <div className="pb-3">
        <h1 className="text-5xl font-extrabold text-ink tracking-tight">Any old reports?</h1>
        <p className="text-2xl text-muted mt-1">Scan past prescriptions or reports so the doctor can see them.</p>
      </div>

      <div className="relative flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT OR SKIP */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-9"
            >
              <div className="flex gap-7">
                <IconTile icon={Camera} label="Scan with camera" onClick={startCamera} className="w-72 h-72" />
                <IconTile icon={ImagePlus} label="Upload from gallery" onClick={() => fileInputRef.current?.click()} className="w-72 h-72" />
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>

              <LargeTouchButton
                onClick={() => router.push('/summary')}
                variant={docs.length > 0 ? 'primary' : 'outline'}
                className="w-[34rem] py-5"
              >
                <span className="text-2xl">{docs.length > 0 ? 'Done scanning' : "I have no documents to scan"}</span>
                <ArrowRight size={30} className="ml-2" />
              </LargeTouchButton>
            </motion.div>
          )}

          {/* STEP 2: CAMERA CAPTURE */}
          {step === 'camera' && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center gap-4 z-20 bg-ink rounded-[1.75rem] overflow-hidden p-5"
            >
              <div className="relative w-full flex-1 rounded-[1.25rem] overflow-hidden bg-black flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-8 border-4 border-white/50 rounded-2xl pointer-events-none" />

                {qualityWarning && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-coral text-white px-7 py-3.5 rounded-full text-xl font-bold flex items-center gap-3">
                    <X size={28} />
                    {qualityWarning}
                  </div>
                )}
              </div>

              <div className="flex w-full justify-between items-center px-10 pb-2 pt-1">
                <button onClick={() => { stopCamera(); setStep('select'); }} className="text-white bg-white/20 p-5 rounded-full hover:bg-white/30">
                  <X size={34} />
                </button>
                <button onClick={capturePhoto} className="w-28 h-28 rounded-full border-8 border-white bg-white/20 hover:bg-white/50 transition-colors" />
                <div className="w-[74px]" />
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING SPINNER */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center gap-8">
              <div className="w-56 h-56 border-[16px] border-hairline border-t-primary rounded-full animate-spin" />
              <h2 className="text-4xl font-bold text-ink">Reading document…</h2>
            </motion.div>
          )}

          {/* STEP 4: MOCK OCR CONFIRMATION */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex gap-8 items-center justify-center">
              <div className="w-[44%] h-[440px] rounded-[1.75rem] overflow-hidden shadow-[var(--card-lift)] bg-white p-3 border border-hairline">
                <img src={currentImage!} className="w-full h-full object-contain rounded-[1.25rem]" />
              </div>

              <div className="w-[44%] flex flex-col gap-7">
                <div className="bg-surface p-9 rounded-[1.75rem] shadow-[var(--card-lift)] border border-hairline flex flex-col gap-5">
                  <div className="flex items-center gap-3 text-primary">
                    <FileText size={40} />
                    <h2 className="text-3xl font-bold">What I found</h2>
                  </div>

                  <div className="space-y-3 text-2xl">
                    <div className="flex justify-between border-b border-hairline pb-3">
                      <span className="text-muted">Document</span>
                      <span className="font-bold text-ink">Blood report</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-3">
                      <span className="text-muted">Date</span>
                      <span className="font-bold text-ink">12 Aug 2026</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-muted">Key value</span>
                      <span className="font-bold text-ink">Hemoglobin 12.5</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-5">
                  <LargeTouchButton onClick={rejectDocument} variant="secondary" className="flex-1 py-6">
                    <RefreshCcw size={32} className="mr-3" />
                    <span className="text-2xl">Retake</span>
                  </LargeTouchButton>
                  <LargeTouchButton onClick={confirmDocument} className="flex-1 py-6">
                    <Check size={32} className="mr-3" />
                    <span className="text-2xl">Looks good</span>
                  </LargeTouchButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THUMBNAIL STRIP */}
        <AnimatePresence>
          {step === 'select' && docs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 h-40 bg-surface/90 backdrop-blur-md border border-hairline rounded-[1.5rem] px-8 py-5 flex items-center gap-5 shadow-[var(--card-lift)]"
            >
              <span className="text-xl font-bold text-ink w-28">Scanned ({docs.length})</span>
              <div className="flex-1 flex gap-4 overflow-x-auto pb-1">
                {docs.map((doc) => (
                  <div key={doc.id} className="w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-hairline shadow-sm relative">
                    <img src={doc.dataUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 right-1.5 bg-primary rounded-full p-1 text-white">
                      <Check size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
