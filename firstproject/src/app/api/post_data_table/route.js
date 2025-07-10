import Parse from "@/parseService";

//befüllung DB
export async function POST(req, res){
    try{
        const body = await req.json();

        const data_table = Parse.Object.extend('data_table');
        const data = new data_table();

        data.set("customId", body.id);
        data.set("unternehmen", body.unternehmen);
        data.set("partnerschule", body.partnerschule);
        data.set("unternehmensStandort", body.unternehmen_standort);
        data.set("partnerschuleStandort", body.partnerschule_standort);
        data.set("kernkompetenz", body.kernkompetenz);

        await data.save();

        return new Response(JSON.stringify({sucess:true}), {
            status: 200,
            headers:{'Content-type' : 'application/json'}
        })
    }
    catch(err){
        console.error(err); 

        return new Response(JSON.stringify({sucess:false, error: err.message}), {
            status: 500,
            headers:{'Content-type' : 'application/json'}
        })
    }
}