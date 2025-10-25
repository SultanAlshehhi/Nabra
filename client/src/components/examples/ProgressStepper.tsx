import ProgressStepper from '../ProgressStepper';

export default function ProgressStepperExample() {
  return (
    <div className="flex flex-col gap-12 p-8">
      <ProgressStepper currentStep={3} totalSteps={5} labels={['Sentence 1', 'Sentence 2', 'Sentence 3', 'Sentence 4', 'Sentence 5']} />
      <ProgressStepper currentStep={1} totalSteps={5} />
      <ProgressStepper currentStep={5} totalSteps={5} />
    </div>
  );
}
