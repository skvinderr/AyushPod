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
import { useT } from '../../i18n';

type ScanStep = 'select' | 'camera' | 'processing' | 'confirm';

interface ScannedDoc {
  id: string;
  dataUrl: string;
  ocrData?: { type: string; date: string; items: string[] };
}

export default function ScanScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language } = useSessionStore();
  const { t } = useT();

  const [step, setStep] = useState<ScanStep>('select');
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'select') {
      speak(t('scan.spoken.prompt'), { language, gesture: 'point-down', stage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      speak(t('scan.spoken.steady'), language);
    } catch (err) {
      console.error('Camera access denied or unavailable', err);
      speak(t('scan.spoken.noCamera'), language);
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
      setQualityWarning(t('scan.warning.dark'));
      return false;
    }

    setQualityWarning(null);
    return true;
  };

  const processImage = (dataUrl: string) => {
    stopCamera();
    setCurrentImage(dataUrl);
    setStep('processing');
    speak(t('scan.spoken.checking'), language);

    setTimeout(() => {
      setStep('confirm');
      speak(t('scan.spoken.found'), language);
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
        speak(t('scan.spoken.tooDark'), language);
        return;
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    processImage(dataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            speak(t('scan.spoken.uploadDark'), language);
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
    speak(t('scan.spoken.saved'), language);
  };

  const rejectDocument = () => {
    setCurrentImage(null);
    setStep('select');
    speak(t('scan.spoken.retry'), language);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* prompt */}
      <div className="pb-2 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{t('scan.heading')}</h1>
        <p className="text-sm sm:text-base text-muted mt-0.5">{t('scan.sub')}</p>
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
              className="h-full flex flex-col items-center justify-center gap-6"
            >
              <div className="flex gap-5">
                <IconTile icon={Camera} label={t('scan.camera')} onClick={startCamera} className="w-40 h-40 sm:w-48 sm:h-48" />
                <IconTile icon={ImagePlus} label={t('scan.upload')} onClick={() => fileInputRef.current?.click()} className="w-40 h-40 sm:w-48 sm:h-48" />
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>

              <LargeTouchButton
                onClick={() => router.push('/summary')}
                variant={docs.length > 0 ? 'primary' : 'outline'}
                className="w-full max-w-sm py-2.5 min-h-[44px] text-base"
              >
                <span>{docs.length > 0 ? t('scan.doneScanning') : t('scan.noDocuments')}</span>
                <ArrowRight size={20} className="ml-1.5" />
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
              className="absolute inset-0 flex flex-col items-center gap-3 z-20 bg-ink rounded-2xl overflow-hidden p-3"
            >
              <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-6 border-2 border-white/50 rounded-xl pointer-events-none" />

                {qualityWarning && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-coral text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <X size={18} />
                    {qualityWarning}
                  </div>
                )}
              </div>

              <div className="flex w-full justify-between items-center px-6 pb-1 pt-1">
                <button onClick={() => { stopCamera(); setStep('select'); }} className="text-white bg-white/20 p-3 rounded-full hover:bg-white/30">
                  <X size={22} />
                </button>
                <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/50 transition-colors" />
                <div className="w-10" />
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING SPINNER */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 border-[8px] border-hairline border-t-primary rounded-full animate-spin" />
              <h2 className="text-2xl font-bold text-ink">{t('scan.reading')}</h2>
            </motion.div>
          )}

          {/* STEP 4: MOCK OCR CONFIRMATION */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full flex gap-5 items-center justify-center">
              <div className="w-[45%] h-[280px] sm:h-[320px] rounded-2xl overflow-hidden shadow-sm bg-white p-2 border border-hairline">
                <img src={currentImage!} className="w-full h-full object-contain rounded-xl" />
              </div>

              <div className="w-[48%] flex flex-col gap-4">
                <div className="bg-surface p-5 rounded-2xl shadow-xs border border-hairline flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <FileText size={24} />
                    <h2 className="text-xl font-bold">{t('scan.found')}</h2>
                  </div>

                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">{t('scan.doc.document')}</span>
                      <span className="font-bold text-ink">{t('scan.doc.bloodReport')}</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-2">
                      <span className="text-muted">{t('scan.doc.date')}</span>
                      <span className="font-bold text-ink">{t('scan.doc.dateValue')}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-muted">{t('scan.doc.keyValue')}</span>
                      <span className="font-bold text-ink">{t('scan.doc.hemoglobin')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <LargeTouchButton onClick={rejectDocument} variant="secondary" className="flex-1 py-2.5 min-h-[44px] text-base">
                    <RefreshCcw size={18} className="mr-1.5" />
                    <span>{t('scan.retake')}</span>
                  </LargeTouchButton>
                  <LargeTouchButton onClick={confirmDocument} className="flex-1 py-2.5 min-h-[44px] text-base">
                    <Check size={18} className="mr-1.5" />
                    <span>{t('scan.looksGood')}</span>
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="absolute bottom-0 left-0 right-0 h-24 bg-surface/90 backdrop-blur-md border border-hairline rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-sm"
            >
              <span className="text-sm font-bold text-ink w-20">{t('scan.scannedCount', { count: docs.length })}</span>
              <div className="flex-1 flex gap-3 overflow-x-auto pb-1">
                {docs.map((doc) => (
                  <div key={doc.id} className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-hairline shadow-xs relative">
                    <img src={doc.dataUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5 text-white">
                      <Check size={10} />
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
