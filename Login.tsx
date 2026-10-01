import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { HeartPulse } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseReady } from "@/lib/supabase";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-3 focus:ring-teal-500/15";

export default function Login() {
  const { session, signIn, signUp } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  useEffect(() => {
    if (session) navigate("/");
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (mode === "signup") {
      if (password.length < 8) return setMsg({ type: "error", text: "비밀번호는 8자 이상이어야 합니다." });
      if (!agree) return setMsg({ type: "error", text: "개인정보 수집·이용에 동의해 주세요." });
    }
    setBusy(true);
    if (mode === "login") {
      const err = await signIn(email.trim(), password);
      if (err) setMsg({ type: "error", text: err });
    } else {
      const r = await signUp(email.trim(), password, name.trim());
      if (r.error) setMsg({ type: "error", text: r.error });
      else if (r.needsConfirm) {
        setMode("login");
        setMsg({ type: "ok", text: "인증 메일을 보냈습니다. 메일의 링크를 눌러 인증한 뒤 로그인해 주세요." });
      }
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 flex items-center justify-center gap-1.5 text-teal-700">
          <HeartPulse className="h-5 w-5" />
          <span className="font-display text-xl font-extrabold">Hi <span className="text-emerald-600">Care</span></span>
        </Link>

        {!supabaseReady && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Supabase 환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.
          </p>
        )}

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-bold">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setMsg(null); }}
              className={`rounded-lg py-2 cursor-pointer ${mode === m ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input className={inputCls} placeholder="이름(닉네임)" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} required />
          )}
          <input className={inputCls} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input className={inputCls} type="password" placeholder="비밀번호 (8자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          {mode === "signup" && (
            <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
              <span>[필수] 서비스 이용을 위한 개인정보(이메일·이름) 및 이용 활동 기록 수집·이용에 동의합니다.</span>
            </label>
          )}
          {msg && <p className={`text-xs font-semibold ${msg.type === "error" ? "text-rose-600" : "text-teal-700"}`}>{msg.text}</p>}
          <button disabled={busy || !supabaseReady} className="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50 cursor-pointer">
            {busy ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
