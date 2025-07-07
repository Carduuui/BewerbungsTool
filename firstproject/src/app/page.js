'use client'
import {useState} from "react";
import styles from "./globals.css";
import PartnershipTable from "./partnership-table";
import SearchForm from "./search-form";
import CompanyPopup from "./company-popup"

export default function Home() {
  const [output, setOutput] = useState('This is a nextjs project');
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Sample data for the table
  const [sampleData, setSampleData] = useState([
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
  ]);

  const scrape_job_data = async (url_eingabe) =>{

    setLoading(true);

    try{
      const response = await fetch("/api/scraper", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({
          url: url_eingabe
        })
      });

      const data = await response.json();

      if(data.success){
        await generateText(data.extractedText);
      }
      else{
        setOutput(`Fehler beim Scraping: ${data.error}`);
      }
    }
    catch(err){
      console.error(err);
      setOutput(`Netzwerkfehler: ${err.message}`);
    }
    finally{
      setLoading(false);
    }
  }

  const handle_search = (searchTerm) =>{
    scrape_job_data(searchTerm);
  }

  const scrape_kernkompetenz_data = async (unternehmen_name) =>{
    try{
      const response = await fetch("/api/scraper_kernkompetenz", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({
          unternehmen_name: unternehmen_name
        })
    });

      const data = await response.json();

      if(data.success){
        await generate_kernkompetenz(JSON.stringify(data.data, null, 2));
      }
      else{
        setOutput(`Fehler beim Scraping: ${data.error}`);
      }
    }
    catch(err){
      console.error(err);
      setOutput(`Netzwerkfehler: ${err.message}`);
    }
  }

  const generate_kernkompetenz = async (kernkompetenz_data) =>{
    const prompt = `Finde heraus was die Kernkompetenz des Unternehmens ist und halte es in 1-2 Stichpunkten fest.
    Anhand dieses Textes ${kernkompetenz_data}`;

    try{
      const response = await fetch("/api/generate_kernkompetenz_data", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt})
      });

      const data = await response.json();

      const parsedOutput = JSON.parse(data.output);

      if(response.ok){
        setPopupData(prevData =>({
          ...prevData,
          kernkompetenz: parsedOutput.kernkompetenz || "Nicht angegeben",
        }));
        setShowPopup(true);
      }
      else{
        setOutput(data.error);
        const text = await response.text();
        console.error("Server error:", response.status, text);
      }
    }
    catch(err){
      console.error(err);
    }
  }

  //fetch Gemini API
  const generateText = async (scrapedText) => {

    const prompt = `Finde heraus was das Unternehmen für eine parterschule hat und wo diese ist und wo das Unternehmen ist, aus diesem text: ==extrahierterText==  
    ${scrapedText}`;

    try{
      const response = await fetch("/api/generate_table_data", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt})
      });

      const data = await response.json();

      const parsedOutput = JSON.parse(data.output);

      if(response.ok){
       // setOutput(data.output);

        const unternehmen_standort = parsedOutput[0].standort_unternehmen;
        const partnerschule_standort = parsedOutput[0].standort_partnerschule;

        setPopupData({
          unternehmen: parsedOutput[0].unternehmen || "Nicht gefunden",
          partnerschule: parsedOutput[0].partnerschule || "Nicht gefunden",
          unternehmensStandort: unternehmen_standort,
          partnerschuleStandort: partnerschule_standort,
        })

        await Promise.all([
          await check_distance(unternehmen_standort, partnerschule_standort),
          await scrape_kernkompetenz_data(parsedOutput[0].unternehmen)
        ])
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
  }

  const check_distance = async (unternehmen_standort, partnerschule_standort) =>{

    const prompt = `wie weit ist ${unternehmen_standort} von ${partnerschule_standort} entfernt mit Auto in Kilometern?`;

    try{
      const response = await fetch("/api/check_distance", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt})
      });

      const result = await response.json();

      const parsedOutput = JSON.parse(result.output);

      if(response.ok){
        setDistance(result.output);
        setPopupData(prevData =>({
          ...prevData,
          distanz: parsedOutput[0].distanz,
        }))
      }else{
        setOutput(result.error);
        const text = await response.text();
        console.error("Server error:", response.status, text);
      }

    }
    catch(err){
      console.error(err);
    }
  }

  const handleAddToTable = () =>{

  }

  const handleDontAdd = () =>{
    setShowPopup(false);
    setPopupData(null);
  }

  const handleClosePopup = (open) =>{
    if(!open){
      setShowPopup(false);
      setPopupData(null);
    }
  }

  //fetch für DB befüllen
  const post_data_table = async () =>{
    try{
      const response = await fetch("/api/post_table", {
        method: 'POST',
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
    <div className="bg-gray-900 min-h-screen p-10">       
      {loading ? (<p className="text-blue-500">Loading...</p>):(<p>{output}</p>)}
      <SearchForm onSearch={handle_search}/>
      <PartnershipTable  data={sampleData}/>
      <p>{distance}</p>
      <CompanyPopup 
        isOpen={showPopup}
        onClose={handleClosePopup}
        data={popupData}
        onAddToTable={handleAddToTable}
        onDontAdd={handleDontAdd}
        />
    </div> 
  );
}