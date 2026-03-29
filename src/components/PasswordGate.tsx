import React, { useState, useEffect } from "react";

const HASH = "c22ad879c45d1f7399bb9c859838d7c43ee0dc875fbc256666fcc437088c32bf";
const KEY = "verde-auth";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(() => sessionStorage.getItem(KEY) === "1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  if (ok) return <>{children}</>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const h = await sha256(pw);
    if (h === HASH) {
      sessionStorage.setItem(KEY, "1");
      setOk(true);
    } else {
      setErr(true);
      setPw("");
    }
  }

  return (
    <div className={`pw-gate ${vis ? "pw-gate--vis" : ""}`}>
      <form className="pw-card" onSubmit={submit}>
        <span className="pw-brand">VERDE ULAŞLI</span>
        <div className="pw-line" />
        <p className="pw-hint">Private access</p>
        <input
          className="pw-input"
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          autoFocus
        />
        {err && <span className="pw-err">Incorrect password</span>}
        <button className="pw-btn" type="submit">Enter</button>
      </form>
    </div>
  );
}
