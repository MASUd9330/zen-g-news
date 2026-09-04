import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import { createClient } from '@/lib/supabase/server';

export type PolicyPageType = 'about' | 'editorial' | 'corrections' | 'privacy' | 'terms' | 'contact';

export default async function PolicyPage({ pageType }: { pageType: PolicyPageType }) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const { data: setting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'branding')
    .single();

  const siteName = setting?.value?.site_name || 'Zen-G News';
  const contactEmail = setting?.value?.contact_email || 'editor@zen-g-news.com';
  const adsEmail = setting?.value?.ads_email || 'partners@zen-g-news.com';

  return (
    <>
      <Header categories={categories || []} />
      <BreakingNewsTicker />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Return to Headlines
        </Link>

        <article className="p-6 sm:p-10 bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm">
          {pageType === 'about' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                About {siteName}
              </h1>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {siteName} is an independent, technology-driven international digital news platform founded on the premise that modern global citizens require high-speed, rigorously verified, and non-partisan geopolitical, economic, and technological reporting.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-4">Our Core Principles</h2>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[var(--text-muted)]">
                <li><strong className="text-[var(--text-primary)]">Zero Partisan Affiliation:</strong> We maintain strict institutional neutrality across sovereign jurisdictions.</li>
                <li><strong className="text-[var(--text-primary)]">Primary Source Verification:</strong> Stories are checked against original documents, open data streams, and corroborated intelligence.</li>
                <li><strong className="text-[var(--text-primary)]">Speed Without Compromise:</strong> Automated syndication handles initial notification while investigative editors provide continuous context.</li>
              </ul>
            </div>
          )}

          {pageType === 'editorial' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                Editorial Policy & Standards
              </h1>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                At {siteName}, our reporting adheres to the highest tenets of international journalism. Every dispatch, analysis, and syndicated wire story is evaluated for accuracy, contextual nuance, and clarity.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-4">Fact-Checking Protocols</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Our desk verifies claims through multiple independent primary sources. Statistical claims regarding economy, health, or science must be backed by peer-reviewed literature or official sovereign datasets.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-4">AI & Automation Disclosure</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                When computational ingestion or automated summarization is employed to syndicate real-time wire dispatches, articles are clearly tagged with their syndicate origin and subjected to human editorial oversight.
              </p>
            </div>
          )}

          {pageType === 'corrections' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                Correction & Retraction Policy
              </h1>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {siteName} is committed to prompt, transparent corrections whenever factual inaccuracies occur.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-4">How Corrections Are Handled</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                If an error is discovered in a published article, the story is updated immediately with an explicit &quot;Correction Note&quot; appended at the top or bottom detailing what was altered and why. We do not stealthily modify factual errors.
              </p>
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                To request a factual review or report a typographical or data discrepancy, please contact our ombudsman at:{' '}
                <a href={`mailto:corrections@${siteName.toLowerCase().replace(/\s+/g, '')}.com`} className="text-rose-600 font-bold underline">corrections@{siteName.toLowerCase().replace(/\s+/g, '')}.com</a>.
              </div>
            </div>
          )}

          {pageType === 'privacy' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                Privacy Policy
              </h1>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                This Privacy Policy explains how {siteName} collects, uses, and safeguards information when you access our digital portal, subscribe to newsletters, or interact with our services.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-2">Information We Collect</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                We collect newsletter email addresses solely to deliver subscribed briefs. We use privacy-centric telemetry to monitor aggregate traffic patterns without personally identifiable profiling.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-2">Cookies</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                We use essential cookies for authentication and theme preferences. Optional analytics cookies (if enabled) help us understand aggregate reader behavior. You may disable cookies in your browser without losing core functionality.
              </p>
            </div>
          )}

          {pageType === 'terms' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                Terms & Conditions
              </h1>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                By accessing {siteName}, you agree to comply with our Terms of Service. Content published on this portal is protected by international copyright laws.
              </p>
              <h2 className="headline-font text-xl font-black uppercase text-[var(--text-primary)] pt-2">Use of Content</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Articles, images, and metadata are provided for personal, non-commercial reading. Syndication requires written permission. Quoting brief excerpts with attribution is permitted under fair-use principles.
              </p>
            </div>
          )}

          {pageType === 'contact' && (
            <div className="space-y-6">
              <h1 className="headline-font text-3xl sm:text-4xl font-black uppercase text-[var(--text-primary)]">
                Contact {siteName}
              </h1>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Our editorial and corporate offices operate globally with continuous desks. Reach us through the channels below.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Newsroom & Tips</span>
                  <a href={`mailto:${contactEmail}`} className="text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />{contactEmail}
                  </a>
                  <p className="text-xs text-[var(--text-muted)] mt-1">PGP encrypted submissions supported.</p>
                </div>
                <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Advertising & Syndication</span>
                  <a href={`mailto:${adsEmail}`} className="text-sm font-semibold text-[var(--accent)] inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />{adsEmail}
                  </a>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Sponsor placements, Adsterra, AdSense inquiry.</p>
                </div>
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  );
}
