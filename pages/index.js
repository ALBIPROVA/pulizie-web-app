
import { useState, useEffect } from "react";
import * as ical from 'ical.js';

const icalUrls = [
  "https://www.airbnb.it/calendar/ical/1302786185047864710.ics?s=533ac820c70eef634d012ea928c94cfd",
  "https://ical.booking.com/v1/export?t=3361b68f-6696-46bd-9f0a-0e7f842ce06b",
];

export default function Home() {
  const [pulizie, setPulizie] = useState([]);

  useEffect(() => {
    const fetchICalData = async () => {
      const today = new Date().toISOString().split("T")[0];
      let allPulizie = [];

      for (const url of icalUrls) {
        try {
          const res = await fetch(url);
          const text = await res.text();
          const jcalData = ical.parse(text);
          const comp = new ical.Component(jcalData);
          const events = comp.getAllSubcomponents("vevent");

          events.forEach((event, index) => {
            const vevent = new ical.Event(event);
            const checkoutDate = vevent.endDate.toJSDate();
            const checkoutStr = checkoutDate.toISOString().split("T")[0];

            if (checkoutStr === today) {
              allPulizie.push({
                id: `${url}-${index}`,
                apartment: vevent.summary,
                checkout: checkoutDate,
                status: "Da fare",
              });
            }
          });
        } catch (err) {
          console.error("Errore nel parsing iCal:", err);
        }
      }

      setPulizie(allPulizie);
    };

    fetchICalData();
  }, []);

  const toggleStatus = (id) => {
    setPulizie((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Fatta" ? "Da fare" : "Fatta" }
          : item
      )
    );
  };

  const oggi = new Date().toISOString().split("T")[0];

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Pulizie di oggi ({oggi})</h1>
      <div style={{ marginTop: '1rem' }}>
        {pulizie.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '18px' }}>{item.apartment}</h2>
            <p>Check-out: {new Date(item.checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>Stato: {item.status}</p>
            <button onClick={() => toggleStatus(item.id)} style={{ marginTop: '0.5rem' }}>
              Segna come {item.status === "Fatta" ? "Da fare" : "Fatta"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
