import Link from "next/link";
import { ArrowRight, BellRing, Check, ChevronRight, ReceiptText, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Logo />
        <div className="landing-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a></div>
        <div className="landing-actions"><Link className="text-link" href="/login">Sign in</Link><Link className="button dark small" href="/signup">Join CVmess <ArrowRight size={15} /></Link></div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> Built for the CV 105 community</div>
          <h1>Your meals, your orders, <em>your bill.</em></h1>
          <p>Order from today’s menu, follow every confirmation, and know exactly what you owe—before month-end.</p>
          <div className="hero-actions"><Link className="button dark" href="/signup">Start ordering <ArrowRight size={17} /></Link><Link className="button light" href="/dashboard">View member demo</Link></div>
          <div className="trust-row"><span><Check size={15} /> Transparent bills</span><span><Check size={15} /> Instant updates</span><span><Check size={15} /> No more phone calls</span></div>
        </div>
        <div className="hero-product">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="product-window">
            <div className="product-top"><span>Sunday, 16 August</span><span className="live-dot"><i /> Ordering open</span></div>
            <div className="product-greeting"><div><small>Good afternoon, Hamza</small><h2>What would you like today?</h2></div><span className="avatar">HA</span></div>
            <div className="mini-meals">
              <div className="mini-meal"><span className="food-symbol breakfast">☀</span><div><small>Breakfast</small><strong>Aloo Paratha & Chai</strong><p>Order by 09:00</p></div><b>Rs. 180</b><button><Check size={14} /> Ordered</button></div>
              <div className="mini-meal featured"><span className="food-symbol lunch"><UtensilsCrossed size={20} /></span><div><small>Lunch</small><strong>Chicken Biryani</strong><p>Order by 12:30</p></div><b>Rs. 320</b><button>+ Order</button></div>
              <div className="mini-meal"><span className="food-symbol dinner">☾</span><div><small>Dinner</small><strong>Daal Mash & Chapati</strong><p>Order by 18:30</p></div><b>Rs. 250</b><button>+ Order</button></div>
            </div>
            <div className="mini-bill"><div><span><ReceiptText size={17} /> August bill</span><small>17 confirmed meals</small></div><strong>Rs. 4,820</strong></div>
          </div>
          <div className="floating-note"><span><BellRing size={18} /></span><div><strong>Order confirmed</strong><small>Your Chicken Biryani is confirmed.</small></div></div>
        </div>
      </section>

      <section className="landing-strip" id="features">
        <div><strong>100+</strong><span>members, one clear system</span></div><div><strong>3</strong><span>daily meal windows</span></div><div><strong>0</strong><span>manual bill calculations</span></div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="section-heading"><span>Simple from order to payment</span><h2>Mess management without the mess.</h2><p>Every action is recorded, visible, and reflected in the right person’s monthly bill.</p></div>
        <div className="steps-grid">
          <article><span>01</span><div className="step-icon"><UtensilsCrossed size={23} /></div><h3>Choose your meal</h3><p>See today’s breakfast, lunch, and dinner with prices and order cut-off times.</p></article>
          <article><span>02</span><div className="step-icon"><ShieldCheck size={23} /></div><h3>Officer confirms</h3><p>The mess officer gets a clear queue and confirms or declines each order.</p></article>
          <article><span>03</span><div className="step-icon"><ReceiptText size={23} /></div><h3>Bill updates itself</h3><p>Confirmed meals roll into your itemised monthly bill—no surprises, no back-checking.</p></article>
        </div>
        <Link href="/officer" className="officer-preview-link">Explore the mess officer dashboard <ChevronRight size={17} /></Link>
      </section>

      <footer className="landing-footer"><Logo /><p>Clear meals. Fair bills. A calmer mess.</p><span>CV 105 · {new Date().getFullYear()}</span></footer>
    </main>
  );
}
