'use client';

import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div ref={containerRef} className="bg-neutral-50 dark:bg-neutral-950">
      {/* Target Cursor */}
      <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} />

      {/* Background - clean with subtle pattern and accent colors */}
      <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-slate-950">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}></div>
        {/* Subtle colored accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/40 dark:bg-slate-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200/30 dark:bg-zinc-800/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <Logo className="text-neutral-900 dark:text-white" />
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/sign-in')}
            >
              Login
            </Button>
            <Button
              onClick={() => router.push('/sign-up')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Dot Shader Background */}
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20">
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
            <Badge variant="outline" className="px-4 py-2 bg-slate-100 dark:bg-slate-900 backdrop-blur-xl border-slate-300 dark:border-slate-700">
              <span className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span className="text-slate-700 dark:text-slate-300">AI-Powered Interview Coaching</span>
              </span>
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-6xl md:text-8xl font-bold text-slate-900 dark:text-white leading-tight"
          >
            Ace Your Next{' '}
            <br />
            <span className="relative inline-block">
              <span className="text-slate-900 dark:text-white">
                Job Interview
              </span>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-2 left-0 h-1 bg-slate-600 dark:bg-slate-400"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto"
          >
            Practice with AI-generated questions tailored to your resume.
            Get real-time voice feedback and{' '}
            <span className="text-slate-900 dark:text-white font-semibold">crush your interviews</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => router.push('/sign-up')}
                className="cursor-target group px-10 py-5 text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Practicing Free
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="cursor-target px-10 py-5 text-lg"
              >
                Learn More
              </Button>
            </motion.div>
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
                bg: 'bg-blue-500 dark:bg-blue-400',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                label: 'Voice Practice',
                bg: 'bg-purple-500 dark:bg-purple-400',
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )
              },
              {
                label: 'Instant Feedback',
                bg: 'bg-amber-500 dark:bg-amber-400',
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
              >
                <Card className="cursor-target text-center px-8 py-6 bg-white dark:bg-slate-900 backdrop-blur-xl border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <CardContent className="p-0">
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
                      className="mx-auto w-14 h-14 flex items-center justify-center mb-3"
                    >
                      <div className={`${feature.bg} rounded-xl p-2 text-white dark:text-slate-900`}>
                        {feature.icon}
                      </div>
                    </motion.div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{feature.label}</div>
                  </CardContent>
                </Card>
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
            className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
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
                bg: 'bg-blue-500 dark:bg-blue-400'
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ),
                title: 'Real Voice Practice',
                description: 'Practice speaking your answers out loud with natural AI voice interactions',
                bg: 'bg-purple-500 dark:bg-purple-400'
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                title: 'Detailed Feedback',
                description: 'Get AI-powered analysis with strengths, weaknesses, and specific improvement tips',
                bg: 'bg-emerald-500 dark:bg-emerald-400'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cursor-target group h-full"
              >
                <Card className="h-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all">
                  <CardContent className="p-8 flex flex-col h-full">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}
                    >
                      <svg className="w-8 h-8 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {feature.icon}
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed grow">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-32 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Get started in 3 simple steps</p>
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
                direction: 'left',
                bg: 'bg-blue-500 dark:bg-blue-400'
              },
              {
                step: '02',
                title: 'Paste Job Description',
                description: "Add the job description you're targeting. We'll generate questions that match the role perfectly.",
                icon: (
                  <>
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <circle cx="12" cy="12" r="6" strokeWidth={2} />
                    <circle cx="12" cy="12" r="2" strokeWidth={2} fill="currentColor" />
                  </>
                ),
                direction: 'right',
                bg: 'bg-purple-500 dark:bg-purple-400'
              },
              {
                step: '03',
                title: 'Practice & Improve',
                description: 'Answer questions with your voice, get instant feedback, and track your progress over time.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ),
                direction: 'left',
                bg: 'bg-emerald-500 dark:bg-emerald-400'
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
                  >
                    <Card className="cursor-target w-48 h-48 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all">
                      <CardContent className="w-full h-full flex items-center justify-center p-0">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-24 h-24 ${item.bg} rounded-2xl flex items-center justify-center`}
                        >
                          <svg className="w-12 h-12 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {item.icon}
                          </svg>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <div className="flex-1">
                  <Card className="cursor-target bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all">
                    <CardContent className="p-8">
                      <div className="text-6xl font-bold text-slate-200 dark:text-slate-800 mb-4">{item.step}</div>
                      <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">{item.title}</h3>
                      <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
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
      <section className="relative z-10 bg-white dark:bg-slate-900">
        <ContainerScroll
          titleComponent={
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white">
                Experience Real Interview Scenarios
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Practice with AI-powered interviews that adapt to your resume and target role
              </p>
            </div>
          }
        >
          <div className="h-full w-full bg-slate-100 dark:bg-slate-900 p-8 overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            {/* Mock Interview Interface */}
            <div className="space-y-6">
              {/* Question Section */}
              <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Question 3 of 5</p>
                      <p className="text-slate-900 dark:text-white font-semibold">Behavioral - Leadership</p>
                    </div>
                  </div>
                  <p className="text-xl text-slate-900 dark:text-white leading-relaxed">
                    &quot;Tell me about a time when you had to lead a team through a difficult project deadline. How did you handle the pressure and ensure success?&quot;
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium">Your Answer</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900">
                        🎤 Recording...
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                        ⏸️ Pause
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-950 rounded-lg p-4 min-h-[120px] border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      &quot;In my previous role as a senior developer, we faced a critical product launch with only two weeks remaining...&quot;
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <p className="text-slate-900 dark:text-white font-semibold">AI Analysis</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-green-600 dark:text-green-400">✓</div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Strong STAR method structure</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-green-600 dark:text-green-400">✓</div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Clear demonstration of leadership</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-yellow-600 dark:text-yellow-400">⚠</div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">Consider adding more specific metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Badge className="bg-zinc-600 dark:bg-zinc-400 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 px-8 py-3 text-lg">
                  Score: 8.5/10
                </Badge>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6 bg-slate-50 dark:bg-slate-900/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >
          <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            <CardContent className="p-12 md:p-20">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-8">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                Join thousands of job seekers who improved their interview skills with Reherse
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => router.push('/sign-up')}
                  className="cursor-target px-12 py-6 text-xl bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-400 dark:hover:bg-zinc-300 text-white dark:text-zinc-900"
                >
                  Start Practicing For Free →
                </Button>
              </motion.div>
              <p className="text-slate-500 dark:text-slate-400 mt-6">No credit card required • Get started in 2 minutes</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Reherse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
