/**
 * Green audit inspection flow – reproduces Aspira's official flowchart
 * (aspiracertifications.com/wp-content/uploads/2025/04/Inspection-Flowchart-1.jpg):
 * same three stages, same steps in the same order, same colour key
 * (Aspira off-site · Client · Aspira on-site).
 */
import {
  MessageCircleQuestion, ClipboardList, FileCheck2, ReceiptText, Handshake, Database, UserCheck, Presentation, CalendarRange,
  Users, ScanSearch, FileSearch, MessagesSquare, Lightbulb, DoorClosed,
  FileWarning, Send, Settings2, HandCoins, FileText, Award,
} from 'lucide-react';

const OFF = 'off'; // Aspira off-site
const CLI = 'cli'; // Client
const ON = 'on'; // Aspira on-site

const STAGES = [
  {
    n: '01', title: 'Pre-audit activities', steps: [
      [MessageCircleQuestion, 'Enquiry from client', CLI],
      [ClipboardList, 'Application process', CLI],
      [FileCheck2, 'Application review and acceptance by Aspira', OFF],
      [ReceiptText, 'Quote from Aspira', OFF],
      [Handshake, 'Agreement process', CLI],
      [Database, 'Preliminary data collection', CLI],
      [UserCheck, 'Assigning inspectors for green audit', OFF],
      [Presentation, 'Awareness session for client', OFF],
      [CalendarRange, 'Sharing audit plan with client', OFF],
    ],
  },
  {
    n: '02', title: 'On-site audit activities', steps: [
      [Users, 'Opening meeting', ON],
      [ScanSearch, 'Observations & interviews', ON],
      [FileSearch, 'Document & record verification', ON],
      [MessagesSquare, 'Discussion on findings', ON],
      [Lightbulb, 'Discussion on areas of improvements', ON],
      [DoorClosed, 'Closing meeting', ON],
    ],
  },
  {
    n: '03', title: 'Post-audit activities', steps: [
      [FileWarning, 'Preparation of non-conformity & audit report', OFF],
      [Send, 'Submission of reports to client', OFF],
      [Settings2, 'Action on non-conformity report', CLI],
      [HandCoins, 'Release of payment', CLI],
      [FileText, 'Submission of final report', OFF],
      [Award, 'Issue of Green Audit Certificate', OFF],
    ],
  },
];

const KEY = [[OFF, 'Aspira off-site'], [CLI, 'Client'], [ON, 'Aspira on-site']];

export default function GreenAuditFlow() {
  let k = 0;
  return (
    <div className="gaf">
      <div className="gaf__stages">
        {STAGES.map((st, si) => (
          <section key={st.n} className={`gaf__stage gaf__stage--${si + 1}`} aria-labelledby={`gaf-${st.n}`}>
            <h3 className="gaf__head" id={`gaf-${st.n}`}>
              <span className="gaf__num">{st.n}</span>
              {st.title}
            </h3>
            <ol className="gaf__steps">
              {st.steps.map(([I, label, who]) => {
                k += 1;
                return (
                  <li key={label} className={`gaf__step gaf__step--${who}`} style={{ '--d': `${k * 40}ms` }}>
                    <span className="gaf__ic"><I size={18} strokeWidth={1.8} /></span>
                    <span className="gaf__label">{label}</span>
                    <span className="sr-only"> ({KEY.find(([c]) => c === who)[1]})</span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
      <ul className="gaf__key" aria-label="Colour key">
        {KEY.map(([c, label]) => <li key={c} className={`gaf__key-${c}`}><i aria-hidden="true" />{label}</li>)}
      </ul>
    </div>
  );
}
