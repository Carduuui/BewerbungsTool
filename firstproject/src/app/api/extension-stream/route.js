let clients = [];

export async function GET(){
    const stream = new ReadableStream({
        start(controller){
            const clientId = Date.now();

            const client = {
                id: clientId,
                controller
            };

            clients.push(client);
            console.log(`Client ${clientId} connected. Total clients: ${clients.length}`);

            // Send initial connection message
            const initialMessage = `data ${JSON.stringify({type: 'connected', clientId})}\n\n`;
            controller.enqueue(new TextEncoder().encode(initialMessage));

            // cleanup on disconnect
            const cleanup = () => {
                clients = clients.filter(c => c.id !== clientId);
                console.log(`Client ${clientId} disconnected. Total clients: ${clients.length}`); 
            };

            // handle cleanup when stream closes
            return cleanup;
        }
    });

    return new Response(stream, {
        headers:{
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-origin': '*',
        },
    });
}

// function to broadcast to all clients
export function broadcastToClients(data){
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encodedMessage = new TextEncoder().encode(message);

    clients.forEach(client =>{
        try{
            client.controller.enqueue(encodedMessage);
        }
        catch(err){
            console.log('error sending to client:', err);
            clients = clients.filter(c => c.id !== client.id);
        }
    });
}