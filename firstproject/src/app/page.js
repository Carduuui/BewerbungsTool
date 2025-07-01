'use client'
import {useState} from "react";
import styles from "./globals.css";
import PartnershipTable from "./partnership-table";

export default function Home() {
  // Sample data for the table
  const sampleData = [
    {
      id: 1,
      unternehmen: "Weist EDV GmbH",
      partnerschule: "TH Brandenburg",
      unternehmensStandort: "Brandenburg an der Havel",
      partnerschuleStandort: "Brandenburg an der Havel",
      kernkompetenz: "IT-Dienstleistungen, Software-Entwicklung",
      bewerbungsstatus: "Angenommen",
    },
    {
      id: 2,
      unternehmen: "b-plus technologies GmbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Automatisierungstechnik, Industrie 4.0",
      bewerbungsstatus: "In Bearbeitung",
    },
    {
      id: 3,
      unternehmen: "conatec GmbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Beratung, Digitalisierung",
      bewerbungsstatus: "Abgelehnt",
    },
    {
      id: 4,
      unternehmen: "GFH mbH",
      partnerschule: "TH Deggendorf",
      unternehmensStandort: "Deggendorf",
      partnerschuleStandort: "Deggendorf",
      kernkompetenz: "Finanzdienstleistungen",
      bewerbungsstatus: "Wartend",
    },
    {
      id: 5,
      unternehmen: "Siemens AG",
      partnerschule: "TU München",
      unternehmensStandort: "München",
      partnerschuleStandort: "München",
      kernkompetenz: "Elektrotechnik, Automatisierung",
      bewerbungsstatus: "Angenommen",
    },
  ]

  const prompt = "Write quote of the day.";

  const [output, setOutput] = useState('This is a nextjs project');
  const [loading, setLoading] = useState(false);

  const [unternehmen, setUnternehmen] = useState(sampleData);

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

  const post_data_table = async () =>{
    try{
      const response = await fetch("/api/post_table", {
        method: "Post",
        headers:{
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          id: 1,
          unternehmen: "test"
        })
      })

      const result = await response.json();
      console.log(result);
    }
    catch(err){
      console.error(err);
    }
  }

  return (
    <div>    
      {loading ? (<p className="text-blue-500">Loading...</p>):(<p onClick={post_data_table}>{output}</p>)}
      <PartnershipTable  data={unternehmen}/>
    </div>
  );
}