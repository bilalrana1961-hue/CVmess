import Link from "next/link";
import { ArrowRight, Check, ReceiptText, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav"><Logo /><div className="landing-links"><a href="#how-it-works">How it works</a></div><div className="landing-actions"><Link className="text-link" href="/login">Sign in</Link><Link className="button dark small" href="/signup">Join CVmess <ArrowRight size={15} /></Link></div></nav>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14} /> Built for Unthak Sappers</div><h1>Your meals, your orders, <em>your bill.</em></h1><p>Order from today’s menu, follow every confirmation, and know exactly what you owe before month-end.</p><div className="hero-actions"><Link className="button dark" href="/signup">Start ordering <ArrowRight size={17} /></Link><Link className="button light" href="/login">Member sign in</Link></div><div className="trust-row"><span><Check size={15} /> Transparent bills</span><span><Check size={15} /> Instant updates</span><span><Check size={15} /> No more phone calls</span></div></div>
        <div className="hero-product"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="product-window"><div className="product-greeting"><div><small>CVmess production portal</small><h2>One reliable place for every meal.</h2></div><span className="avatar">CV</span></div><div className="steps-grid"><article><ShieldCheck size={24} /><h3>Verified orders</h3><p>Every request and officer decision is recorded.</p></article><article><ReceiptText size={24} /><h3>Accurate bills</h3><p>Only confirmed meals are included in monthly totals.</p></article></div></div></div>
      </section>
      <section className="landing-strip" id="features"><div><strong>Clear</strong><span>itemised member bills</span></div><div><strong>Live</strong><span>order status updates</span></div><div><strong>Secure</strong><span>separate officer access</span></div></section>
      <section className="how-section" id="how-it-works"><div className="section-heading"><span>Simple from order to payment</span><h2>Mess management without the mess.</h2><p>Every action is recorded, visible, and reflected in the right person’s monthly bill.</p></div><div className="steps-grid"><article><span>01</span><div className="step-icon"><UtensilsCrossed size={23} /></div><h3>Choose your meal</h3><p>See today’s meals with prices and order cut-off times.</p></article><article><span>02</span><div className="step-icon"><ShieldCheck size={23} /></div><h3>Officer confirms</h3><p>The mess officer confirms or declines each order.</p></article><article><span>03</span><div className="step-icon"><ReceiptText size={23} /></div><h3>Bill updates itself</h3><p>Confirmed meals roll into your itemised monthly bill.</p></article></div><Link href="/officer/login" className="officer-preview-link">Mess officer sign in <ArrowRight size={17} /></Link></section>
      <footer className="landing-footer"><Logo /><p>Clear meals. Fair bills. A calmer mess.</p><span>CV 105 · {new Date().getFullYear()}</span></footer>
    </main>
  );
}
