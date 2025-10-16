import { useState } from 'react';
import RecordButton from '../RecordButton';

export default function RecordButtonExample() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="flex gap-8 items-center justify-center p-8">
      <RecordButton
        isRecording={isRecording}
        onToggle={() => {
          setIsRecording(!isRecording);
          console.log('Recording toggled:', !isRecording);
        }}
      />
      <RecordButton isRecording={false} onToggle={() => {}} />
      <RecordButton isRecording={true} onToggle={() => {}} />
      <RecordButton isRecording={false} onToggle={() => {}} disabled />
    </div>
  );
}
