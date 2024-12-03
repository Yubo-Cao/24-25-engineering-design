import { NextResponse } from "next/server";

type FertilizerRequest = {
  imageData: string;
};

type FertilizerRecommendation = {
  soilHealth: string;
  recommendations: string[];
  timestamp: string;
  error?: string;
};

export async function POST(
  request: Request
): Promise<NextResponse<FertilizerRecommendation>> {
  try {
    const body = (await request.json()) as FertilizerRequest;

    if (!body.imageData) {
      return NextResponse.json(
        {
          error: "Image data is required",
          soilHealth: "Unknown",
          recommendations: [],
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!body.imageData.startsWith("data:image/")) {
      return NextResponse.json(
        {
          error: "Invalid image format",
          soilHealth: "Unknown",
          recommendations: [],
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    const recommendation: FertilizerRecommendation = {
      soilHealth: "Good",
      recommendations: [
        "Apply 20-30 kg/ha of nitrogen fertilizer",
        "Consider adding organic matter to improve soil structure",
        "Monitor soil moisture levels regularly",
      ],
      timestamp: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error processing fertilizer recommendation:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        soilHealth: "Unknown",
        recommendations: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
