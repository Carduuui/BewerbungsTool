import { requestToBodyStream } from "next/dist/server/body-streams";
import Parse from "../../../../parseService";

//befüllung DB
export async function POST(req, res){
    try{
        const body = await req.json();
        const {id, bewerbungsstatus} = body;

        if (!id || !bewerbungsstatus) {
            return new Response(JSON.stringify({
                success: false, 
                error: "ID and bewerbungsstatus are required"
            }), {
                status: 400,
                headers: {'Content-type': 'application/json'}
            });
        }

        const data_table = Parse.Object.extend('data_table');
        const query = new Parse.Query(data_table);

        query.equalTo("customId", parseInt(id));

        const record = await query.first();

        if (!record) {
            return new Response(JSON.stringify({
                success: false, 
                error: "Record not found"
            }), {
                status: 404,
                headers: {'Content-type': 'application/json'}
            });
        }

        // Update the bewerbungsstatus field
        record.set("bewerbungsstatus", bewerbungsstatus);
        await record.save();

        return new Response(JSON.stringify({
            success: true,
            message: "Bewerbungsstatus updated successfully"
        }), {
            status: 200,
            headers: {'Content-type': 'application/json'}
        });
    }
    catch(err){
        console.error("Error updating bewerbungsstatus:", err);

        return new Response(JSON.stringify({
            success: false, 
            error: err.message
        }), {
            status: 500,
            headers: {'Content-type': 'application/json'}
        });
    }
}