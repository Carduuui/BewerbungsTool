import Parse from "@/parseService";

//befüllung DB
export async function GET(req){
    try{
        const query = new Parse.Query("data_table");
        
        const result = await query.find();

        const data = result.map(item =>({
            customId: item.get("customId"),
            unternehmen: item.get("unternehmen"),
            partnerschule: item.get("partnerschule"),
            unternehmensStandort: item.get("unternehmensStandort"),
            partnerschuleStandort: item.get("partnerschuleStandort"),
            kernkompetenz: item.get("kernkompetenz"),
            bewerbungsstatus: item.get("bewerbungsstatus") || "Option",
        }));

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