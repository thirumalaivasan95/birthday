import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-ink-900/80 backdrop-blur">
      <div className="container-romance flex flex-col items-center gap-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl"
        >
          <span className="font-script text-rose-300">Always & Forever</span>
        </motion.div>
        <p className="max-w-xl text-sm leading-relaxed text-cream-100/70">
          Every pixel of this little corner of the internet is a love letter.
          Thank you for being my home, my heartbeat, and now — the mother of
          our miracle.
        </p>
        <div className="text-[11px] uppercase tracking-[0.4em] text-cream-100/40">
          Made with <span className="text-rose-400">♥ by your lovely husband ❣️ sriram ❣️</span> · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  )
}
