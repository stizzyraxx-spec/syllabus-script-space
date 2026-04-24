Deno.serve(async (req) => {
  try {
    const { voice, text } = await req.json();

    if (!text) {
      return Response.json({ error: "Missing text" }, { status: 400 });
    }

    const safeText = text.slice(0, 300);
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice || "Matthew"}&text=${encodeURIComponent(safeText)}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error("StreamElements error:", res.status);
      return Response.json({ error: "TTS service error" }, { status: 502 });
    }

    const audioBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return Response.json({ audio: base64, contentType: "audio/mpeg" });
  } catch (error) {
    console.error("ttsProxy error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});