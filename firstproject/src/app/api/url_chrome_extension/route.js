import { broadcastToClients } from "../extension-stream/route";

export async function POST(request){
    try{
        const data = await request.json();

        //soft an alle verbundenen Next.js clients senden
        broadcastToClients({
            type: 'new-url',
            url: data.url,
            timestamp: new Date().toISOString()
        })

        return Response.json({
            success: true,
            message: `URL ${data.url} erfolgreich empfangen`,
            data: data
        },{
            headers:{
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }
    catch(err){
        console.error(err);
        return Response.json(
            {success: false, error: 'Server error'},
            {status: 500}
        )
    }
}

export async function OPTIONS(){
    return new Response(null, {
        status: 200,
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}