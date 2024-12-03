"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import useSWRMutation from "swr/mutation";

async function sendRequest(
  url: string,
  { arg }: { arg: { imageData: string } }
) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

const FertilizerRecommendation = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    trigger,
    data: recommendation,
    error,
    isMutating,
  } = useSWRMutation("/api/fertilizer", sendRequest);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.8);
    setImageData(data);

    stopCamera();

    // Send to API
    try {
      await trigger({ imageData: data });
    } catch (err) {
      console.error("Error sending image:", err);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as string;
        setImageData(data);
        await trigger({ imageData: data });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error processing file:", err);
    }
  };

  const resetCapture = () => {
    setImageData(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Soil Analysis</CardTitle>
        <CardDescription>
          Take a picture or upload an image of your soil to get fertilizer
          recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
              {!isCameraActive && !imageData && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-400" />
                </div>
              )}
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              {imageData && (
                <Image
                  src={imageData}
                  alt="Captured soil"
                  className="w-full h-full object-cover"
                  fill
                />
              )}
            </div>

            <div className="flex gap-2 justify-center">
              {!isCameraActive && !imageData && (
                <Button onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              )}
              {isCameraActive && (
                <Button onClick={captureImage}>Capture Image</Button>
              )}
              {imageData && (
                <Button variant="outline" onClick={resetCapture}>
                  Take New Photo
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
              {!imageData ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Upload className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG or JPEG (max. 5MB)
                  </p>
                </div>
              ) : (
                <Image
                  src={imageData}
                  alt="Uploaded soil"
                  className="w-full h-full object-cover"
                  fill
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {imageData && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={resetCapture}>
                  Upload New Image
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isMutating && (
          <Alert>
            <AlertTitle>Analyzing...</AlertTitle>
            <AlertDescription>
              Please wait while we analyze your soil image
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message ||
                "Failed to get recommendations. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {recommendation && (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Soil Health: {recommendation.soilHealth}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 mt-2">
                  {recommendation.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index} className="mt-1">
                        {rec}
                      </li>
                    )
                  )}
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-slate-500">
              Analysis performed at:{" "}
              {new Date(recommendation.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FertilizerRecommendation;
