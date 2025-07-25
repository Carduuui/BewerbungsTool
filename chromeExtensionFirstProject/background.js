chrome.action.onClicked.addListener(async (tab) => {
    console.log('Button wurde geklickt!');
    try{
        const response = await fetch('http://localhost:3000/api/url_chrome_extension',{
            method: "POST",
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: tab.url
            })
        });
    
        if(response.ok){
            const result = await response.json();
            console.log('Next.js Response:', result);
        }
        else{
            throw new Error(`HTTP ${response.status}`);
        }
    }
    catch(err){
        console.error("Fehler beim Senden:" + + err);
    }
  });