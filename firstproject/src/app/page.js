'use client'
import {useState} from "react";
import styles from "./globals.css";
import PartnershipTable from "./partnership-table";

export default function Home() {
  const [output, setOutput] = useState('This is a nextjs project');
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState("");

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

  const prompt_generate_table_data = `Finde heraus was das Unternehmen für eine parterschule hat und wo diese ist und wo das Unternehmen ist, aus diesem text: === Extrahierter Text ===
Du erhältst durch das Duale Studium die Möglichkeit zur idealen Verknüpfung von Theorie und Praxis: Während deiner Praxiseinsätze lernst du deinen eigenen Stammbereich sowie wichtige Schnittstellenbereiche kennen.
Manche schreiben Codes. Du die Zukunft!
Als weltweit agierendes Unternehmen betreiben wir eine moderne IT-Landschaft, die jederzeit reibungslos funktionieren muss. Bei der permanenten Automatisierung von Prozessen sowie bei der Fehlerüberprüfung helfen uns selbstentwickelte Skripte und Programmierungen, die sich immer maximal an den Bedürfnissen unserer Kunden innerhalb der Schwarz Gruppe, wie z.B. Lidl und Kaufland, orientieren.
Duales Studium Angewandte Informatik 2025 m/w/d
Einsatzbereich:Ausbildung/Duales Studium/Abiturientenprogramm // Ort: Neckarsulm // Arbeitsmodell: Vollzeit
Dein Studium
Studiendauer:3 Jahre
Praxisort:Deine Praxisphasen verbringst du an unseren Standorten im Raum Heilbronn/NeckarsulmStammbereich: Schwarz IT KG (SIT) z.B. in der Anwendungsentwicklung oder in technischen BereichenStudienort:DHBW MosbachStudienabschluss:Bachelor of ScienceStudieninfos:Weitere Informationen findest du unterwww.dhbw-mosbach.de
Deine Studienschwerpunkte
In deinen Praxisphasen erhältst du einen tiefen Einblick in verschiedene Themenfelder bzw. arbeitest aktiv in Projekten und Abteilungen mit:
In deinen Praxisphasen erhältst du einen tiefen Einblick in verschiedene Themenfelder bzw. arbeitest aktiv in Projekten und Abteilungen mit:
Dein Profil
Unser Angebot
Wir freuen uns auf deine Bewerbung!
SPG GmbH & Co. KG · Eileen Kobald · Referenz-Nr. 42217Stiftsbergstraße 1 · 74172 Neckarsulmwww.jobs.schwarz
Schwarz Corporate Solutions KG
In diesem Dokument befinden sich aus Sicherheitsgründen keine Kontaktdaten des Arbeitgebers. Wenn Sie diese sehen möchten, lösen Sie bitte dieSicherheitsfrageund laden Sie das PDF erneut.
Wir schützen die Kontaktdaten des Arbeitgebers vor unerlaubten Zugriffen. Bitte geben Sie die dargestellten Zeichen in das Textfeld ein, um die Kontaktdaten des Arbeitgebers anzuzeigen.
Hinweis: Die dargestellten Zeichen enthalten keine Umlaute (ä, ö, ü oder ß), Sonderzeichen oder Leerzeichen.`;


  //fetch Gemini API
  const generateText = async () => {
    
    setLoading(true);

    try{
      const response = await fetch("/api/generate_table_data", {
        method: 'POST',
        headers:{
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({body:prompt_generate_table_data})
      });

      const data = await response.json();

      const parsedOutput = JSON.parse(data.output);

      if(response.ok){
        setOutput(data.output);

        const unternehmen_standort = parsedOutput[0].standort_unternehmen;
        const partnerschule_standort = parsedOutput[0].standort_partnerschule;

        await check_distance(unternehmen_standort, partnerschule_standort);
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

      if(response.ok){
        setDistance(result.output)
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
    <div>    
      {loading ? (<p className="text-blue-500">Loading...</p>):(<p onClick={generateText}>{output}</p>)}
      <PartnershipTable  data={sampleData}/>
      <p>{distance}</p>
    </div>
  );
}