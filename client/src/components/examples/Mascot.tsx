import Mascot from '../Mascot';

export default function MascotExample() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <Mascot size="large" message="Let's practice your speech together!" />
      <Mascot size="medium" message="Great job! Keep going!" />
      <Mascot size="small" />
    </div>
  );
}
