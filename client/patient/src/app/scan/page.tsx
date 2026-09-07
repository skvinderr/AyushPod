"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { StepIndicator } from '../../components/StepIndicator';
import { IconTile } from '../../components/IconTile';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { Camera, ImagePlus, X, Check, ArrowRight, Loader2, RefreshCcw, FileText } from 'lucide-react';
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
      speak("Do you have any old prescriptions or reports? You can scan them now.", language);
    }
  }, [step, speak, language]);

  // Clean up camera on unmount or step change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStep('camera');
      speak("Hold the document steady in the frame and tap capture.", language);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      speak("I couldn't access the camera. Please upload from gallery.", language);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const checkImageQuality = (imageData: ImageData): boolean => {
    const data = imageData.data;
    let brightnessSum = 0;
    
    // Very basic brightness heuristic (sample every 4th pixel for speed)
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
    
    // In a real app, contrast/blur detection would go here
    setQualityWarning(null);
    return true;
  };

  const processImage = (dataUrl: string) => {
    stopCamera();
    setCurrentImage(dataUrl);
    setStep('processing');
    speak("Checking the image...", language);

    // Mock processing delay
    setTimeout(() => {
      setStep('confirm');
      speak("Here is what I found. Does this look correct?", language);
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
    
    // Quality Check on a scaled-down canvas for performance
    const qcCanvas = document.createElement('canvas');
    qcCanvas.width = 100;
    qcCanvas.height = 100;
    const qcCtx = qcCanvas.getContext('2d');
    if (qcCtx) {
      qcCtx.drawImage(canvas, 0, 0, 100, 100);
      const imgData = qcCtx.getImageData(0, 0, 100, 100);
      if (!checkImageQuality(imgData)) {
        speak("The image is too dark. Please retake it in better light.", language);
        return; // Don't process if too dark, user stays in camera view
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
      
      // Load into an image object to do quality check
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
            speak("The uploaded image is too dark. Please try another one.", language);
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
    setDocs(prev => [...prev, { 
      id: Date.now().toString(), 
      dataUrl: currentImage,
      ocrData: { type: 'Blood Report', date: '12 Aug 2026', items: ['Hemoglobin: 12.5 g/dL'] }
    }]);
    setCurrentImage(null);
    setStep('select');
    speak("Saved. You can scan another, or finish.", language);
  };

  const rejectDocument = () => {
    setCurrentImage(null);
    setStep('select');
    speak("No problem. Let's try again.", language);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-12">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-surface rounded-[2rem] shadow-[var(--shadow-warm)] border border-hairline p-12 flex flex-col min-h-[75vh]"
      >
        <StepIndicator currentStep={4} totalSteps={4} title="Scan Documents" />
        <p className="text-2xl text-muted mb-8">Have any past prescriptions or reports? Let's scan them.</p>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: SELECT OR SKIP */}
          {step === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-12 w-full"
            >
              
              <div className="flex gap-8 w-full justify-center">
                <IconTile 
                  icon={Camera}
                  label="Scan with Camera"
                  onClick={startCamera}
                  className="w-80 h-80 bg-white"
                />
                <IconTile 
                  icon={ImagePlus}
                  label="Upload from Gallery"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-80 h-80 bg-white"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <LargeTouchButton 
                onClick={() => router.push('/summary')}
                variant={docs.length > 0 ? 'primary' : 'outline'}
                className="mt-8 w-[40rem] py-6"
              >
                <span className="text-3xl">
                  {docs.length > 0 ? "Done Scanning" : "I have no documents to scan"}
                </span>
                <ArrowRight size={32} />
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
              className="absolute inset-0 flex flex-col items-center gap-6 z-20 bg-slate-900 rounded-[3rem] overflow-hidden p-6"
            >
              <div className="relative w-full flex-1 rounded-[2rem] overflow-hidden bg-black flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-8 border-4 border-white/50 rounded-2xl pointer-events-none" />
                
                {qualityWarning && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-coral text-white px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-4">
                    <X size={32} />
                    {qualityWarning}
                  </div>
                )}
              </div>

              <div className="flex w-full justify-between items-center px-12 pb-6 pt-4">
                <button 
                  onClick={() => { stopCamera(); setStep('select'); }}
                  className="text-white bg-white/20 p-6 rounded-full hover:bg-white/30"
                >
                  <X size={40} />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="w-32 h-32 rounded-full border-8 border-white bg-white/20 hover:bg-white/50 transition-colors"
                />
                <div className="w-[88px]" /> {/* Spacer for centering */}
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING SPINNER */}
          {step === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              <div className="w-64 h-64 border-[16px] border-hairline border-t-primary rounded-full animate-spin" />
              <h2 className="text-4xl font-bold text-ink">Reading Document...</h2>
            </motion.div>
          )}

          {/* STEP 4: MOCK OCR CONFIRMATION */}
          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex w-full gap-12 items-center justify-center"
            >
              {/* Image Preview */}
              <div className="w-1/2 h-[600px] rounded-[3rem] overflow-hidden shadow-2xl bg-white p-4">
                <img src={currentImage!} className="w-full h-full object-contain rounded-[2rem]" />
              </div>

              {/* Mock Data Card */}
              <div className="w-1/2 flex flex-col gap-8">
                <div className="bg-surface p-12 rounded-[2rem] shadow-[var(--shadow-warm)] border border-hairline flex flex-col gap-6">
                  <div className="flex items-center gap-4 text-primary mb-4">
                    <FileText size={48} />
                    <h2 className="text-4xl font-bold">Extracted Data</h2>
                  </div>

                  <div className="space-y-4 text-3xl">
                    <div className="flex justify-between border-b border-hairline pb-4">
                      <span className="text-muted">Document Type</span>
                      <span className="font-bold text-ink">Blood Report</span>
                    </div>
                    <div className="flex justify-between border-b border-hairline pb-4">
                      <span className="text-muted">Date</span>
                      <span className="font-bold text-ink">12 Aug 2026</span>
                    </div>
                    <div className="flex justify-between pb-4">
                      <span className="text-muted">Key Value</span>
                      <span className="font-bold text-ink">Hemoglobin: 12.5</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mt-4">
                  <LargeTouchButton
                    onClick={rejectDocument}
                    className="flex-1 bg-coral-soft text-coral hover:bg-coral/20 border-none py-8"
                  >
                    <RefreshCcw size={40} className="mr-4" />
                    <span className="text-3xl">Retake</span>
                  </LargeTouchButton>
                  <LargeTouchButton
                    onClick={confirmDocument}
                    className="flex-1 bg-primary hover:bg-primary-deep shadow-[var(--shadow-warm)] text-white border-none py-8"
                  >
                    <Check size={40} className="mr-4" />
                    <span className="text-3xl">Looks Good</span>
                  </LargeTouchButton>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* THUMBNAIL STRIP (Always visible on Select step if docs exist) */}
        <AnimatePresence>
          {step === 'select' && docs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 h-48 bg-surface/85 backdrop-blur-md border-t border-hairline rounded-t-[2rem] px-12 py-6 flex items-center gap-6 shadow-[0_-10px_40px_-15px_rgba(70,55,40,0.15)]"
            >
              <span className="text-2xl font-bold text-ink w-32">Scanned ({docs.length})</span>
              <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
                {docs.map(doc => (
                  <div key={doc.id} className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-hairline shadow-sm relative">
                    <img src={doc.dataUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1 text-white">
                      <Check size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
