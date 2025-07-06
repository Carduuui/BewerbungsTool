import {GoogleGenerativeAI} from "@google/generative-ai";
import { NextResponse } from "next/server";

//Gemini API verbindung 
export async function POST(req, res){
    try{
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const data = await req.json();

// Formatierung der Ausgabe von Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig:{
                responseMimeType: "application/json",
                responseSchema:{
                    type: "object",
                    properties:{
                        kernkompetenz:{
                            type: "string"
                        }
                    },
                    required: ["kernkompetenz"]
                }
            }
        })

        const result = await model.generateContent(data.body);
        const response = await result.response;
        const output = response.text();

        return NextResponse.json({output: output});
    }
    catch(err){
        console.error(err);
        return NextResponse.json(
            {error: "Failed to generate content"},
            {status: 500}
        )
    }
}