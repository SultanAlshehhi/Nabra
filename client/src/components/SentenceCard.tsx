import { Card, CardContent } from '@/components/ui/card';

interface SentenceCardProps {
  sentence: string;
  image: string;
  imageAlt: string;
}

export default function SentenceCard({ sentence, image, imageAlt }: SentenceCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img src={image} alt={imageAlt} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-8">
        <p className="text-2xl font-medium text-foreground text-center leading-relaxed">
          {sentence}
        </p>
      </CardContent>
    </Card>
  );
}
