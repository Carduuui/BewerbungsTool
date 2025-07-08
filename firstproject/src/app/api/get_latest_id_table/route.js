import Parse from "../../../../parseService";

//befüllung DB
export async function GET(req){
    try{
        const query = new Parse.Query("data_table");
        query.descending("customId");
        query.limit(1);
        
        const result = await query.first();

        if(!result){
            return new Response(JSON.stringify({
                success: false,
                error: "No data found with this ID"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = result.get("customId");

        return new Response(JSON.stringify({
            success: true,
            data: data
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    catch(err){
        console.error("Error fetching data by ID:", err);

        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}