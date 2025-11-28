import { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Interview Preparation Guides | Reherse',
  description: 'Expert guides on behavioral interviews, technical prep, resume optimization, and interview strategies to help you ace your next job interview.',
  keywords: [
    'interview preparation',
    'interview guides',
    'behavioral interview tips',
    'technical interview prep',
    'resume tips',
    'interview strategies',
    'job interview help',
    'career advice'
  ],
  openGraph: {
    title: 'Interview Preparation Guides | Reherse',
    description: 'Expert guides to help you ace your next job interview',
    type: 'website',
  },
  alternates: {
    canonical: '/guides',
  },
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/40 dark:bg-slate-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-200/30 dark:bg-zinc-800/15 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              Free Resources
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Interview Preparation Guides
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Expert strategies, tips, and techniques to help you ace behavioral interviews,
              technical assessments, and land your dream job.
            </p>
            <Link
              href="/"
              className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </section>

        {/* Guides Grid */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {guides.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-600 dark:text-slate-400 text-xl">
                  Guides coming soon! Check back later.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {guides.map((guide) => (
                  <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                    <Card className="group h-full hover:border-slate-400 dark:hover:border-slate-600 transition-all hover:scale-105 cursor-pointer">
                      <CardContent className="p-6">
                        <Badge
                          variant="outline"
                          className="mb-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
                        >
                          {guide.category}
                        </Badge>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                          {guide.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                          {guide.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                          <span>{guide.readTime}</span>
                          <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform flex items-center gap-1">
                            Read guide
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Ready to Practice?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                  Turn these strategies into skills with Reherse's AI-powered interview coach
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Start Free Practice →
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
