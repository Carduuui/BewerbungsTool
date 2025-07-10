import Parse from "@/parseService";

// Delete record from database
export async function DELETE(req, res) {
    try {
        const body = await req.json();
        const { id } = body;

        console.log("API received delete request for ID:", id);

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: "ID is required"
            }), {
                status: 400,
                headers: { 'Content-type': 'application/json' }
            });
        }

        const data_table = Parse.Object.extend('data_table');
        const query = new Parse.Query(data_table);

        // First try to find by customId
        query.equalTo("customId", parseInt(id));
        let record = await query.first();

        // If not found, try by id field
        if (!record) {
            console.log("No record found with customId, trying with id field");
            const query2 = new Parse.Query(data_table);
            query2.equalTo("id", parseInt(id));
            record = await query2.first();
        }

        if (!record) {
            console.log("Record not found with ID:", id);
            return new Response(JSON.stringify({
                success: false,
                error: "Record not found"
            }), {
                status: 404,
                headers: { 'Content-type': 'application/json' }
            });
        }

        // Delete the record
        await record.destroy();

        console.log("Record deleted successfully");
        return new Response(JSON.stringify({
            success: true,
            message: "Record deleted successfully"
        }), {
            status: 200,
            headers: { 'Content-type': 'application/json' }
        });

    } catch (err) {
        console.error("Error deleting record:", err);
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), {
            status: 500,
            headers: { 'Content-type': 'application/json' }
        });
    }
}