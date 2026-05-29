export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { eogRequestCode, apikey } = body;

    if (!eogRequestCode || !apikey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Saknar arrangörs ID (eogRequestCode) eller API-nyckel",
        }),
      };
    }

    const url = `https://event.api.tickster.com/api/v1.0/sv/organizers/${eogRequestCode}/events?api_key=${apikey}`;

    console.log(`Fetching events from Tickster: ${url}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "TicksterDashboard/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tickster Event API error (${response.status}):`, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: `Tickster Event API svarade med felkod ${response.status}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();
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
