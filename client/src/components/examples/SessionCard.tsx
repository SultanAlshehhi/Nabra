import SessionCard from '../SessionCard';

export default function SessionCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 max-w-6xl">
      <SessionCard
        sessionId="S001"
        date="Oct 15, 2025"
        classification="Articulation Disorder"
        confidence={86}
        onViewDetails={() => console.log('View details clicked')}
      />
      <SessionCard
        sessionId="S002"
        date="Oct 14, 2025"
        classification="Phonological Impairment"
        confidence={72}
        onViewDetails={() => console.log('View details clicked')}
      />
      <SessionCard
        sessionId="S003"
        date="Oct 13, 2025"
        classification="Vowel Disorder"
        confidence={91}
        onViewDetails={() => console.log('View details clicked')}
      />
    </div>
  );
}
