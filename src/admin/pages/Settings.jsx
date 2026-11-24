import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../lib/api';
import { ICON_NAMES } from '../../lib/icons';
import { useSite } from '../../context/SiteContext';
import { Loader } from '../../components/ui';
import { Text, Area, StringList, ObjectList, ImageField, Callout, useToast } from '../fields';

const TABS = ['Company & hero', 'About', 'Homepage sections', 'Contact', 'Social', 'SEO'];
const td = [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'area' }];

export default function SettingsPage() {
  const toast = useToast();
  const { reload } = useSite();
  const [s, setS] = useState(null);
  const [tab, setTab] = useState(TABS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/settings').then((d) => setS({ contact: {}, social: {}, seo: {}, ...d })).catch((e) => toast(e.message, 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!s) return <Loader />;

  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
  const setIn = (grp, k) => (v) => setS((x) => ({ ...x, [grp]: { ...(x[grp] || {}), [k]: v } }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/settings', { method: 'PUT', body: s, auth: true });
      toast('Settings saved');
      reload();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  const c = s.contact || {};
  return (
    <form onSubmit={save} style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="tabs" role="tablist" style={{ border: 0 }}>
          {TABS.map((t) => <button type="button" role="tab" key={t} aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <button className="btn btn--green btn--sm" disabled={saving}><Save size={15} /> {saving ? 'Saving…' : 'Save settings'}</button>
      </div>
      <div className="card">
        {tab === 'Company & hero' && (
          <div className="fgrid">
            <Text label="Company name" value={s.companyName} onChange={set('companyName')} />
            <Text label="Legal name" value={s.legalName} onChange={set('legalName')} />
            <Text full label="Tagline" value={s.tagline} onChange={set('tagline')} />
            <Text full label="Hero headline" value={s.heroTitle} onChange={set('heroTitle')} />
            <Area label="Hero sub-text" rows={3} value={s.heroSubtitle} onChange={set('heroSubtitle')} />
            <ImageField label="Hero image (optional)" hint="Background photo behind the homepage hero (landscape, at least 1600 px wide)." value={s.heroImage} onChange={set('heroImage')} />
            <Text full label="Hero background video (optional)" hint="MP4 link, e.g. /media/hero.mp4 (place the file in Frontend/public/media) or a full https:// URL. Leave empty for the built-in clip. The hero image is shown while it loads." value={s.heroVideo} onChange={set('heroVideo')} />
            <ImageField label="About image" hint="Used in the homepage 'Our approach' section and About page header" value={s.aboutImage} onChange={set('aboutImage')} />
            {[['services', 'Services page'], ['industries', 'Industries page'], ['contact', 'Contact page'], ['blog', 'Blog page'], ['caseStudies', 'Case studies page'], ['complaints', 'Complaints & appeals page']].map(([k, label]) => (
              <ImageField key={k} label={`${label} header photo`} hint="Optional – leave empty to keep the built-in photo." value={s.pageImages?.[k] || ''} onChange={(v) => setS((o) => ({ ...o, pageImages: { ...(o.pageImages || {}), [k]: v } }))} />
            ))}
            <Text full label="Footer text" value={s.footerText} onChange={set('footerText')} />
          </div>
        )}
        {tab === 'About' && (
          <div className="fgrid">
            <Area label="Short introduction (homepage, footer)" rows={3} value={s.aboutShort} onChange={set('aboutShort')} />
            <Area label="Full about text (About page)" hint="Separate paragraphs with a blank line" rows={7} value={s.aboutLong} onChange={set('aboutLong')} />
            <Area label="Vision" rows={2} value={s.vision} onChange={set('vision')} />
            <Area label="Mission" rows={2} value={s.mission} onChange={set('mission')} />
            <ObjectList label="Values" value={s.values} onChange={set('values')} fields={td} addLabel="Add value" />
          </div>
        )}
        {tab === 'Homepage sections' && (
          <div className="fgrid">
            <ObjectList label="Pillars (People · Processes · Planet)" value={s.pillars} onChange={set('pillars')} fields={td} addLabel="Add pillar" />
            <ObjectList label="Why choose Aspira" value={s.differentiators} onChange={set('differentiators')} fields={td} addLabel="Add point" />
            <ObjectList label="Industries we serve" value={s.industries} onChange={set('industries')} addLabel="Add industry" fields={[{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }, { key: 'icon', label: 'Icon', type: 'select', options: ICON_NAMES }]} />
            <ObjectList label="How it works (process steps)" value={s.process} onChange={set('process')} fields={td} addLabel="Add step" />
            <Callout>Statistics: add only real, verifiable figures (e.g. number of audits completed). The stats strip is hidden while this list is empty.</Callout>
            <ObjectList label="Statistics" value={s.stats} onChange={set('stats')} addLabel="Add statistic" fields={[{ key: 'value', label: 'Value (e.g. 250+)' }, { key: 'label', label: 'Label (e.g. Audits completed)' }]} />
          </div>
        )}
        {tab === 'Contact' && (
          <div className="fgrid">
            <Area label="Office address" rows={3} value={c.address} onChange={setIn('contact', 'address')} />
            <StringList label="Phone numbers" value={c.phones} onChange={setIn('contact', 'phones')} placeholder="Add phone" />
            <StringList label="Email addresses" value={c.emails} onChange={setIn('contact', 'emails')} placeholder="Add email" />
            <Text label="WhatsApp number" hint="Digits with country code, no + (e.g. 919626776868). Leave empty to hide the button." value={c.whatsapp} onChange={setIn('contact', 'whatsapp')} />
            <Text label="Office hours" value={c.hours} onChange={setIn('contact', 'hours')} />
            <Text full label="Google Maps embed URL" hint="Google Maps › Share › Embed a map › copy only the src=&quot;…&quot; URL" value={c.mapEmbedUrl} onChange={setIn('contact', 'mapEmbedUrl')} />
            <Text label="Complaints email" value={c.complaintsEmail} onChange={setIn('contact', 'complaintsEmail')} />
            <Text label="Complaints CC email" value={c.complaintsCcEmail} onChange={setIn('contact', 'complaintsCcEmail')} />
          </div>
        )}
        {tab === 'Social' && (
          <div className="fgrid">
            {['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'].map((k) => (
              <Text key={k} label={k[0].toUpperCase() + k.slice(1)} value={s.social?.[k]} onChange={setIn('social', k)} placeholder="https://…" />
            ))}
          </div>
        )}
        {tab === 'SEO' && (
          <div className="fgrid">
            <Text full label="Default page title (homepage)" value={s.seo?.defaultTitle} onChange={setIn('seo', 'defaultTitle')} />
            <Text full label="Title template" hint="%s is replaced with the page title" value={s.seo?.titleTemplate} onChange={setIn('seo', 'titleTemplate')} />
            <Area label="Default meta description" rows={3} value={s.seo?.defaultDescription} onChange={setIn('seo', 'defaultDescription')} />
            <ImageField label="Default social share image (1200×630)" value={s.seo?.ogImage} onChange={setIn('seo', 'ogImage')} />
          </div>
        )}
      </div>
    </form>
  );
}
