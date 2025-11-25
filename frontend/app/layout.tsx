import type { Metadata } from "next";
import { Space_Grotesk, Inknut_Antiqua } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import Analytics from '@/components/Analytics';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inknutAntiqua = Inknut_Antiqua({
  variable: "--font-inknut-antiqua",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reherse - AI Voice Interview Coach",
  description: "Practice interviews with AI-powered voice coaching and detailed feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#8b5cf6',
          colorBackground: '#0f172a',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: '#d1d5db',
          colorNeutral: '#ffffff',
          borderRadius: '0.75rem',
          fontFamily: `${inknutAntiqua.variable}, system-ui, serif`,
        },
        elements: {
          formButtonPrimary:
            'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-105',
          card: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
          socialButtonsBlockButton:
            'bg-white/5 border border-white/10 text-white hover:bg-white/10 transition',
          socialButtonsBlockButtonText: 'text-white',
          formFieldInput:
            'bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500',
          formFieldLabel: 'text-gray-200',
          footerActionLink: 'text-blue-400 hover:text-blue-300',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
          formFieldInputShowPasswordButton: 'text-gray-300 hover:text-white',
          dividerLine: 'bg-white/20',
          dividerText: 'text-gray-300',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${spaceGrotesk.variable} ${inknutAntiqua.variable} antialiased`}
        >
          <Analytics />
          <ThemeProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
