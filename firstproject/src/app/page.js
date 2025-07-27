"use client"

import { useState, useEffect } from "react"
import PartnershipTable from "./partnership-table"
import SearchForm from "./search-form"
import CompanyPopup from "./company-popup"
import LoadingSpinner from "./loading-spinner"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Wird geladen...")
  const [distance, setDistance] = useState("")
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState(null)
  const [searchTermLink, setSearchTermLink] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    get_all_data_table();

    let eventSource = null;
    let reconnectTimer = null;

    const connectToSSE = () => {
      console.log('Attempting to connect to SSE...');
      
      try {
        // Close existing connection if any
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        eventSource = new EventSource('/api/extension-stream');

        if (!eventSource) {
          console.error('Failed to create EventSource');
          setConnectionStatus('Fehler beim Erstellen der Verbindung');
          return;
        }

        eventSource.onopen = () => {
          console.log('SSE connection opened');
          setConnectionStatus('Verbunden - Warte auf URLs...');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('SSE message received:', data);

            if (data.type === 'new-url') {
              console.log('Automatisch neue URL erhalten:', data.url);
              setConnectionStatus('URL empfangen - Verarbeitung läuft...');
              handle_search(data.url);
            } else if (data.type === 'connected') {
              console.log('SSE connected with client ID:', data.clientId);
              setConnectionStatus('Verbunden - Warte auf URLs...');
            }
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          console.error('EventSource readyState:', eventSource?.readyState);
          setConnectionStatus('Verbindungsfehler - Versuche Wiederverbindung...');
          
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Clear any existing timer
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }

          // Reconnect after 3 seconds
          reconnectTimer = setTimeout(() => {
            connectToSSE();
          }, 3000);
        };

      } catch (err) {
        console.error('Error creating EventSource:', err);
        setConnectionStatus('Fehler beim Verbindungsaufbau: ' + err.message);
      }
    };

    connectToSSE();

    return () => {
      eventSource.close();
    }
  }, [])

  // Sample data for the table
  const [sampleData, setSampleData] = useState([])

  const scrape_job_data = async (url_eingabe) => {
    setLoading(true)
    setLoadingMessage("Webseite wird analysiert...")

    try {
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          url: url_eingabe,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setLoadingMessage("Daten werden verarbeitet...")
        await generateText(data.extractedText)
      } else {
        console.error(`Fehler beim Scraping: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const url_chrome_extension_data = async () =>{
    try{
      const response = await fetch("/api/url_chrome_extension", {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
        }
      })

      const data = await response.json();

      console.log(data.url);

      if(data.success){
        handle_search(data.url);
      }
      else{
        console.error(`Fehler bei data ${data.error}`);
      }
    }
    catch(err){
      console.error(err);
    }
  }

  const handle_search = (searchTerm) => {
    setSearchTermLink(searchTerm);
    scrape_job_data(searchTerm)
  }

  const scrape_kernkompetenz_data = async (unternehmen_name) => {
    setLoadingMessage("Kernkompetenz wird ermittelt...")

    try {
      const response = await fetch("/api/scraper_kernkompetenz", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          unternehmen_name: unternehmen_name,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await generate_kernkompetenz(JSON.stringify(data.data, null, 2))
      } else {
        console.error(`Fehler beim Scraping: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const generate_kernkompetenz = async (kernkompetenz_data) => {
    const prompt = `Finde heraus was die Kernkompetenz des Unternehmens ist und halte es in 1-2 Stichpunkten fest.
    Anhand dieses Textes ${kernkompetenz_data}`

    try {
      const response = await fetch("/api/generate_kernkompetenz_data", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ body: prompt }),
      })

      const data = await response.json()
      const parsedOutput = JSON.parse(data.output)

      if (response.ok) {
        setPopupData((prevData) => ({
          ...prevData,
          kernkompetenz: parsedOutput.kernkompetenz || "Nicht angegeben",
        }))
        setShowPopup(true)
      } else {
        const text = await response.text()
        console.error("Server error:", response.status, text)
      }
    } catch (err) {
      console.error(err)
    }
  }

  //fetch Gemini API
  const generateText = async (scrapedText) => {
    const prompt = `Finde heraus was das Unternehmen für eine parterschule hat und wo diese ist und wo das Unternehmen ist, aus diesem text: ==extrahierterText==  
    ${scrapedText}`

    try {
      const response = await fetch("/api/generate_table_data", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ body: prompt }),
      })

      const data = await response.json()
      const parsedOutput = JSON.parse(data.output)

      if (response.ok) {
        const unternehmen_standort = parsedOutput[0].standort_unternehmen
        const partnerschule_standort = parsedOutput[0].standort_partnerschule

        setPopupData({
          unternehmen: parsedOutput[0].unternehmen || "Nicht gefunden",
          partnerschule: parsedOutput[0].partnerschule || "Nicht gefunden",
          unternehmensStandort: unternehmen_standort,
          partnerschuleStandort: partnerschule_standort,
        })

        setLoadingMessage("Entfernung wird berechnet...")
        await Promise.all([
          await check_distance(unternehmen_standort, partnerschule_standort),
          await scrape_kernkompetenz_data(parsedOutput[0].unternehmen),
        ])
      } else {
        const text = await response.text()
        console.error("Server error:", response.status, text)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const check_distance = async (unternehmen_standort, partnerschule_standort) => {
    try {
      const response = await fetch("/api/check_distance", {
          method: "POST",
          headers: {
              "Content-type": "application/json",
          },
          body: JSON.stringify({ 
              origin: unternehmen_standort,
              destination: partnerschule_standort
          }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
          setDistance(result.data.distanz);
          setPopupData((prevData) => ({
              ...prevData,
              distanz: result.data.distanz,
              fahrtzeit: result.data.fahrtzeit, // Optional: Fahrtzeit hinzufügen

              originCoords: result.data.originCoords,
              destinationCoords: result.data.destinationCoords
          }));
      } else {
          console.error("Fehler bei der Entfernungsberechnung:", result.error);
          setPopupData((prevData) => ({
              ...prevData,
              distanz: "Nicht berechnet"
          }));
      }
  } catch (err) {
      console.error("Netzwerkfehler bei der Entfernungsberechnung:", err);
      setPopupData((prevData) => ({
          ...prevData,
          distanz: "Fehler bei Berechnung"
      }));
  }
  }

  const handleAddToTable = async () => {
    const latestId = await get_latest_id_table()
    const nextId = latestId == null ? 1 : latestId + 1

    await post_data_table(nextId)
    setShowPopup(false)

    const newEntry = {
      id: nextId,
      unternehmen: popupData.unternehmen,
      partnerschule: popupData.partnerschule,
      unternehmensStandort: popupData.unternehmensStandort,
      partnerschuleStandort: popupData.partnerschuleStandort,
      kernkompetenz: popupData.kernkompetenz,
      bewerbungsstatus: "Option",
      distanz: popupData.distanz || "Nicht berechnet",
      link: searchTermLink,
    }

    setSampleData((prevData) => [...prevData, newEntry])
    setPopupData(null)
  }

  const handleDontAdd = async () => {
    setShowPopup(false)
    setPopupData(null)
  }

  const handleClosePopup = (open) => {
    if (!open) {
      setShowPopup(false)
      setPopupData(null)
    }
  }

  const get_latest_id_table = async () => {
    try {
      const response = await fetch("/api/get_latest_id_table", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      if (result.success) {
        // Wenn erfolgreich, aber keine Daten (leere Tabelle)
        if (result.data === null || result.data === undefined) {
          console.log("Keine Einträge in der Tabelle gefunden. Beginne mit ID 1.")
          return 0 // Startet bei 1 (0 + 1)
        }
        return result.data
      } else {
        // Unterscheide zwischen "keine Daten" und echten Fehlern
        if (
          result.error === "No data found with this ID" ||
          result.error.includes("No data found") ||
          result.error.includes("empty table")
        ) {
          console.log("Tabelle ist leer. Beginne mit ID 1.")
          return 0
        } else {
          // Echter Fehler
          console.error("Fehler beim Laden der ID:", result.error)
          return null
        }
      }
    } catch (err) {
      console.error("Network error:", err)
      return null
    }
  }

  const post_data_table = async (latest_id) => {
    try {
      const response = await fetch("/api/post_data_table", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: Number.parseInt(latest_id),
          unternehmen: popupData.unternehmen,
          partnerschule: popupData.partnerschule,
          unternehmen_standort: popupData.unternehmensStandort,
          partnerschule_standort: popupData.partnerschuleStandort,
          kernkompetenz: popupData.kernkompetenz,
          link: searchTermLink,
        }),
      })

      const result = await response.json()
      console.log(result)
    } catch (err) {
      console.error(err)
    }
  }

  const get_data_table = async (id) => {
    console.log(id)
    try {
      const response = await fetch("/api/get_data_table?id=" + id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      if (result.success) {
        console.log("Daten erfolgreich geladen:", result.data)
        return result.data
      } else {
        // Spezifische Behandlung für "keine Daten gefunden"
        if (result.error === "No data found with this ID") {
          console.log(`Keine Daten für ID ${id} gefunden.`)
          return null // Kein Fehler, nur keine Daten
        } else {
          console.error("Fehler beim Laden der Daten:", result.error)
          return null
        }
      }
    } catch (err) {
      console.error("Network error:", err)
      return null
    }
  }

  const get_all_data_table = async () => {
    try {
      const response = await fetch("/api/get_all_data_table", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      if (result.success) {
        console.log("all data table" + result.data[0])
        setSampleData(result.data)
      } else {
        console.error("Fehler beim Laden der Daten:", result.error)
      }
    } catch (err) {
      console.error("Netzwerkfehler beim Laden aller Daten:", err)
    }
  }

  //fetch für DB befüllen (test)
  const post_test_data_table = async () => {
    try {
      const response = await fetch("/api/post_table", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          unternehmen: "test",
        }),
      })

      const result = await response.json()
      console.log(result)
    } catch (err) {
      console.error(err)
    }
  }

  const post_bewerbungsstatus = async (id, newStatus) => {
    console.log("Sending to API - ID: ", id, "Status:", newStatus)
    try {
      const response = await fetch("/api/post_bewerbungsstatus_table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          bewerbungsstatus: newStatus,
        }),
      })

      const result = await response.json()
      if (result.success) {
        console.log("Bewerbungsstatus erfolgreich aktualisiert")
        return true
      } else {
        console.error("Fehler beim Aktualisieren des Status:", result.error)
        return false
      }
    } catch (err) {
      console.error("Netzwerkfehler beim Aktualisieren des Status:", err)
      return false
    }
  }

  const handle_status_change = async (rowId, newStatus) => {
    try {
      // First update the database
      const success = await post_bewerbungsstatus(rowId, newStatus)
      if (success) {
        setSampleData((prevData) =>
          prevData.map((row) => ((row.customId || row.id) === rowId ? { ...row, bewerbungsstatus: newStatus } : row)),
        )
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Status: ", err)
    }
  }

  const handle_delete = async (id) => {
    try {
      const response = await fetch("/api/delete_row_table", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        // Remove the item from your data state
        setSampleData((prevData) => prevData.filter((item) => (item.customId || item.id) !== id))
      }
    } catch (error) {
      console.error("Error deleting record:", error)
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen p-10">
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner message={loadingMessage} />
        </div>
      ) : (
        <>
          <SearchForm onSearch={handle_search} />
          <PartnershipTable data={sampleData} onStatusChange={handle_status_change} onDelete={handle_delete} />
        </>
      )}

      <CompanyPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        data={popupData}
        onAddToTable={handleAddToTable}
        onDontAdd={handleDontAdd}
      />
    </div>
  )
}