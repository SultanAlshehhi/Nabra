import PatientCard from '../PatientCard';

export default function PatientCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 max-w-6xl">
      <PatientCard
        name="John Doe"
        age={7}
        lastSession="Oct 15, 2025"
        totalSessions={5}
        latestClassification="Articulation Disorder"
        onViewProfile={() => console.log('View profile clicked')}
      />
      <PatientCard
        name="Sarah Smith"
        age={8}
        lastSession="Oct 14, 2025"
        totalSessions={12}
        latestClassification="Phonological Impairment"
        onViewProfile={() => console.log('View profile clicked')}
      />
      <PatientCard
        name="Mike Johnson"
        age={6}
        lastSession="Oct 13, 2025"
        totalSessions={3}
        onViewProfile={() => console.log('View profile clicked')}
      />
    </div>
  );
}
