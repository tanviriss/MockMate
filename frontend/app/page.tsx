'use client';

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Logo from '@/components/Logo';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { DotScreenShader } from '@/components/ui/dot-shader-background';
import AnimatedShaderHero from '@/components/ui/animated-shader-hero';
import TargetCursor from '@/components/ui/TargetCursor';

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="bg-slate-950">
      {/* Target Cursor */}
      <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />

      {/* Background for non-hero sections */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10 shadow-lg shadow-black/5"
      >
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <Logo className="text-white" />
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sign-in')}
              className="cursor-target px-6 py-2 text-white hover:text-blue-400 transition font-medium"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sign-up')}
              className="cursor-target px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Dot Shader Background */}
        <div className="absolute inset-0 z-0">
          <DotScreenShader />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-5xl space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-block"
          >
            <span className="px-4 py-2 bg-white/5 border border-white/20 rounded-full text-blue-300 text-sm font-semibold backdrop-blur-xl shadow-lg shadow-blue-500/10">
              🚀 AI-Powered Interview Coaching
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-6xl md:text-8xl font-bold text-white leading-tight"
          >
            Ace Your Next{' '}
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Job Interview
              </span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
          >
            Practice with AI-generated questions tailored to your resume.
            Get real-time voice feedback and{' '}
            <span className="text-purple-400 font-semibold">crush your interviews</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sign-up')}
              className="cursor-target group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Practicing Free
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cursor-target relative px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/30 rounded-xl font-bold text-lg transition shadow-lg shadow-white/5 overflow-hidden group"
            >
              <span className="relative z-10">Learn More</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </motion.button>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-wrap justify-center gap-8 pt-12"
          >
            {[
              {
                label: 'AI-Powered Questions',
                gradient: 'from-blue-400 to-cyan-400',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                label: 'Voice Practice',
                gradient: 'from-purple-400 to-pink-400',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )
              },
              {
                label: 'Instant Feedback',
                gradient: 'from-yellow-400 to-orange-400',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative text-center px-8 py-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg shadow-black/10 overflow-hidden group"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                  className="relative mx-auto w-14 h-14 flex items-center justify-center mb-3"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.3
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-full blur-xl`}
                  />
                  <div className={`relative bg-gradient-to-br ${feature.gradient} rounded-xl p-2 text-white`}>
                    {feature.icon}
                  </div>
                </motion.div>

                <div className="relative text-sm font-semibold text-gray-200">{feature.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-10 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powered by cutting-edge AI to give you the edge in your job search
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                ),
                title: 'Smart Resume Analysis',
                description: 'AI extracts your skills, experience, and strengths to generate personalized interview questions',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ),
                title: 'Real Voice Practice',
                description: 'Practice speaking your answers out loud with natural AI voice interactions',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                title: 'Detailed Feedback',
                description: 'Get AI-powered analysis with strengths, weaknesses, and specific improvement tips',
                gradient: 'from-pink-500 to-red-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cursor-target group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative h-full p-8 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl hover:border-white/30 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden flex flex-col">
                  {/* Glass shine effect */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {feature.icon}
                    </svg>
                  </motion.div>
                  <h3 className="relative text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="relative text-gray-300 text-lg leading-relaxed flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-400">Get started in 3 simple steps</p>
          </motion.div>

          <div className="space-y-24">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Our AI analyzes your resume to understand your unique background, skills, and experience.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                ),
                gradient: 'from-blue-500 to-cyan-500',
                direction: 'left'
              },
              {
                step: '02',
                title: 'Paste Job Description',
                description: 'Add the job description you&apos;re targeting. We&apos;ll generate questions that match the role perfectly.',
                icon: (
                  <>
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <circle cx="12" cy="12" r="6" strokeWidth={2} />
                    <circle cx="12" cy="12" r="2" strokeWidth={2} fill="currentColor" />
                  </>
                ),
                gradient: 'from-purple-500 to-pink-500',
                direction: 'right'
              },
              {
                step: '03',
                title: 'Practice & Improve',
                description: 'Answer questions with your voice, get instant feedback, and track your progress over time.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ),
                gradient: 'from-pink-500 to-red-500',
                direction: 'left'
              }
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: item.direction === 'left' ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  item.direction === 'right' ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="cursor-target relative w-48 h-48 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`relative w-24 h-24 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="cursor-target relative p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl shadow-black/10 overflow-hidden group"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-6xl font-bold text-purple-400/40 mb-4">{item.step}</div>
                    <h3 className="relative text-4xl font-bold text-white mb-6">{item.title}</h3>
                    <p className="relative text-xl text-gray-300 leading-relaxed">{item.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated Shader Hero Section */}
        <div className="mt-32">
          <AnimatedShaderHero
            trustBadge={{
              text: "🎯 AI-Powered Interview Practice",
              icons: ["✨"]
            }}
            headline={{
              line1: "Master Your",
              line2: "Interview Skills"
            }}
            subtitle="Get personalized AI feedback on your answers in real-time. Practice with confidence and land your dream job."
            buttons={{
              primary: {
                text: "Start Practicing Now",
                onClick: () => router.push('/sign-up')
              },
              secondary: {
                text: "See How It Works",
                onClick: () => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
          />
        </div>
      </section>

      {/* Scroll Animation Showcase */}
      <section className="relative z-10">
        <ContainerScroll
          titleComponent={
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold text-white">
                Experience Real{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Interview Scenarios
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Practice with AI-powered interviews that adapt to your resume and target role
              </p>
            </div>
          }
        >
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-auto">
            {/* Mock Interview Interface */}
            <div className="space-y-6">
              {/* Question Section */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Question 3 of 5</p>
                    <p className="text-white font-semibold">Behavioral - Leadership</p>
                  </div>
                </div>
                <p className="text-xl text-white leading-relaxed">
                  &quot;Tell me about a time when you had to lead a team through a difficult project deadline. How did you handle the pressure and ensure success?&quot;
                </p>
              </div>

              {/* Answer Section */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-300 font-medium">Your Answer</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm">
                      🎤 Recording...
                    </button>
                    <button className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                      ⏸️ Pause
                    </button>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 min-h-[120px]">
                  <p className="text-gray-300 leading-relaxed">
                    &quot;In my previous role as a senior developer, we faced a critical product launch with only two weeks remaining...&quot;
                  </p>
                </div>
              </div>

              {/* AI Feedback Section */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md border border-blue-400/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🤖</span>
                  <p className="text-white font-semibold">AI Analysis</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-green-400">✓</div>
                    <p className="text-gray-300 text-sm">Strong STAR method structure</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-green-400">✓</div>
                    <p className="text-gray-300 text-sm">Clear demonstration of leadership</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-400">⚠</div>
                    <p className="text-gray-300 text-sm">Consider adding more specific metrics</p>
                  </div>
                </div>
              </div>

              {/* Score Badge */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-8 py-3">
                  <p className="text-white font-bold text-lg">Score: 8.5/10</p>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 md:p-20 shadow-2xl shadow-black/20 overflow-hidden">
            {/* Glass shine effects */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5" />

            <h2 className="relative text-5xl md:text-6xl font-bold text-white mb-8">
              Ready to Land Your{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dream Job?
              </span>
            </h2>
            <p className="relative text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of job seekers who improved their interview skills with Reherse
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sign-up')}
              className="cursor-target relative px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
            >
              Start Practicing For Free →
            </motion.button>
            <p className="relative text-gray-400 mt-6">No credit card required • Get started in 2 minutes</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 Reherse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
