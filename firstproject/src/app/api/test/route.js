import Parse from "@/parseService";

//testen Verbindung zu back4app
export async function GET(request) {
    try {
      const query = new Parse.Query('_User');
      const result = await query.count();
  
      return new Response(JSON.stringify({
        success: true,
        userCount: result
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }