import RadialGauge from '../RadialGauge';

export default function RadialGaugeExample() {
  return (
    <div className="flex gap-8 items-center justify-center flex-wrap p-8">
      <RadialGauge value={86} label="Confidence" />
      <RadialGauge value={65} size={180} label="Accuracy" />
      <RadialGauge value={45} size={160} />
    </div>
  );
}
