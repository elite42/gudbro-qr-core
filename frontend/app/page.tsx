export default function Home() {
  const S = {
    QR_ENGINE: process.env.NEXT_PUBLIC_QR_ENGINE_URL || "http://localhost:3001",
    ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS_URL || "http://localhost:3002",
    CUSTOMIZATION: process.env.NEXT_PUBLIC_CUSTOMIZATION_URL || "http://localhost:3003",
    BULK: process.env.NEXT_PUBLIC_BULK_URL || "http://localhost:3004",
    DYNAMIC: process.env.NEXT_PUBLIC_DYNAMIC_URL || "http://localhost:3005",
    API: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006",
    HUB: process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:3009",
    I18N: process.env.NEXT_PUBLIC_I18N_URL || "http://localhost:3010",
    MENU: process.env.NEXT_PUBLIC_MENU_URL || "http://localhost:3011",
    FILTERS: process.env.NEXT_PUBLIC_FILTERS_URL || "http://localhost:3012",
  };

  const cards = [
    { name: "QR Engine", url: S.QR_ENGINE },
    { name: "Analytics", url: S.ANALYTICS },
    { name: "Customization", url: S.CUSTOMIZATION },
    { name: "Bulk Ops", url: S.BULK },
    { name: "Dynamic QR", url: S.DYNAMIC },
    { name: "API Gateway", url: S.API },
    { name: "Hub", url: S.HUB },
    { name: "i18n", url: S.I18N },
    { name: "Menu", url: S.MENU },
    { name: "Filters", url: S.FILTERS },
  ];

  return (
    <main style={{minHeight:"100vh", padding:"2rem", background:"#0b0b0b", color:"#fff", fontFamily:"ui-sans-serif,system-ui"}}>
      <h1 style={{fontSize:"2rem", fontWeight:800, marginBottom:"0.25rem"}}>QR Platform — Dev Dashboard</h1>
      <p style={{opacity:0.8, marginBottom:"2rem"}}>Ambiente: {process.env.NODE_ENV || "development"}</p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1rem"}}>
        {cards.map(c => (
          <a key={c.name} href={c.url} style={{
            display:"block", padding:"1rem", borderRadius:"14px",
            background:"#151515", border:"1px solid #262626", textDecoration:"none", color:"#fff"
          }}>
            <div style={{fontWeight:700, marginBottom:"0.5rem"}}>{c.name}</div>
            <div style={{fontSize:"0.85rem", opacity:0.9, wordBreak:"break-all"}}>{c.url}</div>
            <div style={{marginTop:"0.75rem", display:"flex", gap:"0.5rem"}}>
              <a href={c.url + "/health"} style={{fontSize:"0.85rem", color:"#9ae6b4"}}>health</a>
              <span style={{opacity:0.5}}>•</span>
              <a href={c.url + "/"} style={{fontSize:"0.85rem", color:"#90cdf4"}}>root</a>
            </div>
          </a>
        ))}
      </div>
      <p style={{opacity:0.6, marginTop:"2rem", fontSize:"0.85rem"}}>
        Variabili lette a build-time (NEXT_PUBLIC_*). Se cambi compose, ricostruisci il container frontend.
      </p>
    </main>
  );
}
