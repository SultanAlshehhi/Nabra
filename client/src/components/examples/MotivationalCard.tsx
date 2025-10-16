import MotivationalCard from '../MotivationalCard';

export default function MotivationalCardExample() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 p-8">
      <MotivationalCard
        message="Great job on completing today's session! Your pronunciation is getting better with each practice."
        icon="trophy"
      />
      <MotivationalCard
        message="Keep up the excellent work! Remember, practice makes perfect, and you're doing wonderfully."
        icon="star"
      />
      <MotivationalCard
        message="You're making amazing progress! We're so proud of your dedication."
        icon="heart"
      />
    </div>
  );
}
