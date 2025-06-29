'use client'
import {useState} from "react";
import styles from "./globals.css";

export default function Home() {
  const prompt = "Write quote of the day.";

  const [output, setOutput] = useState('This is a nextjs project');
  const [loading, setLoading] = useState(false);

  const generateText = async () => {
    
    setLoading(true);

    try{
      const response = await fetch("/api/generate", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt})
      });

      const data = await response.json();

      if(response.ok){
        setOutput(data.output);
      }
      else{
        setOutput(data.error);
        const text = await response.text();
        console.error("Server error:", response.status, text);
      }
    }
    catch(err){
      console.error(err)
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <div>    
      {loading ? (<p className="text-blue-500">Loading...</p>):(<p onClick={generateText}>{output}</p>)}
      <MyButton />
    </div>
  );
}

function MyButton(){
  return(
    <button className="btnStyle border-solid text-red-500 border-2">I'm a button</button>
  );
}