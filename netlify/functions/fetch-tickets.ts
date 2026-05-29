export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { eogRequestCode, eventRequestCode, apikey, username, password } = body;

    if (!eogRequestCode || !eventRequestCode || !apikey || !username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Saknar nödvändiga parametrar i anropet" }),
      };
    }

    const url = `https://api.tickster.com/sv/api/0.4/crm/${eogRequestCode}/event/${eventRequestCode}/ticketcodes?key=${apikey}`;

    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    console.log(`Fetching from Tickster: ${url}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
        "User-Agent": "TicksterDashboard/1.0",
      },
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`Tickster API error (${response.status}):`, responseText);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Tickster API svarade med felkod ${response.status}`,
          details: responseText,
        }),
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error("Failed to parse Tickster response as JSON:", parseError, responseText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Tickster returnerade ogiltigt JSON-svar",
          details: responseText,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internt serverfel vid anrop till Tickster",
        details: error.message,
      }),
    };
  }
};
