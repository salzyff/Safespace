import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, ImagePlus, LockKeyhole, ShieldCheck, Trash2, Users } from 'lucide-react'

const examples = [
  "Don't tell your parents we're talking. Download this other app so we can chat privately.",
  "If you were really my friend you'd send the picture. Everyone else already has.",
  "Hey, the group project is due Friday. Can you upload your slides when you get home?",
]

function Logo() {
  return <div className="brand"><span><ShieldCheck size={18}/></span>SafeSpace</div>
}

function Home({ onStart }) {
  return <main>
    <section className="hero shell">
      <div>
        <p className="eyebrow">A second opinion when a chat feels weird</p>
        <h1>Something online made you uncomfortable? You can check it here.</h1>
        <p className="lead">Paste a message or screenshot. SafeSpace looks for pressure, threats, grooming signs, scams and other red flags, then explains what it noticed in normal language.</p>
        <button className="primary" onClick={onStart}>Check a message <ArrowRight size={17}/></button>
        <p className="privacy"><LockKeyhole size={14}/> No account. No parent dashboard. No saved chat history in this MVP.</p>
      </div>
      <div className="example-card">
        <span className="tag">Example check</span>
        <blockquote>“Don’t tell anyone we’re talking. Move to this private app instead.”</blockquote>
        <div className="warn"><CircleAlert size={20}/><strong>This one has a few red flags.</strong></div>
        <p>The secrecy is the bit I’d pay attention to. Moving the chat somewhere private can also make it harder to get help later.</p>
      </div>
    </section>
    <section className="shell why">
      <p className="eyebrow">Why it works this way</p>
      <h2>The point isn’t to spy on kids. It’s to make asking for help easier.</h2>
      <div className="grid">
        <article><h3>Show what feels off</h3><p>You only share the part you want checked. You do not need to upload the whole conversation.</p></article>
        <article><h3>Get an explanation</h3><p>Instead of just saying “unsafe,” SafeSpace tells you what stood out and why it may matter.</p></article>
        <article><h3>Talk to a real person</h3><p>AI can notice patterns. Serious situations still need someone you trust in the real world.</p></article>
      </div>
    </section>
  </main>
}

function Checker({ onBack, onResult }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const pickImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('That file is not an image.')
    if (file.size > 5 * 1024 * 1024) return setError('That image is over 5 MB. Try a smaller one.')
    setError('')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    if ((!text.trim() && !image) || loading) return
    setLoading(true)
    setError('')
    try {
      let imageData = null
      if (image) imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(image)
      })
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), imageData, mimeType: image?.type || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not check that right now.')
      onResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="shell narrow page">
    <button className="back" onClick={onBack}><ArrowLeft size={16}/> Back</button>
    <p className="eyebrow">Private check</p>
    <h1>What do you want to check?</h1>
    <p className="muted">Paste only the part that matters. You can remove names, usernames, school names or anything else you do not want to share.</p>
    <div className="checker">
      <div className="labelrow"><label>Message or conversation</label><span>{text.length}/3500</span></div>
      <textarea maxLength={3500} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste the part you want a second opinion on..."/>
      <div className="examples">{examples.map((x,i)=><button key={i} onClick={()=>setText(x)}>Try example {i+1}</button>)}</div>
      <div className="or">or</div>
      {!preview ? <button className="upload" onClick={()=>fileRef.current?.click()}><ImagePlus/>Add a screenshot<span>PNG, JPG or WEBP · up to 5 MB</span></button> : <div className="preview"><img src={preview} alt="Selected upload"/><span>{image?.name}</span><button onClick={()=>{setImage(null);setPreview('')}}><Trash2 size={17}/></button></div>}
      <input hidden ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>pickImage(e.target.files?.[0])}/>
      {error && <div className="error"><CircleAlert size={16}/>{error}</div>}
      <button className="primary full" onClick={submit} disabled={loading || (!text.trim() && !image)}>{loading ? 'Checking this...' : <>Take a look <ArrowRight size={17}/></>}</button>
      <p className="micro"><LockKeyhole size={13}/> Only what you submit is sent for this check.</p>
    </div>
  </main>
}

function Result({ result, onAgain }) {
  const risk = (result?.risk || 'medium').toLowerCase()
  return <main className="shell narrow page">
    <button className="back" onClick={onAgain}><ArrowLeft size={16}/> Check something else</button>
    <section className={`result risk-${risk}`}>
      <span className="tag">{risk === 'critical' ? 'urgent' : `${risk} concern`}</span>
      <h1>{result.title || 'Here’s what stood out.'}</h1>
      <p>{result.summary}</p>
    </section>
    {!!result.category && <div className="category"><span>This looks most like</span><strong>{result.category}</strong></div>}
    <section className="section"><h2>What stood out</h2><p className="muted">These are clues, not proof. Context still matters.</p>
      <div className="signals">{(result.signals || []).map((s,i)=><article key={i}><span>{i+1}</span><div><h3>{s.title}</h3><p>{s.detail}</p></div></article>)}</div>
    </section>
    <section className="section"><h2>What I’d do next</h2><div className="steps">{(result.nextSteps || []).map((s,i)=><div key={i}><Check size={16}/><span>{s}</span></div>)}</div>
      <div className="trusted"><Users/><div><strong>You do not have to sort this out alone.</strong><p>A trusted person could be a parent, older relative, teacher, school counsellor, coach or another adult you know is safe.</p></div></div>
    </section>
    <button className="primary" onClick={onAgain}>Check another message</button>
    <p className="micro left">SafeSpace can get things wrong. It helps you notice patterns; it cannot prove another person’s intentions.</p>
  </main>
}

export default function App() {
  const [page, setPage] = useState('home')
  const [result, setResult] = useState(null)
  const start = () => { setPage('check'); window.scrollTo(0,0) }
  return <div>
    <header><div className="shell nav"><button className="logo-button" onClick={()=>setPage('home')}><Logo/></button><button className="navbtn" onClick={start}>Check a message</button></div></header>
    {page === 'home' && <Home onStart={start}/>} 
    {page === 'check' && <Checker onBack={()=>setPage('home')} onResult={data=>{setResult(data);setPage('result');window.scrollTo(0,0)}}/>}
    {page === 'result' && <Result result={result || {}} onAgain={start}/>} 
    <footer><div className="shell"><Logo/><p>Built for the Child Safety in AI hackathon.</p></div></footer>
  </div>
}
