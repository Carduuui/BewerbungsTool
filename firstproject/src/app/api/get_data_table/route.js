import Parse from "@/parseService";

//befüllung DB
export async function GET(req){
    try{
        const {searchParams} = new URL(req.url);
        const id = searchParams.get('id');

        if(!id){
            return new Response(JSON.stringify({
                success: false,
                error: "ID parameter is required"
            }),{
                status: 400,
                headers: {'Content-Type' : 'application/json'}
            } )
        }

        const query = new Parse.Query("data_table");
        query.equalTo("customId", parseInt(id));
        
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

        const data = {
            customId: result.get("customId"),
            unternehmen: result.get("unternehmen"),
            partnerschule: result.get("partnerschule"),
            unternehmensStandort: result.get("unternehmensStandort"),
            partnerschuleStandort: result.get("partnerschuleStandort"),
            kernkompetenz: result.get("kernkompetenz"),
            bewerbungsstatus: result.get("bewerbungsstatus") || "Option",
        }

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