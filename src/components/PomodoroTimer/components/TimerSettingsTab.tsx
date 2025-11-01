import React, { useEffect, useMemo, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimerIcon from '@mui/icons-material/Timer';
import { TimerSettings } from '../types';

interface TimerSettingsTabProps {
  isRunning: boolean;
  settings: TimerSettings | undefined;
  onUpdate: (settings: Partial<TimerSettings>) => void;
}

export const TimerSettingsTab: React.FC<TimerSettingsTabProps> = ({ isRunning, settings, onUpdate }) => {
  const initial = useMemo(() => ({
    pomodoro: settings?.pomodoro ?? 25,
    shortBreak: settings?.shortBreak ?? 5,
    longBreak: settings?.longBreak ?? 15,
  }), [settings]);

  const [local, setLocal] = useState(initial);
  const [errors, setErrors] = useState<{[K in keyof TimerSettings]?: string}>({});

  // Keep inputs in sync when settings load or change
  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  const validate = (key: keyof TimerSettings, value: string) => {
    const n = Number(value);
    if (!/^[0-9]+$/.test(value) || !Number.isFinite(n) || n <= 0) {
      setErrors(prev => ({ ...prev, [key]: 'Enter a positive integer' }));
      return null;
    }
    setErrors(prev => ({ ...prev, [key]: undefined }));
    return n;
  };

  const handleChange = (key: keyof TimerSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valid = validate(key, value);
    if (valid != null) {
      setLocal(prev => ({ ...prev, [key]: valid }));
      onUpdate({ [key]: valid } as Partial<TimerSettings>);
    }
  };

  const InputRow: React.FC<{label: string; keyName: keyof TimerSettings; value: number;}> = ({ label, keyName, value }) => (
    <div className="input-row">
      <div className="label">
        <TimerIcon sx={{ fontSize: 18, marginRight: 1, color: '#5c6bc0' }} />
        <span>{label}</span>
      </div>
      <div className="control">
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          step={1}
          value={value}
          onChange={handleChange(keyName)}
          disabled={isRunning}
          className={`number-input ${errors[keyName] ? 'invalid' : ''}`}
          aria-invalid={!!errors[keyName]}
          aria-describedby={`${keyName}-error`}
        />
        <span className="suffix">min</span>
      </div>
      {errors[keyName] && (
        <div id={`${keyName}-error`} className="error-text">{errors[keyName]}</div>
      )}
    </div>
  );

  return (
    <div className="timer-settings-tab">
      <div className="tab-header">
        <h3 className="tab-heading">Timer Settings</h3>
        <p className="tab-description">Adjust durations for each cycle</p>
      </div>

      {isRunning && (
        <div className="info-banner">
          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
          <span>You have a running session, please stop it to adjust the timer values.</span>
        </div>
      )}

      <div className="inputs">
        <InputRow label="Pomodoro" keyName="pomodoro" value={local.pomodoro} />
        <InputRow label="Short Break" keyName="shortBreak" value={local.shortBreak} />
        <InputRow label="Long Break" keyName="longBreak" value={local.longBreak} />
      </div>

      <style>{`
        .timer-settings-tab { display: flex; flex-direction: column; gap: 1rem; }
        .tab-header { text-align: center; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .tab-heading { margin: 0 0 0.25rem 0; color: #333; font-size: 1.3rem; font-weight: 600; }
        .tab-description { margin: 0; color: #666; font-size: 0.9rem; }
        .info-banner { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 8px; background: #fff3cd; color: #664d03; border: 1px solid #ffecb5; }
        .inputs { display: flex; flex-direction: column; gap: 1rem; }
        .input-row { display: flex; flex-direction: column; gap: 0.35rem; }
        .label { display: flex; align-items: center; gap: 0.35rem; color: #333; font-weight: 600; }
        .control { display: flex; align-items: center; gap: 0.5rem; }
        .number-input { width: 120px; padding: 0.6rem 0.75rem; border: 2px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 0.95rem; }
        .number-input:focus { outline: none; border-color: #5c6bc0; }
        .number-input[disabled] { background: #f5f5f5; color: #999; cursor: not-allowed; }
        .suffix { color: #666; font-size: 0.9rem; }
        .error-text { color: #b00020; font-size: 0.8rem; }
        .invalid { border-color: #b00020; }
      `}</style>
    </div>
  );
};
