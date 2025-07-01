import Parse from "parse/node";

const PARSE_APPLICATION_ID = process.env.APPLICATION_ID;
const PARSE_JAVASCRIPT_KEY = process.env.JAVASCRIPT_KEY;
const PARSE_HOST_URL = "https://parseapi.back4app.com/";

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default Parse;