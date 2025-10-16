import SentenceCard from '../SentenceCard';
import sentence1 from '@assets/generated_images/Boy_drinking_cola_illustration_088a92ea.png';

export default function SentenceCardExample() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <SentenceCard
        sentence="Kenny drank a tiny tin of coke"
        image={sentence1}
        imageAlt="Boy drinking cola"
      />
    </div>
  );
}
